import { Linter } from 'eslint';
import { applyFixes } from './source-code-fixer.js';
import { Module } from 'module';

/**
 * @typedef {import('./types.js').Messages} Messages
 * @typedef {import('./types.js').Suggestion} Suggestion
 * @typedef {import('./types.js').Message} Message
 */
/**
 * @param {string} ruleName
 * @param {string} rulePath
 * @param {import('./types.js').Config} config
 * @returns {Promise<Messages>}
 */
export async function getLinterResule(ruleName, rulePath, config) {
	const linter = new Linter({ configType: 'flat' });

	const rule = await loadRule(rulePath);

	const { code, filename, options, ...others } = config;
	const messages = linter.verify(
		code,
		{
			files: ['**'],
			plugins: {
				// @ts-expect-error -- flat config
				test: {
					rules: {
						[ruleName]: rule
					}
				}
			},
			rules: {
				[`test/${ruleName}`]: ['error', ...(options || [])]
			},
			languageOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				.../** @type {any} */ (others?.languageOptions)
			},
			settings: others.settings || {}
		},
		filename || 'input.js'
	);

	/** @type {Messages} */
	const result = {
		errors: messages.map(
			/**
			 * @param {Linter.LintMessage} message
			 * @returns {Message}
			 */
			(message) => {
				return {
					...message,
					suggestions: message.suggestions
						? message.suggestions.map((suggestion) => {
								return {
									desc: suggestion.desc,
									messageId: suggestion.messageId,
									// Need to have this be the *fixed* output, not just the fix content or anything
									output: applySuggestion(config.code, suggestion)
								};
							})
						: []
				};
			}
		)
	};
	if (config.output) {
		result.output = applyFixes(config.code, messages).output;

		if (result.output === config.code) {
			result.output = null;
		}
	}
	return result;
}

/**
 * @param {string} rulePath
 */
async function loadRule(rulePath) {
	let rule;
	try {
		rule = await import(rulePath);
	} catch {
		rule = Module.createRequire(import.meta.dirname)(rulePath);
	}
	while (rule.default && typeof rule.create !== 'function') {
		rule = rule.default;
	}
	return rule;
}

/**
 * @param {string} code
 * @param {Linter.LintSuggestion} suggestion
 * @returns
 */
function applySuggestion(code, suggestion) {
	const { fix } = suggestion;

	return `${code.slice(0, fix.range[0])}${fix.text}${code.slice(fix.range[1])}`;
}
