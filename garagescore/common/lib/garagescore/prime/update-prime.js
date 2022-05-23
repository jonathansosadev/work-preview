const { concurrentpromiseAll } = require('../../util/concurrentpromiseAll');

const {
  getGoCardless,
  _calcNbUsersByGarage,
  _calcXLeadSource,
  getUsersByGarages,
} = require('../../../../server/webservers-standalones/api/_common/bizdev-perfman-bonus');
const { ObjectID } = require('loopback-connector-mongodb');

/** return index of array with object */
const _searchIndexOf = (list, month, year) => {
  if (!list) return 0;
  return list.findIndex((price) => price.month === month && price.year === year);
};
/** get enabled subscription price */
const _garageSubscriptionPrice = (subscriptions) => {
  const price = {
    Maintenance: { code: 7061, price: 0 },
    NewVehicleSale: { code: 7061, price: 0 },
    UsedVehicleSale: { code: 7061, price: 0 },
    Lead: { code: 7061, price: 0 },
    EReputation: { code: 7066, price: 0 },
    VehicleInspection: { code: 7061, price: 0 },
    Analytics: { code: 7061, price: 0 },
    CrossLeads: { code: 7068, price: 0 },
    Automation: { code: 7068, price: 0 },
  };

  for (const type in price) {
    if (subscriptions[type]) {
      price[type].price = subscriptions[type].price && subscriptions[type].enabled ? subscriptions[type].price : 0;
    }
  }
  return price;
};

const _compareMonthPrice = (currentSubscription, previousSubscription) => {
  const profit = new Map();

  for (const type in currentSubscription.price) {
    if (
      !['xLeadSource', 'Users'].includes(type) &&
      currentSubscription.price[type].price - previousSubscription.price[type].price !== 0
    ) {
      const value = {
        code: currentSubscription.price[type].code,
        price: currentSubscription.price[type].price - previousSubscription.price[type].price,
      };
      profit.set(type, value);
    }
  }
  return profit;
};
/** calculate total subscriptions, xLeadSource and nbUsers for performer user */
const _aggregateMonthPriceHistory = async (app, userId, month, year) => {
  const query = [
    {
      $match: {
        performerId: userId.toString(),
      },
    },
    {
      $unwind: '$monthPriceHistory',
    },
    {
      $match: {
        'monthPriceHistory.month': month,
        'monthPriceHistory.year': year,
      },
    },
    {
      $group: {
        _id: null,
        Maintenance: { $sum: '$monthPriceHistory.price.Maintenance.price' },
        NewVehicleSale: { $sum: '$monthPriceHistory.price.NewVehicleSale.price' },
        UsedVehicleSale: { $sum: '$monthPriceHistory.price.UsedVehicleSale.price' },
        Lead: { $sum: '$monthPriceHistory.price.Lead.price' },
        EReputation: { $sum: '$monthPriceHistory.price.EReputation.price' },
        VehicleInspection: { $sum: '$monthPriceHistory.price.VehicleInspection.price' },
        Analytics: { $sum: '$monthPriceHistory.price.Analytics.price' },
        CrossLeads: { $sum: '$monthPriceHistory.price.CrossLeads.price' },
        Users: { $sum: '$monthPriceHistory.price.Users.price' },
        Automation: { $sum: '$monthPriceHistory.price.Automation.price' },
        xLeadSource: { $sum: '$monthPriceHistory.price.xLeadSource.price' },
        nbUsers: { $sum: '$monthPriceHistory.price.Users.nbUsers' },
      },
    },
    {
      $project: {
        subTotal: {
          $sum: [
            '$Maintenance',
            '$NewVehicleSale',
            '$UsedVehicleSale',
            '$Lead',
            '$EReputation',
            '$VehicleInspection',
            '$Analytics',
            '$Automation',
            '$CrossLeads',
          ],
        },
        uTotal: '$Users',
        xTotal: '$xLeadSource',
        nbUsers: '$nbUsers',
      },
    },
  ];

  const [result] = await app.models.Garage.getMongoConnector().aggregate(query).toArray();
  return {
    subTotal: result ? result.subTotal : 0,
    uTotal: result ? result.uTotal : 0,
    xTotal: result ? result.xTotal : 0,
    nbUsers: result ? result.nbUsers : 0,
  };
};
/**
 * return details for each garage like this :
 * [ {garageId,  name, group, details}, {garageId,  name, group, details} ]
 */
const _perfmanDetailsGarages = async (app, performerId, month, year) => {
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const result = [];
  const garages = await app.models.Garage.getMongoConnector()
    .find({ performerId: performerId.toString() })
    .project({
      _id: 1,
      monthPriceHistory: 1,
      publicDisplayName: 1,
      group: 1,
    })
    .toArray();

  for (const garage of garages) {
    const currentMonthHistory = garage.monthPriceHistory.find((m) => m.month === month && m.year === year);
    const previousMonthHistory = garage.monthPriceHistory.find(
      (m) => m.month === previousMonth && m.year === previousYear
    );
    if (currentMonthHistory && previousMonthHistory) {
      const detail = _compareMonthPrice(currentMonthHistory, previousMonthHistory);
      if (detail.size > 0) {
        result.push({
          garageId: garage._id,
          name: garage.publicDisplayName,
          group: garage.group,
          profit: Object.fromEntries(detail),
        });
      }
    } else {
      console.log(`garage nok : ${garage.publicDisplayName} - ${garage._id}`);
    }
  }
  return result;
};

