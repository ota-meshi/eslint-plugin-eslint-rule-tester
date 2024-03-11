'use strict';

const path = require('path');
const { Worker, receiveMessageOnPort, MessageChannel } = require('worker_threads');

const workerPath = path.resolve(__dirname, './worker.mjs');

/**
 * @typedef {import('./types').LinterWorkerServise} LinterWorkerServise
 * @typedef {import('./types').WorkerServise} WorkerServise
 */

/** @type {Record<string, WorkerServise|undefined>}  */
const workerServises = {};
const rulePaths = new Set();

module.exports = { getLinterServese };

/**
 * Starts the worker to run your ESLint rules.
 * The reason for using a worker is so that by destroying the worker, we can destroy the cache.
 * If an ESLint rule is modified and the cache is not destroyed, the previous ESLint rule will be loaded.
 * @param {string} ruleName
 * @param {string} rulePath
 * @returns {LinterWorkerServise}
 */
function getLinterServese(ruleName, rulePath) {
	if (rulePaths.has(rulePath)) {
		rulePaths.clear();
		for (const key of Object.keys(workerServises)) {
			// If a rule is requested that is the same as a previously requested rule,
			// restart the worker and force it to reload the rules.
			workerServises[key]?.terminate();
			delete workerServises[key];
		}
	}
	rulePaths.add(rulePath);

	const isTs = /\.[cm]?ts$/u.test(rulePath);
	const key = isTs ? 'ts' : 'js';
	const workerServise = workerServises[key] || (workerServises[key] = buildWorkerServise({ isTs }));
	return {
		getLinterResule(config) {
			try {
				const result = workerServise.call(ruleName, rulePath, config);
				return result;
			} catch (_e) {
				// Crash
				return null;
			}
		},
		terminate() {
			workerServise.terminate();
			delete workerServises[key];
		}
	};
}

/**
 * @param {object} options
 * @param {boolean} options.isTs
 * @returns {WorkerServise}
 */
function buildWorkerServise({ isTs }) {
	let seq = 0;
	const sharedBuffer = new SharedArrayBuffer(4);
	const sharedBufferView = new Int32Array(sharedBuffer, 0, 1);
	const { port1: mainPort, port2: workerPort } = new MessageChannel();
	const worker = new Worker(workerPath, {
		workerData: { sharedBuffer, workerPort },
		transferList: [workerPort],
		execArgv: isTs
			? ['--loader', 'ts-node/esm/transpile-only']
			: // VSCode doesn't support it yet.
				// ["--import", path.resolve(__dirname, "./ts-node-import.mjs")]
				[]
	});
	worker.unref();

	return {
		isTs,
		call(...args) {
			const id = seq++;
			worker.postMessage({ id, args });

			const status = Atomics.wait(sharedBufferView, 0, 0);
			Atomics.store(sharedBufferView, 0, 0);
			if (!['ok', 'not-equal'].includes(status)) {
				throw new Error(`Internal error: Atomics.wait() failed: ${status}`);
			}
			const {
				id: id2,
				result,
				error,
				properties
			} = /** @type {NonNullable<ReturnType<typeof receiveMessageOnPort>>} */ (
				receiveMessageOnPort(mainPort)
			).message;
			if (id !== id2) {
				throw new Error(`Internal error: Expected id ${id} but got id ${id2}`);
			}
			if (error) {
				throw Object.assign(new Error(error.message), error, properties);
			}
			return result;
		},
		terminate() {
			worker.terminate();
		}
	};
}
