import {search_config, i18n} from '@params';
import {searchRecords} from './search-records.mjs';

// Keep the existing Hugo Blox modal and CSS; only replace its search implementation.
const input = document.getElementById('search-query');
const hits = document.getElementById('search-hits');
const common = document.getElementById('search-common-queries');
const english = document.documentElement.lang.startsWith('en');
let records = null;
let failed = false;
let timer;

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function renderResults() {
  const query = input.value.trim();
  hits.replaceChildren();
  if (common) common.hidden = Boolean(query);
  if (!query) return;
  if (failed || records === null) {
    hits.append(element('p', 'search-status', failed
      ? (english ? 'Search could not load. Please reload and try again.' : '搜尋資料暫時無法載入，請重新整理後再試。')
      : (english ? 'Loading search…' : '正在載入搜尋資料…')));
    return;
  }
  const results = searchRecords(records, query);
  if (!results.length) {
    hits.append(element('p', 'search-no-results', i18n.no_results));
    return;
  }
  hits.append(element('h3', 'mt-0', `${results.length} ${i18n.results}`));
  for (const record of results) {
    // Index links must stay on this site, including their item anchors.
    const url = new URL(record.relpermalink, location.origin);
    if (url.origin !== location.origin) continue;
    const result = element('div', 'search-hit', '');
    const content = element('div', 'search-hit-content', '');
    const name = element('div', 'search-hit-name', '');
    const link = element('a', '', record.title);
    link.href = url.pathname + url.hash;
    name.append(link, element('div', 'article-metadata search-hit-type', record.section), element('p', 'search-hit-description', record.summary));
    content.append(name);
    result.append(content);
    hits.append(result);
  }
}

function search() {
  const url = new URL(location.href);
  if (input.value.trim()) url.searchParams.set('q', input.value.trim());
  else url.searchParams.delete('q');
  history.replaceState(null, '', url);
  renderResults();
}

if (input && hits) {
  hits.setAttribute('aria-live', 'polite');
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 200); });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); clearTimeout(timer); search(); }
  });
  const query = new URL(location.href).searchParams.get('q');
  if (query) {
    input.value = query;
    document.body.classList.add('searching');
    input.focus();
    renderResults();
  }
  fetch(search_config.indexURI, {cache: 'no-cache'})
    .then((response) => { if (!response.ok) throw new Error('Search index unavailable'); return response.json(); })
    .then((data) => { if (!Array.isArray(data)) throw new Error('Invalid index'); records = data; renderResults(); })
    .catch(() => { failed = true; renderResults(); });
}
