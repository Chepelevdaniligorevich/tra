const {
    robotClickOnCors,
    robotClickOnSelect,
    getRandomNumber,
    typeIntoFieldWithRobot,
} = require("./utils");
const robot = require("robotjs");
const { getSheetsCell, setSheetsCell, updateSheetsTime } = require("./tables");

const { goToResourseFields, goToRallyPoint } = require("./goToUtils");

const heroFarm = async (page, sheet) => {
    try {
        const heroFarmList = await getSheetsCell(sheet, "A6");

        if (heroFarmList) {
            const heroFarmListArray = heroFarmList.split(",");

            const [firstHeroFarm, ...restHeroFarm] = heroFarmListArray;

            await goToResourseFields(page);

            const isHeroInVillage = await page.evaluate(() => {
                return !!document.querySelector(".unit.uhero");
            });

            if (isHeroInVillage) {
                const [corX, corY] = firstHeroFarm.split("/");

                await goToRallyPoint(page);

                await robotClickOnSelect({
                    page,
                    selector:
                        "#content > div.contentNavi.subNavi > div > div.content.favor.favorKey2",
                });

                await new Promise((resolve) =>
                    setTimeout(resolve, getRandomNumber(2000, 3000))
                );

                const boundingBox = await page.evaluate(() => {
                    const tdElements =
                        document.querySelectorAll("td.line-last");

                    for (const tdElement of tdElements) {
                        const imgElement =
                            tdElement.querySelector("img.unit.uhero");
                        if (imgElement) {
                            const inputElement = imgElement.nextElementSibling;
                            if (inputElement) {
                                const boundingBox =
                                    inputElement.getBoundingClientRect();
                                return {
                                    x: boundingBox.x + boundingBox.width / 2,
                                    y: boundingBox.y + boundingBox.height / 2,
                                };
                            }
                        }
                    }

                    return null;
                });

                await robotClickOnCors({
                    x: boundingBox.x,
                    y: boundingBox.y,
                });

                robot.keyTap("numpad_1");

                await typeIntoFieldWithRobot({
                    page,
                    selector: "#xCoordInput",
                    text: corX,
                });

                await typeIntoFieldWithRobot({
                    page,
                    selector: "#yCoordInput",
                    text: corY,
                });

                await robotClickOnSelect({
                    page,
                    selector:
                        "#build > div > form > div.option > label:nth-child(5) > input",
                });

                await robotClickOnSelect({
                    page,
                    selector: "#ok",
                });

                await new Promise((resolve) => setTimeout(resolve, 1000));

                await robotClickOnSelect({
                    page,
                    selector: ".rallyPointConfirm",
                });

                await updateSheetsTime(sheet, "C6");
                setSheetsCell(sheet, "A6", restHeroFarm.join(","));

                const alreadyFarmed = await getSheetsCell(sheet, "B6");
                setSheetsCell(sheet, "B6", alreadyFarmed + "," + firstHeroFarm);
            }
        }
    } catch (error) {
        console.log("Error during hero farm", error);
    }
};

module.exports = {
    heroFarm,
};
