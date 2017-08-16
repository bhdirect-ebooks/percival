'use strict'

const fs = require('fs-extra');
const path = require('path');
const { toJSON, toXHTML } = require('./lib/himalaya-io.js');

const main = (path_or_html, opts = {vers: 'default', lang: 'en'}) => {
  const json = (fs.existsSync(path_or_html)) ?
    toJSON(fs.readFileSync(path_or_html, {encoding: 'utf8'})) :
    toJSON(path_or_html);


};

module.exports = main;