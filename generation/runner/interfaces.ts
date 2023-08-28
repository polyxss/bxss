import { TOKEN_TYPES } from "../tree/tokens";
import { XSSTerminalCondition, XSSWinCalculation } from "../tree/xssnode";
import { RunnerType } from "./runnermanager";

export interface LogDirs {
	treeDir: string,
	bestOutputDir: string
}

export interface RunConfig {
	maxGenerationTries: number;
	maxRootDepth: number;
	simulationsPerAction: number | "infinite";
	saveFrequency: number;
	maxPayloadLength: number;
	tokenType: keyof typeof TOKEN_TYPES;
	terminalCondition: keyof typeof XSSTerminalCondition;
	winCalculation: keyof typeof XSSWinCalculation;
	randomSeed: string;
	runnerType: keyof typeof RunnerType;
	rlGreedyTestbedCallBudget: number | "infinite";
	explorationParam: number;
}

export interface RunnerDirectories {
	subDirs: LogDirs;
	tryDir: string;
	runDir: string;
}
