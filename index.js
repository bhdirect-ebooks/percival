const chalk = require('chalk')
const deepCopyTagRefs = require('./lib/deep-copy-tag-refs')
const fs = require('fs-extra')
const { toJSON, toXHTML } = require('./lib/himalaya-io')
const identifyAlternatives = require('./lib/id-alternatives')
const log = require('single-line-log').stdout
const path = require('path')
const tagLocal = require('./lib/tag-local-orphans')

const main = (text_dir, files, opts = {vers: 'default', lang: 'en'}, save_data = false) => {
  // tag explicit refs and initialize data object
  let all_data = files.map(file => {
    log(' - Tagging explicit refs: ' + file)
    const { tagged, data } = deepCopyTagRefs(toJSON(fs.readFileSync(path.join(text_dir, file), {encoding: 'utf8'})), 'explicit', opts, log, file)
    log.clear()

    return {
      id: file.toLowerCase().replace('.xhtml', ''),
      name: file,
      explicit: data,
      nearby: {},
      with_context: {},
      final_html: toXHTML(tagged)
    }
  })
  log('')
  console.log(chalk.green(' ✔︎ ') + 'Tagged explicit refs')

  // tag parenthetical orphans
  all_data = all_data.map(file_data => {
    log(' - Tagging parenthetical orphans: ' + file_data.name)

   /* const local = tagLocal(file_data.final_html, opts)

    if (local.data.length > 0) {
      file_data.nearby = local.data
      file_data.final_html = local.html
    }

    const remote = deepCopyTagRefs(toJSON(file_data.final_html), 'context', opts, log, file_data.name)

    if (remote.data.length > 0) {
      file_data.with_context = remote.data
      file_data.final_html = toXHTML(remote.tagged)
    }*/

    log.clear()
    return file_data
  })
  log('')
  console.log(chalk.green(' ✔︎ ') + 'Tagged parenthetical orphans')

  // locate and tag remaining orphans
  all_data = all_data.map(file_data => {
    log(' - Tagging remaining orphans: ' + file_data.name)

    const local = tagLocal(file_data.final_html, opts)

    if (local.data.length > 0) {
      file_data.nearby = local.data
      file_data.final_html = local.html
    }

    const remote = deepCopyTagRefs(toJSON(file_data.final_html), 'context', opts, log, file_data.name)

    if (remote.data.length > 0) {
      file_data.with_context = remote.data
      file_data.final_html = toXHTML(remote.tagged)
    }

    log.clear()
    return file_data
  })
  log('')
  console.log(chalk.green(' ✔︎ ') + 'Tagged remaining orphans')

  // id and tag all possible ref alternatives
  all_data = all_data.map(file_data => {
    log(' - Identifying alternative refs: ' + file_data.name)

    file_data.final_html = identifyAlternatives(file_data.final_html, opts)

    log.clear()
    return file_data
  })
  log('')
  console.log(chalk.green(' ✔︎ ') + 'Identified alternative refs')

  // write html back to disk
  all_data.forEach(file_data => {
    fs.outputFileSync(path.join(text_dir, file_data.name), file_data.final_html)
  })

  // write data to disk
  if (save_data) {
    return fs.outputJson(path.join(text_dir, `.percival/data-${new Date().toISOString()}.json`), all_data, {space: 2})
  } else {
    return Promise.resolve()
  }
}

module.exports = main
