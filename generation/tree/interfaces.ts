/**
 * N: NodeType
 * R: Type of EvaluationResult
 */
export interface MCTS<N extends MCTSNode<N, R>, R> {
	runStep(node?: N): void;
	chooseBest(): N;
}

export interface MCTSNode<N extends MCTSNode<N, R>, R> {
	getIds(): number[];

	getParent(): N | undefined;
	simulateChild(): N;
	
	getChildren(): N[];
	
	isTerminal(): boolean;
	isExplored(): boolean;
	isExpanded(): boolean;
	
	getVisits(): number;
	getWins(): number;
	
	expand(): void;
	evaluateOnGame(): Promise<R>;
	update(output: SimulationOutput<N, R>): void;
	removeFromTree(): void;
}

export interface SimulationPolicy<N extends MCTSNode<N, R>, R> {
	simulate(node: N, isRandomRunner?: boolean): N;
}

export interface SimulationOutput<N extends MCTSNode<N, R>, R> {
	entryNode: N;
	lastNode: N;
	scores: R;
}
