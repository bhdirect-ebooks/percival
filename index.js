const chalk = require('chalk')
const { cleanupNameChanges } = require('./lib/utils')
const deepCopyTagRefs = require('./lib/deep-copy-tag-refs')
const fs = require('fs-extra')
const { toJSON, toXHTML } = require('./lib/himalaya-io')
const { identifyAlternatives } = require('./lib/id-alternatives')
const log = require('single-line-log').stdout
const path = require('path')
const reduceErrors = require('./lib/reduce-errors')
const tagLocal = require('./lib/tag-local-orphans')
const tagInParens = require('./lib/tag-paren-orphans')

const main = (
  text_dir,
  files,
  opts = { vers: 'default', lang: 'en' },
  save_data = false,
  no_alt = false
) => {
  // tag explicit refs and initialize data object
  let all_data = files.map(file => {
    log(chalk.dim('[1/4]') + ' Tagging explicit refs: ' + file)
    const { tagged, data } = deepCopyTagRefs(
      toJSON(fs.readFileSync(path.join(text_dir, file), { encoding: 'utf8' })),
      'explicit',
      opts,
      log,
      file
    )
    log.clear()

    return {
      id: file
        .toLowerCase()
        .replace(/^[^_]+(\d\d)_[a-z]+(\d\d\d?)_.*?$/, '$1-$2'),
      name: file,
      explicit: data,
      in_parens: [],
      nearby: [],
      with_context: [],
      second_pass: [],
      final_html: toXHTML(tagged),
    }
  })
  log('')
  console.log(
    chalk.dim('[ ') +
      chalk.green('✔︎') +
      chalk.dim(' ] ') +
      'Tagged explicit refs'
  )

  // tag parenthetical orphans
  all_data = all_data.map(file_data => {
    log(
      chalk.dim('[2/4]') + ' Tagging parenthetical orphans: ' + file_data.name
    )
    const paren = tagInParens(file_data.final_html, opts)

    if (paren.data.length > 0) {
      file_data.in_parens = paren.data
      file_data.final_html = reduceErrors(paren.html, opts)
    }

    log.clear()
    return file_data
  })
  log('')
  console.log(
    chalk.dim('[ ') +
      chalk.green('✔︎') +
      chalk.dim(' ] ') +
      'Tagged parenthetical orphans'
  )

  // locate and tag remaining orphans
  all_data = all_data.map(file_data => {
    log(chalk.dim('[3/4]') + ' Tagging remaining orphans: ' + file_data.name)

    const local = tagLocal(file_data.final_html, opts)

    if (local.data.length > 0) {
      file_data.nearby = local.data
      file_data.final_html = reduceErrors(local.html, opts)
    }

    const remote = deepCopyTagRefs(
      toJSON(file_data.final_html),
      'context',
      opts,
      log,
      file_data.name
    )

    if (remote.data.length > 0) {
      file_data.with_context = remote.data
      file_data.final_html = reduceErrors(toXHTML(remote.tagged), opts)
    }

    const remote2 = deepCopyTagRefs(
      toJSON(file_data.final_html),
      'context',
      opts,
      log,
      file_data.name
    )

    if (remote2.data.length > 0) {
      file_data.second_pass = remote2.data
      file_data.final_html = reduceErrors(toXHTML(remote2.tagged), opts)
    }

    log.clear()
    return file_data
  })
  log('')
  console.log(
    chalk.dim('[ ') +
      chalk.green('✔︎') +
      chalk.dim(' ] ') +
      'Tagged remaining orphans'
  )

  // id and tag all possible ref alternatives
  if (!no_alt) {
    all_data = all_data.map(file_data => {
      log(chalk.dim('[4/4]') + ' Identifying alternate refs: ' + file_data.name)

      file_data.final_html = identifyAlternatives(file_data.final_html, opts)
      file_data.final_html = reduceErrors(file_data.final_html, opts)
      file_data.final_html = cleanupNameChanges(file_data.final_html)

      log.clear()
      return file_data
    })
    log('')
    console.log(
      chalk.dim('[ ') +
        chalk.green('✔︎') +
        chalk.dim(' ] ') +
        'Identified alternate refs'
    )
  }

  // write html back to disk
  all_data.forEach(file_data =>
    fs.outputFileSync(path.join(text_dir, file_data.name), file_data.final_html)
  )

  // write 'debug' data to disk, if requested
  return save_data
    ? fs.outputJson(
        path.join(text_dir, `.percival/data-${new Date().toISOString()}.json`),
        all_data,
        { space: 2 }
      )
    : Promise.resolve(all_data)
}

module.exports = main
