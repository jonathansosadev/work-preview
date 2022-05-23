'use strict';

const app = require('../../../server/server');
const { ObjectId } = require('mongodb');

const tva = {
  FR: 20,
  CH: 0,
  BE: 0,
  ES: 21,
  NL: 0,
  US: 6,
  NC: 0,
  MC: 20,
};

/*eslint-disable */
const addTva = async () => {
  const garages = await app.models.Garage.find({ where: {}, fields: { id: true, locale: true } });

  for (const garage of garages) {
    if (['fr_FR'].includes(garage.locale)) {
      await saveGarage(garage.id, tva.FR);
    } else if (['fr_NC'].includes(garage.locale)) {
      await saveGarage(garage.id, tva.NC);
    } else if (['en_US'].includes(garage.locale)) {
      await saveGarage(garage.id, tva.US);
    } else if (['fr_BE', 'nl_BE'].includes(garage.locale)) {
      await saveGarage(garage.id, tva.BE); // same TVA for BE, ES and NL
    } else if (['es_ES', 'ca_ES'].includes(garage.locale)) {
      await saveGarage(garage.id, tva.ES);
    } else if (['fr_MC'].includes(garage.locale)) {
      await saveGarage(garage.id, tva.MC);
    } else {
      await saveGarage(garage.id, tva.FR); // if no locale, set FR tva
    }
  }
};

const saveGarage = async (garageId, tvaValue) => {
  await app.models.Garage.findByIdAndUpdateAttributes(garageId, { tva: tvaValue });
};

const addCountryBillingAccount = async () => {
  const garages = await app.models.Garage.find({ where: {}, fields: { id: true, locale: true } });

  if (garages.length > 0) {
    for (const garage of garages) {
      if (['fr_FR', 'fr_NC', 'fr_MC'].includes(garage.locale)) {
        await saveBillingAccount(garage.id, 'FR');
      } else if (['en_US'].includes(garage.locale)) {
        await saveBillingAccount(garage.id, 'FR');
      } else if (['fr_BE'].includes(garage.locale)) {
        await saveBillingAccount(garage.id, 'FR');
      } else if (['nl_BE'].includes(garage.locale)) {
        await saveBillingAccount(garage.id, 'FR');
      } else if (['es_ES', 'ca_ES'].includes(garage.locale)) {
        await saveBillingAccount(garage.id, 'ES');
      } else {
        console.log(`no locale find for garage: ${garage.id}`);
      }
    }
  } else {
    // set account without garage with FR
    await saveBillingAccount(garage.id, 'FR');
  }
};

const saveBillingAccount = async (garageId, country) => {
  const billing = await app.models.BillingAccount.findOne({ where: { garageIds: ObjectId(garageId) } });
  if (billing) {
    await app.models.BillingAccount.findByIdAndUpdateAttributes(billing.id, { country: country });
  }
};

// start CRON
app.on('booted', async () => {
  try {
    console.log('==================add TVA garage');
    console.time('execution_time');
    await addTva(); // work !
    console.log('==================add country billing account');
    await addCountryBillingAccount(); // work !
    console.timeEnd('execution_time');
    console.log('==================end without error');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
});
