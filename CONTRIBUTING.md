# Contributing

Thanks for contributing!

## Installation

```sh
git clone https://github.com/ota-meshi/eslint-plugin-eslint-rule-tester.git
cd eslint-plugin-eslint-rule-tester
pnpm install
```

## Running the tests

```sh
pnpm test
```

To run the tests with debugging log, you can use `pnpm test:debug`.

This is an [ESLint](http://eslint.org) plugin. Documentation for the APIs that it uses can be found on ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) page.

This plugin is used to lint itself. The style is checked when `pnpm lint` is run, and the build will fail if there are any linting errors. You can use `pnpm lint-fix` to fix some linting errors.

## Other Development Tools

- `pnpm test` runs tests.
- `pnpm cover` runs tests and measures coverage.
- `pnpm new [new-rule-name]` generate the files needed to implement the new rule.
- `pnpm update` runs in order to update readme and recommended configuration.

## Commit messages

Please view [commitlint](https://commitlint.js.org) and [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) for more details.

## Publishing

We're using [changesets](https://github.com/changesets/changesets) for version management, CHANGELOG and releasing automatically.

Please view [changesets-bot](https://github.com/apps/changeset-bot) and its [action](https://github.com/changesets/action) for more details.
