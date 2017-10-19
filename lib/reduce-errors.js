const { getLowest, getFinalMarkup, handleBadHtml, getErrCountForBook } = require('./utils.js')
const { parseWithContext } = require('./parse.js')
const uniq = require('lodash.uniq')


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
