// @ts-check
'use strict';

const path = require('path');
const eslintUtils = require('@eslint-community/eslint-utils');
const { getLinterServese } = require('../utils/linter-worker-servise');

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("eslint").Rule.RuleFixer} RuleFixer
 * @typedef {import("eslint").Rule.Fix} ReportFix
 * @typedef {import("eslint").Scope.Variable} Variable
 * @typedef {import("estree").Node} ESTreeNode
 * @typedef {import("@typescript-eslint/types").TSESTree.Node} Node
 * @typedef {import("@typescript-eslint/types").TSESTree.ObjectExpression} ObjectExpression
 * @typedef {import("@typescript-eslint/types").TSESTree.ArrayExpression} ArrayExpression
 * @typedef {import("@typescript-eslint/types").TSESTree.Expression} Expression
 * @typedef {import("@typescript-eslint/types").TSESTree.MemberExpression} MemberExpression
 * @typedef {import("@typescript-eslint/types").TSESTree.CallExpression} CallExpression
 * @typedef {import("@typescript-eslint/types").TSESTree.Property} Property
 * @typedef {import("@typescript-eslint/types").TSESTree.VariableDeclarator} VariableDeclarator
 * @typedef {import("@typescript-eslint/types").TSESTree.SpreadElement} SpreadElement
 */

