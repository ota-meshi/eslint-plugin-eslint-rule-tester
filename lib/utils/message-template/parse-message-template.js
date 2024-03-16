'use strict';

module.exports = {
	parseMessageTemplate
};

/**
 * @typedef {(Quasi|Interpolation)[]} MessageTemplate
 */
/**
 * @typedef {object} Quasi
 * @property {'quasi'} type
 * @property {string} value
 */
/**
 * @typedef {object} Interpolation
 * @property {'interpolation'} type
 * @property {string} name
 * @property {string} raw
 */
/**
 * @param {string} text
 * @returns {MessageTemplate}
 */
function parseMessageTemplate(text) {
	/** @type {MessageTemplate} */
	const result = [];
	const re = /\{\{([^{}]+)\}\}/gu;
	let match;
	let lastIndex = 0;
	while ((match = re.exec(text)) !== null) {
		if (lastIndex < match.index) {
			result.push({
				type: 'quasi',
				value: text.slice(lastIndex, match.index)
			});
		}
		result.push({
			type: 'interpolation',
			name: match[1].trim(),
			raw: match[0]
		});
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex < text.length) {
		result.push({
			type: 'quasi',
			value: text.slice(lastIndex)
		});
	}
	return result;
}
