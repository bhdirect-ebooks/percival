'use strict'

/*const fs = require('fs');
const path = require('path');*/
const test = require('ava');
const main = require('../index.js');

test('main exists', t => {
  const actual = main('test');
  const expected = 'test';
  t.deepEqual(actual, expected);
});