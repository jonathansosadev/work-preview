const { promisify } = require('util');
const ContactType = require('../../../models/contact.type');
const AlertType = require('../../../models/alert.types');
const ContactService = require('../contact/service');
const garageStatuses = require('../../../models/garage.status');
const dataTypes = require('../../../models/data/type/data-types');
const { JS, log } = require('../../util/log');

// check if the last score for one type has enough positive reviews
const shouldBeVisibleForType = async (app, garage, type) => {
  const scores = await app.models.PublicScore.getMongoConnector().findOne(
    { garageId: garage._id, type },
    { sort: { synthesizedAt: -1 } }
  );
  return (
    scores &&
    scores.payload &&
    scores.payload.rating &&
    scores.payload.rating.global &&
    scores.payload.rating.global.value >= 8 &&
    scores.payload.rating.global.respondentsCount >= 20
  );
};

// check if the last scores for one garage have enough positive reviews
const shouldBeVisible = async (app, garage) => {
  if (!garage.dms) {
    return false;
  }
  const hasMaintenance = !!(garage.dms.mixed || garage.dms.Maintenances);
  const hasVN = !!(garage.dms.mixed || garage.dms.NewVehicleSales);
  const hasVO = !!(garage.dms.mixed || garage.dms.UsedVehicleSales);
  const hasVI = !!garage.dms.VehicleInspections;
  if (hasMaintenance && (await shouldBeVisibleForType(app, garage, dataTypes.MAINTENANCE))) {
    return true;
  }
  if (hasVO && (await shouldBeVisibleForType(app, garage, dataTypes.USED_VEHICLE_SALE))) {
    return true;
  }
  if (hasVN && (await shouldBeVisibleForType(app, garage, dataTypes.NEW_VEHICLE_SALE))) {
    return true;
  }
  if (hasVI && (await shouldBeVisibleForType(app, garage, dataTypes.VEHICLE_INSPECTION))) {
    return true;
  }
  return false;
};

const prepareForSend = promisify(ContactService.prepareForSend).bind(ContactService);
// check if we should allow crawlers on one garage, if true update the db and send an alert
const processGarage = async (app, garage) => {
  try {
    if (await shouldBeVisible(app, garage)) {
      log.info(JS, `Garage ${garage._id} should be visible`);
      // update db
      await app.models.Garage.getMongoConnector().updateOne(
        { _id: garage._id },
        { $set: { hideDirectoryPage: false } }
      );
      await prepareForSend({
        to: 'customer_success@custeed.com',
        from: 'no-reply@custeed.com',
        sender: 'GarageScore',
        type: ContactType.ALERT_EMAIL,
        payload: {
          garageId: garage._id.toString(),
          alertType: AlertType.AUTO_ALLOW_CRAWLERS, // eslint-disable-line
          updateAt: new Date(),
          alertId: 777,
          garageType: garage.type,
        },
      });
    }
  } catch (e) {
    log.error(JS, e);
  }
};

async function processAllGarages(app) {
  const status = [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL];
  const garages = await app.models.Garage.getMongoConnector()
    .find(
      { hideDirectoryPage: true, status: { $in: status }, disableAutoAllowCrawlers: { $ne: true } },
      { projection: { _id: true, disableAutoAllowCrawlers: true, dms: true, type: true } }
    )
    .toArray();
  log.info(JS, `Check ${garages.length} garages`);
  for (const garage of garages) {
    await processGarage(app, garage);
  }
  log.info(JS, 'Bye');
}
module.exports = {
  processAllGarages,
  processGarage,
};
