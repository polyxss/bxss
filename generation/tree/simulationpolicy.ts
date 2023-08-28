import { Distribution } from "../distribution";
import { SimulationPolicy } from "./interfaces";
import { XSSTreeNode } from "./xssnode";

export class XSSSimulationPolicy implements SimulationPolicy<XSSTreeNode, Distribution> {
	numberOfCandidates: number;

	constructor(numberOfCandidates: number) {
		this.numberOfCandidates = numberOfCandidates;
	}

	simulate(entry: XSSTreeNode, isRandomRunner?: boolean) {
		const candidates = [];

		console.assert(this.numberOfCandidates > 0, "Assertion failed: numberOfCandidates < 1");

		if (isRandomRunner === true) {
			let node = entry;
			while (!node.isTerminal()) {
				node = node.simulateChild();
			}
			return node;
		}

		for (let i = 0; i < this.numberOfCandidates; i++) {
			let node = entry;

			while (!node.isTerminal()) {
				node = node.simulateChild();
			}

			try {
				new Function(node.getPayload());  // validate if correct javascript
				return node;
			} catch (e) {
				candidates.push(node);
			}
		}

		return candidates[Math.floor(Math.random() * candidates.length)];
	}
}
