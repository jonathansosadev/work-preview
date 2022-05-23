'use strict';

const app = require('../../../server/server.js');
const { ObjectId } = require('mongodb');

/**
 * This script use for remove duplicate Google reviews on collection Data
 * a review is duplicate if we got the same sourceId
 */
let clean = false;
let sourceType = null;
let garageIdArg = null;
process.argv.forEach((val) => {
  if (val === '--clean') {
    clean = true;
  }
  if (val === '--Google') {
    sourceType = 'Google';
  }
  if (val === '--Facebook') {
    sourceType = 'Facebook';
  }
  if (val === '--PagesJaunes') {
    sourceType = 'PagesJaunes';
  }
  if (ObjectId.isValid(val)) {
    garageIdArg = val;
  }
});

/**
 * function return difference between 2 arrays
 * @param {*} a1 array contains object
 * @param {*} a2 array contains object
 */
function difference(a1, a2) {
  let a2Set = new Set(a2);
  return a1.filter(function (x) {
    return !a2Set.has(x);
  });
}
/**
 * retrieve all garages
 * @param {*} app server.js file
 */
const getAllGarages = async (app) => {
  const fields = {
    id: true,
  };
  return app.models.Garage.find({ fields });
};
/**
 * function find all reviews and delete duplicate
 * @param {*} app server.js file
 * @param {*} garageId garage _id document
 */
const findDuplicateAndRemove = async (app, garageId) => {
  const mongo = app.models.Data.getMongoConnector();
  const query = [
    {
      $match: {
        garageId: garageIdArg ? garageIdArg : garageId,
        'source.type': sourceType,
      },
    },
    {
      $project: {
        sourceId: '$source.sourceId',
      },
    },
  ];
  const results = await mongo.aggregate(query).toArray(); // get all reviews
  let uniqueDatas = [];

  switch (
    sourceType // find duplicate according to sourceType
  ) {
    case 'Google':
      uniqueDatas = [...new Map(results.map((item) => [item.sourceId, item])).values()];
      break;
    case 'Facebook':
      uniqueDatas = [...new Map(results.map((item) => [item.sourceId, item])).values()];
      break;
    case 'PagesJaunes':
      uniqueDatas = [...new Map(results.map((item) => [item.sourceId.toString(), item])).values()];
      break;
    default:
      console.log('=================Error=================');
      console.log('Source Type parameter missing (--Google, --Facebook, --PagesJaunes)');
      process.exit(0);
  }

  const duplicateDatasToDelete = difference(results, uniqueDatas); // get document _id to delete
  const $in = duplicateDatasToDelete.map((d) => ObjectId(d._id));
  console.log(
    `☠ Total datas ${results.length}, duplicate find and delete ${duplicateDatasToDelete.length}, remains ${uniqueDatas.length} reviews for garage: ${garageId}`
  );

  if (clean) {
    // delete duplicate documents
    await mongo.deleteMany({ _id: { $in } });
  } else if (garageIdArg) {
    console.log(`script execute successful for garage: ${garageIdArg}`);
    process.exit(0);
  }
};
/**
 * the main function retrieve all garages
 * and loop for remove duplicate on every garage
 * @param {*} app server.js file
 */
const cleanDatasDuplicate = async (app) => {
  const garages = await getAllGarages(app);

  for (const garage of garages) {
    await findDuplicateAndRemove(app, garage.id.toString());
  }
};

// start CRON
app.on('booted', async () => {
  try {
    console.log(`=================start clean duplicate source: ${sourceType}`);
    console.time('execution_time');
    await cleanDatasDuplicate(app);
    console.timeEnd('execution_time');
    console.log('=================script end without error');
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
});
