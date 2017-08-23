'use strict'

const test = require('ava');
const { parseExplicit, parseWithContext } = require('../lib/parse.js');

test('parse-explicit exists', t => {
  t.pass(true);
});

test('parse-explicit returns what we need', t => {
  const actual = JSON.stringify(parseExplicit(`The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. Matt 4:20 The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see James 4:99)`));
  const expected = `[{"ref_data":{"context_used":"","osis":"","default":"","indices":[519,529],"validity":{"valid":false,"message":{"start_verse_not_exist":17},"start":{"b":"Jas","c":4,"v":99},"end":{"b":"Jas","c":4,"v":99}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. Matt 4:20 The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see James 4:99)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. Matt 4:20 The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Matt.4.20","default":"Matt.4.20","indices":[327,336],"validity":{"valid":true,"message":{},"start":{"b":"Matt","c":4,"v":20},"end":{"b":"Matt","c":4,"v":20}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. Matt 4:20 The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Heb.4.13","default":"Heb.4.13","indices":[173,181],"validity":{"valid":true,"message":{},"start":{"b":"Heb","c":4,"v":13},"end":{"b":"Heb","c":4,"v":13}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; Heb 4:13). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Acts.15.8","default":"Acts.15.8","indices":[164,171],"validity":{"valid":true,"message":{},"start":{"b":"Acts","c":15,"v":8},"end":{"b":"Acts","c":15,"v":8}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; Ac 15:8; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Matt.10.29","default":"Matt.10.29","indices":[154,162],"validity":{"valid":true,"message":{},"start":{"b":"Matt","c":10,"v":29},"end":{"b":"Matt","c":10,"v":29}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; Mt 10:29; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Jer.23.24","default":"Jer.23.24","indices":[144,152],"validity":{"valid":true,"message":{},"start":{"b":"Jer","c":23,"v":24},"end":{"b":"Jer","c":23,"v":24}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; Jr 23:24; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Isa.46.10","default":"Isa.46.10","indices":[134,142],"validity":{"valid":true,"message":{},"start":{"b":"Isa","c":46,"v":10},"end":{"b":"Isa","c":46,"v":10}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; Is 46:10; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Ps.139.1-Ps.139.4","default":"Ps.139.1-Ps.139.4","indices":[125,132],"validity":{"valid":true,"message":{},"start":{"b":"Ps","c":139,"v":1,"type":"cv"},"end":{"b":"Ps","c":139,"v":4,"type":"integer"}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; 139:1-4; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Ps.33.13-Ps.33.15","default":"Ps.33.13-Ps.33.15","indices":[112,123],"validity":{"valid":true,"message":{},"start":{"b":"Ps","c":33,"v":13,"type":"bcv"},"end":{"b":"Ps","c":33,"v":15,"type":"integer"}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; Ps 33:13-15; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Job.36.4","default":"Job.36.4","indices":[106,110],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":36,"v":4},"end":{"b":"Job","c":36,"v":4}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; 36:4; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Job.28.23-Job.28.24","default":"Job.28.23-Job.28.24","indices":[96,104],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":28,"v":23,"type":"cv"},"end":{"b":"Job","c":28,"v":24,"type":"integer"}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; 28:23-24; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; <a data-cross-ref=\'{\\"scripture\\":\\"Job.28.23-Job.28.24\\",\\"valid\\":true,\\"confidence\\":10}\'>28:23-24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Job.12.13","default":"Job.12.13","indices":[86,94],"validity":{"valid":true,"message":{},"start":{"b":"Job","c":12,"v":13},"end":{"b":"Job","c":12,"v":13}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; Jb 12:13; <a data-cross-ref=\'{\\"scripture\\":\\"Job.28.23-Job.28.24\\",\\"valid\\":true,\\"confidence\\":10}\'>28:23-24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; <a data-cross-ref=\'{\\"scripture\\":\\"Job.12.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Jb 12:13</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.28.23-Job.28.24\\",\\"valid\\":true,\\"confidence\\":10}\'>28:23-24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"},{"ref_data":{"context_used":"","osis":"Exod.3.7","default":"Exod.3.7","indices":[78,84],"validity":{"valid":true,"message":{},"start":{"b":"Exod","c":3,"v":7},"end":{"b":"Exod","c":3,"v":7}}},"before_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; Ex 3:7; <a data-cross-ref=\'{\\"scripture\\":\\"Job.12.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Jb 12:13</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.28.23-Job.28.24\\",\\"valid\\":true,\\"confidence\\":10}\'>28:23-24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)","after_text":"The Bible is full of affirmations of God&#x2019;s unlimited knowledge (16:13; <a data-cross-ref=\'{\\"scripture\\":\\"Exod.3.7\\",\\"valid\\":true,\\"confidence\\":10}\'>Ex 3:7</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.12.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Jb 12:13</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.28.23-Job.28.24\\",\\"valid\\":true,\\"confidence\\":10}\'>28:23-24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Job.36.4\\",\\"valid\\":true,\\"confidence\\":10}\'>36:4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.33.13-Ps.33.15\\",\\"valid\\":true,\\"confidence\\":10}\'>Ps 33:13-15</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Ps.139.1-Ps.139.4\\",\\"valid\\":true,\\"confidence\\":10}\'>139:1-4</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Isa.46.10\\",\\"valid\\":true,\\"confidence\\":7}\'>Is 46:10</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Jer.23.24\\",\\"valid\\":true,\\"confidence\\":10}\'>Jr 23:24</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Matt.10.29\\",\\"valid\\":true,\\"confidence\\":10}\'>Mt 10:29</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Acts.15.8\\",\\"valid\\":true,\\"confidence\\":10}\'>Ac 15:8</a>; <a data-cross-ref=\'{\\"scripture\\":\\"Heb.4.13\\",\\"valid\\":true,\\"confidence\\":10}\'>Heb 4:13</a>). Therefore God&#x2019;s questions here are rhetorical; he is not unaware of the couple&#x2019;s location and what had transpired in the garden. <a data-cross-ref=\'{\\"scripture\\":\\"Matt.4.20\\",\\"valid\\":true,\\"confidence\\":10}\'>Matt 4:20</a> The passage describes God as a parent who instructs his children with restoration as his purpose. He did not question the serpent, because he had no plan to redeem the tempter. (see <a data-cross-ref=\'{\\"scripture\\":\\"\\",\\"valid\\":false,\\"message\\":\\"Jas 4 has 17 verses.\\"}\'>James 4:99</a>)"}]`;
  t.deepEqual(actual, expected);
});