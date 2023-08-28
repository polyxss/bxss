import {Cluster} from "puppeteer-cluster";
import * as fs from 'fs';

import {ACTION, Test} from "./google_tests";
import {Tester, TesterFactory} from "./tester";
import {Distribution, DistributionDict, DistributionScore, TestedScore, UntestedScore} from "../distribution";
import {range, shuffle, urlIsReachable} from "../util";

import { config } from "../config";

type ProgressCallback = (testId: number, testResult: number, error?: Error | null) => void;

const preloadFile = fs.readFileSync(__dirname + "/preload.js", "utf8");
// const preloadWindowOpenFile = fs.readFileSync(__dirname + "/preloadWindowOpen.js", "utf8"); // not using tabs

process.setMaxListeners(Infinity);

interface FiringRangeOptions {
	verbose?: boolean;
	debug?: boolean;
	waitAfterExecution?: number;
	maxConcurrency?: number;
	testWaitUntil?: string | string[];
	timeout?: number;
	concurrentBrowsers?: boolean;
	puppeteerOptions?: any;
}

export class FiringRangeTesterFactory implements TesterFactory<FiringRangeTester> {
	async create(tests: Test[], progressCallback?: ProgressCallback, options?: FiringRangeOptions): Promise<FiringRangeTester> {
		let cluster = await Cluster.launch({
			concurrency: (options?.concurrentBrowsers ? Cluster.CONCURRENCY_BROWSER : Cluster.CONCURRENCY_CONTEXT) ?? Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: options?.maxConcurrency ?? config.maxConcurrency,
			timeout: Math.max(options?.timeout ?? config.timeout, 2000),
			puppeteerOptions: options?.puppeteerOptions ?? {
				"args": ['--no-sandbox']
			},
		});

		return new FiringRangeTester(cluster, tests, progressCallback, options);
	}

	async createMultiple(tests: Test[], progressCallback?: ProgressCallback, options?: FiringRangeOptions): Promise<[string, FiringRangeTester][]> {
		let cluster = await Cluster.launch({
			concurrency: (options?.concurrentBrowsers ? Cluster.CONCURRENCY_BROWSER : Cluster.CONCURRENCY_CONTEXT) ?? Cluster.CONCURRENCY_CONTEXT,
			maxConcurrency: options?.maxConcurrency ?? config.maxConcurrency,
			timeout: options?.timeout ?? config.timeout,
			puppeteerOptions: options?.puppeteerOptions ?? {}
		});

		return tests.map((test, _) => {
			return [test.url, new FiringRangeTester(cluster, [test], progressCallback, options)];
		});
	}
}

export class FiringRangeTester implements Tester {
	tests: Test[];
	disabledTests: Set<string>;

	/* Can be overwritten and will be called when a test finishes. */
	progressCallback: ProgressCallback;

	cluster: Cluster;
	options: FiringRangeOptions = {};

	constructor(cluster: Cluster, tests: Test[], progressCallback?: ProgressCallback, options?: FiringRangeOptions) {
		this.progressCallback = progressCallback ?? (() => {});
		this.tests = tests;
		this.disabledTests = new Set();
		this.cluster = cluster;

		options = options ?? {};

		this.options.verbose = options.verbose ?? false;
		this.options.debug = options.debug ?? false;

		this.options.timeout = options.timeout ?? config.timeout;
		this.options.maxConcurrency = options.maxConcurrency ?? 1;
		this.options.waitAfterExecution = options.waitAfterExecution ?? 0;

		// relevant options are: ["load", "domcontentloaded", "networkidle0",  "networkidle2"]
		this.options.testWaitUntil = options.testWaitUntil ?? ["load"];
		this.options.puppeteerOptions = options.puppeteerOptions ?? {};

		// decides if we use CONCURRENCY_BROWSER or CONCURRENCY_CONTEXT
		this.options.concurrentBrowsers = options.concurrentBrowsers ?? true;
	}

	async sanityCheck(): Promise<boolean> {
		const testerUrl = config.gfr_tester_url;
		const testerOnline = await urlIsReachable(testerUrl);
		console.assert(testerOnline, `ERROR: GFR tester at ${testerUrl} is unreachable.`);

		const payloadOnline = config.exploit_url == "" || await urlIsReachable(config.exploit_url);
		console.assert(payloadOnline, `ERROR: Payload at ${config.exploit_url} is unreachable.`);

		console.assert(this.tests.length, "ERROR: Too few tests are available.");
		console.assert(this.cluster, "ERROR: Puppeteer cluster is not initialized.");

		return testerOnline && this.cluster != null;
	}

	disableTests(testNames: Set<string>): void {
		testNames.forEach((testName) => {
			this.disabledTests.add(testName);
		});
	}

