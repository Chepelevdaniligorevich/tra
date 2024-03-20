//google sheets
const creds = require("/Users/a1/Documents/travbot/credentials.json");

const SPREADSHEET_ID = "1-Yz2Tp8ZBcfjz8aKlbkhlyJQPPyCJYML6ErSYvtauB0";
const SHEET_NAME = "try91";

//main
const systemBrowserYLength = 0;
const systemBrowserXLength = 0;
const mouseDelay = 200;
const chromePath =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const chromeArg = [
  "--remote-debugging-port=9223",
  // "--user-data-dir=$(mktemp -d)",
  "--no-first-run",
  "--no-default-browser-check",
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage",
  "--disable-accelerated-2d-canvas",
  "--no-zygote",
  "--disable-gpu",
  "--kiosk",
  // "--start-fullscreen",
];

const screenChromeWidth = 1920;
const screenChromeHeight = 1080;

//account
const server = "https://ts8.x1.america.travian.com/";
const login = "";
const password = "";

//SELECTORS
//login page
const loginPageNameSelector =
  "#loginForm > tbody > tr.account > td:nth-child(2) > input";
const loginPagePasswordSelector =
  "#loginForm > tbody > tr.pass > td:nth-child(2) > input";
const loginScreenLoginButtonSelector = ".loginButtonRow button";
//village
const linkTwoBuildingSelector = ".buildingView";
const linkTwoResourceSelector = ".resourceView";
const linkTwoRallyPointSelector = ".a39";
const linkToRandomCropField = ".buildingSlot9";
//rally point
const linkTwoRallyPointStartButtonSelector =
  ".textButtonV2.buttonFramed.startFarmList.rectangle.withText.green";

module.exports = {
  linkTwoResourceSelector,
  systemBrowserYLength,
  mouseDelay,
  server,
  login,
  password,
  loginPageNameSelector,
  loginPagePasswordSelector,
  loginScreenLoginButtonSelector,
  linkTwoBuildingSelector,
  linkTwoRallyPointSelector,
  linkTwoRallyPointStartButtonSelector,
  chromeArg,
  chromePath,
  systemBrowserXLength,
  screenChromeWidth,
  screenChromeHeight,
  linkToRandomCropField,
  creds,
  SPREADSHEET_ID,
  SHEET_NAME,
};
