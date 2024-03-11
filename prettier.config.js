'use strict';

module.exports = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	overrides: [
		{
			files: ['.*rc'],
			excludeFiles: ['.browserslistrc', '.npmrc', '.nvmrc'],
			options: {
				parser: 'json'
			}
		},
		{
			files: ['*.md', 'package.json', '**/package.json'],
			options: {
				useTabs: false,
				tabWidth: 2
			}
		}
	]
};
