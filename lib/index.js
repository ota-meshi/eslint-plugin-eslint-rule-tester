'use strict';

const { rules: ruleList } = require('./utils/rules');
const meta = require('./meta');
/**
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 */

const rules = ruleList.reduce((obj, r) => {
	obj[r.meta.ruleId] = r.rule;
	return obj;
}, /** @type {{ [key: string]: RuleModule }} */ ({}));

module.exports = {
	meta,
	rules
};
