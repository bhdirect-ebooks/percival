const { getLowest, getFinalMarkup, getErrCountsFromMarkup } = require('./utils.js')
const { parseWithContext } = require('./parse.js')
const uniq = require('lodash.uniq')


const handleBadHtml = html => {
  const nested_a_tags = /(<a[^>]+>[^<>\n]*?)<a[^>]+>([^<>\n]*?)<\/a>([^<>\n]*?<\/a>)/g
  html = html.replace(nested_a_tags, '$1$2$3')
  return nested_a_tags.test(html) ? handleBadHtml(html) : html
}

const handleRangeErrors = html => html
  .replace(/(<a data-ref='{"scripture":"","valid":false,[^}]*?}'>[^<]+)<\/a>([-‒–—-])<a[^>]*?>([^<]+<\/a>)/g, '$1$2$3')

const reduceErrors = (html, opts) => {
  const orphan_group_regex = /<a data-ref='{"scripture":"[^"]+"[^}]*?}'>[\d\-‒–—\- ,;.:]+<\/a>([^\w\n\r]+<a data-ref='{"scripture":"[^"]+"[^}]*?}'>[\d\-‒–—\- ,;.:]+<\/a>)*/g

  html = handleBadHtml(html)
  html = handleRangeErrors(html)

  if (orphan_group_regex.test(html)) {
    const matches = html.match(orphan_group_regex)
    const b_regex = /"scripture":"([^.]+)\./g
    matches.forEach(group => {
      const group_books = uniq(group.match(b_regex).map(b_string => b_string.replace(b_regex, '$1')))
      if (group_books.length > 1) {
        const err_cnts = group_books.map(b => {
          const untag_group = group.replace(/<a[^>]+>([^<]+)<\/a>/g, '$1')
          const ref_data = parseWithContext(untag_group, b, opts)
          return ref_data.length > 0 ? getErrCountsFromMarkup(getFinalMarkup(ref_data)) : 99
        })
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
