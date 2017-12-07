const cheerio = require('cheerio')
const pad = require('pad-number')
const he = require('he')
const { decodeSafeEntities } = require('../utils')


const normHtml = html => {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&(?:amp;|#(?:38|x26);)?(?:#x[a-f0-9]+|(?:S(?:caron|igma)|Lambda|a(?:ring|pos|c(?:ute|irc)|uml|tilde|l(?:pha|efsym)|symp|mp|elig|grave|n[gd]|acute)|U(?:grave|acute|circ|uml|psilon)|Y(?:acute|uml)|c(?:rarr|e(?:nt|dil)|irc|lubs|cedil|o(?:py|ng)|u(?:rren|p)|ap|hi)|h(?:[aA]rr|e(?:llip|arts))|C(?:cedil|hi)|o(?:plus|r(?:d[fm])?|ti(?:lde|mes)|uml|circ|slash|m(?:icron|ega)|elig|grave|line|acute)|quot|A(?:grave|acute|circ|tilde|uml|ring|Elig|lpha)|t(?:i(?:mes|lde)|au|rade|h(?:orn|insp|e(?:ta(?:sym)?|re4)))|e(?:xist|quiv|m(?:sp|pty)|t[ha]|circ|nsp|u(?:ml|ro)|grave|psilon|acute)|r(?:s(?:quo|aquo)|lm|e(?:g|al)|dquo|ho|a(?:quo|rr|dic|ng)|Arr|floor|ceil)|Gamma|Rho|T(?:HORN|heta|au)|b(?:rvbar|eta|dquo|ull)|l(?:s(?:quo|aquo)|o(?:wast|z)|rm|dquo|Arr|[te]|floor|ceil|a(?:quo|mbda|rr|ng))|D(?:elta|agger)|O(?:grave|acute|circ|tilde|uml|slash|Elig|m(?:icron|ega))|i(?:excl|sin|ota|uml|mage|quest|circ|grave|n(?:fin|t)|acute)|s(?:i(?:gmaf?|m)|bquo|dot|ect|pades|u(?:m|be?|p[231e]?)|hy|zlig|caron)|d(?:e(?:g|lta)|a(?:gger|rr)|Arr|i(?:vide|ams))|N(?:tilde|u)|f(?:nof|ra(?:c(?:1[42]|34)|sl)|orall)|[Kk]appa|P(?:i|[hs]i|rime)|E(?:grave|acute|circ|uml|TH|psilon|ta)|z(?:eta|w(?:nj|j))|p(?:ound|lusmn|[hs]i|iv?|ar[at]|r(?:ime|o[dp])|er(?:mil|p))|n(?:[uie]|dash|bsp|sub|tilde|abla|ot(?:in)?)|Mu|I(?:grave|acute|circ|uml|ota)|m(?:acr|u|dash|i(?:cro|ddot|nus))|[BZ]eta|weierp|g(?:[te]|amma)|u(?:ml|grave|circ|uml|psi(?:lon|h)|a(?:cute|rr)|Arr)|y(?:en|acute|uml)|[Xx]i));/gmi, match => {
      match = he.decode(match)
      match = he.decode(match) // decode again in the case of `&#38;amp;` or similar
      match = he.encode(match, {
        'decimal': true,
        'useNamedReferences': false
      })
      return match
    })
    .replace(/<\?xml.*?>/, '<?xml version="1.0" encoding="UTF-8" standalone="no"?>')
    .replace('</?xml>', '')
    .replace('!doctype', '!DOCTYPE')
    .replace(/([a-z:]+=)'([^']+)'/gi, '$1"$2"')
    .replace(/<(link|hr|img|source)([^>]+)>/gi, '<$1$2 />')
    .replace(/<br>/gi, '<br />')
    .replace(/<video(.*?)controls(.*?)>/gi, '<video$1controls="controls"$2>')
    .replace(/(data-cross[a-z\\-]+)="\{(.*?)\}"/gi, '$1=\'{$2}\'')
    .replace(/alt="0"/gi, 'alt=""')
    .replace(/(<span[^>]+)\/>/gi, '$1></span>')
    .replace(/(>[^<>\n]*?)&(?!#)([^<>\n]*?<)/g, '$1&#38;$2')
}

const getRefs = (block_id, orig_html) => {
  const $ = cheerio.load(orig_html)
  const refs = {}

  $('a').filter((i, elem) => {
    return $(elem).data('crossRef') && $(elem).data('crossRef').hasOwnProperty('scripture')
  }).each((i, elem) => {
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
      , html: normHtml(html)
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

module.exports = { prepReportData, getRefs, normHtml }
