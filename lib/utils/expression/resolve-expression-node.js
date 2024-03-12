'use strict';

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
 * @typedef {import('estree').ImportDeclaration} SimpleImportDeclaration
 * @typedef {import('estree').Literal} SimpleLiteral
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
		context.filename
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
			/** @type {SimpleExpression & { type: (typeof node)['type']}} */
			const result = {
				type: node.type,
				elements: []
			};
			for (const element of node.elements) {
				if (!element) {
					result.elements.push(null);
					continue;
				}
				if (element.type !== 'SpreadElement') {
					result.elements.push(resolveExpression(element));
					continue;
				}
				const spreadArgument = resolveExpression(element.argument);
				if (spreadArgument.type === 'ArrayExpression') {
					result.elements.push(...spreadArgument.elements);
					continue;
				}
				result.elements.push({
					type: 'SpreadElement',
					argument: spreadArgument
				});
			}
			return result;
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
			return getStaticValueLiteral(node, initialScope) || node;
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
				isRequireIdentifire(node.callee.object) &&
				!node.callee.computed &&
				node.callee.property.type === 'Identifier' &&
				node.callee.property.name === 'resolve' &&
				node.arguments.length >= 1 &&
				node.arguments[0].type === 'Literal'
			) {
				const source = String(node.arguments[0].value);
				const resolvedSource = Module.createRequire(filename).resolve(source);
				return {
					type: 'Literal',
					value: resolvedSource
				};
			}
			return getStaticValueLiteral(node, initialScope) || node;
		},
		ChainExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
		},
		ClassExpression(node) {
			return node;
		},
		ConditionalExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
		},
		FunctionExpression(node) {
			return node;
		},
		Identifier(node) {
			const variable = eslintUtils.findVariable(initialScope, /** @type {any} */ (node));
			if (variable != null && variable.defs.length === 1) {
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
			return getStaticValueLiteral(node, initialScope) || node;
		},
		MemberExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
		},
		MetaProperty(node) {
			return getStaticValueLiteral(node, initialScope) || node;
		},
		NewExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
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
			return getStaticValueLiteral(node, initialScope) || node;
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
			return getStaticValueLiteral(node, initialScope) || node;
		},
		UpdateExpression(node) {
			return getStaticValueLiteral(node, initialScope) || node;
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

	const node = resolveExpression(startNode);

	return {
		node,
		imports
	};
}
