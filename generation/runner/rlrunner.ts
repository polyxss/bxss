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

function product<T>(elements: T[], repeat: number) {
	let pools = [];
	for (let i = 0; i < repeat; i++) {
		pools.push(elements);
	}

	const results = [];
	for (let i = 0; i < Math.pow(elements.length, repeat); i++) {
		const result = [];
		for (let j = 0; j < pools.length; j++) {
			const index = Math.floor(i / Math.pow(elements.length, j)) % elements.length;
			result.push(pools[j][index]);
		}
		results.push(result);
	}
	return results;
}

function getStateId(tokens: Token[]) {
	return tokens.map((t) => t.id).join("-");
}

class QTable {
	qtable: { [key: string]: number };

	constructor() {
		this.qtable = {};
	}

	setState(state: Token[], value: number) {
		const key = getStateId(state);
		this.qtable[key] = value;
	}

	getState(state: Token[]) {
		const key = getStateId(state);
		return this.qtable[key] ?? 0;
	}
}

export class RLRunner extends BaseRunner {
	logQTable = false;

	runConfig: RunConfig;
	tester: Tester;
	dirs: RunnerDirectories;
	rng: any;

	qtable: QTable;

	minExplorationProba: number;
	explorationDecay: number;
	discount: number;
	lr: number;

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

		this.qtable = new QTable();
		this.minExplorationProba = 0.01;
		this.explorationDecay = 0.95;
		this.discount = 0.99;
		this.lr = 0.1;

		this.tries = tries;
	}

	async run() {
		this.createDirectories(this.dirs.subDirs, this.dirs.tryDir);

		if (this.runConfig.rlGreedyTestbedCallBudget === "infinite") {
			console.warn("Running Q-Learning with infinite testbed budget!")
		}

		const type = TOKEN_TYPES[this.runConfig.tokenType];
		if (type === undefined) {
			throw "Token type is undefined";
		}

		const tokenFactory = new TokenProvider(type);
		const tokens = tokenFactory.getTokens();

		const startToken = new Token(0, "");
		startToken.setNextTokens(tokens);

		const terminalCondition = XSSTerminalCondition[this.runConfig.terminalCondition];

		if (terminalCondition === undefined) {
			throw "Terminal condition is undefined";
		}

		let explorationProba = 1;

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

			const state: Token[] = [startToken];

			while (!this.isDone(state, terminalCondition)) {
				if (
					this.runConfig.rlGreedyTestbedCallBudget !== "infinite" &&
					numTestbedCalls > this.runConfig.rlGreedyTestbedCallBudget
				) {
					break;
				}

				let action: Token;

				const nextTokens = state[state.length - 1].getNextTokens();
				if (this.rng() < explorationProba) {
					action = nextTokens[Math.floor(this.rng() * nextTokens.length)];
				} else {
					action = this.getBestAction(state, nextTokens);
				}

				const nextState = state.slice();
				nextState.push(action);

				const nextStateStr = nextState.map((t) => t.value).join("");
				const dist = await this.tester.testAll(nextStateStr, false);
				numTestbedCalls += 1;
				const wins = dist.getNumberOfSuccesses();
				this.setNewQValue(state, action, wins);

				/*
				 * Update best
				 */
				if (wins >= bestWins) {
					console.log("[RLRunner] Found new best: ", wins, ">=", bestWins);
					bestWins = wins;
					bestPayload = nextState;
					bestOutput = dist;
				}

				if (numTestbedCalls % this.runConfig.saveFrequency === 0) {
					if (bestPayload !== undefined) {
						this.writeRLRunToFile(i, bestOutput, bestPayload, this.qtable, numTestbedCalls);
					} else {
						console.warn("[RLRunner]: Iteration (" + i + "): Warning 'bestPayload' undefined!");
					}
				}
			}

			explorationProba = Math.max(this.minExplorationProba, explorationProba * this.explorationDecay);

			if (bestPayload !== undefined) {
				this.writeRLRunToFile(i, bestOutput, bestPayload, this.qtable, numTestbedCalls);
			} else {
				console.warn("[RLRunner]: Iteration (" + i + "): Warning 'bestPayload' undefined!");
			}
		}

		if (bestPayload === undefined) {
			return [];
		}

		this.writeRLRunToFile("final", bestOutput, bestPayload, this.qtable, numTestbedCalls);

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

	setNewQValue(payload: Token[], action: Token, reward: number) {
		const state = payload.slice();
		const nextState = state.slice();
		nextState.push(action);

		const nextActions = action.getNextTokens();
		const q_estimate = Math.max(...nextActions.map((nextAction) => {
			const probeState = nextState.slice();
			probeState.push(nextAction);
			return this.qtable.getState(probeState);
		}));

		const q_now = this.qtable.getState(state);

		const now = (1 - this.lr) * q_now;
		const next = this.lr * (reward + this.discount * q_estimate);

		this.qtable.setState(nextState, now + next);
	}

	getBestAction(payload: Token[], actions: Token[]) {
		let highestValue = 0;
		let highestAction = actions[0];

		for (let i = 0; i < actions.length; i++) {
			const nextState = payload.slice();
			nextState.push(actions[i]);
			const value = this.qtable.getState(nextState);

			if (value > highestValue) {
				highestValue = value;
				highestAction = actions[i];
			}
		}

		return highestAction;
	}

	private writeRLRunToFile(nr: number | "final", scores: Distribution | undefined, payload: Token[], qtable: QTable, numTestbedCalls: number | undefined = undefined) {
		if (scores === undefined || payload.length === 0) {
			return;
		}

		let idx = nr.toString().padStart(10, "0");
		if (numTestbedCalls !== undefined) {
			idx += "-" + numTestbedCalls.toString().padStart(6, "0");
		}
		let outputPath = path.join(this.dirs.subDirs.bestOutputDir, "bestOutput-" + idx);
		console.log("writeRLRunToFile", outputPath);

		const qtableStr = (this.logQTable) ? JSON.stringify(qtable.qtable) : "";

		const output: FileFormat.RLRun = {
			"score": scores.getNumberOfSuccesses(),
			output: {
				"timestamp": new Date().toISOString(),
				"tokens": payload.map((t) => t.value),
				"payload": payload.map((t) => t.value).join(""),
				"scores": scores.toString(),
				"wins": sum(scores.toArray()),
				"qtable": qtableStr,
				"num_testbed_calls": numTestbedCalls
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
