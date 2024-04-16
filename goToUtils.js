const {
    systemBrowserXLength,
    linkTwoBuildingSelector,
    linkTwoRallyPointSelector,
    linkTwoResourceSelector,
    linkToRandomCropField,
} = require("./config");
const { robotClickOnSelect, scrollToElement } = require("./utils");

const goToResourseFields = async (page) => {
    const LinkToResFieldsElement = await page.$(linkTwoResourceSelector);

    await scrollToElement(LinkToResFieldsElement);

    await robotClickOnSelect({
        page,
        selector: linkTwoResourceSelector,
        xCorrection: systemBrowserXLength,
    });

    await page.waitForSelector(linkToRandomCropField);
};

const goToRallyPoint = async (page) => {
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
};

module.exports = {
    goToResourseFields,
    goToRallyPoint,
};