	resetFilter(): void {
		this.disabledTests.clear();
	}

	createEmptyDistribution(): Distribution {
		let dict: DistributionDict = {};
		this.tests.forEach((test) => {
			const testName = test.url;
			dict[testName] = new TestedScore(0);

			if (this.disabledTests.has(testName)) {
				dict[testName] = new UntestedScore();
			} else {
				dict[testName] = new TestedScore(0);
			}
		});

		return new Distribution(dict, this.tests.map((test) => test.url));
	}

	getNumberOfAvailableTests(): number {
		return this.tests.length;
	}

	getNumberOfRemainingTests(): number {
		return this.getNumberOfAvailableTests() - this.disabledTests.size;
	}

	/**
	 * Only use for testing.
	 * @param _
	 */
	async fakeTest(_: string): Promise<Distribution> {
		let results: Array<[string, TestedScore]> = [];
		for (let i = 0; i < this.tests.length; i++) {
			const testName = this.tests[i].url;
			results.push([testName, new TestedScore(0)]);
		}

		let dist: DistributionDict = {};
		for (const [testName, result] of results) {
			dist[testName] = result;
		}

		return new Distribution(dist, this.tests.map((test) => test.url));
	}

	async testOne(payload: string, test: Test): Promise<[string, DistributionScore]> {
		// const test = this.tests.filter(test => test.baseUrl = testPath)[0];

		let config = {
			idx: test.idx || 0,
			debug: this.options.debug,
			url: test.url,
			payload: payload,
			action: test.action,
			cluster: this.cluster,
			timeout: this.options.timeout,
			waitAfterExecution: this.options.waitAfterExecution
		}

		return new Promise<[string, DistributionScore]>((resolve) => {
			this.cluster.execute(config, perform_action)
				.then(([testResult, error]) => {
					this.progressCallback(config.idx, testResult, error);
					if (testResult == 1 && error) {
						console.log("Test succeeded, but returned error", error)
					}
					resolve([config.url, new TestedScore(testResult)]);
				})
				.catch((error) => {
					config.debug ? console.error(
						"Received error from perform_action for", ACTION[config.action],
						config.url + config.payload, error
					): null;
					this.progressCallback(config.idx, 0, error);
					resolve([config.url, new TestedScore(0)]);
				});
		});
	}

	/**
	 * Runs a payload against all tests.
	 * @param payload
	 */
	async testAll(payload: string): Promise<Distribution> {
		let executions = [];

		// we want the tests to be queued in random order while maintaining the actual order for the output
		// shuffle all test IDs
		const testIds = shuffle(range(this.tests.length));

		for (let i = 0; i < this.tests.length; i++) {
			// the test with this id will be used
			const idx = testIds[i];

			// Alternatively provide an array of different exploits to test each one on a specific page (for debugging)
			// let exploit = Array.isArray(payload) ? payload[id] : payload;
			let config = {
				idx: idx,
				debug: this.options.debug,
				url: this.tests[idx].url,
				payload: payload,
				exploit: payload,
				action: this.tests[idx].action,
				cluster: this.cluster,
				timeout: this.options.timeout,
				waitAfterExecution: this.options.waitAfterExecution
			}

			let execution = new Promise<[string, DistributionScore]>((resolve) => {
				this.cluster.execute(config, perform_action)
					.then(([testResult, error]) => {
						this.progressCallback(config.idx, testResult);
						resolve([config.url, new TestedScore(testResult)]);
						if (testResult && error) {
							console.log("Test succeeded, but returned error", error)
						}
					})
					.catch((err) => {
						this.progressCallback(config.idx, 0);
						if (this.options.debug) {
							console.log(
								`\nERROR test #${config.idx} ${this.tests[config.idx].url} ${ACTION[config.action]}: ` + err
							);
						}
						resolve([config.url, new TestedScore(0)]);
					});
			});

			executions.push(execution);
		}

		let dist: DistributionDict = {};
		let results = await Promise.all(executions);

		for (const [testName, result] of results) {
			dist[testName] = result;
		}

		return new Distribution(dist, this.tests.map((test) => test.url));
	}

	async close() {
		await this.cluster.idle();
		await this.cluster.close();
	}
}

