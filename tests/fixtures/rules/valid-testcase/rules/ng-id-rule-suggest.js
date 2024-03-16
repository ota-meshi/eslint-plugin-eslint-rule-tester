'use strict';

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier
 */
module.exports = {
	meta: {
		docs: {
			description: 'disallow NG identifier with suggestion(test rule)',
			// eslint-disable-next-line eslint-plugin/require-meta-docs-url -- For test
			url: 'foo'
		},
		fixable: 'code',
		messages: {
			forbidden: 'NG.',
			fix: 'Fix to OK.',
			fixToRemove: 'Fix to remove.'
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
						messageId: 'forbidden',
						suggest: [
							{
								messageId: 'fix',
								fix: (fixer) => fixer.replaceTextRange(node.range, 'OK')
							},
							{
								messageId: 'fixToRemove',
								fix: (fixer) => fixer.removeRange(node.range)
							}
						]
					});
				}
			}
		};
	}
};
