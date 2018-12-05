
let fs = require("fs-extra");
let path = require("path");

let { NIEMPackageLoader } = require("niem-package-utils-js");

let Utils = require("./util");
let process = require("./process");
let { dataFolder, inputFolder, pkgFolder, zipFolder } = require("./folders");


/**
 * For each zip file in the input folder,
 *
 * - Extract data to the api directory
 * - Unzip the file to the packages directory
 * - Move the zip file in the input folder to the zips folder
 */
async function load() {

  // For each zip file in given folder, load zip file in parallel
  await Promise.all(
    fs
      .readdirSync(inputFolder)
      .map (async zipFileName => {

        let zipFilePath = path.join(inputFolder, zipFileName);

        // Read zip file
        let zipBinary = fs.readFileSync(zipFilePath);

        // Load the zip file using the NIEM package utility
        let pkg = await new NIEMPackageLoader(zipBinary);

        // Extract metadata file into NIEM model object
        let model = await pkg.extractMetadata();

        // Process the basic NIEM model object into API objects
        process(model, zipFileName);

        // Unzip IEPD into the packages folder
        Utils.unzipPackage(zipFilePath, pkgFolder);

        // Copy loaded
        fs.moveSync(zipFilePath, path.join(zipFolder, zipFileName));
      })
    );

}

/**
 * Clears the extracted data and moves the zip files back to the input folder.
 */
async function reset() {

  // Clear all extracted data
  try {
    await Utils.clearFolder(dataFolder);
    await Utils.clearFolder(pkgFolder);
  }
  catch (err) {
    console.log("Couldn't clear a folder", err.message);
  }

  // Move the saved zip files back to the input folder
  try {
    fs.moveSync(zipFolder + "/", inputFolder, {overwrite: true});
  }
  catch (err) {
    console.log("Couldn't move zips back to the input folder.");
  }

  // Re-add the cleared directories
  try {
    fs.mkdirpSync(dataFolder);
    fs.mkdirpSync(pkgFolder);
    fs.mkdirpSync(zipFolder);
  }
  catch (err) {
    console.log("Error with mkdirp", err.message);
  }
}

module.exports = {
  load,
  reset
}
