// testSetup.js
//* I know i should use import, but this is a workaround for now
//* For now i mean it's going to prod :))
//eslint-disable-next-line @typescript-eslint/no-require-imports
const { JSDOM } = require("jsdom");

const dom = new JSDOM();
global.document = dom.window.document;
global.window = dom.window;
global.location = dom.window.location;
