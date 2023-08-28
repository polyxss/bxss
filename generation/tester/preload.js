//Fix Puppeteer's handling of RegExp
let originalLog = console.log;
console.log = function(value) {
	if (typeof value == "object") {
		value = value.toString();
	}
	originalLog(value);
}
