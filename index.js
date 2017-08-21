#!/usr/bin/env node
'use strict'

const deepCopyTagRefs = require('./lib/deep-copy-tag-refs')
const fs = require('fs-extra')
const { toJSON, toXHTML } = require('./lib/himalaya-io')
const log = require('single-line-log').stdout;
const path = require('path')

const main = (text_dir, files, opts = {vers: 'default', lang: 'en'}) => {
  const data = files.map(file => {
    log('Tagging explicit refs: ' + file)
    // get explicit parse data and tagged content
    const json = toJSON(fs.readFileSync(path.join(text_dir, file), {encoding: 'utf8'}));
    const { tagged, data } = deepCopyTagRefs(json, 'explicit', opts, log, file)
    const html = toXHTML(tagged)
    fs.outputFileSync(path.join(text_dir, 'test', file), html)
    log.clear()

    return {
      id: file.toLowerCase().replace('.xhtml', ''),
      name: file,
      explicit: {
        before: json,
        tagged: tagged,
        parse_data: data,
        html: html
      },
      nearby: {},
      with_context: {},
      final_html: ''
    }
  })
  log.clear()
  log(' ✔︎ Tagged explicit refs')

  return fs.outputJson(path.join(text_dir, `test/.percival/data-${new Date().toISOString()}.json`), data, {space: 2})
}

module.exports = main;
