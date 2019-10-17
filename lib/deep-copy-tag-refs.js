const findAndTagOrphans = require('./find-tag-orphans')
const get = require('lodash.get')
const { parseExplicit } = require('./parse.js')
const RecursiveIterator = require('recursive-iterator')
const { getFinalMarkup } = require('./utils')

const toString = Object.prototype.toString

const getType = any => {
  return toString.call(any).slice(8, -1)
}

const shallowCopy = any => {
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

/*
const getSafeRef = (ref, opts) => {
  const ref_data = parseExplicit(ref, opts)
  return (ref_data[0].validity.valid) ? ref_data[0].default : ''
}
*/

const tagIt = (json, path) => {
  const tag_check = get(
    json,
    path
      .slice(0, path.length - 3)
      .join('.')
      .concat('.tagName'),
    ''
  )
  const attributes = get(
    json,
    path
      .slice(0, path.length - 3)
      .join('.')
      .concat('.attributes'),
    []
  )
  const in_parse = attributes.find(({ key }) => key === 'data-parsing')
  const no_parse = in_parse ? in_parse.value === '' : false
  const in_label = attributes.find(
    ({ key, value }) => key === 'class' && value.includes('label')
  )
  const in_bilio = attributes.find(
    ({ key, value }) => key === 'epub:type' && value.includes('biblioentry')
  )
  return !(tag_check === 'a' || no_parse || in_label || in_bilio)
}

const deepCopyTagRefs = (json, type, opts) => {
  const map = new Map()
  const rootNode = shallowCopy(json)
  const data = []
  let context = ''

  map.set(json, rootNode)

  for (const { parent, node, key, path } of new RecursiveIterator(
    json,
    0,
    true
  )) {
    const parentNode = map.get(parent)
    let cloneNode = shallowCopy(node)
    const is_text =
      parent.hasOwnProperty('type') &&
      parent.type === 'text' &&
      parent.content === node

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
      if (type === 'context') {
        if (
          parent.hasOwnProperty('key') &&
          ['data-context', 'data-parsing'].includes(parent.key)
        ) {
          context = parent.value
        }
      }
    }

    parentNode[key] = cloneNode
    map.set(node, cloneNode)
  }

  map.clear()

  return { tagged: rootNode, data }
}

module.exports = deepCopyTagRefs
