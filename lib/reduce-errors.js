const escapeRegExp = require('lodash.escaperegexp')
const { parseWithContext } = require('./parse.js')
const uniq = require('lodash.uniq')


const getLowest = arr => arr.reduce((a, b) => a <= b ? a : b)

const getFinalMarkup = (ref_data_arr) => ref_data_arr[ref_data_arr.length - 1].after_text

const handleBadHtml = (html) => {
  const nested_a_tags = /(<a[^>]+>[^<>\n]*?)<a[^>]+>([^<>\n]*?)<\/a>([^<>\n]*?<\/a>)/g
  html = html.replace(nested_a_tags, '$1$2$3')
  return nested_a_tags.test(html) ? handleBadHtml(html) : html
}

const getErrCountForBook = (b, text) => {
  const b_err_regex = new RegExp(escapeRegExp(`"scripture":"${b}[^\\n}]+"message":`), 'g')
  return b_err_regex.test(text) ? text.match(b_err_regex).length : 0
}

const reduceErrors = (html, opts) => {
  const orphan_group_regex = /<a data-cross-ref='{"scripture":"[^}]*?}'>[\d\-‒–—\- ,;.:]+<\/a>([^\w\n\r]+<a data-cross-ref='{"scripture":"[^}]*?}'>[\d\-‒–—\- ,;.:]+<\/a>)*/g

  html = handleBadHtml(html)

  if (orphan_group_regex.test(html)) {
    const matches = html.match(orphan_group_regex)
    const b_regex = /"scripture":"[^.]+\./g
    matches.forEach(group => {
      const group_books = uniq(group.match(b_regex))
      if (group_books.length > 1) {
        const err_cnts = group_books.map(b => getErrCountForBook(b, group))
        const lowest_cnt = parseInt(getLowest(err_cnts))
        const best_index = err_cnts.indexOf(lowest_cnt)
        const untag_group = group.replace(/<a[^>]+>([^<]+)<\/a>/g, '$1')
        const ref_data = parseWithContext(untag_group, group_books[best_index], opts)

        if (ref_data.length > 0) {
          html = html.replace(group, getFinalMarkup(ref_data))
        }
      }
    })
  }

  return html
}

module.exports = reduceErrors
