'use strict'

const parseExplicit = require('./parse-explicit.js');
const RecursiveIterator = require('recursive-iterator');


const toString = Object.prototype.toString;

const getType = (any) => {
  return toString.call(any).slice(8, -1);
};

const shallowCopy = (any) => {
   const type = getType(any);
   switch (type) {
    case 'Object':
      return {};
    case 'Array':
      return [];
    case 'Date':
      return new Date(any);
    case 'RegExp':
      return new RegExp(any);
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Undefined':
    case 'Null':
      return any;
    default:
      return String(any);
   }
};

const getSafeRef = (ref) => {
  const ref_data = parseExplicit(ref);
  const rev_data = (ref_data.length > 0) ? ref_data.slice(0, 1) : ref_data;
  return (rev_data.validity.valid) ?
    rev_data.default : '';
};

const isEligibleNode = (node, ancestors) => {
  const { grandparent, parent } = ancestors;
  if ( parent.hasOwnProperty('type')
    && grandparent.tagName !== 'a'
    && parent.type === 'Text'
    && parent.content === node) {
    return true;
  }
  return false;
};

const getFinalMarkup = (ref_data_arr) => {
  return ref_data_arr[ref_data_arr.length - 1].after_text;
};

const deepCopyTagRefs = (json, type) => {
  let map = new Map();
  let rootNode = shallowCopy(json);
  let grandparent;
  let context = '';
  let data = [];

  map.set(json, rootNode);

  for (const {parent, node, key} of new RecursiveIterator(json, 0, true)) {
    let parentNode = map.get(parent);
    let cloneNode = shallowCopy(node);

    if (isEligibleNode(node, {grandparent, parent})) {
      let ref_data_arr = ((type === 'explicit') ?
        parseExplicit(node) : parseWithContext(node, context));

      if (ref_data_arr.length > 0) {
        data.push(ref_data_arr);
        cloneNode = getFinalMarkup(ref_data_arr);
      }

    } else {
      if (type === 'context' && parent.hasOwnProperty('crossContext')) {
        let cross_context = JSON.parse(parent.crossContext);
        if (cross_context.hasOwnProperty('scripture')) {
          context = getSafeRef(cross_context.scripture);
        } else if (cross_context.hasOwnProperty('parsing')) {
          context = getSafeRef(cross_context.parsing);
        }
      }
    }

    grandparent = parent;
    parentNode[key] = cloneNode;
    map.set(node, cloneNode);
  }

  map.clear();

  return {tagged: rootNode, data: data};
};