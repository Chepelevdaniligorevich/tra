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
} = require("./config");
const {
  getCoordinatesOfElement,
  typeIntoFieldWithRobot,
  robotClickOnCors,
  robotClickOnSelect,
  getRandomNumber,
} = require("./utils");
const robot = require("robotjs");
const electron = require("electron");

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
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(server);

    const { width, height } = robot.getScreenSize();

    console.log("width", width);
    console.log("height", height);

    const viewportSize = await page.viewport();

    console.log("viewportSize", viewportSize);

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
                x: checkboxCoordinates.x + 75,
                y: checkboxCoordinates.y,
              });

              const summedTroopsElement = await page.$(".summedTroops");
              const notEnoughClassExists = await summedTroopsElement.$(
                ".value.notEnough"
              );

              if (notEnoughClassExists) {
                robotClickOnCors({
                  x: checkboxCoordinates.x + 75,
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
