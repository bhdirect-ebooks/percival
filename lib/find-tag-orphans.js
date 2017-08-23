const escapeRegExp = require('lodash.escaperegexp')
const { parseWithContext } = require('./parse.js')


const getFinalMarkup = (ref_data_arr) => {
  return ref_data_arr[ref_data_arr.length - 1].after_text
}

const orphan_regexps = [ // order matters!
  /\b((?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)([\d, ]+)?\d+(?:[a\\-f]|\.|)(?:[:\\-\\-‒–—]\d+(?:[a\\-f]|)|f+|[:\\-\\-‒–—][\\-\\-‒–—\s;,\d:]+\d+)(?:[a\\-f]|\.|)([\d, ]+)?(?![":\\-\\-‒–—]))/gi,
  /\b(ch(?:\.|s\.?|a(?:\.|s\.?|p(?:\.|s\.?|t(?:\.|s\.?|ers?)?)?)?)?\s?\d+(?:[\\-\\-‒–—]| and )\d+\b(?![":\\-\\-‒–—]))/gi,
  /\b(ch(?:\.|a(?:\.|p(?:\.|t(?:\.|er)?)?)?)?([\d, ]+)?)\b(?![":\\-\\-‒–—])/gi,
  /\b(?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)([\d, ]+)?(?:[a\\-f]|\.|)\b(?![":\\-\\-‒–—])/gi,
  // chap:vers-chap:vers
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|)[\\-\\-‒–—](?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|)\b/g,
  // chap:vers(-vers)?
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|)([\\-\\-‒–—](?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|))?\b/g
]

const parseAndReplaceMatches = (regex, the_string, context, opts) => {
  let m
  let matches = []
  let ref_data

  while ((m = regex.exec(the_string)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++
    matches.push(m[0])
  }

  for (const match of matches) {
    ref_data = parseWithContext(match, context, opts)
    if (ref_data.length > 0) {
      the_string = the_string.replace(new RegExp(`${escapeRegExp(match)}(?!</a>|:)`), getFinalMarkup(ref_data))
    }
  }

  return ref_data ? { data: ref_data, text: the_string } : the_string
}

const findAndTagOrphans = (text, context, opts) => {
  let data = []

  for (const ref_regex of orphan_regexps) {
    const ref_data = parseAndReplaceMatches(ref_regex, text, context, opts)
    if (typeof ref_data === 'object') {
      data = data.concat(ref_data.data)
      text = ref_data.text
    }
  }

  return { data, text }
}

module.exports = findAndTagOrphans
