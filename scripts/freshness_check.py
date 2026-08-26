#!/usr/bin/env python3
"""Saffa.ae freshness monitor. Reports stale listings and link health issues.

Run periodically (monthly recommended). Does not modify files.
Output can be pasted into a GitHub issue for the ingestion pipeline.
"""

import json, re, sys
from datetime import date, datetime
from pathlib import Path

BASE = Path(__file__).parent.parent
TODAY = date.today()
STALE_DAYS = 90

print(f"\n=== Saffa.ae Freshness Check — {TODAY} ===\n")

with open(BASE / "assets/data/directory.json") as f:
    data = json.load(f)

listings = [l for l in data["listings"] if l.get("publish_status") == "live"]

stale = []
wa_issues = []
no_source = []

for l in listings:
    slug = l["slug"]

    # staleness check
    lv = l.get("last_verified", "")
    if lv:
        try:
            lv_date = datetime.strptime(lv, "%Y-%m-%d").date()
            age = (TODAY - lv_date).days
            if age > STALE_DAYS:
                stale.append((slug, l["name"], age, lv))
        except ValueError:
            stale.append((slug, l["name"], -1, lv))
    else:
        stale.append((slug, l["name"], -1, "missing"))

    # WhatsApp link format check
    wa = l.get("whatsapp", "")
    if wa:
        if wa.startswith("+") or wa.lstrip("+").isdigit():
            pass  # phone number — ok
        elif wa.startswith("https://chat.whatsapp.com/"):
            pass  # group link — ok
        elif wa.startswith("https://wa.me/"):
            pass  # wa.me link — ok
        else:
            wa_issues.append((slug, l["name"], wa))

    # canonical source check
    src = l.get("canonical_source", "internal")
    if src == "internal":
        no_source.append((slug, l["name"]))

# ── Report ────────────────────────────────────────────────────────────────────
print(f"Live listings checked: {len(listings)}\n")

if stale:
    print(f"STALE (>{STALE_DAYS} days since last verification):")
    for slug, name, age, lv in stale:
        age_str = f"{age}d" if age >= 0 else "unknown age"
        print(f"  [{age_str:>6}]  {slug}  —  {name}  (last: {lv})")
else:
    print(f"No stale listings (all verified within {STALE_DAYS} days).")

print()

if wa_issues:
    print("WHATSAPP FORMAT ISSUES:")
    for slug, name, wa in wa_issues:
        print(f"  {slug}  —  {name}  →  {wa[:60]}")
else:
    print("WhatsApp links: all formats OK.")

print()

HIGH_CHANGE = [
    ("visas/residency rules", "ICP UAE — https://icp.gov.ae"),
    ("SARS compliance / tax deadlines", "SARS — https://www.sars.gov.za"),
    ("consulate appointment system", "DIRCO — https://www.dirco.gov.za/dubai"),
    ("SA passport processing times", "DHA — https://www.dha.gov.za"),
    ("banking / remittance regulations", "SARB — https://www.resbank.co.za"),
]

print("HIGH-CHANGE CONTENT (verify independently each cycle):")
for topic, source in HIGH_CHANGE:
    print(f"  • {topic}")
    print(f"      Official source: {source}")

print()

if no_source:
    print(f"Listings with canonical_source='internal' (not yet linked to OneDrive evidence):")
    for slug, name in no_source:
        print(f"  {slug}  —  {name}")
    print(f"  Action: after research, update canonical_source to the OneDrive path.")

print(f"\n{'='*50}")
print("Paste this report into a GitHub issue on saffa.ae-website to track freshness work.")
print(f"Next check recommended: {TODAY.replace(month=TODAY.month % 12 + 1) if TODAY.month < 12 else TODAY.replace(year=TODAY.year+1, month=1)}\n")
