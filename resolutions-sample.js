module.exports = (puppeteer) => [
	{ name: 'Desktop', width: 1600, height: 0 },
	{ name: 'Mobile', emulate: puppeteer.devices['iPhone X'] }
];
