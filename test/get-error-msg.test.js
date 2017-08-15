'use strict'

const test = require('ava');
const getErrorMsg = require('../lib/get-error-msg.js');

const createErrObj = (start, end, key, val) => {
  const osis2bcv = (osis) => {
    const arr = osis.split('.');
    return {
      b: arr[0],
      c: (isNaN(parseInt(arr[1]))) ? arr[1] : parseInt(arr[1]),
      v: (isNaN(parseInt(arr[2]))) ? arr[2] : parseInt(arr[2]),
    }
  }
  return {
    valid: false,
    message: { [key]: val },
    start: osis2bcv(start),
    end: osis2bcv(end),
  }
}

test('interpret err: end_book_before_start', t => {
  const validity = createErrObj('Exod.8.1', 'Gen.10.1', 'end_book_before_start', true);
  const actual = getErrorMsg(validity);
  const expected = `Gen cannot follow Exod in a range.`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_book_not_exist', t => {
  const validity = createErrObj('Gen.1.1', 'Ps.151.1', 'end_book_not_exist', true);
  const actual = getErrorMsg(validity);
  const expected = `Ps doesn't exist in the given translation.`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_chapter_before_start', t => {
  const validity = createErrObj('Gen.50.1', 'Gen.1.1', 'end_chapter_before_start', true);
  const actual = getErrorMsg(validity);
  const expected = `Chapter 1 cannot follow chapter 50 in a range.`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_chapter_is_zero', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.0.0', 'end_chapter_is_zero', 1);
  const actual = getErrorMsg(validity);
  const expected = 'Sorry, there is no chapter zero.';
  t.deepEqual(actual, expected);
});

test('interpret err: end_chapter_not_exist_in_single_chapter_book', t => {
  const validity = createErrObj('Phlm.1.1', 'Phlm.2.1', 'end_chapter_not_exist_in_single_chapter_book', 1);
  const actual = getErrorMsg(validity);
  const expected = `Phlm has only one chapter`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_chapter_not_exist', t => {
  const validity = createErrObj('Gen.49.1', 'Gen.51.1', 'end_chapter_not_exist', 50);
  const actual = getErrorMsg(validity);
  const expected = `Gen has 50 chapters.`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_chapter_not_numeric', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.II.I', 'end_chapter_not_numeric', true);
  const actual = getErrorMsg(validity);
  const expected = 'Non-numeric chapter';
  t.deepEqual(actual, expected);
});

test('interpret err: end_verse_before_start', t => {
  const validity = createErrObj('Gen.1.2', 'Gen.1.1', 'end_verse_before_start', true);
  const actual = getErrorMsg(validity);
  const expected = `Verse 1 cannot follow verse 2 in a range.`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_verse_is_zero', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.1.0', 'end_verse_is_zero', 1);
  const actual = getErrorMsg(validity);
  const expected = 'Verse 0 does not exist.';
  t.deepEqual(actual, expected);
});

test('interpret err: end_verse_not_exist', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.1.99', 'end_verse_not_exist', 31);
  const actual = getErrorMsg(validity);
  const expected = `Gen 1 has 31 verses.`;
  t.deepEqual(actual, expected);
});

test('interpret err: end_verse_not_numeric', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.I.II', 'end_verse_not_numeric', true);
  const actual = getErrorMsg(validity);
  const expected = 'Non-numeric verse';
  t.deepEqual(actual, expected);
});

test('interpret err: start_book_not_defined', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.1.1', 'start_book_not_defined', true);
  const actual = getErrorMsg(validity);
  const expected = `Context confusion; somehow the book is separated from chapter and verse.`;
  t.deepEqual(actual, expected);
});

test('interpret err: start_book_not_exist', t => {
  const validity = createErrObj('Jude.1.1', 'Jude.1.2', 'start_book_not_exist', true);
  const actual = getErrorMsg(validity);
  const expected = `Jude doesn't exist in the given translation.`;
  t.deepEqual(actual, expected);
});

test('interpret err: start_chapter_is_zero', t => {
  const validity = createErrObj('Gen.0.1', 'Gen.1.1', 'start_chapter_is_zero', 1);
  const actual = getErrorMsg(validity);
  const expected = 'Sorry, there is no chapter zero.';
  t.deepEqual(actual, expected);
});

test('interpret err: start_chapter_not_exist_in_single_chapter_book', t => {
  const validity = createErrObj('Obad.2.1', 'Obad.3.1', 'start_chapter_not_exist_in_single_chapter_book', 1);
  const actual = getErrorMsg(validity);
  const expected = `Obad has only one chapter`;
  t.deepEqual(actual, expected);
});

test('interpret err: start_chapter_not_exist', t => {
  const validity = createErrObj('Gen.51.1', 'Gen.51.2', 'start_chapter_not_exist', 50);
  const actual = getErrorMsg(validity);
  const expected = `Gen has 50 chapters.`;
  t.deepEqual(actual, expected);
});

test('interpret err: start_chapter_not_numeric', t => {
  const validity = createErrObj('Gen.I.II', 'Gen.1.4', 'start_chapter_not_numeric', true);
  const actual = getErrorMsg(validity);
  const expected = 'Non-numeric chapter';
  t.deepEqual(actual, expected);
});

test('interpret err: start_verse_is_zero', t => {
  const validity = createErrObj('Gen.1.0', 'Gen.1.1', 'start_verse_is_zero', 1);
  const actual = getErrorMsg(validity);
  const expected = 'Verse 0 does not exist.';
  t.deepEqual(actual, expected);
});

test('interpret err: start_verse_not_exist', t => {
  const validity = createErrObj('Gen.1.32', 'Gen.2.1', 'start_verse_not_exist', 31);
  const actual = getErrorMsg(validity);
  const expected = `Gen 1 has 31 verses.`;
  t.deepEqual(actual, expected);
});

test('interpret err: start_verse_not_numeric', t => {
  const validity = createErrObj('Gen.I.II', 'Gen.1.4', 'start_verse_not_numeric', true);
  const actual = getErrorMsg(validity);
  const expected = 'Non-numeric verse';
  t.deepEqual(actual, expected);
});

test('interpret err: unknown error', t => {
  const validity = createErrObj('Gen.1.1', 'Gen.1.1', 'translation_unknown', 1);
  const actual = getErrorMsg(validity);
  const expected = 'Unknown error';
  t.deepEqual(actual, expected);
});
