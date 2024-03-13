const { systemBrowserYLength, systemBrowserXLength } = require("./config");
const robot = require("robotjs");

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getCoordinatesOfElement(element) {
  const boundingBox = await element.boundingBox();

  if (boundingBox) {
    const x = boundingBox.x + boundingBox.width / 2;
    const y = boundingBox.y + boundingBox.height / 2;
    return { x, y };
  } else {
    throw new Error(`Element with selector ${selector} not found.`);
  }
}

async function getCoordinatesOfSelector({ page, selector }) {
  const elementHandle = await page.$(selector);

  const coordinates = await getCoordinatesOfElement(elementHandle);

  return coordinates;
}

async function typeIntoFieldWithRobot({
  page,
  selector,
  text,
  xCorrection = systemBrowserXLength,
  yCorrection = systemBrowserYLength,
}) {
  await robotClickOnSelect({ page, selector, xCorrection, yCorrection });

  robot.typeString(text);
}

async function robotClickOnSelect({
  page,
  selector,
  xCorrection = systemBrowserXLength,
  yCorrection = systemBrowserYLength,
}) {
  const coordinates = await getCoordinatesOfSelector({ page, selector });

  robotClickOnCors({
    x: coordinates.x,
    y: coordinates.y,
    xCorrection,
    yCorrection,
  });
}

async function robotClickOnCors({
  x,
  y,
  xCorrection = systemBrowserXLength,
  yCorrection = systemBrowserYLength,
}) {
  robot.moveMouse(x + xCorrection, y + yCorrection);
  robot.moveMouse(x + xCorrection, y + yCorrection);
  robot.moveMouse(x + xCorrection, y + yCorrection);
  robot.moveMouse(x + xCorrection, y + yCorrection);

  robot.mouseClick();
}

async function checkElementVisibility(elementHandle) {
  const isElementVisible = await elementHandle.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });

  return isElementVisible;
}

async function checkElementVisibilityBySelect({ page, selector }) {
  const isElementVisible = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, selector);

  return isElementVisible;
}

async function scrollToElement(elementHandle) {
  await elementHandle.evaluate((el) => {
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  });
}
async function scrollToSelector({ page, selector }) {
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, selector);
}

async function removeElementBySelector({ page, selector }) {
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.remove();
    }
  }, selector);
}

module.exports = {
  getCoordinatesOfElement,
  getCoordinatesOfSelector,
  typeIntoFieldWithRobot,
  robotClickOnCors,
  robotClickOnSelect,
  getRandomNumber,
  checkElementVisibility,
  scrollToElement,
  checkElementVisibilityBySelect,
  scrollToSelector,
  removeElementBySelector,
};
