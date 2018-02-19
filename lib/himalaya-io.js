const himalaya = require('himalaya')
const { toHTML } = require('himalaya/translate')
const { decodeSafeEntities } = require('./utils')

const prepHTML = (html) => {
  return decodeSafeEntities(html)
    .replace(/\bMc\b/g, '<!-- xMcx ~ Mic -->Mic')
    .replace(/\bWsd\b/g, '<!-- xWsdx ~ Wis -->Wis')
    .replace(/\b(Canticles|Cant)\.?(?= \d)/g, '<!-- x$1x ~ Song -->Song')
    .replace(/\bvers\.?(?= \d)/g, '<!-- xversx ~ vv -->vv')
}

const toJSON = html => himalaya.parse(prepHTML(html))

const toXHTML = json => {
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
