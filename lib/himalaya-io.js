const he = require('he')
const himalaya = require('himalaya')
const toHTML = require('himalaya/translate').toHTML

const prepHTML = (html) => {
  return html
    .replace(/&[^;]+;/gmi, (match) => {
      if (!/^&(?:lt|gt|nbsp|quot|a(?:mp|pos)|#(?:6[02]|160|x(?:3[CE]|A0|2[267])|3[489]));$/.test(match)) {
        match = he.decode(match)
      }
      return match
    })
    .replace(/\bMc\b/g, 'Mic')
    .replace(/\bWsd\b/g, 'Wis')
}

const toJSON = (html) => {
  return himalaya.parse(prepHTML(html))
}

const toXHTML = (json) => {
  return toHTML(json)
    .replace(/<\?xml.*?>/, '<?xml version="1.0" encoding="UTF-8" standalone="no"?>')
    .replace('</?xml>', '')
    .replace('!doctype', '!DOCTYPE')
    .replace(/([a-z:]+=)'([^']+)'/gi, '$1"$2"')
    .replace(/<(link|hr|img|source)([^>]+)>/gi, '<$1$2 />')
    .replace(/<br>/gi, '<br />')
    .replace(/<video(.*?)controls(.*?)>/gi, '<video$1controls="controls"$2>')
    .replace(/(data-cross[a-z\\-]+)="\{(.*?)\}"/gi, '$1=\'{$2}\'')
    .replace(/alt="0"/gi, 'alt=""')
    .replace(/(<span (?:epub:type="pagebreak"|data-cross-context)[^>]+)><\/span>/gi, '$1 />')
    .replace(/(>[^<>\n]*?)&(?!#)([^<>\n]*?<)/g, '$1&#38;$2')
}

module.exports = { toJSON, toXHTML }
