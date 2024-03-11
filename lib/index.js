'use strict';

const { rules: ruleList } = require('./utils/rules');
const meta = require('./meta');
const recommended = require('./configs/recommended');

/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 */
const rules = ruleList.reduce((obj, r) => {
	obj[r.meta.ruleId] = r.rule;
	return obj;
}, /** @type {{ [key: string]: RuleModule }} */ ({}));

const configs = {
	recommended: {
		/** @type {any} */
		plugins: null,
		...recommended
	},
	'recommended-legacy': {
		plugins: ['eslint-rule-tester'],
		...recommended
	}
};

const plugin = {
	configs,
	meta,
	rules
};

plugin.configs.recommended.plugins = { 'eslint-rule-tester': plugin };

module.exports = plugin;
