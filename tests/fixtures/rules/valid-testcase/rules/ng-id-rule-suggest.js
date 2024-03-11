'use strict';

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier
 */
module.exports = {
	meta: {
		docs: {
			description: 'disallow NG identifier (test rule)',
			url: 'https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/v0.1.0/docs/rules/ng-id-rule-suggest.md'
		},
		fixable: 'code',
		messages: {
			fobidden: 'NG.',
			fix: 'Fix to OK.'
		},
		schema: [],
		type: 'suggestion',
		hasSuggestions: true
	},
	/** @param {RuleContext} context  */
	create(context) {
		return {
			/** @param {Identifier} node */
			Identifier(node) {
				if (node.name === 'NG') {
					context.report({
						loc: node.loc,
						messageId: 'fobidden',
						suggest: [
							{
								messageId: 'fix',
								fix: (fixer) => fixer.replaceTextRange(node.range, 'OK')
							}
						]
					});
				}
			}
		};
	}
};
