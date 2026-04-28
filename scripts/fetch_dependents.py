"""Scrape projects depending on TorchGeo from GitHub's dependency graph and
write a curated JSON to public/data/torchgeo_dependents.json.

Usage:
    python3 scripts/fetch_dependents.py [--out path]

Pipeline:
    1. Walk /microsoft/torchgeo/network/dependents (HTML, paginated by cursor).
    2. For every repo, hit the GitHub REST API (`gh api repos/<owner>/<name>`)
       to get fork status, stargazers, archived flag, and description.
    3. Drop forks, drop archived, drop the LLM-serving cluster (vllm /
       aphrodite-engine) — those pull torchgeo only transitively via terratorch
       and aren't part of the geospatial story.
    4. Sort by stars and emit a JSON manifest.

Requires: `gh` CLI authed, plus `curl`. No third-party Python deps.
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

DEPENDENTS_URL = (
    "https://github.com/microsoft/torchgeo/network/dependents"
    "?dependent_type=REPOSITORY"
)
OUT_DEFAULT = (
    Path(__file__).resolve().parent.parent
    / "public"
    / "data"
    / "torchgeo_dependents.json"
)


def curl(url: str) -> str:
    proc = subprocess.run(
        ["curl", "-sL", url], check=True, capture_output=True, text=True
    )
    return proc.stdout


def scrape_dependents() -> list[str]:
    seen: set[str] = set()
    repos: list[str] = []
    url: str | None = DEPENDENTS_URL
    page = 0
    while url and page < 200:
        page += 1
        html = curl(url)
        rows = re.findall(
            r'data-test-id="dg-repo-pkg-dependent">(.*?)</div>\s*</div>',
            html,
            re.S,
        )
        if not rows:
            break
        new = 0
        for r in rows:
            links = re.findall(r'<a[^>]*href="(/[^"]+)"[^>]*>([^<]+)</a>', r)
            if len(links) < 2:
                continue
            full = f"{links[0][1].strip()}/{links[1][1].strip()}"
            if full in seen:
                continue
            seen.add(full)
            repos.append(full)
            new += 1
        print(f"page {page}: +{new} (total {len(repos)})", file=sys.stderr)
        nxt = re.search(
            r'<a[^>]*href="([^"]*dependents_after=[^"]+)"[^>]*>\s*Next', html
        )
        if not nxt or new == 0:
            break
        url = "https://github.com" + nxt.group(1).replace("&amp;", "&")
        time.sleep(0.4)
    return repos


def fetch_meta(repo: str) -> dict | None:
    proc = subprocess.run(
        [
            "gh",
            "api",
            f"repos/{repo}",
            "--jq",
            (
                "{full_name, fork, parent: (.parent.full_name // \"\"), "
                "stars: .stargazers_count, archived, "
                "description: (.description // \"\")}"
            ),
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        return None
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None


def is_llm_serving(meta: dict) -> bool:
    name = meta["full_name"].lower()
    desc = (meta.get("description") or "").lower()
    if "vllm" in name or "aphrodite" in name:
        return True
    if "llm inference" in desc or "llm serving" in desc:
        return True
    return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=OUT_DEFAULT)
    ap.add_argument("--workers", type=int, default=12)
    args = ap.parse_args()

    if not shutil.which("gh"):
        print("error: gh CLI not on PATH", file=sys.stderr)
        return 2

    repos = scrape_dependents()
    print(f"\nfetching metadata for {len(repos)} repos...", file=sys.stderr)

    metas: list[dict] = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(fetch_meta, r): r for r in repos}
        for fut in as_completed(futures):
            m = fut.result()
            if m:
                metas.append(m)

    keep = [
        m
        for m in metas
        if not m["fork"] and not m["archived"] and not is_llm_serving(m)
    ]
    keep.sort(key=lambda m: -m["stars"])

    payload = {
        "generated_at": date.today().isoformat(),
        "source": DEPENDENTS_URL,
        "total_projects": len(keep),
        "total_orgs": len({m["full_name"].split("/")[0] for m in keep}),
        "filters": (
            "non-fork, non-archived, geospatial-only "
            "(LLM-serving transitive deps via terratorch excluded)"
        ),
        "projects": [
            {
                "repo": m["full_name"],
                "url": f"https://github.com/{m['full_name']}",
                "stars": m["stars"],
                "description": (m.get("description") or "").strip()[:200],
            }
            for m in keep
        ],
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2) + "\n")
    print(
        f"wrote {len(keep)} projects across "
        f"{payload['total_orgs']} orgs -> {args.out}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
