import { Tester } from "../tester/tester";
import { Token } from "./tokens";
import { Distribution } from "../distribution";
import { MCTSNode, SimulationOutput } from "./interfaces";

export enum XSSTerminalCondition {
	TOKEN_LENGTH, STRING_LENGTH
}

export enum XSSWinCalculation {
	WIN_SUM,
	WIN_DIST_ENTROPY,
	WIN_DIST_COSSIM
}

export interface XSSNodeOptions {
	terminalCondition: XSSTerminalCondition;
	winCalculation: XSSWinCalculation;
}

export type XSSSimulation = SimulationOutput<XSSTreeNode, Distribution>;

export class XSSTreeNode implements MCTSNode<XSSTreeNode, Distribution> {
	parent?: XSSTreeNode;
	children?: XSSTreeNode[];

	visits = 0;
	winDistribution: Distribution;

	rng: any;
	token: Token;
	maxPayloadLength: number;
	tester: Tester;
	optionsXSSNodeOptions: XSSNodeOptions;

	constructor(
		rng: any,
		token: Token,
		maxPayloadLength: number,
		tester: Tester,
		optionsXSSNodeOptions: XSSNodeOptions,
		parent: XSSTreeNode | undefined = undefined
	) {
		this.rng = rng;
		this.token = token;
		this.maxPayloadLength = maxPayloadLength;
		this.parent = parent;
		
		this.tester = tester;

		this.winDistribution = this.tester.createEmptyDistribution();

		this.optionsXSSNodeOptions = optionsXSSNodeOptions;
	}

	getIds() {
		let ids = [this.token.id];

		let parent = this.getParent();
		while (parent !== undefined) {
			ids.unshift(parent.token.id);
			parent = parent.getParent();
		}

		return ids;
	}
	
	getParent() {
		return this.parent;
	}

	simulateChild() {
		// TODO: Add simulation policy
		const tokens = this.token.getNextTokens();
		const index = Math.floor(this.rng() * tokens.length);
		const randomToken = tokens[index];

		return new XSSTreeNode(
			this.rng,
			randomToken,
			this.maxPayloadLength,
			this.tester,
			this.optionsXSSNodeOptions,
			this
		);
	}

	getChildren() {
		console.assert(this.isExpanded(), `getChildren failed; you need to call expand() first`);
		return this.children as XSSTreeNode[];
	}

	isTerminal(): boolean {
		const terminalCondition = this.optionsXSSNodeOptions.terminalCondition;

		switch(terminalCondition) {
			case XSSTerminalCondition.STRING_LENGTH:
				return this.getPayload().length >= this.maxPayloadLength;
			case XSSTerminalCondition.TOKEN_LENGTH:
				let numTokens = 0;
				let parent = this.getParent();
		
				while (parent !== undefined) {
					numTokens++;
					parent = parent.getParent();
				}	
				return (numTokens >= this.maxPayloadLength);
			default:
				throw `${terminalCondition} not a valid terminal condition option`;
		}
	}

	isExplored() {
		return this.visits > 0;
	}

	isExpanded() {
		return this.children !== undefined;
	}

	getVisits(): number {
		return this.visits;
	}
	
	getWins(): number {
		const explored = this.isExplored();
		const winCalculation = this.optionsXSSNodeOptions.winCalculation;
		const globalWinDistribution = this.getGlobalDistribution();
		const winDistribution = this.winDistribution;
		
		let output = 0;
		switch (winCalculation) {
			case XSSWinCalculation.WIN_SUM:
				output = winDistribution.winSum();
				break;
			case XSSWinCalculation.WIN_DIST_ENTROPY:
				output = winDistribution.winDistEntropy(globalWinDistribution, explored);
				break;
			case XSSWinCalculation.WIN_DIST_COSSIM:
				output = winDistribution.winDistCossim(globalWinDistribution);
				break;
			default:
				throw `${winCalculation} is not a valid win calculation option`
		}

		return output;
	}

	expand(): void {
		if (this.isExpanded()) {
			return;
		}

		this.children = this.token.getNextTokens().map((token) => {
			return new XSSTreeNode(
				this.rng,
				token,
				this.maxPayloadLength,
				this.tester,
				this.optionsXSSNodeOptions,
				this
			);
 		});
	}

	async evaluateOnGame() {
		return await this.tester.testAll(this.getPayload(), false);
	}

	update(output: XSSSimulation) {
		console.assert(output.scores.length() === this.winDistribution.length());

		this.winDistribution = output.scores.addTo(this.winDistribution);
		this.visits++;
	}

	removeFromTree() {
		this.parent = undefined;
	}

	private getGlobalDistribution() {
		let globalWinDistribution = this.winDistribution;

		let node = this.parent;
		while (node !== undefined) {
			globalWinDistribution = node.winDistribution
			node = node.parent;
		}

		return globalWinDistribution;
	}

	private getTokenChain(): Token[] {
		const chain = [this.token];
		let parent = this.getParent();

		while (parent !== undefined) {
			chain.unshift(parent.token);
			parent = parent.getParent();
		}

		return chain;
	}

	getPayload(): string {
		return this.getTokenChain().map((token: Token) => token.value).join("");
	}
}