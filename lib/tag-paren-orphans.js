const findAndTagOrphans = require('./find-tag-orphans')
const { getBooksInContext } = require('./book-regexps')


const tagInParens = (html, opts) => {
  const data = []
  const paren_regex = /(?:<\/a>|<(?:p|li|td)[^>]*?>)(.*?)[([]([abcdef \d:;,\\-\\-‒–—]+)[)\]]/gi
  const paren_arr = html.match(paren_regex)

  if (paren_arr) {
    paren_arr.forEach(text => {
      const paren_ctxt = text.replace(paren_regex, '$1')
      const paren_str = text.replace(paren_regex, '$2')
      const found_books = getBooksInContext(paren_ctxt)

      if (found_books.length > 0) {
        
      }

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

module.exports = tagInParens
