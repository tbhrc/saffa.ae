#!/usr/bin/env python3
"""Saffa.ae pre-publish QA gate. Must exit 0 before any push."""

import json, os, re, sys
from pathlib import Path

BASE = Path(__file__).parent.parent
errors = []
warnings = []

def err(msg): errors.append(msg); print(f"  FAIL  {msg}")
def warn(msg): warnings.append(msg); print(f"  WARN  {msg}")
def ok(msg): print(f"  ok    {msg}")

REQUIRED_FIELDS = ['id', 'slug', 'name', 'category', 'subcategory', 'emirate',
                   'description', 'verified', 'last_verified', 'publish_status', 'canonical_source']
VALID_CATEGORIES = {'professional-business', 'home-family', 'food-lifestyle',
                    'services-trades', 'community-organisations'}
VALID_STATUSES = {'live', 'hold', 'provisional'}
PLACEHOLDER_PATTERNS = [r'971000000000', r'XXX', r'PLACEHOLDER', r'TODO', r'example\.com']

print("\n=== Saffa.ae QA Gate ===\n")

# ── 1. directory.json checks ─────────────────────────────────────────────────
print("1. directory.json")
dj = BASE / "assets/data/directory.json"
if not dj.exists():
    err("assets/data/directory.json missing")
    sys.exit(1)

with open(dj) as f:
    data = json.load(f)

listings = data.get("listings", [])
slugs = set()
live_listings = []

for l in listings:
    slug = l.get("slug", "?")
    prefix = f"  [{slug}]"

    # required fields
    for field in REQUIRED_FIELDS:
        if field not in l:
            err(f"{prefix} missing field: {field}")

    # publish_status
    ps = l.get("publish_status")
    if ps not in VALID_STATUSES:
        err(f"{prefix} invalid publish_status: {ps!r}")
    if ps in ("hold", "provisional"):
        warn(f"{prefix} publish_status is {ps!r} — page will not be generated")
        continue

    live_listings.append(l)

    # category
    cat = l.get("category")
    if cat not in VALID_CATEGORIES:
        err(f"{prefix} invalid category: {cat!r}")

    # description length
    desc = l.get("description", "")
    if len(desc) < 60:
        err(f"{prefix} description too short ({len(desc)} chars, min 60)")

    # placeholder detection
    for field in ["website", "phone", "whatsapp", "email", "description"]:
        val = l.get(field, "") or ""
        for pat in PLACEHOLDER_PATTERNS:
            if re.search(pat, val, re.I):
                err(f"{prefix} placeholder data in field '{field}': {val[:60]}")

    # duplicate slugs
    if slug in slugs:
        err(f"{prefix} duplicate slug")
    slugs.add(slug)

    # last_verified format
    lv = l.get("last_verified", "")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", lv):
        err(f"{prefix} last_verified must be YYYY-MM-DD, got: {lv!r}")

    # affiliated must be last in category
    if l.get("relationship") == "saffa-affiliated":
        cat_listings = [x for x in live_listings if x.get("category") == cat and x.get("publish_status") == "live"]
        non_affiliated_after = [
            x for x in listings[listings.index(l)+1:]
            if x.get("category") == cat
            and x.get("relationship") != "saffa-affiliated"
            and x.get("publish_status") == "live"
        ]
        if non_affiliated_after:
            err(f"{prefix} saffa-affiliated listing must be last in category '{cat}'")

ok(f"directory.json: {len(live_listings)} live listings, {len(listings)-len(live_listings)} held")

# ── 2. Generated provider pages exist ────────────────────────────────────────
print("\n2. Provider pages")
for l in live_listings:
    cat, slug = l["category"], l["slug"]
    page = BASE / "directory" / cat / slug / "index.html"
    if not page.exists():
        err(f"Missing provider page: /directory/{cat}/{slug}/")
    else:
        # check for placeholder content inside page
        content = page.read_text()
        for pat in PLACEHOLDER_PATTERNS:
            if re.search(pat, content):
                err(f"Placeholder in /directory/{cat}/{slug}/index.html: {pat}")
        # check page has nav and footer hooks
        if 'id="site-nav"' not in content:
            err(f"Missing #site-nav in /directory/{cat}/{slug}/index.html")
        if 'id="site-footer"' not in content:
            err(f"Missing #site-footer in /directory/{cat}/{slug}/index.html")
        ok(f"/directory/{cat}/{slug}/")

# ── 3. Core pages exist ───────────────────────────────────────────────────────
print("\n3. Core pages")
core_pages = [
    "index.html", "directory/index.html", "guides/index.html",
    "community/index.html", "events/index.html", "submit/index.html",
    "about/index.html", "privacy/index.html", "terms/index.html",
    "robots.txt", "sitemap.xml", "favicon.ico",
]
for p in core_pages:
    path = BASE / p
    if path.exists():
        ok(p)
    else:
        err(f"Missing core file: {p}")

# ── 4. robots.txt sanity ─────────────────────────────────────────────────────
print("\n4. robots.txt")
robots = (BASE / "robots.txt").read_text()
if "Disallow: /assets/data/" in robots:
    err("robots.txt blocks /assets/data/ — directory JSON will not be crawlable")
else:
    ok("robots.txt does not block /assets/data/")
if "sitemap.xml" in robots.lower():
    ok("robots.txt references sitemap.xml")
else:
    warn("robots.txt missing Sitemap reference")

# ── 5. sitemap.xml checks ────────────────────────────────────────────────────
print("\n5. sitemap.xml")
sitemap = (BASE / "sitemap.xml").read_text()
for l in live_listings:
    url = f"/directory/{l['category']}/{l['slug']}/"
    if url not in sitemap:
        warn(f"Provider URL not in sitemap: {url}")
    else:
        ok(f"sitemap: {url}")

# ── 6. WhatsApp links ─────────────────────────────────────────────────────────
print("\n6. WhatsApp links")
wa_bad = re.findall(r'wa\.me/971000000000', (BASE / "submit/index.html").read_text())
if wa_bad:
    err("submit/index.html still has placeholder WhatsApp number 971000000000")
else:
    ok("submit/index.html WhatsApp link looks set")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"\n{'='*40}")
print(f"Errors:   {len(errors)}")
print(f"Warnings: {len(warnings)}")
if errors:
    print("\nQA FAILED — fix errors before pushing.\n")
    sys.exit(1)
else:
    print("\nQA PASSED.\n")
    sys.exit(0)
