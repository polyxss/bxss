import { argmax } from "../mathutil";
import { MCTS, MCTSNode, SimulationOutput, SimulationPolicy } from "./interfaces";

/**
 * N: NodeType
 * R: Type of EvaluationResult
 */
export class MonteCarloTreeSearch<N extends MCTSNode<N, R>, R> implements MCTS<N, R> {
	rng: any;
	root: N;
	explorationParam?: number;
	simulationPolicy: SimulationPolicy<N, R>;
	isRandomRunner?: boolean;

	constructor(rng: any, root: N, simulationPolicy: SimulationPolicy<N, R>, explorationParam?: number, isRandomRunner?: boolean) {
		this.rng = rng;
		this.root = root;
		this.simulationPolicy = simulationPolicy;
		this.explorationParam = explorationParam;
		this.isRandomRunner = isRandomRunner === true;
	}

	async runStep(entry?: N): Promise<SimulationOutput<N, R>> {
		const node = entry ?? this.root;
		const leaf = this.select(node); // TODO: add tree policy
		leaf.expand();
		const output: SimulationOutput<N, R> = await this.simulate(leaf, this.isRandomRunner);
		this.backpropagate(leaf, output);
		return output;
	}

	chooseBest(entry: N | undefined = undefined) {
		// TODO: Use better policy (i.e. choose according to highest score)
		const node = entry || this.root;

		const children = node.getChildren();
		const scores = children.map((child) => {
			return child.getWins() / child.getVisits();
		});

		const index = argmax(scores)
		return children[index];
	}

	private select(node: N): N {
		while (true) {
			if (!node.isExplored()) {
				return node;
			}

			if (node.isTerminal()) {
				return node;
			}

			const children = node.getChildren();
			const unexplored = children.filter((child) => !child.isExplored());

			if (unexplored.length > 0) {
				const index = Math.floor(this.rng() * unexplored.length);
				return unexplored[index];
			}

			node = this.uct_select(node);
		}
	}

	private async simulate(entry: N, isRandomRunner=false): Promise<SimulationOutput<N, R>> {
		const node = this.simulationPolicy.simulate(entry, isRandomRunner);
		const scores = await node.evaluateOnGame();

		return {
			entryNode: entry,
			lastNode: node,
			scores: scores
		};
	}

	private backpropagate(node: N, output: SimulationOutput<N, R>): void {
		let current: N | undefined = node;
		do {
			current.update(output);
			current = current.getParent();
		} while (current !== undefined);
	}

	private uct_select(node: N): N {
		const log_n = Math.log(node.getVisits());
		const children = node.getChildren();

		const explorationParam = this.explorationParam;
		console.assert(children.every((node) => node.isExpanded()), "uct_select failed");

		if (explorationParam === undefined) {
			// Do a random walk
			return children[Math.floor(Math.random() * children.length)];
		}

		let calcUCB = (child: N) => {
			const exploitation = child.getWins() / child.getVisits();
			const exploration = Math.sqrt(log_n / child.getVisits());
			return exploitation + explorationParam * exploration;
		}

		const scores = children.map(calcUCB);
		const index = argmax(scores);
		return children[index];
	}
}
