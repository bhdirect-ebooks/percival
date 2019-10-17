const { parse, stringify } = require('himalaya')
const { correctXHTML, decodeSafeEntities } = require('./utils')

const prepHTML = html => {
  return decodeSafeEntities(html)
    .replace(/\bMc\b/g, '<!-- xMcx ~ Mic -->Mic')
    .replace(/\bWsd\b/g, '<!-- xWsdx ~ Wis -->Wis')
    .replace(/\b(Canticles|Cant)\.?(?= \d)/g, '<!-- x$1x ~ Song -->Song')
    .replace(/\bvers\.?(?= \d)/g, '<!-- xversx ~ vv -->vv')
}

const toJSON = html => parse(prepHTML(html))

const toXHTML = json => {
  return correctXHTML(stringify(json))
}

module.exports = { toJSON, toXHTML }
