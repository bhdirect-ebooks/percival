#!/usr/bin/env node
'use strict'

const fs = require('fs');
const main = require('../index.js');
const path = require('path');


const cmd_cnt = process.argv.length;

if (cmd_cnt > 2) {
  const file_path = process.argv[2];

  if (fs.existsSync(file_path) && fs.lstatSync(file_path).isFile() && file_path.endsWith('.xhtml')) {
    const cwd = path.dirname(file_path);
    const file = path.basename(file_path);
    const output = main(file_path);
    fs.writeFileSync(path.resolve(cwd, file), output);
  } else {
    throw new Error('File not found or not XHTML. Try again.');
  }
} else {
  const text_dir = path.join(process.cwd(), 'OEBPS/text');

  if (existsSync(text_dir)) {
    const files = fs.readdirSync(cwd)
      .filter(thing => fs.lstatSync(path.join(cwd, thing)).isFile())
      .filter(file => file.endsWith('.xhtml'));

    if (files.length === 0) throw new Error('No XHTML files found in the `OEBPS/text` directory.');

    if (files.length === 1) console.log('Processing 1 file...');

    if (files.length > 1) console.log(`Processing ${files.length} files...`);

    files.forEach(file => {
      const output = main(path.resolve(cwd, file));
      fs.writeFileSync(path.resolve(cwd, file), output);
    });
  } else {
    throw new Error('`OEBPS/text` folder not found. Try again from an EPUB root directory.');
  }
}

console.log('\nAll done!');
