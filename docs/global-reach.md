# Global Reach: GoatCounter preview adapter

## Files
- `netlify/functions/visitor-stats.js`: Function entry.
- `netlify/functions/lib/visitor-stats.cjs`: authenticated API calls, validation, pagination, aggregation and 15-minute cache.
- `scripts/configure-visitor-stats.cjs` and `netlify/functions/lib/deploy-context.json`: bake a non-secret preview boolean at build time; false by default. Netlify runtime does not expose build CONTEXT.
- `netlify.toml`: runs that build step; API secrets are not read or injected during builds.
- `assets/js/visitor-stats-provider.js`: public same-origin endpoint, response validation and marked mock fallback.
- `assets/js/global-reach.js`, `layouts/partials/global-reach.html`, `assets/css/global-reach.css`: existing presentation with Visits label, explicit real/mock status and null percentage handling.
- `data/visitor_stats.json`: original mock numbers, retained only as clearly labelled fallback.

## Live schema verification
On 2026-09-20 a temporary preview Function authenticated with the configured environment variables and actually received HTTP 200 from both endpoints. No token was returned or logged. Temporary diagnostics are removed from the final version.

`GET /api/v0/stats/total?start=...&end=...`:
```json
{"total":4,"total_events":0,"total_utc":4,"stats":[]}
```
The example abbreviates the daily/hourly stats array, which is not used. Actual root types: total, total_events, total_utc are numbers; stats is an array. Do not send limit to this endpoint (400).

`GET /api/v0/stats/locations?start=...&end=...&limit=100&offset=0`:
```json
{"stats":[{"id":"TW","name":"Taiwan","count":4}],"more":false}
```
Follow more/offset pagination, validate all rows, and fail safely rather than display incomplete data.

## Metric and period
GoatCounter counts a visit when a session first loads a path; repeated loads of the same path in that session are deduplicated. This is not lifetime unique people. Use **Visits**, based on total minus total_events, never label it Visitors. The legacy totalVisitors JSON key remains for component compatibility with metric="Visits" and source="goatcounter". See https://www.goatcounter.com/help/sessions and https://www.goatcounter.com/api.json.

The reporting period starts 2026-09-01T00:00:00Z, the month already shown in the supplied mock. The end rounds up to the current UTC hour. Since remains September 2026; this describes the query coverage, not the lab's founding date.

Countries counts distinct nonzero country IDs. Unknown location codes are excluded from country count and country-share denominator and exposed only as aggregate unknownLocationVisits. Country shares use the sum of known country visits, disclosed beneath the chart. Taiwan appears first, then the top three other countries sorted by count, followed by Others containing all remaining known countries. Percentages round to one decimal; internationalPercentage = 100 - rounded Taiwan percentage. If no visits have a known country, internationalPercentage and taiwanPercentage are null (UI displays an em dash), not fabricated 100%.

## Runtime and security
Read GOATCOUNTER_API_KEY and GOATCOUNTER_BASE_URL only in the server function. Authorization uses Bearer. Only the existing https://ntnu-gptl.goatcounter.com origin is allowed; redirects are rejected. No query parameters from browsers are forwarded. No tokens, response errors, exceptions or headers are logged or returned. Successful responses contain only aggregates. Production returns 404 before reading credentials; HTML has no active data endpoint outside Deploy Preview.

Warm instances cache for 900 seconds, coalesce concurrent calls and cool down failures for 60 seconds. Netlify durable CDN caching is also set to 900 seconds, with remaining TTL on warm-cache hits; browser cache is disabled. No unbounded stale data. First-load requests can make two calls, plus any required country pages. Request abort timeout is 8 seconds; frontend timeout is 10 seconds.

A 503/timeout/invalid response uses the clearly marked demo numbers, with no technical error on the homepage. Successful data shows the GoatCounter source label. Real zero values remain zero. No analytics credentials enter the client bundle or Hugo parameters.

## Verification
`node --test tests/visitor-stats.test.mjs tests/visitor-stats-function.test.cjs`
`node scripts/configure-visitor-stats.cjs` (production default)
Production and Preview Hugo builds must both pass. Inspect generated HTML for data-endpoint: Preview only.
