import { exec } from 'child_process';
import axios from "axios";

export function getCommitHash(): Promise<string> {
	return new Promise((resolve) => {
		try {
			exec('git rev-parse HEAD', function callback(error, stdout, stderr) {
				if (error) {
					throw `Error (${error}) when retrieving commit hash in util.ts.`;
				}
				resolve(stdout.trim());
			});
		} catch (e) {
			console.warn(`Warning: Error ${e} when retrieving commit hash.`)
			resolve("unknown-commit");
		}
	});
}

/**
 * Quick range function.
 * 0 will be the first and n-1 will be the last element.
 * @param n: length of the resulting range
 */
export function range(n: number) {
	return [...Array(n).keys()];
}

/**
 * Shuffles array in place. ES6 version.
 * Modern version of the Fisher–Yates shuffle algorithm.
 * @param {Array} a items An array containing the items.
 */
export function shuffle(a: any[]): any[] {
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

/**
 * Check if an URL is reachable by sending a GET request.
 * @param url
 */
 export async function urlIsReachable(url: string) {
	let tries = 0;
	const maxTries = 10;
	const waitBetweenTries = 10000; // ms

	let reachable = false;

	while (tries < maxTries && !reachable) {
		await axios.get(url)
			.then(function () {
				// handle success
				reachable = true;
			})
			.catch(function () {
				// handle error
				console.log(url, "is unreachable, retrying in", waitBetweenTries, "ms.")
			});
		if (!reachable) {
			await sleep(waitBetweenTries);
		}
	}

	if (reachable) {
		console.log(url, "is reachable.")
	} else {
		console.log(url, "is unreachable.")
	}

	return reachable;
}

export function* zip(...varargs: any[][]) {
	console.assert(varargs.length > 0);

	let minLength = varargs[0].length;
	for (let i = 1; i < varargs.length; i++) {
		minLength = Math.min(minLength, varargs[i].length);
	}

	for (let j = 0; j < minLength; j++) {
		let output = [];
		for (let i = 0; i < varargs.length; i++) {
			output.push(varargs[i][j]);
		}
		yield output;
	}
}

export function symmetricDifference(a: Set<any>, b: Set<any>) {
	var diff = new Set(a);
	for (var element of b) {
		if (diff.has(element)) {
			diff.delete(element);
		} else {
			diff.add(element);
		}
	}
	return diff;
}
