'use strict'

const bcv_parser = require('bible-passage-reference-parser/js/en_bcv_parser');
const es_bcv_parser = require('bible-passage-reference-parser/js/es_bcv_parser');
const pt_bcv_parser = require('bible-passage-reference-parser/js/pt_bcv_parser');

require('reversify')( bcv_parser );
require('reversify')( es_bcv_parser );
require('reversify')( pt_bcv_parser );

const getParseData = (text, opts = {}) => {
  const verse_system = (opts.vers) ? opts.vers : 'default';
  const with_context = (opts.context) ? true : false;

  let bcv = (opts.lang) ? initParser(opts.lang) : initParser('en');

  bcv.set_options(
    { 'osis_compaction_strategy': 'bcv'
    , 'book_sequence_strategy': 'ignore'
    , 'single_chapter_1_strategy': 'verse'
    , 'book_range_strategy': 'ignore'
    , 'invalid_passage_strategy': 'include'
    , 'book_alone_strategy': 'ignore'
    , 'include_apocrypha': (opts.apoc) ? opts.apoc : true
    , 'versification_system': verse_system
    }
  );

  const parsed = (!with_context) ?
    bcv.parse(text).parsed_entities() :
    bcv.parse_with_context(text, context).parsed_entities();

  return parsed.map(group => {
    return parsedGroupsObj(group, verse_system, bcv);
  });

}

const initParser = (lang) => {
  if (lang === 'es') return new es_bcv_parser.bcv_parser();
  else if (lang === 'pt') return new pt_bcv_parser.bcv_parser();
  else return new bcv_parser.bcv_parser();
}

const parsedGroupsObj = (bcv_group, verse_system, bcv) => {
  return {
    'indices': bcv_group.indices,
    'refs' : parsedRefObj(bcv_group.entities, verse_system, bcv)
  };
}

const parsedRefObj = (bcv_entities, verse_system, bcv) => {
  return bcv_entities.map(ref_data => {
    const full_ref = (ref_data.translations[0]) ?
      `${ref_data.osis} ${ref_data.translations[0]}` :
      `${ref_data.osis}`

    const deep_data = ref_data.entities[0];

    return {
      'osis': ref_data.osis,
      'default': (deep_data.valid.valid) ? bcv.parse(full_ref).reversify('hcsb') : '',
      'indices': deep_data.absolute_indices,
      'validity': {
        'valid': deep_data.valid.valid,
        'message': deep_data.valid.messages[0],
        'start': deep_data.start,
        'end': deep_data.end,
      }
    }
  })
}

module.exports = getParseData;