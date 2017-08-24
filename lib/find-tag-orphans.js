const escapeRegExp = require('lodash.escaperegexp')
const isEmpty = require('lodash.isempty')
const { parseWithContext } = require('./parse.js')


const getFinalMarkup = (ref_data_arr) => {
  return ref_data_arr[ref_data_arr.length - 1].after_text
}

const orphan_regexps = [ // order matters!
  /\b((?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)([\d,; ]+)?\d+(?:[a-f]|\.|)(?:[:\\-\\-‒–—]\d+(?:[a-f]|)|f+|[:\\-\\-‒–—][\\-\\-‒–—\s;,\d:]+\d+)(?:[a\\-f]|\.|)([\d,; ]+)?(?!["\\-\\-‒–—]|:\d))/gi,
  /\b(ch(?:\.|s\.?|a(?:\.|s\.?|p(?:\.|s\.?|t(?:\.|s\.?|ers?)?)?)?)?([\d, ]+)?\d+(?:[\\-\\-‒–—]| and )([\d,; ]+)?\b(?!["\\-\\-‒–—]|:\d))/gi,
  /\b(ch(?:\.|a(?:\.|p(?:\.|t(?:\.|er)?)?)?)? ?\d([\d,; ]+)?)\b(?!["\\-\\-‒–—]|:\d)/gi,
  /\b(?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?) ?\d([\d,; ]+)?(?:[a-f]|\.|)\b(?!["\\-\\-‒–—]|:\d)/gi,
  // chap:vers-chap:vers
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|)[\\-\\-‒–—](?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|)\b([\d,; ]+)?(?:[a\\-f]|\.|)\b(?!["\\-\\-‒–—]|:\d)/g,
  // chap:vers(-vers)?
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|)([\\-\\-‒–—](?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a\\-f]|))?\b([\d,; ]+)?(?:[a\\-f]|\.|)\b(?!["\\-\\-‒–—]|:\d)/g
]

const parseAndReplaceMatches = (regex, the_string, context, opts) => {
  let m
  let matches = []
  let ref_data = {}

  while ((m = regex.exec(the_string)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++
    matches.push(m[0])
  }

  for (let match of matches) {
    match = match.trim()
    ref_data = parseWithContext(match, context, opts)
    const matcher = new RegExp(`${escapeRegExp(match)}(?!</a>|[\\-\\-‒–—]|[a-f]|:?\\d)`)

    if (ref_data.length > 0) {
      the_string = the_string.replace(matcher, getFinalMarkup(ref_data))
    } else {
      ref_data.ref_data = {
        context_used: '',
        osis: '',
        default: '',
        indices: [],
        validity: {}
      }
      ref_data.before_text = the_string
      ref_data.after_text = the_string.replace(matcher, `<a data-cross-ref='{"scripture":"","message":"No context."}'>${match}</a>`)
      the_string = ref_data.after_text
    }
  }

  return { data: ref_data, text: the_string }
}

const findAndTagOrphans = (text, context, opts) => {
  let data = []

  for (const ref_regex of orphan_regexps) {
    const ref_data = parseAndReplaceMatches(ref_regex, text, context, opts)
    if (!isEmpty(ref_data.data)) {
      data = data.concat(ref_data.data)
      text = ref_data.text
    }
  }

  return { data, text }
}

module.exports = findAndTagOrphans
