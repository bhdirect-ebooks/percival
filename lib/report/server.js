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
const Raven = require('raven')

Raven.config(
  'https://b8b67b87430a438d8852046136071b1f:c8ddc85524414a95b30954bf736ab7ee@sentry.io/289744'
).install()

const app = express()
const port = 7777
const report_loc = path.join(os.homedir(), '.percival/')

const epub_dir = fs.readFileSync(path.join(report_loc, 'epub_dir.txt'), 'utf-8')
const images = path.join(epub_dir, 'OEBPS', 'images')
const data = path.join(epub_dir, 'META-INF', 'percival.json')

app.use(Raven.requestHandler())
app.use('/', express.static(report_loc))
app.use('/images', express.static(images))
app.use('/data', bodyParser.json())
app.use('/parse', bodyParser.json())

// Create database instance and start server
const adapter = new FileSync(data)
const db = low(adapter)

// Routes
app.get('/data', (req, res) => {
  const state = db.getState()
  res.send(state)
})

app.get('/data/docs', (req, res) => {
  const docs = db.get('docs')
  const ids = docs.keys().sort()
  const firstId = ids[0]

  const blocks = db.get('blocks')

  const docBlocks = blocks
    .keys()
    .filter(id => id.startsWith(req.params.id))
    .map(id => {
      return {
        blockId: id,
        html: blocks[id].html,
      }
    })

  const docRefs = docBlocks.reduce((a, b) => Object.assign(a, b.refs))

  const docsZip = {
    first: {
      docId: firstId,
      name: docs.firstId.name,
      blocks: docBlocks,
      refs: docRefs,
    },
    rest: ids.slice(1),
  }

  res.send(docsZip)
})

app.get('/data/docs/:id', (req, res) => {
  const doc = db
    .get('docs')
    .get(req.params.id)
    .value()

  doc.docId = req.params.id

  const blocks = db.get('blocks')

  doc.blocks = blocks
    .keys()
    .filter(id => id.startsWith(req.params.id))
    .map(id => {
      return {
        blockId: id,
        html: blocks[id].html,
      }
    })

  doc.refs = doc.blocks.reduce((a, b) => Object.assign(a, b.refs))

  res.send(doc)
})

app.get('/data/blocks/:id', (req, res) => {
  const block = db
    .get('blocks')
    .get(req.params.id)
    .value()

  res.send(block)
})

app.post('/data/blocks/:id', (req, res) => {
  let block

  if (req.query.hasOwnProperty('in') && req.query.in === 'html') {
    const parsed_html = checkRefsInHtml(req.body.html)
    const { html, refs } = getRefs(req.params.id, parsed_html)

    block = db
      .get('blocks')
      .get(req.params.id)
      .assign({
        html: normHtml(html),
        refs,
      })
      .write()
  } else if (req.query.hasOwnProperty('with') && req.query.with === 'context') {
    const input = req.body.context.trim()
    const opts = { vers: req.query.vers, lang: req.query.lang }

    const current_block = db
      .get('blocks')
      .get(req.params.id)
      .value()
    const current_html = current_block.html
      .replace(/"({[^}]+})"/g, "'$1'")
      .replace(/&quot;/g, '"')

    const parsed_html = reparseWithContext(input, current_html, opts)
    const { html, refs } = getRefs(req.params.id, parsed_html)

    block = db
      .get('blocks')
      .get(req.params.id)
      .assign({
        html: normHtml(html),
        refs,
      })
      .write()
  } else {
    block = db
      .get('blocks')
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

app.use(Raven.errorHandler())

app.listen(port)

opn(`http://localhost:${port}/`, { wait: false })
