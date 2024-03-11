import path from 'path';
// import eslint from "eslint"
import { rules } from './lib/load-rules';
import { writeAndFormat } from './lib/write';

/**
 * Convert text to camelCase
 */
function camelCase(str: string) {
	return str.replace(/[-_](\w)/gu, (_, c) => (c ? c.toUpperCase() : ''));
}

/**
 * Convert text to identifier
 */
function toIdentifier(str: string) {
	const clean = str
		.replace(/^[^\p{ID_Start}$_]/u, '')
		.replace(/[^\p{ID_Continue}$\u200c\u200d]/gu, '-');

	return camelCase(clean);
}

const content = `"use strict";

/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
/**
 * @typedef {object} RuleModuleEnhancedMeta
 * @property {string} ruleId
 *
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 */

${rules
	.map(
		(rule) =>
			`const ${toIdentifier(rule.meta.ruleId)} = {
  meta: ${JSON.stringify(rule.meta)},
  rule: /** @type {any} */(require("../rules/${rule.meta.ruleId}"))
}`
	)
	.join('\n')}
/** @type { { rule: RuleModule, meta: RuleModuleEnhancedMeta }[] } */
const rules = [
    ${rules.map((rule) => toIdentifier(rule.meta.ruleId)).join(',')}
]

module.exports = { rules };
`;

const filePath = path.resolve(__dirname, '../lib/utils/rules.js');

// Update file.
void writeAndFormat(filePath, content);
