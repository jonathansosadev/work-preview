const { ObjectId } = require('mongodb');
const { promisify } = require('util');
const app = require('../../../server/server');
const { SIMON, log } = require('../../../common/lib/util/log.js');

const CronRunner = require('../../../common/lib/cron/runner');
const { synchronizeGarages } = require('../../../common/lib/util/google-place-api.js');
const AlertType = require('../../../common/models/alert.types');
const ContactService = require('../../../common/lib/garagescore/contact/service');
const ContactTypes = require('../../../common/models/contact.type');
const GarageStatus = require('../../../common/models/garage.status');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

const sendEmail = promisify(ContactService.prepareForSend).bind(ContactService);

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Synchronise all garages with google place details',
  forceExecution: process.argv.includes('--force'),
});

/**
 * This is a option which is activated at a rating of 4.6
 * It will display a last page in the surveys so the clients can go to the google place to post a review
 * */
const handleGoogleCampaignStatus = async (garages) => {
  log.info(SIMON, `Starting handleGoogleCampaignStatus for all given garages...`);
  for (const { _id, status, googleCampaignLock, googleCampaignActivated, googlePlace, type } of garages) {
    let alertType = null;
    // Skip when google Campaign status is locked or when the garage isn't affected
    if (
      googleCampaignLock ||
      ![GarageStatus.RUNNING_AUTO, GarageStatus.RUNNING_MANUAL].includes(status) ||
      !googlePlace
    ) {
      continue;
    }
    let activated = parseFloat(googlePlace.rating || '0') < 4.6;
    // Skip when there is no changes
    if (googleCampaignActivated === activated) continue;
    alertType = activated ? AlertType.GOOGLE_CAMPAIGN_ACTIVATED : AlertType.GOOGLE_CAMPAIGN_DESACTIVATED;
    const mongo = app.models.Garage.getMongoConnector();
    await mongo.updateOne({ _id }, { $set: { googleCampaignActivated: activated } });
    const users = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(_id, { id: 1, email: 1 });
    if (!users) continue;
    for (const user of users) {
      await sendEmail({
        to: user.email,
        from: 'no-reply@custeed.com',
        sender: 'GarageScore',
        type: ContactTypes.ALERT_EMAIL,
        payload: {
          garageId: _id.toString(),
          alertType,
          alertId: 666,
          addresseeId: user.getId().toString(),
          garageType: type,
        },
      });
    }
    log.info(SIMON, `googleCampaignActivated updated to ${activated} for ${_id.toString()} and alert sent`);
  }
  log.info(SIMON, `handleGoogleCampaignStatus done with success !`);
};

app.on('booted', async () => {
  const mongo = app.models.Garage.getMongoConnector();
  const projection = {
    googleCampaignLock: 1,
    googleCampaignActivated: 1,
    status: 1,
    googlePlaceId: 1,
    googlePlace: 1,
    streetAddress: 1,
    postalCode: 1,
    city: 1,
    region: 1,
    subRegion: 1,
    phone: 1,
    googlePlaceHistory: 1,
    type: 1,
  };
  // Run without cron-runner for one garage
  if (ObjectId.isValid(process.argv[2])) {
    log.warning(SIMON, `Starting retrieve for ONE garage: ${process.argv[2]}`);
    const garages = await mongo.find({ _id: ObjectId(process.argv[2]) }, { projection }).toArray();
    const allGaragesUpdated = await synchronizeGarages(garages);
    // #4251 Removed google campaign
    //if (allGaragesUpdated) await handleGoogleCampaignStatus(allGaragesUpdated);
    process.exit(0);
  }

  runner.execute = async (option, callback) => {
    if (new Date().getDay() !== 1 && !process.argv.includes('--force')) {
      log.info(SIMON, 'Data only updated on mondays (api calls are too expensive)');
      callback();
      return;
    }
    const garages = await mongo
      .find(
        {
          status: { $nin: [GarageStatus.STOPPED] },
          _id: { $nin: [...GaragesTest.values().map((id) => new ObjectId(id))] },
        },
        { projection }
      )
      .toArray();
    const allGaragesUpdated = await synchronizeGarages(garages);
    // #4251 Removed google campaign
    //if (allGaragesUpdated) await handleGoogleCampaignStatus(allGaragesUpdated);
    callback();
  };
  runner.run((err) => {
    if (err) console.error(err);
    process.exit(err ? -1 : 0);
  });
});
