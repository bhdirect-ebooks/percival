#!/usr/bin/env node

const chalk = require('chalk')
const epubCheck = require('epub-check')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const main = require('../index.js')
const path = require('path')
const { prepReportData } = require('../lib/report/prep-report-data')
const serveReport = require('../lib/report/serve-report')

/* eslint brace-style: 0 */

process.on('unhandledRejection', (err) => {
  console.log(err)
})

const cwd = process.cwd()
const skip_validate = process.argv.includes('-s')
const data_save_mode = process.argv.includes('-d')
const continue_mode = process.argv.includes('continue')
const finish_mode = process.argv.includes('finish')

const setPrompts = (crossrc = {}) => {
  let prompts
  const trans_prompt = {
    type: 'list',
    name: 'translation',
    message: 'What is the default translation?',
    choices: [
      'CSB/HCSB, ESV, AMP, NASB, etc.',
      'CEB',
      'KJV/NKJV or NIV',
      'NAB or LXX',
      'NLT or NCV',
      'NRSV',
      'Vulgate'
    ],
    default: 0
  }

  const lang_prompt = {
    type: 'list',
    name: 'language',
    message: 'What is the primary language?',
    choices: ['English', 'Spanish', 'Portuguese'],
    default: 0
  }

  if (crossrc.hasOwnProperty('titleProps')) {
    prompts = crossrc.titleProps.hasOwnProperty('versification') && crossrc.titleProps.versification !== '' ? [] : [trans_prompt]
  } else {
    prompts = [trans_prompt, lang_prompt]
  }
  return prompts
}

const getVersification = translation => {
  switch (translation) {
  case 'CSB/HCSB, ESV, AMP, NASB, etc.':
    return 'default'
  case 'CEB':
    return 'ceb'
  case 'KJV/NKJV or NIV':
    return 'kjv'
  case 'NAB or LXX':
    return 'nab'
  case 'NLT or NCV':
    return 'nlt'
  case 'NRSV':
    return 'nrsv'
  case 'Vulgate':
    return 'vulgate'
  default:
    return 'default'
  }
}

const getLang = language => {
  switch (language) {
  case 'English':
    return 'en'
  case 'Spanish':
    return 'es'
  case 'Portuguese':
    return 'pt'
  default:
    return 'en'
  }
}

const overwrite_prompt = [{
  type: 'confirm',
  name: 'overwrite',
  message: 'Percival data found. Are you sure you want to start over and overwrite existing data?',
  default: false
}]

const finish_prompt = [{
  type: 'confirm',
  name: 'finish',
  message: 'Ready to finish? Great! Say yes, and I will make your selected changes and do some final cleanup.',
  default: false
}]

const parseEpubContent = (text_dir, rc_loc, percy_data_loc) => {
  const files = fs.readdirSync(text_dir)
    .filter(thing => fs.lstatSync(path.join(text_dir, thing)).isFile())
    .filter(file => file.endsWith('.xhtml'))
    .filter(file => !/_(?:index|titlepage|bibliography|cover|copyright-page|footnotes)/.test(file))

  if (files.length === 0) throw new Error('No qualifying XHTML file found in the `OEBPS/text` directory.')
  if (data_save_mode) console.log(`👨‍💻 Data save/inspect mode`)

  const crossrc = fs.existsSync(rc_loc) ? JSON.parse(fs.readFileSync(rc_loc, {encoding: 'utf8'})) : {}
  let vol_title = crossrc.titleProps.title.collection ?
    `${crossrc.titleProps.title.collection}: ` : ''
  vol_title += crossrc.titleProps.title.main

  return inquirer.prompt(setPrompts(crossrc))
    .then(response => {
      const vers = response.translation ?
        getVersification(response.translation) :
        crossrc.titleProps.versification

      const lang = response.language ?
        getLang(response.language) :
        crossrc.titleProps.language

      if (crossrc.hasOwnProperty('titleProps') && !crossrc.titleProps.versification) {
        crossrc.titleProps.versification = vers
        fs.writeJsonSync(rc_loc, crossrc, {spaces: 2})
      }

      console.log(`\n${chalk.bold('Finding Bible references in:')} \n${chalk.green(vol_title)}\n`)

      main(text_dir, files, { vers, lang }, data_save_mode)
        .then(all_data => {
          return all_data ?
            fs.outputJsonSync(percy_data_loc, prepReportData(vol_title, all_data, { vers, lang })) :
            Promise.resolve()
        })
    })
}

const runPercival = dir => {
  const text_dir = path.join(dir, 'OEBPS', 'text')
  const rc_loc = path.join(dir, 'META-INF', 'crossrc.json')
  const percy_data_loc = path.join(dir, 'META-INF', 'percival.json')
  console.log('')

  const doIt = () => {
    if (fs.existsSync(text_dir)) {
      parseEpubContent(text_dir, rc_loc, percy_data_loc)
        .then(() => {
          serveReport(dir)
          console.log('\n' + chalk.magenta.dim('Starting percival server...'))
        })
    } else {
      throw new Error('`OEBPS/text` folder not found. Try again from an EPUB root directory.')
    }
  }

  const finishIt = () => {
    return ''
  }

  if (fs.existsSync(percy_data_loc) && !continue_mode) {
    inquirer.prompt(overwrite_prompt)
      .then(response => {
        if (response.overwrite) doIt()
        else console.log('\n  Ok. I won\'t make any changes...\n  To pick up where you left off, use `percival continue`\n  Or if you\'re ready to finalize your work, use `percival finish`')
      })
  } else if (continue_mode) {
    serveReport(dir)
    console.log(chalk.magenta.dim('Starting percival server...'))
  } else if (finish_mode) {
    inquirer.prompt(finish_prompt)
      .then(response => {
        if (response.finish) finishIt()
        else console.log('\n  Ok. I won\'t make any changes...\n  To pick up where you left off, use `percival continue`\n  Or to start over, just use plain ol\' `percival`')
      })
  } else {
    doIt()
  }
}

if (continue_mode || finish_mode) {
  runPercival(cwd)
} else if (skip_validate) {
  console.log(`🤗 Skipping EpubCheck`)
  runPercival(cwd)
} else {
  console.log(`Checking EPUB validity...`)
  epubCheck(cwd).then(data => {
    if (data.pass) {
      console.log(`✔ Valid EPUB\n`)
      runPercival(cwd)
    } else {
      let err_msg = '✘ This EPUB is not valid. Fix errors and try again.\n'
      data.messages.forEach(msg => {
        err_msg += `\n${msg.type} | file: ${msg.file} line: ${msg.line} col: ${msg.col} | ${msg.msg}`
      })
      throw err_msg
    }
  }).catch(err => { console.error(err) })
}
