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
  chromePath,
  screenChromeWidth,
  screenChromeHeight,
  linkTwoResourceSelector,
  linkToRandomCropField,
} = require("./config");
const {
  getCoordinatesOfElement,
  typeIntoFieldWithRobot,
  robotClickOnCors,
  robotClickOnSelect,
  getRandomNumber,
  checkElementVisibility,
  scrollToElement,
  removeElementBySelector,
  robotClickOnElement,
  transformStringToNumber,
} = require("./utils");
const {
  loadGoogleSheets,
  getSheetsCell,
  setSheetsCell,
  updateSheetsTime,
} = require("./tables");
const robot = require("robotjs");

robot.setMouseDelay(mouseDelay);

puppeteer.use(puppeteerStealth());

let connected = false;

async function connectToChrome(wsPort) {
  try {
    const sheet = await loadGoogleSheets();

    const listsValue = await getSheetsCell(sheet, "B2");
    const lists = listsValue.split(", ");
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
    await robotClickOnSelect({
      page,
      selector: linkTwoResourceSelector,
      xCorrection: systemBrowserXLength,
    });
    await page.waitForSelector(linkToRandomCropField);
    await robotClickOnSelect({
      page,
      selector: linkTwoBuildingSelector,
      xCorrection: systemBrowserXLength,
    });
    await page.waitForSelector(linkTwoRallyPointSelector);
    await robotClickOnSelect({
      page,
      selector: linkTwoRallyPointSelector,
      xCorrection: systemBrowserXLength,
    });
    await page.waitForSelector(".titleInHeader");

    await page.waitForSelector(".farmListWrapper div.name");

    await removeElementBySelector({ page, selector: "#stickyWrapper" });
    while (true) {
      const farmListsFarm = [];

      try {
        for (let list of lists) {
          let dayFarm = 0;
          const parentElements = await page.$$(".farmListWrapper");

          let parentElement = null;

          for (let parent of parentElements) {
            const isCorrect = await page.evaluate(
              (el, list) => {
                const div = el.querySelector("div.name");
                if (div.innerText.includes(list)) {
                  return true;
                }

                return false;
              },
              parent,
              list
            );
            if (isCorrect) {
              parentElement = parent;
            }
          }

          if (parentElement) {
            // Find all tr.slot elements within the parent element
            const slotRows = await parentElement.$$("tr.slot");

            let countOfAttacks = 0;

            for (const slotRow of slotRows) {
              const spanValue = await page.evaluate((slotRow) => {
                const spanElement = slotRow.querySelector(
                  "div.averageRaidBounty > span"
                );
                return spanElement ? spanElement.innerText : null;
              }, slotRow);

              dayFarm += transformStringToNumber(spanValue);

              const stateCell = await slotRow.$("td.state");
              const attackSmallElement = await stateCell.$("i.attack_small");

              if (!attackSmallElement) {
                const selectionCell = await slotRow.$("td.selection");
                const checkbox = await selectionCell.$(
                  'input[type="checkbox"]'
                );

                const isVisible = await checkElementVisibility(checkbox);

                if (!isVisible) {
                  await scrollToElement(checkbox);
                  await new Promise((resolve) => setTimeout(resolve, 2000));
                }

                if (checkbox) {
                  const checkboxCoordinates = await getCoordinatesOfElement(
                    checkbox
                  );
                  robotClickOnCors({
                    x: checkboxCoordinates.x,
                    y: checkboxCoordinates.y,
                  });

                  const summedTroopsElement = await page.$(".summedTroops");

                  if (summedTroopsElement) {
                    const notEnoughClassExists = await summedTroopsElement.$(
                      ".value.notEnough"
                    );

                    if (notEnoughClassExists) {
                      robotClickOnCors({
                        x: checkboxCoordinates.x,
                        y: checkboxCoordinates.y,
                      });
                      break;
                    } else {
                      countOfAttacks++;
                    }
                  } else {
                    countOfAttacks++;
                  }
                }
              }
            }

            if (countOfAttacks > 0) {
              const startButtonInsideTheList = await parentElement.$(
                linkTwoRallyPointStartButtonSelector
              );

              const startButtonVisible = await checkElementVisibility(
                startButtonInsideTheList
              );

              if (!startButtonVisible) {
                await scrollToElement(startButtonInsideTheList);
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
              await robotClickOnElement({
                elementHandle: startButtonInsideTheList,
              });
              farmListsFarm.push(`${list}: ${dayFarm}`);
            }
          } else {
            console.log("Parent element not found");
          }
        }
      } catch (error) {
        console.log("Error in script", error);
        break;
      }
      await updateSheetsTime(sheet);
      setSheetsCell(sheet, "D2", farmListsFarm.join(", "));
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
