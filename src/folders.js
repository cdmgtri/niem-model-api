
let path = require("path");

// Sets the project folder base depending on if this is in test mode.
let base = path.resolve(__dirname, "../", (process.env.TEST ? "test" : ""));

module.exports = {
  /** @type {String} */
  inputFolder: path.resolve(base, "input/"),

  /** @type {String} */
  dataFolder: path.resolve(base, "api/data/"),

  /** @type {String} */
  pkgFolder: path.resolve(base, "api/packages/"),

  /** @type {String} */
  zipFolder: path.resolve(base, "api/zips/")
}
