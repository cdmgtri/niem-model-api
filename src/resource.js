
let fs = require("fs-extra");
let path = require("path");

let { NIEMModel, NIEMVersion } = require("niem-model-api-specification");

let { dataFolder } = require("./folders");

/** Root API URL */
const API_URL = "https://cdmgtri.github.io/niem-model-api/";

/** @type {"models"|"versions"} */
const resourceTypes = "";

class Resources {

  /**
   * Saves an individual resource and appends it to the resource collection.
   *
   * @param {resourceTypes} resource
   * @param {Object} data
   * @param {String} resourceID
   */
  static push(resource, data, resourceID) {
    saveResource(resource, data, resourceID);
    appendResourceCollection(resource, data);
  }

  /**
   * Since the current API has no way to implement a search based on user-provided
   * keywords, generate a compiled JSON file of models and versions to be downloaded
   * so searches can be run locally.
   *
   * @param {NIEMModel} model
   * @param {NIEMVersion} version
   */
  static pushSearchCollection(model, version) {

    /** @type {NIEMModel[]} */
    let search = [];
    let searchPath = path.join(dataFolder, "search.json");

    try {
      // Read in existing data
      search = fs.readJSONSync(searchPath);
    }
    catch (err) {
      // No data loaded yet; search variable already assigned as backup
    }

    // Look for the given model in the search collection
    let foundModel = search.find( collectionModel => collectionModel.name === model.name );

    if (foundModel) {
      // Add the given version to the existing model
      foundModel.versions.push(version);
    }
    else {
      // Add the given model and attach its version
      let i = search.push(model) - 1;
      search[i].versions = [version];
    }

    fs.outputJSONSync(searchPath, search, {spaces: 2});
  }

  /**
   * Calculates the URL for the resource.
   *
   * @param {resourceTypes} resource
   * @param {string} resourceID
   * @returns {string}
   */
  static resourceURL(resource, resourceID) {
    return API_URL + "api/" + resource + "/" + resourceID + ".json";
  }

  /**
   * Calculates the URL for a collection of resources located under a parent resource.
   *
   * @param {resourceTypes} parentResource
   * @param {String} parentResourceID
   * @param {resourceTypes} resource
   * @returns {string}
   */
  static collectionURL(parentResource, parentResourceID, resource) {
    return API_URL + `api/${parentResource}/${parentResourceID}/${resource}.json`;
  }

  /**
   * Returns the folder where the IEPD is unzipped.
   *
   * @static
   * @param {string} versionID
   * @returns {string}
   */
  static packageFolder(versionID) {
    return API_URL + "api/packages/" + versionID;
  }

  /**
   * Returns the location of the IEPD zip file.
   *
   * @static
   * @param {string} versionID
   * @returns {string}
   */
  static zipFolder(versionID) {
    return API_URL + "api/zips/" + versionID + ".zip";
  }

}

/**
 * Saves an individual resource.
 *
 * For examples, saves version niem-4.1 to api/versions/niem-4.1.json
 *
 * @param {resourceTypes} resource
 * @param {Object} data
 * @param {string} resourceID
 */
function saveResource(resource, data, resourceID) {

  let schema = getAPISchema(resource);
  let resourceJSON = {"$schema": schema, ...data};
  let resourcePath = dataFolder + "/" + resource + "/" + resourceID + ".json";

  fs.outputJSONSync(resourcePath, resourceJSON, {spaces: 2});
}

/**
 * Adds a new resource to the resources.json file.
 *
 * For example, given resource="model" and a model response data object,
 * opens models.json, adds the model response to the array, and saves the file.
 *
 * @param {"models"|"versions"} resource
 * @param {Object} data
 */
function appendResourceCollection(resource, data) {

  let resources = [];
  let resourcesPath = path.join(dataFolder, resource + ".json");

  try {
    // Read in existing data
    resources = fs.readJSONSync(resourcesPath);
  }
  catch (err) {
    // No data loaded yet; resourceJSON variable already assigned as backup
  }

  // Add the new resource to the array and save
  resources.push(data);
  fs.outputJSONSync(resourcesPath, resources, {spaces: 2});
}

/**
 * Gets the API schema for the given resource.
 *
 * @param {resourceTypes} resource
 */
function getAPISchema(resource) {

  let apiSchemaBase = "https://raw.githubusercontent.com/cdmgtri/niem-model-api-specification/dev/schemas/deref/api-";

  let label = resource.slice(0, resource.length-1);
  return apiSchemaBase + label + "-schema.json";
}

module.exports = Resources;
