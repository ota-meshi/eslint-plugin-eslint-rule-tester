import path from 'path';
import { name, version } from '../package.json';
import { getNewVersion } from './lib/changesets-util';
import { writeAndFormat } from './lib/write';

const META_PATH = path.join(__dirname, '../lib/meta.js');

void main();

/** main */
async function main() {
	await writeAndFormat(
		META_PATH,
		`"use strict";

/*
 * IMPORTANT!
 * This file has been automatically generated,
 * in order to update its content execute "pnpm run update"
 */
const name = /** @type {const} */(${JSON.stringify(name)});
const version = /** @type {const} */(${JSON.stringify(await getVersion())});
module.exports = { name, version }
`
	);
}

/** Get version */
function getVersion() {
	// eslint-disable-next-line no-process-env -- ignore
	if (process.env.IN_VERSION_CI_SCRIPT) {
		return getNewVersion();
	}
	return version;
}
