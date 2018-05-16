const { parseWithContext } = require('./parse.js')
const { getBooksInContext } = require('./book-regexps')
const {
  getLowest,
  getFinalMarkup,
  getErrCountsFromMarkup,
} = require('./utils.js')

const parseAndReplaceParenStrings = (text, paren_regex, opts) => {
  let ref_data = []

  const before_str = text.replace(paren_regex, '$1')
  const paren_ctxt = text.replace(paren_regex, '$2')
  const paren_str = text.replace(paren_regex, '$3')

  if (/\d:\d/.test(paren_str)) {
    const found_books = getBooksInContext(paren_ctxt)
    const parse_data_arr = found_books.map(b =>
      parseWithContext(paren_str, b, opts)
    )

    if (parse_data_arr.length === 1) {
      if (parse_data_arr[0].length > 0) {
        ref_data = parse_data_arr[0]
        text = text.replace(
          `${before_str}${paren_str}`,
          `${before_str}${getFinalMarkup(parse_data_arr[0])}`
        )
      }
    } else if (parse_data_arr.length > 1) {
      const err_cnts = parse_data_arr.map(parse_data => {
        if (parse_data.length > 0) {
          const markup = getFinalMarkup(parse_data)
          return getErrCountsFromMarkup(markup)
        } else {
          return 99
        }
      })
      const lowest_cnt = parseInt(getLowest(err_cnts))
      const best_index = err_cnts.lastIndexOf(lowest_cnt)

      if (parse_data_arr[best_index].length > 0) {
        ref_data = parse_data_arr[best_index]
        text = text.replace(
          `${before_str}${paren_str}`,
          `${before_str}${getFinalMarkup(parse_data_arr[best_index])}`
        )
      }
    }
  }
  return { data: ref_data, text }
}

const tagInParens = (html, opts) => {
  let data = []
  const paren_regex_part = /(?:[\])]|<\/a>|<(?:p|li|td)[^>]*?>)(([^\n\r<>]+?)[([])([abcdef+gpsv \d:;,.\\-\\-‒–—]+)/gi
  const paren_regex_full = new RegExp(
    `${paren_regex_part.source}(?=[)\\]]|<a data)`,
    'gi'
  )
  const paren_arr = html.match(paren_regex_full)

  if (paren_arr) {
    paren_arr.forEach(text => {
      const ref_data = parseAndReplaceParenStrings(text, paren_regex_part, opts)
      if (ref_data.data.length > 0) {
        data = data.concat(ref_data.data)
        html = html.replace(text, ref_data.text)
      }
    })
  }
  return { data, html }
}

module.exports = tagInParens
