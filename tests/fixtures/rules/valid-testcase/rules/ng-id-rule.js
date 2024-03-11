'use strict';

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier
 */
module.exports = {
	meta: {
		docs: {
			description: 'disallow NG identifier (test rule)',
			// eslint-disable-next-line eslint-plugin/require-meta-docs-url -- For test
			url: 'foo'
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
