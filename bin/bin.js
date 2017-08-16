#!/usr/bin/env node
'use strict'

const fs = require('fs');
const main = require('../index.js');
const path = require('path');
const inquirer = require('inquirer');
const ProgressBar = require('progress');
const epubCheck = require('epub-check');
//const handleOutput = require('handle-output');

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
    console.log(`Parsing Bible references in 1 file...`);
    const cwd = path.dirname(file_path);
    const file = path.basename(file_path);
    const output = main(file_path);
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

const parseEpubContent = (cwd) => {
  const text_dir = path.join(cwd, 'OEBPS/text');

  if (existsSync(text_dir)) {
    const files = fs.readdirSync(text_dir)
      .filter(thing => fs.lstatSync(path.join(text_dir, thing)).isFile())
      .filter(file => file.endsWith('.xhtml'));

    if (files.length === 0) throw new Error('No XHTML files found in the `OEBPS/text` directory.');

    if (files.length === 1) console.log('Parsing Bible references in 1 file...');

    if (files.length > 1) console.log(`Parsing Bible references in ${files.length} files...`);

    files.forEach(file => {
      const output = main(path.resolve(cwd, file));
      //fs.writeFileSync(path.resolve(cwd, file), output);
      //handleOutput(output);
    });
  } else {
    throw new Error('`OEBPS/text` folder not found. Try again from an EPUB root directory.');
  }
}

console.log('\nAll done!');
