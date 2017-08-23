const bcv_parser = require('bible-passage-reference-parser/js/en_bcv_parser')
const es_bcv_parser = require('bible-passage-reference-parser/js/es_bcv_parser')
const pt_bcv_parser = require('bible-passage-reference-parser/js/pt_bcv_parser')

require('reversify')( bcv_parser )
require('reversify')( es_bcv_parser )
require('reversify')( pt_bcv_parser )

const initParser = (lang) => {
  if (lang === 'es') return new es_bcv_parser.bcv_parser()
  else if (lang === 'pt') return new pt_bcv_parser.bcv_parser()
  else return new bcv_parser.bcv_parser()
}

const parsedRefObj = (bcv_entities, verse_system, bcv, context = '') => {
  return bcv_entities.map(ref_data => {
    const full_ref = ref_data.translations[0] ?
      `${ref_data.osis} ${ref_data.translations[0]}` :
      `${ref_data.osis}`

    const deep_data = ref_data.entities[0]

    return {
      context_used: context,
      osis: ref_data.osis,
      default: deep_data.valid.valid ? bcv.parse(full_ref).reversify('hcsb') : ref_data.osis,
      indices: deep_data.absolute_indices,
      validity: {
        valid: deep_data.valid.valid,
        message: deep_data.valid.messages,
        start: deep_data.start,
        end: deep_data.end,
      }
    }
  })
}

const parsedGroupsObj = (bcv_group, verse_system, bcv, context) => {
  return {
    indices: bcv_group.indices,
    refs: context ?
      parsedRefObj(bcv_group.entities, verse_system, bcv, context) :
      parsedRefObj(bcv_group.entities, verse_system, bcv)
  }
}

const getParseData = (text, opts = {}) => {
  const verse_system = opts.vers ? opts.vers : 'default'
  const with_context = opts.context ? true : false

  const bcv = opts.lang ? initParser(opts.lang) : initParser('en')

  bcv.set_options({
    osis_compaction_strategy: 'bcv',
    book_sequence_strategy: 'ignore',
    single_chapter_1_strategy: 'verse',
    book_range_strategy: 'ignore',
    invalid_passage_strategy: 'include',
    book_alone_strategy: 'ignore',
    include_apocrypha: typeof opts.apoc !== 'undefined' ? opts.apoc : true,
    versification_system: verse_system
  })

  const parsed = !with_context ?
    bcv.parse(text).parsed_entities() :
    bcv.parse_with_context(text, opts.context).parsed_entities()

  return parsed.map(group => {
    return opts.context ?
      parsedGroupsObj(group, verse_system, bcv, opts.context) :
      parsedGroupsObj(group, verse_system, bcv)
  })

}

module.exports = getParseData