/** check if GoCardless status, if true, assign current month  */
const checkFalseGoCardLess = async (app) => {
  try {
    const users = await app.models.User.find({
      where: { isBizDev: true },
      fields: { id: true, monthPrimeHistory: true },
    });
    const goCardLessTrue = await getGoCardless();
    for (const user of users) {
      let change = false;
      for (const month of user.monthPrimeHistory) {
        if (month.goCardLess === false && goCardLessTrue.includes(month.garageId.toString())) {
          month.month = new Date().getMonth();
          month.goCardLess = true;
          change = true;
        }
      }
      if (change) {
        await app.models.User.findByIdAndUpdateAttributes(user.id, { monthPrimeHistory: user.monthPrimeHistory });
      }
    }
    console.log('update bizdev GoCardLess false done');
  } catch (err) {
    console.log('Error on checkFalseGoCardLess: ', err);
    process.exit(1);
  }
};
/** perfman: calculate total users, total subscription and xLeadSource source for every garages
 * the function retrieve the lastMonth and save the changes the following month;
 * create data for the currentMonth to see the changes in real time in the greybo interface
 */
const addMonthPerfUsersHistory = async (app, month, year) => {
  try {
    const perfMen = await app.models.User.find({
      where: { isPerfMan: true },
      fields: { id: true, monthPerfHistory: true },
    });

    for (const { id, monthPerfHistory } of perfMen) {
      let updateMonthPerfHistory = [];
      if (monthPerfHistory && monthPerfHistory.length) {
        updateMonthPerfHistory = [...monthPerfHistory];
      }
      const previousMonth = month === 0 ? 11 : month - 1;
      const previousYear = month === 0 ? year - 1 : year;
      const currentMonth = await _aggregateMonthPriceHistory(app, id, month, year);
      const lastMonth = await _aggregateMonthPriceHistory(app, id, previousMonth, previousYear);
      const details = await _perfmanDetailsGarages(app, id, month, year);
      const indexOfLastMonth = _searchIndexOf(updateMonthPerfHistory, previousMonth, previousYear);
      let perfManLastMonthResult = {};
      if (!updateMonthPerfHistory || updateMonthPerfHistory.length < 1 || indexOfLastMonth < 0) {
        // if new perfman, create new monthPerf data
        perfManLastMonthResult = {
          month: previousMonth,
          year: previousYear,
          uTotal: 0,
          uTotalPrev: lastMonth.uTotal,
          subTotal: 0,
          subTotalPrev: lastMonth.subTotal,
          xTotal: 0,
          xTotalPrev: lastMonth.xTotal,
          nbUsers: 0,
          details: [],
        };
      } else {
        perfManLastMonthResult = updateMonthPerfHistory[indexOfLastMonth];
      }

      perfManLastMonthResult.uTotal = currentMonth.uTotal;
      perfManLastMonthResult.subTotal = currentMonth.subTotal;
      perfManLastMonthResult.xTotal = Math.abs(currentMonth.xTotal);
      perfManLastMonthResult.nbUsers = currentMonth.nbUsers;
      perfManLastMonthResult.details = details;
      if (indexOfLastMonth > 0) {
        updateMonthPerfHistory[indexOfLastMonth] = perfManLastMonthResult;
      } else {
        updateMonthPerfHistory.push(perfManLastMonthResult);
      }

      const nextMonth = {
        month,
        year,
        uTotal: 0,
        uTotalPrev: currentMonth.uTotal,
        subTotal: 0,
        subTotalPrev: currentMonth.subTotal,
        xTotal: 0,
        xTotalPrev: Math.abs(currentMonth.xTotal),
        nbUsers: currentMonth.nbUsers,
      };
      const indexOf = _searchIndexOf(updateMonthPerfHistory, month, year);
      if (indexOf > 0) {
        // if existe, replace the result (like rollback)
        updateMonthPerfHistory.splice(indexOf, 1, nextMonth);
      } else {
        updateMonthPerfHistory.push(nextMonth);
      }

      await app.models.User.getMongoConnector().updateOne(
        { _id: ObjectID(id.toString()) },
        { $set: { monthPerfHistory: updateMonthPerfHistory } }
      );
    }
    console.log(`update ${perfMen.length} performance manager done.`);
  } catch (err) {
    console.log('Error on addMonthPerfUsersHistory: ', err);
    process.exit(1);
  }
};
/* update if bizDev get a bonus/malus */
const _saveBizdev = async (app, garage, profit, users, goCardLessTrue, month, year) => {
  const validBizDevId = garage.bizDevId ? garage.bizDevId : null;
  const bizdev = users.find((u) => u.id.toString() === validBizDevId);

  if (bizdev) {
    const result = {
      garageId: garage._id,
      goCardLess: goCardLessTrue.includes(garage._id.toString()),
      name: garage.publicDisplayName,
      group: garage.group,
      month: goCardLessTrue.includes(garage._id.toString()) ? month : null,
      year,
      profit,
    };

    if (bizdev.monthPrimeHistory) {
      const indexOf = bizdev.monthPrimeHistory.findIndex(
        (prime) => prime.garageId.toString() === garage._id.toString()
      );
      if (indexOf > 0) {
        bizdev.monthPrimeHistory.splice(indexOf, 1, result);
      } else {
        bizdev.monthPrimeHistory.push(result);
      }
    } else {
      // new bizdev, create an array
      bizdev.monthPrimeHistory = [result];
    }

    await app.models.User.findByIdAndUpdateAttributes(bizdev.id, { monthPrimeHistory: bizdev.monthPrimeHistory });
    return 'ok'; // for unit test;
  }
};
/**
 * compare currrent subscriptions with a subscription in monthPriceHistory
 */
