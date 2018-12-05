
let Resources = require("./resource");

let {
  NIEMModel, NIEMModelResponse,
  NIEMVersion, NIEMVersionResponse
} = require("niem-model-api-specification");

/**
 * Parses a NIEM model object into JSON files for the API.
 *
 * @param {NIEMModel} model - Loaded NIEM model object
 * @param {string} zipFileName - The name of the package zip file
 */
function process(model, zipFileName) {

  let modelID = zipFileName.replace(".zip", "");

  loadModelData(model, modelID);

  model.versions.forEach( version => {

    let versionID = modelID + "-" + version.version;
    loadVersionData(modelID, version, versionID);

    Resources.pushSearchCollection(model, version);
  });

}

/**
 * Parses the NIEM model object to return a modelResponse object.
 *
 * @param {NIEMModel} model
 * @param {string} modelID
 * @returns {NIEMModelResponse}
 */
function loadModelData(model, modelID) {

  // Deep copy model object
  let data = JSON.parse( JSON.stringify(model) );

  /** @type {NIEMModelResponse} */
  let modelResponse = {
    data,
    links: {
      id: modelID,
      href: Resources.resourceURL("models", modelID),
      versions: {
        href: Resources.collectionURL("models", modelID, "versions"),
        count: model.versions.length
      }
    }
  };

  // Version information should come from separate API calls
  delete modelResponse.data.versions;

  Resources.push("models", modelResponse, modelID);
}

/**
 * Parses the NIEM version object to return a versionResponse object.
 *
 * @param {String} modelID
 * @param {NIEMVersion} version
 * @param {String} versionID
 * @returns {NIEMVersionResponse}
 */
function loadVersionData(modelID, version, versionID) {

  // Deep copy version object
  let data = JSON.parse( JSON.stringify(version) );

  /** @type {NIEMVersionResponse} */
  let versionResponse = {
    data,
    links: {
      href: Resources.resourceURL("versions", versionID),
      folder: Resources.packageFolder(versionID),
      zip: Resources.zipFolder(versionID),
      model: {
        label: version.modelName,
        href: Resources.resourceURL("models", modelID)
      }
    }
  };

  Resources.push("versions", versionResponse, versionID);
}

module.exports = process;
