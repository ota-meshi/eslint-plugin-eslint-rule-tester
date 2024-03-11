# User Guide

## :cd: Installation

```bash
npm install --save-dev eslint eslint-plugin-eslint-rule-tester
```

::: tip Requirements

- ESLint v8.0.0 and above
- Node.js v18.x and above

:::

## :book: Usage

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

## :question: FAQ

TBA