const bizDevBonus = async (app, month, year) => {
  const users = await app.models.User.find({
    where: { isBizDev: true },
    fields: { id: 1, monthPrimeHistory: 1 },
  });
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const goCardLessTrue = await getGoCardless();
  const mongo = app.models.Garage.getMongoConnector();
  const garages = await mongo
    .find({})
    .project({
      _id: 1,
      subscriptions: 1,
      monthPriceHistory: 1,
      publicDisplayName: 1,
      group: 1,
      bizDevId: 1,
    })
    .toArray();

  for (const garage of garages) {
    const currrentMonthPrice = garage.monthPriceHistory.find((m) => m.month === month && m.year === year);
    const previousMonthPrice = garage.monthPriceHistory.find((m) => m.month === prevMonth && m.year === prevYear);
    if (currrentMonthPrice && previousMonthPrice) {
      const result = _compareMonthPrice(currrentMonthPrice, previousMonthPrice);
      if (result.size > 0) {
        await _saveBizdev(app, garage, result, users, goCardLessTrue, prevMonth, prevYear);
      }
    } else {
      console.log(`garage nok : ${garage.publicDisplayName} - ${garage._id}`);
    }
  }
};

/**
 * save the current subscription in monthPriceHistory
 */
const addMonthPrice = async (app, month, year) => {
  try {
    const usersByGarage = await getUsersByGarages();
    const mongo = app.models.Garage.getMongoConnector();
    const garages = await mongo
      .find({})
      .project({
        _id: 1,
        subscriptions: 1,
        monthPriceHistory: 1,
        publicDisplayName: 1,
        group: 1,
      })
      .toArray();

    for (const garage of garages) {
      // create subscriptions for monthPriceHistory
      const price = _garageSubscriptionPrice(garage.subscriptions);

      price.Users = {
        code: 7065,
        price: 0,
      };
      // calculate nbUsers by garage
      if (garage.subscriptions.users && garage.subscriptions.active) {
        const users = _calcNbUsersByGarage(usersByGarage, garage);
        price.Users.price = users.price;
        price.Users.nbUsers = users.nbUsers;
      }
      price.xLeadSource = {
        code: 7069,
        price: 0,
      };
      // calculate xLeadSource source
      if (garage.subscriptions.CrossLeads && garage.subscriptions.active) {
        price.xLeadSource.price = await _calcXLeadSource(garage, app);
      }
      const garageMonthPrice = {
        month,
        year,
        active: garage.subscriptions.active,
        price,
      };

      const indexOf = _searchIndexOf(garage.monthPriceHistory, month, year);
      // replace result if exist
      if (indexOf > 0) {
        garage.monthPriceHistory.splice(indexOf, 1, garageMonthPrice);
      } else {
        garage.monthPriceHistory.push(garageMonthPrice);
      }
    }
    // save garages
    const updateGaragePromises = garages.map((garage) => () =>
      app.models.Garage.getMongoConnector().updateOne(
        { _id: garage._id },
        { $set: { monthPriceHistory: garage.monthPriceHistory } }
      )
    );

    await concurrentpromiseAll(updateGaragePromises, 500);

    console.log(`update ${garages.length} garages and bizdev done.`);
  } catch (err) {
    console.log('Error on addMonthPrice: ', err);
    process.exit(1);
  }
};

module.exports = {
  _calcNbUsersByGarage,
  _calcXLeadSource,
  _garageSubscriptionPrice,
  _perfmanDetailsGarages,
  _saveBizdev,
  _aggregateMonthPriceHistory,
  _compareMonthPrice,
  bizDevBonus,
  addMonthPrice,
  addMonthPerfUsersHistory,
  checkFalseGoCardLess,
};
