#!/usr/bin/env node
'use strict'

const fs = require('fs-extra');
const main = require('../index.js');
const path = require('path');
const inquirer = require('inquirer');
const ProgressBar = require('progress');
const epubCheck = require('epub-check');
//const handleOutput = require('../lib/handle-output');

process.on('unhandledRejection', (err) => {
  console.log(err);
});

const cmd_cnt = process.argv.length;
const validate_markup = !process.argv.includes('-s');
const path_provided = (validate_markup) ? (cmd_cnt > 3) : (cmd_cnt > 2);

if (path_provided) {
  const file_path = process.argv.map((arg, i) => {
    return (i > 1 && !i.includes('-s')) ? arg : '';
  });
  parseFile(file_path.join(''));
} else {
  initEpubParse(process.cwd, validate_markup);
}

const parseFile = (file_path) => {
  if (fs.existsSync(file_path) && fs.lstatSync(file_path).isFile() && file_path.endsWith('.xhtml')) {
    const opts = setOpts(setPrompts());
    console.log(`Parsing Bible references in 1 file...`);
    const cwd = path.dirname(file_path);
    const file = path.basename(file_path);
    const output = main(fs.readFileSync(file_path), opts);
    //fs.writeFileSync(path.resolve(cwd, file), output);
    //handleOutput(output);
  } else {
    throw new Error('File not found or not XHTML. Try again.');
  }
}

const initEpubParse = (cwd, validate) => {
  if (!validate) {
    console.log(`Skipped EpubCheck`);
    parseEpubContent(cwd);
  } else {
    console.log(`Checking EPUB validity...`);
    epubCheck(epub_dir).then(data => {
      if (data.pass) {
        console.log(`✔ Valid EPUB`);
        parseEpubContent(epub_dir);
      } else {
        let err_msg = '✘ This EPUB is not valid. Fix errors and try again.\n';
        data.messages.forEach(msg => {
          err_msg += `\n${msg.type} | file: ${msg.file} line: ${msg.line} col: ${msg.col} | ${msg.msg}`;
        });
      throw err_msg;
      }
    }).catch(err => {console.error(err);});
  }
}

const parseEpubContent = (cwd, crossrc, opts) => {
  const text_dir = path.join(cwd, 'OEBPS/text');
  const rc_loc = path.join(cwd, 'META-INF/crossrc.json');

  const crossrc = (fs.existsSync(rc_loc)) ?
    JSON.parse(fs.readFileSync(rc_loc, {encoding: 'utf8'})) : {};

  const opts = setOpts(setPrompts(crossrc), crossrc);

  if (crossrc !== {} && !crossrc.titleProps.versification) {
    crossrc.titleProps.versification = vers;
    fs.writeJson(rc_loc, crossrc, {spaces: 2});
  }

  if (existsSync(text_dir)) {
    const files = fs.readdirSync(text_dir)
      .filter(thing => { return fs.lstatSync(path.join(text_dir, thing)).isFile() })
      .filter(file => { return file.endsWith('.xhtml') })
      .filter(file => { return !file.includes('index') })
      .filter(file => { return !file.includes('bibliography') })
      .filter(file => { return !file.includes('footnotes') })
      .filter(file => { return !file.includes('copyright') && !file.includes('cover') && !file.includes('titlepage')});

    if (files.length === 0) throw new Error('No XHTML files found in the `OEBPS/text` directory.');

    if (files.length === 1) console.log('Parsing Bible references in 1 file...');

    if (files.length > 1) console.log(`Parsing Bible references in ${files.length} files...`);

    const bar = new ProgressBar('    Progress: [:bar] :rate/bps :percent', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: files.length
    });

    files.forEach(file => {
      const output = main(path.resolve(cwd, file), opts);
      //fs.writeFileSync(path.resolve(cwd, file), output);
      //handleOutput(output);
      bar.tick();
    });
  } else {
    throw new Error('`OEBPS/text` folder not found. Try again from an EPUB root directory.');
  }
}

const setPrompts = (crossrc = {}) => {
  let prompts;
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
  };

  const lang_prompt = {
    type: 'list',
    name: 'language',
    message: 'What is the primary language?',
    choices: ['English', 'Spanish', 'Portuguese'],
    default: 0
  };

  if (crossrc !== {}) {
    prompts = (crossrc.titleProps.versification) ?
      prompts = [] :
      prompts = [trans_prompt];
  } else {
    prompts = [trans_prompt, lang_prompt];
  }
  return prompts;
}

const setOpts = (response, crossrc) => {
  function getVersification(translation) {
    switch (translation) {
      case 'CSB/HCSB, ESV, AMP, NASB, etc.':
        return 'default';
      case 'CEB':
        return 'ceb';
      case 'KJV/NKJV or NIV':
        return 'kjv';
      case 'NAB or LXX':
        return 'nab';
      case 'NLT or NCV':
        return 'nlt';
      case 'NRSV':
        return 'nrsv';
      case 'Vulgate':
        return 'vulgate';
      default:
        return 'default';
    }
  }

  function getLang(language) {
    switch (language) {
      case 'English':
        return 'en';
      case 'Spanish':
        return 'es';
      case 'Portuguese':
        return 'pt';
      default:
        return 'en';
    }
  }

  inquirer.prompt(prompts)
    .then(response => {
      const vers = (response.translation) ?
        getVersification(response.translation) :
        crossrc.titleProps.versification;

      const lang = (response.language) ?
        getLang(response.language) :
        crossrc.titleProps.language;

      return {vers: vers, lang: lang};
    });
}

console.log('\nAll done!');
