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
						code: 'NG',
						errors: [
							{ message: "NG.", line: 1, column: 1 }
						]
					},
				]
			})
			`,
			errors: [{ message: "Test case must specify 'errors'.", line: 16, column: 6 }]
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
								message:'foo',
								line:42
							},
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
							{
								message:"NG.",
								line:1
							}
					    ],
						output: \`OK\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 20, column: 17 },
				{ message: 'Expected 42 but the result was 1.', line: 21, column: 14 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 23, column: 10 }
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
					    ],
						output: \`OK\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 19, column: 8 },
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
					{
						code: 'NG', 
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
				{ message: 'Expected "foo" but the result was "NG.".', line: 19, column: 8 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 20, column: 8 },
				{ message: 'Expected "foo" but the result was "OK".', line: 22, column: 17 }
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
						code: 'NG', 
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
					{
						code: 'NG', 
					  	errors: [
							{
								message: 'foo',
								suggestions: [
									{ messageId: "fix", output: \`OK\` },
									{ messageId: "fixToRemove", output: \`\` }
								]
							},
							'bar'
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: "Error item must specify 'suggestions'.", line: 19, column: 8 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 19, column: 8 },
				{ message: 'Should have 1 error but had 2 definitions.', line: 20, column: 8 }
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
						{ message: "NG.", suggestions: [
							{ messageId: "fix", output: \`OK; NG;\` },
							{ messageId: "fixToRemove", output: \`; NG;\` }
						]},
						{ message: "NG.", suggestions: [{output:'NG; OK;', messageId: "fix"}, { messageId: "fixToRemove", output: \`NG; ;\` }]}
				      ],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but the result was "NG.".', line: 18, column: 18 },
				{ message: 'Should have 2 suggestions but had 0 definitions.', line: 18, column: 38 },
				{ message: 'Expected "bar" but the result was "NG.".', line: 19, column: 18 },
				{ message: 'Should have 2 suggestions but had 1 definitions.', line: 19, column: 39 },
				{
					message: "Suggestion item must specify either 'messageId' or 'desc'.",
					line: 19,
					column: 39
				},
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
					{
						code: 'NG; NG;', 
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
					{
						code: 'NG; NG;', 
					  	errors: [
							{ message: "NG." },
							{
								message: 'bar',
								suggestions: [
									{ messageId: "fix", output: \`NG; OK;\` },
									{ messageId: "fixToRemove", output: \`NG; ;\` }
								]
							},
							'baz'
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: "Error item must specify 'suggestions'.", line: 19, column: 8 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 19, column: 19 },
				{ message: "Error item must specify 'suggestions'.", line: 20, column: 8 },
				{ message: 'Expected "bar" but the result was "NG.".', line: 20, column: 8 },
				{ message: 'Should have 2 errors but had 3 definitions.', line: 21, column: 8 }
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
					{
						code: 'NG; NG;', 
					  	errors: [
							{
								message: "NG.",
								suggestions: [
									{ messageId: "fix" },
									{ messageId: "fixToRemove", output: \`; NG;\` }
								]
							},
							{
					  			message: "NG.",
					  			line: 1,
					  			column: 5,
					  			suggestions: [
					  				{ messageId: "fix", output: \`NG; OK;\` },
					  				{ messageId: "fixToRemove", output: \`NG; ;\` }
					  			]
					  		}
						],
					},
				]
			})
			`,
			errors: [
				{ message: 'Should have 2 errors but had 1 definitions.', line: 19, column: 8 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 20, column: 18 },
				{ message: 'Should have 2 suggestions but had 1 definitions.', line: 22, column: 10 },
				{
					message: "Suggestion item must specify either 'messageId' or 'desc'.",
					line: 22,
					column: 10
				},
				{ message: "Suggestion item must specify 'output'.", line: 22, column: 10 }
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
					{
						code: 'NG; NG;', 
						errors: [
							{
								message: "NG.",
								suggestions: [
									{
										messageId: "fix",
										output: \`OK; NG;\`
									},
									{ messageId: "fixToRemove", output: \`; NG;\` }
								]
							},
							{
								message: "NG.",
								line: 1,
								column: 5,
								suggestions: [
									{ messageId: "fix", output: \`NG; OK;\` },
									{ messageId: "fixToRemove", output: \`NG; ;\` }
								]
							}
						],
					},
				]
			})
			`,
			errors: [
				{ message: 'Should have 2 errors but had 1 definitions.', line: 19, column: 8 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 20, column: 18 },
				{ message: 'Should have 2 suggestions but had 1 definitions.', line: 22, column: 10 },
				{ message: "Suggestion item must specify 'output'.", line: 22, column: 10 }
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
								},
								{ messageId: "fixToRemove", output: \`; NG;\` }
							]
						},
				      	{ message:"NG.", line:1, column:5, suggestions: [
				      		{ messageId: "fix", output: \`NG; OK;\` },
				      		{ messageId: "fixToRemove", output: \`NG; ;\` }
				      	] }
					  ],
					},
				]
			})
			`,
			errors: [
				{ message: 'Should have 2 suggestions but had 1 definitions.', line: 22, column: 9 },
				{ message: 'Expected "foo" but the result was "fix".', line: 23, column: 21 },
				{ message: 'Expected "NG; OK;" but the result was "OK; NG;".', line: 24, column: 18 },
				{ message: "Error item must specify 'suggestions'.", line: 28, column: 12 }
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
								},
								{ messageId: "fixToRemove", output: \`; NG;\` }
							]
						},
				      	{ message:"NG.", line:1, column:5, suggestions: [
				      		{ messageId: "fix", output: \`NG; OK;\` },
				      		{ messageId: "fixToRemove", output: \`NG; ;\` }
				      	] }
					  ],
					},
				]
			})
			`,
			errors: [
				{ message: 'Should have 2 suggestions but had 1 definitions.', line: 22, column: 9 },
				{ message: 'Expected "fix" but the result was "Fix to OK.".', line: 23, column: 16 },
				{ message: 'Expected "NG; OK;" but the result was "OK; NG;".', line: 24, column: 18 },
				{ message: "Error item must specify 'suggestions'.", line: 28, column: 12 }
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
					  ],
					  output: \`<template><ok /></template>\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected 42 but the result was 1.', line: 22, column: 14 }
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
					  ],
					  output: \`<template><ok /></template>\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Expected 42 but the result was 1.', line: 22, column: 14 }
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
					  ],
					  output: \`<template><ok /></template>\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 17, column: 6 },
				{ message: 'Expected 42 but the result was 1.', line: 22, column: 14 }
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
					  ],
					  output: \`<template><ok /></template>\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 18, column: 6 },
				{ message: 'Expected 42 but the result was 1.', line: 23, column: 14 }
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
						],
						output: \`OK\`
						
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{
					message:
						"Error item should have no 'suggestions'. Because there are no 'suggestions' in the test case result.",
					line: 23,
					column: 9
				}
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
			
			tester.run('ng-id-rule-no-fix', rule, {
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
			
			tester.run('ng-id-rule-no-fix', rule, {
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
				{ message: 'Expected 2 but the result was 1.', line: 22, column: 16 },
				{
					message:
						"Error item should have no 'suggestions'. Because there are no 'suggestions' in the test case result.",
					line: 23,
					column: 9
				},
				{
					message:
						"Test case should have no 'output'. Because there are no 'output' in the test case result.",
					line: 26,
					column: 7
				}
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
			
			tester.run('ng-id-rule-no-fix', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						output: \`OK\`,
						code: 'NG',
						errors: [
							{
								message:"NG.",
								line:1,
								column:2,
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
			const rule = require('../rules/ng-id-rule-no-fix.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-no-fix', rule, {
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
				{
					message:
						"Test case should have no 'output'. Because there are no 'output' in the test case result.",
					line: 17,
					column: 7
				},
				{ message: 'Expected 2 but the result was 1.', line: 23, column: 16 },
				{
					message:
						"Error item should have no 'suggestions'. Because there are no 'suggestions' in the test case result.",
					line: 24,
					column: 9
				}
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-has-fix-but-no-fix.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-has-fix-but-no-fix', rule, {
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
			const rule = require('../rules/ng-id-rule-has-fix-but-no-fix.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-has-fix-but-no-fix', rule, {
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
						output: null,
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected 2 but the result was 1.', line: 22, column: 16 },
				{
					message:
						"Error item should have no 'suggestions'. Because there are no 'suggestions' in the test case result.",
					line: 23,
					column: 9
				},
				{
					message: 'Expected "OK" but the result was null.',
					line: 26,
					column: 15
				}
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
						output: \`OK\`,
						code: 'NG',
						errors: [
							{
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
						output: \`OK\`,
						code: 'NG',
						errors: [
							{
							}
						],
					},
				]
			})
			`,
			errors: [
				{
					message: "Error item must specify either 'messageId' or 'message'.",
					line: 20,
					column: 8
				},
				{
					message:
						"Error item should have no 'suggestions'. Because there are no 'suggestions' in the test case result.",
					line: 21,
					column: 9
				}
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
								messageId: "forbidden"
							}
						],
						output: \`OK\`
						
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: "Error item must specify either 'messageId' or 'message'.", line: 19, column: 8 }
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
						code: 'NG; NG;',
						errors: [],
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
						code: 'NG; NG;',
						errors: [
							{ message: "NG.", line: 1, column: 1 },
							{ message: "NG.", line: 1, column: 5 }
						],
						output: \`OK; OK;\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Should have 2 errors but had 0 definitions.', line: 18, column: 15 }
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
						code: 'NG; NG;',
						errors: [
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
						code: 'NG; NG;',
						errors: [
							{ message: "NG.", line: 1, column: 1 },
							{ message: "NG.", line: 1, column: 5 }
						],
						output: \`OK; OK;\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Should have 2 errors but had 0 definitions.', line: 18, column: 15 }
			]
		},
		{
			filename,
			code: String.raw`
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
						code: 'NG; NG("\\n");',
						errors: [
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
						code: 'NG; NG("\\\\n");',
						errors: [
							{ message: "NG.", line: 1, column: 1 },
							{ message: "NG.", line: 1, column: 5 }
						],
						output: String.raw\`OK; OK("\\n");\`
					},
				]
			})
			`,
			errors: [
				{ message: "Test case must specify 'output'.", line: 16, column: 6 },
				{ message: 'Should have 2 errors but had 0 definitions.', line: 18, column: 15 }
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
						code: \`NG;
						NG;\`, 
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
					{
						code: \`NG;
						NG;\`, 
					  	errors: [
							{
								message: 'foo',
								suggestions: [
									{
										messageId: "fix",
										output: \`OK;
						NG;\`
									},
									{
										messageId: "fixToRemove",
										output: \`;
						NG;\`
									}
								]
							},
							{
								message: 'bar',
								suggestions: [
									{
										messageId: "fix",
										output: \`NG;
						OK;\`
									},
									{
										messageId: "fixToRemove",
										output: \`NG;
						;\`
									}
								]
							}
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: "Error item must specify 'suggestions'.", line: 20, column: 8 },
				{ message: 'Expected "foo" but the result was "NG.".', line: 20, column: 8 },
				{ message: "Error item must specify 'suggestions'.", line: 21, column: 8 },
				{ message: 'Expected "bar" but the result was "NG.".', line: 21, column: 8 }
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
						code: \`NG;
						NG;\`, 
					  	errors: [
							{
								message: 'foo',
								suggestions: [
									{
										messageId: "fix",
										output: \`OK;
						NG;\`
									},
								]
							},
							{
								message: 'bar',
								suggestions: [
									{
										messageId: "fix",
										output: \`NG;
						OK;\`
									},
									{
										messageId: "fixToRemove",
										output: \`NG;
						;\`
									}
								]
							}
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
						code: \`NG;
						NG;\`, 
					  	errors: [
							{
								message: "NG.",
								suggestions: [
									{
										messageId: "fix",
										output: \`OK;
						NG;\`
									},
									{
										messageId: "fixToRemove",
										output: \`;
						NG;\`
									}
								]
							},
							{
								message: "NG.",
								suggestions: [
									{
										messageId: "fix",
										output: \`NG;
						OK;\`
									},
									{
										messageId: "fixToRemove",
										output: \`NG;
						;\`
									}
								]
							}
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but the result was "NG.".', line: 21, column: 18 },
				{ message: 'Should have 2 suggestions but had 1 definitions.', line: 23, column: 10 },
				{ message: 'Expected "bar" but the result was "NG.".', line: 31, column: 18 }
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
						code: \`NG;\`, 
					  	errors: [
							{
								message: 'foo',
								suggestions: [
									{
										messageId: "fix",
										output: \`OK;
						NG;\`
									},
									{ messageId: "fixToRemove", output: \`;\` },
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
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: "NG.",
								suggestions: [
									{
										messageId: "fix",
										output: \`OK;\`
									},
									{ messageId: "fixToRemove", output: \`;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but the result was "NG.".', line: 20, column: 18 },
				{
					message: 'Expected "OK;\\n\\t\\t\\t\\t\\t\\tNG;" but the result was "OK;".',
					line: 24,
					column: 19
				},
				{ message: 'Should have 2 suggestions but had 3 definitions.', line: 28, column: 10 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								messageId: 'foo',
								suggestions: [
									{ messageId: "foo", output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								messageId: "forbidden",
								suggestions: [
									{ messageId: "fix", output: \`OK;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{ messageId: 'mismatch', line: 20, column: 20 },
				{ message: 'Expected "foo" but the result was "fix".', line: 22, column: 23 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: "NG.",
								messageId: 'forbidden',
								data: {
									id: 'NG'
								},
								suggestions: [
									{ desc: "Fix to OK.", messageId: "fix", data: { id: 'OK' }, output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: "NG.",
								data: {
									id: 'NG'
								},
								suggestions: [
									{ desc: "Fix to OK.", data: { id: 'OK' }, output: \`OK;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{ messageId: 'extraMessageId', line: 21, column: 9 },
				{
					messageId: 'extraData',
					data: { kind: 'Error' },
					line: 22,
					column: 9
				},
				{
					messageId: 'extraSuggestionDesc',
					line: 26,
					column: 32
				},
				{
					messageId: 'extraData',
					data: { kind: 'Suggestion' },
					line: 26,
					column: 50
				}
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: "NG.",
								data: {
									id: 'NG'
								},
								messageId: 'forbidden',
								suggestions: [
									{ desc: "Fix to OK.", data: { id: 'OK' }, messageId: 'fix', output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: "NG.",
								messageId: 'forbidden',
								suggestions: [
									{ desc: "Fix to OK.", messageId: 'fix', output: \`OK;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{
					message: "Error item should not specify both 'data' and 'message'.",
					line: 21,
					column: 9
				},
				{
					message: "Error item should not specify both 'message' and a 'messageId'.",
					line: 24,
					column: 9
				},
				{
					message: "Suggestion item should not specify both 'data' and 'message'.",
					line: 26,
					column: 32
				},
				{
					message: "Error item should not specify both 'desc' and a 'messageId'.",
					line: 26,
					column: 52
				}
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								messageId: 'foo',
								data: {
									id: 'foo'
								},
								suggestions: [
									{ messageId: "fix", data: { id: 'bar' }, output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								messageId: "forbidden",
								data: {
									id: "NG"
								},
								suggestions: [
									{ messageId: "fix", data: { id: "OK" }, output: \`OK;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but the result was "forbidden".', line: 20, column: 20 },
				{ message: 'Expected "foo" but the result was "NG".', line: 22, column: 14 },
				{ message: 'Expected "bar" but the result was "OK".', line: 25, column: 42 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								messageId: "forbidden",
								data: {},
								suggestions: [
									{ messageId: "fix", data: {}, output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-with-data.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-with-data', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								messageId: "forbidden",
								data: { id: "NG" },
								suggestions: [
									{ messageId: "fix", data: { id: "OK" }, output: \`OK;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{
					message: "Data must specify 'id'.",
					line: 21,
					column: 15
				},
				{
					message: "Data must specify 'id'.",
					line: 23,
					column: 36
				}
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-raw-message.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-raw-message', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: 'foo',
								suggestions: [
									{ desc: "foo", output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-raw-message.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-raw-message', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								message: "NG.",
								suggestions: [
									{ desc: "Fix to OK.", output: \`OK;\` }
								]
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{ message: 'Expected "foo" but the result was "NG.".', line: 20, column: 18 },
				{ message: 'Expected "foo" but the result was "Fix to OK.".', line: 22, column: 18 }
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-raw-message.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-raw-message', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								suggestions: [
									{ output: \`OK;\` }
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
			const rule = require('../rules/ng-id-rule-raw-message.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-raw-message', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
							{
								suggestions: [
									{ output: \`OK;\`, desc: "Fix to OK." }
								],
								message: "NG."
							},
				      	],
					},
				]
			})
			`,
			errors: [
				{
					message: "Error item must specify either 'messageId' or 'message'.",
					line: 19,
					column: 8
				},
				{
					message: "Suggestion item must specify either 'messageId' or 'desc'.",
					line: 21,
					column: 10
				}
			]
		},
		{
			filename,
			code: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-raw-message.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-raw-message', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
				      	],
					},
				]
			})
			`,
			output: `
			'use strict';
			const { RuleTester } = require('eslint');
			const rule = require('../rules/ng-id-rule-raw-message.js');
			
			const tester = new RuleTester({
				languageOptions: {
					ecmaVersion: 2020,
					sourceType: 'module'
				}
			});
			
			tester.run('ng-id-rule-raw-message', rule, {
				valid: ['foo', 'bar'],
				invalid: [
					{
						code: \`NG;\`, 
					  	errors: [
					  		{
					  			message: "NG.",
					  			line: 1,
					  			column: 1,
					  			suggestions: [
					  				{ desc: "Fix to OK.", output: \`OK;\` }
					  			]
					  		}
				      	],
					},
				]
			})
			`,
			errors: [{ message: 'Should have 1 error but had 0 definitions.', line: 18, column: 17 }]
		}
	]
});
