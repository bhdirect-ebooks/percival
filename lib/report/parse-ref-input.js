const deepCopyTagRefs = require('../deep-copy-tag-refs')
const getErrorMsg = require('../get-error-msg')
const reduceErrors = require('../reduce-errors')
const tagInParens = require('../tag-paren-orphans')
const tagLocal = require('../tag-local-orphans')
const { idAltInSingleBlock } = require('../id-alternatives')
const { parseExplicit } = require('../parse')
const { toJSON, toXHTML } = require('../himalaya-io')

const checkRefsInHtml = (html_string, refs) => {
  let m
  const matches = []

  const regex = /data-ref="([^"]*?)"(?: id="([^"]+)")?/g

  while ((m = regex.exec(html_string)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push({ match: m[0], ref: m[1], id: m[2] })
  }

  for (const match of matches) {
    const markup_data = match.ref
      ? parseExplicit(match.ref, {
          vers: 'default',
          lang: 'en',
        })
      : []

    const ref_data = refs.hasOwnProperty(match.id)
      ? refs[match.id].data
      : { scripture: '' }

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
          ref_data.confirmed = typeof match.id === 'undefined'
        }
        if (ref_data.hasOwnProperty('message')) delete ref_data.message
      }
    }

    html_string = html_string.replace(
      match.match,
      `data-ref='${JSON.stringify(ref_data)}'`
    )
  }
  return html_string
}

const reparseWithContext = (
  context,
  html,
  refs,
  opts = { vers: 'default', lang: 'en' }
) => {
  let m
  const matches = []

  const regex = /<a data-ref="([^"]*?)"(?: id="([^"]+)")?[^>]*?>([^<]+)<\/a>/gi

  while ((m = regex.exec(html)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push({ match: m[0], ref: m[1], id: m[2], text: m[3] })
  }

  // remove existing unconfirmed refs
  for (const match of matches) {
    if (
      !refs[match.id].hasOwnProperty('confirmed') ||
      !refs[match.id].confirmed
    ) {
      html = html.replace(match.match, match.text)
    }
  }

  // add context tag
  html = `<hr data-parsing="${context}" />\n${html}`.replace(
    /parsing=&quot;([^>]+)&quot;/g,
    'parsing="$1"'
  )

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
