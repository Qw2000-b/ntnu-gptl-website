import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source = await readFile(new URL('../assets/js/visitor-stats-provider.js', import.meta.url), 'utf8');
const {getVisitorStats, isVisitorStats} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const mock = JSON.parse(await readFile(new URL('../data/visitor_stats.json', import.meta.url), 'utf8'));
test('mock mode makes no network request', async () => {
  const result = await getVisitorStats(mock, '', () => { throw new Error('Must not fetch'); });
  assert.deepEqual(result, {data: mock, isMock: true});
});
test('valid aggregate response replaces mock data', async () => {
  const data = {...mock, totalVisitors: 15000, since: 'October 2026'};
  assert.deepEqual(await getVisitorStats(mock, '/stats', async () => ({ok:true,json:async()=>data})), {data,isMock:false});
});
test('HTTP, JSON, network and schema failures retain mock', async () => {
  for (const fetcher of [async()=>({ok:false}),async()=>({ok:true,json:async()=>{throw Error('JSON');}}),async()=>{throw Error('Network');},async()=>({ok:true,json:async()=>({...mock,internationalPercentage:101})})]) {
    assert.deepEqual(await getVisitorStats(mock, '/stats', fetcher), {data:mock,isMock:true});
  }
});
test('third-party URLs never trigger a request', async () => {
  for (const url of ['https://example.com', '//example.com']) {
    let called=false; await getVisitorStats(mock,url,()=>{called=true;}); assert.equal(called,false);
  }
});
test('invalid counts, percentages and rows are rejected', () => {
  assert.equal(isVisitorStats(mock),true);
  for (const data of [null,{...mock,totalVisitors:-1},{...mock,countries:1.2},{...mock,countryDistribution:[]},{...mock,countryDistribution:[{country:'Taiwan',percentage:-3}]}]) assert.equal(isVisitorStats(data),false);
});
