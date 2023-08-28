import cli from 'commander';
import os = require("os");

import {TOKEN_TYPES} from "./tree/tokens";
import {XSSTerminalCondition, XSSWinCalculation} from "./tree/xssnode";
import {RunnerManager, RunnerType} from "./runner/runnermanager";
import {LocalTesterFactory} from "./tester/tester";
import {RunConfig} from "./runner/interfaces";

async function main() {
	const program = new cli.Command();
	program.description("A CLI to generate XSS polyglots");
	program
		.option("--maxGenerationTries <tries>", "Defines how often to attempt generating polyglots from a new tree", "10")
		.option("--maxRootDepth <depth>", "Defines the maximum depth of the start-'root' node, i.e. how many 'moves' we play per tree", "12")
		.option("--simulationsPerAction <amount or 'infinite'>", "Defines how many simulations are done from each start-'root' node", "infinite")
		.option("--saveFrequency <frequency>", "Defines after how many simulations the tree's state is saved", "50")
		.option("--tokenType <type>", "Defines the type of tokens defined in token.ts", "XSS_TOKENS")
		.option("--terminalCondition <type>", "Defines the terminal condition for the MCTS node", "STRING_LENGTH")
		.option("--maxPayloadLength <length>", "Define the maximum payload length", "400")
		.option("--winCalculation <type>", "Defines the win calculation for the UCB score", "WIN_SUM")
		.option("--randomSeed <seed>", "Seed for the random number generator", "0")
		.option("--runnerType <type>", "Which kind of runner to run", "MCTS")
		.option("--rlGreedyBudget <amount or 'infinite'>", "Testbed call budget for RL or Greedy", "infinite")
		.option("--explorationParam <amount>", "(MCTS only) Exploration parameter in the UCB formular", String(Math.sqrt(2)));
	program.parse(process.argv);

	const options = program.opts();

	if (options.randomSeed === "0") {
		options.randomSeed = String(Math.random())
	}

	const simulationsPerAction = options.simulationsPerAction === "infinite" ? "infinite" : +options.simulationsPerAction;
	const rlGreedyTestbedCallBudget = options.rlGreedyBudget === "infinite" ? "infinite" : +options.rlGreedyBudget;

	const config: RunConfig = {
		maxGenerationTries: +options.maxGenerationTries as number,
		maxRootDepth: +options.maxRootDepth as number,
		simulationsPerAction: simulationsPerAction,
		saveFrequency: +options.saveFrequency as number,
		maxPayloadLength: +options.maxPayloadLength as number,
		tokenType: options.tokenType as keyof typeof TOKEN_TYPES,
		terminalCondition: options.terminalCondition as keyof typeof XSSTerminalCondition,
		winCalculation: options.winCalculation as keyof typeof XSSWinCalculation,
		randomSeed: options.randomSeed as string,
		runnerType: options.runnerType as keyof typeof RunnerType,
		rlGreedyTestbedCallBudget: rlGreedyTestbedCallBudget,
		explorationParam: +options.explorationParam
	};

	let host = "";
	try {
		host = os.hostname() + " ";
	} catch (e) {}

	if (!process.env.RUN_IDENTIFIER || process.env.RUN_IDENTIFIER.length < 1) {
		console.log("Please provide a RUN_IDENTIFIER environment variable!");
		return;
	}

	const runner = new RunnerManager(config);
	const testerFactory = new LocalTesterFactory();

	runner.run(testerFactory).then(async () => {
		console.log("Program finished");
		process.exit(0);
	});
}

main().then(() => {
	console.log("main.ts process running")
});
