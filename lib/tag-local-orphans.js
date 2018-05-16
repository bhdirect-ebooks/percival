const findAndTagOrphans = require('./find-tag-orphans')

const tagLocal = (html, opts) => {
  const data = []

  const local_str_regex = /<a data-ref=[^>]+"confidence":10}'>[^><\n]+<\/a>(?!\)).*?(?=<a |<span data-context|[\n])/gi
  const local_text_arr = html.match(local_str_regex)

  if (local_text_arr) {
    local_text_arr.forEach(text => {
      const cross_ref = JSON.parse(
        text.replace(/^<a data-ref='([^>]+)'>.*?$/, '$1')
      )
      const just_after = text.replace(
        /^<a data-ref=[^>]+"confidence":10}'>[^<]+<\/a>/i,
        ''
      )

      if (!/^\W+$/.test(just_after)) {
        const parts = just_after.split(/(<[^>]+>)/)
        const new_parts = []

        for (let i = 0; i < parts.length; i++) {
          if (!/</.test(parts[i])) {
            const ref_data = findAndTagOrphans(
              parts[i],
              cross_ref.scripture,
              opts
            )
            if (ref_data.data.length > 0) {
              data.push(ref_data.data)
              new_parts[i] = ref_data.text
            } else {
              new_parts[i] = parts[i]
            }
          } else {
            new_parts[i] = parts[i]
          }
        }

        const new_html = new_parts.join('')
        if (new_html !== just_after) html = html.replace(just_after, new_html)
      }
    })
  }

  return { data, html }
}

module.exports = tagLocal
