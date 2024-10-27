const {
    robotClickOnCors,
    robotClickOnSelect,
    getRandomNumber,
    typeIntoFieldWithRobot,
} = require("./utils");
const robot = require("robotjs");
const fs = require("fs");

const { goToResourseFields, goToRallyPoint } = require("./goToUtils");

const heroFarm = async (page) => {
    try {
        await goToResourseFields(page);

        const isHeroInVillage = await page.evaluate(() => {
            return !!document.querySelector(".unit.uhero");
        });

        if (isHeroInVillage) {
            const data = await fs.readFile("./input.json", "utf8");

            const dataParsed = JSON.parse(data);
            const firtCoorsToFarm = dataParsed.heroFarm.shift();
            dataParsed.alreadyFarmed =
                dataParsed.alreadyFarmed.push(firtCoorsToFarm);
            fs.writeFile("output.json", JSON.stringify(dataParsed));

            const [corX, corY] = firtCoorsToFarm.split("/");

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
                const tdElements = document.querySelectorAll("td.line-last");

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
        }
    } catch (error) {
        console.log("Error during hero farm", error);
    }
};

module.exports = {
    heroFarm,
};
