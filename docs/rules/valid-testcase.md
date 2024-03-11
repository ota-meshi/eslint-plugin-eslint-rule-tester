---
pageClass: 'rule-details'
sidebarDepth: 0
title: 'valid-testcase'
description: 'require match the `invalid` test case with the result.'
---

# valid-testcase

> require match the `invalid` test case with the result.

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> **_This rule has not been released yet._** </badge>
- :gear: This rule is included in `"plugin:eslint-rule-tester/recommended"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks the test cases of the rules of the ESLint plugin, reports any differences between the expected value and the actual rule result, and auto-fixes them.\
**Note** that this rule execute the ESLint rules you are creating during the linting check, so if the implementation of the ESLint rules you are creating has side effects, it may break your development environment.

<ESLintCodeBlock fix>

<!--eslint-skip-->

```js
/* ✓ GOOD */

/* ✗ BAD */
```

</ESLintCodeBlock>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/lib/rules/valid-testcase.js)
- [Test source](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/tests/lib/rules/valid-testcase.js)
