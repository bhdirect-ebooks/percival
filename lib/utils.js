const escapeRegExp = require('lodash.escaperegexp')


const getLowest = arr => arr.reduce((a, b) => a <= b ? a : b)

const getFinalMarkup = ref_data_arr => ref_data_arr[ref_data_arr.length - 1].after_text

const getErrCountForBook = (b, text) => {
  const b_err_regex = new RegExp(escapeRegExp(`"scripture":"${b}[^\\n}]+"message":`), 'g')
  return b_err_regex.test(text) ? text.match(b_err_regex).length : 0
}

const getErrCountsFromMarkup = html => {
  const tag_cnt = /data-cross-ref/.test(html) ? html.match(/data-cross-ref/g).length : 0
  const err_cnt = /"message":/.test(html) ? html.match(/"message":/g).length : 0
  return tag_cnt > 0 ? err_cnt : 99
}

module.exports = { getLowest
                 , getFinalMarkup
                 , getErrCountForBook
                 , getErrCountsFromMarkup
                 }