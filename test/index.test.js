
const fs = require("fs-extra");
const path = require("path");

const { load, reset } = require("../src/index");
const Utils = require("../src/util");

const ASSETS_FOLDER = path.join(__dirname, "assets");
const inputFolder = path.join(__dirname, "input");
const dataFolder = path.join(__dirname, "api/data");
const pkgFolder = path.join(__dirname, "api/packages");
const zipFolder = path.join(__dirname, "api/zips");


let { NIEMModelResponse, NIEMVersionResponse
} = require("niem-model-api-specification");


/**
 * Clear any currently extracted zips in the packages folder.
 * Unzip all test zips in the assets folder to the packages folder.
 */
describe("unzip assets", async () => {

  beforeAll( async () => {
    // Reset the test data
    await reset();
    reloadInput();

    // Unzip all test zips in the assets folder
    await Utils.unzipPackages(ASSETS_FOLDER, pkgFolder);
  });

  // Make sure the right number of packages have been unzipped
  test("all packages", async () => {
    let pkgCount = await Utils.countFolders(pkgFolder, false);
    expect(pkgCount).toEqual(3);
  });

  // Make sure all sub-folders have been unzipped
  test("sub-folders", async () => {
    let pkgFolders = await Utils.countFolders(pkgFolder, true);
    expect(pkgFolders).toEqual(43);
  });

  // Make sure no files have been unzipped directly under the packages directory
  test("no top level files", async () => {
    let topLevelFiles = await Utils.countFiles(pkgFolder, false);
    expect(topLevelFiles).toEqual(0);
  });

  // Make sure the right number of files have been unzipped to package sub-folders
  test("file counts", async () => {
    let subFolderFiles = await Utils.countFiles(pkgFolder, true);
    expect(subFolderFiles).toEqual(67);
  });

});

describe("reset", async () => {

  beforeAll( async () => {
    await reset();
    reloadInput();
  });

  test("input folder should contain zips", async () => {
    let count = await Utils.countFiles(inputFolder);
    expect(count).toEqual(3);
  });

  test("packages should be empty", async () => {
    let count = await Utils.countFolders(pkgFolder);
    expect(count).toEqual(0);
  });

  test("data folder should be empty", async () => {
    let count = await Utils.countFiles(dataFolder);
    expect(count).toEqual(0);

    count = await Utils.countFolders(dataFolder);
    expect(count).toEqual(0);
  });

  test("zip folder should be empty", async () => {
    let count = await Utils.countFiles(zipFolder);
    expect(count).toEqual(0);
  });
});


describe("load data", async () => {

  const dataFolder = path.join(__dirname, "api/data");

  /** @type {NIEMModelResponse[]} */
  let models;

  /** @type {NIEMModelResponse} */
  let escapeNotice;

  beforeAll( async () => {
    await reset();
    reloadInput();
    await load();

    let filePath = path.join(dataFolder, "models.json");
    models = fs.readJSONSync(filePath);
    escapeNotice = models.find( model => model.data.name === "Escape Notice" );
  });

  test("models.json", async () => {
    expect(models.length).toEqual(3);
    expect(escapeNotice.data.name === "Escape Notice");
  });

});

function reloadInput() {
  fs.copySync(ASSETS_FOLDER, inputFolder);
}