const findAndTagOrphans = require('./find-tag-orphans')


const tagLocal = (html, opts) => {
  const data = []

  const local_str_regex = /<a data-cross-ref=[^>]+"confidence":10}'>[^<>\n]+<\/a>.*?(?=<a |\n)/gi
  const local_text_arr = html.match(local_str_regex)

  if (local_text_arr) {
    local_text_arr.forEach(text => {
      const cross_ref = JSON.parse(text.replace(/^<a data-cross-ref='([^>]+)'>.*?$/, '$1'))
      const just_after = text.replace(/^<a data-cross-ref=[^>]+"confidence":10}'>[^<]+<\/a>/i, '')

      if (!/^\W+$/.test(just_after)) {
        const ref_data = findAndTagOrphans(just_after, cross_ref.scripture, opts)

        if (ref_data.data.length > 0) {
          data.push(ref_data.data)
          html = html.replace(just_after, ref_data.text)
        }
      }
    })
  }

  return { data, html }
}

module.exports = tagLocal
