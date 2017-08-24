#!/usr/bin/env node

const epubCheck = require('epub-check')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const main = require('../index.js')
const path = require('path')


process.on('unhandledRejection', (err) => {
  console.log(err)
})

const cwd = process.cwd()
const skip_validate = process.argv.includes('-s')
const data_save_mode = process.argv.includes('-d')

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
    prompts = crossrc.titleProps.hasOwnProperty('versification') ? [] : [trans_prompt]
  } else {
    prompts = [trans_prompt, lang_prompt]
  }
  return prompts
}

const getVersification = (translation) => {
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

const getLang = (language) => {
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

const parseEpubContent = (dir, save_data) => {
  const text_dir = path.join(dir, 'OEBPS/text')
  const rc_loc = path.join(dir, 'META-INF/crossrc.json')

  if (fs.existsSync(text_dir)) {
    const files = fs.readdirSync(text_dir)
      .filter(thing => { return fs.lstatSync(path.join(text_dir, thing)).isFile() })
      .filter(file => { return file.endsWith('.xhtml') })
      .filter(file => { return !file.includes('index') })
      .filter(file => { return !file.includes('bibliography') })
      .filter(file => { return !file.includes('footnotes') })
      .filter(file => { return !file.includes('copyright') && !file.includes('cover') && !file.includes('titlepage')})

    if (files.length === 0) throw new Error('No qualifying XHTML file found in the `OEBPS/text` directory.')
    if (save_data) console.log(`\nData save/inspect mode 🔎`)

    const crossrc = fs.existsSync(rc_loc) ? JSON.parse(fs.readFileSync(rc_loc, {encoding: 'utf8'})) : {}

    inquirer.prompt(setPrompts(crossrc))
      .then(response => {
        const vers = response.translation ?
          getVersification(response.translation) :
          crossrc.titleProps.versification

        const lang = response.language ?
          getLang(response.language) :
          crossrc.titleProps.language

        if (crossrc.hasOwnProperty('titleProps') && !crossrc.titleProps.versification) {
          crossrc.titleProps.versification = vers
          fs.writeJson(rc_loc, crossrc, {spaces: 2})
        }

        if (files.length === 1) console.log('\nFinding Bible references in 1 text file...\n')
        if (files.length > 1) console.log(`\nFinding Bible references in ${files.length} text files...\n`)

        main(text_dir, files, { vers, lang }, save_data)
          .then(() => { console.log('\nDone!') })
      })
  } else {
    throw new Error('`OEBPS/text` folder not found. Try again from an EPUB root directory.')
  }
}

if (skip_validate) {
  console.log(`Skipping EpubCheck 🤗`)
  parseEpubContent(cwd, data_save_mode)
} else {
  console.log(`Checking EPUB validity...`)
  epubCheck(cwd).then(data => {
    if (data.pass) {
      console.log(`✔ Valid EPUB\n`)
      parseEpubContent(cwd, data_save_mode)
    } else {
      let err_msg = '✘ This EPUB is not valid. Fix errors and try again.\n'
      data.messages.forEach(msg => {
        err_msg += `\n${msg.type} | file: ${msg.file} line: ${msg.line} col: ${msg.col} | ${msg.msg}`
      })
      throw err_msg
    }
  }).catch(err => { console.error(err) })
}
