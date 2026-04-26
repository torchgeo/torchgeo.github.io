"""Fetch papers citing the TorchGeo paper from Semantic Scholar and OpenAlex,
deduplicate, and write a merged JSON file sorted by citation count.

Usage:
    S2_API_KEY=... python3 scripts/fetch_citations.py [--out path]

Sources:
    - Semantic Scholar Graph API   (requires S2_API_KEY env var)
    - OpenAlex API                 (no key; uses polite-pool mailto)

Dedup key precedence:  DOI -> arXiv id -> normalized title.
Citation counts: max(OpenAlex, Semantic Scholar) per paper.
"""

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

ARXIV_ID = "2111.08872"
S2_PAPER_ID_HINT = f"ARXIV:{ARXIV_ID}"

OPENALEX_TORCHGEO_IDS = [
    "W3214036562",  # 2024 ACM TSAS journal version
    "W4226232048",  # arXiv preprint
    "W4309651987",  # SIGSPATIAL 2022
]
SELF_DOIS = {
    "https://doi.org/10.1145/3557915.3560953",
    "https://doi.org/10.1145/3707459",
    "https://doi.org/10.48550/arxiv.2111.08872",
}
MAILTO = "isaac.corley@taylorgeospatial.org"

S2_FIELDS = [
    "paperId", "corpusId", "externalIds", "title", "abstract",
    "venue", "publicationVenue", "year", "publicationDate",
    "publicationTypes", "authors", "citationCount", "referenceCount",
    "influentialCitationCount", "fieldsOfStudy", "s2FieldsOfStudy",
    "openAccessPdf", "url", "isOpenAccess",
]


def _http_get_json(url: str, headers: dict[str, str]) -> dict:
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503, 504):
                time.sleep(2 ** attempt)
                continue
            raise
    raise RuntimeError(f"exhausted retries: {url}")


# Semantic Scholar

def fetch_s2_citers(api_key: str) -> list[dict]:
    headers = {"x-api-key": api_key}
    fields = ",".join(f"citingPaper.{f}" for f in S2_FIELDS)
    out: list[dict] = []
    offset = 0
    while True:
        qs = urllib.parse.urlencode({"fields": fields, "offset": offset, "limit": 100})
        url = f"https://api.semanticscholar.org/graph/v1/paper/{S2_PAPER_ID_HINT}/citations?{qs}"
        data = _http_get_json(url, headers)
        for entry in data.get("data", []):
            cp = entry.get("citingPaper")
            if cp:
                out.append(cp)
        if "next" in data:
            offset = data["next"]
            time.sleep(0.5)
        else:
            break
    return out


# OpenAlex

def fetch_openalex_citers(target_id: str) -> list[dict]:
    out: list[dict] = []
    cursor = "*"
    while cursor:
        qs = urllib.parse.urlencode({
            "filter": f"cites:{target_id}",
            "per_page": 200,
            "cursor": cursor,
            "mailto": MAILTO,
        })
        data = _http_get_json(
            f"https://api.openalex.org/works?{qs}",
            {"User-Agent": f"mailto:{MAILTO}"},
        )
        out.extend(data.get("results", []))
        cursor = data.get("meta", {}).get("next_cursor")
        time.sleep(0.2)
    return out


# Normalization

def _reconstruct_abstract(inv: dict | None) -> str | None:
    if not inv:
        return None
    pos: list[tuple[int, str]] = []
    for word, idxs in inv.items():
        for i in idxs:
            pos.append((i, word))
    pos.sort()
    return " ".join(w for _, w in pos)


def _arxiv_from_oa(work: dict) -> str | None:
    for loc in [work.get("primary_location") or {}, *(work.get("locations") or [])]:
        src = (loc.get("source") or {})
        if src.get("display_name") == "arXiv (Cornell University)":
            landing = loc.get("landing_page_url") or ""
            if "/abs/" in landing:
                return landing.split("/abs/")[-1].rstrip("/")
    doi = (work.get("doi") or "").lower()
    if "10.48550/arxiv." in doi:
        return doi.split("10.48550/arxiv.")[-1]
    return None


def normalize_openalex(work: dict) -> dict:
    primary = work.get("primary_location") or {}
    source = (primary.get("source") or {})
    open_access = work.get("open_access") or {}
    return {
        "openalexId": work.get("id"),
        "doi": work.get("doi"),
        "arxivId": _arxiv_from_oa(work),
        "title": work.get("title"),
        "abstract": _reconstruct_abstract(work.get("abstract_inverted_index")),
        "year": work.get("publication_year"),
        "publicationDate": work.get("publication_date"),
        "type": work.get("type"),
        "venue": source.get("display_name"),
        "venueType": source.get("type"),
        "isOpenAccess": open_access.get("is_oa"),
        "openAccessPdfUrl": open_access.get("oa_url"),
        "citedByCount": work.get("cited_by_count"),
        "fieldsOfStudy": [
            c.get("display_name")
            for c in (work.get("concepts") or [])
            if c.get("level", 99) <= 1
        ][:5],
        "authors": [
            {
                "name": (a.get("author") or {}).get("display_name"),
                "openalexId": (a.get("author") or {}).get("id"),
                "orcid": (a.get("author") or {}).get("orcid"),
                "affiliation": (a.get("raw_affiliation_strings") or [None])[0],
            }
            for a in (work.get("authorships") or [])
        ],
        "url": work.get("id"),
    }


