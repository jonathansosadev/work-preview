const { ObjectId } = require('mongodb');
const app = require('../../../server/server');

// catch up bizdev
// DELETED this when #3482 is closed

// remove duplicate object with same garage name
function removeDuplicates(array, key) {
  const lookup = new Set();
  return array.filter((obj) => !lookup.has(obj[key]) && lookup.add(obj[key]));
}

const catchUpMonitoringPM = async (app) => {
  const bizdevs = await app.models.User.find({
    where: { isBizDev: true },
    fields: { id: true, monthPrimeHistory: true },
  });
  const saveUsers = [];

  for (const biz of bizdevs) {
    console.log('====before:', biz.monthPrimeHistory.length);
    // delete duplicate
    let arrayWithoutDuplicate = removeDuplicates(biz.monthPrimeHistory, 'name');
    // remove price = 0 like:  Maintenance : { code : 7061, price : 0 },
    arrayWithoutDuplicate = arrayWithoutDuplicate.filter((subscriptions) => {
      let isNotZero = false;
      Object.keys(subscriptions.profit).forEach((type) => {
        if (subscriptions.profit[type].price !== 0) isNotZero = true;
      });
      if (isNotZero) return subscriptions;
    });
    // update
    saveUsers.push(
      app.models.User.findByIdAndUpdateAttributes(biz.id, {
        monthPrimeHistory: arrayWithoutDuplicate,
      }),
    );
    console.log('====after:', arrayWithoutDuplicate.length);
  }

  await Promise.all(saveUsers);
  console.log(`__________Update ${bizdevs.length} Bizdev`);
};

const catchUpPerfMen = async (app) => {
  const perfMen = await app.models.User.find({
    where: { isPerfMan: true },
    fields: { id: true, monthPerfHistory: true },
  });
  const saveUsers = [];

  for (const perfMan of perfMen) {
    // get last element on array
    const november = perfMan.monthPerfHistory.find((monthPerf) => monthPerf.month === 10 & monthPerf.year === 2020);
    const december = perfMan.monthPerfHistory.find((monthPerf) => monthPerf.month === 11 & monthPerf.year === 2020);
    november.uTotalPrev = november.uTotal;
    november.xTotal = Math.abs(november.xTotal);
    november.xTotalPrev = Math.abs(november.xTotal);
    december.xTotalPrev = Math.abs(december.xTotalPrev);
    // replace
    perfMan.monthPerfHistory[perfMan.monthPerfHistory.length - 2] = november;
    perfMan.monthPerfHistory[perfMan.monthPerfHistory.length - 1] = december;
    // update
    saveUsers.push(
      app.models.User.findByIdAndUpdateAttributes(perfMan.id, {
        monthPerfHistory: perfMan.monthPerfHistory,
      }),
    );
  }

  await Promise.all(saveUsers);
  console.log(`__________Update ${perfMen.length} perfMen`);
};

const renameXleadSource = async (app) => {
  const mongo = app.models.Garage.getMongoConnector();
  const garages = await mongo
    .find({})
    .project({
      _id: 1, monthPriceHistory: 1,
    })
    .toArray();
  // renamme xLeads to xLeadSource
  const saveGarages = garages.map((garage) => {
    garage.monthPriceHistory.forEach((monthPrice) => {
      monthPrice.price.xLeadSource = monthPrice.price.xLeads
      delete monthPrice.price.xLeads;
    });
    return app.models.Garage.findByIdAndUpdateAttributes(garage._id.toString(), {
      monthPriceHistory: garage.monthPriceHistory,
    });
  });

  await Promise.all(saveGarages);
  console.log(`__________Update xLeadSource ${saveGarages.length} garages`);
};

const addAutomationMonthPrice = async (app) => {
  const mongo = app.models.Garage.getMongoConnector();
  const garages = await mongo
    .find({})
    .project({ _id: 1, monthPriceHistory: 1 })
    .toArray();
  // set init Automation
  const saveGarages = garages.map((garage) => {
    garage.monthPriceHistory.forEach((monthPrice) => {
      monthPrice.price.Automation = {
        code: 7068, price: 0,
      };
    });
    return app.models.Garage.findByIdAndUpdateAttributes(garage._id.toString(), {
      monthPriceHistory: garage.monthPriceHistory,
    });
  });

  await Promise.all(saveGarages);
  console.log(`__________Update automation monthPrice ${saveGarages.length} garages`);
};

