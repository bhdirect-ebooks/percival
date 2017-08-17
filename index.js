'use strict'

const deepCopyTagRefs = require('./lib/deep-copy-tag-refs');
const fs = require('fs-extra');
const { toJSON, toXHTML } = require('./lib/himalaya-io');
const PouchDB = require('pouchdb');

process.on('unhandledRejection', (err) => {
  console.log(err);
});

const main = (path_or_html, db, doc, opts = {vers: 'default', lang: 'en'}) => {
  let promises = [];

  const json = (fs.existsSync(path_or_html)) ?
    toJSON(fs.readFileSync(path_or_html, {encoding: 'utf8'})) :
    toJSON(path_or_html);

  // first run through parser, tagging explicit refs only
  const { tagged, data } = deepCopyTagRefs(json, 'explicit', opts);

  // update db with data
  if (db) {
    promises.push(updateDoc(db, doc._id, [
      { key: 'begin', val: json },
      { key: 'explicit', val: tagged },
      { key: 'explicit_data', val: data }
    ]));
  }

  return toXHTML(tagged);

};

const updateDoc = (db, doc_id, data_arr) => {
  return db.get(doc_id)
    .then(doc => {
      data_arr.forEach(obj => {
        doc[obj.key] = obj.val;
      });
      return db.put(doc);
    });
};

module.exports = main;