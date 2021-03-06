const escapeRegExp = require('lodash.escaperegexp')
const { getFinalMarkup } = require('./utils')
const { parseWithContext } = require('./parse')

const orphan_regexps = [
  // order matters!
  // verse range(s)
  // /\b((?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)([\d,; ]+)?\d+(?:[abcdef]|\.|)(?:[:\\-\\-‒–—]\d+[abcdef]?|f+|[:\\-\\-‒–—][\\-\\-‒–—\s;,\d:]+\d+| and )+(?:[abcdef]|\.|)([\\-\\-‒–—\s;,\d]+)?(?!["\\-\\-‒–—]|:\d| and ))/gi,
  /\b((?:c\.?f\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)([\d,; ]+)((?:[\d,; \\-\\-‒–—]+|and|to|\d+[abcdef+]?\.?|))+)\b(?!["\\-\\-‒–—]|:\d)/gi,
  // chapter range(s)
  // /\b(ch(?:\.|s\.?|a(?:\.|s\.?|p(?:\.|s\.?|t(?:\.|s\.?|ers?)?)?)?)?([\d, ]+)?\d+(?:[\\-\\-‒–—]| and )([\d,; ]+)?\b(?!["\\-\\-‒–—]|:\d| and ))/gi,
  /\b(ch(?:\.|s\.?|a(?:\.|s\.?|p(?:\.|s\.?|t(?:\.|s\.?|ers?)?)?)?)?([\d,; ]+)?((?:[\d,; \\-\\-‒–—]+|and \d+|to \d+))+)\b(?!["\\-\\-‒–—]|:\d)/gi,
  // single chapter or list of singles
  // /\b(ch(?:\.|a(?:\.|p(?:\.|t(?:\.|er)?)?)?)? ?\d([\d,; ]+)?)\b(?!["\\-\\-‒–—]|:\d)/gi,
  // single verse or list of singles
  // /\b(?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?) ?\d([\d,;: ]+)?(?:[abcdef]|\.|)\b(?!["\\-\\-‒–—]|:\d)/gi,
  // chap:vers-chap:vers with group
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[abcdef+]\.?)?[\\-\\-‒–—](?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[abcdef+]\.?)?\b(([\d,;: [\]()\\-\\-‒–—]+)?(?:[abcdef+]\.?|\.)?)+\b(?!["\\-\\-‒–—]|:\d)/g,
  // chap:vers-vers with group
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[abcdef+]\.?)?[\\-\\-‒–—](?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[abcdef+]\.?)?\b(([\d,:; [\]()\\-\\-‒–—]+)?(?:[abcdef+]\.?|\.)?)+\b(?!["\\-\\-‒–—]|:\d)/g,
  // chap:vers with group
  /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[abcdef+]\.?)?\b(([\d,;: [\]()\\-\\-‒–—]+)?(?:[abcdef+]\.?|\.)?)+\b(?!["\\-\\-‒–—]|:\d)/g,
]

const tagNoContext = (the_string, match, matcher) => {
  const notation = /^(?:(?:v\b|v\w+)|(?:ch\b|ch\w+))/i
  const insert = notation.test(match) ? match.match(notation)[0] : ''
  const match_parts = match.split(/(?:, |; ?| and )/)
  const replacer = match_parts
    .reduce((acc, x, i) => {
      return x && /\d/.test(x)
        ? acc.replace(
            x,
            `${
              i === 0 || insert === '' ? '' : '<!-- xx ~ ' + insert + ' -->'
            }<a data-ref='{"scripture":"","message":"No context."}'>${
              i === 0 || insert === '' ? '' : insert + ' '
            }${x}</a>`
          )
        : acc
    }, match)
    .replace(
      `<<a data-ref='{"scripture":"","message":"No context."}'>a</a>`,
      '<a'
    )
  return {
    ref_data: {
      context_used: '',
      osis: '',
      default: '',
      indices: [],
      validity: {},
    },
    before_text: the_string,
    after_text: the_string.replace(matcher, replacer),
  }
}

const parseAndReplaceMatches = (regex, the_string, context, opts) => {
  let m
  const matches = []
  let ref_data = []

  while ((m = regex.exec(the_string)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++
    matches.push(m[0])
  }

  for (let match of matches) {
    if (/\d/.test(match)) {
      match = match.trim().replace(/\W+$/, '')
      ref_data = parseWithContext(match, context, opts)
      const matcher = new RegExp(
        `${escapeRegExp(
          match
        )}(?!</a>|\\W</a>|[\\-\\-‒–—]| ?[abcdef]\b| ?f+\b|[.:]?\\d| and \\d|, \\d{1,3}</a>)`
      )

      if (ref_data.length > 0) {
        the_string = the_string.replace(matcher, getFinalMarkup(ref_data))
      } else {
        ref_data.push(tagNoContext(the_string, match, matcher))
        the_string = ref_data[0].after_text
      }
    }
  }

  return { data: ref_data, text: the_string }
}

const findAndTagOrphans = (text, context, opts) => {
  let data = []

  for (const ref_regex of orphan_regexps) {
    const ref_data = parseAndReplaceMatches(ref_regex, text, context, opts)
    if (ref_data.data.length > 0) {
      data = data.concat(ref_data.data)
      text = ref_data.text
    }
  }

  return { data, text }
}

module.exports = findAndTagOrphans
