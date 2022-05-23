'use strict';

const app = require('../../../server/server.js');

const promisify = require('util').promisify;
const readFile = promisify(require('fs').readFile);
// @ts-ignore
const { ObjectId } = require('mongodb');

/**
 * process csv file
 *
 * @param {*} collection mongo collection
 */
async function renameSGScenters(collection) {
  const fileName = './scripts/migration/5836/SGS_stopped.renamed.csv';
  const csvContent = await readFile(fileName, 'utf8');

  const lines = csvContent.split(/\n/).filter((n) => n);

  // remove first line
  lines.shift();

  // collect garageIds manually
  const garageIds = lines.map((line) => ObjectId(line.split(';')[0]));

  const knownGarageIds = (
    await collection.aggregate([{ $match: { _id: { $in: garageIds } } }, { $project: { _id: 1 } }]).toArray()
  ).map((doc) => doc._id);

  if (knownGarageIds.length < garageIds.length) {
    const unknownGarageIds = garageIds.filter((id) => knownGarageIds.indexOf(id) === -1);
    console.error(`
      the following garages could not be found: 
      (${unknownGarageIds.join(', ')})
    `);
  }

  // mise a jour des garages concernés
  await collection.updateMany({ _id: { $in: garageIds } }, [
    {
      $set: {
        publicDisplayName: {
          $concat: ['[Inactif] ', '$publicDisplayName'],
        },
      },
    },
  ]);

  console.log('done');
}

app.on('booted', async () => {
  try {
    console.log(`================= rename SGS centers`);
    console.time('execution_time');
    // @ts-ignore
    await renameSGScenters(app.models.Garage.getMongoConnector());
    console.timeEnd('execution_time');
    console.log('=================script end without error');
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
});
