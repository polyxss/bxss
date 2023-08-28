import path from "path";
import fs from "fs";

import {
	TokenDefinition,
	TokenValue,
	xssTokens
} from "./tree/tokens";
import { FiringRangeTester, FiringRangeTesterFactory } from "./tester/google_firing_range";
import { TESTS } from "./tester/google_tests";

interface Polyglot {
	payload: string;
}

/**
 * This class is used to split a polyglot back into its tokens.
 */
class Tokenizer {
	tokenDefinition: TokenDefinition;
	tokens: Set<TokenValue>;
	tokens_lower: Set<TokenValue>;

	constructor(tokenDefinition: TokenDefinition) {
		this.tokenDefinition = tokenDefinition;

		this.tokens = new Set();
		this.tokens_lower = new Set();
		Object.values(this.tokenDefinition.sets).forEach((tokenValues: TokenValue[]) => {
			tokenValues.forEach((tokenValue) => {
				this.tokens.add(tokenValue);
				this.tokens_lower.add(tokenValue.toLowerCase());
			});
		});
	}

	parsePolyglot(str: string) {
		// dumb n^2 algorithm to extract tokens from a payload.

		let parseList = [];
		let start = 0;

		while (start < str.length) {
			let endIndex = -1;
			for (let end = str.length; end > start; end--) {
				const s = str.substring(start, end);
				if (this.tokens_lower.has(s.toLowerCase())) {
					parseList.push(s);
					endIndex = end;
					break;
				}
			}

			if (endIndex < 0) {
				// could not split polyglot into tokens
				console.log(parseList);
				throw "ERROR endIndex < 0";
			}

			start = endIndex;
		}

		return parseList;
	}
}

function createMask(i: number, n: number) {
	const arr = new Array(n).fill(true);
	arr[i] = false;
	return arr;
}

function applyMask(tokens: string[], mask: boolean[]) {
	return tokens.filter((_, i) => mask[i]);
}

/**
 * Merging masks is basically a logical AND on two bitmasks:
 *
 * mask0: 1111101111111
 * mask1: 1101111111111
 * ====================
 * ret:   1101101111111
 */
function mergeMasks(mask0: boolean[], mask1: boolean[]) {
	const ret = new Array(mask0.length) as boolean[];
	for (let i = 0; i < mask0.length; i++) {
		ret[i] = mask0[i] && mask1[i];
	}
	return ret;
}

function passesExpectedTests(result: (0 | 1)[], expectation: (0 | 1)[]) {
	for (let i = 0; i < expectation.length; i++) {
		if (expectation[i] === 1 && result[i] === 0) {
			return false;
		}
	}

	return true;
}

function numberOfPassedExpectedTests(result: (0 | 1)[], expectation: (0 | 1)[]) {
	let v = 0;

	for (let i = 0; i < expectation.length; i++) {
		if (expectation[i] === 1 && result[i] === 1) {
			v++;
		}
	}

	return v;
}

function toBits(mask: boolean[]) {
	return mask.map((d) => d ? "1" : "0").join("");
}

function toIndices(mask: boolean[]) {
	return mask.map((d, i) => [d, i]).filter((d) => !d[0]).map((d) => d[1])
}

async function loadOrEvaluate(payload: string, firingRangeTester: FiringRangeTester, baselineTestResult: (0|1)[], cacheDir: string, filename: string, mask: boolean[]) {
	let outputFilename = path.join(cacheDir, filename + "-" + toBits(mask) + ".json");
	try {
		let content = fs.readFileSync(outputFilename, { encoding: "utf-8" });
		let tmpResult = JSON.parse(content) as (0 | 1)[];

		if (tmpResult.length !== baselineTestResult.length) {
			throw "ERROR tmpResult.length !== baselineTestResult.length";
		}
		return tmpResult;

	} catch (e) {
		const result = (await firingRangeTester.testAll(payload)).toArray();
		fs.writeFileSync(outputFilename, JSON.stringify(result));
		return result;
	}
}

