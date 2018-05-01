const { assignConfWithString } = require('./assign-confidence')
const { getBooksInContext } = require('./book-regexps')
const getParseData = require('./get-parse-data')
const uniq = require('lodash.uniq')


const getBlocks = html => {
  const regex = /(?:<(figcaption|li|t[dh])[^>]*?>[\s\S]+?<\/\1>|<(p|h[123456]|d[dt])[^>]*?>[^\n]+<\/\2>)/g
  return html.match(regex)
}

const getRefTagData = attr => {
  const regex = /<a data-ref='({"scripture"[^>]+})'.*?$/
  return JSON.parse(attr.replace(regex, '$1'))
}

const getProvidedContext = (html, opts) => {
  const regex = /<a data-context='{"(?:scripture|parsing)":"([^"]+)"}'/g
  const matches = html.match(regex)

  if (matches) {
    return matches
      .map(match => {
        return match.replace(regex, '$1')
      })
      .map(value => {
        if (/^\D+$/.test(value)) {
          return value
        } else {
          const parse_data = getParseData(value, opts)[0]
          return parse_data.refs[0].validity.valid ? parse_data.refs[0].default : parse_data.refs[0].validity.start.b
        }
      })
  } else {
    return []
  }
}

const getRefContext = (html) => {
  const regex = /<a data-ref='{"scripture":"([^"]+)"/g
  const matches = html.match(regex)

  if (matches) {
    return matches
      .map(match => {
        const osis = match.replace(regex, '$1')
        const single = /^([^.]+\.\d+)\.\d+$/
        const range = /^(([^.]+)\.(\d+))\.\d+-(([^.]+)\.(\d+))\.\d+$/

        if (single.test(osis)) {
          return osis.replace(single, '$1')

        } else if (range.test(osis)) {
          const start_c = parseInt(osis.replace(range, '$3'))
          const end_c = parseInt(osis.replace(range, '$6'))

          if (end_c > start_c) {
            const b = osis.replace(range, '$2')
            const range_arr = []
            for (let i = start_c; i < end_c; i++) {
              range_arr.push(`${b}.${i}`)
            }
            return range_arr

          } else if (end_c < start_c) {
            return [ osis.replace(range, '$1'), osis.replace(range, '$4') ]
          } else {
            return [ osis.replace(range, '$1') ]
          }
        } else {
          return []
        }
      })
      .reduce((a, b) => {
        return a.concat(b)
      }, [])

  } else {
    return []
  }
}

const getValidAlternates = (context_arr, ref, opts) => {
  return uniq(context_arr
    .map(context => {
      opts.context = context
      const parse_data = getParseData(ref, opts)[0]

      if (parse_data && parse_data.refs && parse_data.refs.length > 0) {
        const first_ref = parse_data.refs[0]
        if (first_ref.validity.valid) {
          return first_ref.default
        }
      }
      return ''
    }))
}

const improveRefTags = (block, block_context, opts) => {
  const regex = /<a data-ref='{"scripture"[^}]+}'>([^<]+)<\/a>/g
  const ref_tags = block.match(regex)

  if (ref_tags) {
    for (const tag of ref_tags) {
      const ref_obj = getRefTagData(tag)
      const no_conf_prop = !ref_obj.hasOwnProperty('confidence')
      const low_conf_val = !no_conf_prop && ref_obj.confidence < 10

      let removed_text = ''
      let tagged_string = tag.replace(regex, '$1')
      let has_words = /^[^vc\d]\D+\d/i.test(tagged_string)
      const trustworthy = ref_obj.confidence === assignConfWithString(tagged_string, ref_obj.confidence)

      if (!no_conf_prop && !trustworthy) {
        has_words = false
      }

      if (has_words) {
        removed_text = tagged_string.replace(/^([^vc\d]\D+)\d.*?$/i, '$1')
        tagged_string = tagged_string.replace(/^[^vc\d]\D+(\d)/i, '$1')
      }

      if (no_conf_prop || low_conf_val) {
        const alternates = getValidAlternates(block_context, tagged_string, opts)
          .filter(alt => {
            return alt !== '' && !ref_obj.scripture.includes(alt)
          })
        const alt_len = alternates.length

        if (alt_len === 0 && low_conf_val && trustworthy) {
          ref_obj.confidence = 9

        } else if (alt_len === 1) {
          if (ref_obj.hasOwnProperty('message')) {
            delete ref_obj.message
            if (ref_obj.hasOwnProperty('context')) delete ref_obj.context
            ref_obj.confidence = 9
            ref_obj.valid = true
            ref_obj.scripture = alternates[0]
          } else {
            ref_obj.confidence = 8
            ref_obj.possible = alternates
          }

        } else if (alt_len > 1) {
          if (ref_obj.hasOwnProperty('context')) delete ref_obj.context
          ref_obj.possible = alternates

        }

        block = !has_words ?
          block.replace(tag, `<a data-ref='${JSON.stringify(ref_obj)}'>${tagged_string}</a>`) :
          block.replace(tag, `${removed_text}<a data-ref='${JSON.stringify(ref_obj)}'>${tagged_string}</a>`)

      } else if (ref_obj.confidence === 10) {
        ref_obj.confirmed = true
        block = block.replace(tag, `<a data-ref='${JSON.stringify(ref_obj)}'>${removed_text}${tagged_string}</a>`)
      }
    }
  }

  return block
}

const identifyAlternatives = (html, opts) => {
  const blocks = getBlocks(html)
  let provided_context = []

  for (const block of blocks) {
    const block_provided = uniq(getProvidedContext(block, opts))
    provided_context = block_provided.length > 0 ? block_provided : provided_context

    const prosaic_context = uniq(getBooksInContext(block, opts))
    const ref_context = uniq(getRefContext(block))
    const block_context = uniq(provided_context.concat(prosaic_context, ref_context))

    html = html.replace(block, improveRefTags(block, block_context, opts))
  }

  return html
}

const idAltInSingleBlock = (block, opts) => {
  const block_provided = uniq(getProvidedContext(block, opts))
  const prosaic_context = uniq(getBooksInContext(block, opts))
  const ref_context = uniq(getRefContext(block))
  const block_context = uniq(block_provided.concat(prosaic_context, ref_context))

  return block.replace(block, improveRefTags(block, block_context, opts))
}

module.exports = { identifyAlternatives, idAltInSingleBlock }
