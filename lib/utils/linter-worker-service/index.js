'use strict';

const path = require('path');
const fs = require('fs');
const { Worker, receiveMessageOnPort, MessageChannel } = require('worker_threads');
const { Module } = require('module');
const workerPath = path.resolve(__dirname, './worker.mjs');

/**
 * @typedef {import('../types').LinterWorkerService} LinterWorkerService
 * @typedef {import('../types').WorkerService} WorkerService
 */

/** @type {Record<string, Record<string, WorkerService|undefined>>}  */
const workerServices = {};
const restartRulePaths = new Set();
/** @type {Set<NodeJS.Timeout>} */
const timeoutRestartRulePaths = new Set();

module.exports = { getLinterService };

/**
 * Starts the worker to run your ESLint rules.
 * The reason for using a worker is so that by destroying the worker, we can destroy the cache.
 * If an ESLint rule is modified and the cache is not destroyed, the previous ESLint rule will be loaded.
 * @param {string} ruleName
 * @param {string} rulePath
 * @returns {LinterWorkerService}
 */
function getLinterService(ruleName, rulePath) {
	if (restartRulePaths.has(rulePath)) {
		restartRulePaths.clear();
		for (const time of timeoutRestartRulePaths) {
			clearTimeout(time);
		}
		timeoutRestartRulePaths.clear();
		for (const key of Object.keys(workerServices)) {
			// If a rule is requested that is the same as a previously requested rule,
			// restart the worker and force it to reload the rules.
			for (const service of Object.values(workerServices[key])) {
				service?.terminate();
			}
			delete workerServices[key];
		}
	}
	timeoutRestartRulePaths.add(
		setTimeout(() => {
			restartRulePaths.add(rulePath);
		}, 1000)
	);

	const isTs = /\.[cm]?ts$/u.test(rulePath);
	const key = isTs ? 'ts' : 'js';
	const root = getRoot(rulePath);
	if (!workerServices[root]) workerServices[root] = {};
	const workerService =
		workerServices[root][key] || (workerServices[root][key] = buildWorkerService({ isTs, root }));
	return {
		getLinterResult(config) {
			try {
				const result = workerService.call(ruleName, rulePath, config);
				return result;
			} catch (_e) {
				// Crash
				return null;
			}
		}
	};
}

/**
 * @param {object} options
 * @param {boolean} options.isTs
 * @param {string} options.root
 * @returns {WorkerService}
 */
function buildWorkerService({ isTs, root }) {
	let seq = 0;
	const sharedBuffer = new SharedArrayBuffer(4);
	const sharedBufferView = new Int32Array(sharedBuffer, 0, 1);
	const { port1: mainPort, port2: workerPort } = new MessageChannel();
	const worker = new Worker(workerPath, {
		workerData: { sharedBuffer, workerPort },
		transferList: [workerPort],
		execArgv: isTs ? getInstalledTSLoaderOptions(root) : []
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

/**
 * Get the installed typescript loader options
 * @param {string} root
 */
function getInstalledTSLoaderOptions(root) {
	const req = Module.createRequire(path.join(root, '__placeholder__.js'));
	try {
		req.resolve('ts-node');
		return ['--loader', 'ts-node/esm/transpile-only', '-r', 'ts-node/register/transpile-only'];
		// VSCode doesn't support it yet.
		// ["--import", path.resolve(__dirname, "./ts-node-import.mjs")]
	} catch {
		// ignore
	}
	try {
		req.resolve('esbuild-register');
		return ['--loader', 'esbuild-register/loader', '-r', 'esbuild-register'];
	} catch {
		// ignore
	}
	return ['--loader', 'ts-node/esm/transpile-only', '-r', 'ts-node/register/transpile-only'];
}

/**
 * Get root path
 * @param {string} rulePath
 */
function getRoot(rulePath) {
	const ruleDir = path.dirname(rulePath);
	let dir = ruleDir;
	while (dir !== '/') {
		const pkgPath = path.join(dir, 'package.json');
		if (fs.existsSync(pkgPath)) {
			return dir;
		}
		const next = path.dirname(dir);
		if (next === dir) break;
		dir = next;
	}
	return ruleDir;
}
