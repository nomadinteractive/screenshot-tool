## Screenshot CLI Tool

Screenshot automation tool using puppeteer. Pupetteer uses headless chrome for page rendering and screenshot taking purposes.

### Installation

```npm install -g @nomadinteractive/screenshot-tool```

### Configuration

Create pages.js with defining the pages you want to take screenshots of like:

```
module.exports = [
	{ name: "Google", url: "https://google.com" },
	{ name: "Wordpress", url: "https://wordpress.org/" },
];
```

and list of resolutions.js you want for the pages to be captured. The module should export either a simple array or a constructor method with accepting the pupeteer instance as single parameter and return the list of resolutions. Example:

```
module.exports = (puppeteer) => [
	{ name: 'Desktop', width: 1600, height: 0 },
	{ name: 'Mobile', emulate: puppeteer.devices['iPhone X'] }
];
```


### Running

Run ```ss``` in the folder you have pages.js and resolutions.js.

#### Parameters

```
--pages custom-page-list.js
```
Default: pages.js

```
--resolutions custom-screen-sizes.js
```
Default: resolutions.js

