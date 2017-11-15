const cheerio = require('cheerio')
const pad = require('pad-number')
const { decodeSafeEntities } = require('../utils')


const getRefs = (block_id, orig_html) => {
  const $ = cheerio.load(orig_html)
  const refs = {}

  $('a').filter((i, elem) => $(elem).data('crossRef'))
    .each((i, elem) => {
      const data = $(elem).data('crossRef')
      const ref_id = `${block_id}-${pad(i + 1, 3)}`
      const text = $(elem).html()
      refs[ref_id] =
        { text: decodeSafeEntities(text)
        , data
        }
    })

  let html = $.html()
    .replace(/^<html><head><\/head><body>([\s\S]+)<\/body><\/html>$/, '$1')

  html = decodeSafeEntities(html)

  return { html, refs }
}

const getHtmlBlocks = ({ id, final_html }) => {
  const $ = cheerio.load(final_html.replace(/(<span[^>]+)\/>/g, '$1></span>'))
  const blocks = []
  let children

  if ($('body').children('section').length === 1) {
    children = $('body').children('section').children()
  } else if ($('body').children('div').length === 1) {
    children = $('body').children('div').children()
  } else {
    children = $('body').children()
  }

  children.each((i, elem) => {
    const block_id = `${id}-${pad(i + 1, 4)}`
    const block_html = $.html(elem)
    const { html, refs } = getRefs(block_id, block_html)
    blocks.push(
      { block_id
      , html
      , refs
      }
    )
  })

  return blocks
}

const prepReportData = (vol_title, all_data, opts) => {
  const blocks = {}
  const docs = {}

  all_data.forEach(file_data => {
    const doc_blocks = getHtmlBlocks(file_data)
    doc_blocks.forEach(b => {
      blocks[b.block_id] =
        { html: b.html
        , refs: b.refs
        }
    })
    docs[file_data.id] = { name: file_data.name }
  })

  return { vol_title
         , blocks
         , docs
         , opts
         }
}

module.exports = { prepReportData, getRefs }
