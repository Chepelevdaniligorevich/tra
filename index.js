const puppeteer = require("puppeteer-extra");
const puppeteerStealth = require("puppeteer-extra-plugin-stealth");
const { spawn } = require("child_process");
const {
    mouseDelay,
    server,
    login,
    systemBrowserXLength,
    password,
    loginPageNameSelector,
    loginPagePasswordSelector,
    loginScreenLoginButtonSelector,
    linkTwoBuildingSelector,
    chromeArg,
    chromePath,
    screenChromeWidth,
    screenChromeHeight,
} = require("./config");
const {
    typeIntoFieldWithRobot,
    robotClickOnSelect,
    getRandomNumber,
    transformStringToNumber,
} = require("./utils");
const { loadGoogleSheets, getSheetsCell } = require("./tables");
const { heroFarm } = require("./heroFarm");
const { farmLists } = require("./farm");

const robot = require("robotjs");

robot.setMouseDelay(mouseDelay);

puppeteer.use(puppeteerStealth());

let connected = false;

async function connectToChrome(wsPort) {
    try {
        const sheet = await loadGoogleSheets();

        const delayValue = await getSheetsCell(sheet, "C2");
        const [minDelay, maxDelay] = delayValue.split(", ");
        console.log("maxDelay: ", maxDelay);
        console.log("minDelay: ", minDelay);

        const browser = await puppeteer.connect({
            browserWSEndpoint: wsPort,
        });

        const pages = await browser.pages();
        const page = pages[0];
        await page.setViewport({
            width: screenChromeWidth,
            height: screenChromeHeight,
        });

        await page.goto(server);

        await typeIntoFieldWithRobot({
            page,
            selector: loginPageNameSelector,
            text: login,
        });
        await typeIntoFieldWithRobot({
            page,
            selector: loginPagePasswordSelector,
            text: password,
        });
        await robotClickOnSelect({
            page,
            selector: loginScreenLoginButtonSelector,
            xCorrection: systemBrowserXLength,
        });
        await page.waitForSelector(linkTwoBuildingSelector);

        while (true) {
            await farmLists(page, sheet);
            await heroFarm(page, sheet);

            await new Promise((resolve) =>
                setTimeout(
                    resolve,
                    getRandomNumber(
                        transformStringToNumber(minDelay),
                        transformStringToNumber(maxDelay)
                    )
                )
            );
        }
    } catch (error) {
        console.log("Error connecting to Chrome:", error);
    }
}

const childProcess = spawn(chromePath, chromeArg);

childProcess.stderr.on("data", (data) => {
    if (!connected) {
        connected = true;

        const regex = /ws:\/\/[^\s]+/;

        const match = String(data).match(regex);

        if (match) {
            const webSocketURL = match[0];
            console.log(`WebSocket URL: ${webSocketURL}`);
            connectToChrome(webSocketURL);
        } else {
            console.log("WebSocket URL not found in the input string");
        }
    }
});
