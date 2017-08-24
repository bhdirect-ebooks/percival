const assignConfidence = require('./assign-confidence')
const getErrorMsg = require('./get-error-msg.js')

String.prototype.splice = function(idx, rem, str) {
  return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem))
}

const setAttrValue = (type, ref_data, valid, conf_val) => {
  if (valid) {
    return {
      scripture: ref_data.default,
      valid: true,
      confidence: conf_val
    }
  } else {
    if (type === 'explicit') {
      return {
        scripture: ref_data.default,
        valid: false,
        message: getErrorMsg(ref_data.validity)
      }
    } else {
      return {
        scripture: ref_data.default,
        valid: false,
        message: getErrorMsg(ref_data.validity),
        context: ref_data.context_used
      }
    }
  }
}

const tagRef = (ref_data, before, base_conf, type) => {
  const confidence = assignConfidence(ref_data, before, base_conf, type)
  const is_valid = ref_data.validity.valid

  if (type === 'explicit' && !is_valid && confidence < 10) {
    return before

  } else {
    const attr_value = is_valid ?
      setAttrValue(type, ref_data, true, confidence) :
      setAttrValue(type, ref_data, false)

    before = before.splice(ref_data.indices[1], 0, '</a>')
    return before.splice(ref_data.indices[0], 0, `<a data-cross-ref='${JSON.stringify(attr_value)}'>`)
  }
}

const getMarkupData = (ref_data, before, opts) => {
  return {
    ref_data,
    before_text: before,
    after_text: tagRef(ref_data, before, opts.base_confidence, opts.type)
  }
}

module.exports = getMarkupData
