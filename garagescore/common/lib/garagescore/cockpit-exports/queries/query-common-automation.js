const { ObjectId } = require('mongodb');
const { todayDayNumber, dayNumber, addDays } = require('../../../util/time-helper');
const garageSubscriptionTypes = require('../../../../models/garage.subscription.type');
const { AutomationCampaignStatuses } = require('../../../../../frontend/utils/enumV2');

//--------------------------------------------------------------------------------------//
//                 Automation common function use by apollo quries                      //
//--------------------------------------------------------------------------------------//

const getSubscriptionsHistoryPrice = (garage, lte) => {
  if (!garage) {
    return 0;
  }

  const { subscriptions } = garage;
  let defaultPrice =
    (subscriptions.Automation && subscriptions.Automation.enabled && subscriptions.Automation.every) || 0;
  if (!garage.subscriptionsHistory || !garage.subscriptionsHistory[garageSubscriptionTypes.AUTOMATION]) {
    return defaultPrice;
  }

  const sub = garage.subscriptionsHistory[garageSubscriptionTypes.AUTOMATION]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .find((sub) => {
      const dateSub = sub.date.getTime();
      const dateLte = lte.getTime();
      return dateSub <= dateLte;
    });

  return (sub && sub.every) || defaultPrice;
};

const getAverageContactPrice = (garages, lte) => {
  if (!garages || garages.length === 0) {
    return 0;
  }

  const contactPrices = garages.map((garage) => {
    return getSubscriptionsHistoryPrice(garage, lte);
  });
  // average subscriptions.Automation.every / garages.length
  return contactPrices.reduce((total, price) => total + price, 0) / contactPrices.length;
};

const periodRange = (kpiPeriods) => {
  let gte = new Date();
  let lte = new Date();
  // lastquarter
  if (kpiPeriods === 10) {
    gte = addDays(gte, -90);
  }
  // range period
  if (Array.isArray(kpiPeriods) && kpiPeriods.length > 0) {
    const startYear = `${kpiPeriods[0]}`.substring(0, 4);
    const startMonth = `${kpiPeriods[0]}`.substring(4, 6);
    const endYear = `${kpiPeriods[kpiPeriods.length - 1]}`.substring(0, 4);
    const endMonth = `${kpiPeriods[kpiPeriods.length - 1]}`.substring(4, 6);
    gte = new Date(startYear, startMonth - 1, 1);
    lte = new Date(endYear, endMonth, 1);
  }
  if (kpiPeriods > 10) {
    const year = `${kpiPeriods}`.substring(0, 4);
    const month = `${kpiPeriods}`.substring(4, 6);
    gte = new Date(year, month - 1, 1);
    lte = new Date(year, month, 1);
  }
  // month selected
  return { gte, lte };
};

const getGarages = (app, garageIds) => {
  return app.models.Garage.getMongoConnector()
    .find({
      _id: { $in: garageIds.map((gId) => ObjectId(gId.toString())) },
      'subscriptions.active': true,
      'subscriptions.Automation.enabled': true,
    })
    .project({
      subscriptions: true,
      subscriptionsHistory: true,
    })
    .toArray();
};

const checkLastToggledDate = (campaign) => {
  if (!campaign || !campaign.lastToggled) {
    return false;
  }

  return campaign.lastToggled.some((toggle) => {
    const isValidToggleDate = toggle && toggle.date && todayDayNumber() - dayNumber(toggle.date) <= 90;
    return isValidToggleDate && toggle.status === AutomationCampaignStatuses.RUNNING;
  });
};

const checkIsConsolidate = (campaign) => {
  if (!campaign) {
    return false;
  }
  return campaign.firstRunDayNumber.some((runDayNumber) => todayDayNumber() - runDayNumber <= 90);
};

module.exports = {
  getSubscriptionsHistoryPrice,
  getAverageContactPrice,
  periodRange,
  getGarages,
  checkLastToggledDate,
  checkIsConsolidate,
};
