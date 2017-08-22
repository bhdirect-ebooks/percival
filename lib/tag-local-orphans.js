'use strict'

const { parseWithContext } = require('./parse.js')

//parseWithContext(node, context);

const getFinalMarkup = (ref_data_arr) => {
  return ref_data_arr[ref_data_arr.length - 1].after_text
}

const tagLocal = (html, opts) => {
  let data = []

  const local_str_regex = /<a data-cross-ref=[^>]+"confidence":10}'>[^<>\n]+<\/a>.*?(?=<a |\n)/gi
  const local_text_arr = html.match(local_str_regex)

  if (local_text_arr) {
    local_text_arr.forEach(text => {
      const cross_ref = JSON.parse(text.replace(/^<a data-cross-ref='([^>]+)'>.*?$/, '$1'))
      const just_after = text.replace(/^<a data-cross-ref=[^>]+"confidence":10}'>[^<]+<\/a>/i, '')

      if (!/^\W+$/.test(just_after)) {
        const ref_data = parseLocalOrphans(just_after, cross_ref.scripture, opts)

        if (ref_data.data.length > 0) {
          data.push(ref_data.data)
          html = html.replace(just_after, ref_data.text)
        }
      }
    })
  }

  return { data: data, html: html }
}

const parseLocalOrphans = (text, context, opts) => {
  let data = []

  const all_refs_regexes = [
    /\b((?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)\s?\d+(?:[a-f]|\.|)(?:[:\--‒–—]\d+(?:[a-f]|)|[f]+|[:\--‒–—][\--‒–—\s;,\d:]+\d+)(?:[a-f]|\.|)(?![":\--‒–—]))/gi,
    /\b(ch(?:\.|s\.?|a(?:\.|s\.?|p(?:\.|s\.?|t(?:\.|s\.?|ers?)?)?)?)?\s?\d+(?:[\--‒–—]| and )\d+\b(?![":\--‒–—]))/gi,
    /\b(ch(?:\.|a(?:\.|p(?:\.|t(?:\.|er)?)?)?)?\s?\d+)\b(?![":\--‒–—])/gi,
    /\b((?:cf\.?|v(?:\.|er(?:\.|s(?:\.|es?)?)?|(?:[sv](?:\.|s\.?)?))?)\s?\d+)(?:[a-f]|\.|)\b(?![":\--‒–—])/gi,
    // chap:vers(-vers)?
    /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a-f]|)([\--‒–—](?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a-f]|))?\b/g,
    // chap:vers-chap:vers
    /\b(?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a-f]|)[\--‒–—](?:[89234567][3456789012]?|1(?:[6789]|[01234][3456789012]?|50?)?):(?:[89234567][3456789012]?|1(?:7[0123456]?|[0123456][3456789012]?|[89])?)(?:[a-f]|)\b/g
  ];

  for (let ref_regex of all_refs_regexes) {
    const ref_data = parseAndReplaceMatches(ref_regex, text, context, opts)
    if (typeof ref_data === 'object') {
      data = data.concat(ref_data.data)
      text = ref_data.text
    }
  }

  return { data: data, text: text }
}

const parseAndReplaceMatches = (regex, the_string, context, opts) => {
  let m
  let matches = []
  let ref_data

  while ((m = regex.exec(the_string)) !== null) {
    if (m.index === regex.lastIndex) regex.lastIndex++
    matches.push(m[0])
  }

  for (let match of matches) {
    ref_data = parseWithContext(match, context, opts)
    the_string = the_string.replace(new RegExp(`${match}(?!</a>)`), getFinalMarkup(ref_data))
  }

  return (ref_data) ? { data: ref_data, text: the_string } : the_string
}

module.exports = tagLocal