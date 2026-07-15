# torchgeo.github.io

Simple Next.js landing page for `torchgeo.org`, deployed to GitHub Pages.

## Local

```bash
bun install
make dev
```

## Build

```bash
make build
```

## Checks

```bash
make check
```

## Preview static export

```bash
bun run start
```

## Refresh public research data

The site checks in snapshots of papers citing TorchGeo and public repositories
that depend on it. Refresh both before a data update:

```bash
S2_API_TOKEN=... python3 scripts/fetch_citations.py
python3 scripts/fetch_dependents.py
```

The citation collector combines Semantic Scholar and OpenAlex, then reuses
existing affiliation enrichment for unchanged records. The dependents collector
requires an authenticated GitHub CLI (`gh auth status`). Both commands write to
`public/data/`; review the diffs before publishing because live indexes can add
or remove records.
