'use strict';

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier
 */
module.exports = {
	meta: {
		docs: {
			description: 'disallow NG identifier with data(test rule)',
			// eslint-disable-next-line eslint-plugin/require-meta-docs-url -- For test
			url: 'foo'
		},
		// eslint-disable-next-line eslint-plugin/prefer-message-ids -- test
		messages: {},
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
						// eslint-disable-next-line eslint-plugin/prefer-message-ids -- test
						message: 'NG.',
						suggest: [
							{
								// eslint-disable-next-line eslint-plugin/prefer-message-ids -- test
								desc: 'Fix to OK.',
								fix: (fixer) => fixer.replaceTextRange(node.range, 'OK')
							}
						]
					});
				}
			}
		};
	}
};
