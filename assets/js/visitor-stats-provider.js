/** Public, aggregate data only. Enable a same-origin serverless URL here later.
 * Third-party credentials belong in server-side environment variables, never here.
 * @typedef {{totalVisitors:number,countries:number,internationalPercentage:number,
 * countryDistribution:Array<{country:string,percentage:number}>,since:string}} VisitorStats
 */
export const endpoint = ''; // Future: '/.netlify/functions/visitor-stats'
export function isVisitorStats(value) {
  const percent = n => Number.isFinite(n) && n >= 0 && n <= 100;
  return !!value && Number.isSafeInteger(value.totalVisitors) && value.totalVisitors >= 0
    && Number.isSafeInteger(value.countries) && value.countries >= 0
    && percent(value.internationalPercentage)
    && typeof value.since === 'string' && value.since.trim().length > 0 && value.since.length <= 80
    && Array.isArray(value.countryDistribution) && value.countryDistribution.length > 0
    && value.countryDistribution.length <= 20
    && value.countryDistribution.every(row => row && typeof row.country === 'string'
      && row.country.trim().length > 0 && row.country.length <= 100 && percent(row.percentage));
}
/** Keeps the server-rendered mock visible during loading and on failure. */
export async function getVisitorStats(fallback, url = endpoint, fetcher = globalThis.fetch) {
  if (!url) return {data: fallback, isMock: true};
  // Only relative same-origin endpoints; no direct third-party analytics requests.
  if (!url.startsWith('/') || url.startsWith('//') || url.includes('\\')) return {data: fallback, isMock: true};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetcher(url, {signal: controller.signal, credentials: 'same-origin', headers: {Accept: 'application/json'}});
    if (!response.ok) throw new Error('Unavailable');
    const data = await response.json();
    if (!isVisitorStats(data)) throw new Error('Invalid aggregate data');
    return {data, isMock: false};
  } catch {
    return {data: fallback, isMock: true};
  } finally { clearTimeout(timer); }
}
