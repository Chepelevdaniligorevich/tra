const { linkTwoRallyPointStartButtonSelector } = require("./config");
const {
    getCoordinatesOfElement,
    robotClickOnCors,
    checkElementVisibility,
    scrollToElement,
    removeElementBySelector,
    robotClickOnElement,
    transformStringToNumber,
} = require("./utils");
const { getSheetsCell, setSheetsCell, updateSheetsTime } = require("./tables");

const { goToResourseFields, goToRallyPoint } = require("./goToUtils");

const farmLists = async (page, sheet) => {
    const farmListsFarm = [];

    try {
        const listsValue = await getSheetsCell(sheet, "B2");
        const lists = listsValue.split(",");

        await goToResourseFields(page);

        await goToRallyPoint(page);

        await page.waitForSelector(".farmListWrapper div.name");

        await removeElementBySelector({ page, selector: "#stickyWrapper" });

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

                    dayFarm += transformStringToNumber(spanValue) || 0;

                    const stateCell = await slotRow.$("td.state");
                    const attackSmallElement =
                        await stateCell.$("i.attack_small");

                    if (!attackSmallElement) {
                        const selectionCell = await slotRow.$("td.selection");
                        const checkbox = await selectionCell.$(
                            'input[type="checkbox"]'
                        );

                        const isVisible =
                            await checkElementVisibility(checkbox);

                        if (!isVisible) {
                            await scrollToElement(checkbox);
                        }

                        if (checkbox) {
                            const checkboxCoordinates =
                                await getCoordinatesOfElement(checkbox);
                            robotClickOnCors({
                                x: checkboxCoordinates.x,
                                y: checkboxCoordinates.y,
                            });

                            const summedTroopsElement =
                                await page.$(".summedTroops");

                            if (summedTroopsElement) {
                                const notEnoughClassExists =
                                    await summedTroopsElement.$(
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
                    }
                    await robotClickOnElement({
                        elementHandle: startButtonInsideTheList,
                    });
                    farmListsFarm.push(`${list}: ${dayFarm}`);
                }
            } else {
                console.log("Parent element not found");
            }

            await updateSheetsTime(sheet);
            setSheetsCell(sheet, "D2", farmListsFarm.join(","));
        }
    } catch (error) {
        console.log("Error during farm", error);
    }
};

module.exports = {
    farmLists,
};
