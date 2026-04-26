"""Fetch papers citing the TorchGeo paper from Semantic Scholar and OpenAlex,
deduplicate, and write a merged JSON file sorted by citation count.

Usage:
    S2_API_TOKEN=... python3 scripts/fetch_citations.py [--out path]

Sources:
    - Semantic Scholar Graph API   (requires S2_API_TOKEN env var; S2_API_KEY also accepted)
    - OpenAlex API                 (no key; uses polite-pool mailto)

Dedup key precedence:  DOI -> arXiv id -> normalized title.
Citation counts: max(OpenAlex, Semantic Scholar) per paper.
Author affiliations: requested inline from S2 (authors.affiliations); merged
records also pull affiliations from OpenAlex authorships (raw + institutions).
"""

import argparse
import gzip
import io
import json
import os
import re
import sys
import tarfile
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
    "publicationTypes", "authors",
    "citationCount", "referenceCount",
    "influentialCitationCount", "fieldsOfStudy", "s2FieldsOfStudy",
    "openAccessPdf", "url", "isOpenAccess",
]

# Author batch endpoint cap (S2 docs).
S2_AUTHOR_BATCH_SIZE = 1000


def _http_request_json(
    url: str,
    headers: dict[str, str],
    *,
    method: str = "GET",
    body: dict | None = None,
) -> dict:
    data = None
    hdrs = dict(headers)
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        hdrs.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, headers=hdrs, data=data, method=method)
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


def _http_get_json(url: str, headers: dict[str, str]) -> dict:
    return _http_request_json(url, headers)


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


def fetch_s2_author_affiliations(
    author_ids: list[str], api_key: str
) -> dict[str, list[str]]:
    """POST to /author/batch to retrieve affiliations for the given author IDs."""
    if not author_ids:
        return {}
    headers = {"x-api-key": api_key}
    result: dict[str, list[str]] = {}
    for i in range(0, len(author_ids), S2_AUTHOR_BATCH_SIZE):
        chunk = author_ids[i : i + S2_AUTHOR_BATCH_SIZE]
        url = (
            "https://api.semanticscholar.org/graph/v1/author/batch"
            "?fields=affiliations,name"
        )
        data = _http_request_json(
            url, headers, method="POST", body={"ids": chunk}
        )
        # data is a list aligned with input ids; missing authors come back as null.
        if isinstance(data, list):
            for aid, rec in zip(chunk, data):
                if rec and rec.get("affiliations"):
                    result[aid] = list(rec["affiliations"])
        time.sleep(0.5)
    return result


# CrossRef

def _cr_name_key(given: str | None, family: str | None) -> str:
    """'Alexandre', 'Lacoste' → 'lacoste a'."""
    f = (family or "").lower().strip()
    g = (given or "").lower().strip()
    return f"{f} {g[0]}".strip() if g else f


def _our_name_key(name: str) -> str:
    """'Adam J. Stewart' → 'stewart a', 'H. Kerner' → 'kerner h'."""
    parts = name.strip().lower().split()
    if not parts:
        return ""
    family = parts[-1]
    given_initial = parts[0][0] if len(parts) > 1 else ""
    return f"{family} {given_initial}".strip()


def fetch_crossref_affiliations(dois: list[str]) -> dict[str, dict[str, list[str]]]:
    """Returns {bare_doi: {author_name_key: [affiliation_names]}}."""
    out: dict[str, dict[str, list[str]]] = {}
    headers = {"User-Agent": f"TorchGeoCitations/1.0 (mailto:{MAILTO})"}
    for doi in dois:
        bare = doi.lower().removeprefix("https://doi.org/")
        url = (
            f"https://api.crossref.org/works/{urllib.parse.quote(bare, safe='')}"
            f"?mailto={MAILTO}"
        )
        try:
            data = _http_get_json(url, headers)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                time.sleep(0.1)
                continue
            raise
        per_author: dict[str, list[str]] = {}
        for a in (data.get("message") or {}).get("author") or []:
            key = _cr_name_key(a.get("given"), a.get("family"))
            affs = [
                x["name"] for x in (a.get("affiliation") or []) if x.get("name")
            ]
            if key and affs:
                per_author[key] = affs
        if per_author:
            out[bare] = per_author
        time.sleep(0.1)
    return out


def apply_crossref(
    merged: list[dict], cr_map: dict[str, dict[str, list[str]]]
) -> int:
    """Backfill per-author affiliations from CrossRef. Returns fill count."""
    filled = 0
    for rec in merged:
        bare = (rec.get("doi") or "").lower().removeprefix("https://doi.org/")
        if not bare or bare not in cr_map:
            continue
        per_author = cr_map[bare]
        for au in rec.get("authors") or []:
            if au.get("affiliations"):
                continue
            key = _our_name_key(au.get("name") or "")
            affs = per_author.get(key)
            if not affs:
                # family-only fallback: match iff unique
                fam = key.split()[0] if " " in key else key
                candidates = {k: v for k, v in per_author.items() if k.split()[0] == fam}
                if len(candidates) == 1:
                    affs = next(iter(candidates.values()))
            if affs:
                au["affiliations"] = sorted(set(affs))
                if not au.get("affiliation"):
                    au["affiliation"] = affs[0]
                filled += 1
    return filled


