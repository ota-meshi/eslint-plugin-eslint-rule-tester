'use strict';

module.exports = {
	extractKeyData
};

/**
 * Extracts the key data value from the given message.
 * @param {string} key
 * @param {import("./parse-message-template").MessageTemplate} messageTemplate
 * @param {string} actualMessage
 * @param {Record<string, string|undefined>} expectData
 */
function extractKeyData(key, messageTemplate, actualMessage, expectData) {
	const value = extractKeyDataUsingData(key, messageTemplate, actualMessage, expectData);
	if (value != null) return value;
	return extractKeyDataFromMessage(key, messageTemplate, actualMessage);
}

/**
 * Extracts the data value of the key using the given message and data.
 * @param {string} key
 * @param {import("./parse-message-template").MessageTemplate} messageTemplate
 * @param {string} actualMessage
 * @param {Record<string, string|undefined>} expectData
 */
function extractKeyDataUsingData(key, messageTemplate, actualMessage, expectData) {
	/** @type {string[]} */
	const patternEntries = [];
	for (const element of messageTemplate) {
		if (element.type === 'quasi') {
			patternEntries.push(escapeRegExp(element.value));
		} else {
			if (!Object.hasOwn(expectData, element.name)) {
				patternEntries.push(escapeRegExp(element.raw));
			} else if (element.name === key) {
				if (!patternEntries.includes(`(?<target>.*)`)) {
					patternEntries.push(`(?<target>.*)`);
				} else {
					patternEntries.push(String.raw`\k<target>`);
				}
			} else {
				patternEntries.push(escapeRegExp(String(expectData[element.name])));
			}
		}
	}
	const re = new RegExp(`^${patternEntries.join('')}$`, 'u');
	return re.exec(actualMessage)?.groups?.target ?? null;
}

/**
 * Extracts the data value of the key using the given message and data.
 * @param {string} key
 * @param {import("./parse-message-template").MessageTemplate} messageTemplate
 * @param {string} actualMessage
 */
function extractKeyDataFromMessage(key, messageTemplate, actualMessage) {
	/** @type {Map<string, number>} */
	const keys = new Map();
	/** @type {string[]} */
	const patternEntries = [];
	for (const element of messageTemplate) {
		if (element.type === 'quasi') {
			patternEntries.push(escapeRegExp(element.value));
		} else {
			let num = keys.get(element.name);
			if (num == null) {
				num = keys.size + 1;
				keys.set(element.name, num);
				patternEntries.push(`(?.*)`);
			} else {
				patternEntries.push(`\\${num}`);
			}
		}
	}
	const index = keys.get(key);
	if (index == null) return null;
	const re = new RegExp(`^${patternEntries.join('')}$`, 'u');
	return re.exec(actualMessage)?.[index] ?? null;
}

/** @param {string|undefined} s  */
function escapeRegExp(s) {
	if (!s) return '';
	return s.replace(/[$()*+.?[\\\]^{|}]/g, '\\$&'); // $& means the whole matched string
}
