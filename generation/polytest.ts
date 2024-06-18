import path from "path";
import fs from "fs";

import { FiringRangeTesterFactory } from "./tester/google_firing_range";
import { TESTS } from "./tester/google_tests";

interface Polyglot {
	id?: number;
    payload: string;
}

interface Polyglots {
    data: Polyglot[];
}

async function main() {
	if (process.argv.length !== 4) {
		console.error("usage: ts-node polytest.ts [inFile] [cacheDir]");
		process.exit(1);
	}

	const firingRangeUrl = process.env["FIRING_RANGE_URL"] ?? "http://localhost:8081";

	const [tsnode, scriptName, inFile, cacheDir] = process.argv;
	console.assert(tsnode.endsWith("ts-node"), "ts-node assertion");
	console.assert(inFile.endsWith(".json"), "JSON assertion");
	console.assert(fs.lstatSync(cacheDir).isDirectory(), "directory assertion");
	console.assert(fs.lstatSync(inFile), "file assertion");

	const filename = path.basename(inFile, path.extname(inFile));
	console.log("Start", scriptName);
	console.log("Evaluating polyglot(s) from:", inFile);

	const rawData = fs.readFileSync(inFile, { encoding: "utf-8" });
	if (filename.endsWith("final-polyglots")) {
		const polyglots: Polyglots = JSON.parse(rawData);
		for (const item of polyglots.data) {
			await processPayload(item.payload, firingRangeUrl, cacheDir, filename + item.id);
		}
	} else {
		const polyglot: Polyglot = JSON.parse(rawData);
		await processPayload(polyglot.payload, firingRangeUrl, cacheDir, filename);
	}
}

async function processPayload(payload: string, firingRangeUrl: string, cacheDir: string, filename: string) {
	console.log("Evaluating", payload)
    const gfrTests = TESTS(firingRangeUrl);

	const factory = new FiringRangeTesterFactory();

	// a callback can be passed to create()
	// the simplest callback to print the current test ID: (x) => {console.log(x)}
	const firingRangeTester = await factory.create(gfrTests, () => undefined);

    const gfrDist = await firingRangeTester.testAll(payload);
    const testResult = gfrDist.toArray();

    const score = testResult.reduce((a: number, b: number) => a + b, 0);
	const scoreStr = `Successful tests: ${score}/${gfrTests.length}`
	console.log(scoreStr);

	const evaluatedPolyglot = {
		payload: payload,
		gfr_distribution: testResult,
		score: score,
		score_str: scoreStr
	}

	fs.writeFileSync(path.join(cacheDir, filename + "-eval.json"), JSON.stringify(evaluatedPolyglot, null, 4));


	await firingRangeTester.close();
}

(function () {
	main().then(() => console.log("Done"));
})();
