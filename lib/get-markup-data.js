'use strict'

const assignConfidence = require('./assign-confidence');
const getErrorMsg = require('./get-error-msg.js');

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};

const getMarkupData = (ref_data, before, opts) => {
  return {
    ref_data: ref_data,
    before_text: before,
    after_text: tagRef(ref_data, before, opts.base_confidence, opts.type)
  }
};

const tagRef = (ref_data, before, base_conf, type) => {
  const attr_value = (ref_data.validity.valid) ?
    setAttrValue(ref_data, true, before, base_conf, type) :
    setAttrValue(ref_data, false);

  before = before.splice(ref_data.indices[1], 0, '</a>');

  return before.splice(ref_data.indices[0], 0, `<a data-cross-ref='${JSON.stringify(attr_value)}'>`);
};

const setAttrValue = (ref_data, valid, before, base_conf, type) => {
  if (valid) {
    return {
      scripture: ref_data.default,
      valid: true,
      confidence: assignConfidence(ref_data, before, base_conf, type)
    }
  } else {
    return {
      scripture: ref_data.default,
      valid: false,
      message: getErrorMsg(ref_data.validity)
    }
  }
};



module.exports = getMarkupData;