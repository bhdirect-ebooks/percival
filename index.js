const R = require('ramda')
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

// doing :: (Number, String, String) -> STDOUT
const doing = (step, verb, name) =>
  log(chalk.dim(`[${step}/4]`) + ` ${verb}: ${name}`)

// done :: String -> STDOUT
const done = did => {
  log('')
  return console.log(
    `${chalk.dim('[')} ${chalk.green('✔︎')} ${chalk.dim(']')} ${did}`
  )
}

// initFileDataObj :: (String, Object, String) -> Object
const initFileDataObj = (file, data, final_html) => {
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
    final_html,
  }
}

// readFileUtf8 :: String -> String
const readFileUtf8 = filepath => fs.readFileSync(filepath, { encoding: 'utf8' })

// readHtmlToObject :: (String, String) -> Object
const readHtmlToObject = R.pipe(
  path.join,
  readFileUtf8,
  toJSON
)

// tagExplicit :: ([String], String, {k: v}) -> [Object]
const tagExplicit = (files, text_dir, opts) => {
  const tag = 
  const all_data = R.map(file => {
    doing(1, 'Tagging explicit refs', file)

    const { tagged, data } = deepCopyTagRefs(
      readHtmlToObject(text_dir, file),
      'explicit',
      opts,
      log,
      file
    )

    log.clear()
    return initFileDataObj(file, data, toXHTML(tagged))
  }, files)
  done('Tagged explicit refs')
  return all_data
}

// tagParenthetical :: ([Object], {k: v}) -> [Object]
const tagParenthetical = (all_data, opts) => {
  const new_all = R.map(file_data => {
    doing(2, 'Tagging parenthetical orphans', file_data.name)

    const { data, html } = tagInParens(file_data.final_html, opts)

    file_data.in_parens = data
    file_data.final_html =
      data.length > 0 ? reduceErrors(html, opts) : file_data.final_html

    log.clear()
    return file_data
  }, all_data)
  done('Tagged parenthetical orphans')
  return new_all
}

// remoteContextRun :: String -> {k: v} -> Object -> Object
const remoteContextRun = R.curry((run, opts, file_data) => {
  const { data, tagged } = deepCopyTagRefs(
    toJSON(file_data.final_html),
    'context',
    opts,
    log,
    file_data.name
  )

  file_data[run] = data
  file_data.final_html =
    data.length > 0 ? reduceErrors(toXHTML(tagged), opts) : file_data.final_html

  return file_data
})

// tagOrphans :: ([Object], {k: v}) -> [Object]
const tagOrphans = (all_data, opts) => {
  const new_all = R.map(file_data => {
    doing(3, 'Tagging remaining orphans', file_data.name)

    const { data, html } = tagLocal(file_data.final_html, opts)

    file_data.nearby = data
    file_data.final_html =
      data.length > 0 ? reduceErrors(html, opts) : file_data.final_html

    // tagging some orphans provides better context to others, so
    // we do it twice; more orphans tagged == a better experience
    file_data = R.pipe(
      remoteContextRun('with_context', opts),
      remoteContextRun('second_pass', opts)
    )(file_data)

    log.clear()
    return file_data
  }, all_data)
  done('Tagged remaining orphans')
  return new_all
}

// tagOrphans :: ([Object], {k: v}, ((((a, {k: v}) -> a), a) -> ((a, {k: v}, fn) -> a)) -> [Object]
const idAlternates = (all_data, opts, withOpts) => {
  const cleanUpErrors = html => withOpts(reduceErrors, html)
  const doAlts = R.pipe(
    identifyAlternatives,
    cleanupNameChanges,
    cleanUpErrors
  )
  const new_all = R.map(file_data => {
    doing(4, 'Identifying alternate refs', file_data.name)

    file_data.final_html = doAlts(file_data.final_html, opts)

    log.clear()
    return file_data
  }, all_data)
  done('Identified alternate refs')
  return new_all
}

module.exports.main = (
  text_dir,
  files,
  opts = { vers: 'default', lang: 'en' },
  save_data = false,
  no_alt = false
) => {
  const withOpts = (fn, data) => fn(data, opts, withOpts)
  const tagParenUnary = data => withOpts(tagParenthetical, data)
  const tagOrphanUnary = data => withOpts(tagOrphans, data)
  const findAltsUnary = data => (no_alt ? data : withOpts(idAlternates, data))
  const writeBackFile = file_data =>
    fs.outputFileSync(path.join(text_dir, file_data.name), file_data.final_html)
  const writeEachFile = data => R.forEach(writeBackFile, data)
  const outputData = data =>
    fs.outputJson(
      path.join(text_dir, `.percival/data-${new Date().toISOString()}.json`),
      data,
      { space: 2 }
    )

  const runPercy = R.pipe(
    tagExplicit,
    tagParenUnary,
    tagOrphanUnary,
    findAltsUnary,
    writeEachFile
  )

  const all_data = runPercy(files, text_dir, opts)

  //  if requested, write 'debug' data to disk;
  // return a resolved Promise with the main data object
  return save_data
    ? outputData(all_data).then(() => all_data)
    : Promise.resolve(all_data)
}
