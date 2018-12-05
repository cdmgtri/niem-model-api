
# NIEM Data

This is a basic NIEM content repository that provides a mock REST API interface for data consumption.

## API routes

| Route | Description |
| ----- | ----------- |
| api/data/models.json | Information about all models |
| api/data/models/:modelID.json/ | Information about a given model |
| api/data/versions.json/ | Information about all versions |
| api/data/versions/:versionID.json/ | Information about a given version |
| api/data/search.json | Combined model and version information for local search functionality |
| api/packages/:packageName | Unzipped package folder |
| api/zips/:zipName.zip | Package zip |

## Process

- Drop new IEPD package zip files into the `input` directory
- On build, all IEPD zips in the input directory will be...
  - unzipped into the `api/packages/` directory
  - saved in the `api/zips/` directory for easy future download
  - parsed for model information saved to the `api/data/` directory