# Global Reach: production GoatCounter statistics

## Configuration

- Netlify production builds set `HUGO_GOATCOUNTER_ENABLED=true`. Preview builds explicitly disable it; local Hugo servers never include the tracker.
- `scripts/configure-visitor-stats.cjs` bakes a public boolean into the function only when `CONTEXT=production` and the enable flag is true. No credentials are read during this step.
- Netlify's **Production** context must provide `GOATCOUNTER_API_KEY` (secret, read statistics permission) and `GOATCOUNTER_BASE_URL=https://ntnu-gptl.goatcounter.com`. Never commit the key or place it in Hugo data, JavaScript, screenshots, or logs.
- `data/analytics.json` holds public configuration: production origin, path namespace, reporting start and display date.

Changing this same Netlify site's visibility from Private to Public requires no analytics redeploy or reconfiguration. Real production visits made while Private also count. This measures visits since analytics activation, not exclusively visits after public launch. A future domain change requires updating `production_origin`.

## Separate preview and production data

`assets/js/production-analytics.js` checks the exact production origin before loading GoatCounter. It sends paths such as `production:/research/` and `production:/en/research/`, with query strings and fragments removed. This preserves per-page and per-language reporting. No synthetic count requests are sent by the build.

The function enumerates `/api/v0/paths` with pagination, selects only non-event paths starting with `production:/`, and sends the same `include_paths` ID filter to both `/api/v0/stats/total` and `/api/v0/stats/locations`. Newly visited routes are discovered automatically. No matching paths returns a real zero without making an unfiltered stats request. Incomplete or malformed results fail closed.

Historical preview paths remain intact. Even older immutable preview builds that still send unprefixed counts cannot enter the production aggregate. GoatCounter's dashboard contains both datasets; the website's Global Reach includes only production. Prefixing paths is supported by GoatCounter: https://www.goatcounter.com/help/domains.

## Metric, period and unavailable states

The reporting start is 2026-09-30 at 00:00 Asia/Taipei (2026-09-29 at 16:00 UTC); the end rounds up to the current UTC hour. Only namespaced production records are selected, so earlier preview traffic is excluded.

The displayed **Visits** value is GoatCounter's `total - total_events`, not lifetime unique people. A session's repeat loads of the same path are deduplicated. Country shares use known geolocated visits; unknown locations are excluded from the denominator. Taiwan, the top three other countries and Others are displayed. No geolocated visits means an unavailable percentage, not a fabricated 100%.

No example counts are shown on failures. A missing key, timeout or invalid response returns 503 with `{available:false}`; the homepage shows em dashes and a localized unavailable message. Disabled environments return 404 before contacting GoatCounter.

## Security and caching

Only the existing GoatCounter HTTPS origin receives the server-side Bearer token; redirects are rejected. Browser query parameters are never forwarded. Public responses contain aggregate counts only. No credential, upstream error body or stack trace is returned or logged.

Successful results are cached in warm instances and Netlify's durable CDN for 15 minutes; concurrent requests are coalesced. Errors have a 60-second server cooldown. Browser caching is disabled. The upstream timeout is 8 seconds and the frontend timeout is 10 seconds. Dashboard ingestion and cache expiry can delay visible changes.

## Verification

Run `node --test tests/visitor-stats.test.mjs tests/visitor-stats-function.test.cjs tests/production-analytics.test.cjs`.

Build production and preview separately. Confirm both language homepages have the tracker and stats endpoint only in production; local and preview hosts send no counts. On the deployed site, check the endpoint returns valid aggregate JSON and Global Reach shows GoatCounter data. Navigate a real production page and confirm its `production:/...` path appears in GoatCounter. Verify a cached homepage count again after cache expiry rather than generating fake visits.
