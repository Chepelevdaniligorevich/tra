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
const minDelay = 1000;
const maxDelay = 3000;

const screenChromeWidth = 1920;
const screenChromeHeight = 1080;

//account
const server = "https://ts7.x1.asia.travian.com/";
const login = "farmboy";
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
const linkTwoRallyPointSelector = ".a39";
//rally point
const linkTwoRallyPointStartButtonSelector =
  ".textButtonV2.buttonFramed.startFarmList.rectangle.withText.green";

module.exports = {
  minDelay,
  maxDelay,
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
};
