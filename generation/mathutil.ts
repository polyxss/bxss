export function argmax(arr: any[]) {
	console.assert(arr.length > 0);
	let max = arr[0];
	let arg_max = 0;

	arr.forEach((score, i) => {
		if (score > max) {
			max = score;
			arg_max = i;
		}
	});

	return arg_max;
}

export function entropy(vector: number[]) {
	console.assert(vector.length > 0);

	// normalize
	let x = normalize(vector);
	return -sum(x.filter(v => v !== 0).map((v) => v * Math.log(v)));
}

export function softmax(x: number[]) {
	console.assert(x.length > 0);
	return stableSoftmax(x);
}

export function stableSoftmax(x: number[]) {
	console.assert(x.length > 0);
	let max_x = max(x);
	let z = x.map((v) => v-max_x);

	let numerator = exp(z);
	let denominator = sum(numerator);
	let softmax = numerator.map((v) => v / denominator);

	return softmax;
}

export function add(x: number[], y: number[]) {
	console.assert(x.length === y.length);
	return x.map((_, i) => x[i] + y[i]);
}

export function scale(x: number[], y: number) {
	return x.map((x_) => x_ * y);
}

export function sum(x: number[]) {
	return x.reduce((a,b) => a+b, 0);
}

export function max(x: number[]) {
	console.assert(x.length > 0);
	return x.reduce((a,b) => Math.max(a,b), x[0]);
}

export function exp(x: number[]) {
	return x.map((v) => Math.exp(v));
}

export function dot(x: number[], y: number[]) {
	console.assert(x.length === y.length);
	return sum(x.map((_, i) => x[i] * y[i]));
}

export function l2(x: number[]) {
	return Math.sqrt(dot(x, x));
}

export function cosineSimilarity(x: number[], y: number[]) {
	console.assert(x.length === y.length);
	return dot(x, y) / (l2(x) * l2(y))
}

export function normalize(x: number[]) {
	console.assert(x.length > 0);
	let s = sum(x);
	return x.map((v) => v/s);
}