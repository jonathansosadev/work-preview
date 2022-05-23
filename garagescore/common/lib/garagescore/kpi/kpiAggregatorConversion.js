const DataTypes = require('../../../models/data/type/data-types');
const LeadTypes = require('../../../models/data/type/lead-types');
const LeadTicketStatus = require('../../../models/data/type/lead-ticket-status');
const KpiTypes = require('../../../../common/models/kpi-type.js');
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

module.exports = async function aggregateConversionKpi(app, { period, kpiType = null, garageIds = [] } = {}) {
  const undefinedFrontDeskUserNames = [
    null,
    'UNDEFINED',
    'null',
    'a renseigner',
    'collaborateur',
    'a identifier ***',
    '* non precise',
    '0',
    ',',
    '0.00',
    '\\u0000',
    '.*** a affecter',
    '.',
    'autre',
    'autres',
    'divers',
  ];
  const buildProject = (...$and) => ({ $cond: { if: { $and }, then: 1, else: 0 } });
  const baseConversionConds = (convType, type = null) => [
    { $eq: [`$conversion.isConvertedFrom${convType}`, true] },
    ...(type ? [{ $eq: ['$type', type] }] : []),
  ];

  // Setup MongoDB Matching
  const $match = {
    ...addMatchOnGarageId(garageIds, 'string'),
    shouldSurfaceInStatistics: true,
    'service.providedAt': { $gte: period.min, $lte: period.max },
    $or: [{ 'conversion.isConvertedFromLead': true }, { 'conversion.isConvertedFromTradeIn': true }],
  };

  // Setup MongoDB Projection For CONVERSION KPIs
  // NewProjects, KnownProjects, WonFromCompetition is determined by data.conversion.(leadSourceType | tradeInSourceType)
  // VO / VN is determined by data.type
  // a single data might score for both Lead & TradeIn
  const $project = {
    garageId: true,
    // To manage unassigned & undefined manager tickets we will map such values to 'Unassigned' instead of ignoring them
    userId: {
      $cond: {
        if: { $in: ['$service.frontDeskUserName', undefinedFrontDeskUserNames] },
        then: { $literal: 'Unassigned' },
        else: '$service.frontDeskUserName',
      },
    },
    followedGarageId: '$source.garageId',
    sourceType: '$source.type',
    countConvertedLeads: buildProject(...baseConversionConds('Lead')),
    countConvertedLeadsNewProjects: buildProject(...baseConversionConds('Lead'), {
      $in: [
        '$conversion.leadSourceType',
        [LeadTypes.INTERESTED, LeadTypes.OBLIGATION_AND_RENEWAL, LeadTypes.SELLING_WITH_RENEWAL],
      ],
    }),
    countConvertedLeadsKnownProjects: buildProject(...baseConversionConds('Lead'), {
      $in: [
        '$conversion.leadSourceType',
        [LeadTypes.ALREADY_PLANNED, LeadTypes.IN_CONTACT_WITH_VENDOR, LeadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR],
      ],
    }),
    countConvertedLeadsWonFromCompetition: buildProject(...baseConversionConds('Lead'), {
      $in: ['$conversion.leadSourceType', [LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS]],
    }),
    countConvertedTradeIns: buildProject(...baseConversionConds('TradeIn')),
    countConvertedTradeInsNewProjects: buildProject(...baseConversionConds('TradeIn'), {
      $in: [
        '$conversion.tradeInSourceType',
        [LeadTypes.INTERESTED, LeadTypes.OBLIGATION_AND_RENEWAL, LeadTypes.SELLING_WITH_RENEWAL],
      ],
    }),
    countConvertedTradeInsKnownProjects: buildProject(...baseConversionConds('TradeIn'), {
      $in: [
        '$conversion.tradeInSourceType',
        [LeadTypes.ALREADY_PLANNED, LeadTypes.IN_CONTACT_WITH_VENDOR, LeadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR],
      ],
    }),
    countConvertedTradeInsWonFromCompetition: buildProject(...baseConversionConds('TradeIn'), {
      $in: ['$conversion.tradeInSourceType', [LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS]],
    }),
    countConvertedLeadsVo: buildProject(...baseConversionConds('Lead', DataTypes.USED_VEHICLE_SALE)),
    countConvertedLeadsNewProjectsVo: buildProject(...baseConversionConds('Lead', DataTypes.USED_VEHICLE_SALE), {
      $in: [
        '$conversion.leadSourceType',
        [LeadTypes.INTERESTED, LeadTypes.OBLIGATION_AND_RENEWAL, LeadTypes.SELLING_WITH_RENEWAL],
      ],
    }),
    countConvertedLeadsKnownProjectsVo: buildProject(...baseConversionConds('Lead', DataTypes.USED_VEHICLE_SALE), {
      $in: [
        '$conversion.leadSourceType',
        [LeadTypes.ALREADY_PLANNED, LeadTypes.IN_CONTACT_WITH_VENDOR, LeadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR],
      ],
    }),
    countConvertedLeadsWonFromCompetitionVo: buildProject(...baseConversionConds('Lead', DataTypes.USED_VEHICLE_SALE), {
      $in: ['$conversion.leadSourceType', [LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS]],
    }),
    countConvertedTradeInsVo: buildProject(...baseConversionConds('TradeIn', DataTypes.USED_VEHICLE_SALE)),
    countConvertedTradeInsNewProjectsVo: buildProject(...baseConversionConds('TradeIn', DataTypes.USED_VEHICLE_SALE), {
      $in: [
        '$conversion.tradeInSourceType',
        [LeadTypes.INTERESTED, LeadTypes.OBLIGATION_AND_RENEWAL, LeadTypes.SELLING_WITH_RENEWAL],
      ],
    }),
    countConvertedTradeInsKnownProjectsVo: buildProject(
      ...baseConversionConds('TradeIn', DataTypes.USED_VEHICLE_SALE),
      {
        $in: [
          '$conversion.tradeInSourceType',
          [
            LeadTypes.ALREADY_PLANNED,
            LeadTypes.IN_CONTACT_WITH_VENDOR,
            LeadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR,
          ],
        ],
      }
    ),
    countConvertedTradeInsWonFromCompetitionVo: buildProject(
      ...baseConversionConds('TradeIn', DataTypes.USED_VEHICLE_SALE),
      {
        $in: ['$conversion.tradeInSourceType', [LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS]],
      }
    ),
    countConvertedLeadsVn: buildProject(...baseConversionConds('Lead', DataTypes.NEW_VEHICLE_SALE)),
    countConvertedLeadsNewProjectsVn: buildProject(...baseConversionConds('Lead', DataTypes.NEW_VEHICLE_SALE), {
      $in: [
        '$conversion.leadSourceType',
        [LeadTypes.INTERESTED, LeadTypes.OBLIGATION_AND_RENEWAL, LeadTypes.SELLING_WITH_RENEWAL],
      ],
    }),
    countConvertedLeadsKnownProjectsVn: buildProject(...baseConversionConds('Lead', DataTypes.NEW_VEHICLE_SALE), {
      $in: [
        '$conversion.leadSourceType',
        [LeadTypes.ALREADY_PLANNED, LeadTypes.IN_CONTACT_WITH_VENDOR, LeadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR],
      ],
    }),
    countConvertedLeadsWonFromCompetitionVn: buildProject(...baseConversionConds('Lead', DataTypes.NEW_VEHICLE_SALE), {
      $in: ['$conversion.leadSourceType', [LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS]],
    }),
    countConvertedTradeInsVn: buildProject(...baseConversionConds('TradeIn', DataTypes.NEW_VEHICLE_SALE)),
    countConvertedTradeInsNewProjectsVn: buildProject(...baseConversionConds('TradeIn', DataTypes.NEW_VEHICLE_SALE), {
      $in: [
        '$conversion.tradeInSourceType',
        [LeadTypes.INTERESTED, LeadTypes.OBLIGATION_AND_RENEWAL, LeadTypes.SELLING_WITH_RENEWAL],
      ],
    }),
    countConvertedTradeInsKnownProjectsVn: buildProject(...baseConversionConds('TradeIn', DataTypes.NEW_VEHICLE_SALE), {
      $in: [
        '$conversion.tradeInSourceType',
        [LeadTypes.ALREADY_PLANNED, LeadTypes.IN_CONTACT_WITH_VENDOR, LeadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR],
      ],
    }),
    countConvertedTradeInsWonFromCompetitionVn: buildProject(
      ...baseConversionConds('TradeIn', DataTypes.NEW_VEHICLE_SALE),
      {
        $in: ['$conversion.tradeInSourceType', [LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS]],
      }
    ),
    countConvertedLeadsClosed: buildProject(...baseConversionConds('Lead'), {
      $or: [
        { $eq: ['$leadTicket.status', LeadTicketStatus.CLOSED_WITHOUT_SALE] },
        { $eq: ['$leadTicket.status', LeadTicketStatus.CLOSED_WITH_SALE] },
      ],
    }),
  };

  // Setup MongoDB Grouping
  let $group = { _id: '$garageId' };
  if (kpiType === KpiTypes.FRONT_DESK_USER_KPI) {
    $group = { _id: { garageId: '$garageId', userId: { $toString: '$userId' } } };
  } else if (kpiType === KpiTypes.USER_KPI) {
    $group = { _id: { garageId: '$garageId', userId: { $toString: '$userId' } } };
  } else if (kpiType === KpiTypes.AGENT_GARAGE_KPI) {
    $group = { _id: { $toString: '$followedGarageId' } };
  } else if (kpiType === KpiTypes.SOURCE_KPI) {
    $group = { _id: { garageId: '$garageId', sourceType: '$sourceType' } };
  }

  for (const projection of Object.keys($project)) {
    if (!['garageId', 'userId', 'followedGarageId', 'sourceType'].includes(projection)) {
      $group[projection] = { $sum: `$${projection}` };
    }
  }

  const query = [{ $match }, { $project }, { $group }];
  // Getting Aggregation Result Directly From MongoDB
  return app.models.Data.getMongoConnector().aggregate(query).toArray();
};
