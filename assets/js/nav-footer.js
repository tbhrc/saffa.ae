/* Saffa.ae — nav-footer.js
   Injects shared nav and footer into every page.
   Place <div id="site-nav"></div> and <div id="site-footer"></div> in each page.
*/
(function () {
  const NAV_HTML = `
  <nav class="nav" aria-label="Main navigation">
    <div class="nav-inner">
      <a href="/" class="nav-logo" aria-label="Saffa.ae Home">
        <img src="/assets/images/logo.png" alt="Saffa.ae" width="120" height="40">
      </a>
      <div class="nav-links">
        <a href="/directory/" class="nav-link">Directory</a>
        <a href="/guides/" class="nav-link">Guides</a>
        <a href="/community/" class="nav-link">Community</a>
        <a href="/events/" class="nav-link">Events</a>
        <a href="/about/" class="nav-link">About</a>
        <a href="https://chat.whatsapp.com/G6UBQgZzqgB3RTToN3vI3U" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm nav-cta">
          <svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Join WhatsApp
        </a>
      </div>
      <button id="mobile-menu-btn" class="nav-mobile-btn" aria-label="Open menu" aria-expanded="false">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
  </nav>
  <div id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-label="Navigation menu">
    <div class="mobile-menu-header">
      <a href="/" aria-label="Saffa.ae Home"><img src="/assets/images/logo.png" alt="Saffa.ae" height="36"></a>
      <button id="mobile-menu-close" aria-label="Close menu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <nav class="mobile-menu-links">
      <a href="/" class="mobile-menu-link">🏠 Home</a>
      <a href="/directory/" class="mobile-menu-link">🗂️ Directory</a>
      <a href="/guides/" class="mobile-menu-link">📖 Guides</a>
      <a href="/community/" class="mobile-menu-link">💬 Community</a>
      <a href="/events/" class="mobile-menu-link">🗓️ Events</a>
      <a href="/about/" class="mobile-menu-link">ℹ️ About</a>
      <a href="/submit/" class="mobile-menu-link">➕ Add a Listing</a>
    </nav>
    <div class="mobile-menu-footer">
      <a href="https://chat.whatsapp.com/G6UBQgZzqgB3RTToN3vI3U" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="width:100%;justify-content:center">
        <svg class="wa-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Join WhatsApp Community
      </a>
    </div>
  </div>`;

  const FOOTER_HTML = `
  <footer class="footer" aria-label="Site footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <img src="/assets/images/logo.png" alt="Saffa.ae">
          <p>The home for South Africans in the UAE — directory, guides, WhatsApp community and events. Built by Saffas, for Saffas.</p>
          <div class="footer-social mt-4">
            <a href="https://www.instagram.com/saffa.ae" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/saffa.ae" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="white" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Directory</h4>
          <nav class="footer-links">
            <a href="/directory/professional-business/" class="footer-link">Professional & Business</a>
            <a href="/directory/home-family/" class="footer-link">Home & Family</a>
            <a href="/directory/food-lifestyle/" class="footer-link">Food & Lifestyle</a>
            <a href="/directory/services-trades/" class="footer-link">Services & Trades</a>
            <a href="/directory/community-organisations/" class="footer-link">Community</a>
            <a href="/submit/" class="footer-link">Add a Listing</a>
          </nav>
        </div>
        <div class="footer-col">
          <h4>Guides</h4>
          <nav class="footer-links">
            <a href="/guides/moving-to-uae/" class="footer-link">Moving to UAE</a>
            <a href="/guides/first-weeks/" class="footer-link">First Weeks</a>
            <a href="/guides/consulate-documents/" class="footer-link">Consulate & Docs</a>
            <a href="/guides/family-and-schools/" class="footer-link">Family & Schools</a>
            <a href="/guides/money-and-banking/" class="footer-link">Money & Banking</a>
            <a href="/guides/work-and-business/" class="footer-link">Work & Business</a>
          </nav>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <nav class="footer-links">
            <a href="/community/" class="footer-link">WhatsApp Groups</a>
            <a href="/events/" class="footer-link">Events</a>
            <a href="/about/" class="footer-link">About Saffa.ae</a>
            <a href="https://www.dirco.gov.za/dubai" target="_blank" rel="noopener noreferrer" class="footer-link">SA Consulate Dubai</a>
            <a href="https://sabco-uae.org" target="_blank" rel="noopener noreferrer" class="footer-link">SABCO</a>
          </nav>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© <span id="footer-year">2026</span> Saffa.ae — For South Africans in the UAE. <a href="/about/">About</a></p>
        <p style="font-size:0.75rem;color:rgba(255,255,255,0.4)">Listings are community-sourced. Always verify details before visiting or contacting.</p>
        <p class="site-credit">Website created by <a href="https://implementai.ae" target="_blank" rel="noopener noreferrer">iMPLEMENTAi.ae</a></p>
      </div>
    </div>
  </footer>`;

  function inject(id, html) {
    const el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', function () {
    inject('site-nav', NAV_HTML);
    inject('site-footer', FOOTER_HTML);
    const yr = document.getElementById('footer-year');
    if (yr) yr.textContent = new Date().getFullYear();
  });
})();
