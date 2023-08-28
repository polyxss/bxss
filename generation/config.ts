const url = process.env.REMOTE_SCRIPT_URL ?? "http://localhost:8080/xss.js"; // enter URL to a JavaScript file if the payloads use import()

export const config = {
	exploit_url: url,
	timeout: 2000,
	gfr_tester_url: process.env.FIRING_RANGE_URL ?? "http://localhost:8080",
	local_tester_url: process.env.TESTBED_URL ?? "http://localhost:8080",
	maxConcurrency: 4
}
