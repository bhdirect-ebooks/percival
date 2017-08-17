#!/usr/bin/env node
'use strict'

const deepCopyTagRefs = require('./lib/deep-copy-tag-refs')
const fs = require('fs-extra')
const { toJSON, toXHTML } = require('./lib/himalaya-io')
const path = require('path')
//const ProgressBar = require('progress')
/*const PouchDB = require('pouchdb')
let PromiseBar = require("promise.bar")
PromiseBar.enable()
PromiseBar.conf.flat = false

process.on('unhandledRejection', (err) => {
  console.log(err)
})*/

const main = (text_dir, files, opts = {vers: 'default', lang: 'en'}) => {

  /* initialize db
  const db_name = `META-INF/percival-${new Date().toISOString()}`
  const db = new PouchDB(db_name);
  const init_db = files.map(file => {
    return db.put({
      _id: file.toLowerCase().replace('.xhtml', ''),
      name: file
    })
  })*/

  // begin file processing
  //const db_update = files.map((file, i) => {
  const file_data = files.map(file => {
    const _id = file.toLowerCase().replace('.xhtml', '')
    // get explicit parse data and tagged content
    const json = toJSON(fs.readFileSync(path.join(text_dir, file), {encoding: 'utf8'}));
    const { tagged, data } = deepCopyTagRefs(json, 'explicit', opts)
    //return init_db[i].then(res => {
      //return updateDoc(db, res._id, [
    return {
      _id : _id,
      explicit: {
        before: json,
        tagged: tagged,
        parse_data: data,
        html: toXHTML(tagged)
      }
    }
    //})
  })

  //PromiseBar.all(db_update, {label: "Parsing Explicit Refs"})
  //const write_arr = files.map((file, i) => {
    //return db_update[i].then(res => {
  console.log('Writing New Files')
  file_data.forEach((data, i) => {
    fs.outputFileSync(path.join(text_dir, 'test', files[i]), data.explicit.html)
    //})
  })

  /*PromiseBar.all(write_arr, {label: "Writing New Files"})
    .then(() => { return 'Done!'})*/

  return fs.writeJson(`/Users/wlittre/Desktop/9781433651205 copy/META-INF/percival-${new Date().toISOString()}.json`, file_data)
}

/*const updateDoc = (db, doc_id, data_arr) => {
  return db.get(doc_id)
    .then(doc => {
      data_arr.forEach(obj => {
        doc[obj.key] = obj.val;
      })
      return db.put(doc)
    })
};*/

main('/Users/wlittre/Desktop/9781433651205 copy/OEBPS/text', ['02_body02_chapter01.xhtml', '02_body03_chapter02.xhtml'])

module.exports = main;
