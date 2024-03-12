// @ts-expect-error -- ?
import { getStaticValue } from '@eslint-community/eslint-utils';
import { Module } from 'module';

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
 * @typedef {import('estree').SpreadElement} SimpleSpreadElement
 * @typedef {import('estree').Node} ESTreeNode
 * @typedef {import('../types.js').ResolvedExpression} ResolvedExpression
 */

/**
 * @typedef {import("../types.js").Evaluated|null} Result
 */
/**
 * @type {WeakMap<SimpleExpression, import("../types.js").Evaluated>}
 */
const cache = new WeakMap();

/**
 * @param {ResolvedExpression} data
 * @returns {Promise<Result>}
 */
export function resolveExpression(data) {
	return resolveExpressionImpl(data);
}

/**
 * @param {ResolvedExpression} data
 * @returns {Promise<Result>}
 */
function resolveExpressionImpl(data) {
	/** @type {Map<string, string>} */
	const imports = data.imports;

	/** @type {import('../types.js').Operations<SimpleExpression, Promise<Result>|Result>} */
	const operations = {
		async ArrayExpression(node) {
			/** @type {unknown[]} */
			const result = [];
			for (const element of node.elements) {
				if (!element) {
					result.push(undefined);
					continue;
				}
				if (element.type !== 'SpreadElement') {
					const evaluated = await resolveExpression(element);
					if (evaluated) {
						result.push(evaluated.value);
						continue;
					}
					return null;
				}
				const spreadArgument = await resolveExpression(element.argument);
				if (spreadArgument && Array.isArray(spreadArgument.value)) {
					result.push(...spreadArgument.value);
					continue;
				}
				return null;
			}
			return {
				value: result
			};
		},
		ArrowFunctionExpression(node) {
			return getStaticValue(node);
		},
		AssignmentExpression(node) {
			return resolveExpression(node.right);
		},
		async AwaitExpression(node) {
			const evaluated = await resolveExpression(node.argument);
			if (evaluated) {
				return {
					value: await evaluated.value
				};
			}
			return null;
		},
		async BinaryExpression(node) {
			/** @type {import('../types.js').Evaluated<any>|null} */
			const left = await resolveExpression(node.left);
			if (!left) return null;
			/** @type {import('../types.js').Evaluated<any>|null} */
			const right = await resolveExpression(node.right);
			if (!right) return null;
			switch (node.operator) {
				case '==':
					return { value: left.value == right.value }; //eslint-disable-line eqeqeq -- ignore
				case '!=':
					return { value: left.value != right.value }; //eslint-disable-line eqeqeq -- ignore
				case '===':
					return { value: left.value === right.value };
				case '!==':
					return { value: left.value !== right.value };
				case '<':
					return { value: left.value < right.value };
				case '<=':
					return { value: left.value <= right.value };
				case '>':
					return { value: left.value > right.value };
				case '>=':
					return { value: left.value >= right.value };
				case '<<':
					return { value: left.value << right.value };
				case '>>':
					return { value: left.value >> right.value };
				case '>>>':
					return { value: left.value >>> right.value };
				case '+':
					return { value: left.value + right.value };
				case '-':
					return { value: left.value - right.value };
				case '*':
					return { value: left.value * right.value };
				case '/':
					return { value: left.value / right.value };
				case '%':
					return { value: left.value % right.value };
				case '**':
					return { value: left.value ** right.value };
				case '|':
					return { value: left.value | right.value };
				case '^':
					return { value: left.value ^ right.value };
				case '&':
					return { value: left.value & right.value };
				case 'in':
					return { value: left.value in right.value };
				case 'instanceof':
					return { value: left.value instanceof right.value };
				// no default
			}
			return null;
		},
		async CallExpression(node) {
			if (node.callee.type === 'Super') return getStaticValue(node);
			const callee = await resolveExpression(node.callee);
			if (!callee || typeof callee.value !== 'function') return null;
			const args = await resolveElements(node.arguments);
			if (!args) return null;
			return {
				value: callee.value(...args)
			};
		},
		async ChainExpression(node) {
			const expression = await resolveExpression(node.expression);
			if (!expression) return null;
			return expression.value == null ? { value: undefined } : expression;
		},
		ClassExpression(node) {
			return getStaticValue(node);
		},
		async ConditionalExpression(node) {
			const test = await resolveExpression(node.test);
			if (!test) return null;
			if (test.value) {
				return resolveExpression(node.consequent);
			}
			return resolveExpression(node.alternate);
		},
		FunctionExpression(node) {
			return getStaticValue(node);
		},
		Identifier(node) {
			if (node.name === 'undefined') {
				return {
					value: undefined
				};
			}
			if (node.name === 'NaN') {
				return {
					value: NaN
				};
			}
			if (node.name === 'Infinity') {
				return {
					value: Infinity
				};
			}
			const source = imports.get(node.name);
			if (source) {
				return safeLoad(source);
			}
			return null;
		},
		ImportExpression(node) {
			return getStaticValue(node);
		},
		/** @param {SimpleLiteral} node */
		Literal(node) {
			return {
				value: node.value
			};
		},
		async LogicalExpression(node) {
			const left = await resolveExpression(node.left);
			if (!left) return null;
			if (
				(node.operator === '||' && Boolean(left.value) === true) ||
				(node.operator === '&&' && Boolean(left.value) === false) ||
				(node.operator === '??' && left.value != null)
			) {
				return left;
			}
			return resolveExpression(node.right);
		},
		async MemberExpression(node) {
			if (node.object.type === 'Super' || node.property.type === 'PrivateIdentifier') {
				return null;
			}
			const object = await resolveExpression(node.object);
			if (!object || !object.value) return null;
			const objectValue = /** @type {any} */ (object.value);
			if (node.computed) {
				const property = await resolveExpression(node.property);
				if (!property) return null;
				return {
					value: objectValue[String(property.value)]
				};
			}
			if (node.property.type === 'Identifier') {
				return {
					value: objectValue[node.property.name]
				};
			}
			if (node.property.type === 'Literal') {
				return {
					value: objectValue[String(node.property.value)]
				};
			}
			return null;
		},
		MetaProperty(node) {
			return getStaticValue(node);
		},
		async NewExpression(node) {
			if (node.callee.type === 'Super') return getStaticValue(node);
			const callee = await resolveExpression(node.callee);
			if (!callee || typeof callee.value !== 'function') return null;
			const args = await resolveElements(node.arguments);
			if (!args) return null;
			return {
				value: new /** @type {any} */ (callee.value)(...args)
			};
		},
		async ObjectExpression(node) {
			/** @type {Record<string, unknown>} */
			const result = {};
			for (const property of node.properties) {
				if (property.type === 'Property') {
					const value = await resolveExpression(/** @type {SimpleExpression} */ (property.value));
					if (!value) {
						return null;
					}
					if (property.computed) {
						if (property.key.type === 'PrivateIdentifier') return null;
						const key = await resolveExpression(property.key);
						if (!key) return null;
						result[String(key.value)] = value.value;
					} else {
						if (property.key.type === 'Literal') {
							result[String(property.key.value)] = value.value;
						} else if (property.key.type === 'Identifier') {
							result[String(property.key.name)] = value.value;
						} else {
							return null;
						}
					}
					continue;
				}
				const spreadArgument = await resolveExpression(property.argument);
				if (!spreadArgument) return null;
				Object.assign(result, spreadArgument.value);
			}
			return {
				value: result
			};
		},
		SequenceExpression(node) {
			return resolveExpression(node.expressions[node.expressions.length - 1]);
		},
		async TaggedTemplateExpression(node) {
			const tag = await resolveExpression(node.tag);
			if (!tag) return null;
			const expressions = [];
			for (const expression of node.quasi.expressions) {
				const evaluated = await resolveExpression(expression);
				if (!evaluated) return null;
				expressions.push(evaluated.value);
			}

			const func = /** @type {Function} */ (tag.value);
			const strings = node.quasi.quasis.map((q) => q.value.cooked);
			/** @type {any} */ (strings).raw = node.quasi.quasis.map((q) => q.value.raw);

			if (func === String.raw) {
				return { value: func(strings, ...expressions) };
			}

			return null;
		},
		async TemplateLiteral(node) {
			let str = `${node.quasis[0].value.cooked}`;
			for (let index = 0; index < node.expressions.length; index++) {
				const expression = await resolveExpression(node.expressions[index]);
				if (!expression) {
					return null;
				}
				str = `${str}${expression.value}${node.quasis[index + 1].value.cooked}`;
			}
			return { value: str };
		},
		ThisExpression(node) {
			return getStaticValue(node);
		},
		async UnaryExpression(node) {
			if (node.operator === 'delete') {
				return null;
			}
			if (node.operator === 'void') {
				return { value: undefined };
			}
			const expression = await resolveExpression(node.argument);
			if (!expression) {
				return null;
			}
			switch (node.operator) {
				case '-':
					// @ts-expect-error
					return { value: -expression.value };
				case '+':
					return { value: Number(expression.value) };
				case '!':
					return { value: !expression.value };
				case '~':
					// @ts-expect-error
					return { value: ~expression.value };
				case 'typeof':
					return { value: typeof expression.value };
				// no default
			}
			return null;
		},
		UpdateExpression(node) {
			return getStaticValue(node);
		},
		YieldExpression(node) {
			return getStaticValue(node);
		}
	};

	/**
	 * @template {SimpleExpression | SimpleSpreadElement | null} T
	 * @param {T[]} args
	 * @returns {Promise<unknown[] | null>}
	 */
	async function resolveElements(args) {
		/** @type {unknown[]} */
		const result = [];
		for (const argument of args) {
			if (!argument) {
				result.push(undefined);
			} else if (argument.type !== 'SpreadElement') {
				const evaluated = await resolveExpression(argument);
				if (!evaluated) return null;
				result.push(evaluated.value);
			} else {
				const spreadArgument = await resolveExpression(argument.argument);
				if (!spreadArgument) return null;
				if (!Array.isArray(spreadArgument.value)) return null;
				result.push(...spreadArgument.value);
			}
		}
		return result;
	}

	/**
	 * @param {SimpleExpression} node
	 * @returns {Promise<Result>}
	 */
	function resolveExpression(node) {
		const cached = cache.get(node);
		if (cached) {
			return Promise.resolve(cached);
		}
		if (node != null && Object.hasOwnProperty.call(operations, node.type)) {
			const result = /** @type {any} */ (operations)[node.type](node);
			cache.set(node, result);
			return Promise.resolve(result);
		}
		return Promise.resolve(null);
	}

	return resolveExpression(data.node);
}

/**
 * @param {string} source
 * @returns {Promise<import('../types.js').Evaluated|null>}
 */
async function safeLoad(source) {
	try {
		const result = await import(source);
		return { value: result };
	} catch {
		// ignore
	}
	try {
		const result = Module.createRequire(import.meta.dirname)(source);
		return {
			// interop require default
			value: result && result.__esModule ? result : { default: result }
		};
	} catch {
		// ignore
	}
	return null;
}
