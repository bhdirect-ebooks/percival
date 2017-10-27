const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs-extra')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const opn = require('opn')
const os = require('os')
const path = require('path')


const app = express()
const port = 7777
const report_loc = path.join(os.homedir(), '.percival/')

const epub_dir = fs.readFileSync(path.join(report_loc, 'epub_dir.txt'), 'utf-8')
const fonts = path.join(epub_dir, 'OEBPS', 'fonts')
const images = path.join(epub_dir, 'OEBPS', 'images')
const styles = path.join(epub_dir, 'OEBPS', 'styles')
const data = path.join(epub_dir, 'META-INF', 'percival.json')

app.use('/', express.static(report_loc))

app.use('/fonts', express.static(fonts))
app.use('/images', express.static(images))
app.use('/styles', express.static(styles))

app.use('/data', bodyParser.json())

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

app.listen(port)

opn(`http://localhost:${port}/`, {wait: false})
