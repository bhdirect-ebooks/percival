'use strict';

const himalaya = require('himalaya');
const toHTML = require('himalaya/translate').toHTML;

const toJSON = (html) => {
  return himalaya.parse(html);
};

const toXHTML = (json) => {
  return toHTML(json)
    .replace(/<\?xml.*?>/, '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>')
    .replace('</?xml>', '')
    .replace('!doctype', '!DOCTYPE')
    .replace(/([a-z:]+=)'([^']+)'/gi, '$1\"$2\"')
    .replace(/<(link|hr|img|source)([^>]+)>/gi, '<$1$2 />')
    .replace(/<br>/gi, '<br />')
    .replace(/<video(.*?)controls(.*?)>/gi, '<video$1controls=\"controls\"$2>')
    .replace(/(data-cross-[a-z]+)="\{(.*?)\}"/gi, '$1=\'{$2}\'')
    .replace(/alt="0"/gi, 'alt=\"\"')
    .replace(/(<span epub:type="pagebreak"[^>]+)><\/span>/gi, '$1 />');
};

module.exports = ({toJSON: toJSON, toXHTML: toXHTML});