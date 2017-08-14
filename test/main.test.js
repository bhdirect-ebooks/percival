'use strict'

/*const fs = require('fs');
const path = require('path');*/
const test = require('tape');
const main = require('../index.js');

test('main exists', t => {
  const actual = main('test');
  const expected = 'test';
  t.deepEqual(actual, expected);
  t.end();
});