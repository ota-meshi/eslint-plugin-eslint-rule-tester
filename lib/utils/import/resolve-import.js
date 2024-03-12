'use strict';

const path = require('path');

module.exports = { resolveImportSource };

/**
 * @param {string} source
 * @param {string} filename
 * @returns {string} source
 */
function resolveImportSource(source, filename) {
	if (source.startsWith('.')) {
		for (const src of [
			source,
			`${source}.js`,
			`${source}.mjs`,
			`${source}.cjs`,
			`${source}.ts`,
			`${source}.mts`,
			`${source}.cts`
		]) {
			try {
				return require.resolve(path.resolve(path.dirname(filename), src));
			} catch {
				// ignore
			}
		}
		return require.resolve(path.resolve(path.dirname(filename), source));
	}
	return source;
}
