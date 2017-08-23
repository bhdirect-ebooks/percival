'use strict'

const findAndTagOrphans = require('./find-tag-orphans')
const get = require('lodash.get')
const { parseExplicit } = require('./parse.js')
const RecursiveIterator = require('recursive-iterator')


const toString = Object.prototype.toString

const getType = (any) => {
  return toString.call(any).slice(8, -1)
}

const shallowCopy = (any) => {
   const type = getType(any)
   switch (type) {
    case 'Object':
      return {}
    case 'Array':
      return []
    case 'Date':
      return new Date(any)
    case 'RegExp':
      return new RegExp(any)
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Undefined':
    case 'Null':
      return any
    default:
      return String(any)
   }
}

const getSafeRef = (ref, opts) => {
  const ref_data = parseExplicit(ref, opts);
  return (ref_data[0].validity.valid) ? ref_data[0].default : ''
}

const getFinalMarkup = (ref_data_arr) => {
  return ref_data_arr[ref_data_arr.length - 1].after_text;
}

const tagIt = (json, path) => {
  const tag_check = get(json, path.slice(0, path.length - 3).join('.').concat('.tagName'), false)
  const attributes = get(json, path.slice(0, path.length - 3).join('.').concat('.attributes'), false)
  return !(
    tag_check === 'a'
    || (attributes.hasOwnProperty('classList') && attributes.classList.includes('label'))
    || (attributes.hasOwnProperty('epub:type') && JSON.stringify(attributes).includes('biblioentry'))
  )
}

const deepCopyTagRefs = (json, type, opts) => {
  let map = new Map();
  let rootNode = shallowCopy(json);
  let context = '';
  let data = [];

  map.set(json, rootNode);

  for (const {parent, node, key, path} of new RecursiveIterator(json, 0, true)) {
    let parentNode = map.get(parent);
    let cloneNode = shallowCopy(node);
    const is_text = parent.hasOwnProperty('type') && parent.type === 'Text' && parent.content === node

    if (is_text && tagIt(json, path)) {
      if (type === 'explicit') {
        const ref_data_arr = parseExplicit(node, opts)
        if (ref_data_arr.length > 0) {
          data.push(ref_data_arr)
          cloneNode = getFinalMarkup(ref_data_arr)
        }
      } else {
        const ref_data = findAndTagOrphans(node, context, opts)
        if (ref_data.data.length > 0) {
          data.push(ref_data.data)
          cloneNode = ref_data.text
        }
      }

    } else {
      if (type === 'context' && parent.hasOwnProperty('crossContext')) {
        let cross_context = JSON.parse(parent.crossContext);
        if (cross_context.hasOwnProperty('scripture')) {
          context = cross_context.scripture
        } else if (cross_context.hasOwnProperty('parsing')) {
          context = cross_context.parsing
        }
      }
    }

    parentNode[key] = cloneNode;
    map.set(node, cloneNode);
  }

  map.clear();

  return {tagged: rootNode, data: data};
};

module.exports = deepCopyTagRefs