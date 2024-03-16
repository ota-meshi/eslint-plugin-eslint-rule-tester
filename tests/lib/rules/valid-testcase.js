'use strict';

const path = require('path');
const { RuleTester } = require('../../rule-tester');
const rule = require('../../../lib/rules/valid-testcase.js');

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

const filename = path.resolve(__dirname, '../../fixtures/rules/valid-testcase/test/test.js');

tester.run('valid-testcase', /** @type {any} */ (rule), {
	valid: [
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG', errors: ['NG.'], output: \`OK\` },
				]
			})
			`
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/vue-ng-element-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  languageOptions: { parser: require('vue-eslint-parser') },
					  errors: [
						{
							message: "NG.",
							line: 1
						},
					  ],
					  output: \`<template><ok /></template>\`,
					},
				]
			})
			`
		}
	],
	invalid: [
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG', errors: [{ message: "NG.", line: 1, column: 1 }],
					},
				]
			})
			`,
			errors: [{ message: "Error should have 'errors' but not definitions.", line: 16, column: 6 }]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							{message:'foo',line:42},
						  	'bar'
					    ]
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							{message:"NG.",line:1}
					    ]
					, output: \`OK\`},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected "foo" but "NG.".', line: 19, column: 17 },
				{ message: 'Expected 42 but 1.', line: 19, column: 28 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 20, column: 10 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							'foo',
						  	'bar'
					    ]
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							"NG.",
						  	'bar'
					    ]
					, output: \`OK\`},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected \'foo\' but "NG.".', line: 19, column: 8 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 20, column: 10 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG', 
					  errors: [
						'foo',
						'bar'
				      ], 
					  output: 'foo'
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG', 
					  errors: [
						"NG.",
						'bar'
				      ], 
					  output: \`OK\`
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected \'foo\' but "NG.".', line: 18, column: 7 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 19, column: 7 },
				{ message: 'Expected "foo" but "OK".', line: 21, column: 16 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG', 
					  errors: [
						'foo',
						'bar'
				      ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG', 
					  errors: [
						{ message: 'foo', suggestions: [{ messageId: "fix", output: \`OK\` }] },
						'bar'
				      ],
					},
				]
			})
			`,
			errors: [
				{ message: "Error should have 'suggestions' but not definitions.", line: 18, column: 7 },
				{ message: 'Expected \'foo\' but "NG.".', line: 18, column: 7 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 19, column: 7 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{ message: 'foo', suggestions: []},
						{ message: 'bar', suggestions: [{output:'NG; OK;'}]},
						'baz'
				      ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{ message: "NG.", suggestions: [{ messageId: "fix", output: \`OK; NG;\` }]},
						{ message: "NG.", suggestions: [{output:'NG; OK;', messageId: "fix"}]}
				      ],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but "NG.".', line: 18, column: 18 },
				{ message: 'Should have 1 suggestion but had 0 definitions.', line: 18, column: 38 },
				{ message: 'Expected "bar" but "NG.".', line: 19, column: 18 },
				{ message: "Test must specify either 'messageId' or 'desc'.", line: 19, column: 39 },
				{ message: 'Should have 2 errors but had 3 definitions.', line: 20, column: 7 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{ message: 'foo' },
						'bar',
						'baz'
				      ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{ message: "NG." , suggestions: [{ messageId: "fix", output: \`OK; NG;\` }]},
						{ message: 'bar', suggestions: [{ messageId: "fix", output: \`NG; OK;\` }] },
						'baz'
				      ],
					},
				]
			})
			`,
			errors: [
				{ message: "Error should have 'suggestions' but not definitions.", line: 18, column: 7 },
				{ message: 'Expected "foo" but "NG.".', line: 18, column: 18 },
				{ message: "Error should have 'suggestions' but not definitions.", line: 19, column: 7 },
				{ message: 'Expected \'bar\' but "NG.".', line: 19, column: 7 },
				{ message: 'Should have 2 errors but had 3 definitions.', line: 20, column: 7 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{
							message: 'foo',
							suggestions: [
								{}
							]
						},
				      ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{
							message: "NG.",
							suggestions: [
								{messageId: "fix"}
							]
						},
				      { message: "NG.", line: 1, column: 5 }],
					},
				]
			})
			`,
			errors: [
				{ message: 'Should have 2 errors but had 1 definitions.', line: 18, column: 7 },
				{ message: 'Expected "foo" but "NG.".', line: 19, column: 17 },
				{ message: "Test must specify either 'messageId' or 'desc'.", line: 21, column: 9 },
				{ message: "Test must specify 'output'.", line: 21, column: 9 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{
							message: 'foo',
							suggestions: [
								{
									messageId: "fix"
								}
							]
						},
				      ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{ code: 'NG; NG;', 
					  errors: [
						{
							message: "NG.",
							suggestions: [
								{
									messageId: "fix"
								, output: \`OK; NG;\`}
							]
						},
				      { message: "NG.", line: 1, column: 5 }],
					},
				]
			})
			`,
			errors: [
				{ message: 'Should have 2 errors but had 1 definitions.', line: 18, column: 7 },
				{ message: 'Expected "foo" but "NG.".', line: 19, column: 17 },
				{ message: "Test must specify 'output'.", line: 21, column: 9 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: 'NG; NG;', 
					  errors: [
						{
							message: "NG.",
							suggestions: [
								{
									messageId: "foo",
									output: \`NG; OK;\`
								}
							]
						},
				      	{ message:"NG.", line:1, column:5 }
					  ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: 'NG; NG;', 
					  errors: [
						{
							message: "NG.",
							suggestions: [
								{
									messageId: "fix",
									output: \`OK; NG;\`
								}
							]
						},
				      	{ message:"NG.", line:1, column:5 , suggestions: [{ messageId: "fix", output: \`NG; OK;\` }]}
					  ],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but "fix".', line: 23, column: 21 },
				{ message: 'Expected "NG; OK;" but "OK; NG;".', line: 24, column: 18 },
				{ message: "Error should have 'suggestions' but not definitions.", line: 28, column: 12 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: 'NG; NG;', 
					  errors: [
						{
							message: "NG.",
							suggestions: [
								{
									desc: "fix",
									output: \`NG; OK;\`
								}
							]
						},
				      	{ message:"NG.", line:1, column:5 }
					  ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-suggest.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: 'NG; NG;', 
					  errors: [
						{
							message: "NG.",
							suggestions: [
								{
									desc: "Fix to OK.",
									output: \`OK; NG;\`
								}
							]
						},
				      	{ message:"NG.", line:1, column:5 , suggestions: [{ messageId: "fix", output: \`NG; OK;\` }]}
					  ],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "fix" but "Fix to OK.".', line: 23, column: 16 },
				{ message: 'Expected "NG; OK;" but "OK; NG;".', line: 24, column: 18 },
				{ message: "Error should have 'suggestions' but not definitions.", line: 28, column: 12 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/vue-ng-element-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  languageOptions: { parser: require('vue-eslint-parser') },
					  errors: [
						{
							message: "NG.",
							line: 42
						},
					  ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/vue-ng-element-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  languageOptions: { parser: require('vue-eslint-parser') },
					  errors: [
						{
							message: "NG.",
							line: 1
						},
					  ], output: \`<template><ok /></template>\`,
					},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected 42 but 1.', line: 22, column: 14 }
			]
		},
		{
			filename,
			code: `
			import { RuleTester } from 'eslint';
			import rule from '../rules/vue-ng-element-rule.js';
			import parser from 'vue-eslint-parser';
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  languageOptions: { parser },
					  errors: [
						{
							message: "NG.",
							line: 42
						},
					  ],
					},
				]
			})
			`,
			output: `
			import { RuleTester } from 'eslint';
			import rule from '../rules/vue-ng-element-rule.js';
			import parser from 'vue-eslint-parser';
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-suggest', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  languageOptions: { parser },
					  errors: [
						{
							message: "NG.",
							line: 1
						},
					  ], output: \`<template><ok /></template>\`,
					},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected 42 but 1.', line: 22, column: 14 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/vue-ng-element-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module',
					parser: require('vue-eslint-parser')
				}
			});
			
			tester.run('vue-ng-element-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  errors: [
						{
							message: "NG.",
							line: 42
						},
					  ],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/vue-ng-element-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module',
					parser: require('vue-eslint-parser')
				}
			});
			
			tester.run('vue-ng-element-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  errors: [
						{
							message: "NG.",
							line: 1
						},
					  ], output: \`<template><ok /></template>\`,
					},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 17, column: 6 },
				{ message: 'Expected 42 but 1.', line: 22, column: 14 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			import { RuleTester } from 'eslint';
			import rule from '../rules/vue-ng-element-rule.js';
			import parser from 'vue-eslint-parser';
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module',
					parser
				}
			});
			
			tester.run('vue-ng-element-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  errors: [
						{
							message: "NG.",
							line: 42
						},
					  ],
					},
				]
			})
			`,
			output: `
			'use strict';
			import { RuleTester } from 'eslint';
			import rule from '../rules/vue-ng-element-rule.js';
			import parser from 'vue-eslint-parser';
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module',
					parser
				}
			});
			
			tester.run('vue-ng-element-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
					  code: '<template><ng /></template>',
					  errors: [
						{
							message: "NG.",
							line: 1
						},
					  ], output: \`<template><ok /></template>\`,
					},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 18, column: 6 },
				{ message: 'Expected 42 but 1.', line: 23, column: 14 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							{
								message:"NG.",
								line:1,
								column:1,
								suggestions: [{messageId: "fix", output: 'OK'}]
							}
						],
						
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							{
								message:"NG.",
								line:1,
								column:1
							}
						], output: \`OK\`,
						
					},
				]
			})
			`,
			errors: [
				{ message: "Test must specify 'output'.", line: 16, column: 6 },
				{ message: "Error should not have 'suggestions'.", line: 23, column: 9 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-no-fix.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							{
								message:"NG.",
								line:1,
								column:2,
								suggestions: [{messageId: "fix", output: 'OK'}]
							}
						],
						output: \`OK\`,
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-no-fix.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: 'NG',
						errors: [
							{
								message:"NG.",
								line:1,
								column:1,
								suggestions: [{messageId: "fix", output: 'OK'}]
							}
						],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected 2 but 1.', line: 22, column: 16 },
				{ message: "Error should not have 'suggestions'.", line: 23, column: 9 },
				{ message: "Test should not have 'output'.", line: 26, column: 7 }
			]
		}
	]
});
