const deepCopyTagRefs = require('./lib/deep-copy-tag-refs')
const fs = require('fs-extra')
const { toJSON, toXHTML } = require('./lib/himalaya-io')
const log = require('single-line-log').stdout;
const path = require('path')
const tagLocal = require('./lib/tag-local-orphans')

const main = (text_dir, files, opts = {vers: 'default', lang: 'en'}) => {
  // get explicit parse data and tagged content
  let all_data = files.map(file => {
    log(' - Tagging explicit refs: ' + file)
    const json = toJSON(fs.readFileSync(path.join(text_dir, file), {encoding: 'utf8'}));
    const { tagged, data } = deepCopyTagRefs(json, 'explicit', opts, log, file)
    const html = toXHTML(tagged)
    log.clear()

    return {
      id: file.toLowerCase().replace('.xhtml', ''),
      name: file,
      explicit: {
        parse_data: data,
        html
      },
      nearby: {},
      with_context: {},
      final_html: html
    }
  })
  log('')
  console.log(' ✔︎ Tagged explicit refs')

  // get any missed local orphans
  all_data = all_data.map(file_data => {
    log(' - Tagging nearby orphans (nearby context): ' + file_data.name)
    const { data, html } = tagLocal(file_data.final_html, opts)

    if (data.length > 0) {
      file_data.nearby = {
        parse_data: data,
        html
      }
      file_data.final_html = html
    }

    return file_data
  })
  log('')
  console.log(' ✔︎ Tagged local orphans (nearby context)')

  // tag remaining orphans using provided context
  all_data = all_data.map(file_data => {
    log(' - Tagging remaining orphans (using context tags): ' + file_data.name)
    const json = toJSON(file_data.final_html);
    const { tagged, data } = deepCopyTagRefs(json, 'context', opts, log, file_data.name)
    const html = toXHTML(tagged)

    if (data.length > 0) {
      file_data.with_context = {
        parse_data: data,
        html
      }
      file_data.final_html = html
    }

    log.clear()
    return file_data
  })
  log('')
  console.log(' ✔︎ Tagged remaining orphans (given context)')

  all_data.forEach(file_data => {
    fs.outputFileSync(path.join(text_dir, 'test', file_data.name), file_data.final_html)
  })

  return fs.outputJson(path.join(text_dir, `test/.percival/data-${new Date().toISOString()}.json`), all_data, {space: 2})
}

module.exports = main;
