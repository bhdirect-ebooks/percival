#!/usr/bin/env node
'use strict'

const deepCopyTagRefs = require('./lib/deep-copy-tag-refs');
const fs = require('fs-extra');
const { toJSON, toXHTML } = require('./lib/himalaya-io');
const path = require('path');
const PouchDB = require('pouchdb');

process.on('unhandledRejection', (err) => {
  console.log(err);
});

const main = async (filepath, db, doc, opts = {vers: 'default', lang: 'en'}) => {
  let promises = [];

  const initial_html = await fs.readFile(filepath, {encoding: 'utf8'});

  const json = toJSON(initial_html);

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

  return Promise.all(promises).then(() => {return toXHTML(tagged);});
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