'use strict'

const test = require('ava');
const assignConfidence = require('../lib/assign-confidence.js');

test('assign-confidence exists', t => {
  t.pass(true);
});

test('confidence for "Is " with explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,142]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 7);
});

test('confidence for "is " with explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,142]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; is 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 2);
});

test('confidence for "is " with explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,143]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; is. 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 2);
});

test('confidence for "act" with explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,143]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; act 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 6);
});

test('confidence for "Book word number" with explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,151]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Gen morning 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 3);
});

test('confidence for "Book chapter number" with explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,148]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Gen chap 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 10);
});

test('confidence for explicit type', t => {
  const ref_data = JSON.parse(`{"indices":[134,143]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Gen 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'explicit');
  t.is(actual, 10);
});

test('confidence for other type', t => {
  const ref_data = JSON.parse(`{"indices":[134,143]}`);
  const before = "The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Gen 46:10; ";
  const actual = assignConfidence(ref_data, before, 10, 'whatever');
  t.is(actual, 10);
});
