const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs-extra')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const opn = require('opn')
const os = require('os')
const path = require('path')
const { parseExplicit } = require('../parse')
const getErrorMsg = require('../get-error-msg')
const { checkRefsInHtml, reparseWithContext } = require('./parse-ref-input')
const { getRefs, normHtml } = require('./prep-report-data')


const app = express()
const port = 7777
const report_loc = path.join(os.homedir(), '.percival/')

const epub_dir = fs.readFileSync(path.join(report_loc, 'epub_dir.txt'), 'utf-8')
const images = path.join(epub_dir, 'OEBPS', 'images')
const data = path.join(epub_dir, 'META-INF', 'percival.json')

app.use('/', express.static(report_loc))
app.use('/images', express.static(images))
app.use('/data', bodyParser.json())
app.use('/parse', bodyParser.json())

// Create database instance and start server
const adapter = new FileSync(data)
const db = low(adapter)

const getDocData = (id, docs, blocks) => {
  const getDocRefs = docBlocks => {
    return docBlocks.reduce((a, b) => {
      return [ Object.assign(a[0], blocks[b.blockId].refs) ]
    }, [{}])
  }

  const docBlocks = Object.keys(blocks)
    .filter(blockId => blockId.startsWith(id))
    .map(blockId => {
      return [ blockId
             , blocks[blockId].html
             ]
    })

  const docRefs = docBlocks.length > 0 ?
    getDocRefs(docBlocks) : [{}]

  return { docId: id
         , name: docs[id].name
         , blocks: docBlocks
         , refs: docRefs[0]
         }
}

// Routes
app.get('/data', (req, res) => {
  const docs = db.get('docs').value()
  const blocks = db.get('blocks').value()
  const ids = Object.keys(docs).sort()
  const firstId = ids[0]

  const docsZip =
    { prev: []
    , current: getDocData(firstId, docs, blocks)
    , next: ids.slice(1)
    }

  const initData =
    { vol_title: db.get('vol_title').value()
    , opts: db.get('opts')
    , docs: docsZip
    }

  res.send(initData)
})

app.get('/data/docs/:id', (req, res) => {
  const docs = db.get('docs').value()
  const blocks = db.get('blocks').value()
  const doc = getDocData(req.params.id, docs, blocks)

  res.send(doc)
})

app.get('/data/blocks/:id', (req, res) => {
  const block = db.get('blocks')
    .get(req.params.id)
    .value()

  res.send(block)
})

app.post('/data/blocks/:id', (req, res) => {
  let block

  if (req.query.hasOwnProperty('in') && req.query.in === 'html') {
    const parsed_html = checkRefsInHtml(req.body.html)
    const { html, refs } = getRefs(req.params.id, parsed_html)

    block = db.get('blocks')
      .get(req.params.id)
      .assign({ html: normHtml(html)
              , refs
              })
      .write()

  } else if (req.query.hasOwnProperty('with') && req.query.with === 'context') {
    const input = req.body.context.trim()
    const opts = { vers: req.query.vers, lang: req.query.lang }

    const current_block = db.get('blocks').get(req.params.id).value()
    const current_html = current_block.html
      .replace(/"({[^}]+})"/g, "'$1'")
      .replace(/&quot;/g, '"')

    const parsed_html = reparseWithContext(input, current_html, opts)
    const { html, refs } = getRefs(req.params.id, parsed_html)

    block = db.get('blocks')
      .get(req.params.id)
      .assign({ html: normHtml(html)
              , refs
              })
      .write()

  } else {
    block = db.get('blocks')
      .get(req.params.id)
      .assign({ html: req.body.html, refs: req.body.refs })
      .write()
  }

  res.send(block)
})

app.post('/parse', (req, res) => {
  const input = req.body.input.trim()
  const opts = { vers: req.query.vers, lang: req.query.lang }
  const parsed_data = {}

  if (/^[\w .,;:-]+$/i.test(input)) {
    const markup_data = parseExplicit(input, opts)
    if (markup_data.length > 0) {
      parsed_data.scripture = markup_data[0].ref_data.osis
      parsed_data.valid = markup_data[0].ref_data.validity.valid
      parsed_data.message = getErrorMsg(markup_data[0].ref_data.validity)
    }
  }

  if (parsed_data === {}) {
    parsed_data.scripture = ''
    parsed_data.valid = false
    parsed_data.message = 'Not enough info'
  }

  res.send(parsed_data)
})

app.listen(port)

opn(`http://localhost:${port}/`, {wait: false})
