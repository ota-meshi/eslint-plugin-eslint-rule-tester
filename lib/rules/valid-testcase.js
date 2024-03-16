// @ts-check
'use strict';

const eslintUtils = require('@eslint-community/eslint-utils');
const { getLinterService } = require('../utils/linter-worker-service');
const { resolveExpressionNode } = require('../utils/expression/resolve-expression-node');
const { resolveImportSource } = require('../utils/import/resolve-import');

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
/**
 * @typedef {object} FixProperty
 * @property {string} key
 * @property {(indent: string) => string} buildValue
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
			missingErrors: "Error should have 'errors' but not definitions.",
			mismatchLength: 'Should have {{actual}} {{kind}} but had {{expect}} definitions.',
			missingSuggestion: "Error should have 'suggestions' but not definitions.",
			extraSuggestion: "Error should not have 'suggestions'.",
			mismatch: 'Expected {{expect}} but {{actual}}.',
			missingMessage: "Test must specify either 'messageId' or 'message'.",
			missingSuggestionMessage: "Test must specify either 'messageId' or 'desc'.",
			missingOutput: "Test must specify 'output'.",
			extraOutput: "Test should not have 'output'."
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

		/** @type {import("../utils/types").LinterWorkerService|null} */
		let linterServices = null;
		/** @type {import("../utils/types").ResolvedExpression|null} */
		let ruleTesterConstructorParams = null;
		/** @type {Property['value'] | null} */
		let invalidTestcasesNode = null;

		/**
		 * @param {ObjectExpression} node
		 */
		function extractTestConfig(node) {
			/** @type {Record<string, unknown>} */
			const anyConfig = {};
			/** @type {import("../utils/types").ConfigAST} */
			const astConfig = {};
			/** @type {Expression|null} */
			let errors = null;
			for (const property of node.properties) {
				if (property.type !== 'Property') continue;
				const name = getPropertyName(property);
				const value = /** @type {Expression} */ (property.value);
				if (name === 'errors') {
					errors = value;
				} else if (name) {
					const evaluated = getStaticValue(value);
					if (evaluated) {
						anyConfig[name] = evaluated.value;
					} else if (name !== 'output' && name !== 'code') {
						astConfig[name] = resolveExpressionNode(value, context);
					}
				}
			}

			if (!anyConfig.code) {
				return null;
			}

			const config = /** @type {import("../utils/types").Config} */ (anyConfig);
			config.$$ast = astConfig;
			if (ruleTesterConstructorParams) {
				config.$$constructorAst = ruleTesterConstructorParams;
			}

			return {
				config,
				errors
			};
		}

		/**
		 * @param {ObjectExpression} node
		 * @param {import("../utils/types").Suggestion} suggestion
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
						return fixToAddProperty(
							fixer,
							node,
							suggestion.messageId
								? {
										key: 'messageId',
										buildValue: () => JSON.stringify(suggestion.messageId)
									}
								: {
										key: 'desc',
										buildValue: () => JSON.stringify(suggestion.desc)
									}
						);
					}
				});
			}
			if (!outputNode) {
				context.report({
					loc: node.loc,
					messageId: 'missingOutput',
					fix: (fixer) => {
						return fixToAddProperty(fixer, node, {
							key: 'output',
							buildValue: () => outputToString(suggestion.output)
						});
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
		 * @param {import("../utils/types").Suggestion[]} suggestions
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
		 * @param {import("../utils/types").Message} message
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
			const messageIdNode = findProperty(node, 'messageId');
			const messageNode = findProperty(node, 'message');
			if (!messageIdNode && !messageNode) {
				context.report({
					loc: node.loc,
					messageId: 'missingMessage',
					fix: (fixer) => {
						return fixToAddProperty(
							fixer,
							node,
							message.messageId
								? {
										key: 'messageId',
										buildValue: () => JSON.stringify(message.messageId)
									}
								: {
										key: 'message',
										buildValue: () => JSON.stringify(message.message)
									}
						);
					}
				});
			}

			for (const property of node.properties) {
				if (property.type !== 'Property') continue;

				const key = /** @type {(keyof import("../utils/types").Message)|null} */ (
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
						const results = linterServices?.getLinterResult(testcase.config);
						if (!results) {
							return null;
						}
						return fixToAddProperty(fixer, node, {
							key: 'errors',
							buildValue: (indent) =>
								buildArrayText(
									indent,
									results.errors.map(
										(message) =>
											`{ message: ${JSON.stringify(message.message)}, line: ${message.line}, column: ${message.column} }`
									)
								)
						});
					}
				});
				return;
			}
			if (testcase.errors.type !== 'ArrayExpression') return;
			const errors = testcase.errors;
			if (errors.elements.some((e) => e?.type === 'SpreadElement')) return;
			const results = linterServices?.getLinterResult(testcase.config);
			if (!results)
				// Unknown error
				return;
			if (results.errors.some((m) => m.ruleId == null)) {
				// Fatal error
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
					fix:
						results.errors.length > 0
							? (fixer) => fixForMismatchErrorsLength(fixer, errors, results.errors)
							: null
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
				} else if (test.type === 'ObjectExpression') {
					const suggestionsProperty = findProperty(test, 'suggestions');
					if (suggestionsProperty) {
						context.report({
							loc: suggestionsProperty.key.loc,
							messageId: 'extraSuggestion',
							fix: (fixer) => fixToRemoveProperty(fixer, suggestionsProperty)
						});
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
						return fixToAddProperty(fixer, node, {
							key: 'output',
							buildValue: () => outputToString(output)
						});
					}
				});
			} else if (outputNode) {
				context.report({
					loc: outputNode.key.loc,
					messageId: 'extraOutput',
					fix: (fixer) => fixToRemoveProperty(fixer, outputNode)
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
				if (!linterServices && getPropertyName(node) === 'run' && parent.arguments.length >= 2) {
					const rulePath = getSource(parent.arguments[1]);
					if (rulePath) {
						const ruleName = String(getStaticValue(parent.arguments[0])?.value ?? 'unknown');
						linterServices = getLinterService(ruleName, rulePath);
					}
				}
				const resolveRuleTester = resolveExpressionNode(node.object, context);
				if (resolveRuleTester.node.type === 'NewExpression') {
					const arg = resolveRuleTester.node.arguments[0];
					if (arg && arg.type === 'ObjectExpression') {
						ruleTesterConstructorParams = {
							node: arg,
							imports: resolveRuleTester.imports
						};
					}
				}
			},
			/** @param {Property} node */
			Property(node) {
				if (linterServices && !invalidTestcasesNode && getPropertyName(node) === 'invalid') {
					invalidTestcasesNode = node.value;
					return;
				}
				if (
					linterServices &&
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
			return source ? resolveImportSource(source, context.filename) : null;

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
		 * @param {ObjectExpression} node
		 * @param {FixProperty} property
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToAddProperty(fixer, node, { key, buildValue }) {
			if (node.properties.length === 0) {
				const openBrace = sourceCode.getFirstToken(/** @type {ESTreeNode} */ (node));
				if (!openBrace) return;
				let insertText = '';
				let indent;
				if (node.loc.start.line === node.loc.end.line) {
					// Same line
					indent = getIndentFromToken(node);
					insertText = ' ';
				} else {
					indent = getNextIndentFromToken(node);
					insertText = `\n${indent}`;
				}
				insertText += `${key}: ${buildValue(indent)}`;
				if (node.range[0] + 2 === node.range[1]) insertText += ' ';
				yield fixer.insertTextAfterRange(openBrace.range, insertText);
				return;
			}
			const lastProperty = node.properties[node.properties.length - 1];
			const afterLastProperty = sourceCode.getTokenAfter(/** @type {ESTreeNode} */ (lastProperty));
			let insertText = afterLastProperty?.value === ',' ? '' : ',';
			let indent;
			if (node.loc.start.line === lastProperty.loc.end.line) {
				// Same line
				indent = getIndentFromToken(node);
				insertText += ' ';
			} else {
				indent = getIndentFromToken(lastProperty);
				insertText += `\n${indent}`;
			}
			insertText += `${key}: ${buildValue(indent)}`;
			const targetToken = afterLastProperty?.value === ',' ? afterLastProperty : lastProperty;
			yield fixer.insertTextAfterRange(targetToken.range, insertText);
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {ArrayExpression} node
		 * @param {string[]} elements
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToAddElement(fixer, node, elements) {
			const closeBrace = sourceCode.getLastToken(/** @type {ESTreeNode} */ (node));
			if (!closeBrace) return;
			const beforeCloseBrace = sourceCode.getTokenBefore(closeBrace);
			if (!beforeCloseBrace) return;
			if (beforeCloseBrace.value === '[') {
				const openBrace = beforeCloseBrace;
				const indent = getNextIndentFromToken(node);
				let insertText = elements.map((element) => `\n${indent}${element}`).join(',');
				if (node.loc.start.line === node.loc.end.line) {
					const indent = getIndentFromToken(node);
					insertText += `\n${indent}`;
				}
				yield fixer.insertTextAfterRange(openBrace.range, insertText);
				return;
			}
			const lastElement = node.elements[node.elements.length - 1];
			const lastElementToken = lastElement || beforeCloseBrace;
			let insertText = beforeCloseBrace.value === ',' ? '' : ',';
			if (node.loc.start.line === lastElementToken.loc.end.line) {
				// Same line
				insertText += ` ${elements.join(', ')}`;
			} else {
				const indent = getIndentFromToken(lastElementToken);
				insertText += elements.map((element) => `\n${indent}${element}`).join(',');
			}
			const targetToken = beforeCloseBrace.value === ',' ? beforeCloseBrace : lastElementToken;
			yield fixer.insertTextAfterRange(targetToken.range, insertText);
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {Property} node
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToRemoveProperty(fixer, node) {
			const before = sourceCode.getTokenBefore(/** @type {ESTreeNode} */ (node));
			if (before?.value === ',') {
				yield fixer.removeRange([before.range[0], node.range[1]]);
			} else {
				const start = before ? before.range[1] : node.range[0];
				const after = sourceCode.getTokenAfter(/** @type {ESTreeNode} */ (node));
				const end = (after?.value === ',' ? after : node).range[1];
				yield fixer.removeRange([start, end]);
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {Expression|SpreadElement} node
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToRemoveElement(fixer, node) {
			const maybeComma = sourceCode.getTokenBefore(/** @type {ESTreeNode} */ (node));
			yield fixer.removeRange([
				(maybeComma?.value === ',' ? maybeComma : node).range[0],
				node.range[1]
			]);
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {Expression} node
		 * @param {import('../utils/types').Suggestion[]} suggestions
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixToAddSuggestion(fixer, node, suggestions) {
			if (node.type === 'Literal') {
				const indent = getIndentFromToken(node);
				yield fixer.replaceText(
					node,
					buildObjectText(indent, [
						{ key: 'message', buildValue: () => node.raw },
						{
							key: 'suggestions',
							buildValue: (indent) =>
								buildArrayText(
									indent,
									suggestions.map((suggestion) =>
										suggestionToString(getNextIndent(indent), suggestion)
									)
								)
						}
					])
				);
				return;
			}
			if (node.type === 'ObjectExpression') {
				yield* fixToAddProperty(fixer, node, {
					key: 'suggestions',
					buildValue: (indent) =>
						buildArrayText(
							indent,
							suggestions.map((suggestion) => suggestionToString(getNextIndent(indent), suggestion))
						)
				});
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {ArrayExpression} testcaseErrors
		 * @param {import('../utils/types').Message[]} resultErrors
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixForMismatchErrorsLength(fixer, testcaseErrors, resultErrors) {
			if (testcaseErrors.elements.length > resultErrors.length) {
				for (const error of testcaseErrors.elements.slice(resultErrors.length)) {
					if (!error) continue;
					yield* fixToRemoveElement(fixer, error);
				}
			} else if (testcaseErrors.elements.length < resultErrors.length) {
				const elements = resultErrors
					.slice(testcaseErrors.elements.length)
					.map(
						(message) =>
							`{ message: ${JSON.stringify(message.message)}, line: ${message.line}, column: ${message.column} }`
					);
				yield* fixToAddElement(fixer, testcaseErrors, elements);
			}
		}

		/**
		 * @param {RuleFixer} fixer
		 * @param {ArrayExpression} testcaseErrors
		 * @param {import('../utils/types').Suggestion[]} resultErrors
		 * @returns {IterableIterator<ReportFix>}
		 */
		function* fixForMismatchSuggestionLength(fixer, testcaseErrors, resultErrors) {
			if (testcaseErrors.elements.length > resultErrors.length) {
				for (const error of testcaseErrors.elements.slice(resultErrors.length)) {
					if (!error) continue;
					yield* fixToRemoveElement(fixer, error);
				}
			} else if (testcaseErrors.elements.length < resultErrors.length) {
				const indent = getNextIndentFromToken(testcaseErrors);
				const elements = resultErrors
					.slice(testcaseErrors.elements.length)
					.map((suggestion) => suggestionToString(indent, suggestion));
				yield* fixToAddElement(fixer, testcaseErrors, elements);
			}
		}

		/**
		 * @param {object} token
		 * @param {import('estree').SourceLocation} token.loc
		 */
		function getIndentFromToken(token) {
			const indent = sourceCode.lines[token.loc.start.line - 1].slice(0, token.loc.start.column);
			return `${/^\s*/u.exec(indent)?.[0]}`;
		}

		/**
		 * @param {object} token
		 * @param {import('estree').SourceLocation} token.loc
		 */
		function getNextIndentFromToken(token) {
			const indent = getIndentFromToken(token);
			const addIndent = indent.length && indent[0] === '\t' ? '\t' : '  ';
			return `${indent}${addIndent}`;
		}
	}
};

/**
 * @param {string} indent
 */
function getNextIndent(indent) {
	const addIndent = indent.length && indent[0] === '\t' ? '\t' : '  ';
	return `${indent}${addIndent}`;
}

/**
 * @param {string} indent
 * @param {FixProperty[]} properties
 */
function buildObjectText(indent, properties) {
	const nextIndent = getNextIndent(indent);
	const textProperties = properties.map((p) => `${p.key}: ${p.buildValue(nextIndent)}`);
	if (textProperties.some((text) => text.includes('\n'))) {
		return `{\n${nextIndent}${textProperties.join(`,\n${nextIndent}`)}\n${indent}}`;
	}
	return `{ ${textProperties.join(', ')} }`;
}

/**
 * @param {string} indent
 * @param {string[]} elements
 */
function buildArrayText(indent, elements) {
	const nextIndent = getNextIndent(indent);
	const text = elements.join(`,\n${nextIndent}`);
	return `[\n${nextIndent}${text}\n${indent}]`;
}

/**
 * @param {string} indent
 * @param {import('../utils/types').Suggestion} suggestion
 */
function suggestionToString(indent, suggestion) {
	return buildObjectText(indent, [
		suggestion.messageId
			? {
					key: 'messageId',
					buildValue: () => JSON.stringify(suggestion.messageId)
				}
			: { key: 'desc', buildValue: () => JSON.stringify(suggestion.desc) },
		{
			key: 'output',
			buildValue: () => outputToString(suggestion.output)
		}
	]);
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
