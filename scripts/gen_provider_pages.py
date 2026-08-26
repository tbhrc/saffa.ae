#!/usr/bin/env python3
"""Generate corrected individual provider pages — fixes meta truncation, JSON-LD, disclosure styling."""

import json, os, html, textwrap

BASE = "/Users/david/Library/CloudStorage/OneDrive-TalentBridgeHRConsultancy/Saffa.ae/60 - Channels/61 - Website/saffa.ae-website"

with open(f"{BASE}/assets/data/directory.json") as f:
    data = json.load(f)

CAT_LABEL = {
    "professional-business": ("Professional & Business", "💼"),
    "home-family": ("Home & Family", "🏡"),
    "food-lifestyle": ("Food & Lifestyle", "🍖"),
    "services-trades": ("Services & Trades", "🔧"),
    "community-organisations": ("Community", "🤝"),
}

CAT_SCHEMA = {
    "professional-business": "ProfessionalService",
    "home-family": "LocalBusiness",
    "food-lifestyle": "FoodEstablishment",
    "services-trades": "LocalBusiness",
    "community-organisations": "Organization",
}

OFFICIAL_SOURCES = {
    "sa-consulate-dubai": [
        {"label": "DIRCO — Book a consulate appointment", "url": "https://www.dirco.gov.za/dubai"},
    ],
    "sabco-uae": [
        {"label": "SABCO UAE official website", "url": "https://sabco-uae.org"},
    ],
    "devere-group-dubai": [
        {"label": "SARS — SA Revenue Service", "url": "https://www.sars.gov.za"},
    ],
    "creative-zone-dubai": [
        {"label": "ICP — UAE visa & immigration authority", "url": "https://icp.gov.ae"},
        {"label": "DET — Dubai business licensing", "url": "https://det.gov.ae"},
    ],
    "dubai-chambers": [
        {"label": "Dubai Chambers official portal", "url": "https://www.dubaichambers.com"},
    ],
    "sa-school-dubai": [
        {"label": "KHDA — UAE school regulator", "url": "https://www.khda.gov.ae"},
    ],
    "mediclinic-dubai": [
        {"label": "DHA — Dubai Health Authority", "url": "https://www.dha.gov.ae"},
    ],
}

CAT_GUIDES = {
    "professional-business": [
        ("/guides/work-and-business/", "Work & Business in UAE", "Work"),
        ("/guides/moving-to-uae/", "Moving to UAE as a South African", "Relocation"),
    ],
    "home-family": [
        ("/guides/family-and-schools/", "Family & Schools in Dubai", "Family"),
        ("/guides/first-weeks/", "Your First Weeks in Dubai", "Settling In"),
    ],
    "food-lifestyle": [
        ("/guides/first-weeks/", "Your First Weeks in Dubai", "Settling In"),
        ("/community/", "SA Community Groups", "Community"),
    ],
    "services-trades": [
        ("/guides/first-weeks/", "Your First Weeks in Dubai", "Settling In"),
        ("/guides/moving-to-uae/", "Moving to UAE as a South African", "Relocation"),
    ],
    "community-organisations": [
        ("/community/", "SA Community Groups", "Community"),
        ("/guides/first-weeks/", "Your First Weeks in Dubai", "Settling In"),
    ],
}

def truncate_at_word(text, max_len):
    """Truncate at word boundary, max_len chars, append ellipsis only if truncated."""
    if len(text) <= max_len:
        return text
    # shorten to max_len-1, then cut at last space
    return text[:max_len-1].rsplit(' ', 1)[0].rstrip(' .,;') + '…'

def schema_ld(l, cat_schema):
    area = l.get("area") or l.get("emirate") or "UAE"
    # Use UAE if area is 'UAE-wide'
    area_served = "UAE" if "wide" in area.lower() else l.get("emirate", "UAE")
    obj = {
        "@context": "https://schema.org",
        "@type": cat_schema,
        "name": l["name"],
        "description": l["description"],
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": f"https://saffa.ae/directory/{l['category']}/{l['slug']}/"
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": area.replace("UAE-wide", "UAE"),
            "addressCountry": "AE"
        },
        "areaServed": area_served,
    }
    if l.get("website"): obj["url"] = l["website"]
    if l.get("phone"): obj["telephone"] = l["phone"]
    if l.get("email"): obj["email"] = l["email"]
    if l.get("instagram"):
        ig = l["instagram"].lstrip("@")
        obj["sameAs"] = [f"https://www.instagram.com/{ig}/"]
    return json.dumps(obj, indent=2, ensure_ascii=False)

