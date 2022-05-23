const app = require('../../../../server/server');
const SourceTypes = require('../../../models/data/type/source-types.js');

function getDates(lastWeekFromThisDate) {
  // Get one week
  const today = lastWeekFromThisDate ? new Date(lastWeekFromThisDate) : new Date();
  const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  return [{ receivedAt: { $gte: lastWeek } }, { receivedAt: { $lte: today } }];
}

function getStatusCount(sourceTypes) {
  const object = {};
  sourceTypes.forEach((sourceType) => {
    ['Parsed', 'Error', 'Transferred', 'New'].forEach((status) => {
      object[`${sourceType}.Email.${status}`] = {
        $size: {
          $filter: {
            input: '$incomingCrossLeads',
            cond: {
              $and: [
                { $eq: ['$$this.status', status] },
                { $eq: ['$$this.sourceType', sourceType] },
                { $eq: ['$$this.type', 'Email'] },
              ],
            },
          },
        },
      };
      object[`${sourceType}.Call.${status}`] = {
        $size: {
          $filter: {
            input: '$incomingCrossLeads',
            cond: {
              $and: [
                { $eq: ['$$this.status', status] },
                { $eq: ['$$this.sourceType', sourceType] },
                { $eq: ['$$this.type', 'Call'] },
              ],
            },
          },
        },
      };
    });
  });
  return object;
}

function manualProject() {
  const project = getStatusCount(SourceTypes.supportedCrossLeadsSources());
  [
    'garageId',
    'publicDisplayName',
    'subscriptionDate',
    ...SourceTypes.supportedCrossLeadsSources().map((source) => `${source}Config`),

  ].forEach((field) => {
    project[field] = 1;
  });
  return project;
}

const exogenousStatsProject = () => {
  const project = {};
  const sourceTypes = SourceTypes.supportedExogenousSources()
  sourceTypes.forEach(sourceType => {
    project[`${sourceType}.connected`] = `$exogenousReviewsConfigurations.${sourceType}.connectedBy`
    project[`${sourceType}.error`] = `$exogenousReviewsConfigurations.${sourceType}.error`
  })
  return project
}

module.exports = {
  getExogenousStats: async () => {
    const mongo = app.models.Garage.getMongoConnector();
    const exogenousStats = await mongo.aggregate([
      {
        $match: {
          'subscriptions.EReputation.enabled': true
        },
      },
      {
        $project: {
          ...exogenousStatsProject()
        }
      }
    ]).toArray();
    return exogenousStats;
  },
  getXLeadsStats: async (lastWeekFromThisDate = null) => {
    const mongo = app.models.Garage.getMongoConnector();
    const statPerGarage = await mongo
      .aggregate([
        {
          $match: {
            'subscriptions.CrossLeads.enabled': true,
            type: { $in: ['MotorbikeDealership', 'Dealership', 'Agent'] },
            'subscriptions.active': true,
            locale: 'fr_FR',
          },
        },
        {
          $project: {
            ...SourceTypes.supportedCrossLeadsSources().reduce((acc, source) => {
              acc[`${source}Array`] = {
                $filter: {
                  input: '$crossLeadsConfig.sources',
                  as: 'source',
                  cond: { $eq: ['$$source.type', source] },
                },
              };
              return acc;
            }, {}),
            subscriptionDate: {
              $ifNull: [{ $dateToString: { format: '%d/%m/%Y', date: '$subscriptions.CrossLeads.date' } }, null],
            },
            publicDisplayName: 1,
          },
        },
        {
          $project: {
            _id: 0,
            garageId: '$_id',
            publicDisplayName: 1,
            subscriptionDate: 1,
            ...SourceTypes.supportedCrossLeadsSources().reduce((acc, source) => {
              acc[`${source}Config`] = { $arrayElemAt: [`$${source}Array`, 0] };
              return acc;
            }, {}),
          },
        },
        {
          $lookup: {
            from: 'incomingCrossLeads',
            let: { garageId: '$garageId' },
            pipeline: [
              { $match: { $expr: { $eq: ['$garageId', '$$garageId'] }, $and: getDates(lastWeekFromThisDate) } },
              {
                $project: {
                  _id: 0,
                  sourceType: 1,
                  receivedAt: { $dateToString: { format: '%d/%m/%Y', date: '$receivedAt' } },
                  status: 1,
                  type: 1,
                  error: { $ifNull: ['$error', null] },
                  dataId: { $ifNull: ['$dataId', null] },
                },
              },
            ],
            as: 'incomingCrossLeads',
          },
        },
        {
          $project: manualProject(),
        },
      ])
      .toArray();
    const sourceTypes = SourceTypes.supportedCrossLeadsSources();
    const IncomingCrossLead = app.models.IncomingCrossLead.getMongoConnector();
    for (let garageStat of statPerGarage) {
      for (let sourceType of sourceTypes) {
        const total = await IncomingCrossLead.count({ garageId: garageStat.garageId, sourceType });
        garageStat[sourceType].total = total;
        for (const type of ['Email', 'Call']) {
          const [lastIncomingCrossLead] = await IncomingCrossLead.aggregate([
            {
              $match: {
                garageId: garageStat.garageId,
                type: type,
                sourceType: sourceType
              }
            },
            {
              $project: { _id: 0, receivedAt: 1 }
            },
            {
              $sort: { receivedAt: -1 }
            },
            {
              $limit: 1
            }

          ]).toArray()
          if (lastIncomingCrossLead) {
            garageStat[sourceType][type].receivedAt = lastIncomingCrossLead.receivedAt;
          }
        }

      }
    }
    return statPerGarage;
  },
};
