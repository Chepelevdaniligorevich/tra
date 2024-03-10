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
  linkTwoRallyPointSelector,
  linkTwoRallyPointStartButtonSelector,
  chromeArg,
  minDelay,
  maxDelay,
  chromePath,
  screenChromeWidth,
  screenChromeHeight,
} = require("./config");
const {
  getCoordinatesOfElement,
  typeIntoFieldWithRobot,
  robotClickOnCors,
  robotClickOnSelect,
  getRandomNumber,
} = require("./utils");
const robot = require("robotjs");

robot.setMouseDelay(mouseDelay);

puppeteer.use(puppeteerStealth());

let connected = false;

async function connectToChrome(wsPort) {
  try {
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

    const windowPosition = await page.evaluate(() => {
      return {
        screenY: window.screenY,
        innerHeight: window.innerHeight,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio,
        documentElement: document.documentElement.clientHeight,
        body: document.body.clientHeight,
      };
    });

    const { height } = robot.getScreenSize();

    console.log("screen height", height);

    console.log(
      "windowPosition.devicePixelRatio",
      windowPosition.devicePixelRatio
    );
    console.log("windowPosition.screenY", windowPosition.screenY);
    console.log("windowPosition.body", windowPosition.body);
    console.log(
      "windowPosition.documentElement",
      windowPosition.documentElement
    );
    console.log("windowPosition.outerHeight", windowPosition.outerHeight);
    console.log("windowPosition.innerHeight", windowPosition.innerHeight);

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
      xCorrection: systemBrowserXLength + 50,
    });
    await page.waitForSelector(linkTwoBuildingSelector);
    await robotClickOnSelect({
      page,
      selector: linkTwoBuildingSelector,
      xCorrection: systemBrowserXLength + 50,
    });
    await page.waitForSelector(linkTwoRallyPointSelector);
    await robotClickOnSelect({
      page,
      selector: linkTwoRallyPointSelector,
      xCorrection: systemBrowserXLength + 50,
    });
    await page.waitForSelector(".titleInHeader");

    while (true) {
      try {
        const slotRows = await page.$$("tr.slot");

        let countOfAttacks = 0;

        for (const slotRow of slotRows) {
          const stateCell = await slotRow.$("td.state");
          const attackSmallElement = await stateCell.$("i.attack_small");

          if (!attackSmallElement) {
            const selectionCell = await slotRow.$("td.selection");
            const checkbox = await selectionCell.$('input[type="checkbox"]');

            if (checkbox) {
              const checkboxCoordinates = await getCoordinatesOfElement(
                checkbox
              );
              robotClickOnCors({
                x: checkboxCoordinates.x + 65,
                y: checkboxCoordinates.y,
              });

              const summedTroopsElement = await page.$(".summedTroops");
              const notEnoughClassExists = await summedTroopsElement.$(
                ".value.notEnough"
              );

              if (notEnoughClassExists) {
                robotClickOnCors({
                  x: checkboxCoordinates.x + 65,
                  y: checkboxCoordinates.y,
                });
                break;
              } else {
                countOfAttacks++;
              }
            }
          }
        }

        if (countOfAttacks > 0) {
          await robotClickOnSelect({
            page,
            selector: linkTwoRallyPointStartButtonSelector,
            xCorrection: systemBrowserXLength + 50,
          });
        }
      } catch (error) {
        break;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, getRandomNumber(minDelay, maxDelay))
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