# arXiv LaTeX source

_INSTITUTION_RE = re.compile(
    r"\b(university|universit[äöü]t|université|universidad|università|"
    r"institute|institution|laboratory|laboratoire|department|departamento|"
    r"research|center|centre|school|college|corporation|inc\b|llc\b|gmbh|"
    r"foundation|agency|hospital|clinic|academy|faculty|groupe|group)\b",
    re.IGNORECASE,
)


def _brace_content(text: str, pos: int) -> str:
    """Extract balanced-brace content starting just after the opening '{' at pos."""
    depth = 1
    i = pos
    while i < len(text) and depth > 0:
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
        i += 1
    return text[pos : i - 1]


def _clean_latex(s: str) -> str:
    for _ in range(3):
        s = re.sub(
            r"\\(?:textrm|textit|textbf|textsc|textsf|texttt|emph|"
            r"small|footnotesize|normalsize|large|Large|rm|it|bf|sf|tt)"
            r"\s*\{([^}]*)\}",
            r"\1",
            s,
        )
    s = re.sub(r"\\(?:email|url|href|orcid|corref|fnref|vspace|hspace|footnote|thanks)\s*\{[^}]*\}", "", s)
    s = re.sub(r"\$\^[{]?[^}$]*[}]?\$", "", s)
    s = re.sub(r"\^[{]?[0-9,*†‡]+[}]?", "", s)
    s = re.sub(r"\\[a-zA-Z]+\*?\s*", " ", s)
    s = re.sub(r"[{}\\]", "", s)
    return re.sub(r"\s+", " ", s).strip()


def _parse_tex_affiliations(tex: str) -> list[str]:
    tex = re.sub(r"%.*", "", tex)  # strip comments
    seen: set[str] = set()
    results: list[str] = []

    def add(raw: str) -> None:
        s = _clean_latex(raw)
        if s and len(s) > 5 and s not in seen:
            seen.add(s)
            results.append(s)

    # Standard standalone commands
    for cmd in ("affiliation", "affil", "institute", "address", "IEEEauthorblockA"):
        pat = re.compile(r"\\" + cmd + r"(?:\[[^\]]*\])?\s*\{")
        for m in pat.finditer(tex):
            add(_brace_content(tex, m.end()))

    # \thanks{...} that look like affiliations (NeurIPS / ACL style)
    for m in re.finditer(r"\\thanks\s*\{", tex):
        content = _brace_content(tex, m.end())
        if _INSTITUTION_RE.search(content):
            add(content)

    # Affiliations embedded in \author{...} as \textit / \textrm (Elsevier, some journals)
    author_m = re.search(r"\\author\s*\{", tex)
    if author_m:
        author_block = _brace_content(tex, author_m.end())
        for cmd in ("textit", "textrm", "small", "footnotesize"):
            for m in re.finditer(r"\\" + cmd + r"\s*\{", author_block):
                content = _brace_content(author_block, m.end())
                if _INSTITUTION_RE.search(content):
                    add(content)

    return results


def _tex_from_bytes(raw: bytes) -> str | None:
    # Try multi-file tarball first
    try:
        with tarfile.open(fileobj=io.BytesIO(raw), mode="r:gz") as tf:
            # Prefer the largest .tex with \documentclass; fall back to concat.
            candidates: list[tuple[int, str]] = []
            all_tex: list[str] = []
            for member in tf.getmembers():
                if not member.name.endswith(".tex"):
                    continue
                fobj = tf.extractfile(member)
                if fobj is None:
                    continue
                content = fobj.read().decode("utf-8", errors="replace")
                all_tex.append(content)
                if r"\documentclass" in content:
                    candidates.append((member.size, content))
            if candidates:
                return max(candidates)[1]
            return "\n".join(all_tex) or None
    except tarfile.ReadError:
        pass
    # Single .tex.gz
    try:
        return gzip.decompress(raw).decode("utf-8", errors="replace")
    except Exception:
        return None


def fetch_arxiv_institutions(arxiv_ids: list[str]) -> dict[str, list[str]]:
    """Returns {arxiv_id: [institution_strings]} parsed from LaTeX source."""
    out: dict[str, list[str]] = {}
    headers = {"User-Agent": f"TorchGeoCitations/1.0 (mailto:{MAILTO})"}
    for arxiv_id in arxiv_ids:
        bare_id = re.sub(r"v\d+$", "", arxiv_id)
        url = f"https://arxiv.org/src/{bare_id}"
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                raw = r.read()
        except (urllib.error.HTTPError, urllib.error.URLError, OSError):
            time.sleep(2)
            continue
        tex = _tex_from_bytes(raw)
        if tex:
            affs = _parse_tex_affiliations(tex)
            if affs:
                out[bare_id] = affs
        time.sleep(2)
    return out