def breadcrumb_ld(l, cat_label):
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://saffa.ae/"},
            {"@type": "ListItem", "position": 2, "name": "Directory", "item": "https://saffa.ae/directory/"},
            {"@type": "ListItem", "position": 3, "name": cat_label, "item": f"https://saffa.ae/directory/{l['category']}/"},
            {"@type": "ListItem", "position": 4, "name": l["name"], "item": f"https://saffa.ae/directory/{l['category']}/{l['slug']}/"},
        ]
    }, ensure_ascii=False)

def render_contacts(l):
    links = []
    if l.get("website"):
        links.append(f'<a href="{l["website"]}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Visit Website</a>')
    if l.get("phone"):
        links.append(f'<a href="tel:{l["phone"]}" class="btn btn-outline">📞 {html.escape(l["phone"])}</a>')
    if l.get("whatsapp"):
        wa = l["whatsapp"].replace("+","").replace("-","").replace(" ","")
        links.append(f'<a href="https://wa.me/{wa}" target="_blank" rel="noopener noreferrer" class="btn btn-wa">WhatsApp</a>')
    if l.get("email"):
        links.append(f'<a href="mailto:{html.escape(l["email"])}" class="btn btn-outline">✉️ Email</a>')
    if l.get("instagram"):
        ig = l["instagram"].lstrip("@")
        links.append(f'<a href="https://instagram.com/{ig}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">Instagram</a>')
    return "\n          ".join(links)

def render_tags(l):
    tags = []
    if l.get("sa_owned"):
        tags.append('<span class="listing-tag listing-tag-sa">🇿🇦 SA-Owned</span>')
    if l.get("verified"):
        tags.append('<span class="listing-tag listing-verified">✓ Verified</span>')
    if l.get("relationship") == "saffa-affiliated":
        tags.append('<span class="badge-affiliated" title="This business is affiliated with Saffa.ae">Saffa-affiliated</span>')
    for t in (l.get("tags") or []):
        if t not in ("SA-Owned","SA-Founded"):
            tags.append(f'<span class="listing-tag">{html.escape(t)}</span>')
    return "\n          ".join(tags)

def render_official_sources(slug):
    sources = OFFICIAL_SOURCES.get(slug)
    if not sources:
        return ""
    items = "\n          ".join(
        f'<li><a href="{s["url"]}" target="_blank" rel="noopener noreferrer">{html.escape(s["label"])}</a></li>'
        for s in sources
    )
    return f"""
      <div class="info-box" style="margin-top:1.5rem">
        <strong>📋 Official sources</strong>
        <ul style="margin:0.75rem 0 0;padding-left:1.25rem;list-style:disc">
          {items}
        </ul>
      </div>"""

def render_affiliation_note(slug):
    """Styled info-box for affiliated providers — replaces bare <p>."""
    if slug == "talent-bridge":
        return """
      <div class="info-box" style="margin-top:1.5rem">
        <strong>ℹ️ Affiliation disclosure</strong>
        <p style="margin:0.5rem 0 0">Talent Bridge is affiliated with Saffa.ae. This listing is disclosed accordingly. In our guides, affiliated providers are always listed after official and independent options.</p>
      </div>"""
    if slug == "implementai":
        return """
      <div class="info-box" style="margin-top:1.5rem">
        <strong>ℹ️ Affiliation disclosure</strong>
        <p style="margin:0.5rem 0 0">iMPLEMENTAi.ae is affiliated with Saffa.ae (as site creator). This listing is disclosed accordingly. In our guides, affiliated providers are always listed after official and independent options.</p>
      </div>"""
    return ""

def render_related_guides(cat):
    guides = CAT_GUIDES.get(cat, [])[:2]
    if not guides:
        return ""
    cards = "\n        ".join(
        f'<a href="{url}" class="guide-card"><div class="guide-tag">{tag}</div><div class="guide-title">{html.escape(title)}</div><div class="guide-arrow">Read →</div></a>'
        for url, title, tag in guides
    )
    return f"""
      <h2 style="margin-top:2.5rem">Related Guides</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem">
        {cards}
      </div>"""

