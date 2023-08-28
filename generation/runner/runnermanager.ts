import seedrandom from "seedrandom";
import fs from "fs";
import path from "path";

import { Tester, TesterFactory } from "../tester/tester";
import { getCommitHash, sleep } from "../util";
import { LogDirs, RunConfig, RunnerDirectories } from "./interfaces";
import { MctsRunner } from "./mctsRunner";
import { FiringRangeTesterFactory } from "../tester/google_firing_range";
import { ACTION, Test, TestInformation, getActiveTestIds, getAllTests } from "../tester/google_tests";
import { RLRunner } from "./rlrunner";
import { writeConfigurationToFile, writeFinalResultsToFile } from "../logging";
import { GreedyRunner } from "./greedyrunner";

export enum RunnerType {
	MCTS, Greedy, Random, RL
};

function createRunner(runConfig: RunConfig, tester: Tester, dirs: RunnerDirectories, tries: number, rng: any) {
	const runnerType = RunnerType[runConfig.runnerType];

	if (runnerType === undefined) {
		throw "Unknown type";
	}

	if (runnerType === RunnerType.MCTS) {
		return new MctsRunner(runConfig, tester, dirs, tries, runConfig.explorationParam, "mcts", rng);
	}

	if (runnerType === RunnerType.Greedy) {
		return new GreedyRunner(runConfig, tester, dirs, tries, rng);
	}

	if (runnerType === RunnerType.Random) {
		return new MctsRunner(runConfig, tester, dirs, tries, undefined, "random", rng);
	}

	if (runnerType === RunnerType.RL) {
		return new RLRunner(runConfig, tester, dirs, tries, rng);
	}

	throw "Unknown type";
}

export class RunnerManager {
	runConfig: RunConfig;

	resultsDir: string;
	runDir: string;
	summaryDir: string;

	rng: any;

	constructor(runConfig: RunConfig) {
		const date = new Date().toISOString();

		this.runConfig = runConfig;
		this.resultsDir = path.join(path.dirname(path.dirname(__dirname)), "data", "out", "runs");
		this.runDir = path.join(this.resultsDir, "run-" + date);
		this.summaryDir = path.join(this.runDir, "summary")
		this.rng = seedrandom(runConfig.randomSeed);
	}

	async run(testerFactory: TesterFactory<Tester>) {
		this.createDirectories();
		await writeConfigurationToFile(path.join(this.runDir, "meta.json"), {
			runConfig: this.runConfig,
			commit: await getCommitHash()
		});

		let tester;
		if (testerFactory instanceof FiringRangeTesterFactory) {
			console.log("Running with FiringRangeTesterFactory");
			tester = await this.createGfrTester(testerFactory);
		} else {
			console.log("Running with LocalTesterFactory");
			tester = await this.createTester(testerFactory);
		}

		const polyglots = await this.findPolyglotSet(tester);
		writeFinalResultsToFile(Array.from(polyglots), this.summaryDir);
	}

	private createDirectories() {
		if (!fs.existsSync(this.resultsDir)) {
			fs.mkdirSync(this.resultsDir, { recursive: true });
		}
		fs.mkdirSync(this.runDir, { recursive: true });
	}

	private async createTester(testerFactory: TesterFactory<Tester>) {
		let tester = null;

		let sane = false;
		let sanityCheckTries = 0;

		while (sanityCheckTries < 10 && !sane) {
			sanityCheckTries += 1;
			tester = await testerFactory.create();

			sane = await tester?.sanityCheck();
			if (!sane) {
				await tester?.close();
				await sleep(1000);
			}
		}

		if (!sane || !tester) {
			throw new Error("Local Tester sanity check failed");
		}

		return tester;
	}

	private async createGfrTester(testerFactory: FiringRangeTesterFactory) {
		let tester = null;

		let sane = false;
		let sanityCheckTries = 0;

		const firingRangeUrl = process.env.FIRING_RANGE_URL || undefined;

		const test_ids = getActiveTestIds();
		const rawGfrTests = getAllTests()
			.filter((test) => test_ids.includes(test.test_id))
			.map((test: TestInformation, idx: number): Test => {
				return {
					id: test.test_id,
					idx: idx,
					url: firingRangeUrl + test.path,
					baseUrl: test.path,
					action: ACTION[test.action],
				}
			});

		let options = {
			timeout: 500, 				// timeout for loading etc.: default 30000
			waitAfterExecution: 50,		// max wait time for positive result after the test: 400 is good
			maxConcurrency: 4, 			// puppeteer cluster concurrency: 4 is good
			concurrentBrowsers: true, 	// true = use Puppeteer CONCURRENCY_BROWSER
			testWaitUntil: ["load"], 	// "load" or "domcontentloaded" is good enough; other: "networkidle0", "networkidle2"
			verbose: true,
			debug: true,
			puppeteerOptions: {
				args: [
					process.env.NO_SANDBOX ? '--no-sandbox' : "", // required if Docker can't have a sandbox
				]
			}
		}

		function testProgressCallback(testId: number = -1, testResult: number = 0, error: Error | null = null): null {
			const indicator = !error ? (testResult == 1 ? "+" : "-") : (testResult == 1 ? "X" : "x");
			process.stdout.write(`${indicator}`);
			return null;
		}

		while (sanityCheckTries < 10 && !sane) {
			sanityCheckTries += 1;
			tester = await testerFactory.create(rawGfrTests, testProgressCallback, options);
			sane = await tester?.sanityCheck();
			if (!sane) {
				await tester?.close();
				await sleep(1000);
			}
		}

		if (!sane || !tester) {
			throw new Error("Local Tester sanity check failed");
		}

		return tester;
	}

	private async findPolyglotSet(tester: Tester) {
		let polyglotSet = new Set<string>();
		let tries = 0;

		while (tester.getNumberOfRemainingTests() > 0 && tries < this.runConfig.maxGenerationTries) {
			console.log("Test remaining", tester.getNumberOfRemainingTests());
			tries++;

			const tryDir = path.join(this.runDir, "try-" + tries);
			const subDirs: LogDirs = {
				treeDir: path.join(tryDir, "tree"),
				bestOutputDir: path.join(tryDir, "best-polyglot"),
			}
			const dirs: RunnerDirectories = {
				runDir: this.runDir,
				tryDir: tryDir,
				subDirs: subDirs
			};

			const runner = createRunner(this.runConfig, tester, dirs, tries, this.rng);

			const runPolyglots = await runner.run();
			runPolyglots.forEach((polyglot) => {
				polyglotSet.add(polyglot);
			});
		}

		await tester.close();
		return polyglotSet;
	}
}
