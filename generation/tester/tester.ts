import fs from 'fs';
import { Cluster } from 'puppeteer-cluster';
import request from 'request-promise';
import { Distribution, DistributionDict, DistributionScore, TestedScore, UntestedScore } from '../distribution';
import { urlIsReachable, sleep } from '../util';

import { config } from "../config";

const preloadFile = fs.readFileSync(__dirname + '/preload.js', 'utf8');
process.setMaxListeners(Infinity);

export interface Tester {
	createEmptyDistribution(): Distribution;
	testAll(payload: string, executeAll?: boolean): Promise<Distribution>;

	sanityCheck(): Promise<boolean>;
	close(): Promise<void>;

	getNumberOfAvailableTests(): number;
	getNumberOfRemainingTests(): number;
	disableTests(testNames: Set<string>): void;
	resetFilter(): void;
}

export interface TesterFactory<T> {
	create(...args: any[]): Promise<T>;
	createMultiple(...args: any[]): Promise<[string, T][]>;
}

export class LocalTesterFactory implements TesterFactory<LocalTester> {
	async create(): Promise<LocalTester> {
		let allTests: string[] = [];

		let page = await request(config.local_tester_url);
		for (let line of page.split("\n")) {
			line = line.trim();
			if (line.startsWith("/")) {
				allTests.push(line);
			}
		}

		let cluster = await Cluster.launch({
			concurrency: Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: config.maxConcurrency,
			timeout: config.timeout,

			// puppeteerOptions: {}

			puppeteerOptions: process.env.NO_SANDBOX ? {
				// @ts-ignore
				args: [ '--no-sandbox' ] // required if Docker can't have a sandbox
			} : {}

		});

		cluster.task(async ({ page, data: data }) => {
			let score = 0;

			await page.evaluateOnNewDocument(preloadFile);
			page.on('console', (msg: { text: () => string | string[]; }) => {
				if (msg.text().includes('xss')) {
					score = 1;
				}
			});

			//Manually fix encoding
			let payload = data.payload.replace(/\+/gm, "%2b");

			const url = data.server.replace(/\/+$/, "") + data.checkTest + "?payload=" + payload;
			await page.goto(url);
			await sleep(100);

			return score;
		});

		return new LocalTester(cluster, allTests);
	}

	async createMultiple(): Promise<[string, LocalTester][]> {
		let allTests: string[] = [];

		let page = await request(config.local_tester_url);
		for (let line of page.split("\n")) {
			line = line.trim();
			if (line.startsWith("/")) {
				allTests.push(line);
			}
		}

		let cluster = await Cluster.launch({
			concurrency: Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: config.maxConcurrency,
			timeout: config.timeout,

			puppeteerOptions: process.env.NO_SANDBOX ? {
				// @ts-ignore
				args: [ '--no-sandbox' ] // required if Docker can't have a sandbox
			} : {}

			// puppeteerOptions: {}
		});

		cluster.task(async ({ page, data: data }) => {
			let score = 0;

			await page.evaluateOnNewDocument(preloadFile);
			page.on('console', (msg: { text: () => string | string[]; }) => {
				if (msg.text().includes('xss')) {
					score = 1;
				}
			});

			//Manually fix encoding
			let payload = data.payload.replace(/\+/gm, "%2b");

			const url = data.server.replace(/\/+$/, "") + data.checkTest + "?payload=" + payload;

			await page.goto(url);
			await sleep(100);

			return score;
		});

		return allTests.map((test) => {
			return [test, new LocalTester(cluster, [test])];
		});
	}
}

export class LocalTester implements Tester {
	allTests: string[];
	disabledTests: Set<string>;

	cluster: Cluster;

	constructor(cluster: Cluster, allTests: string[]) {
		this.cluster = cluster;
		this.allTests = allTests;
		this.disabledTests = new Set();
	}

	createEmptyDistribution() {
		let scoreDict: DistributionDict = {};
		this.allTests.forEach((testName) => {
			if (this.disabledTests.has(testName)) {
				scoreDict[testName] = new UntestedScore();
			} else {
				scoreDict[testName] = new TestedScore(0);
			}
		});

		return new Distribution(scoreDict, this.allTests);
	}

	async sanityCheck() {
		const testerUrl = config.local_tester_url;
		const testerOnline = await urlIsReachable(testerUrl);
		console.assert(testerOnline, `ERROR: Local tester at ${testerUrl} is unreachable.`);

		const payloadOnline = config.exploit_url == "" || await urlIsReachable(config.exploit_url);
		console.assert(payloadOnline, `ERROR: Payload at ${config.exploit_url} is unreachable.`);

		const numTests = this.allTests.length;
		console.assert(numTests, "ERROR: Too few tests are available.");

		console.assert(this.cluster, "ERROR: Puppeteer cluster is not initialized.");

		const testPayload = "<script>console.log(`xss`)</script>";
		const testResult = await this.testAll(testPayload, true);
		console.assert(testResult.getNumberOfSuccesses() > 0, "ERROR: testing payload did not solve any tests.");

		return testerOnline && payloadOnline && this.cluster && testResult.getNumberOfSuccesses() > 0;
	}

	async testAll(payload: string, executeAll: boolean): Promise<Distribution> {
		let executions = [];

		for (let testName of this.allTests) {
			const dontExecute = this.disabledTests.has(testName) && !executeAll;

			if (dontExecute) {
				executions.push(new Promise<[string, DistributionScore]>((resolve) => {
					resolve([testName, new UntestedScore()]);
				}));
				continue;
			}

			let clusterConfig = {
				payload: payload,
				checkTest: testName,
				server: config.local_tester_url
			}

			let execution = new Promise<[string, DistributionScore]>((resolve) => {
				this.cluster.execute(clusterConfig)
					.then((val) => { resolve([testName, new TestedScore(val)]) })
					.catch((_) => {
						resolve([testName, new TestedScore(0)]);
					});
			});

			executions.push(execution);
		}

		let dist: DistributionDict = {};
		let results = await Promise.all(executions);

		for (const [testName, result] of results) {
			dist[testName] = result;
		}

		return new Distribution(dist, this.allTests);
	}

	getNumberOfAvailableTests() {
		return this.allTests.length;
	}

	getNumberOfRemainingTests() {
		return this.getNumberOfAvailableTests() - this.disabledTests.size;
	}

	disableTests(testNames: Set<string>) {
		testNames.forEach((testName) => {
			this.disabledTests.add(testName);
		});
	}

	resetFilter() {
		this.disabledTests.clear();
	}

	async close() {
		await this.cluster.idle();
		await this.cluster.close();
	}
}
