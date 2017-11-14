const deepCopyTagRefs = require('../deep-copy-tag-refs')
const getErrorMsg = require('../get-error-msg')
const reduceErrors = require('../reduce-errors')
const tagInParens = require('../tag-paren-orphans')
const tagLocal = require('../tag-local-orphans')
const { idAltInSingleBlock } = require('../id-alternatives')
const { parseExplicit } = require('../parse')
const { toJSON, toXHTML } = require('../himalaya-io')


const checkRefsInHtml = html_string => {
  let m
  let matches = []

  const regex = /(data-cross-(?:context|ref))='({"scripture":[^}]+})'/gi

  while ((m = regex.exec(html_string)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push({ match: m[0], attr: m[1], data: m[2] })
  }

  for (const match of matches) {
    const ref_data = JSON.parse(match.data)
    const markup_data = parseExplicit(ref_data.scripture, { vers: 'default', lang: 'en' })

    if (markup_data.length > 0) {
      const norm_ref = markup_data[0].ref_data.osis

      if (!markup_data[0].ref_data.validity.valid) {
        ref_data.scripture = ''
        ref_data.valid = false
        ref_data.message = getErrorMsg(markup_data[0].ref_data.validity)
        if (ref_data.hasOwnProperty('confirmed')) delete ref_data.confirmed
        if (ref_data.hasOwnProperty('possible')) delete ref_data.possible
      } else {
        ref_data.scripture = norm_ref
        if (!ref_data.hasOwnProperty('valid') || !ref_data.valid) {
          ref_data.valid = true
          ref_data.confirmed = true
        }
        if (ref_data.hasOwnProperty('message')) delete ref_data.message
      }

      html_string = html_string.replace(match.match, `${match.attr}='${JSON.stringify(ref_data)}'`)
    }
  }
  return html_string
}

const reparseWithContext = (context, html, opts = { vers: 'default', lang: 'en' }) => {
  let m
  let matches = []

  const regex = /<a data-cross-ref='({"scripture":[^}]+})'>([^<]+)<\/a>/gi

  while ((m = regex.exec(html)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push({ match: m[0], data: m[1], text: m[2] })
  }

  // remove existing unconfirmed refs
  for (const match of matches) {
    const ref_data = JSON.parse(match.data)

    if (!ref_data.hasOwnProperty('confirmed') || !ref_data.confirmed) {
      html = html.replace(match.match, match.text)
    }
  }

  const ctxt_data = { parsing: context }

  // add context tag
  html = `<hr data-cross-context='${JSON.stringify(ctxt_data)}' />\n${html}`
    .replace(/&quot;parsing&quot;:&quot;([^}]+)&quot;/g, '"parsing":"$1"')

  // tag explicit refs
  const { tagged } = deepCopyTagRefs(toJSON(html), 'explicit', opts)
  html = toXHTML(tagged)

  // tag parenthetical orphans
  const paren = tagInParens(html, opts)
  html = reduceErrors(paren.html, opts)

  // tag orphans using given context
  const remote = deepCopyTagRefs(toJSON(html), 'context', opts)
  html = reduceErrors(toXHTML(remote.tagged), opts)

  // locate and tag remaining orphans
  const local = tagLocal(html, opts)
  html = reduceErrors(local.html, opts)

  // id and tag all possible ref alternatives
  html = idAltInSingleBlock(html, opts)

  return reduceErrors(html, opts)
}

module.exports = { checkRefsInHtml, reparseWithContext }
