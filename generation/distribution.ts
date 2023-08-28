import {add, cosineSimilarity, entropy, sum} from "./mathutil";
import {symmetricDifference} from "./util";

export type DistributionDict = {[key: string]: DistributionScore};

export interface DistributionScore {
	add(val: DistributionScore): DistributionScore;
	isActive(): boolean;
	value(): 0 | 1;
}

function normalize(val: number): 0 | 1 {
	return val >= 1 ? 1 : 0;
}

export class TestedScore implements DistributionScore {
	val: number

	constructor(value: number) {
		this.val = value;
	}

	add(val: DistributionScore) {
		return new TestedScore(normalize(this.val + val.value()));
	}

	isActive() {
		return true;
	}

	value() {
		return normalize(this.val);
	}
}

export class UntestedScore implements DistributionScore {
	add(val: DistributionScore) {
		console.assert(!val.isActive() && val.value() === 0, "UntestedScore added to TestedScore");
		return this;
	}

	isActive() {
		return false;
	}

	value() {
		return normalize(0);
	}
}

export class Distribution {
	scores: DistributionDict;
	order: string[];

	constructor(scores: DistributionDict, order: string[]) {
		this.scores = scores;
		this.order = order;
	}

	isCompatible(dist: Distribution) {
		if (this.length() !== dist.length()) {
			return false;
		}

		let ourKeys = new Set(this.getAllTestNames());
		let theirKeys = new Set(dist.getAllTestNames());
		let diff = symmetricDifference(ourKeys, theirKeys);

		return diff.size === 0;
	}

	addTo(dist: Distribution): Distribution {
		console.assert(this.isCompatible(dist), "Distribution not compatible");

		let newDist: DistributionDict = {}
		this.getAllTestNames().forEach((key) => {
			newDist[key] = this.scores[key].add(dist.scores[key]);
		})

		return new Distribution(newDist, this.order);
	}

	getAllTestNames() {
		return Object.keys(this.scores);
	}

	getSuccessfulTests() {
		return new Set(Object.keys(this.scores).filter((key) => this.scores[key].value() > 0));
	}

	length() {
		return sum(Object.values(this.scores).map((score) => score.isActive() ? 1 : 0));
	}

	getNumberOfSuccesses() {
		return this.getSuccessfulTests().size;
	}

	getResults() {
		return Object.fromEntries(this.order.filter((testName) => {
			return this.scores[testName].isActive()
		}).map((testName) => {
			return [testName, this.scores[testName].value()];
		}));
	}

	winSum() {
		let values = Object.values(this.scores).map((score) => score.value());
		return sum(values) / this.length();
	}

	winDistEntropy(dist: Distribution, explored: boolean) {
		console.assert(this.isCompatible(dist), "Distribution not compatible");

		let keys = this.getAllTestNames();
		let values = keys.map((key) => this.scores[key].value());

		if (sum(values) === 0) {
			if (explored) {
				return 0;
			} else {
				return Math.log(this.length());
			}
		}

		let globalValues = keys.map((key) => dist.scores[key].value());

		return entropy(add(globalValues, values));
	}

	winDistCossim(dist: Distribution) {
		console.assert(this.isCompatible(dist), "Distribution not compatible");

		let keys = this.getAllTestNames();
		let values = keys.map((key) => this.scores[key].value());
		let globalValues = keys.map((key) => dist.scores[key].value());

		if (sum(values) > 0 && sum(globalValues) > 0) {
			return Math.abs(cosineSimilarity(values, globalValues));
		}

		return 0;
	}

	toArray(): (0 | 1)[] {
		return this.order.map((key) => this.scores[key].value());
	}

	toString(): string {
		return "[" + this.order.map((key) => this.scores[key].isActive() ? this.scores[key].value() : "x")
			.join(",") + "]";
	}
}
