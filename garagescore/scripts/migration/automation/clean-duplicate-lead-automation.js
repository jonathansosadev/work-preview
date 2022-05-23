const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
// Script oneshoot for remove duplicate data, delete me when #4578 is merge with master

const getDuplicateDatas = async () => {
  return app.models.DatasAsyncviewLeadTicket.getMongoConnector()
    .aggregate([
      {
        $match: {
          'source.type': 'Automation',
        },
      },
      {
        $group: {
          _id: {
            campaignRunDay: '$automation.campaignRunDay',
            campaignId: '$automation.campaignId',
            customerId: '$automation.customerId',
          },
          datasInvolved: { $push: '$_id' },
        },
      },
      {
        $match: {
          $expr: {
            $gt: [{ $size: '$datasInvolved' }, 1],
          },
        },
      },
    ])
    .toArray();
};

const updateCustomer = async (datasInvolved) => {
  const datas = await app.models.Data.getMongoConnector()
    .find({ _id: { $in: datasInvolved } })
    .toArray();

  const sortDatas = datas.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const keepMostRecentData = sortDatas[0];
  const datasToDelete = sortDatas
    .filter((data) => data._id.toString() !== keepMostRecentData._id.toString())
    .map((data) => data._id.toString());

  const customer = await app.models.Customer.getMongoConnector().findOne({
    _id: keepMostRecentData.automation.customerId,
  });

  customer.dataIds = customer.dataIds.filter((dataId) => !datasToDelete.includes(dataId.toString()));
  customer.leads = customer.leads.filter((lead) => !datasToDelete.includes(lead.dataId.toString()));
  customer.history = customer.history.filter((hist) => !datasToDelete.includes(hist.dataId.toString()));
  customer.index = customer.index.filter((ind) => !datasToDelete.includes(ind.k.substring(1)));

  await app.models.Customer.getMongoConnector().updateOne(
    {
      _id: customer._id,
    },
    {
      $set: {
        dataIds: customer.dataIds,
        leads: customer.leads,
        history: customer.history,
        index: customer.index,
      },
    }
  );

  return datasToDelete;
};

const deleteDatas = async (dataIds) => {
  const dataIdsToDelete = dataIds.map((id) => ObjectId(id.toString()));
  return app.models.Data.getMongoConnector().deleteMany({ _id: { $in: dataIdsToDelete } });
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    const duplicateDatas = await getDuplicateDatas();
    let countDeleted = 0;
    console.log(`--find ${duplicateDatas.length} pairs of duplicate datas`);

    for (const duplicate of duplicateDatas) {
      // 1. update customer
      const datasToDelete = await updateCustomer(duplicate.datasInvolved);
      // 2. delete duplicate data
      countDeleted += datasToDelete.length;
      console.log(`--deleted ${countDeleted}/${duplicateDatas.length} datas`);
      await deleteDatas(datasToDelete);
    }
    console.log(`--total duplicate datas deleted: ${countDeleted}`);
    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
