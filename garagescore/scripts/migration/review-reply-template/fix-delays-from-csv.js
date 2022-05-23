// This script fixes the missing delay config in the migrated garages
const fs = require('fs');
const app = require('../../../server/server');
const path = require('path');
const csvParser = require('csv');
const { ObjectId, Int32 } = require('mongodb')

const csvFilename = process.argv[2];

let uniqueGarageIds = [];

async function readCsv(garageConnection) {
  fs.createReadStream(path.resolve(__dirname, csvFilename))
    .pipe(csvParser.parse({ delimiter: ',' }))
    .on('data', (row) => {
      if (row[0] === "content")
        return;
      const found = uniqueGarageIds.findIndex((g) => g.toString() === row[4])
      if (found < 0) {
        uniqueGarageIds.push(ObjectId(row[4]));
      }
    })
    .on('end', async () => {
      // If the garage doesn't have a delay configured yet, set it to 4hrs
      for (const garageId of uniqueGarageIds) {
        await garageConnection.updateOne({ _id: garageId, automaticReviewResponseDelay: { $exists: false } }, { $set: { automaticReviewResponseDelay: Int32(14400000) } });
      }
      console.log("[MIGRATION] Garage delay fix from CSV completed");
      process.exit(0);
    })
}

app.on('booted', async () => {
  const garageConnection = app.models.Garage.getMongoConnector();
  readCsv(garageConnection)
});