// require("dotenv").config();
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

const { getDateFormated } = require("./utils");
const { creds, SPREADSHEET_ID, SHEET_NAME } = require("./config");

async function loadGoogleSheets() {
    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

    await doc.loadInfo();

    const sheet = doc.sheetsByTitle[SHEET_NAME];

    return sheet;
}

async function updateSheetsTime(sheet, sheatNum = "A2") {
    await setSheetsCell(sheet, sheatNum, getDateFormated());
}

async function getSheetsCell(sheet, cell) {
    await sheet.loadCells(cell);
    const currentCell = sheet.getCellByA1(cell);
    return currentCell.value;
}

async function setSheetsCell(sheet, cell, value) {
    await sheet.loadCells(cell);
    const currentCell = sheet.getCellByA1(cell);
    currentCell.value = value;
    await sheet.saveUpdatedCells();
}

module.exports = {
    loadGoogleSheets,
    updateSheetsTime,
    setSheetsCell,
    getSheetsCell,
};
