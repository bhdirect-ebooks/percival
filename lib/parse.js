const getParseData = require('./get-parse-data.js');
const getMarkupData = require('./get-markup-data.js');

const parseText = (text, parse_opts, tag_opts) => {
  return getParseData(text, parse_opts)
    .reduce((a, b) => {
      return a.refs ? a.refs.concat(b.refs) : a.concat(b.refs);
    }, [])
    .reduceRight((b, a, i, arr) => {
      const b_index = arr.length - i - 1;
      return b.concat([getMarkupData(a, b[b_index].after_text, tag_opts)]);
    }, [{ after_text: text }])
    .slice(1);
}

const parseExplicit = (text, parse_opts) => {
  const tag_opts = {
    base_confidence: 10,
    type: 'explicit'
  }
  return parseText(text, parse_opts, tag_opts)
}

const parseWithContext = (text, context, parse_opts) => {
  parse_opts.context = context
  const tag_opts = {
    base_confidence: 7,
    type: 'context'
  }
  return parseText(text, parse_opts, tag_opts)
}

module.exports = { parseExplicit, parseWithContext}