async function minimizeTokens(tokens: string[], firingRangeTester: FiringRangeTester, filename: string, cacheDir: string): Promise<string[]> {
	console.log("Start minimization of", tokens.join(""));

	const gfrDist = await firingRangeTester.testAll(tokens.join(""));
	const baselineTestResult = gfrDist.toArray();

	const baseline = baselineTestResult.reduce((a: number, b: number) => a + b, 0);
	console.log("Successful tests (baseline): ", baseline);

	if (baseline === 0) {
		throw "Is the firing range started?";
	}

	const firstOutputFilename = path.join(cacheDir, filename + ".json");
	fs.writeFileSync(firstOutputFilename, JSON.stringify({ "result": baselineTestResult, "tokens": tokens }));

	/**
	 * First, exclude each token separately and save the masks that do not reduce
	 * the number of successful tests.

	 * All masks (true == keep token; false == remove token from original token
	 * list) that do not reduce the number of successful tests are called
	 * invariants.
	 *
	 * - allInvariants contains every invariant found
	 * - invariants contains the current set of relevant invariants
	 */
	const allInvariants = new Set<string>();
	const invariants = new Set<string>();

	for (let i = 0; i < tokens.length; i++) {
		const mask = createMask(i, tokens.length);
		const localTokens = applyMask(tokens, mask);
		const payload = localTokens.join("");

		console.log("Mask:", mask.map((d, i) => [d, i]).filter((d) => !d[0]).map((d) => d[1]));

		const result = await loadOrEvaluate(payload, firingRangeTester, baselineTestResult, cacheDir, filename, mask);

		console.log("Successful tests", numberOfPassedExpectedTests(result, baselineTestResult), "/", baseline);

		if (passesExpectedTests(result, baselineTestResult)) {
			allInvariants.add(JSON.stringify(mask));
			invariants.add(JSON.stringify(mask));
		}
	}

	/**
	 * Next, we combine every mask in [invariants] (e.g. in the first iteration
	 * we have masks that contain one 'false' entry and create a new mask that
	 * contains two 'false' entries).
	 */
	for (let n_min_removed = 2; n_min_removed < tokens.length; n_min_removed++) {
		// Save previous attempts to cut down from n^2 tries to (((n^2)-n)/2)
		const attempts = new Set<string>();
		const localInvariants = new Set<string>();

		let i = 0;
		let j = 0;
		for (let inv0_str of invariants) {
			i++;
			const inv0 = JSON.parse(inv0_str) as boolean[];
			for (let inv1_str of invariants) {
				if (inv0_str == inv1_str) {
					continue;
				}

				const inv1 = JSON.parse(inv1_str) as boolean[];
				const mask = mergeMasks(inv0, inv1);

				process.stdout.write(".");

				const n = invariants.size * invariants.size;

				if (attempts.has(JSON.stringify(mask))) {
					continue;
				} else {
					attempts.add(JSON.stringify(mask));
				}

				j++;

				const localTokens = applyMask(tokens, mask);
				const payload = localTokens.join("");

				const result = await loadOrEvaluate(payload, firingRangeTester, baselineTestResult, cacheDir, filename, mask);

				if (passesExpectedTests(result, baselineTestResult)) {
					console.log("Combined: ", toIndices(inv0), toIndices(inv1));
					console.log("MASK:", toIndices(mask));
					localInvariants.add(JSON.stringify(mask));
				}
			}
		}

		/**
		 * Reset the invariants set and add the invariants from the current
		 * iteration. In the first iteration, each mask has exactly one 'false'
		 * entry. These are combined to create masks with two 'false' entries.
		 * These are combined to create masks with at most four 'false' entries...
		 */
		invariants.clear();
		for (let inv of localInvariants) {
			invariants.add(inv);
			allInvariants.add(inv);
		}

		if (invariants.size === 0) {
			break;
		}
	}

	let bestLength = tokens.length;
	let best = tokens;

	for (let invariant of allInvariants) {
		const mask = JSON.parse(invariant) as boolean[];
		const localTokens = applyMask(tokens, mask);
		if (bestLength > localTokens.length) {
			best = localTokens;
			bestLength = localTokens.length;
		}
	}

	return best;
}

async function main() {
	if (process.argv.length !== 4) {
		console.error("usage: ts-node minimizer.ts [inFile] [cacheDir]");
		process.exit(1);
	}

	const firingRangeUrl = process.env["FIRING_RANGE_URL"] ?? "http://localhost:8081";

	const [tsnode, scriptName, inFile, cacheDir] = process.argv;
	console.assert(tsnode.endsWith("ts-node"), "ts-node assertion");
	console.assert(inFile.endsWith(".json"), "JSON assertion");
	fs.mkdirSync(cacheDir);
	console.assert(fs.lstatSync(cacheDir).isDirectory(), "directory assertion");

	const filename = path.basename(inFile, path.extname(inFile));

	const rawData = fs.readFileSync(inFile, { encoding: "utf-8" });
	const polyglot: Polyglot = JSON.parse(rawData);

	const tokenizer = new Tokenizer(xssTokens);
	const polyglotTokens = tokenizer.parsePolyglot(polyglot.payload);

	const gfrTests = TESTS(firingRangeUrl);

	const factory = new FiringRangeTesterFactory();
	const firingRangeTester = await factory.create(gfrTests, () => undefined);

	console.log("Start", scriptName);
	const final = await minimizeTokens(polyglotTokens, firingRangeTester, filename, cacheDir);
	fs.writeFileSync(path.join(cacheDir) + filename + "-final.json", JSON.stringify(final));

	await firingRangeTester.close();
}

(function () {
	main().then(() => console.log("Done"));
})();
