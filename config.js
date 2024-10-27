//main
const systemBrowserYLength = 0;
const systemBrowserXLength = 0;
const mouseDelay = 100;
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
const server = "https://ts1.x1.international.travian.com";
const login = "v8303036@gmail.com";
const password = "Q!Q@q3q4";

//SELECTORS
//login page
const loginPageNameSelector =
    "#dialogContent > div > label.input > input[type=text]";
const loginPagePasswordSelector =
    "#dialogContent > div > label:nth-child(2) > input[type=password]";
const loginScreenLoginButtonSelector =
    "#dialogContent > div > div.centeredText > button > div";
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
};
