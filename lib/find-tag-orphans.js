const escapeRegExp = require('lodash.escaperegexp')
const orphan_regexps = require('./orphan-regexps')
const { getFinalMarkup } = require('./utils')
const { parseWithContext } = require('./parse')

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
        )}(?!</a>|\\W</a>|[-\\-‒–—]| ?[abcdef]\\b| ?f+\\b|[.:]?\\d| and \\d|, \\d{1,3}</a>)`
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
