import * as workerThreads from 'worker_threads';
import { getLinterResult } from './get-linter-result.mjs';

if (workerThreads.workerData && workerThreads.parentPort) {
	const { workerPort, sharedBuffer } = workerThreads.workerData;
	const sharedBufferView = new Int32Array(sharedBuffer, 0, 1);
	workerThreads.parentPort.on('message', async ({ id, args }) => {
		let msg;
		try {
			msg = { id, result: await getLinterResult(.../** @type {[String,String,any]} */ (args)) };
		} catch (error) {
			msg = { id, error, properties: extractProperties(error) };
		}
		workerPort.postMessage(msg);
		Atomics.add(sharedBufferView, 0, 1);
		Atomics.notify(sharedBufferView, 0);
	});
}

/**
 * @param {any} object
 * @returns {any}
 */
function extractProperties(object) {
	if (object && typeof object === 'object') {
		/** @type {any} */
		const properties = {};
		for (const key in object) {
			properties[key] = object[key];
		}
		return properties;
	}
	return object;
}
