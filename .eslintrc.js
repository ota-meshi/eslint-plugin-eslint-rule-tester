'use strict';

// const version = require("./package.json").version

module.exports = {
	parserOptions: {
		sourceType: 'script',
		ecmaVersion: 'latest',
		project: require.resolve('./tsconfig.json')
	},
	extends: [
		'plugin:@ota-meshi/recommended',
		'plugin:@ota-meshi/+node',
		'plugin:@ota-meshi/+typescript',
		'plugin:@ota-meshi/+eslint-plugin',
		'plugin:@ota-meshi/+package-json',
		'plugin:@ota-meshi/+json',
		'plugin:@ota-meshi/+yaml',
		'plugin:@ota-meshi/+md',
		'plugin:@ota-meshi/+prettier'
	],
	rules: {
		'require-jsdoc': 'off',
		'no-warning-comments': 'warn',
		'no-lonely-if': 'off',
		'new-cap': 'off',
		'no-shadow': 'off',
		complexity: 'off',
		'no-void': ['error', { allowAsStatement: true }],
		'prettier/prettier': [
			'error',
			{},
			{
				usePrettierrc: true
			}
		],
		'n/file-extension-in-import': 'off', // It's a plugin bug(?).
		// Repo rule
		'no-restricted-imports': [
			'error',
			{
				patterns: [
					{
						group: ['/regexpp', '/regexpp/*'],
						message: 'Please use `@eslint-community/regexpp` instead.'
					},
					{
						group: ['/eslint-utils', '/eslint-utils/*'],
						message: 'Please use `@eslint-community/eslint-utils` instead.'
					}
				]
			}
		]
	},
	overrides: [
		{
			files: ['*.md'],
			extends: 'plugin:mdx/recommended',
			settings: {
				'mdx/code-blocks': true
			}
		},
		{
			files: ['*.mjs'],
			parserOptions: {
				sourceType: 'module'
			}
		},
		{
			files: ['*.ts', '*.mts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				sourceType: 'module',
				project: require.resolve('./tsconfig.json')
			},
			rules: {
				'@typescript-eslint/naming-convention': ['off'],
				'@typescript-eslint/no-non-null-assertion': 'off'
			}
		},
		{
			files: ['lib/**'],
			rules: {
				'@typescript-eslint/no-restricted-imports': [
					'error',
					{
						patterns: [
							{
								group: ['@typescript-eslint/*'],
								message:
									'@typescript-eslint is not included in dependencies. Only type-import is allowed.',
								allowTypeImports: true
							}
						]
					}
				],
				'no-restricted-properties': [
					'error',
					{
						object: 'context',
						property: 'getSourceCode'
					},
					{
						object: 'context',
						property: 'getFilename'
					},
					{
						object: 'context',
						property: 'getPhysicalFilename'
					},
					{
						object: 'context',
						property: 'getCwd'
					},
					{
						object: 'context',
						property: 'getScope'
					},
					{
						object: 'context',
						property: 'parserServices'
					}
				]
			}
		},
		{
			files: ['lib/rules/**'],
			rules: {}
		},
		{
			files: ['tests/**'],
			rules: {
				'@typescript-eslint/no-misused-promises': 'off',
				'@typescript-eslint/no-require-imports': 'off'
			}
		},
		{
			files: ['scripts/**/*.ts', 'tests/**/*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				sourceType: 'module',
				project: require.resolve('./tsconfig.json')
			},
			rules: {
				'no-console': 'off'
			}
		}
	]
};
