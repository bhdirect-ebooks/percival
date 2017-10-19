const escapeRegExp = require('lodash.escaperegexp')


const getLowest = arr => arr.reduce((a, b) => a <= b ? a : b)

const getFinalMarkup = (ref_data_arr) => ref_data_arr[ref_data_arr.length - 1].after_text

const handleBadHtml = html => {
  const nested_a_tags = /(<a[^>]+>[^<>\n]*?)<a[^>]+>([^<>\n]*?)<\/a>([^<>\n]*?<\/a>)/g
  html = html.replace(nested_a_tags, '$1$2$3')
  return nested_a_tags.test(html) ? handleBadHtml(html) : html
}

const getErrCountForBook = (b, text) => {
  const b_err_regex = new RegExp(escapeRegExp(`"scripture":"${b}[^\\n}]+"message":`), 'g')
  return b_err_regex.test(text) ? text.match(b_err_regex).length : 0
}

const getErrCountsFromRefData = ref_data => {
  const err_cnt = /"message":/.test(ref_data.text) ? ref_data.text.match(/"message":/g).length : 0
  return ref_data.data.length > 0 ? err_cnt : 99
}

module.exports = { getLowest
                 , getFinalMarkup
                 , handleBadHtml
                 , getErrCountForBook
                 , getErrCountsFromRefData
                 }