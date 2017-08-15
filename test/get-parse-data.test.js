'use strict'

const test = require('ava');
const getParseData = require('../lib/get-parse-data.js');

test('get-parse-data exists', t => {
  t.pass(true);
});

test('get-parse-data returns what we need', t => {
  const actual = JSON.stringify(getParseData(`The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. Matt 4:20 The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see James 4:99)`));
  const expected = '[{"indices":[78,181],"refs":[{"context_used":"","osis":"Exod.3.7","default":"Exod.3.7","indices":[78,84],"validity":{"valid":true,"message":{},"start":{"b":"Exod","c":3,"v":7},"end":{"b":"Exod","c":3,"v":7}}},{"context_used":"","osis":"Job.12.13","default":"Job.12.13","indices":[86,94],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":12,"v":13},"end":{"b":"Job","c":12,"v":13}}},{"context_used":"","osis":"Job.28.23-Job.28.24","default":"Job.28.23-Job.28.24","indices":[96,104],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":28,"v":23,"type":"cv"},"end":{"b":"Job","c":28,"v":24,"type":"integer"}}},{"context_used":"","osis":"Job.36.4","default":"Job.36.4","indices":[106,110],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":36,"v":4},"end":{"b":"Job","c":36,"v":4}}},{"context_used":"","osis":"Ps.33.13-Ps.33.15","default":"Ps.33.13-Ps.33.15","indices":[112,123],"validity":{"valid":true,"message":{},"start":{"b":"Ps","c":33,"v":13,"type":"bcv"},"end":{"b":"Ps","c":33,"v":15,"type":"integer"}}},{"context_used":"","osis":"Ps.139.1-Ps.139.4","default":"Ps.139.1-Ps.139.4","indices":[125,132],"validity":{"valid":true,"message":{},"start":{"b":"Ps","c":139,"v":1,"type":"cv"},"end":{"b":"Ps","c":139,"v":4,"type":"integer"}}},{"context_used":"","osis":"Isa.46.10","default":"Isa.46.10","indices":[134,142],"validity":{"valid":true,"message":{},"start":{"b":"Isa","c":46,"v":10},"end":{"b":"Isa","c":46,"v":10}}},{"context_used":"","osis":"Jer.23.24","default":"Jer.23.24","indices":[144,152],"validity":{"valid":true,"message":{},"start":{"b":"Jer","c":23,"v":24},"end":{"b":"Jer","c":23,"v":24}}},{"context_used":"","osis":"Matt.10.29","default":"Matt.10.29","indices":[154,162],"validity":{"valid":true,"message":{},"start":{"b":"Matt","c":10,"v":29},"end":{"b":"Matt","c":10,"v":29}}},{"context_used":"","osis":"Acts.15.8","default":"Acts.15.8","indices":[164,171],"validity":{"valid":true,"message":{},"start":{"b":"Acts","c":15,"v":8},"end":{"b":"Acts","c":15,"v":8}}},{"context_used":"","osis":"Heb.4.13","default":"Heb.4.13","indices":[173,181],"validity":{"valid":true,"message":{},"start":{"b":"Heb","c":4,"v":13},"end":{"b":"Heb","c":4,"v":13}}}]},{"indices":[327,336],"refs":[{"context_used":"","osis":"Matt.4.20","default":"Matt.4.20","indices":[327,336],"validity":{"valid":true,"message":{},"start":{"b":"Matt","c":4,"v":20},"end":{"b":"Matt","c":4,"v":20}}}]},{"indices":[519,529],"refs":[{"context_used":"","osis":"","default":"","indices":[519,529],"validity":{"valid":false,"message":{"start_verse_not_exist":17},"start":{"b":"Jas","c":4,"v":99},"end":{"b":"Jas","c":4,"v":99}}}]}]';
  t.deepEqual(actual, expected);
});

test('get-parse-data uses and reports context', t => {
  const actual = JSON.stringify(getParseData('12:13', {context: 'Job'}));
  const expected = '[{"indices":[0,5],"refs":[{"context_used":"Job","osis":"Job.12.13","default":"Job.12.13","indices":[0,5],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":12,"v":13},"end":{"b":"Job","c":12,"v":13}}}]}]';
  t.deepEqual(actual, expected);
});

test('get-parse-data obeys the "apoc" option', t => {
  const actual = JSON.stringify(getParseData('Baruch 1', {apoc: false}));
  const expected = '[]';
  t.deepEqual(actual, expected);
});

test('get-parse-data obeys the "vers" option', t => {
  const actual = JSON.stringify([getParseData('3 John 15'), getParseData('3 John 15', {vers:'kjv'})]);
  const expected = '[[{"indices":[0,9],"refs":[{"context_used":"","osis":"3John.1.15","default":"3John.1.14","indices":[0,9],"validity":{"valid":true,"message":{"start_chapter_not_exist_in_single_chapter_book":1},"start":{"b":"3John","c":1,"v":15},"end":{"b":"3John","c":1,"v":15}}}]}],[{"indices":[0,9],"refs":[{"context_used":"","osis":"","default":"","indices":[0,9],"validity":{"valid":false,"message":{"start_verse_not_exist":14,"start_chapter_not_exist_in_single_chapter_book":1},"start":{"b":"3John","c":1,"v":15},"end":{"b":"3John","c":1,"v":15}}}]}]]';
  t.deepEqual(actual, expected);
});

test('get-parse-data works in Spanish', t => {
  const actual = JSON.stringify([getParseData('2 Juan 1'), getParseData('2 Juan 1', {lang:'es'})]);
  const expected = '[[],[{"indices":[0,8],"refs":[{"context_used":"","osis":"2John.1.1","default":"2John.1.1","indices":[0,8],"validity":{"valid":true,"message":{},"start":{"b":"2John","c":1,"v":1},"end":{"b":"2John","c":1,"v":1}}}]}]]';
  t.deepEqual(actual, expected);
});

test('get-parse-data works in Spanish', t => {
  const actual = JSON.stringify([getParseData('2 João 1'), getParseData('2 João 1', {lang:'pt'})]);
  const expected = '[[],[{"indices":[0,8],"refs":[{"context_used":"","osis":"2John.1.1","default":"2John.1.1","indices":[0,8],"validity":{"valid":true,"message":{},"start":{"b":"2John","c":1,"v":1},"end":{"b":"2John","c":1,"v":1}}}]}]]';
  t.deepEqual(actual, expected);
});