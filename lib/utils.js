const he = require('he')

const cleanupNameChanges = html => {
  return html
    .replace(/<!-- x(\w+)x ~ \w+ -->\w+/g, '$1')
    .replace(/<!-- x(\w+)x ~ \w+ -->(<a [^>]+>)\w+/g, '$2$1')
  //.replace(/<!-- xx ~ \w+ -->(<a [^>]+>)\w+ /g, '$1')
}

const decodeSafeEntities = html => {
  return html.replace(/&[^;]+;/gim, match => {
    if (
      !/^&(?:lt|gt|nbsp|quot|a(?:mp|pos)|#(?:6[02]|160|x(?:3[CE]|A0|2[267])|3[489]));$/.test(
        match
      )
    ) {
      match = he.decode(match)
    }
    return match
  })
}

const getLowest = arr => arr.reduce((a, b) => (a <= b ? a : b))

const getFinalMarkup = ref_data_arr =>
  ref_data_arr[ref_data_arr.length - 1].after_text

const getErrCountForBook = (b, text) => {
  const b_err_regex = new RegExp(`"scripture":"${b}[^}]+"message":`, 'g')
  return b_err_regex.test(text) ? text.match(b_err_regex).length : 0
}

const getErrCountsFromMarkup = html => {
  const tag_cnt = /data-ref/.test(html) ? html.match(/data-ref/g).length : 0
  const err_cnt = /"message":/.test(html) ? html.match(/"message":/g).length : 0
  return tag_cnt > 0 ? err_cnt : 99
}

module.exports = {
  cleanupNameChanges,
  decodeSafeEntities,
  getLowest,
  getFinalMarkup,
  getErrCountForBook,
  getErrCountsFromMarkup,
}
