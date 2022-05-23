/** Aggregation for Automation */
const { AutomationCampaignsEventsType } = require('../../../../frontend/utils/enumV2');
const CampaignTypes = require('../../../models/automation-campaign.type');
const KpiTypes = require('../../../models/kpi-type');
const timeHelper = require('../../util/time-helper');
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

async function aggregateAutomationKpi(app, { period, kpiType = null, garageIds = [] } = {}) {
  const buildProject = (...$and) => ({ $cond: { if: { $and }, then: '$nsamples', else: 0 } });
  const periodMin = timeHelper.dayNumber(period.min);
  const periodMax = timeHelper.dayNumber(period.max);

  // PREPARE THE MATCH
  const $match = {
    ...addMatchOnGarageId(garageIds, 'objectId'),
    $or: [
      {
        campaignRunDay: {
          $gte: periodMin,
          $lte: periodMax,
        },
      },
      {
        eventDay: {
          $gte: periodMin,
          $lte: periodMax,
        },
      },
    ],
  };

  // PREPARE THE PROJECT
  const $project = {
    garageId: true,
    campaignId: true,
    KPI_automationCountTargetedSales: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.TARGETED] },
      { $ne: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$campaignRunDay', periodMin] },
      { $lte: ['$campaignRunDay', periodMax] }
    ),
    KPI_automationCountTargetedMaintenances: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.TARGETED] },
      { $eq: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$campaignRunDay', periodMin] },
      { $lte: ['$campaignRunDay', periodMax] }
    ),
    KPI_automationCountSentSales: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.SENT] },
      { $ne: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$campaignRunDay', periodMin] },
      { $lte: ['$campaignRunDay', periodMax] }
    ),
    KPI_automationCountSentMaintenances: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.SENT] },
      { $eq: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$campaignRunDay', periodMin] },
      { $lte: ['$campaignRunDay', periodMax] }
    ),
    KPI_automationCountOpenedSales: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.OPENED] },
      { $ne: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$campaignRunDay', periodMin] },
      { $lte: ['$campaignRunDay', periodMax] }
    ),
    KPI_automationCountOpenedMaintenances: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.OPENED] },
      { $eq: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$campaignRunDay', periodMin] },
      { $lte: ['$campaignRunDay', periodMax] }
    ),
    KPI_automationCountConvertedSales: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.CONVERTED] },
      { $ne: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$eventDay', periodMin] },
      { $lte: ['$eventDay', periodMax] }
    ),
    KPI_automationCountConvertedMaintenances: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.CONVERTED] },
      { $eq: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$eventDay', periodMin] },
      { $lte: ['$eventDay', periodMax] }
    ),
    KPI_automationCountCrossedSales: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.CROSSED] },
      { $ne: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$eventDay', periodMin] },
      { $lte: ['$eventDay', periodMax] }
    ),
    KPI_automationCountCrossedMaintenances: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.CROSSED] },
      { $eq: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$eventDay', periodMin] },
      { $lte: ['$eventDay', periodMax] }
    ),
    KPI_automationCountLeadSales: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.LEAD] },
      { $ne: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$eventDay', periodMin] },
      { $lte: ['$eventDay', periodMax] }
    ),
    KPI_automationCountLeadMaintenances: buildProject(
      { $eq: ['$type', AutomationCampaignsEventsType.LEAD] },
      { $eq: ['$campaignType', CampaignTypes.AUTOMATION_MAINTENANCE] },
      { $gte: ['$eventDay', periodMin] },
      { $lte: ['$eventDay', periodMax] }
    ),
  };

  // PREPARE THE GROUP
  const $group = {
    _id: kpiType === KpiTypes.AUTOMATION_CAMPAIGN_KPI ? '$campaignId' : '$garageId',
    garageId: { $first: `$garageId` },
    ...Object.fromEntries(
      Object.keys($project)
        .filter((key) => key.includes('KPI'))
        .map((key) => [key, { $sum: `$${key}` }])
    ),
  };

  return app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([{ $match }, { $project }, { $group }])
    .toArray();
}

module.exports = aggregateAutomationKpi;
