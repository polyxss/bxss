import fs from "fs";

import { LogDirs } from "./interfaces";

/**
 * O: SimulationOutput
 */
export abstract class BaseRunner {
	abstract run(): Promise<string[]>;

	protected createDirectories(subDirs: LogDirs, tryDir: string) {
		fs.mkdirSync(tryDir);

		Object.values(subDirs).forEach((dir) => {
			fs.mkdirSync(dir);
		});
	}
}