module.exports = {
	meta: {
		docs: {
			description: 'require match the `invalid` test case with the result.',
			category: 'Possible Errors',
			recommended: true,
			url: 'https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/README.md'
		},
		fixable: 'code',
		messages: {
			missingErrors: 'Error should have errors but not definitions.',
			mismatchLength: 'Should have {{actual}} {{kind}} but had {{expect}} definitions.',
			missingSuggestion: 'Error should have suggestions but not definitions.',
			mismatch: 'Expected {{expect}} but {{actual}}.',
			missingSuggestionMessage: "Test must specify either 'messageId' or 'desc'.",
			missingOutput: "Test must specify 'output'."
		},
		schema: [],
		type: 'suggestion'
	},
	/** @param {RuleContext} context  */
	create(context) {
		const sourceCode = context.sourceCode;

		// ----------------------------------------------------------------------
		// Helpers
		// ----------------------------------------------------------------------

		/** @type {import("../utils/linter-worker-servise/types").LinterWorkerServise|null} */
		let linterServese = null;
		/** @type {Property['value'] | null} */
		let invalidTestcasesNode = null;

		/**
		 * @param {ObjectExpression} node
		 */
		function extractTestConfig(node) {
			/** @type {import("../utils/linter-worker-servise/types").AnyConfig} */
			const anyCnfig = {};
			/** @type {Expression|null} */
			let errors = null;
			for (const prooerty of node.properties) {
				if (prooerty.type !== 'Property') continue;
				const name = getPropertyName(prooerty);
				if (name === 'errors') {
					errors = /** @type {Expression} */ (prooerty.value);
				} else if (name) {
					const evaluated = getStaticValue(prooerty.value);
					if (evaluated) {
						anyCnfig[name] = evaluated.value;
					}
				}
			}

			if (!anyCnfig.code) {
				return null;
			}

			const config = /** @type {import("../utils/linter-worker-servise/types").Config} */ (
				anyCnfig
			);

			return {
				config,
				errors
			};
		}

		/**
		 * @param {ObjectExpression} node
		 * @param {import("../utils/linter-worker-servise/types").Suggestion} suggestion
		 */
		function verifySuggestion(node, suggestion) {
			const messageIdNode = findProperty(node, 'messageId');
			const descNode = findProperty(node, 'desc');
			const outputNode = findProperty(node, 'output');
			if (!messageIdNode && !descNode) {
				context.report({
					loc: node.loc,
					messageId: 'missingSuggestionMessage',
					fix: (fixer) => {
						if (suggestion.messageId) {
							return fixToAddProperty(
								fixer,
								node,
								'messageId',
								JSON.stringify(suggestion.messageId)
							);
						}
						return fixToAddProperty(fixer, node, 'desc', JSON.stringify(suggestion.desc));
					}
				});
			}
			if (!outputNode) {
				context.report({
					loc: node.loc,
					messageId: 'missingOutput',
					fix: (fixer) => {
						return fixToAddProperty(fixer, node, 'output', outputToString(suggestion.output));
					}
				});
			}
			for (const item of [
				{
					key: /** @type {const} */ ('output'),
					node: outputNode,
					get fixText() {
						return outputToString(suggestion.output);
					}
				},
				{
					key: /** @type {const} */ ('messageId'),
					node: messageIdNode,
					get fixText() {
						return JSON.stringify(suggestion.messageId);
					}
				},
				{
					key: /** @type {const} */ ('desc'),
					node: descNode,
					get fixText() {
						return JSON.stringify(suggestion.desc);
					}
				}
			]) {
				const valueNode = item.node?.value;
				if (!valueNode) continue;
				const evaluated = getStaticValue(valueNode);
				if (evaluated && evaluated.value !== suggestion[item.key]) {
					context.report({
						loc: valueNode.loc,
						messageId: 'mismatch',
						data: {
							expect: JSON.stringify(evaluated.value),
							actual: JSON.stringify(suggestion[item.key])
						},
						fix: (fixer) => {
							return fixer.replaceTextRange(valueNode.range, item.fixText);
						}
					});
				}
			}
		}

		/**
		 * @param {ArrayExpression} node
		 * @param {import("../utils/linter-worker-servise/types").Suggestion[]} suggestions
		 */
		function verifySuggestions(node, suggestions) {
			if (node.elements.length !== suggestions.length) {
				context.report({
					loc: (
						node.elements[suggestions.length] ||
						[...node.elements].reverse().find((n) => Boolean(n)) ||
						node
					).loc,
					messageId: 'mismatchLength',
					data: {
						actual: String(suggestions.length),
						expect: String(node.elements.length),
						kind: suggestions.length === 1 ? 'suggestion' : 'suggestions'
					},
					fix: (fixer) => fixForMismatchSuggestionLength(fixer, node, suggestions)
				});
			}
			const length = Math.min(node.elements.length, suggestions.length);
			for (let index = 0; index < length; index++) {
				const test = node.elements[index];
				if (!test || test.type !== 'ObjectExpression') continue;
				const result = suggestions[index];
				verifySuggestion(test, result);
			}
		}

		/**
		 * @param {Expression} node
		 * @param {import("../utils/linter-worker-servise/types").Message} message
		 */
		function verifyMessage(node, message) {
			if (node.type === 'Literal') {
				if (node.value !== message.message) {
					context.report({
						node,
						messageId: 'mismatch',
						data: {
							expect: String(node.raw),
							actual: JSON.stringify(message.message)
						},
						fix: (fixer) => fixer.replaceText(node, JSON.stringify(message.message))
					});
				}
			}
			if (node.type !== 'ObjectExpression') return;

			for (const property of node.properties) {
				if (property.type !== 'Property') continue;

				const key =
					/** @type {(keyof import("../utils/linter-worker-servise/types").Message)|null} */ (
						getPropertyName(property)
					);
				if (
					!key ||
					!Object.hasOwn(message, key) ||
					(message[key] && typeof message[key] === 'object')
				)
					continue;

				const evaluated = getStaticValue(property.value);
				if (evaluated && evaluated.value !== message[key]) {
					context.report({
						loc: property.value.loc,
						messageId: 'mismatch',
						data: {
							expect: JSON.stringify(evaluated.value),
							actual: JSON.stringify(message[key])
						},
						fix: (fixer) => {
							return fixer.replaceTextRange(property.value.range, JSON.stringify(message[key]));
						}
					});
				}
			}
		}

		/**
		 * @param {ObjectExpression} node
		 */
		function verifyInvalidTestcase(node) {
			const testcase = extractTestConfig(node);
			if (!testcase) {
				// Unknown
				return;
			}
			if (!testcase.errors) {
				context.report({
					loc: node.loc,
					messageId: 'missingErrors',
					fix: (fixer) => {
						const results = linterServese?.getLinterResule(testcase.config);
						if (!results) {
							return null;
						}
						return fixToAddProperty(
							fixer,
							node,
							'errors',
							`[${results.errors.map((message) => `{message:${JSON.stringify(message.message)},line:${message.line},column:${message.column}}`).join(', ')}]`
						);
					}
				});
				return;
			}
			if (testcase.errors.type !== 'ArrayExpression') return;
			const errors = testcase.errors;
			if (errors.elements.some((e) => e?.type === 'SpreadElement')) return;
			const results = linterServese?.getLinterResule(testcase.config);
			if (!results)
				// Unknown error
				return;
			if (results.errors.some((m) => m.ruleId == null)) {
				// Faital error
				return;
			}
			if (errors.elements.length !== results.errors.length) {
				context.report({
					loc: (
						errors.elements[results.errors.length] ||
						[...errors.elements].reverse().find((e) => e) ||
						testcase.errors
					).loc,
					messageId: 'mismatchLength',
					data: {
						actual: String(results.errors.length),
						expect: String(errors.elements.length),
						kind: results.errors.length === 1 ? 'error' : 'errors'
					},
					fix: (fixer) => fixForMismatchErrorsLength(fixer, errors, results.errors)
				});
			}

			const length = Math.min(errors.elements.length, results.errors.length);
			for (let index = 0; index < length; index++) {
				const test = errors.elements[index];
				if (!test || test.type === 'SpreadElement') continue;
				const result = results.errors[index];
				if (result.suggestions?.length > 0) {
					if (test.type === 'Literal') {
						context.report({
							node: test,
							messageId: 'missingSuggestion',
							fix: (fixer) => fixToAddSuggestion(fixer, test, result.suggestions)
						});
					} else if (test.type === 'ObjectExpression') {
						const suggestionsProperty = findProperty(test, 'suggestions');
						if (!suggestionsProperty) {
							context.report({
								loc: test.loc,
								messageId: 'missingSuggestion',
								fix: (fixer) => fixToAddSuggestion(fixer, test, result.suggestions)
							});
						} else if (suggestionsProperty.value.type === 'ArrayExpression') {
							verifySuggestions(suggestionsProperty.value, result.suggestions);
						}
					}
				}

				verifyMessage(test, result);
			}

			const outputNode = findProperty(node, 'output');

			if (outputNode && Object.hasOwn(results, 'output')) {
				const evaluated = getStaticValue(outputNode.value);
				if (evaluated && evaluated.value !== results.output) {
					context.report({
						loc: outputNode.value.loc,
						messageId: 'mismatch',
						data: {
							expect: JSON.stringify(evaluated.value),
							actual: JSON.stringify(results.output)
						},
						fix: (fixer) => {
							return fixer.replaceTextRange(outputNode.value.range, outputToString(results.output));
						}
					});
				}
			} else if (results.output) {
				const output = results.output;
				context.report({
					loc: node.loc,
					messageId: 'missingOutput',
					fix: (fixer) => {
						return fixToAddProperty(fixer, node, 'output', outputToString(output));
					}
				});
			}
		}

		// ----------------------------------------------------------------------
		// Public
		// ----------------------------------------------------------------------
		return {
			/** @param {MemberExpression} node  */
			'CallExpression > MemberExpression.callee'(node) {
				const parent = /** @type {CallExpression} */ (node.parent);
				if (!linterServese && getPropertyName(node) === 'run' && parent.arguments.length >= 2) {
					const rulePath = getSource(parent.arguments[1]);
					if (rulePath) {
						const ruleName = String(getStaticValue(parent.arguments[0])?.value ?? 'unknown');
						linterServese = getLinterServese(ruleName, rulePath);
					}
				}
			},
			/** @param {Property} node */
			Property(node) {
				if (linterServese && !invalidTestcasesNode && getPropertyName(node) === 'invalid') {
					invalidTestcasesNode = node.value;
					return;
				}
				if (
					linterServese &&
					invalidTestcasesNode &&
					invalidTestcasesNode.range[0] <= node.range[0] &&
					node.range[1] <= invalidTestcasesNode.range[1] &&
					getPropertyName(node) === 'code'
				) {
					verifyInvalidTestcase(/** @type {ObjectExpression} */ (node.parent));
				}
			}
		};

		/** @param {Property|MemberExpression} node */
		function getPropertyName(node) {
			return eslintUtils.getPropertyName(node, sourceCode.scopeManager.scopes[0]);
		}

		/** @param {Node} node  */
		function getStaticValue(node) {
			return eslintUtils.getStaticValue(node, sourceCode.scopeManager.scopes[0]);
		}

		/**
		 * @param {ObjectExpression} node
		 * @param {string} name
		 */
		function findProperty(node, name) {
			for (const property of node.properties) {
				if (property.type === 'Property' && getPropertyName(property) === name) {
					return property;
				}
			}
			return null;
		}

		/**
		 * @param {Node} expr
		 * @returns {string|null}
		 */
		function getSource(expr) {
			const source = getSourceInternal(expr);
			if (source == null) {
				return null;
			}
			if (source.startsWith('.')) {
				return require.resolve(path.resolve(path.dirname(context.filename), source));
			}
			return source;

			/**
			 * @param {Node} node
			 * @returns {string|null}
			 */
			function getSourceInternal(node) {
				if (
					node.type === 'TSAsExpression' ||
					node.type === 'TSNonNullExpression' ||
					node.type === 'TSSatisfiesExpression' ||
					node.type === 'TSInstantiationExpression'
				) {
					return getSourceInternal(node.expression);
				}
				if (node.type !== 'Identifier') {
					return null;
				}
				/** @type {Variable|null} */
				const variable = eslintUtils.findVariable(sourceCode.scopeManager.scopes[0], node);
				if (!variable) return null;
				for (const def of variable.defs) {
					if (def.type === 'ImportBinding') {
						return String(def.parent.source.value);
					}
					if (def.type === 'Variable') {
						const decl = /** @type {VariableDeclarator} */ (def.node);
						if (
							decl.init &&
							decl.init.type === 'CallExpression' &&
							decl.init.callee.type === 'Identifier' &&
							decl.init.callee.name === 'require' &&
							decl.init.arguments.length >= 1
						) {
							const evaluated = getStaticValue(decl.init.arguments[0]);
							if (evaluated) return String(evaluated.value);
						}
					}
				}
				return null;
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {Expression} node
		 * @param {import('../utils/linter-worker-servise/types').Suggestion[]} suggestions
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToAddSuggestion(fixer, node, suggestions) {
			if (node.type === 'Literal') {
				yield fixer.replaceText(
					node,
					`{ message: ${node.raw}, suggestions: [${suggestions.map(suggestionToString)}] }`
				);
				return;
			}
			if (node.type === 'ObjectExpression') {
				yield* fixToAddProperty(
					fixer,
					node,
					'suggestions',
					`[${suggestions.map(suggestionToString)}]`
				);
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {ObjectExpression} node
		 * @param {string} key
		 * @param {string} value
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToAddProperty(fixer, node, key, value) {
			const closeBrace = sourceCode.getLastToken(/** @type {ESTreeNode} */ (node));
			if (!closeBrace) return;
			const before = sourceCode.getTokenBefore(closeBrace);
			if (before?.value === '{') {
				yield fixer.insertTextBeforeRange(closeBrace.range, `${key}: ${value}`);
			} else if (before?.value === ',') {
				yield fixer.insertTextBeforeRange(before.range, `,${key}: ${value}`);
			} else {
				yield fixer.insertTextBeforeRange(closeBrace.range, `,${key}: ${value}`);
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {ArrayExpression} testcaseErrors
		 * @param {import('../utils/linter-worker-servise/types').Message[]} resultErrors
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixForMismatchErrorsLength(fixer, testcaseErrors, resultErrors) {
			if (testcaseErrors.elements.length > resultErrors.length) {
				for (const error of testcaseErrors.elements.slice(resultErrors.length)) {
					if (!error) continue;
					const maybeCommma = sourceCode.getTokenBefore(/** @type {ESTreeNode} */ (error));
					yield fixer.removeRange([
						(maybeCommma?.value === ',' ? maybeCommma : error).range[0],
						error.range[1]
					]);
				}
			} else if (testcaseErrors.elements.length < resultErrors.length) {
				const text = resultErrors
					.slice(testcaseErrors.elements.length)
					.map(
						(message) =>
							`{message:${JSON.stringify(message.message)},line:${message.line},column:${message.column}}`
					)
					.join(', ');

				const last = sourceCode.getLastToken(/** @type {ESTreeNode} */ (testcaseErrors));
				if (!last) return;
				const maybeCommma = sourceCode.getTokenBefore(last);

				yield fixer.insertTextBefore(
					last,
					maybeCommma?.value === ',' || maybeCommma?.value === '[' ? text : `,${text}`
				);
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {ArrayExpression} testcaseErrors
		 * @param {import('../utils/linter-worker-servise/types').Suggestion[]} resultErrors
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixForMismatchSuggestionLength(fixer, testcaseErrors, resultErrors) {
			if (testcaseErrors.elements.length > resultErrors.length) {
				for (const error of testcaseErrors.elements.slice(resultErrors.length)) {
					if (!error) continue;
					const maybeCommma = sourceCode.getTokenBefore(/** @type {ESTreeNode} */ (error));
					yield fixer.removeRange([
						(maybeCommma?.value === ',' ? maybeCommma : error).range[0],
						error.range[1]
					]);
				}
			} else if (testcaseErrors.elements.length < resultErrors.length) {
				const text = resultErrors
					.slice(testcaseErrors.elements.length)
					.map(suggestionToString)
					.join(', ');

				const last = sourceCode.getLastToken(/** @type {ESTreeNode} */ (testcaseErrors));
				if (!last) return;
				const maybeCommma = sourceCode.getTokenBefore(last);

				yield fixer.insertTextBefore(
					last,
					maybeCommma?.value === ',' || maybeCommma?.value === '[' ? text : `,${text}`
				);
			}
		}
	}
};

/**
 * @param {import('../utils/linter-worker-servise/types').Suggestion} seggestion
 */
function suggestionToString(seggestion) {
	return `{ ${
		seggestion.messageId
			? `messageId: ${JSON.stringify(seggestion.messageId)}`
			: `desc: ${JSON.stringify(seggestion.desc)}`
	}, output: ${outputToString(seggestion.output)}}`;
}

/** @param {string|null|undefined} output  */
function outputToString(output) {
	if (output == null) {
		return 'null';
	}
	if (output.includes('`') || output.includes('${') || !output.includes('\\')) {
		return `\`${output.replace(/(?<needEscape>[\\`]|\$\{)/gu, '\\$<needEscape>')}\``;
	}
	return `String.raw\`${output}\``;
}