def apply_arxiv_institutions(
    merged: list[dict], arxiv_map: dict[str, list[str]]
) -> int:
    """Add paper-level institutions list from arXiv source. Returns enriched count."""
    enriched = 0
    for rec in merged:
        arxiv_id = re.sub(r"v\d+$", "", rec.get("arxivId") or "")
        if not arxiv_id or arxiv_id not in arxiv_map:
            continue
        existing = set(rec.get("institutions") or [])
        new = [s for s in arxiv_map[arxiv_id] if s not in existing]
        if new:
            rec["institutions"] = sorted(existing | set(new))
            enriched += 1
    return enriched


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


def _openalex_author(a: dict) -> dict:
    author = a.get("author") or {}
    raw = list(a.get("raw_affiliation_strings") or [])
    institutions = [
        i.get("display_name")
        for i in (a.get("institutions") or [])
        if i.get("display_name")
    ]
    affiliations = [s for s in raw + institutions if s]
    # Preserve original single-string field for back-compat; expose full list too.
    primary = affiliations[0] if affiliations else None
    return {
        "name": author.get("display_name"),
        "openalexId": author.get("id"),
        "orcid": author.get("orcid"),
        "affiliation": primary,
        "affiliations": sorted(set(affiliations)),
    }


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
            _openalex_author(a) for a in (work.get("authorships") or [])
        ],
        "url": work.get("id"),
    }


def _s2_author(a: dict) -> dict:
    affs = [s for s in (a.get("affiliations") or []) if s]
    return {
        "name": a.get("name"),
        "openalexId": None,
        "orcid": None,
        "affiliation": affs[0] if affs else None,
        "affiliations": sorted(set(affs)),
        "s2AuthorId": a.get("authorId"),
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
            _s2_author(a) for a in (p.get("authors") or [])
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

    api_key = os.environ.get("S2_API_TOKEN") or os.environ.get("S2_API_KEY")
    if not api_key:
        print("ERROR: S2_API_TOKEN env var not set", file=sys.stderr)
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

    # Backfill author affiliations from the S2 author batch endpoint for any
    # author still missing one (the citations endpoint occasionally omits them).
    missing_ids: list[str] = []
    seen_ids: set[str] = set()
    for rec in merged:
        for au in rec.get("authors") or []:
            aid = au.get("s2AuthorId")
            if not aid or au.get("affiliations"):
                continue
            if aid in seen_ids:
                continue
            seen_ids.add(aid)
            missing_ids.append(aid)

    if missing_ids:
        print(f"Backfilling affiliations for {len(missing_ids)} S2 authors...")
        s2_aff_map = fetch_s2_author_affiliations(missing_ids, api_key)
        if s2_aff_map:
            for rec in merged:
                for au in rec.get("authors") or []:
                    aid = au.get("s2AuthorId")
                    if aid and not au.get("affiliations") and aid in s2_aff_map:
                        affs = sorted(set(s2_aff_map[aid]))
                        au["affiliations"] = affs
                        if not au.get("affiliation") and affs:
                            au["affiliation"] = affs[0]
        print(f"  Filled affiliations for {len(s2_aff_map)} authors")

    # CrossRef: per-author affiliations keyed by DOI
    all_dois = [r["doi"] for r in merged if r.get("doi")]
    print(f"Fetching CrossRef affiliations for {len(all_dois)} DOIs...")
    cr_map = fetch_crossref_affiliations(all_dois)
    cr_filled = apply_crossref(merged, cr_map)
    print(f"  CrossRef: {len(cr_map)} DOIs with data, {cr_filled} authors filled")

    # arXiv LaTeX source: paper-level institution lists
    all_arxiv = [
        re.sub(r"v\d+$", "", r["arxivId"])
        for r in merged
        if r.get("arxivId")
    ]
    print(f"Fetching arXiv source for {len(all_arxiv)} papers (slow — ~2s each)...")
    arxiv_map = fetch_arxiv_institutions(all_arxiv)
    arxiv_enriched = apply_arxiv_institutions(merged, arxiv_map)
    print(f"  arXiv: {len(arxiv_map)} sources parsed, {arxiv_enriched} papers enriched")

    authors_total = sum(len(r.get("authors") or []) for r in merged)
    authors_with_aff = sum(
        1
        for r in merged
        for a in (r.get("authors") or [])
        if a.get("affiliations")
    )
    papers_with_institutions = sum(1 for r in merged if r.get("institutions"))

    breakdown = {
        "openalex": len(oa_records),
        "semanticscholar": len(s2_records),
        "merged_unique": len(merged),
        "in_both": sum(1 for r in merged if len(r["sources"]) == 2),
        "openalex_only": sum(1 for r in merged if r["sources"] == ["openalex"]),
        "s2_only": sum(1 for r in merged if r["sources"] == ["semanticscholar"]),
        "authors_total": authors_total,
        "authors_with_affiliation": authors_with_aff,
        "papers_with_institutions": papers_with_institutions,
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
