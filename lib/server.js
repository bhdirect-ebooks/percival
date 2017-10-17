const fs = require('fs')
const os = require('os')
const opn = require('opn')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')


const app = express()
const port = 777
const report_loc = path.join(os.homedir(), '.percival/')

const epub_dir = fs.readFileSync(path.join(report_loc, 'epub_dir.txt'), 'utf-8')
const fonts = path.join(epub_dir, 'OEBPS', 'fonts')
const images = path.join(epub_dir, 'OEBPS', 'images')
const styles = path.join(epub_dir, 'OEBPS', 'styles')
const data = path.join(epub_dir, 'META-INF', 'scripture.json')

app.use(express.static(report_loc))

app.use('/fonts', express.static(fonts))
app.use('/images', express.static(images))
app.use('/styles', express.static(styles))

app.use(bodyParser.json())
const adapter = new FileAsync(data)

// Create database instance and start server
low(adapter)
  .then(db => {
    // Routes
    app.get('/data', (req, res) => {
      const files = db.get('files')
      res.send(files)
    })

    // GET /posts/:id
    app.get('/data/:id', (req, res) => {
      const file = db.get('posts')
        .find({ id: req.params.id })
        .value()

      res.send(file)
    })

    // POST /posts
    app.post('/data/:id/block', (req, res) => {
      db.get('data')
        .push(req.body)
        .last()
        .assign({ id: Date.now().toString() })
        .write()
        .then(post => res.send(post))
    })

    // Set db default values
    return db.defaults({ posts: [] }).write()
  })
  .then(() => {
    app.listen(3000, () => console.log('listening on port 3000'))
  })

app.listen(port)

opn(`http://localhost:${port}/#/`, {wait: false})
