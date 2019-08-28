const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const showBrowserWindow = false;
const browserWindowWidth = 1200;
const browserWindowHeight = 1000;

const pages = [
	{ name: "1-Homepage", url: "https://h2oo.org" },
	{ name: "2-FoundingStory", url: "https://h2oo.org/founding-story" },
	{ name: "3-HeirLeadership", url: "https://h2oo.org/heir-leadership" },
	{ name: "4-AdvisoryCouncil", url: "https://h2oo.org/advisory-council" },
	{ name: "5-VolunteerStaff", url: "https://h2oo.org/volunteer-staff" },
	{ name: "6-VisionMissionPillars", url: "https://h2oo.org/vision-mission-and-pillars" },
	{ name: "7-Action", url: "https://h2oo.org/action" },
	{ name: "8-Seal", url: "https://h2oo.org/seal" },
	{ name: "9-Blog", url: "https://h2oo.org/blog" },
	{ name: "10-2018Newsletter", url: "https://h2oo.org/h2oo-2018-newsletter" },
	{ name: "11-Videos", url: "https://h2oo.org/videos" },
	{ name: "12-Poetry", url: "https://h2oo.org/poetry" },
	{ name: "13-ResearchWritings", url: "https://h2oo.org/research-writing" },
	{ name: "14-Volunteer", url: "https://h2oo.org/volunteer" },
	{ name: "15-BeAnHeir", url: "https://h2oo.org/be-an-heir" },
	{ name: "16-RequestUs", url: "https://h2oo.org/request-us" },
	{ name: "17-ContactUs", url: "https://h2oo.org/contact-us" },
];

const resolutions = [
	{ name: '1-Desktop', width: 1600, height: 0 },
	{ name: '2-TabletLand', emulate: puppeteer.devices['iPad landscape'] },
	{ name: '3-TabletPort', emulate: puppeteer.devices['iPad'] },
	{ name: '4-Mobile', emulate: puppeteer.devices['iPhone X'] }
];

let page = {};
let resolution = {};

let sessionId = (new Date()).toISOString().substr(0,19).replace(/\:/g, '');
if (process.argv.slice(2).length > 0) sessionId += "-" + process.argv.slice(2)[0];
const sessionDir = path.join(__dirname, 'screenshots', sessionId);
if (!fs.existsSync(sessionDir)){ fs.mkdirSync(sessionDir, { recursive: true }); }
console.log("\n@@@  Screenshot Session Name " + sessionId + "\n@@@  (Path: " + sessionDir + ")\n");


(async () => {

	const browser = await puppeteer.launch({
		headless: (!showBrowserWindow),
		args: [
			"--disable-infobars",
			// only for visible browser window sessions - ignored for headless
			"--window-size=" + browserWindowWidth + "," + browserWindowHeight
		]
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
						height: (resolution.height ? resolution.height : browserWindowHeight)
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
