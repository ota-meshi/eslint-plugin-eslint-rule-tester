---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'valid-testcase'
description: 'require match the `invalid` test case with the result.'
since: 'v0.1.0'
---

# valid-testcase

> require match the `invalid` test case with the result.

- :gear: This rule is included in `"plugin:eslint-rule-tester/recommended"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks the test cases of the rules of the ESLint plugin, reports any differences between the expected value and the actual rule result, and auto-fixes them.\
**Note** that this rule execute the ESLint rules you are creating during the linting check, so if the implementation of the ESLint rules you are creating has side effects, it may break your development environment.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```js
'use strict';

const { RuleTester } = require('eslint');
/* A rule that reports an identifier named `NG` and rewrites it to `OK`. */
const rule = require('../rules/ng-id-rule.js');

const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
});

tester.run('ng-id-rule', rule, {
  valid: ['foo', 'bar'],
  invalid: [
    /* ✓ GOOD */
    {
      code: 'NG',
      errors: [{ message: 'The identifier `NG` is not allowed.', line: 1 }],
      output: 'OK'
    },
    /* ✗ BAD */
    {
      code: 'NG',
      errors: [{ message: 'foooo?', line: 42 }],
      output: 'foo'
    }
  ]
});
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-eslint-rule-tester v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/lib/rules/valid-testcase.js)
- [Test source](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/tests/lib/rules/valid-testcase.js)
