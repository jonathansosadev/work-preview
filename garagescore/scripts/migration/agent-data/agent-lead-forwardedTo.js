const app = require('../../../server/server.js');
const { ObjectId } = require('mongodb');

/**
 * scsript de rattrapage pour les datas type Agent:
 * fait un rattrapage du : 
 * - forwardedAt
 * - forwardedTo
 * delete this when #3597 closed
 */
app.on('booted', async () => {
  try {
    console.log('==============start');
    let totalDataUpdated = 0;
    const Data = app.models.Data.getMongoConnector()
    // 1 get all agent garages
    const agentGarages = await app.models.Garage
      .getMongoConnector()
      .find({
        type: "Agent"
      }).project({
        _id: 1
      }).toArray();

    for (const agent of agentGarages) {
      // 2 get datas from agent
      const agentDatas = await Data
        .find({
          'garageId': agent._id.toString(),
          'lead.reportedAt': { $gt: new Date("2014-01-01T00:00:00.000Z") }
        }).project({
          _id: 1
        }).toArray();

      agentDatas.forEach(async (a) => {
        // 3 check if leadTicket was created from agent Data by source.sourceId
        const findData = await Data
          .findOne({
            'source.sourceId': ObjectId(a._id.toString()),
            'leadTicket.createdAt': { $gt: new Date("2014-01-01T00:00:00.000Z") }
          }, {
            projection: {
              _id: 1,
              'lead.reportedAt': 1
            }
          });
        // 4 set forwardedTo and forwardedAt on agent Data
        if (findData) {
          totalDataUpdated++;
          console.log(`-> data updated: ${findData._id.toString()}`);
          await Data.updateOne({
            _id: ObjectId(a._id.toString())
          }, {
            $set: {
              'lead.forwardedAt': findData.lead.reportedAt,
              'lead.forwardedTo': ObjectId(findData._id.toString()),
            }
          });
        }
      });
    }
    console.log(`==============script end without error, total data updated: ${totalDataUpdated}`);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(2);
  }
});
