---
title: 'eslint-plugin-eslint-rule-tester'
---

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

<video controls src="https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/assets/16508807/fbf6f6b3-9a31-4e13-b88c-f8dd7a2bb3e8" muted="true"></video>

## :book: Usage

See [User Guide](./user-guide.md).

## :white_check_mark: Rules

<!-- prettier-ignore-start -->
See [Available Rules](./rules.md).
<!-- prettier-ignore-end -->

## :lock: License

See the [LICENSE](https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester/blob/main/LICENSE) file for license rights and limitations (MIT).
