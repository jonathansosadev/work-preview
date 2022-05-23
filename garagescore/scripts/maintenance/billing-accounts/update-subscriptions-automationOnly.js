'use strict';

const { ObjectId } = require('mongodb');
const app = require('../../../server/server.js');
const GarageStatus = require('../../../common/models/garage.status');

let billy = null;

process.argv.forEach((val) => {
  if (ObjectId.isValid(val)) {
    billy = val;
  }
});

const updateGarages = async () => {
  const billyAccount = await app.models.BillingAccount.findById(billy);

  if (!billy || !billyAccount) {
    console.log('Missing or invalid billyAccount ID (ex: 5e592521df47d10015933bf9 )');
    process.exit(0);
  }

  const Garage = app.models.Garage.getMongoConnector();

  const result = await Garage.updateMany(
    {
      _id: {
        $in: billyAccount.garageIds,
      },
      $or: [{ status: GarageStatus.TO_PLUG }, { status: GarageStatus.READY }],
    },
    {
      $set: {
        'subscriptions.AutomationApv.enabled': true, // Automation APV (TEMPORAIRE) à True
        'subscriptions.AutomationVn.enabled': true, // Automation VN (TEMPORAIRE) à True
        'subscriptions.AutomationVo.enabled': true, // Automation VO (TEMPORAIRE) à True
        'subscriptions.users.price': 0, // Utilisateurs , le prix unitaire à 0
        'subscriptions.priceValidated': true, // Valider le prix de l'abonnement à true
      },
    }
  );
  console.log(`total garages modified Count: ${result.modifiedCount}`);
};

app.on('booted', async () => {
  try {
    console.log('=================update garages from billy account: ', billy);
    await updateGarages();
    console.log('=================script end without error');
  } catch (err) {
    console.log(err);
  }
  process.exit(0);
});
