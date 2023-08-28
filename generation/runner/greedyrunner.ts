import {Tester} from "../tester/tester";
import {BaseRunner} from "./baserunner";
import {RunConfig, RunnerDirectories} from "./interfaces";
import {Token, TOKEN_TYPES, TokenProvider} from "../tree/tokens";
import {XSSTerminalCondition} from "../tree/xssnode";

import path from "path";
import fs from "fs";
import {Distribution} from "../distribution";
import {sum} from "../mathutil";
import {FileFormat} from "../logging";

export class GreedyRunner extends BaseRunner {
	logQTable = true;

	runConfig: RunConfig;
	tester: Tester;
	dirs: RunnerDirectories;
	rng: any;

	tries: number;

	constructor(runConfig: RunConfig,
		tester: Tester,
		dirs: RunnerDirectories,
		tries: number,
		rng: any,
	) {
		super();

		this.runConfig = runConfig;
		this.tester = tester;
		this.dirs = dirs;
		this.rng = rng;

		this.tries = tries;
	}

	async run() {
		this.createDirectories(this.dirs.subDirs, this.dirs.tryDir);
		console.log("GreedyRunner directories created.")

		const type = TOKEN_TYPES[this.runConfig.tokenType];
		if (type === undefined) {
			throw "Token type is undefined";
		}

		if (this.runConfig.rlGreedyTestbedCallBudget === "infinite") {
			console.warn("Running Greedy with infinite testbed budget!")
		}

		const tokenFactory = new TokenProvider(type);
		const tokens = tokenFactory.getTokens();

		const startToken = new Token(0, "");
		startToken.setNextTokens(tokens);

		const terminalCondition = XSSTerminalCondition[this.runConfig.terminalCondition];

		if (terminalCondition === undefined) {
			throw "Terminal condition is undefined";
		}

		let bestWins = 0;
		let bestPayload: Token[] | undefined = undefined;
		let bestOutput: Distribution | undefined = undefined;

		const keepSimulating = (this.runConfig.simulationsPerAction === "infinite") ? keepSimulatingInfinite : keepSimulatingFinite;

		let numTestbedCalls = 0;
		for (let i = 0; keepSimulating(i, this.runConfig.simulationsPerAction); i++) {
			if (
				this.runConfig.rlGreedyTestbedCallBudget !== "infinite" &&
				numTestbedCalls > this.runConfig.rlGreedyTestbedCallBudget
			) {
				break;
			}

			const payload: Token[] = [startToken];

			while (!this.isDone(payload, terminalCondition)) {
				if (
					this.runConfig.rlGreedyTestbedCallBudget !== "infinite" &&
					numTestbedCalls > this.runConfig.rlGreedyTestbedCallBudget
				) {
					break;
				}

				const nextTokens = payload[payload.length - 1].getNextTokens();

				const resultList: {
					token: Token,
					payload: Token[],
					dist: Distribution
				}[] = [];

				/*
				 * Test each child and chose the best
				 */
				for (let i = 0; i < nextTokens.length; i++) {
					if (
						this.runConfig.rlGreedyTestbedCallBudget !== "infinite" &&
						numTestbedCalls > this.runConfig.rlGreedyTestbedCallBudget
					) {
						break;
					}

					const probePayload = payload.slice();
					probePayload.push(nextTokens[i]);

					const payloadStr = probePayload.map((t) => t.value).join("");
					const dist = await this.tester.testAll(payloadStr, false);
					numTestbedCalls += 1;

					resultList.push({
						token: nextTokens[i],
						payload: probePayload,
						dist: dist
					});
				}

				if (resultList.length === 0) {
					break;
				}

				/**
				 * Sort list according to score (highest score first). Then filter
				 * the list to only include elements that are equal to the highest
				 * score.
				 *
				 * From these elements we randomly choose one.
				 */
				const bestActions = resultList.sort((a, b) => {
					return b.dist.getNumberOfSuccesses() - a.dist.getNumberOfSuccesses()
				})
					.filter((v, i, a) => {
						return v.dist.getNumberOfSuccesses() == a[0].dist.getNumberOfSuccesses();
					});


				if (bestActions.length === 0) {
					break;
				}

				/**
				 * Choose action with the highest wins or random if there are multiple action
				 * with equal score
				 */
				const index = Math.floor(this.rng() * bestActions.length);
				const dist = bestActions[index].dist;
				const wins = dist.getNumberOfSuccesses();
				const action = bestActions[index].token;

				payload.push(action);

				/*
				 * Update best polyglot overall
				 */
				if (wins >= bestWins) {
					console.log("[GreedyRunner] Found new best: ", wins, ">=", bestWins);
					bestWins = wins;
					bestPayload = payload;
					bestOutput = dist;
				}

				if (numTestbedCalls % this.runConfig.saveFrequency === 0) {
					if (bestPayload !== undefined) {
						this.writeGreedyRunToFile(i, bestOutput, bestPayload, numTestbedCalls);
					} else {
						console.warn("[GreedyRunner]: Iteration (" + i + "): Warning 'bestPayload' undefined!");
					}
				}
			}

			if (bestPayload !== undefined) {
				this.writeGreedyRunToFile(i, bestOutput, bestPayload, numTestbedCalls);
			} else {
				console.warn("[GreedyRunner]: Iteration (" + i + "): Warning 'bestPayload' undefined!");
			}
		}

		if (bestPayload === undefined) {
			return [];
		}

		this.writeGreedyRunToFile("final", bestOutput, bestPayload, numTestbedCalls);

		return [bestPayload.map((t) => t.value).join("")];
	}

	isDone(payload: Token[], terminalCondition: XSSTerminalCondition) {
		if (terminalCondition === XSSTerminalCondition.STRING_LENGTH) {
			return payload.map((t) => t.value).join("").length >= this.runConfig.maxPayloadLength;
		} else if (terminalCondition === XSSTerminalCondition.TOKEN_LENGTH) {
			return payload.length >= this.runConfig.maxPayloadLength;
		}

		throw "Terminal condition unknown";
	}

	private writeGreedyRunToFile(nr: number | "final", scores: Distribution | undefined, payload: Token[], numTestbedCalls: number | undefined = undefined) {
		if (scores === undefined || payload.length === 0) {
			return;
		}

		let idx = nr.toString().padStart(10, "0");
		if (numTestbedCalls !== undefined) {
			idx += "-" + numTestbedCalls.toString().padStart(6, "0");
		}

		let outputPath = path.join(this.dirs.subDirs.bestOutputDir, "bestOutput-" + idx);
		console.log("writeGreedyRunToFile", outputPath);

		const output: FileFormat.GreedyRun = {
			"score": scores.getNumberOfSuccesses(),
			output: {
				"timestamp": new Date().toISOString(),
				"tokens": payload.map((t) => t.value),
				"payload": payload.map((t) => t.value).join(""),
				"scores": scores.toString(),
				"wins": sum(scores.toArray()),
				"num_testbed_calls": numTestbedCalls,
			}
		}
		const data = JSON.stringify(output, null, "\t");

		fs.writeFileSync(outputPath, data);
	}
}

function keepSimulatingFinite(simulation: number, simulationsPerAction: number | "infinite") {
	return simulation < (simulationsPerAction as number);
}

function keepSimulatingInfinite(simulation: number, simulationsPerAction: number | "infinite") {
	return true;
}
