import { RunConfig } from "./runner/interfaces";

import fs from 'fs';
import path from "path";

export namespace FileFormat {
	export interface MCTSRun {
		score: number;
		output: {
			timestamp: string,
			entryNode: string;
			lastNode: string;
			payload: string;
			scores: string;
			wins: number;
		}
	}

	export interface RLRun {
		score: number;
		output: {
			timestamp: string,
			tokens: string[];
			qtable: string;
			payload: string;
			scores: string;
			wins: number;
			num_testbed_calls: number | undefined;
		}
	}

	export interface GreedyRun {
		score: number;
		output: {
			timestamp: string,
			tokens: string[];
			payload: string;
			scores: string;
			wins: number;
			num_testbed_calls: number | undefined;
		}
	}

	export interface MetaData {
		runConfig: RunConfig;
		commit: string;
	}

	export interface FinalResult {
		data: {
			"id": number,
			"payload": string
		}[];
	}
}

export async function writeConfigurationToFile(path: string, data: FileFormat.MetaData) {
	let writeData = {
		"runIdentifier": process.env.RUN_IDENTIFIER,
		"timestamp": new Date().toISOString(),
	};
	Object.assign(writeData, data);
	const startConfig = JSON.stringify(writeData, null, "\t");

	fs.writeFileSync(path, startConfig);
}

export function writeFinalResultsToFile(polyglots: string[], summaryDir: string) {
	const output: FileFormat.FinalResult = {
		"data": polyglots.map((polyglot, i) => {
			return {
				"id": i,
				"payload": polyglot
			};
		})
	};

	const finalOutput = JSON.stringify(output, null, "\t");

	fs.mkdirSync(summaryDir);
	fs.writeFileSync(path.join(summaryDir, "final-polyglots"), finalOutput);
}
