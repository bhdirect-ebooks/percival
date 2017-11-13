const { parseExplicit } = require('../parse')
const getErrorMsg = require('../get-error-msg')


const parseRefInput = html_string => {
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

module.exports = parseRefInput
