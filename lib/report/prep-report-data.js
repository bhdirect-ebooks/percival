const cheerio = require('cheerio')
const pad = require('pad-number')


const getRefs = (block_id, orig_html) => {
  const $ = cheerio.load(orig_html)
  const refs = []

  $('a').filter((i, elem) => $(elem).data('crossRef'))
    .each((i, elem) => {
      const data = $(elem).data('crossRef')
      const id = `${block_id}-${pad(i + 1, 3)}`
      const text = $(elem).html()
      refs.push(
        { _id: id
        , text
        , data
        }
      )
    })

  const html = $.html()
    .replace(/^<html><head><\/head><body>([\s\S]+)<\/body><\/html>$/, '$1')

  return { html, refs }
}

const getHtmlBlocks = ({ id, final_html }) => {
  const $ = cheerio.load(final_html.replace(/(<span[^>]+)\/>/g, '$1></span>'))
  const blocks = []
  let children

  if ($('body').children('section').length === 1) {
    children = $('body').children('section').children()
  } else {
    children = $('body').children()
  }

  children.each((i, elem) => {
    const block_id = `${id}-${pad(i + 1, 4)}`
    const block_html = $.html(elem)
    const { html, refs } = getRefs(block_id, block_html)
    blocks.push(
      { _id: block_id
      , html
      , refs
      }
    )
  })

  return blocks
}

const prepReportData = (vol_title, all_data, opts) => {
  let blocks = []
  const docs = []

  all_data.forEach(file_data => {
    blocks = blocks.concat(getHtmlBlocks(file_data))
    docs.push(
      { _id: file_data.id
      , name: file_data.name
      }
    )
  })

  return { vol_title
         , blocks
         , docs
         , opts
         }
}

module.exports = { prepReportData, getRefs }
