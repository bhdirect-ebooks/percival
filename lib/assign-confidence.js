const getErrorMsg = require('./get-error-msg')

const assignConfidence = (ref_data, before, base_conf, type) => {
  const found_text = before.slice(ref_data.indices[0], ref_data.indices[1])

  switch (type) {
  case 'explicit':
    if (/^(?:is\.?|numbers?|so(?:,|n[.,]?)?) /.test(found_text)) {
      return base_conf - 8
    } else if (/^(?:Is|So,?) /.test(found_text)) {
      return base_conf - 1
    } else if (/\bact\b/i.test(found_text) || /\bacts\b/.test(found_text)) {
      return base_conf - 4
    } else if (/\b[a-z]+ \w+\W+ \d+\b/i.test(found_text)) {
      return base_conf - 7
    } else if (/\b[a-zA-Z]+\. [VC][a-z]+ \d+\b/.test(found_text)) {
      return base_conf - 6
    } else if (/\b[a-z]+ \w+ \d+\b/i.test(found_text)) {
      const substring = found_text.replace(/\b\w+ (\w+) \d+\b/i, '$1')
      if (/^(?:[I]+|first|second|third) /i.test(found_text)) {
        return base_conf
      } else {
        return /^(?:ch|v)/i.test(substring) ?
          base_conf - 1 : base_conf - 7
      }
    } else {
      if (!ref_data.validity.valid) {
        if (/^(?:Heb\.?) /.test(found_text)) {
          return base_conf - 3
        } else if (/^(?:Heb|Isa|Song|Acts|Num)/.test(getErrorMsg(ref_data.validity))) {
          return base_conf - 7
        } else {
          return base_conf
        }
      } else {
        return base_conf
      }
    }

  default:
    return base_conf
  }

}

module.exports = assignConfidence
