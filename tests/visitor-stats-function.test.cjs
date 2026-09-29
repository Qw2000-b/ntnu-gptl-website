const test=require('node:test'); const assert=require('node:assert/strict');
const {createHandler,normalize,TTL}=require('../netlify/functions/lib/visitor-stats.cjs');
const env={GOATCOUNTER_API_KEY:'unit-test-only',GOATCOUNTER_BASE_URL:'https://ntnu-gptl.goatcounter.com'};
const total={total:4,total_events:0,total_utc:4,stats:[]};
const locations={more:false,stats:[{id:'TW',name:'Taiwan',count:4}]};
const paths={more:false,paths:[{id:1,path:'/',event:false},{id:2,path:'production:/',event:false},{id:3,path:'production:/en/',event:false}]};
const goodFetch=async url=>({ok:true,json:async()=>url.includes('/paths?')?paths:url.includes('/total?')?total:locations});
test('observed live schema maps to Visits and Taiwan 100%',()=>{
 const data=normalize(total,locations.stats,'2026-09-20T00:00:00Z');
 assert.equal(data.totalVisitors,4);assert.equal(data.metric,'Visits');assert.equal(data.countries,1);
 assert.equal(data.taiwanPercentage,100);assert.equal(data.internationalPercentage,0);
});
test('sort top countries, aggregate remainder, exclude unknown country from denominator',()=>{
 const rows=[['TW',20],['JP',30],['US',10],['DE',15],['FR',5],['CA',5],['',15]].map(([id,count])=>({id,name:id||'Unknown',count}));
 const data=normalize({total:110,total_events:10},rows,'now');
 assert.equal(data.totalVisitors,100);assert.equal(data.countries,6);assert.equal(data.unknownLocationVisits,15);
 assert.deepEqual(data.countryDistribution.map(r=>r.country),['Taiwan','JP','DE','US','Others']);
 assert.equal(data.internationalPercentage,76.5);assert.equal(data.countryDistribution[4].percentage,11.8);
});
test('zero geolocated visits do not fabricate 100% international',()=>{
 const data=normalize({total:0,total_events:0},[],'now');assert.equal(data.internationalPercentage,null);assert.equal(data.countries,0);
});
test('disabled environments and non-GET requests cannot access upstream',async()=>{
 let calls=0;const fetcher=()=>{calls++;throw Error('unexpected');};
 assert.equal((await createHandler({enabled:false,env,fetcher})({httpMethod:'GET'})).statusCode,404);
 assert.equal((await createHandler({enabled:true,env,fetcher})({httpMethod:'POST'})).statusCode,405);assert.equal(calls,0);
});
test('15 minute server cache coalesces requests and expires',async()=>{
 let time=Date.parse('2026-09-20T08:00:00Z'),calls=0;
 const handler=createHandler({enabled:true,env,now:()=>time,fetcher:async(...args)=>{calls++;return goodFetch(...args);}});
 const results=await Promise.all([handler(),handler(),handler()]);assert.equal(calls,3);
 assert.equal(results[0].headers['Netlify-CDN-Cache-Control'],'public, durable, max-age=900');
 time+=TTL-1;await handler();assert.equal(calls,3);time+=2;await handler();assert.equal(calls,6);
});
test('upstream errors never expose secrets, error bodies or stack traces',async()=>{
 for(const fetcher of [async()=>{throw Error(env.GOATCOUNTER_API_KEY);},async()=>({ok:false,json:async()=>({error:env.GOATCOUNTER_API_KEY})}),async()=>({ok:true,json:async()=>({})})]) {
  const response=await createHandler({enabled:true,env,fetcher})();assert.equal(response.statusCode,503);
  assert.deepEqual(JSON.parse(response.body),{available:false});assert.ok(!JSON.stringify(response).includes(env.GOATCOUNTER_API_KEY));
 }
});
test('Bearer header sent only to configured HTTPS host; redirects disabled',async()=>{
 const handler=createHandler({enabled:true,env,fetcher:async(url,options)=>{
  assert.equal(new URL(url).origin,env.GOATCOUNTER_BASE_URL);assert.equal(options.headers.Authorization,'Bearer unit-test-only');assert.equal(options.redirect,'error');
  if(url.includes('/total?'))assert.equal(new URL(url).searchParams.has('limit'),false);
  return goodFetch(url);
 }});assert.equal((await handler()).statusCode,200);
 const wrong=createHandler({enabled:true,env:{...env,GOATCOUNTER_BASE_URL:'https://example.com'},fetcher:()=>{throw Error('Must not fetch');}});assert.equal((await wrong()).statusCode,503);
});
test('country pagination consumes all pages before calculating countries',async()=>{
 const fetcher=async url=>({ok:true,json:async()=>url.includes('/paths?')?paths:url.includes('/total?')?total:new URL(url).searchParams.get('offset')==='0'?{more:true,stats:[{id:'TW',name:'Taiwan',count:2}]}:{more:false,stats:[{id:'JP',name:'Japan',count:2}]}});
 const data=JSON.parse((await createHandler({enabled:true,env,fetcher})()).body);assert.equal(data.countries,2);assert.equal(data.internationalPercentage,50);
});


test('both aggregate endpoints include only production path IDs',async()=>{
 const visited=[];
 const handler=createHandler({enabled:true,env,fetcher:async(url,options)=>{
  visited.push(new URL(url));return goodFetch(url,options);
 }});
 assert.equal((await handler()).statusCode,200);
 for(const url of visited.filter(u=>u.pathname.includes('/stats/'))) {
  assert.equal(url.searchParams.get('include_paths'),'2,3');
  assert.equal(url.searchParams.get('start'),'2026-09-29T16:00:00Z');
 }
 assert.equal(visited.filter(u=>u.pathname.includes('/stats/')).length,2);
});

test('no production paths means zero, never an unfiltered aggregate request',async()=>{
 let calls=0;
 const response=await createHandler({enabled:true,env,fetcher:async url=>{
  calls++;assert.ok(url.includes('/paths?'));
  return {ok:true,json:async()=>({more:false,paths:[{id:1,path:'/',event:false}]})};
 }})();
 assert.equal(response.statusCode,200);assert.equal(calls,1);
 assert.equal(JSON.parse(response.body).totalVisitors,0);
});

test('path pagination includes later production paths and excludes events',async()=>{
 const response=await createHandler({enabled:true,env,fetcher:async url=>{
  const query=new URL(url);
  if(query.pathname.endsWith('/paths'))return {ok:true,json:async()=>query.searchParams.get('after')==='0'
   ?{more:true,paths:[{id:1,path:'/',event:false},{id:2,path:'production:/',event:false}]}
   :{more:false,paths:[{id:3,path:'production:/en/',event:false},{id:4,path:'production:/event',event:true}]}};
  assert.equal(query.searchParams.get('include_paths'),'2,3');return goodFetch(url);
 }})();
 assert.equal(response.statusCode,200);
});

test('incomplete path pagination fails closed instead of returning partial totals',async()=>{
 const response=await createHandler({enabled:true,env,fetcher:async()=>({ok:true,json:async()=>({more:true,paths:[]})})})();
 assert.equal(response.statusCode,503);
});
