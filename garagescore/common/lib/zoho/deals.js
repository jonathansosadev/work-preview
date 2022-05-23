const app = require('../../../server/server.js');
const zoho = require('./zoho-api');
const GarageStatus = require('../../models/garage.status.js');
const GarageSubscriptionTypes = require('../../models/garage.subscription.type.js');
const { formatZohoDate } = require('./utils')
const { DEAL_URL } = require('./zoho-api.js');

const sumGarageSubscriptionsPrices = (garage) => {
  const subs = garage.subscriptions;
  if (!subs) return 0;
  let totalPrice = 0;
  for (const type of GarageSubscriptionTypes.values()) {
    // eslint-disable-line no-restricted-syntax
    if (subs[type] && subs[type].price && subs[type].enabled) totalPrice += subs[type].price;
  }
  return totalPrice;
};
const sumGarageSetupPrices = (acc, garage) => {
  const subs = garage.subscriptions;
  if (!subs || !subs.setup || !subs.setup.enabled) return acc;
  return acc + (subs.setup.price || 0);
};

const getGoCardLessStatus = (garagesFound, allBillingAccounts) => {
  if (
    garagesFound.every((g) => {
      const billingAccount = allBillingAccounts.find((ba) =>
        ba.garageIds ? ba.garageIds.map((id) => id.toString()).includes(g.id.toString()) : null
      );
      return billingAccount && billingAccount.billingType === 'transfer';
    })
  ) {
    return 'Virement';
  }
  const okGarages = garagesFound.filter((g) => {
    const billingAccount = allBillingAccounts.find((ba) =>
      ba.garageIds ? ba.garageIds.map((id) => id.toString()).includes(g.id.toString()) : null
    );
    return billingAccount && billingAccount.customerId && billingAccount.mandateId;
  });
  if (okGarages.length <= 0) return 'Pas reçu';
  if (okGarages.length < garagesFound.length) return 'Partiel';
  return 'Reçu';
};

/**
 * Generate Zoho UserID list
 */
const getZohoNameToUserId = async () => {
  const result = {};
  const bizDevAndPerfMan = await app.models.User.find({
    where: { or: [{ isBizDev: true }, { isPerfMan: true }] },
    fields: { id: 1, firstName: 1, lastName: 1 },
  });
  for (const user of bizDevAndPerfMan) {
    // eslint-disable-line no-restricted-syntax
    if (user.firstName && user.lastName)
      result[`${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`] = user.id.toString();
  }
  return result;
};

module.exports = {
  handleDealModifications: async (allZohoDeals) => {
    const updates = [];
    const allGSGarages = await app.models.Garage.find({
      where: {
        zohoDealUrl: { neq: null },
        doNotShowInZohoReport: { neq: true },
      },
      fields: {
        id: 1,
        status: 1,
        zohoDealUrl: 1,
        bizDevId: 1,
        performerId: 1,
        subscriptions: 1,
      },

    });
    const zohoNameToUserId = await getZohoNameToUserId();

    const allBillingAccounts = await app.models.BillingAccount.find({
      fields: { id: 1, garageIds: 1, customerId: 1, mandateId: 1, billingType: 1 },
    }); // eslint-disable-line
    for (const deal of allZohoDeals) {
      // eslint-disable-line no-restricted-syntax
      const garagesFound = allGSGarages.filter((g) => g.zohoDealUrl === `${DEAL_URL}/${deal.id}`);
      if (garagesFound && garagesFound.length) {
        for (const garage of garagesFound) {
          // eslint-disable-line no-restricted-syntax
          let change = false;
          if (!garage.bizDevId && deal.Owner && deal.Owner.name && zohoNameToUserId[deal.Owner.name.toLowerCase()]) {
            garage.bizDevId = zohoNameToUserId[deal.Owner.name.toLowerCase()];
            change = true;
          }
          if (
            !garage.performerId &&
            deal.Performance_manager &&
            zohoNameToUserId[deal.Performance_manager.toLowerCase()]
          ) {
            garage.performerId = zohoNameToUserId[deal.Performance_manager.toLowerCase()];
            change = true;
          }
          if (deal.Owner && deal.Owner.name && !zohoNameToUserId[deal.Owner.name.toLowerCase()]) {
            zoho.addlogs(`- ${deal.Owner.name} non trouvé sur GS.`);
          }
          if (deal.performerId && !zohoNameToUserId[deal.performerId.toLowerCase()]) {
            zoho.addlogs(`- ${deal.performerId} non trouvé sur GS.`);
          }
          if (change) {
            await app.models.Garage.findByIdAndUpdateAttributes(garage.id, {
              bizDevId: garage.bizDevId,
              performerId: garage.performerId,
            }); // eslint-disable-line
          }
        }
        const subscriptionPrice = garagesFound.reduce((acc, garage) => acc + sumGarageSubscriptionsPrices(garage), 0);
        updates.push({
          id: deal.id,
          last_api_update: formatZohoDate(new Date()),
          Nb_garages_miroirs_inclus: garagesFound.length,
          Montant_Abonnement: Math.round(subscriptionPrice * 100) / 100,
          Montant_Setup: garagesFound.reduce(sumGarageSetupPrices, 0),
          Etat: GarageStatus.values()
            .map((s) => ({ status: s, count: garagesFound.filter((g) => g.status === s).length }))
            .filter((e) => e.count)
            .map((e) => `${GarageStatus.displayName(e.status)}: ${e.count}`)
            .join(', '),
          Statut_GoCardLess: await getGoCardLessStatus(garagesFound, allBillingAccounts), // eslint-disable-line no-await-in-loop
        });
      }
    }
    return updates;
  },
};
