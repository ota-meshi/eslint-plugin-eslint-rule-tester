import path from 'path';
import { rules } from './lib/load-rules';
import { writeAndFormat } from './lib/write';

const recommendedContent = `'use strict';

/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
module.exports = {
  rules: {
    // eslint-plugin-eslint-rule-tester rules
    ${rules
			.filter((rule) => rule.rule.meta?.docs?.recommended && !rule.rule.meta.deprecated)
			.map((rule) => {
				const conf = 'error';
				return `"eslint-rule-tester/${rule.meta.ruleId}": "${conf}"`;
			})
			.join(',\n    ')}
  },
}
`;

const recommendedFilePath = path.resolve(__dirname, '../lib/configs/recommended.js');

// Update file.
void writeAndFormat(recommendedFilePath, recommendedContent);
