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

// Routes
app.get('/data', (req, res) => {
  const state = db.getState()
  res.send(state)
})

app.get('/data/docs', (req, res) => {
  const docs = db.get('docs')
  res.send(docs)
})

app.get('/data/blocks/:id', (req, res) => {
  const block = db.get('blocks')
    .get(req.params.id)
    .value()

  res.send(block)
})

app.post('/data/blocks/:id', (req, res) => {
  const block = db.get('blocks')
    .get(req.params.id)
    .assign({ html: req.body.html, refs: req.body.refs })
    .write()

  res.send(block)
})

app.post('/parse', (req, res) => {
  const input = req.body.input.trim()
  console.log(input)
  const opts = { vers: req.query.vers, lang: req.query.lang }
  let osis_or_mess = ""

  if (/^[\w .,;:-]+$/i.test(input)) {
    const markup_data = parseExplicit(input, opts)
    if (markup_data.length > 0) {
      osis_or_mess = markup_data[0].ref_data.validity.valid ?
        markup_data[0].ref_data.osis :
        getErrorMsg(markup_data[0].ref_data.validity)
    }
  }

  res.send(osis_or_mess)
})

app.listen(port)

opn(`http://localhost:${port}/`, {wait: false})
