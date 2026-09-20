# Global Reach

Homepage block: `layouts/partials/blocks/gptl-global-reach.html`.
Presentation: `layouts/partials/global-reach.html`, `assets/css/global-reach.css`, `assets/js/global-reach.js`.
Mock aggregates: `data/visitor_stats.json`. Both language homepages use this same data.

The visible demo label is intentional: these numbers are not measured traffic. No analytics collector is installed and the default configuration sends no requests.

## Connect later

Implement a same-origin Netlify Function returning the JSON shape in `data/visitor_stats.json` (see JSDoc VisitorStats). Keep provider credentials in server environment variables. Then set `endpoint` in `assets/js/visitor-stats-provider.js` to `/.netlify/functions/visitor-stats`. No presentation changes are needed. Keep the top distribution at five rows for the same visual footprint, combining remaining countries as Others; percentages use the same reporting period and denominator as the KPIs.

The provider validates aggregates, aborts after five seconds, and falls back to clearly marked demo data on HTTP, JSON, timeout or schema errors. Server-rendered values remain visible during loading and with JavaScript disabled; there is no empty loading panel or count-up animation. Successful responses hide the demo label while reserving its space. Text is inserted via textContent. No visitor-level data is used or stored.

`since` controls the start-period footnote. Visitors use en-US grouping; percentages always use one decimal. The supplied headings and country names are retained in English on both language pages.
