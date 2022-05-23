const DataTypes = require('../../../models/data/type/data-types');
const LeadTypes = require('../../../models/data/type/lead-types');
const LeadTicketStatus = require('../../../models/data/type/lead-ticket-status');
const KpiTypes = require('../../../../common/models/kpi-type.js');
const GarageTypes = require('../../../../common/models/garage.type.js');
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

const {
  WAITING_FOR_CONTACT,
  CONTACT_PLANNED,
  WAITING_FOR_MEETING,
  MEETING_PLANNED,
  WAITING_FOR_PROPOSITION,
  PROPOSITION_PLANNED,
  WAITING_FOR_CLOSING,
  CLOSED_WITHOUT_SALE,
  CLOSED_WITH_SALE,
} = LeadTicketStatus;

const leadSaleTypeCond = (leadSaleType = null) => {
  if (!leadSaleType) {
    return [];
  }
  if (leadSaleType === DataTypes.UNKNOWN) {
    return [
      {
        $or: [
          { $eq: ['$leadTicket.saleType', null] },
          { $eq: ['$leadTicket.saleType', DataTypes.UNKNOWN] },
          { $eq: ['$leadTicket.saleType', undefined] },
        ],
      },
    ];
  }
  return [{ $eq: ['$leadTicket.saleType', leadSaleType] }];
};
const baseLeadConds = (period, leadSaleType = null) => [
  { $gte: ['$leadTicket.createdAt', period.min] },
  { $lte: ['$leadTicket.createdAt', period.max] },
  ...leadSaleTypeCond(leadSaleType),
];

