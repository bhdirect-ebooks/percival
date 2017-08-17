'use strict'

const getParseData = require('./get-parse-data.js');
const getMarkupData = require('./get-markup-data.js');

const parseExplicit = (text, parse_opts) => {
  const tag_opts = {
    base_confidence: 10,
    type: 'explicit'
  }

  return getParseData(text, parse_opts)
    .reduce((a, b) => {
      return (a.refs) ? a.refs.concat(b.refs) : a.concat(b.refs);
    }, [])
    .reduceRight((b, a, i, arr) => {
      const b_index = arr.length - i - 1;
      return b.concat([(getMarkupData(a, b[b_index].after_text, ref_opts))]);
    }, [{ after_text: text }])
    .slice(1);
}

module.exports = parseExplicit;