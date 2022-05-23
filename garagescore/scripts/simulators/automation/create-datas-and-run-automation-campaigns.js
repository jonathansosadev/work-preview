'use strict';

/** Create test datas for the garage dupond running campaigns and re-run today campaign to send the contacts */
const MongoObjectID = require('mongodb').ObjectID;
const app = require('../../../server/server');
const timeHelper = require('../../../common/lib/util/time-helper');
const automationAddDatasToCustomer = require('../../../workers/jobs/scripts/automation-add-datas-to-customer');
const { GaragesTest } = require('../../../frontend/utils/enumV2');
const garageId = GaragesTest.VEHICULE_INSPECTION_CENTRE;

async function _addData(dataType, dayNumber, customerEmail, customerPhone, firstName, lastName) {
  const data = new app.models.Data({
    garageId,
    type: dataType,
    shouldSurfaceInStatistics: true,
    service: {
      providedAt: timeHelper.dayNumberToDate(dayNumber),
    },
    customer: {
      firstName: {
        value: firstName,
      },
      lastName: {
        value: lastName,
      },
      fullName: {
        value: `${firstName} ${lastName}`,
      },
      contact: {
        email: {
          value: customerEmail || null,
        },
        mobilePhone: {
          value: customerPhone || null,
        },
      },
    },
  });
  await data.save();
  await automationAddDatasToCustomer({
    payload: {
      dataIds: [data.getId().toString()],
    },
  });
}

async function main([type, firstName, lastName, contact, contact2]) {
  if (!contact) {
    console.error('Missing arguments, run with args `type firstName lastName contact`');
    console.error('type must be j+90_apv , m+11_apv or m+11_sale');
    process.exit();
  }
  let customerEmail = contact.includes('@') && contact;
  let customerPhone = !contact.includes('@') && contact;
  if (contact2 && !customerEmail) {
    customerEmail = contact2.includes('@') && contact2;
  }
  if (contact2 && !customerPhone) {
    customerPhone = !contact2.includes('@') && contact2;
  }
  const today = new Date();
  const todayDayNumber = timeHelper.dayNumber(today);
  // timeHelper.dayNumber(dataDate)
  console.log('Adding customers...');
  if (type === 'j+90_apv') {
    // J+90
    let offset = 0;
    const dataDate = new Date();
    dataDate.setDate(today.getDate() - (90 + offset));
    await _addData('Maintenance', timeHelper.dayNumber(dataDate), customerEmail, customerPhone, firstName, lastName);
  } else if (type === 'm+11_apv') {
    // Relance annuelle - Apv > Apv
    const dataDate = new Date();
    dataDate.setMonth(today.getMonth() - 11);
    await _addData('Maintenance', timeHelper.dayNumber(dataDate), customerEmail, customerPhone, firstName, lastName);
  } else if (type === 'm+11_sale') {
    // Relance annuelle - Vn > Apv
    const dataDate = new Date();
    dataDate.setMonth(today.getMonth() - 11);
    await _addData('NewVehicleSale', timeHelper.dayNumber(dataDate), customerEmail, customerPhone, firstName, lastName);
  } else {
    console.error('type must be j+90_apv , m+11_apv or m+11_sale');
    process.exit();
  }

  console.log('Setting campaigns status...');
  // force running all campaign (right now they can be stopped (we are not in prod yet))
  app.models.AutomationCampaign.getMongoConnector().updateMany(
    {
      garageId: new MongoObjectID(garageId),
      frequency: 'DAILY',
    },
    {
      $set: { status: 'RUNNING', runDayNumber: todayDayNumber },
    }
  );

  console.log('Running campaign...');
  await app.models.AutomationCampaign.runCampaigns(timeHelper.dayNumberToDate(todayDayNumber), garageId);

  console.log('bye');
  process.exit();
}
app.on('booted', async () => {
  main(process.argv.slice(2));
});
