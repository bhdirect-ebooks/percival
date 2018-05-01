const cheerio = require('cheerio')
const pad = require('pad-number')
const he = require('he')
const { decodeSafeEntities } = require('../utils')

const normHtml = html => {
  return html
    .replace(/&quot;/g, '"')
    .replace(
      /&(?:amp;|#(?:38|x26);)?(?:#x[a-f0-9]+|(?:S(?:caron|igma)|Lambda|a(?:ring|pos|c(?:ute|irc)|uml|tilde|l(?:pha|efsym)|symp|mp|elig|grave|n[gd]|acute)|U(?:grave|acute|circ|uml|psilon)|Y(?:acute|uml)|c(?:rarr|e(?:nt|dil)|irc|lubs|cedil|o(?:py|ng)|u(?:rren|p)|ap|hi)|h(?:[aA]rr|e(?:llip|arts))|C(?:cedil|hi)|o(?:plus|r(?:d[fm])?|ti(?:lde|mes)|uml|circ|slash|m(?:icron|ega)|elig|grave|line|acute)|quot|A(?:grave|acute|circ|tilde|uml|ring|Elig|lpha)|t(?:i(?:mes|lde)|au|rade|h(?:orn|insp|e(?:ta(?:sym)?|re4)))|e(?:xist|quiv|m(?:sp|pty)|t[ha]|circ|nsp|u(?:ml|ro)|grave|psilon|acute)|r(?:s(?:quo|aquo)|lm|e(?:g|al)|dquo|ho|a(?:quo|rr|dic|ng)|Arr|floor|ceil)|Gamma|Rho|T(?:HORN|heta|au)|b(?:rvbar|eta|dquo|ull)|l(?:s(?:quo|aquo)|o(?:wast|z)|rm|dquo|Arr|[te]|floor|ceil|a(?:quo|mbda|rr|ng))|D(?:elta|agger)|O(?:grave|acute|circ|tilde|uml|slash|Elig|m(?:icron|ega))|i(?:excl|sin|ota|uml|mage|quest|circ|grave|n(?:fin|t)|acute)|s(?:i(?:gmaf?|m)|bquo|dot|ect|pades|u(?:m|be?|p[231e]?)|hy|zlig|caron)|d(?:e(?:g|lta)|a(?:gger|rr)|Arr|i(?:vide|ams))|N(?:tilde|u)|f(?:nof|ra(?:c(?:1[42]|34)|sl)|orall)|[Kk]appa|P(?:i|[hs]i|rime)|E(?:grave|acute|circ|uml|TH|psilon|ta)|z(?:eta|w(?:nj|j))|p(?:ound|lusmn|[hs]i|iv?|ar[at]|r(?:ime|o[dp])|er(?:mil|p))|n(?:[uie]|dash|bsp|sub|tilde|abla|ot(?:in)?)|Mu|I(?:grave|acute|circ|uml|ota)|m(?:acr|u|dash|i(?:cro|ddot|nus))|[BZ]eta|weierp|g(?:[te]|amma)|u(?:ml|grave|circ|uml|psi(?:lon|h)|a(?:cute|rr)|Arr)|y(?:en|acute|uml)|[Xx]i));/gim,
      match => {
        match = he.decode(match)
        match = he.decode(match) // decode again in the case of `&#38;amp;` or similar
        match = he.encode(match, {
          decimal: true,
          useNamedReferences: false,
        })
        return match
      }
    )
    .replace(
      /<\?xml.*?>/,
      '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
    )
    .replace('</?xml>', '')
    .replace('!doctype', '!DOCTYPE')
    .replace(/([a-z:]+=)'([^']+)'/gi, '$1"$2"')
    .replace(/<(link|hr|img|source)([^>]+)>/gi, '<$1$2 />')
    .replace(/<br>/gi, '<br />')
    .replace(
      /<video([^>]*?) controls ([^>]*?)>/gi,
      '<video$1 controls="controls" $2>'
    )
    .replace(/(data-cross[a-z\\-]+)="\{(.*?)\}"/gi, "$1='{$2}'")
    .replace(/alt="0"/gi, 'alt=""')
    .replace(/(<span[^>]+)\/>/gi, '$1></span>')
    .replace(/(>[^<>\n]*?)&(?!#)([^<>\n]*?<)/g, '$1&#38;$2')
    .replace(/<\/a>(\w)/g, '</a> $1')
}

const getRefs = (block_id, orig_html) => {
  const $ = cheerio.load(orig_html)
  const refs = {}

  $('a')
    .filter((i, elem) => {
      return (
        $(elem).data('ref') &&
        $(elem)
          .data('ref')
          .hasOwnProperty('scripture')
      )
    })
    .each((i, elem) => {
      const data = $(elem).data('ref')
      const ref_id = `${block_id}-${pad(i + 1, 3)}`
      const text = $(elem).html()
      refs[ref_id] = {
        text: decodeSafeEntities(text),
        data,
      }
    })

  let html = $.html().replace(
    /^<html><head><\/head><body>([\s\S]+)<\/body><\/html>$/,
    '$1'
  )

  html = decodeSafeEntities(html)

  return { html, refs }
}

const getChildNodes = html => {
  const $ = cheerio.load(html.replace(/(<span[^>]+)\/>/g, '$1></span>'))
  let children

  if ($('body').children('section').length === 1) {
    children = $('body')
      .children('section')
      .children()
  } else {
    children = $('body').children()
  }

  return { $, children }
}

const getHtmlBlocks = ({ id, final_html }) => {
  const blocks = []
  const { $, children } = getChildNodes(final_html)

  children.each((i, elem) => {
    const block_id = `${id}-${pad(i + 1, 4)}`
    const block_html = $.html(elem)
    const { html, refs } = getRefs(block_id, block_html)
    blocks.push({
      block_id,
      html: normHtml(html),
      refs,
    })
  })

  return blocks
}

const chunkify = ({ id, name, final_html }) => {
  const CHUNK_SIZE = 15
  const pages = final_html.match(/<span[^>\n]+epub:type="pagebreak"[^>\n]+>/g)
  const page_count = pages ? pages.length : 0

  if (page_count <= CHUNK_SIZE) {
    return [{ id: `${id}-01`, name, final_html }]
  } else {
    const { $, children } = getChildNodes(final_html)
    const block_html = []

    children.each((i, elem) => {
      const html = $.html(elem)
      block_html.push(normHtml(decodeSafeEntities(html)))
    })

    const chunks = block_html.reduce(
      (a, b) => {
        const pagebreaks = b.match(/<span[^>\n]+epub:type="pagebreak"[^>\n]+>/g)
        const b_pages = pagebreaks
          ? pagebreaks.map(pb => pb.replace(/^.*?title="([^"]+)".*?$/, '$1'))
          : []
        const b_page_count = b_pages.length
        const b_first_page = b_page_count > 0 ? b_pages[0] : ''
        const b_last_page = b_page_count > 0 ? b_pages[b_page_count - 1] : ''

        const chunk_count = a.chunky.length
        const last_chunk = chunk_count - 1

        if (
          a.page_count < CHUNK_SIZE &&
          a.page_count + b_page_count < CHUNK_SIZE
        ) {
          const block_count =
            last_chunk >= 0 ? a.chunky[last_chunk].blocks.length : 0
          const new_blocks =
            block_count > 0
              ? a.chunky[last_chunk].blocks
                .slice(0, block_count - 1)
                .concat([
                  a.chunky[last_chunk].blocks[block_count - 1].concat(b),
                ])
              : [b]

          const new_chunky = a.chunky
          new_chunky[last_chunk] = {
            start:
              a.chunky[last_chunk].start === ''
                ? b_first_page
                : a.chunky[last_chunk].start,
            end: b_last_page === '' ? a.chunky[last_chunk].end : b_last_page,
            blocks: new_blocks,
          }

          return {
            page_count: a.page_count + b_page_count,
            chunky: new_chunky,
          }
        } else {
          const new_chunky = a.chunky.concat([
            {
              start: b_first_page,
              end: b_last_page,
              blocks: [b],
            },
          ])
          return {
            page_count: b_page_count,
            chunky: new_chunky,
          }
        }
      },
      { page_count: 0, chunky: [{ start: '', end: '', blocks: [] }] }
    )

    return chunks.chunky.map((chunk, i) => {
      const html = chunk.blocks.join('')
      return {
        id: `${id}-${pad(i + 1, 2)}`,
        name:
          chunks.chunky.length > 1
            ? `${name} (pp. ${chunk.start}-${chunk.end})`
            : name,
        final_html: `<body><section>${html}</section></body>`,
      }
    })
  }
}

const prepReportData = (vol_title, all_data, opts) => {
  const blocks = {}
  let chunks = []
  const docs = {}
  const fs_docs = {}

  all_data.forEach(file_data => {
    chunks = chunks.concat(chunkify(file_data))
    fs_docs[file_data.id] = { name: file_data.name }
  })

  chunks.forEach(chunk => {
    const doc_blocks = getHtmlBlocks(chunk)
    doc_blocks.forEach(b => {
      blocks[b.block_id] = {
        html: b.html,
        refs: b.refs,
      }
    })
    docs[chunk.id] = { name: chunk.name }
  })

  return {
    vol_title,
    blocks,
    docs,
    opts,
    fs_docs,
  }
}

module.exports = { prepReportData, getRefs, normHtml }
