import path from "path";
import fs from "fs";

import { FiringRangeTesterFactory } from "./tester/google_firing_range";
import { TESTS } from "./tester/google_tests";

interface Polyglot {
	payload: string;
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

	const filename = path.basename(inFile, path.extname(inFile));

	const rawData = fs.readFileSync(inFile, { encoding: "utf-8" });
	const polyglot: Polyglot = JSON.parse(rawData);

	const gfrTests = TESTS(firingRangeUrl);

	const factory = new FiringRangeTesterFactory();

	// a callback can be passed to create()
	// the simplest callback to print the current test ID: (x) => {console.log(x)}
	const firingRangeTester = await factory.create(gfrTests, () => undefined);

	console.log("Start", scriptName);
	console.log("Evaluating payload from:", inFile);

	const gfrDist = await firingRangeTester.testAll(polyglot.payload);
	const testResult = gfrDist.toArray();

	const score = testResult.reduce((a: number, b: number) => a + b, 0);
	const scoreStr = `Successful tests: ${score}/${gfrTests.length}`
	console.log(scoreStr);

	const evaluatedPolyglot = {
		payload: polyglot.payload,
		gfr_distribution: testResult,
		score: score,
		score_str: scoreStr
	}

	fs.writeFileSync(path.join(cacheDir, filename + "-eval.json"), JSON.stringify(evaluatedPolyglot));

	await firingRangeTester.close();
}

(function () {
	main().then(() => console.log("Done"));
})();
