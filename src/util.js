
const fs = require("fs-extra");
const Zip = require("adm-zip");
const path = require("path");
const trash = require("trash");
const globby = require("globby");

class Utils {

  /**
   * Unzips the zip file at the given path to the destination folder.
   *
   * @param {string} zipFilePath - Full directory, file name and extension
   * @param {string} destFolder
   */
  static unzipPackage(zipFilePath, destFolder) {
    let zip = new Zip(zipFilePath);
    zip.extractAllTo(destFolder);
  }

  /**
   * Unzips each zip file in the given input folder to the destination folder.
   *
   * @todo Verify file format
   *
   * @static
   * @param {string} inputFolder
   * @param {string} destFolder
   */
  static async unzipPackages(inputFolder, destFolder) {
    let zipFileNames = await fs.readdir(inputFolder);
    zipFileNames.forEach( zipFileName => {
      let zipFilePath = path.join(inputFolder, zipFileName);
      Utils.unzipPackage(zipFilePath, destFolder);
    });
  }

  /**
   * Counts the number of sub-folders of the given folder
   *
   * @static
   * @param {string} folder
   * @param {boolean} [recursive=false]
   * @returns {number}
   */
  static async countFolders(folder, recursive=false) {
    return countFSObjects(folder, "folders", recursive);
  }

  /**
   * Counts the number of files in the given folder.
   * Files must have a file extension to be counted.
   *
   * @static
   * @param {string} folder
   * @param {boolean} [recursive=false]
   * @returns {number}
   */
  static async countFiles(folder, recursive=false) {
    return countFSObjects(folder, "files", recursive);
  }

  /**
   * Removes a folder to the Recycle bin / Trash.
   *
   * @param {string} folder
   */
  static async clearFolder(folder) {

    try {
      await trash(folder);
    }
    catch (err) {
      console.log(err);
    }

  }


}  // End class ********************************


/**
 * Counts the number of sub-folders of the given folder
 *
 * @static
 * @param {string} folder
 * @param {"files"|"folders"} kind
 * @param {boolean} [recursive=false]
 * @returns {number}
 */
async function countFSObjects(folder, kind, recursive=false) {

  // Strip a trailing slash off the folder name if it exists
  let base = folder.replace(/\/$/, "");

  let pattern = recursive ? "/**/*" : "/*";

  let paths = await globby(base + pattern, {
    onlyDirectories: kind === "folders",
    onlyFiles: kind === "files",
    expandDirectories: recursive
  });

  return paths.length;
}

module.exports = Utils;
