import path from 'path';
import fs from 'fs';
import type { Rule } from 'eslint';

type RuleModuleEnhancedMeta = {
	ruleId: string;
};

/**
 * Get the all rules
 */
function readRules(): { rule: Rule.RuleModule; meta: RuleModuleEnhancedMeta }[] {
	const rulesLibRoot = path.resolve(__dirname, '../../lib/rules');

	const rules: { rule: Rule.RuleModule; meta: RuleModuleEnhancedMeta }[] = [];
	for (const name of iterateJsFiles()) {
		// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- ignore
		const module = require(path.join(rulesLibRoot, name));
		const rule: Rule.RuleModule = module?.default || module;
		if (!rule || typeof rule.create !== 'function') {
			continue;
		}

		rules.push({ rule, meta: { ruleId: name.replace(/\.[cm]?[jt]s$/u, '') } });
	}
	return rules;
}

export const rules = readRules();

/** Iterate js files */
function* iterateJsFiles() {
	const rulesLibRoot = path.resolve(__dirname, '../../lib/rules');
	const files = fs.readdirSync(rulesLibRoot);

	while (files.length) {
		const file = files.shift()!;
		if (file.endsWith('.js')) {
			yield file;
			continue;
		}
		const filePath = path.join(rulesLibRoot, file);
		if (!fs.statSync(filePath).isDirectory()) {
			continue;
		}
		files.unshift(...fs.readdirSync(filePath).map((n) => path.join(file, n)));
	}
}