def make_page(l):
    cat = l["category"]
    slug = l["slug"]
    cat_label, cat_emoji = CAT_LABEL.get(cat, ("Directory", "📌"))
    cat_schema = CAT_SCHEMA.get(cat, "LocalBusiness")
    name_esc = html.escape(l["name"])
    desc = l["description"]
    desc_esc = html.escape(desc)
    meta_desc = html.escape(truncate_at_word(desc, 155))
    area = l.get("area") or l.get("emirate") or "UAE"
    area_display = area.replace("UAE-wide", "UAE-wide") if area else "UAE"
    contacts = render_contacts(l)
    tags = render_tags(l)
    official_sources = render_official_sources(slug)
    affiliation_note = render_affiliation_note(slug)
    related_guides = render_related_guides(cat)
    lv = l.get("last_verified")
    last_verified = f'<p style="font-size:0.75rem;color:var(--gray-400);margin-top:1.5rem">Last verified: {lv}</p>' if lv else ""

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name_esc} | SA {cat_label} UAE | Saffa.ae</title>
  <meta name="description" content="{meta_desc}">
  <link rel="canonical" href="https://saffa.ae/directory/{cat}/{slug}/">
  <meta property="og:title" content="{name_esc} | Saffa.ae">
  <meta property="og:description" content="{meta_desc}">
  <meta property="og:url" content="https://saffa.ae/directory/{cat}/{slug}/">
  <meta property="og:image" content="https://saffa.ae/assets/images/logo-avatar.png">
  <meta property="og:type" content="website">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script type="application/ld+json">
{schema_ld(l, cat_schema)}
  </script>
  <script type="application/ld+json">
{breadcrumb_ld(l, cat_label)}
  </script>
</head>
<body>
<div id="site-nav"></div>

<section class="page-header">
  <div class="container">
    <nav class="breadcrumb">
      <a href="/">Home</a><span class="breadcrumb-sep">›</span>
      <a href="/directory/">Directory</a><span class="breadcrumb-sep">›</span>
      <a href="/directory/{cat}/">{cat_emoji} {cat_label}</a><span class="breadcrumb-sep">›</span>
      <span>{name_esc}</span>
    </nav>
    <h1>{l.get("emoji", "📌")} {name_esc}</h1>
    <p style="color:var(--gray-200);margin-top:0.5rem">{html.escape(l.get("subcategory",""))} · {html.escape(area_display)}</p>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:800px">

    <div class="listing-card" style="margin-bottom:2rem">
      <p style="font-size:1.05rem;line-height:1.75;margin-bottom:1.5rem">{desc_esc}</p>
      <div class="listing-meta" style="margin-bottom:1.5rem">
        {tags}
      </div>
      {('<div style="display:flex;gap:0.75rem;flex-wrap:wrap">' + contacts + '</div>') if contacts else ''}
    </div>
{affiliation_note}
{official_sources}
{related_guides}
{last_verified}

    <div style="margin-top:3rem;padding:1.5rem;background:var(--gray-50);border-radius:var(--radius-lg)">
      <p style="font-size:0.875rem;color:var(--gray-500);margin-bottom:0.75rem">
        Listed on <a href="/" style="color:var(--green)">Saffa.ae</a> — the South African community directory for the UAE.
        <a href="/directory/{cat}/" style="color:var(--green)">Browse all {cat_label} listings →</a>
      </p>
      <p style="font-size:0.8rem;color:var(--gray-400);margin:0">
        Know something that needs updating? <a href="/submit/" style="color:var(--green)">Submit a correction</a>
      </p>
    </div>
  </div>
</section>

<div id="site-footer"></div>
<script src="/assets/js/nav-footer.js"></script>
<script src="/assets/js/motion.js"></script>
<script src="/assets/js/main.js"></script>
</body>
</html>
"""
    return page

created = []
for l in data["listings"]:
    cat = l["category"]
    slug = l["slug"]
    out_dir = f"{BASE}/directory/{cat}/{slug}"
    os.makedirs(out_dir, exist_ok=True)
    out_path = f"{out_dir}/index.html"
    with open(out_path, "w") as f:
        f.write(make_page(l))
    created.append(slug)
    print(f"  regenerated: /directory/{cat}/{slug}/")

print(f"\nDone — {len(created)} pages regenerated.")
