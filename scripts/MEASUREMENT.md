# Saffa.ae Measurement Setup

## Activate analytics

1. **Google Search Console** — verify site ownership:
   - Go to https://search.google.com/search-console
   - Add property: `https://saffa.ae`
   - Choose "HTML tag" verification method
   - Copy the `content="..."` value from the meta tag shown
   - Edit `index.html` line with `YOUR_VERIFICATION_CODE` — paste the code
   - Submit sitemap: `https://saffa.ae/sitemap.xml`

2. **Plausible Analytics** (recommended — privacy-friendly, no cookie banner needed):
   - Create account at https://plausible.io
   - Add site `saffa.ae`
   - In `index.html`, replace the Plausible comment block with:
     ```html
     <script defer data-domain="saffa.ae" src="https://plausible.io/js/script.js"></script>
     ```
   - Add the same snippet to every page's `<head>` (or use a `<link>` in nav-footer.js)
   - Custom events already fire automatically via `window.saffa.track()` in main.js —
     register them as custom goals in Plausible dashboard.

3. **GA4** (alternative):
   - Create property at https://analytics.google.com
   - Get Measurement ID (`G-XXXXXXXXXX`)
   - Add to every page head:
     ```html
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
     ```

## What is already wired up

`assets/js/main.js` fires `window.saffa.track(event, props)` for:

| Event | Trigger |
|-------|---------|
| `provider_click` | Click on `<a data-track="provider-click">` |
| `whatsapp_click` | Click any WhatsApp link |
| `search` | Hero search form submitted |

`window.saffa.track()` routes to Plausible and/or GA4 when those are loaded —
does nothing if neither is present.

## What to measure (priority order)

1. Organic impressions + clicks + avg position (Search Console)
2. Top queries that land on Saffa.ae
3. Directory provider page views
4. Provider website clicks (conversion proxy)
5. WhatsApp join clicks (community conversion)
6. Submit form starts
