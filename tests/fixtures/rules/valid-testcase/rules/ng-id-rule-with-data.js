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
		messages: {
			forbidden: '{{id}}.',
			fix: 'Fix to {{id}}.'
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
						data: {
							id: node.name
						},
						suggest: [
							{
								messageId: 'fix',
								data: {
									id: 'OK'
								},
								fix: (fixer) => fixer.replaceTextRange(node.range, 'OK')
							}
						]
					});
				}
			}
		};
	}
};
