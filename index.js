#!/usr/bin/env node
'use strict'

const deepCopyTagRefs = require('./lib/deep-copy-tag-refs')
const fs = require('fs-extra')
const { toJSON, toXHTML } = require('./lib/himalaya-io')
const log = require('single-line-log').stdout;
const path = require('path')
const tagLocal = require('./lib/tag-local-orphans')

const main = (text_dir, files, opts = {vers: 'default', lang: 'en'}) => {
   // get explicit parse data and tagged content
  let data = files.map(file => {
    log(' - Tagging explicit refs: ' + file)
    const json = toJSON(fs.readFileSync(path.join(text_dir, file), {encoding: 'utf8'}));
    const { tagged, data } = deepCopyTagRefs(json, 'explicit', opts, log, file)
    const html = toXHTML(tagged)
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
      final_html: html
    }
  })
  log('')
  console.log(' ✔︎ Tagged explicit refs')

  // get any missed local orphans
  data = data.map(file_data => {
    log(' - Tagging nearby orphaned refs: ' + file_data.name)
    const { data, html } = tagLocal(file_data.final_html, opts)

    if (data.length > 0) {
      file_data.nearby = {
        parse_data: data,
        html: html
      }
      file_data.final_html = html
    }

    log.clear()
    return file_data
  })
  log('')
  console.log(' ✔︎ Tagged local orphans')

  log('Saving files...')
  data.forEach(file_data => {
    fs.outputFileSync(path.join(text_dir, 'test', file_data.name), file_data.final_html)
  })
  log('')
  console.log(' ✔︎ New files saved')

  return fs.outputJson(path.join(text_dir, `test/.percival/data-${new Date().toISOString()}.json`), data, {space: 2})
}

module.exports = main;
