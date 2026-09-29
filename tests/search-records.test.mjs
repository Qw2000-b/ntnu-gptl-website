import test from 'node:test';
import assert from 'node:assert/strict';
import {searchRecords} from '../assets/js/search-records.mjs';

const records = [
  {title: '研究方向', content: '能源研究。'.repeat(60) + '燃料電池', summary: '', authors: []},
  {title: '燃料電池車輛熱管理', content: '動態模擬', authors: ['Yu-Hsuan Lin']},
  {title: '另一項研究', content: '能源管理', authors: ['Yi-Hsuan Hung']},
];
test('Chinese phrase finds titles and late body text, prioritizing the title', () => {
  assert.deepEqual(searchRecords(records, '燃料電池'), [records[1], records[0]]);
});
test('English names ignore case and match multiple words without Chinese fallback', () => {
  assert.deepEqual(searchRecords(records, 'yu-hsuan LIN'), [records[1]]);
  assert.deepEqual(searchRecords(records, 'Lin 不存在'), []);
});
test('blank and unknown queries return no records; fullwidth letters normalize', () => {
  assert.deepEqual(searchRecords(records, '  '), []);
  assert.deepEqual(searchRecords(records, 'missing'), []);
  assert.deepEqual(searchRecords(records, 'ＬＩＮ'), [records[1]]);
});
