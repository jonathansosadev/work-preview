// This script is meant to be run once against the autoreply_factorization_vf.csv 
const fs = require('fs');
const app = require('../../../server/server');
const path = require('path');
const csvParser = require('csv');
const { ObjectId } = require('mongodb')

const csvFilename = process.argv[2];

let entries = [];

async function readCsv(reviewConnection, garageConnection) {
  fs.createReadStream(path.resolve(__dirname, csvFilename))
    .pipe(csvParser.parse({ delimiter: ',' }))
    .on('data', (row) => {
      if (row[0] === "content")
        return;
      let ratingCategory = row[2]
      if (ratingCategory === 'neutral')
        ratingCategory = 'passive'
      if (ratingCategory === 'promotor')
        ratingCategory = 'promoter'
      let contentText = row[0]
      contentText = contentText.replace('@Nom du garage', '@GarageName');
      contentText = contentText.replace('@Nom du groupe', '@GroupName');
      const found = entries.findIndex((e) => e.content === contentText && e.title === row[3])
      if (found > -1) {
        if (!entries[found]['sources'].includes(row[1]))
          entries[found]['sources'].push(row[1])
        if (!entries[found]['ratingCategories'].includes(ratingCategory))
          entries[found]['ratingCategories'].push(ratingCategory)
        if (!entries[found]['garageIds'].map(g => g.toString()).includes(row[4]))
          entries[found]['garageIds'].push(ObjectId(row[4]))
      } else {
        entries.push({
          content: contentText,
          sources: [row[1]],
          ratingCategories: [ratingCategory],
          title: row[3],
          garageIds: [ObjectId(row[4])],
          automated: true,
          createdBy: "Custeed",
          createdById: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: "Custeed",
          updatedById: undefined,
        });
      }
    })
    .on('end', async () => {
      entries.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' }))
      entries.reverse();
      for (const template of entries) {
        await reviewConnection.insertOne(template);
      }
      await garageConnection.updateMany({ automaticReplies: { $exists: true } }, { $unset: { automaticReplies: "" } })
      console.log("[MIGRATION] Automatic reply migration from CSV completed");
      process.exit(0);
    })
}

app.on('booted', async () => {
  const reviewConnection = app.models.ReviewReplyTemplate.getMongoConnector();
  const garageConnection = app.models.Garage.getMongoConnector();
  readCsv(reviewConnection, garageConnection)
});