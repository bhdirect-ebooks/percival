const findAndTagOrphans = require('./find-tag-orphans')
const { getBooksInContext } = require('./book-regexps')
const lastIndexOf = require('lodash.lastindexof')


const getLowest = arr => arr.reduce((a, b) => a <= b ? a : b)

const tagInParens = (html, opts) => {
  const data = []
  const paren_regex = /(?:<\/a>|<(?:p|li|td)[^>]*?>)(.*?)[([]([abcdef \d:;,\\-\\-‒–—]+)[)\]]/gi
  const paren_arr = html.match(paren_regex)

  if (paren_arr) {
    paren_arr.forEach(text => {
      const paren_ctxt = text.replace(paren_regex, '$1')
      const paren_str = text.replace(paren_regex, '$2')
      const found_books = getBooksInContext(paren_ctxt)

      const ref_data_arr = found_books.map(b => findAndTagOrphans(paren_str, b, opts))

      if (ref_data_arr.length === 1) {
        if (ref_data_arr[0].data.length > 0) {
          data.push(ref_data_arr[0].data)
          html = html.replace(paren_str, ref_data_arr[0].text)
        }
      } else if (ref_data_arr.length > 1) {
        const err_cnts = ref_data_arr.map(ref_data => {
          const err_cnt = /"message":/.test(ref_data.text) ? ref_data.text.match(/"message":/g).length : 0
          return ref_data.data.length > 0 ? err_cnt : 99
        })
        const lowest_cnt = parseInt(getLowest(err_cnts))
        const best_index = lastIndexOf(err_cnts, lowest_cnt)

        if (ref_data_arr[best_index].data.length > 0) {
          data.push(ref_data_arr[best_index].data)
          html = html.replace(paren_str, ref_data_arr[best_index].text)
        }
      }
    })
  }
  return { data, html }
}

module.exports = tagInParens
