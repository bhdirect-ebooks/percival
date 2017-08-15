'use strict'

const fs = require('fs-extra');
const path = require('path');
const test = require('ava');
const { toJSON, toXHTML } = require('../lib/himalaya-io.js');

test('himalaya-io exists', t => {
  t.pass(true);
});

const simple_html = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>AMG's Comprehensive Dictionary of New Testament Words</title>
    <link href="../styles/mywsb.css" rel="stylesheet" type="text/css" />
    <link href="../styles/bookstyles.css" rel="stylesheet" type="text/css" />
  </head>
  <body epub:type="frontmatter">
    <section epub:type="cover">
      <img alt="cover" src="../images/cover.jpg" />
    </section>
  </body>
</html>`;

const simple_json = '[{"type":"Element","tagName":"?xml","attributes":{"version":1,"encoding":"UTF-8","standalone":"\\"no\\"?"},"children":[{"type":"Text","content":"\\n"},{"type":"Element","tagName":"!doctype","attributes":{"html":"html"},"children":[]},{"type":"Text","content":"\\n"},{"type":"Element","tagName":"html","attributes":{"xmlns":"http://www.w3.org/1999/xhtml","xmlns:epub":"http://www.idpf.org/2007/ops"},"children":[{"type":"Text","content":"\\n  "},{"type":"Element","tagName":"head","attributes":{},"children":[{"type":"Text","content":"\\n    "},{"type":"Element","tagName":"title","attributes":{},"children":[{"type":"Text","content":"AMG\'s Comprehensive Dictionary of New Testament Words"}]},{"type":"Text","content":"\\n    "},{"type":"Element","tagName":"link","attributes":{"href":"../styles/mywsb.css","rel":"stylesheet","type":"text/css"},"children":[]},{"type":"Text","content":"\\n    "},{"type":"Element","tagName":"link","attributes":{"href":"../styles/bookstyles.css","rel":"stylesheet","type":"text/css"},"children":[]},{"type":"Text","content":"\\n  "}]},{"type":"Text","content":"\\n  "},{"type":"Element","tagName":"body","attributes":{"epub:type":"frontmatter"},"children":[{"type":"Text","content":"\\n    "},{"type":"Element","tagName":"section","attributes":{"epub:type":"cover"},"children":[{"type":"Text","content":"\\n      "},{"type":"Element","tagName":"img","attributes":{"alt":"cover","src":"../images/cover.jpg"},"children":[]},{"type":"Text","content":"\\n    "}]},{"type":"Text","content":"\\n  "}]},{"type":"Text","content":"\\n"}]}]}]';

test('toJSON works', t => {
  const actual = JSON.stringify(toJSON(simple_html));
  const expected = simple_json;
  t.deepEqual(actual, expected);
});

test('toXHTML works', t => {
  const actual = toXHTML(JSON.parse(simple_json));
  const expected = simple_html;
  t.deepEqual(actual, expected);
});

test('can correctly parse a huge file', t => {
  const actual = JSON.stringify(toJSON(fs.readFileSync(path.resolve('./test/AMGCDNTW02_body02_A.xhtml'), 'utf-8')));
  const expected = JSON.stringify(fs.readJsonSync(path.resolve('./test/AMGCDNTW02_body02_A.json')));
  t.deepEqual(actual, expected);
});

test('can correctly convert a huge file back to xhtml', t => {
  const actual = toXHTML(fs.readJsonSync(path.resolve('./test/RSB02_chapter20.json')));
  const expected = fs.readFileSync(path.resolve('./test/RSB02_chapter20.xhtml'), 'utf-8');
  t.deepEqual(actual, expected);
});
