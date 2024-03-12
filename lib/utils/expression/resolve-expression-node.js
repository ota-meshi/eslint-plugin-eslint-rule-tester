'use strict';

const path = require('path');
const url = require('url');
const { Module } = require('module');
const eslintUtils = require('@eslint-community/eslint-utils');
const { resolveImportSource } = require('../import/resolve-import');

let seq = 0;

module.exports = { resolveExpressionNode };

/**
 * @typedef {import("eslint").Rule.RuleContext} RuleContext
 * @typedef {import("eslint").Scope.Variable} Variable
 * @typedef {import("eslint").Scope.Scope} Scope
 * @typedef {import('estree').Expression} SimpleExpression
 * @typedef {import('estree').Pattern} SimplePattern
 * @typedef {import('estree').Property} SimpleProperty
 * @typedef {import('estree').Identifier} SimpleIdentifier
 * @typedef {import('estree').MemberExpression} SimpleMemberExpression
 * @typedef {import('estree').SimpleCallExpression} SimpleCallExpression
 * @typedef {import('estree').ImportDeclaration} SimpleImportDeclaration
 * @typedef {import('estree').Literal} SimpleLiteral
 * @typedef {import('estree').ArrayExpression} SimpleArrayExpression
 * @typedef {import('estree').NewExpression} SimpleNewExpression
 * @typedef {import('estree').SpreadElement} SimpleSpreadElement
 * @typedef {import('estree').Node} ESTreeNode
 */

/**
 * @type {WeakMap<SimpleExpression, import('../types').ResolvedExpression>}
 */
const cache = new WeakMap();

/**
 * @param {import("@typescript-eslint/types").TSESTree.Expression} node
 * @param {RuleContext} context
 * @returns {import('../types').ResolvedExpression}
 */
function resolveExpressionNode(node, context) {
	const initialScope = context.sourceCode.scopeManager.scopes[0];
	return resolveExpressionImpl(
		/** @type {SimpleExpression} */ (node),
		initialScope,
		path.isAbsolute(context.filename) ? context.filename : path.join(context.cwd, context.filename)
	);
}

/**
 * @param {ESTreeNode} node
 * @returns {node is SimpleIdentifier}
 */
function isRequireIdentifire(node) {
	return node.type === 'Identifier' && node.name === 'require';
}

/**
 * @param {unknown} value
 * @returns {SimpleExpression|null}
 */
function valueToLiteral(value) {
	if (value === undefined) {
		return {
			type: 'Identifier',
			name: 'undefined'
		};
	}
	if (value === null || typeof value === 'string' || typeof value === 'boolean') {
		return {
			type: 'Literal',
			value
		};
	}
	if (typeof value === 'number') {
		if (Number.isNaN(value)) {
			return {
				type: 'Identifier',
				name: 'NaN'
			};
		}
		if (!Number.isFinite(value)) {
			/** @type {SimpleIdentifier} */
			const identifier = {
				type: 'Identifier',
				name: 'Infinity'
			};
			if (value >= 0) return identifier;
			return {
				type: 'UnaryExpression',
				operator: '-',
				argument: identifier,
				prefix: true
			};
		}
		return {
			type: 'Literal',
			value
		};
	}
	if (typeof value === 'bigint') {
		return {
			type: 'Literal',
			value,
			bigint: String(value)
		};
	}
	if (value instanceof RegExp) {
		return {
			type: 'Literal',
			value,
			regex: {
				pattern: value.source,
				flags: value.flags
			}
		};
	}
	if (typeof value === 'function') {
		return null;
	}
	if (Array.isArray(value)) {
		/** @type {SimpleExpression[]} */
		const elements = [];
		for (const e of value) {
			const node = valueToLiteral(e);
			if (!node) {
				return null;
			}
			elements.push(node);
		}
		return {
			type: 'ArrayExpression',
			elements
		};
	}
	/** @type {SimpleProperty[]} */
	const properties = [];
	for (const entry of Object.entries(value)) {
		const node = valueToLiteral(entry[1]);
		if (!node) {
			return null;
		}
		properties.push({
			type: 'Property',
			kind: 'init',
			computed: false,
			key: {
				type: 'Literal',
				value: entry[0]
			},
			method: false,
			shorthand: false,
			value: node
		});
	}
	return {
		type: 'ObjectExpression',
		properties
	};
}

