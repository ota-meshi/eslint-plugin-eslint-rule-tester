'use strict';

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier
 */
module.exports = {
	meta: {
		docs: {
			description: 'disallow NG identifier (test rule)',
			url: 'https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/v0.0.0/docs/rules/ng-id-rule.md'
		},
		fixable: 'code',
		messages: {
			fobidden: 'NG.'
		},
		schema: [],
		type: 'suggestion'
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
						fix: (fixer) => fixer.replaceTextRange(node.range, 'OK')
					});
				}
			}
		};
	}
};
