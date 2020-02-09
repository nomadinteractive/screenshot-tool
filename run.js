#!/usr/bin/env node

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

let rootPath = process.argv[2] || './'
rootPath = rootPath.replace(/^\/+|\/+$/g, '')
rootPath = path.join(process.cwd(), rootPath)
// console.log(rootPath)

pageFilePath = path.join(rootPath, '/', 'pages.js')
resolutionsFilePath = path.join(rootPath, '/', 'resolutions.js')

const pages = require(pageFilePath);
const resolutions = require(resolutionsFilePath);

let page = {};
let resolution = {};

let sessionId = (new Date()).toISOString().substr(0,19).replace(/\:/g, '');
if (process.argv.slice(2).length > 0) sessionId += "-" + process.argv.slice(2)[0];
const sessionDir = path.join(__dirname, 'screenshots', sessionId);
if (!fs.existsSync(sessionDir)){ fs.mkdirSync(sessionDir, { recursive: true }); }
console.log("\n@@@  Screenshot Session Name " + sessionId + "\n@@@  (Path: " + sessionDir + ")\n");


(async () => {

	const browser = await puppeteer.launch({
		headless: true
	});

	for (i in pages) {
		if (typeof pages[i] === 'string') {
			page = {
				url: pages[i],
				name: pages[i].substr(pages[i].indexOf('://') + 3)
					.replace(/[^A-Z0-9]/gi, '-')
					.replace(/-+/gi, '-')
					.replace(/^[-]+|[-]+$/g, '')
			}
		}
		else {
			page = pages[i];
		}

		console.log("\n########  Taking screenshots of " + page.name + " (" + page.url + ")  ########");

		for (j in resolutions) {
			resolution = resolutions[j];

			console.log("\t---->  Resolution " + resolution.name + "  <-----");

			try {
				const browserPage = await browser.newPage();

				if (typeof resolution['emulate'] !== 'undfined' && resolution['emulate']) {
					await browserPage.emulate(resolution.emulate)
				}
				else if (typeof resolution['width'] !== 'undfined' && resolution['width']) {
					await browserPage.setViewport({
						width: resolution.width,
						height: (resolution.height ? resolution.height : 0 /* no limit */)
					});
				}

				await browserPage.goto(page.url);

				let waitForLoad = 2000;
				if (typeof page['waitForLoad'] !== 'undefined' && page['waitForLoad']) {
					waitForLoad = page.waitForLoad;
				}
				await browserPage.waitFor(waitForLoad);

				const filename = page.name.replace(/[^A-Z0-9]/gi, '-').replace(/-+/gi, '-')
					+ '-' + resolution.name + '.jpg';
				const filepath = path.join(sessionDir, filename);

				await browserPage.screenshot({
					path: filepath,
					type: 'jpeg',
					quality: 80,
					fullPage: (resolution.emulate || resolution.height === 0)
				});
				console.log("\t\tDONE - Saved to " + filepath);

				await browserPage.close();
			}
			catch (err) {
				console.log("\t\tFAIL: " + err)
			}
		}
	}

	await browser.close();
})();
