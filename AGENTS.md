# AGENTS.md — saffa.ae-website

## ⚠️ CRITICAL HAZARD — Live Production Website

**This folder contains the published Saffa.ae website source files.**
All changes here will be deployed to `https://saffa.ae` — a live, publicly accessible website.

---

## Identity

| Property | Value |
|---|---|
| Repo | `tbhrc/saffa.ae-website` |
| Live URL | `https://saffa.ae` |
| Hostinger hosting | u910293682 / `saffa.ae` |
| Deploy method | Hostinger MCP → TUS upload zip → `deployStaticSiteArchiveV1` |
| Deploy root | `/home/u910293682/domains/saffa.ae/public_html` |

---

## What lives here

```
index.html                  ← Home page (search bar is the core)
directory/                  ← SA business directory (5 categories)
guides/                     ← 7 SA expat guides
community/                  ← WhatsApp groups (19+)
events/                     ← Events calendar
about/                      ← About page
submit/                     ← Listing submission form
assets/
  css/
    theme.css               ← ALL brand tokens — edit here to restyle the whole site
    style.css               ← Structural CSS (imports theme.css automatically)
  js/
    nav-footer.js           ← Shared nav + footer HTML injected into every page
    main.js                 ← Mobile nav, scroll, active links
    search.js               ← Hero search bar + directory filter
  data/
    directory.json          ← Directory listings (source of truth for all directory pages)
    events.json             ← Events data
  images/                   ← Logo, favicon, avatar assets
sitemap.xml
robots.txt
.htaccess
```

---

## Agent rules — MANDATORY

### Before touching any file:
1. **Read the file before editing.** Never overwrite without reading first.
2. **Do not push to GitHub** without explicit approval from David.
3. **Do not deploy to Hostinger** (upload to public_html) without explicit approval from David.
4. **Verify internal links** before reporting changes complete — all `href` paths must use `/directory/category/`, `/guides/topic/`, etc.

### Editing the theme / design:
- To change **colours, fonts or spacing** — edit `assets/css/theme.css` only. Every page picks it up automatically.
- To change **nav or footer** — edit `assets/js/nav-footer.js` only. Both are injected from there.
- To change **directory listings** — edit `assets/data/directory.json`. The JS renders from there — do NOT hardcode listings in HTML.

### Content principles (per SOP-SEO-and-GEO.md):
- Every guide must include at least one SA-specific verifiable fact (e.g. consulate phone number, SARS threshold, real school name)
- No FAQPage JSON-LD (Google deprecated for rich results)
- Use Article, BreadcrumbList, Organization, Event and LocalBusiness schemas where appropriate
- No `llms.txt` — standard structured content is sufficient for GEO
- Internal links between pages are crucial for SEO — maintain them

### File naming:
- All pages use `/folder/index.html` pattern for clean URLs
- No `.html` extensions in `href` links — use `/directory/` not `/directory/index.html`

### Data safety:
- No credentials, API keys or secrets in any file
- WhatsApp group links must come from the canonical registry: `Saffa.ae/30 - Community/32 - WhatsApp Structure/WhatsApp Group Registry.md` — do not invent or hardcode placeholder URLs
- If you need to add or update a WhatsApp link, read the registry first and use the exact verified invite URL

---

## Deploy workflow (requires David approval)

1. Zip the repo root: `zip -r saffa-ae.zip . -x "*.git*" -x "AGENTS.md" -x ".DS_Store"`
2. Upload via Hostinger MCP TUS protocol: `hosting_generateUploadURLV1` → TUS upload → `hosting_deployStaticSiteArchiveV1`
3. Verify at `https://saffa.ae` — check home page loads, nav works, search bar works
4. Check mobile nav on a real mobile viewport

---

## Coordination

- Source of record for web strategy: `60 - Channels/61 - Website/` (this OneDrive folder)
- Canonical task: see `120-tasks/` for the relevant task number
- Deploy evidence must be recorded in the canonical task before marking done
