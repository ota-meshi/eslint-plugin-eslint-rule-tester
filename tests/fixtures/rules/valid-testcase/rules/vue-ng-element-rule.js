'use strict';

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("@typescript-eslint/types").TSESTree.Identifier} Identifier
 */
module.exports = {
	meta: {
		docs: {
			description: 'disallow NG element for vue (test rule)',
			// eslint-disable-next-line eslint-plugin/require-meta-docs-url -- For test
			url: 'foo'
		},
		fixable: 'code',
		messages: {
			forbidden: 'NG.'
		},
		schema: [],
		type: 'suggestion'
	},
	/** @param {RuleContext} context  */
	create(context) {
		const sourceCode = context.sourceCode;
		const tokenStore = sourceCode.parserServices.getTemplateBodyTokenStore();
		return sourceCode.parserServices.defineTemplateBodyVisitor({
			VElement(node) {
				if (node.name === 'ng') {
					const open = tokenStore.getFirstToken(node);
					context.report({
						loc: node.loc,
						messageId: 'forbidden',
						fix: (fixer) => fixer.replaceTextRange(open.range, '<ok')
					});
				}
			}
		});
	}
};
