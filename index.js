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

// R.curry (line 22) takes any function and makes it a curried function, so its
// useage below takes our 3-arity function that returns 'a' and creates a 1-arity
// function that returns a 1-arity function that returns a 1-arity function that
// returns 'a'. This allows us to use partial application, passing in some
// arguments at one point and more arguments later, not getting only functions
// in return until all parameters are satisfied.

// doing :: Number -> String -> a -> a
const doing = R.curry((step, verb, a) => {
  const name =
    typeof a === 'string' ? a : a.hasOwnProperty('name') ? a.name : ''
  log(chalk.dim(`[${step}/4]`) + ` ${verb}: ${name}`)
  return a
})

// done :: a -> a
const done = a => {
  log.clear()
  return a
}

// doneStep :: (String, a) -> a
const doneStep = (did, a) => {
  log('')
  console.log(`${chalk.dim('[')} ${chalk.green('✔︎')} ${chalk.dim(']')} ${did}`)
  return a
}

// initFileDataObj :: (String, Object, String) -> Object
const initFileDataObj = (file, data, final_html) => {
  return {
    id: file.replace(/^[^_]+(\d\d)_[a-z]+(\d\d\d?)_.*?$/i, '$1-$2'),
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
const readFileUtf8 = filepath => fs.readFileSync(filepath, { encoding: 'utf8' }).replace(/^ *<\/?footer[^>]*>\n/gm, '') // remove footer tags

// tagExplicit :: ([String], String, {k: v}) -> [Object]
const tagExplicit = (files, text_dir, opts) => {
  const logDoing = doing(1, 'Tagging explicit refs')
  const getPath = filename => path.join(text_dir, filename)
  const explicitRun = obj => deepCopyTagRefs(obj, 'explicit', opts)

  const tagFile = file => {
    const getDataObj = explicit =>
      initFileDataObj(file, explicit.data, toXHTML(explicit.tagged))

    // R.pipe returns a function that is a pipeline of functions from the first
    // parameter to the last. The first function can be any arity, but the rest
    // must have arity of 1. As you would expect, the return of each function is
    // the argument for the next.
    return R.pipe(
      logDoing,
      getPath,
      readFileUtf8,
      toJSON,
      explicitRun,
      getDataObj,
      done
    )(file) // Immediately invoking the pipeline
  }

  const all_data = R.map(tagFile, files)

  doneStep('Tagged explicit refs')
  return all_data
}

// tagParenthetical :: ([Object], {k: v}) -> [Object]
const tagParenthetical = (all_data, opts) => {
  const logDoing = doing(2, 'Tagging parenthetical orphans')
  const parenRun = file_data => {
    const { data, html } = tagInParens(file_data.final_html, opts)
    const final_html =
      data.length > 0 ? reduceErrors(html, opts) : file_data.final_html

    return {
      ...file_data,
      in_parens: data,
      final_html,
    }
  }

  const tagFile = file_data => {
    return R.pipe(
      logDoing,
      parenRun,
      done
    )(file_data)
  }

  const new_all = R.map(tagFile, all_data)

  doneStep('Tagged parenthetical orphans')
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

  const final_html =
    data.length > 0 ? reduceErrors(toXHTML(tagged), opts) : file_data.final_html

  return {
    ...file_data,
    [run]: data,
    final_html,
  }
})

// tagOrphans :: ([Object], {k: v}) -> [Object]
const tagOrphans = (all_data, opts) => {
  const logDoing = doing(3, 'Tagging remaining orphans')
  const localRun = file_data => {
    const { data, html } = tagLocal(file_data.final_html, opts)
    const final_html =
      data.length > 0 ? reduceErrors(html, opts) : file_data.final_html

    return {
      ...file_data,
      nearby: data,
      final_html,
    }
  }
  // tagging some orphans provides better context to others, so we do it twice;
  // more orphans tagged == a better experience
  const remoteRun1 = remoteContextRun('with_context', opts)
  const remoteRun2 = remoteContextRun('second_pass', opts)

  const tagFile = file_data => {
    return R.pipe(
      logDoing,
      localRun,
      remoteRun1,
      remoteRun2,
      done
    )(file_data)
  }

  const new_all = R.map(tagFile, all_data)

  doneStep('Tagged remaining orphans')
  return new_all
}

// tagOrphans :: ([Object], {k: v}, ((((a, {k: v}) -> a), a) -> ((a, {k: v}, fn) -> a)) -> [Object]
const idAlternates = (all_data, _opts, withOpts) => {
  const logDoing = doing(4, 'Identifying alternate refs')
  const idAltsUnary = html => withOpts(identifyAlternatives, html)
  const cleanUpErrors = html => withOpts(reduceErrors, html)
  const doAlts = R.pipe(
    idAltsUnary,
    cleanupNameChanges,
    cleanUpErrors
  )
  const altRun = file_data => {
    return {
      ...file_data,
      final_html: doAlts(file_data.final_html),
    }
  }

  const tagFile = file_data => {
    return R.pipe(
      logDoing,
      altRun,
      done
    )(file_data)
  }

  const new_all = R.map(tagFile, all_data)

  doneStep('Identified alternate refs')
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
    findAltsUnary
  )

  const all_data = runPercy(files, text_dir, opts)

  //  if requested, write 'debug' data to disk;
  // return a resolved Promise with the main data object
  return save_data
    ? outputData(all_data).then(() => all_data)
    : Promise.resolve(all_data)
}
