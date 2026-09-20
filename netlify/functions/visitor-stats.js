// Temporary aggregate-only schema verification; replaced after live verification.
exports.handler = async () => {
  const reply = (statusCode, data) => ({statusCode, headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(data)});
  if (!require('./lib/deploy-context.json').enabled) return reply(404,{available:false});
  const token=process.env.GOATCOUNTER_API_KEY;
  if (!token || !process.env.GOATCOUNTER_BASE_URL) return reply(503,{available:false,reason:'configuration'});
  try {
    const base = new URL(process.env.GOATCOUNTER_BASE_URL);
    if (base.origin !== 'https://ntnu-gptl.goatcounter.com' || base.username || base.password) return reply(503,{available:false,reason:'base-url'});
    const end=new Date(Math.ceil(Date.now()/3600000)*3600000).toISOString();
    const q=new URLSearchParams({start:'2026-09-01T00:00:00Z',end,limit:'100'});
    const result={};
    for (const kind of ['total','locations']) {
      const res=await fetch(`${base.origin}/api/v0/stats/${kind}?${q}`,{headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(8000),redirect:'error'});
      if (!res.ok) return reply(503,{available:false,endpoint:kind,status:res.status});
      const value=await res.json();
      const schema=Object.fromEntries(Object.entries(value).map(([key,val])=>[key,Array.isArray(val)?'array':typeof val]));
      result[kind]={schema};
      if(kind==='total') for(const key of ['total','total_events','total_utc']) if(typeof value[key]==='number') result[kind][key]=value[key];
      if(kind==='locations') {
        result[kind].more=value.more;
        result[kind].stats=(value.stats||[]).map(row=>Object.fromEntries(['id','name','count'].filter(k=>['string','number'].includes(typeof row[k])).map(k=>[k,row[k]])));
      }
    }
    return reply(200,result);
  } catch {return reply(503,{available:false,reason:'upstream'});}
};
