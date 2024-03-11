import path from 'path';
import fs from 'fs';
import cp from 'child_process';
import { writeAndFormat } from './lib/write';
const logger = console;

// main
void (async (ruleId) => {
	if (ruleId == null) {
		logger.error('Usage: pnpm run new <RuleID>');
		process.exitCode = 1;
		return;
	}
	if (!/^[\w\-/@]+$/u.test(ruleId)) {
		logger.error("Invalid RuleID '%s'.", ruleId);
		process.exitCode = 1;
		return;
	}

	const ruleFile = path.resolve(__dirname, `../lib/rules/${ruleId}.js`);
	const testFile = path.resolve(__dirname, `../tests/lib/rules/${ruleId}.js`);
	const docFile = path.resolve(__dirname, `../docs/rules/${ruleId}.md`);
	const fixturesRoot = path.resolve(__dirname, `../tests/fixtures/rules/${ruleId}/`);
	try {
		fs.mkdirSync(path.dirname(ruleFile), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(path.dirname(testFile), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(path.dirname(docFile), { recursive: true });
	} catch {
		// ignore
	}
	try {
		fs.mkdirSync(path.resolve(fixturesRoot, 'valid'), { recursive: true });
		fs.mkdirSync(path.resolve(fixturesRoot, 'invalid'), { recursive: true });
	} catch {
		// ignore
	}

	await writeAndFormat(
		ruleFile,
		`// @ts-check
'use strict';

module.exports = {
    meta: {
        docs: {
            description: '',
            category: '',
            recommended: false,
        },
        schema: [],
        messages: {},
        type: 'suggestion', // 'problem', or 'layout',
    },
    create(context) {
        
        return {}
    },
};
`
	);
	await writeAndFormat(
		testFile,
		`'use strict';
const { RuleTester } = require('eslint');
const rule = require('${getModulePath(testFile, ruleFile)}');

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('${ruleId}', rule, {
  valid: [
    {

    }
  ],
  invalid: [
    {

    }
  ]
});
`
	);
	await writeAndFormat(
		docFile,
		`#  (eslint-rule-tester/${ruleId})

> description

## :book: Rule Details

This rule reports ???.

<ESLintCodeBlock>

<!--eslint-skip-->

\`\`\`js
/* ✓ GOOD */

/* ✗ BAD */

\`\`\`

</ESLintCodeBlock>

## :wrench: Options

\`\`\`json
{
  "eslint-rule-tester/${ruleId}": ["error", {
   
  }]
}
\`\`\`

- 

## :books: Further Reading

- 

`
	);

	cp.execSync(`code "${ruleFile}"`);
	cp.execSync(`code "${testFile}"`);
	cp.execSync(`code "${docFile}"`);
})(process.argv[2]);

/** Get module path */
function getModulePath(from: string, module: string): string {
	return path.relative(path.dirname(from), module).replace(/.ts$/u, '');
}