/**
 * @param {SimpleExpression} node
 * @param {Scope} initialScope
 * @returns {SimpleExpression|null}
 */
function getStaticValueLiteral(node, initialScope) {
	const evaluated = eslintUtils.getStaticValue(/** @type {any} */ (node), initialScope);
	if (evaluated) {
		return valueToLiteral(evaluated.value);
	}
	return null;
}

/**
 * @param {SimpleExpression} startNode
 * @param {Scope} initialScope
 * @param {string} filename
 * @returns {import('../types').ResolvedExpression}
 */
function resolveExpressionImpl(startNode, initialScope, filename) {
	/** @type {import('../types').ResolvedExpression['imports']} */
	const imports = new Map();

	const visited = new Set();

	/** @type {import('../types').Operations<SimpleExpression, SimpleExpression>} */
	const operations = {
		ArrayExpression(node) {
			return {
				type: node.type,
				elements: resolveElements(node.elements)
			};
		},
		ArrowFunctionExpression(node) {
			return node;
		},
		AssignmentExpression(node) {
			return resolveExpression(node.right);
		},
		AwaitExpression(node) {
			return node;
		},
		BinaryExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					left: resolveExpression(node.left),
					operator: node.operator,
					right: resolveExpression(node.right)
				}
			);
		},
		CallExpression(node) {
			if (
				isRequireIdentifire(node.callee) &&
				node.arguments.length >= 1 &&
				node.arguments[0].type === 'Literal'
			) {
				const source = String(node.arguments[0].value);
				/** @type {SimpleIdentifier} */
				const id = {
					type: 'Identifier',
					name: `$_import_${source.replace(/[^\w$]/g, '_')}_${seq++}`
				};
				imports.set(id.name, resolveImportSource(source, filename));
				return id;
			}
			if (
				node.callee.type === 'MemberExpression' &&
				(isRequireIdentifire(node.callee.object) ||
					(node.callee.object.type === 'MetaProperty' &&
						node.callee.object.meta.name === 'import' &&
						node.callee.object.property.name === 'meta')) &&
				!node.callee.computed &&
				node.callee.property.type === 'Identifier' &&
				node.callee.property.name === 'resolve' &&
				node.arguments.length >= 1 &&
				node.arguments[0].type === 'Literal'
			) {
				// require.resolve() or import.meta.resolve()
				const source = String(node.arguments[0].value);
				const resolvedSource = Module.createRequire(filename).resolve(source);
				return {
					type: 'Literal',
					value: resolvedSource
				};
			}
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					callee: node.callee.type !== 'Super' ? resolveExpression(node.callee) : node.callee,
					arguments: resolveElements(node.arguments),
					optional: node.optional
				}
			);
		},
		ChainExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					expression: /** @type {SimpleMemberExpression|SimpleCallExpression} */ (
						resolveExpression(node.expression)
					)
				}
			);
		},
		ClassExpression(node) {
			return node;
		},
		ConditionalExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					test: resolveExpression(node.test),
					consequent: resolveExpression(node.consequent),
					alternate: resolveExpression(node.alternate)
				}
			);
		},
		FunctionExpression(node) {
			return node;
		},
		Identifier(node) {
			const variable = eslintUtils.findVariable(initialScope, /** @type {any} */ (node));
			if (variable && variable.defs.length === 1) {
				const def = variable.defs[0];
				if (def.type === 'Variable') {
					if (def.parent && def.parent.kind === 'const' && def.node.init) {
						const init = resolveExpression(def.node.init);
						return resolvePattern(init, def.node.id, node.name) || node;
					}
					return node;
				}
				if (def.type === 'ImportBinding') {
					const source = String(def.parent.source.value);
					/** @type {SimpleIdentifier} */
					const id = {
						type: 'Identifier',
						name: `$_import_${source.replace(/[^\w$]/g, '_')}_${seq++}`
					};
					imports.set(id.name, resolveImportSource(source, filename));
					return resolveImportSpecifier(id, def.node);
				}
			}

			if (!variable || variable.defs.length === 0) {
				if (node.name === '__dirname') {
					return {
						type: 'Literal',
						value: path.dirname(filename)
					};
				}
				if (node.name === '__filename') {
					return {
						type: 'Literal',
						value: filename
					};
				}
			}
			return node;
		},
		ImportExpression(node) {
			return node;
		},
		/** @param {SimpleLiteral} node */
		Literal(node) {
			return /** @type {SimpleLiteral} */ ({
				type: node.type,
				value: node.value
			});
		},
		LogicalExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					left: resolveExpression(node.left),
					operator: node.operator,
					right: resolveExpression(node.right)
				}
			);
		},
		MemberExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					computed: node.computed,
					optional: node.optional,
					object: node.object.type !== 'Super' ? resolveExpression(node.object) : node.object,
					property:
						node.computed && node.property.type !== 'PrivateIdentifier'
							? resolveExpression(node.property)
							: node.property
				}
			);
		},
		MetaProperty(node) {
			if (node.meta.name === 'import' && node.property.name === 'meta') {
				return {
					type: 'ObjectExpression',
					properties: [
						{
							type: 'Property',
							key: { type: 'Identifier', name: 'dirname' },
							computed: false,
							kind: 'init',
							method: false,
							shorthand: false,
							value: {
								type: 'Literal',
								value: path.dirname(filename)
							}
						},
						{
							type: 'Property',
							key: { type: 'Identifier', name: 'filename' },
							computed: false,
							kind: 'init',
							method: false,
							shorthand: false,
							value: {
								type: 'Literal',
								value: filename
							}
						},
						{
							type: 'Property',
							key: { type: 'Identifier', name: 'url' },
							computed: false,
							kind: 'init',
							method: false,
							shorthand: false,
							value: {
								type: 'Literal',
								value: url.pathToFileURL(filename).toString()
							}
						}
					]
				};
			}
			return getStaticValueLiteral(node, initialScope) || node;
		},
		NewExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					callee: node.callee.type !== 'Super' ? resolveExpression(node.callee) : node.callee,
					arguments: resolveElements(node.arguments)
				}
			);
		},
		ObjectExpression(node) {
			/** @type {SimpleExpression & { type: (typeof node)['type']}} */
			const result = {
				type: node.type,
				properties: []
			};
			for (const property of node.properties) {
				if (property.type === 'Property') {
					result.properties.push({
						type: 'Property',
						computed: property.computed,
						kind: property.kind,
						method: property.method,
						shorthand: property.shorthand,
						key:
							property.computed && property.key.type !== 'PrivateIdentifier'
								? resolveExpression(property.key)
								: property.key,
						value: resolveExpression(/** @type {SimpleExpression} */ (property.value))
					});
					continue;
				}
				const spreadArgument = resolveExpression(property.argument);
				if (spreadArgument.type === 'ObjectExpression') {
					result.properties.push(...spreadArgument.properties);
					continue;
				}
				result.properties.push({
					type: 'SpreadElement',
					argument: spreadArgument
				});
			}
			return result;
		},
		SequenceExpression(node) {
			return resolveExpression(node.expressions[node.expressions.length - 1]);
		},
		TaggedTemplateExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					tag: resolveExpression(node.tag),
					quasi: {
						type: 'TemplateLiteral',
						expressions: node.quasi.expressions.map(resolveExpression),
						quasis: node.quasi.quasis
					}
				}
			);
		},
		TemplateLiteral(node) {
			/** @type {SimpleExpression & { type: (typeof node)['type']}} */
			const result = {
				type: node.type,
				quasis: node.quasis,
				expressions: node.expressions.map(resolveExpression)
			};
			if (result.expressions.every((e) => e.type === 'Literal')) {
				let str = `${result.quasis[0].value.cooked}${result.expressions.map((e, i) => `${/** @type {SimpleLiteral} */ (e).value}${result.quasis[i + 1].value.cooked}`)}`;
				return {
					type: 'Literal',
					value: str
				};
			}
			return result;
		},
		ThisExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
		},
		UnaryExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					operator: node.operator,
					prefix: node.prefix,
					argument: resolveExpression(node.argument)
				}
			);
		},
		UpdateExpression(node) {
			return (
				getStaticValueLiteral(node, initialScope) || {
					type: node.type,
					operator: node.operator,
					prefix: node.prefix,
					argument: resolveExpression(node.argument)
				}
			);
		},
		YieldExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
		}
	};

	/**
	 * @param {SimpleExpression} node
	 * @returns {SimpleExpression}
	 */
	function resolveExpression(node) {
		const cached = cache.get(node);
		if (cached) {
			for (const imp of cached.imports) {
				imports.set(imp[0], imp[1]);
			}
			return cached.node;
		}
		if (visited.has(node)) {
			return node;
		}
		visited.add(node);
		if (node != null && Object.hasOwnProperty.call(operations, node.type)) {
			const result = /** @type {any} */ (operations)[node.type](node, initialScope);
			cache.set(node, { node: result, imports });
			return result;
		}
		return node;
	}

	/**
	 * @param {SimpleExpression} init
	 * @param {SimpleImportDeclaration['specifiers'][number]} spec
	 * @returns {SimpleExpression}
	 */
	function resolveImportSpecifier(init, spec) {
		if (spec.type === 'ImportDefaultSpecifier') {
			return {
				type: 'MemberExpression',
				computed: false,
				optional: false,
				object: init,
				property: {
					type: 'Identifier',
					name: 'default'
				}
			};
		}
		if (spec.type === 'ImportNamespaceSpecifier') {
			return init;
		}
		if (spec.type === 'ImportSpecifier') {
			return {
				type: 'MemberExpression',
				computed: false,
				optional: false,
				object: init,
				property: spec.imported
			};
		}
		throw new Error(`Unknown spec type:${/** @type {any} */ (spec).type}`);
	}

	/**
	 * @param {SimpleExpression} init
	 * @param {SimplePattern} id
	 * @param {string} name
	 * @returns {SimpleExpression|null}
	 */
	function resolvePattern(init, id, name) {
		if (id.type === 'Identifier') {
			if (id.name === name) return init;
			return null;
		}
		if (id.type === 'AssignmentPattern') {
			return resolvePattern(init, id.left, name);
		}
		if (id.type === 'MemberExpression') {
			return null;
		}
		if (id.type === 'ArrayPattern') {
			for (let index = 0; index < id.elements.length; index++) {
				const element = id.elements[index];
				if (!element) continue;
				/** @type {SimpleMemberExpression} */
				const mem = {
					type: 'MemberExpression',
					computed: true,
					optional: false,
					object: init,
					property: {
						type: 'Literal',
						value: index
					}
				};
				const resolved = resolvePattern(mem, element, name);
				if (resolved) {
					return resolved;
				}
			}
			return null;
		}
		if (id.type === 'ObjectPattern') {
			for (const property of id.properties) {
				if (property.type !== 'Property') continue;
				/** @type {SimpleMemberExpression} */
				const mem = {
					type: 'MemberExpression',
					computed: property.computed,
					optional: false,
					object: init,
					property: property.key
				};
				const resolved = resolvePattern(mem, property.value, name);
				if (resolved) {
					return resolved;
				}
			}
			return null;
		}
		return null;
	}

	/**
	 * @template {SimpleExpression | SimpleSpreadElement | null} T
	 * @param {T[]} args
	 * @returns {(SimpleExpression | SimpleSpreadElement)[]}
	 */
	function resolveElements(args) {
		/** @type {(SimpleExpression | SimpleSpreadElement)[]} */
		const result = [];
		for (const argument of args) {
			if (!argument) {
				result.push({ type: 'Identifier', name: 'undefined' });
			} else if (argument.type !== 'SpreadElement') {
				result.push(resolveExpression(argument));
			} else {
				const spreadArgument = resolveExpression(argument.argument);
				if (spreadArgument.type === 'ArrayExpression') {
					for (const element of spreadArgument.elements) {
						if (!element) {
							result.push({ type: 'Identifier', name: 'undefined' });
						} else {
							result.push(element);
						}
					}
				} else {
					result.push({
						type: 'SpreadElement',
						argument: spreadArgument
					});
				}
			}
		}
		return result;
	}

	const node = resolveExpression(startNode);

	return {
		node,
		imports
	};
}
