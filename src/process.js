
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

  let modelResponse = loadModelData(model, modelID);

  model.versions.forEach( version => {

    let versionID = modelID + "-" + version.version;
    let versionResponse = loadVersionData(modelID, version, versionID);

    Resources.pushSearchCollection(model, versionResponse);
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
  return modelResponse;
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
      id: versionID,
      href: Resources.resourceURL("versions", versionID),
      folder: Resources.packageFolder(modelID),
      zip: Resources.zipFolder(modelID),
      model: {
        id: modelID,
        label: version.modelName,
        href: Resources.resourceURL("models", modelID)
      }
    }
  };

  Resources.push("versions", versionResponse, versionID);
  return versionResponse;
}

module.exports = process;
