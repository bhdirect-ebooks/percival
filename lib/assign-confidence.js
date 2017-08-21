'use strict'

const assignConfidence = (ref_data, before, base_conf, type) => {
  const found_text = before.slice(ref_data.indices[0], ref_data.indices[1]);

  switch (type) {
    case 'explicit':
      if (found_text.startsWith('is ') || found_text.startsWith('is.')) {
        return base_conf - 8;
      } else if (found_text.startsWith('Is ')) {
        return base_conf - 1;
      } else if (/\bact\b/i.test(found_text)) {
        return base_conf - 4;
      } else if (/\b[a-z]+ \w+ \d+\b/i.test(found_text)) {
        const substring = found_text.replace(/\b\w+ (\w+) \d+\b/i, '$1')
        if (/^(?:[I]+|first|second|third) /i.test(found_text)) {
          return base_conf
        } else {
          return (substring.startsWith('ch') || substring.startsWith('v')) ?
            base_conf - 1 : base_conf - 7;
        }
      } else {
        return base_conf;
      }

    default:
      return base_conf;
    }

}

module.exports = assignConfidence;