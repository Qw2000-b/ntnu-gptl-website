const test = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync} = require('node:fs');
const {tmpdir} = require('node:os');
const {join, resolve} = require('node:path');
const {execFileSync} = require('node:child_process');
const vm = require('node:vm');
const analytics = require('../data/analytics.json');
const source = readFileSync(resolve(__dirname, '../assets/js/production-analytics.js'), 'utf8');

function load(origin, pathname='/en/research/') {
  const scripts=[];
  const context={window:{},location:{origin,pathname,search:'?private=value',hash:'#section'},document:{
    currentScript:{dataset:{productionOrigin:analytics.production_origin,pathPrefix:analytics.path_prefix}},
    createElement:()=>({dataset:{}}),head:{append:node=>scripts.push(node)}
  }};
  vm.runInNewContext(source,context);
  return {scripts,window:context.window};
}

test('production sends a namespaced path without query or fragment',()=>{
  const result=load(analytics.production_origin);
  assert.equal(result.scripts.length,1);
  assert.equal(result.scripts[0].dataset.goatcounter,'https://ntnu-gptl.goatcounter.com/count');
  assert.equal(result.window.goatcounter.path(),'production:/en/research/');
});

test('local, preview, branch and immutable deployment hosts cannot send counts',()=>{
  for(const origin of ['http://localhost:1316','http://127.0.0.1:1316',
    'https://deploy-preview-2--gleaming-gaufre-6e7379.netlify.app',
    'https://test--gleaming-gaufre-6e7379.netlify.app',
    'https://abc123--gleaming-gaufre-6e7379.netlify.app']) assert.equal(load(origin).scripts.length,0);
});

test('deployment adapter requires production context and explicit enable flag',()=>{
  const temp=mkdtempSync(join(tmpdir(),'gptl-analytics-'));
  try {
    mkdirSync(join(temp,'scripts'));
    mkdirSync(join(temp,'netlify/functions/lib'),{recursive:true});
    copyFileSync(resolve(__dirname,'../scripts/configure-visitor-stats.cjs'),join(temp,'scripts/configure.cjs'));
    for(const [context,flag,expected] of [['production','true',true],['production','false',false],['deploy-preview','true',false],['branch-deploy','true',false],['','true',false]]) {
      execFileSync(process.execPath,[join(temp,'scripts/configure.cjs')],{env:{...process.env,CONTEXT:context,HUGO_GOATCOUNTER_ENABLED:flag}});
      assert.equal(JSON.parse(readFileSync(join(temp,'netlify/functions/lib/deploy-context.json'))).enabled,expected);
    }
  } finally { rmSync(temp,{recursive:true}); }
});
