# Saffa.ae — Content Ingestion Pipeline

## Governing principle

OneDrive is canonical content truth. GitHub is the website output/build layer.
Do not create a competing research database inside the repo.

## Data flow

```
OneDrive 40-Knowledge / 70-Research
  → edit assets/data/directory.json  (canonical listing record)
  → run scripts/gen_provider_pages.py  (regenerates /directory/{cat}/{slug}/)
  → run scripts/qa_gate.py            (must pass before committing)
  → git add + commit + push
  → deploy to Hostinger via MCP
```

## Directory listings

All listing data lives in `assets/data/directory.json`.

Required fields per listing:

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | stable kebab-case slug |
| `slug` | yes | URL slug — immutable |
| `category` | yes | one of the five categories |
| `name` | yes | |
| `subcategory` | yes | |
| `emirate` | yes | |
| `description` | yes | min 80 chars |
| `verified` | yes | boolean |
| `last_verified` | yes | YYYY-MM-DD |
| `publish_status` | yes | `live`, `hold`, or `provisional` |
| `canonical_source` | yes | relative OneDrive path or `"internal"` |

Only listings with `publish_status: live` are generated. The QA gate enforces this.

## Adding a new listing

1. Research → save evidence in OneDrive `70 - Research & Evidence/{slug}/`.
2. Add the listing record to `assets/data/directory.json` with `publish_status: "live"`.
3. Set `canonical_source` to the OneDrive evidence path.
4. Run `python3 scripts/gen_provider_pages.py` — generates the static page.
5. Run `python3 scripts/qa_gate.py` — must exit 0.
6. Commit, push (David approval), deploy.

## Updating a listing

1. Update evidence in OneDrive.
2. Edit the record in `assets/data/directory.json`.
3. Update `last_verified` to today's date.
4. Re-run generator and QA gate.
5. Commit, push, deploy.

## Removing / holding a listing

Set `publish_status: "hold"` in `directory.json`. Re-run generator. The page is removed
(generator skips non-live entries). Do not delete the JSON record — it is the audit trail.

## Category pages and sitemap

Category pages (`/directory/{cat}/index.html`) are maintained manually — they load listings
dynamically from `assets/data/directory.json` via `search.js`. No regeneration needed for
category pages unless the UI or static link index changes.

`sitemap.xml` must be updated manually whenever new provider pages are added or removed.

## Events

Events live in `assets/data/events.json`. Run `scripts/gen_events.py` to regenerate
`events/index.html` after adding or updating events. Past events are automatically hidden
in the browser by the page JS; archiving is done by setting `status: "archived"`.

## Scripts

| Script | Purpose |
|--------|---------|
| `gen_provider_pages.py` | Generate all /directory/{cat}/{slug}/index.html pages |
| `qa_gate.py` | Pre-commit validation — must pass before push |
| `freshness_check.py` | Report stale listings and flag for re-verification |
