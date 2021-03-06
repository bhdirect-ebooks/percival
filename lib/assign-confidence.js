const getErrorMsg = require('./get-error-msg')

const assignConfidence = (ref_data, before, base_conf, type) => {
  const found_text = before.slice(ref_data.indices[0], ref_data.indices[1])

  switch (type) {
    case 'explicit':
      if (
        /^(?:is\.?|kings?|mark|wisdom|numbers?|act|job|so(?: |,|n[.,]?)?)\W/.test(
          found_text
        )
      ) {
        return base_conf - 8
      } else if (/^(?:Is|So)(?!\.) /.test(found_text)) {
        return base_conf - 6
      } else if (/\bAct\b/.test(found_text)) {
        return base_conf - 5
      } else if (/\b[a-z]+ [\w\W]+ \d+\b/i.test(found_text)) {
        return base_conf - 7
      } else if (/\b[a-zA-Z]+\. [VC][a-z]+ \d+\b/.test(found_text)) {
        return base_conf - 6
      } else if (/\b[a-z]+ \w+ \d+\b/i.test(found_text)) {
        const substring = found_text.replace(/\b\w+ (\w+) \d+\b/i, '$1')
        if (/^(?:[I]+|first|second|third) /i.test(found_text)) {
          return base_conf
        } else {
          return /^(?:ch|v)/i.test(substring) ? base_conf - 1 : base_conf - 7
        }
      } else if (/^(?:Heb\.?) /.test(found_text) && ref_data.indices[0] >= 0) {
        const with_prev = before.slice(
          ref_data.indices[0 - 1],
          ref_data.indices[1]
        )
        return /^[([]/.test(with_prev) ? base_conf - 6 : base_conf
      } else if (
        /^\d+$/.test(found_text) &&
        /^[^.]+\.\d+\.1\b/.test(ref_data.osis)
      ) {
        return base_conf - 6
      } else {
        if (!ref_data.validity.valid) {
          if (/^(?:Heb\.?) /.test(found_text)) {
            return base_conf - 3
          } else if (
            /^(?:Heb|Isa|Song|Acts|Num)/.test(getErrorMsg(ref_data.validity))
          ) {
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

const assignConfWithString = (str, base_conf) => {
  const ref_data = {
    indices: [0, str.length],
    validity: { valid: true },
  }
  return assignConfidence(ref_data, str, base_conf, 'explicit')
}

module.exports = { assignConfidence, assignConfWithString }
