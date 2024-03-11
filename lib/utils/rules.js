'use strict';

// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "pnpm run update"
/**
 * @typedef {object} RuleModuleEnhancedMeta
 * @property {string} ruleId
 *
 * @typedef {import("eslint").Rule.RuleModule} RuleModule
 */

const validTestcase = {
	meta: { ruleId: 'valid-testcase' },
	rule: /** @type {RuleModule} */ (require('../rules/valid-testcase'))
};
/** @type { { rule: RuleModule, meta: RuleModuleEnhancedMeta }[] } */
const rules = [validTestcase];

module.exports = { rules };
