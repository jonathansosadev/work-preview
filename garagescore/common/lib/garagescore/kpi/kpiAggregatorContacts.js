const KpiPeriods = require('./KpiPeriods');
const KpiTypes = require('../../../models/kpi-type.js');
const { projectFields, finalProjectFields, groupFields } = require('./kpiAggregatorHelper');
const {
  ContactCampaignStatuses,
  ContactCampaignEmailStatuses,
  ContactCampaignPhoneStatuses,
  DataTypes,
} = require('../../../../frontend/utils/enumV2');
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

const fields = [
  'contactsCountSurveysResponded',
  'contactsCountReceivedSurveys',
  'contactsCountValidEmails',
  'contactsCountValidPhones',
  'contactsCountNotContactable',
  'contactsCountTotalShouldSurfaceInCampaignStats',
  'contactsCountScheduledContacts',
  'contactsCountBlockedLastMonthEmail',
  'contactsCountUnsubscribedByEmail',
  'contactsCountBlockedByPhone',
  'contactsCountBlockedByEmail',
  'contactsCountWrongEmails',
  'contactsCountNotPresentEmails',
  'contactsCountWrongPhones',
  'contactsCountNotPresentPhones',
];

module.exports = async function aggregateKpis(app, { period, kpiType = null, garageIds = [] } = {}) {
  const timezonedPeriod = KpiPeriods.convertToTimezonePeriod(period);

  const hasResponded = {
    $and: [{ $gt: ['$survey.firstRespondedAt', new Date(0)] }, { $gte: ['$review.rating.value', 0] }],
  };

  const hasReceived = {
    $eq: ['$campaign.contactStatus.status', ContactCampaignStatuses.RECEIVED],
  };

  const hasValidEmail = {
    $eq: ['$campaign.contactStatus.emailStatus', ContactCampaignEmailStatuses.VALID],
  };

  const hasValidPhone = {
    $eq: ['$campaign.contactStatus.phoneStatus', ContactCampaignPhoneStatuses.VALID],
  };

  const isNotContactable = {
    $in: ['$campaign.contactStatus.status', [ContactCampaignStatuses.IMPOSSIBLE, ContactCampaignStatuses.NOT_RECEIVED]],
  };

  const isScheduled = {
    $eq: ['$campaign.contactStatus.status', ContactCampaignStatuses.SCHEDULED],
  };

  const hasBlockedLastMonthEmail = {
    $eq: ['$campaign.contactStatus.emailStatus', ContactCampaignEmailStatuses.RECENTLY_CONTACTED],
  };

  const hasUnsubscribedByEmail = {
    $eq: ['$campaign.contactStatus.emailStatus', ContactCampaignEmailStatuses.UNSUBSCRIBED],
  };

  const hasBlockedByPhone = {
    $in: [
      '$campaign.contactStatus.phoneStatus',
      [ContactCampaignPhoneStatuses.UNSUBSCRIBED, ContactCampaignPhoneStatuses.RECENTLY_CONTACTED],
    ],
  };

  const hasBlockedByEmail = {
    $in: [
      '$campaign.contactStatus.emailStatus',
      [
        ContactCampaignEmailStatuses.UNSUBSCRIBED,
        ContactCampaignEmailStatuses.RECENTLY_CONTACTED,
        ContactCampaignEmailStatuses.DROPPED,
      ],
    ],
  };

  const hasWrongEmail = {
    $eq: ['$campaign.contactStatus.emailStatus', ContactCampaignEmailStatuses.WRONG],
  };

  const hasEmptyEmail = {
    $eq: ['$campaign.contactStatus.emailStatus', ContactCampaignEmailStatuses.EMPTY],
  };

  const hasWrongPhone = {
    $eq: ['$campaign.contactStatus.phoneStatus', ContactCampaignPhoneStatuses.WRONG],
  };

  const hasEmptyPhone = {
    $eq: ['$campaign.contactStatus.phoneStatus', ContactCampaignPhoneStatuses.EMPTY],
  };

  const $match = {
    ...addMatchOnGarageId(garageIds, 'string'),
    'service.providedAt': { $gte: timezonedPeriod.min, $lte: timezonedPeriod.max },
    shouldSurfaceInStatistics: true,
    type: {
      $in: [
        DataTypes.MAINTENANCE,
        DataTypes.NEW_VEHICLE_SALE,
        DataTypes.USED_VEHICLE_SALE,
        DataTypes.VEHICLE_INSPECTION,
      ],
    },
  };

  const $project = {
    garageId: 1,
    ...projectFields('contactsCountSurveysResponded', hasResponded),
    ...projectFields('contactsCountReceivedSurveys', hasReceived),
    ...projectFields('contactsCountValidEmails', hasValidEmail),
    ...projectFields('contactsCountValidPhones', hasValidPhone),
    ...projectFields('contactsCountNotContactable', isNotContactable),
    ...projectFields('contactsCountTotalShouldSurfaceInCampaignStats', true), // true because already in match
    ...projectFields('contactsCountScheduledContacts', isScheduled),
    ...projectFields('contactsCountBlockedLastMonthEmail', hasBlockedLastMonthEmail),
    ...projectFields('contactsCountUnsubscribedByEmail', hasUnsubscribedByEmail),
    ...projectFields('contactsCountBlockedByPhone', hasBlockedByPhone),
    ...projectFields('contactsCountBlockedByEmail', hasBlockedByEmail),
    ...projectFields('contactsCountWrongEmails', hasWrongEmail),
    ...projectFields('contactsCountNotPresentEmails', hasEmptyEmail),
    ...projectFields('contactsCountWrongPhones', hasWrongPhone),
    ...projectFields('contactsCountNotPresentPhones', hasEmptyPhone),
    ...(kpiType === KpiTypes.FRONT_DESK_USER_KPI && { userId: '$service.frontDeskUserName' }),
  };

  const $group = {
    _id:
      kpiType === KpiTypes.FRONT_DESK_USER_KPI
        ? {
            garageId: '$garageId',
            userId: { $toString: '$userId' },
          }
        : '$garageId',
    ...groupFields(fields),
  };

  const $finalProject = {
    _id: 1,
    periodId: { $literal: period },
    ...finalProjectFields(fields),
  };

  return app.models.Data.getMongoConnector()
    .aggregate([{ $match }, { $project }, { $group }, { $project: $finalProject }], {
      allowDiskUse: kpiType === KpiTypes.FRONT_DESK_USER_KPI,
    })
    .toArray();
};