def normalize_s2(p: dict) -> dict:
    ext = p.get("externalIds") or {}
    pdf = (p.get("openAccessPdf") or {}).get("url") if p.get("openAccessPdf") else None
    return {
        "openalexId": None,
        "doi": ("https://doi.org/" + ext["DOI"]) if ext.get("DOI") else None,
        "arxivId": ext.get("ArXiv"),
        "title": p.get("title"),
        "abstract": p.get("abstract"),
        "year": p.get("year"),
        "publicationDate": p.get("publicationDate"),
        "type": (p.get("publicationTypes") or [None])[0] if p.get("publicationTypes") else None,
        "venue": p.get("venue"),
        "venueType": None,
        "isOpenAccess": p.get("isOpenAccess"),
        "openAccessPdfUrl": pdf,
        "citedByCount": p.get("citationCount"),
        "fieldsOfStudy": p.get("fieldsOfStudy"),
        "authors": [
            {
                "name": a.get("name"),
                "openalexId": None,
                "orcid": None,
                "affiliation": None,
                "s2AuthorId": a.get("authorId"),
            }
            for a in (p.get("authors") or [])
        ],
        "url": p.get("url"),
        "s2PaperId": p.get("paperId"),
    }


# Dedup + merge

def dedupe_key(rec: dict) -> str:
    if rec.get("doi"):
        return "doi:" + rec["doi"].lower().removeprefix("https://doi.org/")
    if rec.get("arxivId"):
        return "arxiv:" + rec["arxivId"].lower()
    title = (rec.get("title") or "").lower().strip()
    return "title:" + " ".join(title.split())


def is_self_citation(rec: dict) -> bool:
    if (rec.get("doi") or "").lower() in {d.lower() for d in SELF_DOIS}:
        return True
    if (rec.get("arxivId") or "").lower() == ARXIV_ID:
        return True
    if rec.get("openalexId") in {f"https://openalex.org/{i}" for i in OPENALEX_TORCHGEO_IDS}:
        return True
    return False


def merge(oa_records: list[dict], s2_records: list[dict]) -> list[dict]:
    by_key: dict[str, dict] = {}
    sources: dict[str, set[str]] = {}
    counts: dict[str, dict[str, int | None]] = {}

    for rec in oa_records:
        if is_self_citation(rec):
            continue
        k = dedupe_key(rec)
        by_key[k] = rec
        sources.setdefault(k, set()).add("openalex")
        counts.setdefault(k, {"openalex": None, "semanticscholar": None})
        counts[k]["openalex"] = rec.get("citedByCount")

    for rec in s2_records:
        if is_self_citation(rec):
            continue
        k = dedupe_key(rec)
        if k in by_key:
            by_key[k]["s2PaperId"] = rec.get("s2PaperId")
        else:
            by_key[k] = rec
        sources.setdefault(k, set()).add("semanticscholar")
        counts.setdefault(k, {"openalex": None, "semanticscholar": None})
        counts[k]["semanticscholar"] = rec.get("citedByCount")

    merged = []
    for k, rec in by_key.items():
        rec["sources"] = sorted(sources[k])
        rec["_counts"] = counts[k]
        rec["citedByCount"] = max(
            counts[k]["openalex"] or 0,
            counts[k]["semanticscholar"] or 0,
        )
        merged.append(rec)

    merged.sort(
        key=lambda p: (p.get("citedByCount") or 0, p.get("year") or 0),
        reverse=True,
    )
    return merged


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        default="public/data/torchgeo_citations.json",
        help="Output JSON path (default: public/data/torchgeo_citations.json)",
    )
    args = parser.parse_args()

    api_key = os.environ.get("S2_API_KEY")
    if not api_key:
        print("ERROR: S2_API_KEY env var not set", file=sys.stderr)
        return 2

    print("Fetching Semantic Scholar citers...")
    s2_raw = fetch_s2_citers(api_key)
    print(f"  S2: {len(s2_raw)}")

    oa_raw: list[dict] = []
    seen: set[str] = set()
    for tid in OPENALEX_TORCHGEO_IDS:
        print(f"Fetching OpenAlex citers of {tid}...")
        for w in fetch_openalex_citers(tid):
            wid = w.get("id")
            if wid in seen:
                continue
            seen.add(wid)
            oa_raw.append(w)
    print(f"  OpenAlex: {len(oa_raw)}")

    oa_records = [normalize_openalex(w) for w in oa_raw]
    s2_records = [normalize_s2(p) for p in s2_raw]
    merged = merge(oa_records, s2_records)

    breakdown = {
        "openalex": len(oa_records),
        "semanticscholar": len(s2_records),
        "merged_unique": len(merged),
        "in_both": sum(1 for r in merged if len(r["sources"]) == 2),
        "openalex_only": sum(1 for r in merged if r["sources"] == ["openalex"]),
        "s2_only": sum(1 for r in merged if r["sources"] == ["semanticscholar"]),
    }

    output = {
        "source_paper": {
            "title": "TorchGeo: deep learning with geospatial data",
            "arxivId": ARXIV_ID,
            "openalexIds": OPENALEX_TORCHGEO_IDS,
        },
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "counts": breakdown,
        "papers": merged,
    }

    out_path = args.out
    os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nWrote {len(merged)} unique citers to {out_path}")
    print(f"Breakdown: {breakdown}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
