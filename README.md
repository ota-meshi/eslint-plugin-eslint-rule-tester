# Introduction

`eslint-plugin-eslint-rule-tester` is an experimental ESLint plugin that auto-fixes test cases defined in RuleTester.

[![NPM license](https://img.shields.io/npm/l/eslint-plugin-eslint-rule-tester.svg)](https://www.npmjs.com/package/eslint-plugin-eslint-rule-tester)
[![NPM version](https://img.shields.io/npm/v/eslint-plugin-eslint-rule-tester.svg)](https://www.npmjs.com/package/eslint-plugin-eslint-rule-tester)
[![NPM downloads](https://img.shields.io/badge/dynamic/json.svg?label=downloads&colorB=green&suffix=/day&query=$.downloads&uri=https://api.npmjs.org//downloads/point/last-day/eslint-plugin-eslint-rule-tester&maxAge=3600)](http://www.npmtrends.com/eslint-plugin-eslint-rule-tester)
[![NPM downloads](https://img.shields.io/npm/dw/eslint-plugin-eslint-rule-tester.svg)](http://www.npmtrends.com/eslint-plugin-eslint-rule-tester)
[![NPM downloads](https://img.shields.io/npm/dm/eslint-plugin-eslint-rule-tester.svg)](http://www.npmtrends.com/eslint-plugin-eslint-rule-tester)
[![NPM downloads](https://img.shields.io/npm/dy/eslint-plugin-eslint-rule-tester.svg)](http://www.npmtrends.com/eslint-plugin-eslint-rule-tester)
[![NPM downloads](https://img.shields.io/npm/dt/eslint-plugin-eslint-rule-tester.svg)](http://www.npmtrends.com/eslint-plugin-eslint-rule-tester)
[![Build Status](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/actions/workflows/NodeCI.yml/badge.svg?branch=main)](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/actions/workflows/NodeCI.yml)

[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/atlassian/changesets)

## :name_badge: What is this plugin?

An experimental ESLint plugin that auto-fixes test cases defined in RuleTester.\
This plugin checks the test cases of the rules of the ESLint plugin, reports any differences between the expected value and the actual rule result, and auto-fixes them.\
**Note** that this plugin's rules execute the ESLint rules you are creating during the linting check, so if the implementation of the ESLint rules you are creating has side effects, it may break your development environment.

https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/assets/16508807/fbf6f6b3-9a31-4e13-b88c-f8dd7a2bb3e8

<!--DOCS_IGNORE_START-->

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-eslint-rule-tester
```

> **Requirements**
>
> - ESLint v8.0.0 and above
> - Node.js v18.x and above

<!--DOCS_IGNORE_END-->

## :book: Usage

<!--USAGE_SECTION_START-->
<!--USAGE_GUIDE_START-->

### Configuration

Use `eslint.config.js` file to configure rules. See also: <https://eslint.org/docs/user-guide/configuring>.

Example **eslint.config.js**:

<!-- eslint-skip -->

```mjs
import eslintRuleTester from 'eslint-plugin-eslint-rule-tester';
export default [
  {
    // It is recommended to apply it only to rule test cases.
    files: ['test/rules/*'],
    plugins: { 'eslint-rule-tester': eslintRuleTester },
    rules: {
      'eslint-rule-tester/valid-testcase': 'error'
    }
  }
];
```

We also recommend that you configure this rule configuration so that it is applied only from the editor extension.

## :computer: Editor Integrations

### Visual Studio Code

Use the [dbaeumer.vscode-eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension that Microsoft provides officially.

You have to configure the `"eslint.options".overrideConfigFile` option of the extension to apply the configuration to the editor.

Example **.vscode/settings.json**:

```json
{
  "eslint.options": {
    "overrideConfigFile": "./path/to/apply-only-to-editor.eslintrc.js"
  }
}
```

<!--USAGE_GUIDE_END-->
<!--USAGE_SECTION_END-->

## :white_check_mark: Rules

<!-- prettier-ignore-start -->
<!--RULES_SECTION_START-->

:wrench: Indicates that the rule is fixable, and using `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the reported problems.  
:bulb: Indicates that some problems reported by the rule are manually fixable by editor [suggestions](https://eslint.org/docs/developer-guide/working-with-rules#providing-suggestions).  
:star: Indicates that the rule is included in the `plugin:eslint-rule-tester/recommended` config.

<!--RULES_TABLE_START-->

## Possible Errors

These rules relate to possible syntax or logic errors:

| Rule ID | Description |    |
|:--------|:------------|:---|
| [eslint-rule-tester/valid-testcase](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/docs/rules/valid-testcase.md) | require match the `invalid` test case with the result. | :star::wrench: |

<!--RULES_TABLE_END-->
<!--RULES_SECTION_END-->
<!-- prettier-ignore-end -->

<!--DOCS_IGNORE_START-->

## :beers: Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

See also [CONTRIBUTING.md](./CONTRIBUTING.md)

<!--DOCS_IGNORE_END-->

## :lock: License

See the [LICENSE](LICENSE) file for license rights and limitations (MIT).
