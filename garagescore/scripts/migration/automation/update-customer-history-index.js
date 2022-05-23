const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');
// Script oneshoot for remove duplicate data, delete me when issue #5789 is close

const getDataIdsFromCustomers = async (garageId) => {
  return app.models.Customer.getMongoConnector()
    .aggregate([
      {
        $match: {
          garageId: ObjectId(garageId.toString()),
          history: { $size: 0 },
        },
      },
      {
        $group: {
          _id: '$garageId',
          dataIds: { $push: '$dataIds' },
        },
      },
    ])
    .toArray();
};

const getGarageIdsFromCustomers = async () => {
  return app.models.Customer.getMongoConnector().distinct('garageId');
};

const addData = async (garageId) => {
  const [result] = await getDataIdsFromCustomers(garageId);
  if (!result) {
    return;
  }
  const dataIds = result.dataIds.flat(1);

  for (const dataId of dataIds) {
    const data = await app.models.Data.getMongoConnector().findOne({
      _id: ObjectId(dataId.toString()),
    });
    if (data) {
      await app.models.Customer.addData(data);
    }
  }
};
// ::parameter garageId is (ex: --garageId 577a30d774616c1a0056c263 // for all garages: --all
const _parseArgs = (args) => {
  let garageId = null;
  let all = null;
  if (args.includes('--garageId')) {
    garageId = args[process.argv.indexOf('--garageId') + 1];
  }
  if (args.includes('--all')) {
    all = true;
    garageId = null;
  }
  return { garageId, all };
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    const { garageId, all } = _parseArgs(process.argv);
    let garageIds = [];

    if (all) {
      garageIds = await getGarageIdsFromCustomers();
    }
    if (garageId) {
      garageIds = [garageId];
    }

    const promises = garageIds.map((garageId) => () => addData(garageId));
    await concurrentpromiseAll(promises, 100, false);

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
