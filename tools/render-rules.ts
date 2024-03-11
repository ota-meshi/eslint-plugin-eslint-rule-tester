import type { RuleModuleEnhancedMeta } from '../lib/utils/rules';
import type { Rule } from 'eslint';
import { rules } from '../lib/utils/rules';

const categories = ['Possible Errors', 'Best Practices', 'Stylistic Issues'] as const;

const descriptions: Record<(typeof categories)[number], string> = {
	'Possible Errors': 'These rules relate to possible syntax or logic errors:',
	'Best Practices': 'These rules relate to better ways of doing things to help you avoid problems:',
	'Stylistic Issues': 'These rules relate to style guidelines, and are therefore quite subjective:'
};

const activeRules = rules.filter((rule) => !rule.rule.meta?.deprecated);
const deprecatedRules = rules.filter((rule) => rule.rule.meta?.deprecated);

activeRules.forEach((rule) => {
	if (!(categories as readonly (string | undefined)[]).includes(rule.rule.meta?.docs?.category)) {
		throw new Error(`missing categories:${rule.rule.meta?.docs?.category}`);
	}
});

const categoryRules = categories.map((cat) => {
	return {
		title: cat,
		rules: activeRules.filter((rule) => rule.rule.meta?.docs?.category === cat)
	};
});

export default function renderRulesTableContent(
	buildRulePath = (ruleName: string) => `./rules/${ruleName}.md`
): string {
	// -----------------------------------------------------------------------------

	function toRuleRow(rule: { rule: Rule.RuleModule; meta: RuleModuleEnhancedMeta }) {
		const mark = `${rule.rule.meta?.docs?.recommended ? ':star:' : ''}${
			rule.rule.meta?.fixable ? ':wrench:' : ''
		}${rule.rule.meta?.hasSuggestions ? ':bulb:' : ''}${rule.rule.meta?.deprecated ? ':warning:' : ''}`;
		const link = `[eslint-rule-tester/${rule.meta.ruleId}](${buildRulePath(rule.meta.ruleId || '')})`;
		const description = rule.rule.meta?.docs?.description || '(no description)';

		return `| ${link} | ${description} | ${mark} |`;
	}

	function toDeprecatedRuleRow(rule: { rule: Rule.RuleModule; meta: RuleModuleEnhancedMeta }) {
		const link = `[eslint-rule-tester/${rule.meta.ruleId}](${buildRulePath(rule.meta.ruleId || '')})`;
		const replacedRules = rule.rule.meta?.replacedBy || [];
		const replacedBy = replacedRules
			.map((name) => `[eslint-rule-tester/${name}](${buildRulePath(name)})`)
			.join(', ');

		return `| ${link} | ${replacedBy || '(no replacement)'} |`;
	}

	// -----------------------------------------------------------------------------
	let rulesTableContent = categoryRules
		.filter((cat) => cat.rules.length)
		.map((cat) => {
			return `
## ${cat.title}

${descriptions[cat.title]}

| Rule ID | Description |    |
|:--------|:------------|:---|
${cat.rules.map(toRuleRow).join('\n')}
`;
		})
		.join('');

	// -----------------------------------------------------------------------------
	if (deprecatedRules.length >= 1) {
		rulesTableContent += `
## Deprecated

- :warning: We're going to remove deprecated rules in the next major release. Please migrate to successor/new rules.
- :innocent: We don't fix bugs which are in deprecated rules since we don't have enough resources.

| Rule ID | Replaced by |
|:--------|:------------|
${deprecatedRules.map(toDeprecatedRuleRow).join('\n')}
`;
	}
	return rulesTableContent;
}