const getProjectedFields = (period, leadSaleType = null, suffix = '') => {
  const buildProject = (...$and) => ({ $cond: { if: { $and }, then: 1, else: 0 } });
  const baseCondition = baseLeadConds(period, leadSaleType);

  // helper conditions
  const leadOpen = [
    { $ne: ['$leadTicket.status', LeadTicketStatus.CLOSED_WITHOUT_SALE] },
    { $ne: ['$leadTicket.status', LeadTicketStatus.CLOSED_WITH_SALE] },
  ];
  const leadClosed = [
    {
      $or: [
        { $eq: ['$leadTicket.status', LeadTicketStatus.CLOSED_WITHOUT_SALE] },
        { $eq: ['$leadTicket.status', LeadTicketStatus.CLOSED_WITH_SALE] },
      ],
    },
  ];
  const leadAssigned = [
    { $ne: ['$leadTicket.manager', 'undefined'] },
    { $ne: ['$leadTicket.manager', null] },
    { $ne: ['$leadTicket.manager', undefined] },
    { $ne: [{ $type: '$leadTicket.manager' }, 'missing'] },
  ];
  const leadUnassigned = [
    {
      $or: [
        { $eq: ['$leadTicket.manager', 'undefined'] },
        { $eq: ['$leadTicket.manager', null] },
        { $eq: ['$leadTicket.manager', undefined] },
        { $eq: [{ $type: '$leadTicket.manager' }, 'missing'] },
      ],
    },
  ];

  const surveyLead = [{ $eq: ['$lead.potentialSale', true] }];

  const leadTouched = (value = true) => ({ $eq: ['$leadTicket.touched', value] });

  const reactive = [{ $eq: ['$leadTicket.reactive', true] }, { $ne: ['$leadTicket.status', 'WaitingForContact'] }];
  const leadStatus = (status) => ({ $eq: ['$leadTicket.status', status] });
  const leadType = (type) => ({ $eq: ['$lead.type', type] });

  return {
    [`countLeads${suffix}`]: buildProject(...baseCondition),
    // assigned & unassigned
    [`countLeadsAssigned${suffix}`]: buildProject(...baseCondition, ...leadAssigned),
    [`countLeadsUnassigned${suffix}`]: buildProject(...baseCondition, ...leadOpen, ...leadUnassigned),
    // touched
    [`countLeadsUntouched${suffix}`]: buildProject(...baseCondition, leadTouched(false)),
    [`countLeadsUntouchedOpen${suffix}`]: buildProject(...baseCondition, ...leadOpen, leadTouched(false)),
    [`countLeadsTouched${suffix}`]: buildProject(...baseCondition, leadTouched()),
    [`countLeadsTouchedOpen${suffix}`]: buildProject(...baseCondition, ...leadOpen, leadTouched()),
    [`countLeadsTouchedClosed${suffix}`]: buildProject(...baseCondition, ...leadClosed, leadTouched()),
    [`countLeadsReactive${suffix}`]: buildProject(...baseCondition, ...reactive),
    // kpi relative to ticket status
    [`countLeadsWaitingForContact${suffix}`]: buildProject(...baseCondition, leadStatus(WAITING_FOR_CONTACT)),
    [`countLeadsContactPlanned${suffix}`]: buildProject(...baseCondition, leadStatus(CONTACT_PLANNED)),
    [`countLeadsWaitingForMeeting${suffix}`]: buildProject(...baseCondition, leadStatus(WAITING_FOR_MEETING)),
    [`countLeadsMeetingPlanned${suffix}`]: buildProject(...baseCondition, leadStatus(MEETING_PLANNED)),
    [`countLeadsWaitingForProposition${suffix}`]: buildProject(...baseCondition, leadStatus(WAITING_FOR_PROPOSITION)),
    [`countLeadsPropositionPlanned${suffix}`]: buildProject(...baseCondition, leadStatus(PROPOSITION_PLANNED)),
    [`countLeadsWaitingForClosing${suffix}`]: buildProject(...baseCondition, leadStatus(WAITING_FOR_CLOSING)),
    [`countLeadsClosedWithoutSale${suffix}`]: buildProject(...baseCondition, leadStatus(CLOSED_WITHOUT_SALE)),
    [`countLeadsClosedWithSale${suffix}`]: buildProject(...baseCondition, leadStatus(CLOSED_WITH_SALE)),
    // Unused in cockpit, do we need to get rid of it ?
    [`countLeadsClosedWithSaleWasInterested${suffix}`]: buildProject(
      ...baseCondition,
      leadStatus(CLOSED_WITH_SALE),
      leadType(LeadTypes.INTERESTED)
    ),
    // Unused in cockpit, do we need to get rid of it ?
    [`countLeadsClosedWithSaleWasInContactWithVendor${suffix}`]: buildProject(
      ...baseCondition,
      leadStatus(CLOSED_WITH_SALE),
      leadType(LeadTypes.IN_CONTACT_WITH_VENDOR)
    ),
    // Unused in cockpit, do we need to get rid of it ?
    [`countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness${suffix}`]: buildProject(
      ...baseCondition,
      leadStatus(CLOSED_WITH_SALE),
      leadType(LeadTypes.ALREADY_PLANNED_OTHER_BUSINESS)
    ),
    // (projet identifiés à l'atelier welcome)
    [`countLeadsPotentialSales${suffix}`]: buildProject(...baseCondition, ...surveyLead),
  };
};

module.exports = async function aggregateLeadsKpi(app, { period, kpiType = null, garageIds = [] } = {}) {
  // Setup MongoDB Matching
  const $match = {
    ...addMatchOnGarageId(garageIds, 'string'),
    shouldSurfaceInStatistics: true,
    'leadTicket.createdAt': { $gte: period.min, $lte: period.max },
  };
  if (kpiType === KpiTypes.AGENT_GARAGE_KPI) {
    $match['source.type'] = GarageTypes.AGENT;
  }

  // Setup MongoDB Projection For LEADS
  const $project = {
    garageId: true,
    // To manage unassigned & undefined manager tickets we will map such values to 'Unassigned' instead of ignoring them
    userId: {
      $cond: {
        if: { $in: ['$leadTicket.manager', [null, 'undefined']] },
        then: { $literal: 'Unassigned' },
        else: '$leadTicket.manager',
      },
    },
    followedGarageId: '$source.garageId',
    sourceType: '$source.type',
    ...getProjectedFields(period),
    ...getProjectedFields(period, DataTypes.MAINTENANCE, 'Apv'),
    ...getProjectedFields(period, DataTypes.NEW_VEHICLE_SALE, 'Vn'),
    ...getProjectedFields(period, DataTypes.USED_VEHICLE_SALE, 'Vo'),
    ...getProjectedFields(period, DataTypes.UNKNOWN, 'Unknown'),
  };

  // Setup MongoDB Grouping
  let $group = { _id: '$garageId' };
  if (kpiType === KpiTypes.USER_KPI) {
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
