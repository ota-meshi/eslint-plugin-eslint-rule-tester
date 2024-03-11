'use strict';

const { RuleTester: OriginalRuleTester } = require('eslint');

const RuleTester = getUnsupportedFlatRuleTester() || OriginalRuleTester;

function getUnsupportedFlatRuleTester() {
	try {
		// @ts-expect-error -- eslint v8
		return require('eslint/use-at-your-own-risk').FlatRuleTester;
	} catch {
		return null;
	}
}

module.exports = { RuleTester };
