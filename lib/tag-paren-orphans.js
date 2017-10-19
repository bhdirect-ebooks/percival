const { parseWithContext } = require('./parse.js')
const { getBooksInContext } = require('./book-regexps')
const { getLowest, getErrCountsFromRefData } = require('./utils.js')

const tagInParens = (html, opts) => {
  const data = []
  const paren_regex = /(?:<\/a>|<(?:p|li|td)[^>]*?>)((.*?)[([])([abcdefsv \d:;,.\\-\\-‒–—]+)(?:[)\]]|<a data-cross)/gi
  const paren_arr = html.match(paren_regex)

  const getBetterContext = text => {
    text = text.replace(paren_regex, '$2')
    return text.includes('</a>') ? getBetterContext(text) : text
  }

  if (paren_arr) {
    paren_arr.forEach(text => {
      const before_str = text.replace(paren_regex, '$1')
      const paren_str = text.replace(paren_regex, '$3')

      let paren_ctxt = text.replace(paren_regex, '$2')
      if (paren_ctxt.includes('</a>')) paren_ctxt = getBetterContext(paren_ctxt)

      const found_books = getBooksInContext(paren_ctxt)
      const ref_data_arr = found_books.map(b => parseWithContext(paren_str, b, opts))

      if (ref_data_arr.length === 1) {
        if (ref_data_arr[0].data.length > 0) {
          data.push(ref_data_arr[0].data)
          html = html.replace(`${before_str}${paren_str}`, `${before_str}${ref_data_arr[0].text}`)
        }
      } else if (ref_data_arr.length > 1) {
        const err_cnts = ref_data_arr.map(ref_data => getErrCountsFromRefData(ref_data))
        const lowest_cnt = parseInt(getLowest(err_cnts))
        const best_index = err_cnts.lastIndexOf(lowest_cnt)

        if (ref_data_arr[best_index].data.length > 0) {
          data.push(ref_data_arr[best_index].data)
          html = html.replace(`${before_str}${paren_str}`, `${before_str}${ref_data_arr[best_index].text}`)
        }
      }
    })
  }
  return { data, html }
}

module.exports = tagInParens
