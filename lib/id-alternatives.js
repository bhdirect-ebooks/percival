const { getBookPatterns, getParseData } = require('./get-parse-data')
const { parseWithContext } = require('./parse.js')
const uniq = require('lodash.uniq')

const getBlocks = (html) => {
  const regex = /<(figcaption|h[123456]|[uod]l|aside|table|p|blockquote)[^>]*?>[\s\S]+<\/\1>/g
  return html.match(regex)
}

const getRefTagData = (attr) => {
  const regex = /<a data-cross-ref='({"scripture"[^>]+})'.*?$/
  return JSON.parse(attr.replace(regex, '$1'))
}

const getBooksInContext = (html, opts) => {
  return getBookPatterns(opts)
    .map(book => {
      return book.regexp.text(html) ? book.osis : []
    })
    .reduce((a, b) => {
      return a.concat(b)
    })
}

const getProvidedContext = (html, opts) => {
  const regex = /<a data-cross-context='{"(?:scripture|parsing)":"([^"]+)"}'/g
  const matches = html.match(regex)

  if (matches && matches.length > 0) {
    return matches
      .map(match => {
        return match.replace(regex, '$1')
      })
      .map(value => {
        return /^\w+$/.test(value) ? value : getParseData(value, opts).validity.start.b
      })
  } else {
    return []
  }
}

const getValidAlternates = (context_arr, ref, opts) => {
  return context_arr
    .map(context => {
      const ref_data = parseWithContext(ref, context, opts)
      if (ref_data.length > 0) {
        const pertinent = ref_data[ref_data.length - 1]
        if (pertinent.validity.valid) {
          return [ pertinent.default ]
        }
      }
      return []
    })
    .reduce((a, b) => {
      return a.concat(b)
    })
}

const improveRefTags = (block, block_context, opts) => {
  const regex = /<a data-cross-ref='{"scripture"[^>]+}'>([^<]+)<\/a>/g
  const ref_tags = block.match(regex)

  for (let tag of ref_tags) {
    let tagged_string = tag.replace(regex, '$1')
    const has_words = /^[a-z\W]+([a-z\W]+)?\d/i.test(tagged_string)
    let removed_text = ''

    if (has_words) {
      tagged_string = tagged_string.replace(/^[a-z\W]+([a-z\W]+)?/i, '')
      removed_text = tagged_string.replace(/^[a-z\W]+([a-z\W]+)?\d.*?$/i, '$1')
    }

    const ref_obj = getRefTagData(tag)
    const no_conf_prop = !ref_obj.hasOwnProperty('confidence')
    const low_conf_val = !no_conf_prop && ref_obj.confidence < 10

    if (no_conf_prop || low_conf_val) {
      const alternates = getValidAlternates(block_context, tagged_string, opts)
      const alt_len = alternates.length

      if (alt_len === 0 && low_conf_val) {
        ref_obj.confidence = 9

      } else if (alt_len === 1) {
        if (ref_obj.hasOwnProperty('message')) delete ref_obj.message
        if (ref_obj.hasOwnProperty('context')) delete ref_obj.context
        ref_obj.confidence = 9
        ref_obj.valid = true
        ref_obj.scripture = alternates[0]

      } else if (alt_len > 1) {
        if (ref_obj.hasOwnProperty('context')) delete ref_obj.context
        ref_obj.possible = alternates

      }

      if (ref_obj !== getRefTagData(tag)) {
        block = !has_words ?
          block.replace(regex, `<a data-cross-ref='${JSON.stringify(ref_obj)}'>$1</a>`) :
          block.replace(regex, `${removed_text}<a data-cross-ref='${JSON.stringify(ref_obj)}'>${tagged_string}</a>`)
      }
    }
  }

  return block
}

const identifyAlternatives = (html, opts) => {
  const blocks = getBlocks(html)
  let provided_context = []
  let prev_block_context = []

  for (const block of blocks) {
    provided_context = uniq(provided_context.concat(getProvidedContext(block, opts)))
    const prosaic_context = uniq(getBooksInContext(block, opts))
    const block_context = uniq(provided_context.concat(prev_block_context, prosaic_context))

    html = html.replace(block, improveRefTags(block, block_context, opts))

    prev_block_context = prosaic_context
  }

  return html
}

module.exports = identifyAlternatives
