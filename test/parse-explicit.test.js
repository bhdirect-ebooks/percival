'use strict'

const test = require('tape');
const parseExplicit = require('../lib/parse-explicit.js');

test('parse-explicit exists', t => {
  t.assert(true);
  t.end();
});

test('parse-explicit returns what we need', t => {
  const actual = parseExplicit(`The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter.`);
  const expected = 'test';
  t.deepEqual(actual, expected);
  t.end();
});