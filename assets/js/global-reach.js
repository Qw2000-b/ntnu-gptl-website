import {getVisitorStats} from './visitor-stats-provider.js';
const integer = new Intl.NumberFormat('en-US', {maximumFractionDigits: 0});
const percentage = n => `${n.toFixed(1)}%`;
function render(root, {data, isMock}) {
  root.querySelector('[data-reach-visitors]').textContent = integer.format(data.totalVisitors);
  root.querySelector('[data-reach-countries]').textContent = integer.format(data.countries);
  root.querySelector('[data-reach-international]').textContent = percentage(data.internationalPercentage);
  root.querySelector('[data-reach-since]').textContent = `Analytics since ${data.since}`;
  // Preserve this line's space when real data arrives; no loading indicator shift.
  root.querySelector('[data-reach-demo]').style.visibility = isMock ? 'visible' : 'hidden';
  const rows = data.countryDistribution.map(({country, percentage: value}) => {
    const row = document.createElement('li');
    const name = document.createElement('span'); name.className = 'reach-country'; name.textContent = country;
    const track = document.createElement('span'); track.className = 'reach-track'; track.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('span'); bar.style.width = percentage(value); track.append(bar);
    const label = document.createElement('span'); label.className = 'reach-percentage'; label.textContent = percentage(value);
    row.append(name, track, label); return row;
  });
  root.querySelector('[data-reach-distribution]').replaceChildren(...rows);
}
for (const root of document.querySelectorAll('[data-global-reach]')) {
  try {
    const fallback = JSON.parse(root.querySelector('[data-reach-data]').textContent);
    getVisitorStats(fallback).then(result => render(root, result)).catch(() => {});
  } catch { /* The server-rendered section remains readable without JavaScript. */ }
}
