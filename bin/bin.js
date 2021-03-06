#!/usr/bin/env node

const { betterify } = require('@bhdirect/betterify')
const chalk = require('chalk')
const epubCheck = require('epub-check')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { main } = require('../index.js')
const path = require('path')
const serveReport = require('../lib/report/serve-report')
const { prepReportData } = require('../lib/report/prep-report-data')
const { toJSON, toXHTML } = require('../lib/himalaya-io')
const Raven = require('raven')

Raven.config(
  'https://b8b67b87430a438d8852046136071b1f:c8ddc85524414a95b30954bf736ab7ee@sentry.io/289744'
).install()

/* eslint brace-style: 0 */

Raven.context(function() {
  process.on('unhandledRejection', err => {
    console.log(err)
  })

  const cwd = process.cwd()
  const skip_validate =
    process.argv.includes('-s') || process.argv.includes('--skip')
  const data_save_mode =
    process.argv.includes('-d') || process.argv.includes('--data')
  const no_alternates_mode =
    process.argv.includes('-n') || process.argv.includes('--no-alt')
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
        'Vulgate',
      ],
      default: 0,
    }

    const lang_prompt = {
      type: 'list',
      name: 'language',
      message: 'What is the primary language?',
      choices: ['English', 'Spanish', 'Portuguese'],
      default: 0,
    }

    if (crossrc.hasOwnProperty('titleProps')) {
      prompts =
        crossrc.titleProps.hasOwnProperty('versification') &&
        crossrc.titleProps.versification !== ''
          ? []
          : [trans_prompt]
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

  const overwrite_prompt = [
    {
      type: 'confirm',
      name: 'overwrite',
      message:
        'Percival data found. Are you sure you want to start over and overwrite existing data?',
      default: false,
    },
  ]

  const finish_prompt = [
    {
      type: 'confirm',
      name: 'finish',
      message:
        'Ready to finish? Great! Say yes, and I will make your selected changes and do some final cleanup.',
      default: false,
    },
  ]

  const unconfPrompt = unconf_count => {
    const num_agree = unconf_count > 1 ? 'references' : 'reference'
    return [
      {
        type: 'confirm',
        name: 'unconf_finish',
        message: `I found ${unconf_count} unconfirmed ${num_agree}. Are you sure you want to finish?`,
        default: false,
      },
    ]
  }

  const getFileNames = text_dir => {
    return fs
      .readdirSync(text_dir)
      .filter(thing => fs.lstatSync(path.join(text_dir, thing)).isFile())
      .filter(file => file.endsWith('.xhtml'))
      .filter(
        file =>
          // allow tagging of scripture within footnotes
          /*!/_(?:index|titlepage|bibliography|cover|copyright-page|footnotes)/.test(
            file
          )*/
          !/_(?:index|titlepage|bibliography|cover|copyright-page)/.test(
            file
          )
      )
  }

  const parseEpubContent = (text_dir, rc_loc, percy_data_loc) => {
    const files = getFileNames(text_dir)

    if (files.length === 0)
      throw new Error(
        'No qualifying XHTML file found in the `OEBPS/text` directory.'
      )
    if (data_save_mode) console.log(`👨‍💻 Data save/inspect mode`)
    const crossrc = fs.existsSync(rc_loc)
      ? JSON.parse(fs.readFileSync(rc_loc, { encoding: 'utf8' }))
      : {}
    let vol_title = crossrc.titleProps.title.collection
      ? `${crossrc.titleProps.title.collection}: `
      : ''
    vol_title += crossrc.titleProps.title.main
    return inquirer.prompt(setPrompts(crossrc)).then(response => {
      const vers = response.translation
        ? getVersification(response.translation)
        : crossrc.titleProps.versification
      const lang = response.language
        ? getLang(response.language)
        : crossrc.titleProps.language
      if (
        crossrc.hasOwnProperty('titleProps') &&
        !crossrc.titleProps.versification
      ) {
        crossrc.titleProps.versification = vers
        fs.writeJsonSync(rc_loc, crossrc, { spaces: 2 })
      }
      console.log(
        `${chalk.bold('Locating Bible references in:')} \n${chalk.green(
          vol_title
        )}\n`
      )
      main(
        text_dir,
        files,
        { vers, lang },
        data_save_mode,
        no_alternates_mode
      ).then(all_data => {
        return all_data
          ? fs.outputJsonSync(
              percy_data_loc,
              prepReportData(vol_title, all_data, { vers, lang })
            )
          : Promise.resolve()
      })
    })
  }
  const getPercyHtml = (doc_id, blocks, remove_data) => {
    const block_ids = []
    for (const block in blocks) {
      if (
        blocks.hasOwnProperty(block) &&
        blocks[block].html &&
        block.startsWith(`${doc_id}-`)
      ) {
        block_ids.push(block)
      }
    }
    const html = block_ids
      .map(block => blocks[block].html)
      .join('\n')
      .replace(/"({[^}]+})"/g, "'$1'")
      .replace(/&quot;/g, '"')
    return !remove_data
      ? html
      : html
          .replace(/(data-ref(?:="[^"]*?")?)(?: id="([^"]+)")?/g, '$1')
          .replace(/<(?:hr|span) data-parsing="[^"]*?" ?\/>/g, '')
          .replace(/<span data-parsing=[^>]+>([^<]*?)<\/span>/g, '$1')
          .replace(/(<img[^>]*?)alt ([^>]*>)/g, '$1alt=""$2')
          // revert internal links that were modified for the UI
          .replace(/(href=")epub\/([^\/"#.]+\.xhtml#[^"]+") target="_blank"/g, '$1$2')
  }
  const getNewHtml = (orig_html, percy_html, regex, file_name) =>
    orig_html
      .replace(regex, (match, cg1, cg2) => cg1.concat(percy_html, cg2))
      // footer tags were stripped out on initial file reading, so they need to be re-inserted, but not in footnotes files (they don't have footers)
      .replace(/^ *<div[^>\n]*epub:type="footnote"/m, match => {
        return file_name.includes("footnotes")
          ? match
          : `      <footer epub:type="footnotes">\n${match}`
      })
      .replace(/(<div[^>\n]*epub:type="footnote"[^>\n]*>\s*<p>.*?<\/p>\s*<\/div>\n?)(\s*(?:<\/section>|<\/body>))/, (match, cg1, cg2) => {
        return file_name.includes("footnotes")
          ? match
          : `${cg1}      </footer>\n${cg2}`
      });

  const runPercival = dir => {
    const text_dir = path.join(dir, 'OEBPS', 'text')
    const rc_loc = path.join(dir, 'META-INF', 'crossrc.json')
    const percy_data_loc = path.join(dir, 'META-INF', 'percival.json')
    console.log('')
    const getUnconfCount = () => {
      const percy_data = fs.readJsonSync(percy_data_loc, { encoding: 'utf8' })
      let unconf_count = 0
      for (const doc in percy_data.fs_docs) {
        if (
          percy_data.fs_docs.hasOwnProperty(doc) &&
          percy_data.fs_docs[doc].name
        ) {
          unconf_count = Object.keys(percy_data.blocks).reduce((a, key) => {
            const { refs } = percy_data.blocks[key]
            return (
              a +
              Object.keys(refs).reduce((b, k) => {
                const ref = refs[k]
                return ref.data.hasOwnProperty('confirmed') &&
                  ref.data.confirmed
                  ? b
                  : b + 1
              }, 0)
            )
          }, 0)
        }
      }
      return unconf_count
    }
    const doIt = () => {
      if (fs.existsSync(text_dir)) {
        parseEpubContent(text_dir, rc_loc, percy_data_loc).then(() => {
          serveReport(dir)
          console.log('\n' + chalk.magenta.dim('Starting percival server...'))
        })
      } else {
        throw new Error(
          '`OEBPS/text` folder not found. Try again from an EPUB root directory.'
        )
      }
    }
    const finishIt = () => {
      console.log(`\nWriting files and cleaning up...`)
      const percy_data = fs.readJsonSync(percy_data_loc, { encoding: 'utf8' })
      for (const doc in percy_data.fs_docs) {
        if (
          percy_data.fs_docs.hasOwnProperty(doc) &&
          percy_data.fs_docs[doc].name
        ) {
          const file = percy_data.fs_docs[doc].name
          const src_html = fs.readFileSync(path.join(text_dir, file), {
            encoding: 'utf8',
          })
          const percy_html = getPercyHtml(doc, percy_data.blocks, true)
          const body_sect_regex = /(<body[^>]*?>\s+<(?:section|div)[^>]*?>)[\s\S]+(<\/(?:section|div)>\s+<\/body>)/
          const body_regex = /(<body[^>]*?>)[\s\S]+(<\/body>)/
          const new_html = body_sect_regex.test(src_html)
            ? getNewHtml(src_html, percy_html, body_sect_regex, file)
            : getNewHtml(src_html, percy_html, body_regex, file)
          const new_json = toJSON(new_html)
          fs.outputFileSync(
            path.join(text_dir, file),
            betterify(toXHTML(new_json))
          )
        }
      }
      fs.removeSync(percy_data_loc)
      console.log(`\n${chalk.green('All done!')}`)
    }
    if (fs.existsSync(percy_data_loc) && !continue_mode && !finish_mode) {
      inquirer.prompt(overwrite_prompt).then(response => {
        if (response.overwrite) {
          console.log('')
          doIt()
        } else {
          console.log(
            "\n  Ok. I won't make any changes...\n\n  • To pick up where you left off, use `percival continue`\n  • Or if you're ready to finalize your work, use `percival finish`"
          )
        }
      })
    } else if (continue_mode) {
      if (fs.existsSync(percy_data_loc)) {
        serveReport(dir)
        console.log(chalk.magenta.dim('Starting percival server...'))
      } else {
        console.log(
          "\n  Hmm. I really want to start the server for you, but the data I need to continue isn't there. Say `percival`, and I'll do my thing!"
        )
      }
    } else if (finish_mode) {
      if (fs.existsSync(percy_data_loc)) {
        inquirer.prompt(finish_prompt).then(response => {
          if (response.finish) {
            console.log(`\n${chalk.italic('Checking for unconfirmed refs...')}`)
            const unconf_count = getUnconfCount()
            if (unconf_count > 0) {
              inquirer.prompt(unconfPrompt(unconf_count)).then(res => {
                if (res.unconf_finish) finishIt()
                else
                  console.log(
                    "\n  Ok. I won't make any changes...\n\n  • To pick up where you left off, use `percival continue`"
                  )
              })
            } else {
              console.log(
                `${chalk.green(
                  "100% confirmed refs! That's what I like to see!"
                )}`
              )
              finishIt()
            }
          } else {
            console.log(
              "\n  Ok. I won't make any changes...\n\n  • To pick up where you left off, use `percival continue`\n  • Or to start over, just use plain ol' `percival`"
            )
          }
        })
      } else {
        console.log(
          "\n  Hmm. The data I need isn't there. Have you run percival on this directory? Say `percival`, and I'll do my thing!"
        )
      }
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
    epubCheck(cwd)
      .then(data => {
        if (data.pass) {
          console.log(`✔ Valid EPUB`)
          runPercival(cwd)
        } else {
          let err_msg = '✘ This EPUB is not valid. Fix errors and try again.\n'
          if (data.messages.length > 30) {
            err_msg += `\nPlease run EpubCheck elsewhere and address all ${
              data.messages.length
            } issues before running percival again.`
          } else {
            data.messages.forEach(msg => {
              err_msg += `\n${msg.type} | file: ${msg.file} line: ${
                msg.line
              } col: ${msg.col} | ${msg.msg}`
            })
          }
          throw err_msg
        }
      })
      .catch(err => {
        console.error(err)
      })
  }
})