/** missing month 10 for this garages */
const fixedMissingMonthPrice = async (app) => {
  let garagIds = [
  '5fb647e1eb47b800035b2f5a',
  '5fb64c84eb47b800035b302c',
  '5fb64ec1eb47b800035b3088',
  '5fb65059eb47b800035b30bd',
  '5fb653f6eb47b800035b31b4',
  '5fb6554aeb47b800035b31eb',
  '5fc4c86ff38f000003569c04',
  '5faaad3f31a89d000314cca7',
  '5fb2a82ca3c4e60003bbad5e',
  '5fb3d333b66c5d00030bd368',
  '5fbb9747641b78000322c049',
  '5fbcd2def3935d00038da3f0',
  '5fc4fc1ef38f00000356ab25',
  '5fc4fcb8f38f00000356ab40',
  '5fc5341ab99d2f0003af48d3',
  '5faa5ffc31a89d000314bb31',
  '5fad7bdf349dfc00032c94a1',
  '5fad7dca349dfc00032c94b2',
  '5fad7faf349dfc00032c94c5',
  '5fad8121349dfc00032c94d8',
  '5fad82e4349dfc00032c94ff',
  '5fad8581349dfc00032c952a',
  '5fb3ded1b66c5d00030bd6c6',
  '5fb3ef63b66c5d00030bdaa3',
  '5fbb914c641b78000322bb24',
  '5fbb926d641b78000322bb73',
  '5fbb94de641b78000322bc0b',
  '5fbb9591641b78000322bc30',
  '5fbd42baf3935d00038dc0a8',
  '5fbfdd1f5695d3000375d4b9',
  '5fc2278189c5800003afc45e',
  '5fc22aa589c5800003afc4c7',
  '5fc22da789c5800003afc536',
  '5fc1252d5695d3000375f42a',
  '5fc51fa2b99d2f0003af462a',
  ];
  garagIds = garagIds.map((id) => ObjectId(id));

  const mongo = app.models.Garage.getMongoConnector();
  const garages = await mongo
    .find({ _id: { $in: garagIds } } )
    .project({ _id: 1, monthPriceHistory: 1 })
    .toArray();

  const saveGarages = garages.map((garage) => {
    const monthPrice = garage.monthPriceHistory.find((monthPerf) => monthPerf.month === 9 & monthPerf.year === 2020);
    const missingMonth = {...monthPrice};
    missingMonth.month = 10;
    garage.monthPriceHistory.push(missingMonth);

    return app.models.Garage.findByIdAndUpdateAttributes(garage._id.toString(), {
      monthPriceHistory: garage.monthPriceHistory,
    });
  });
  await Promise.all(saveGarages);
  console.log(`__________Fixed missing monthPrice ${saveGarages.length} garages`);
}

const _parseArgs = (args) => {
  let perfman = false;
  let automation = false;
  let bizdev = false;
  let missing = false;
  let rename = false;
  args.forEach((arg) => {
    if (/--perfman/.test(arg)) {
      perfman = true;
    }
    if (/--missing/.test(arg)) {
      missing = true;
    }
    if (/--automation/.test(arg)) {
      automation = true;
    }
    if (/--bizdev/.test(arg)) {
      bizdev = true;
    }
    if (/--rename/.test(arg)) {
      rename = true;
    }
  });

  return {
    perfman,
    missing,
    automation,
    bizdev,
    rename
  }
};

app.on('booted', async () => {
  try {
    const { perfman, automation, bizdev, missing, rename } = _parseArgs(process.argv);
    console.log('__________Start update PM for garages...');
    if (perfman) {
      await catchUpPerfMen(app);
    } 
    if (missing) {
      await fixedMissingMonthPrice(app);
    }
    if (automation) {
      await addAutomationMonthPrice(app);
    } 
    if (bizdev) {
      await catchUpMonitoringPM(app);
    }
    if (rename) {
      await renameXleadSource(app);
    }
    console.log('__________Script end without error');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
});
