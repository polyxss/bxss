import { Distribution } from "../distribution";
import { Tester } from "../tester/tester";
import { MonteCarloTreeSearch } from "../tree/mcts";
import { XSSSimulationPolicy } from "../tree/simulationpolicy";
import { Token, TokenProvider, TOKEN_TYPES } from "../tree/tokens";
import { XSSSimulation, XSSTerminalCondition, XSSTreeNode, XSSWinCalculation } from "../tree/xssnode";
import { RunConfig, RunnerDirectories } from "./interfaces";
import { BaseRunner } from "./baserunner";
import { FileFormat } from "../logging";
import { sum } from "../mathutil";

import path from "path";
import fs from "fs";

export class MctsRunner extends BaseRunner {
	readonly runConfig: RunConfig;
	readonly tester: Tester;
	readonly dirs: RunnerDirectories;
	readonly rng: any;

	readonly tries: number;
	readonly explorationParam: number | undefined;
	readonly tag: string;

	constructor(runConfig: RunConfig,
		tester: Tester,
		dirs: RunnerDirectories,
		tries: number,
		explorationParam: number | undefined,
		tag: string,
		rng: any,
	) {
		super();

		this.runConfig = runConfig;
		this.tester = tester;
		this.dirs = dirs;
		this.rng = rng;

		this.tries = tries;
		this.explorationParam = explorationParam;
		this.tag = tag;
	}

	async run() {
		const polyglots: string[] = [];

		this.createDirectories(this.dirs.subDirs, this.dirs.tryDir);

		const bestRun = await this.executeFullMCTS(this.runConfig, this.explorationParam);

		if (bestRun === undefined) {
			// TODO: Throw?
			return [];
		}

		const payload = bestRun.lastNode.getPayload();

		const testDistribution: Distribution = await this.tester.testAll(payload, false);
		const successes = testDistribution.getSuccessfulTests();

		console.assert(
			successes.size >= bestRun.scores.getNumberOfSuccesses(),
			"Assertion failed: Less success on full test set"
		);

		if (bestRun.scores.getNumberOfSuccesses() > 0) {
			this.tester.disableTests(successes);
			polyglots.push(payload);
		}

		return polyglots;
	}

	private async executeFullMCTS(runConfig: RunConfig, explorationParam?: number) {
		let bestRunWins = 0;
		let bestRun: XSSSimulation | undefined = undefined;

		const type = TOKEN_TYPES[runConfig.tokenType];
		if (type === undefined) {
			throw "Token type is undefined";
		}

		const tokenFactory = new TokenProvider(type);
		const tokens = tokenFactory.getTokens();

		const startToken = new Token(0, "");
		startToken.setNextTokens(tokens);

		const nodeOptions = {
			terminalCondition: XSSTerminalCondition[runConfig.terminalCondition],
			winCalculation: XSSWinCalculation[runConfig.winCalculation]
		};

		if (nodeOptions.terminalCondition === undefined) {
			throw "Terminal condition is undefined";
		}

		if (nodeOptions.winCalculation === undefined) {
			throw "Win calculation is undefined";
		}

		let bestRoot = new XSSTreeNode(
			this.rng,
			startToken,
			runConfig.maxPayloadLength,
			this.tester,
			nodeOptions,
			undefined
		);

		const polyglotName = path.join(path.dirname(path.dirname(this.dirs.tryDir)));

		const keepSimulating = (runConfig.simulationsPerAction === "infinite") ? keepSimulatingInfinite : keepSimulatingFinite;
		const depthMultiplier = (runConfig.simulationsPerAction === "infinite") ? 0 : runConfig.simulationsPerAction;

		for (let depth = 0; depth < runConfig.maxRootDepth; depth++) {
			const mcts = new MonteCarloTreeSearch<XSSTreeNode, Distribution>(
				this.rng,
				bestRoot,
				new XSSSimulationPolicy(1000),
				explorationParam
			);

			for (let simulation = 0; keepSimulating(simulation, runConfig.simulationsPerAction); simulation++) {
				const run = await mcts.runStep();
				const wins = run.scores.getNumberOfSuccesses();

				/*
				 * Update current best
				 */
				if (isNewBest(wins, bestRunWins) || bestRun == undefined) {
					console.log("[TreeRunner] Found new best: ", wins, ">=", bestRunWins);
					bestRunWins = wins;
					bestRun = run;
				}

				/*
				 * Update root
				 */
				console.assert(bestRoot.winDistribution.length() === run.scores.length());
				bestRoot.winDistribution = run.scores.addTo(bestRoot.winDistribution);

				/*
				 * Logging (console, file, telegram)
				 */
				if (simulation % runConfig.saveFrequency === 0) {
					console.log("depth:", depth, "| simulation:", simulation, "| bestRunWins:", bestRunWins);
					this.writeMCTSRunToFile(simulation + depth * depthMultiplier, bestRun);
				}
			}

			bestRoot = mcts.chooseBest(bestRoot);
			bestRoot.removeFromTree();
		}

		/*
		 * Save final best run in PolyDB and file
		 */
		if (bestRun !== undefined) {
			this.writeMCTSRunToFile("final", bestRun);
		}

		return bestRun;
	}

	writeMCTSRunToFile(simulation: number | string, runOutput?: XSSSimulation) {
		if (runOutput === undefined) {
			console.error("runOutput is undefined, no file written.");
			return;
		}

		const scores = runOutput.scores;
		const output: FileFormat.MCTSRun = {
			score: runOutput.scores.getNumberOfSuccesses(),
			output: {
				"timestamp": new Date().toISOString(),
				"entryNode": runOutput.entryNode.getIds().join(","),
				"lastNode": runOutput.lastNode.getIds().join(","),
				"payload": runOutput.lastNode.getPayload(),
				"scores": scores.toString(),
				"wins": sum(scores.toArray())
			}
		};

		const data = JSON.stringify(output, null, "\t");
		fs.writeFile(path.join(this.dirs.subDirs.bestOutputDir, "bestOutput-" + simulation.toString().padStart(10, "0")), data, (err) => {
			if (err) {
				console.error(err);
			}
		});
	}
}

function keepSimulatingFinite(simulation: number, simulationsPerAction: number | "infinite") {
	return simulation < (simulationsPerAction as number);
}

function keepSimulatingInfinite(simulation: number, simulationsPerAction: number | "infinite") {
	return true;
}

function isNewBest(wins: number, currentBest: number) {
	return wins > 0 && wins >= currentBest;
}
