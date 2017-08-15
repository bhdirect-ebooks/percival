'use strict'

const test = require('tape');
const getParseData = require('../lib/get-parse-data.js');

test('get-parse-data exists', t => {
  t.assert(true);
  t.end();
});

test('get-parse-data returns what we need', t => {
  const actual = JSON.stringify(getParseData(`The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. Matt 4:20 The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter.`));
  const expected = '[{"indices":[78,181],"refs":[{"osis":"Exod.3.7","default":"Exod.3.7","indices":[78,84],"validity":{"valid":true,"start":{"b":"Exod","c":3,"v":7},"end":{"b":"Exod","c":3,"v":7}}},{"osis":"Job.12.13","default":"Job.12.13","indices":[86,94],"validity":{"valid":true,"start":{"b":"Job","c":12,"v":13},"end":{"b":"Job","c":12,"v":13}}},{"osis":"Job.28.23-Job.28.24","default":"Job.28.23-Job.28.24","indices":[96,104],"validity":{"valid":true,"start":{"b":"Job","c":28,"v":23,"type":"cv"},"end":{"b":"Job","c":28,"v":24,"type":"integer"}}},{"osis":"Job.36.4","default":"Job.36.4","indices":[106,110],"validity":{"valid":true,"start":{"b":"Job","c":36,"v":4},"end":{"b":"Job","c":36,"v":4}}},{"osis":"Ps.33.13-Ps.33.15","default":"Ps.33.13-Ps.33.15","indices":[112,123],"validity":{"valid":true,"start":{"b":"Ps","c":33,"v":13,"type":"bcv"},"end":{"b":"Ps","c":33,"v":15,"type":"integer"}}},{"osis":"Ps.139.1-Ps.139.4","default":"Ps.139.1-Ps.139.4","indices":[125,132],"validity":{"valid":true,"start":{"b":"Ps","c":139,"v":1,"type":"cv"},"end":{"b":"Ps","c":139,"v":4,"type":"integer"}}},{"osis":"Isa.46.10","default":"Isa.46.10","indices":[134,142],"validity":{"valid":true,"start":{"b":"Isa","c":46,"v":10},"end":{"b":"Isa","c":46,"v":10}}},{"osis":"Jer.23.24","default":"Jer.23.24","indices":[144,152],"validity":{"valid":true,"start":{"b":"Jer","c":23,"v":24},"end":{"b":"Jer","c":23,"v":24}}},{"osis":"Matt.10.29","default":"Matt.10.29","indices":[154,162],"validity":{"valid":true,"start":{"b":"Matt","c":10,"v":29},"end":{"b":"Matt","c":10,"v":29}}},{"osis":"Acts.15.8","default":"Acts.15.8","indices":[164,171],"validity":{"valid":true,"start":{"b":"Acts","c":15,"v":8},"end":{"b":"Acts","c":15,"v":8}}},{"osis":"Heb.4.13","default":"Heb.4.13","indices":[173,181],"validity":{"valid":true,"start":{"b":"Heb","c":4,"v":13},"end":{"b":"Heb","c":4,"v":13}}}]},{"indices":[327,336],"refs":[{"osis":"Matt.4.20","default":"Matt.4.20","indices":[327,336],"validity":{"valid":true,"start":{"b":"Matt","c":4,"v":20},"end":{"b":"Matt","c":4,"v":20}}}]}]';
  t.deepEqual(actual, expected);
  t.end();
});