async function perform_action({page: page, data: data}: { page: any, data: any }) {
	let testResult = 0;
	let error: Error | any = null;

	const debug = data.debug ?? false;
	const timeout = data.timeout ?? config.timeout;
	const waitUntil = data.waitUntil ?? "load";
	const waitAfterTest = data.waitAfterExecution ?? 500;

	let payload = data.payload ?? data.exploit;
	if (!payload) {
		return [0, error];
	}

	// Inject JS to open new tab in place
	await page.evaluateOnNewDocument(preloadFile);

	// TODO speed up, if the triggers were capable of interrupting and returning testResult on success
	const consoleTrigger = async (msg: { text: () => string | string[]; }) => {
		testResult = msg.text().includes("xss") ? 1: testResult;
	};
	page.on("console", consoleTrigger);

	const alertTrigger = async (a: any) => {
		testResult = 1;
		try { a.dismiss(); } catch (_) { }
	};
	page.on("dialog", alertTrigger);

	async function smartSleep(ms: number) {
		if (testResult || ms <= 0) {
			return;
		}
		let waitStep = ms / 10;
		let waitedTime = 0;
		while (!testResult && waitedTime < ms) {
			waitedTime += waitStep;
			await sleep(waitStep);
		}
	}

	function cleanUp() {
		/* deregister triggers */
		page.on("console", consoleTrigger);
		page.on("dialog", alertTrigger);
	}

	try {
		switch (data.action) {
			case ACTION.VISIT:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});

				if (!testResult) {  // hover each element in body
					const sel = "body > *:not(script):not(frame):not(noscript):not(style):not(.ng-binding)";
					for (let element of await page.$$(sel)) {
						if (testResult) {
							break;
						}
						try { await element.hover(); } catch (err) { error = err; }
					}
				}
				break;
			case ACTION.COOKIE:
				await page.goto(data.url, {timeout: timeout + 1, waitUntil: waitUntil});
				await page.setCookie({ name: "badValue", value: payload});
				await smartSleep(10);
				!testResult ? await page.goto(data.url, {timeout: timeout + 2, waitUntil: waitUntil}).catch((_: any) => {}): null;
				break;
			case ACTION.COOKIE2:
				await page.goto(data.url, {timeout: timeout + 1, waitUntil: waitUntil});
				await page.setCookie({ name: "ThisCookieIsTotallyRandomAndCantPossiblyBeSet", value: payload});
				await smartSleep(10);
				!testResult ? await page.goto(data.url, {timeout: timeout + 2, waitUntil: waitUntil}).catch((_: any) => {}): null;
				break;
			case ACTION.LOCAL_STORAGE: {
				let repetitions = 0;
				while (!testResult && repetitions < 4) {
					repetitions += 1;
					await page.goto(data.url, {timeout: timeout + 1, waitUntil: waitUntil});
					await page.evaluate((value: string) => localStorage.setItem("badValue", value), payload);
					await smartSleep(10);
					!testResult ? await page.goto(data.url, {timeout: timeout + 2, waitUntil: waitUntil}).catch((_: any) => {}): null;
					await smartSleep(100);
				}
				break;
			}
			case ACTION.SESSION_STORAGE: {
				let repetitions = 0;
				while (!testResult && repetitions < 4) {
					repetitions += 1;
					await page.goto(data.url, {timeout: timeout + 1, waitUntil: "domcontentloaded"});
					await page.evaluate((value: string) => sessionStorage.setItem("badValue", value), payload);
					await smartSleep(10);
					!testResult ? await page.goto(data.url, {timeout: timeout + 2, waitUntil: "load"}).catch((_: any) => {}): null;
					await smartSleep(100);
				}
				break;
			}
			case ACTION.COMPLEX_MESSAGE:
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				/*
				Applies to test /dom/toxicdom/postMessage/complexMessageDocumentWriteEval
				The test has three actions: "exec", "addImage", "addHtml".
				We execute each action once and wait afterwards. Stop early on positive result.
				*/
				for (const action of ["exec", "addImage", "addHtml"]) {
					if (!testResult) {
						await page.evaluate(([action, exploit]: [string, string]) => window?.frames?.top?.postMessage(
							{action: action, payload: exploit}, "*"
						), [action, payload]);
					}
				}
				break;
			case ACTION.JSON_URL_MESSAGE:
				/* Another unique action. Requires post message with parsable JSON that has "url" key. */
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				await page.evaluate(
					(exploit: string) => window?.frames?.top?.postMessage(`{"url": "${exploit}"}`, "*"), payload
				);
				break;
			case ACTION.JSON_HTML_MESSAGE:
				/* Requires the message to be JSON-parsable and have "html" key */
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				await page.evaluate(
					(exploit: string) => window?.frames?.top?.postMessage(`{"html": "${exploit}"}`, "*"), payload
				);
				await smartSleep(10);
				break;
			case ACTION.POST_MESSAGE:
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				await page.evaluate((exploit: string) => window?.frames?.top?.postMessage(exploit, "*"), payload);
				break;
			case ACTION.TYPING_EVENT:
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				const selector = 'input[type="text"]';
				// await page.waitForSelector(selector, {timeout: timeout}).catch((_: any) => {});
				await page.$eval(
					selector, (element: any, exploit: any) => { element.setAttribute("value", exploit) },
					payload // instantly set value
				).catch((_: any) => {});
				await smartSleep(10);
				await page.type(selector, "\n"); // trigger typing event
				await smartSleep(10); // requires short sleep
				break;
			case ACTION.WINDOW_NAME:
				/** Testing shows that this test often needs to be repeated for success **/
				let repetitions = 0;
				while (testResult !== 1 && repetitions < 5) {
					try {
						await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
						await page.evaluate((exploit: string) => {
							window.name = exploit;
						}, payload);
						await smartSleep(waitAfterTest);
					} catch (e) {
						debug ? console.log(e) : null;
					} finally {
						repetitions += 1;
					}
				}
				break;
			case ACTION.REFERER:
				/* Setting the Referer/Referrer header with Puppeteer is a problem on its own.
				 * TODO This test will always fail (currently). */
				await page.setExtraHTTPHeaders({referer: payload});
				await page.goto(data.url, {
					timeout: timeout, waitUntil: waitUntil, referer: payload
				});
				await page.setExtraHTTPHeaders({});
				await smartSleep(100);
				break;
			case ACTION.CLICK_AREA_TAG:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});
				// await page.waitForSelector("area", {timeout: timeout}).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'area', (handles: any[]) => handles.forEach(element => element.click() )
				).catch((_: any) => {});
				break;
			case ACTION.CLICK_DIV_TAG:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});
				// await page.waitForSelector("div", {timeout: timeout}).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'div', (handles: any[]) => handles.forEach(element => element.click())).catch((_: any) => {}
				);
				break;
			case ACTION.CLICK_TAG_TAG:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});
				// await page.waitForSelector("tag", {timeout: timeout}).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'tag', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				break;
			case ACTION.CLICK_A_TAG:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});
				await smartSleep(10);
				// we need two implementations here, depending on the test
				await page.$$eval(
					'a', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				!testResult ? await page.click('a').catch((_: any) => {}): null;
				break;
			case ACTION.CLICK_INPUT_TAG:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});
				// await page.waitForSelector("input", {timeout: timeout}).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'input', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				break;
			case ACTION.CLICK_BUTTON:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil});
				// await page.waitForSelector("button", {timeout: timeout}).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'button', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				break;
			case ACTION.FORM_WITH_INPUT:
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				/*
				https://puppeteer.github.io/puppeteer/docs/puppeteer.page.type/
				A selector of an element to type into.
				If there are multiple elements satisfying the selector, the first will be used.
				 */
				await page.waitForSelector('input:not([type="submit"])', {timeout: timeout}).catch((_: any) => {});
				await page.type('input:not([type="submit"])', payload).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'input[type="submit"]', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				break;
			case ACTION.FORM_WITH_INPUT_Q: // TODO may be covered by ACTION.FORM_WITH_INPUT
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				await page.waitForSelector('input[name="q"]', {timeout: timeout}).catch((_: any) => {});
				await page.type('input[name="q"]', payload).catch((_: any) => {});
				await smartSleep(10);
				await page.$$eval(
					'input[type="submit"]', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				break;
			case ACTION.FORM_WITH_INPUT_USER: // TODO may be covered by ACTION.FORM_WITH_INPUT
				await page.goto(data.url, {timeout: timeout, waitUntil: waitUntil});
				await page.waitForSelector('input[id="userInput"]', {timeout: timeout}).catch((_: any) => {});
				await page.type('input[id="userInput"]', payload).catch((_: any) => {});
				// await page.waitForSelector('[type="submit"]', {timeout: timeout}).catch((_: any) => {});
				// await page.click('input[type="submit"]');
				await smartSleep(10);
				await page.$$eval(
					'input[type="submit"]', (handles: any[]) => handles.forEach(element => element.click())
				).catch((_: any) => {});
				break;
			case ACTION.FORM_URL_PARAM:
				await page.goto(data.url + payload, {timeout: timeout, waitUntil: waitUntil})
				// await page.waitForSelector('[type="submit"]', {timeout: timeout}).catch((_: any) => {});
				// await page.click('input[type="submit"]');
				await smartSleep(10);
				await page.$$eval(
					'input[type="submit"]', (handles: any[]) => handles.forEach(element => element.click() )
				).catch((_: any) => {});
				break;
			default:
				debug ? console.error("Invalid action!") : null;
				break;
		}
	} catch (err) {
		debug ? console.log("Error in", ACTION[data.action], data.url, payload, err) : null;
		error = err;
	}

	/* wait up to max wait time for positive result after the test */
	await smartSleep(waitAfterTest);

	/* return the result */
	cleanUp();
	return [testResult, error];
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
