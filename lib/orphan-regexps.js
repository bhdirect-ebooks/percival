const verse_indicator =
  '(?:c\\.?f\\.?|v(?:\\.|er(?:\\.|s(?:\\.|es?)?)?|(?:[sv](?:\\.|s\\.?)?))?)';

const chapter_indicator =
  'ch(?:\\.|s\\.?|a(?:\\.|s\\.?|p(?:\\.|s\\.?|t(?:\\.|s\\.?|ers?)?)?)?)?';

const number = '([\\d,; ]+)';

// verse_range and chapter_range are repeating groups (if additional ranges
// appear after a range, we want to match on all of them together)
const verse_range = '((?:[\\d,; \\-\\-‒–—]+|and|to|\\d+[abcdef+]?\\.?|))+';

const chapter_range = '((?:[\\d,; \\-\\-‒–—]+|and \\d+|to \\d+))+';

const end = '\\b(?!["\\-\\-‒–—]|:\\d)';

const verse =
  '(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[abcdef+]\\.?)?';

const chapter_verse = `(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):${verse}`;

const connector = '[-\\-‒–—]';

const group_end = `\\b(([\\d,:; [\\]()\\-\\-‒–—]+)?(?:[abcdef+]\\.?|\\.)?)+${end}`;

const getRegex = (pattern, opts = 'g') => new RegExp(`\\b${pattern}`, opts);

const orphan_regexps = [
  // order matters!
  // verse range(s)
  getRegex(`(${verse_indicator}${number}${verse_range})${end}`, 'gi'),
  // chapter range(s)
  getRegex(`(${chapter_indicator}${number}?${chapter_range})${end}`, 'gi'),
  // chap:vers-chap:vers with group
  getRegex(`${chapter_verse}${connector}${chapter_verse}${group_end}`),
  // chap:vers-vers with group
  getRegex(`${chapter_verse}${connector}${verse}${group_end}`),
  // chap:vers with group
  getRegex(`${chapter_verse}${group_end}`)
];

module.exports = orphan_regexps;
