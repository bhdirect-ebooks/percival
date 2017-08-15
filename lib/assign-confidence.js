'use strict'

const assignConfidence = (ref_data, before, base_conf, type) => {
  const found_text = before.slice(ref_data.indices[0], ref_data.indices[1]);

  switch (type) {
    case 'explicit':
      if (found_text.startsWith('is ')) {
        return base_conf - 80;
      } else if (found_text.startsWith('Is ')) {
        return base_conf - 30;
      } else if (/\bact\b/i.test(found_text)) {
        return base_conf - 40;
      } else if (/\b\w+ \w+ \d+\b/i.test(found_text)) {
        return base_conf - 70;
      } else {
        return base_conf;
      }

    default:
      return base_conf;
    }

}

module.exports = assignConfidence;