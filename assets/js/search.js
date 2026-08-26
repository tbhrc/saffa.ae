/* Saffa.ae — search.js
   Powers the hero search bar (index.html) and the directory filter (directory pages).
*/
(function () {
  'use strict';

  /* =============================================
     HERO SEARCH BAR (home page)
     ============================================= */
  const heroInput   = document.getElementById('hero-search');
  const searchBtn   = document.getElementById('search-submit-btn');
  const resultsBox  = document.getElementById('search-results');
  const searchWrap  = document.getElementById('search-wrap');

  let _directoryData = null;

  async function loadData() {
    if (_directoryData) return _directoryData;
    try {
      const res = await fetch('/assets/data/directory.json');
      _directoryData = await res.json();
    } catch (_) {
      _directoryData = { listings: [] };
    }
    return _directoryData;
  }

  function buildIndex(data) {
    const index = [];
    (data.listings || []).forEach((l) => {
      index.push({
        type: 'directory',
        title: l.name,
        sub: l.subcategory + (l.emirate ? ' · ' + l.emirate : ''),
        url: '/directory/' + l.category + '/#' + l.slug,
      });
    });

    const guides = [
      { title: 'Moving to UAE as a South African', url: '/guides/moving-to-uae/' },
      { title: 'Your First Weeks in Dubai', url: '/guides/first-weeks/' },
      { title: 'SA Consulate & Documents', url: '/guides/consulate-documents/' },
      { title: 'Family & Schools in Dubai', url: '/guides/family-and-schools/' },
      { title: 'Money & Banking Guide', url: '/guides/money-and-banking/' },
      { title: 'Work & Business in UAE', url: '/guides/work-and-business/' },
      { title: 'Community Guide — Who's Who', url: '/guides/community-guide/' },
    ];
    guides.forEach((g) => index.push({ type: 'guide', title: g.title, sub: 'SA Expat Guide', url: g.url }));

    const groups = [
      { title: 'Saffas in Dubai — Main Group', url: '/community/' },
      { title: 'SA Jobs in UAE', url: '/community/' },
      { title: 'SA Ladies UAE', url: '/community/' },
      { title: 'SA Moms Dubai', url: '/community/' },
      { title: 'Springboks UAE Rugby', url: '/community/' },
    ];
    groups.forEach((g) => index.push({ type: 'group', title: g.title, sub: 'WhatsApp Community', url: g.url }));

    return index;
  }

  function highlight(text, q) {
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + esc + ')', 'gi'), '<mark>$1</mark>');
  }

  function renderResults(items, q) {
    if (!resultsBox) return;
    if (!items.length) {
      resultsBox.innerHTML = '<div class="search-result-item" style="justify-content:center;color:var(--gray-500)">No results for "<strong>' + q + '</strong>"</div>';
    } else {
      resultsBox.innerHTML = items.slice(0, 8).map((item) => `
        <a class="search-result-item" href="${item.url}">
          <span class="search-result-type result-type-${item.type}">${item.type}</span>
          <span>
            <div class="search-result-title">${highlight(item.title, q)}</div>
            <div class="search-result-sub">${item.sub}</div>
          </span>
        </a>`).join('');
    }
    resultsBox.classList.add('open');
  }

  if (heroInput) {
    let debounce;
    heroInput.addEventListener('input', () => {
      clearTimeout(debounce);
      const q = heroInput.value.trim();
      if (q.length < 2) { resultsBox && resultsBox.classList.remove('open'); return; }
      debounce = setTimeout(async () => {
        const data = await loadData();
        const index = buildIndex(data);
        const ql = q.toLowerCase();
        const matches = index.filter((i) => i.title.toLowerCase().includes(ql) || (i.sub || '').toLowerCase().includes(ql));
        renderResults(matches, q);
      }, 200);
    });

    heroInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = heroInput.value.trim();
        if (q) window.location.href = '/directory/?q=' + encodeURIComponent(q);
      }
    });

    document.addEventListener('click', (e) => {
      if (searchWrap && !searchWrap.contains(e.target)) {
        resultsBox && resultsBox.classList.remove('open');
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const q = (heroInput && heroInput.value.trim()) || '';
      if (q) window.location.href = '/directory/?q=' + encodeURIComponent(q);
    });
  }

  /* Search pills */
  document.querySelectorAll('.search-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const q = pill.textContent.trim();
      window.location.href = '/directory/?q=' + encodeURIComponent(q);
    });
  });

  /* =============================================
     DIRECTORY FILTER (directory pages)
     ============================================= */
  const dirGrid   = document.getElementById('directory-grid');
  const filterInput = document.getElementById('dir-filter-input');
  const filterCat   = document.getElementById('dir-filter-cat');
  const filterEmirate = document.getElementById('dir-filter-emirate');
  const filterSA    = document.getElementById('dir-filter-sa');

  function applyFilters(listings) {
    const q  = filterInput  ? filterInput.value.trim().toLowerCase()  : '';
    const cat = filterCat   ? filterCat.value   : '';
    const em  = filterEmirate ? filterEmirate.value : '';
    const sa  = filterSA    ? filterSA.value    : '';

    return listings.filter((l) => {
      if (cat && l.category !== cat) return false;
      if (em  && l.emirate  !== em)  return false;
      if (sa === 'sa' && !l.sa_owned) return false;
      if (sa === 'verified' && !l.verified) return false;
      if (q && !l.name.toLowerCase().includes(q) &&
               !l.description.toLowerCase().includes(q) &&
               !(l.subcategory || '').toLowerCase().includes(q) &&
               !(l.tags || []).join(' ').toLowerCase().includes(q)) return false;
      return true;
    });
  }

  function renderCard(l) {
    const links = [];
    if (l.website) links.push(`<a href="${l.website}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Website</a>`);
    if (l.phone)   links.push(`<a href="tel:${l.phone}" class="btn btn-outline btn-sm">📞 Call</a>`);
    if (l.whatsapp) links.push(`<a href="https://wa.me/${l.whatsapp.replace(/\D/g,'')}" target="_blank" rel="noopener noreferrer" class="btn btn-wa btn-sm">WhatsApp</a>`);

    return `
      <div class="listing-card" id="${l.slug || l.id}">
        <div class="listing-header">
          <div class="listing-icon">${l.emoji || '📌'}</div>
          <div>
            <div class="listing-name">${l.name}</div>
            <div class="listing-cat">${l.subcategory || ''} ${l.emirate ? '· ' + l.emirate : ''}</div>
          </div>
        </div>
        <p class="listing-desc">${l.description}</p>
        <div class="listing-meta">
          ${l.sa_owned ? '<span class="listing-tag listing-tag-sa">🇿🇦 SA-Owned</span>' : ''}
          ${l.verified ? '<span class="listing-tag listing-verified">✓ Verified</span>' : ''}
          ${(l.tags || []).map((t) => `<span class="listing-tag">${t}</span>`).join('')}
        </div>
        ${links.length ? '<div class="flex gap-2 mt-4">' + links.join('') + '</div>' : ''}
      </div>`;
  }

  function renderGrid(listings) {
    if (!dirGrid) return;
    if (!listings.length) {
      dirGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p>No listings match your filters. <a href="#" id="clear-filters">Clear filters</a></p>
      </div>`;
      const cf = document.getElementById('clear-filters');
      if (cf) cf.addEventListener('click', (e) => { e.preventDefault(); clearFilters(); });
      return;
    }
    dirGrid.innerHTML = `<div class="grid-auto">${listings.map(renderCard).join('')}</div>`;
  }

  function clearFilters() {
    if (filterInput)   filterInput.value   = '';
    if (filterCat)     filterCat.value     = '';
    if (filterEmirate) filterEmirate.value = '';
    if (filterSA)      filterSA.value      = '';
    updateGrid();
  }

  async function updateGrid() {
    const data = await loadData();
    let listings = data.listings || [];

    /* if page is a category page, filter by that category */
    const bodyCat = document.body.dataset.category;
    if (bodyCat) listings = listings.filter((l) => l.category === bodyCat);

    renderGrid(applyFilters(listings));
  }

  if (dirGrid) {
    /* parse URL ?q= on load */
    const urlQ = new URLSearchParams(window.location.search).get('q');
    if (urlQ && filterInput) filterInput.value = urlQ;

    updateGrid();

    [filterInput, filterCat, filterEmirate, filterSA].forEach((el) => {
      if (el) el.addEventListener('input', updateGrid);
    });
  }
})();
