const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/valid-testcase.js');

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('valid-testcase', rule, {
	valid: [{}],
	invalid: [{}]
});
