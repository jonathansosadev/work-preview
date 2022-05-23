'use strict';

/** Dump results of a database query
 * Usage dump-documents.js loopbackModel "where"
 *
 */
const { ObjectId, ObjectID } = require('mongodb');
const app = require('../../../server/server');
const BSON = require('../../../common/lib/test/bson');

if (process.argv < 2) {
  console.error('Enter a loopback model name as the first param');
  process.exit();
}
if (process.argv < 3) {
  console.error('Usage dump-documents.js loopbackModel "where"');
  process.exit();
}

async function main(model, where) {
  let doc;
  try {
    // eslint-disable-next-line
    const mongo = app.models[model].getMongoConnector();
    const w = eval(`(${where})`); // eval is more relaxed than JSON.parse (to allow unquoted json)
    const $match = [
      {
        $match: w,
      },
    ];
    const docs = await mongo.aggregate($match).toArray();
    console.log(`${model}.find({ where: ${JSON.stringify(where)} }`);
    console.log('BEGIN_DUMP');
    console.log(app.models[model].modelName);
    docs.forEach((u) => {
      doc = u;
      console.log(BSON.serialize(u).toString('hex'));
    });
    console.log('END_DUMP');
  } catch (e) {
    console.error(e);
    console.log('Potential document throwing the error:');
    console.error(doc);
  }
  process.exit();
}
app.on('booted', async () => {
  main(process.argv[2], process.argv.slice(3).join(' '));
});
