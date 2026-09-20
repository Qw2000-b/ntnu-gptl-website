const TTL = 15 * 60 * 1000;
const START = '2026-09-01T00:00:00Z';
const validCount = value => Number.isSafeInteger(value) && value >= 0;
const oneDecimal = value => Math.round(value * 10) / 10;
function normalize(total, rows, updatedAt) {
  if (!total || !validCount(total.total) || !validCount(total.total_events) || total.total_events > total.total || !Array.isArray(rows)) throw Error('Invalid aggregate');
  const countries = new Map(); let unknown = 0;
  for (const row of rows) {
    if (!row || typeof row.id !== 'string' || typeof row.name !== 'string' || !validCount(row.count)) throw Error('Invalid country aggregate');
    if (!/^[A-Z]{2}$/.test(row.id) || ['ZZ','XX'].includes(row.id)) {unknown += row.count; continue;}
    if (row.count === 0) continue;
    const previous = countries.get(row.id);
    countries.set(row.id, {id:row.id, country:row.id === 'TW' ? 'Taiwan' : row.name, count:(previous?.count || 0) + row.count});
  }
  const known = [...countries.values()].reduce((sum,row)=>sum+row.count,0);
  const taiwan = countries.get('TW')?.count || 0;
  const taiwanPercentage = known ? oneDecimal(taiwan / known * 100) : null;
  const top = [...countries.values()].filter(row=>row.id!=='TW').sort((a,b)=>b.count-a.count || a.id.localeCompare(b.id)).slice(0,3);
  const percentage = count => known ? oneDecimal(count / known * 100) : 0;
  const remainder = known - taiwan - top.reduce((sum,row)=>sum+row.count,0);
  return {
    // Legacy key preserved for component compatibility; metric explicitly defines its meaning.
    totalVisitors:total.total-total.total_events, metric:'Visits', countries:countries.size,
    taiwanPercentage, internationalPercentage:known ? oneDecimal(100-taiwanPercentage) : null,
    countryDistribution:[{country:'Taiwan',percentage:percentage(taiwan)},...top.map(row=>({country:row.country,percentage:percentage(row.count)})),{country:'Others',percentage:percentage(remainder)}],
    since:'September 2026', periodStart:START, updatedAt, source:'goatcounter',
    countryBasis:'geolocated visits', geolocatedVisits:known, unknownLocationVisits:unknown
  };
}
function createHandler({enabled=false, env=process.env, fetcher=globalThis.fetch, now=Date.now}={}) {
  let cached=null, expires=0, pending=null, retryAfter=0;
  const response=(statusCode, data, seconds=0)=>({statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Netlify-CDN-Cache-Control':seconds ? `public, durable, max-age=${seconds}` : 'no-store','X-Content-Type-Options':'nosniff'},body:JSON.stringify(data)});
  async function load() {
    const token=env.GOATCOUNTER_API_KEY;
    if (!token || !env.GOATCOUNTER_BASE_URL) throw Error('Unavailable');
    const base=new URL(env.GOATCOUNTER_BASE_URL);
    // This adapter is for the user's existing site only. Never forward credentials on redirects.
    if (base.origin!=='https://ntnu-gptl.goatcounter.com' || base.username || base.password) throw Error('Unavailable');
    const end=new Date(Math.ceil(now()/3600000)*3600000).toISOString();
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),8000);
    const get=async (path,params={})=>{
      const query=new URLSearchParams({start:START,end,...params});
      const result=await fetcher(`${base.origin}/api/v0/stats/${path}?${query}`,{headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},redirect:'error',signal:controller.signal});
      if (!result.ok) throw Error('Unavailable');
      return result.json();
    };
    try {
      const total=await get('total');
      const rows=[]; let offset=0;
      for(let page=0;page<10;page++) {
        if(page>0) await new Promise(resolve=>setTimeout(resolve,300));
        const data=await get('locations',{limit:'100',offset:String(offset)});
        if (!Array.isArray(data.stats) || typeof data.more!=='boolean') throw Error('Invalid aggregate');
        rows.push(...data.stats); offset+=data.stats.length;
        if (!data.more) return normalize(total,rows,new Date(now()).toISOString());
        if (!data.stats.length) throw Error('Invalid pagination');
      }
      throw Error('Incomplete aggregate');
    } finally {clearTimeout(timer);}
  }
  return async event=>{
    if (!enabled) return response(404,{available:false});
    if (event?.httpMethod && event.httpMethod!=='GET') return response(405,{available:false});
    if (cached && now()<expires) return response(200,cached,Math.max(1,Math.floor((expires-now())/1000)));
    if (now()<retryAfter) return response(503,{available:false});
    if (!pending) pending=load().then(data=>{cached=data;expires=now()+TTL;return data;}).catch(()=>{retryAfter=now()+60000;return null;}).finally(()=>{pending=null;});
    const data=await pending;
    return data ? response(200,data,900) : response(503,{available:false});
  };
}
module.exports={createHandler,normalize,TTL,START};
