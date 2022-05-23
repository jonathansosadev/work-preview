const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const {
  _calcNbUsersByGarage,
  _perfmanDetailsGarages,
  _garageSubscriptionPrice,
  _saveBizdev,
  _compareMonthPrice,
  bizDevBonus,
  addMonthPerfUsersHistory,
  addMonthPrice,
  checkFalseGoCardLess,
} = require('../../../common/lib/garagescore/prime/update-prime');
const { DEFAULT_MAX_TOTAL_PRICE_FOR_USERS } = require('../../../common/lib/garagescore/automatic-billing/constants.js');

const { expect } = chai;
const app = new TestApp();

describe('prime bizdev and PM CRON', () => {
  beforeEach(async () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    await app.reset();
    await app.addUser({
      email: 'bbodrefaux@garagescore.com',
      godMode: true,
      isPerfMan: true,
      isBizDev: true,
      monthPrimeHistory: [],
      monthPerfHistory: [
        {
          month: month === 0 ? 11 : month - 1,
          year: month === 0 ? year - 1 : year,
          uTotal: 0,
          uTotalPrev: 0,
          subTotal: 0,
          subTotalPrev: 137.87,
          xTotal: 0,
          xTotalPrev: 0,
        },
      ],
    });
    const user = await app.models.User.findOne({});
    await app.addGarage({
      bizDevId: user.id,
      performerId: user.id,
      subscriptions: {
        priceValidated: false,
        Maintenance: {
          enabled: true,
          price: 100,
          date: null,
        },
        NewVehicleSale: {
          enabled: true,
          price: 37.87,
          date: null,
        },
        UsedVehicleSale: {
          enabled: false,
          price: 0,
          date: null,
        },
        Lead: {
          enabled: false,
          price: 0,
          date: null,
        },
        EReputation: {
          enabled: false,
          price: 1,
          date: null,
        },
        VehicleInspection: {
          enabled: false,
          price: null,
          date: null,
        },
        Analytics: {
          enabled: false,
          price: 0,
          date: null,
        },
        active: true,
        setup: {
          enabled: false,
          alreadyBilled: false,
        },
        users: {
          included: 0,
          price: 40,
        },
        contacts: { bundle: false, included: 0, every: 0, price: 0.19 },
      },
      monthPriceHistory: [
        {
          month: month === 0 ? 11 : month - 1,
          year: month === 0 ? year - 1 : year,
          active: true,
          price: {
            Maintenance: {
              code: 7061,
              price: 100,
            },
            NewVehicleSale: {
              code: 7061,
              price: 37,
            },
            UsedVehicleSale: {
              code: 7061,
              price: 0,
            },
            Lead: {
              code: 7061,
              price: 0,
            },
            EReputation: {
              code: 7066,
              price: 0,
            },
            VehicleInspection: {
              code: 7061,
              price: 0,
            },
            Analytics: {
              code: 7061,
              price: 0,
            },
            CrossLeads: {
              code: 7068,
              price: 0,
            },
            Users: {
              code: 7065,
              price: 5.94,
            },
            xLeadSource: {
              code: 7069,
              price: 0,
            },
          },
        },
        {
          month,
          year,
          active: true,
          price: {
            Maintenance: {
              code: 7061,
              price: 100,
            },
            NewVehicleSale: {
              code: 7061,
              price: 57.98,
            },
            UsedVehicleSale: {
              code: 7061,
              price: 0,
            },
            Lead: {
              code: 7061,
              price: 0,
            },
            EReputation: {
              code: 7066,
              price: 0,
            },
            VehicleInspection: {
              code: 7061,
              price: 0,
            },
            Analytics: {
              code: 7061,
              price: 0,
            },
            CrossLeads: {
              code: 7068,
              price: 0,
            },
            Users: {
              code: 7065,
              price: 0,
            },
            xLeadSource: {
              code: 7069,
              price: 0,
            },
          },
        },
      ],
    });
    const garage = await app.models.Garage.findOne({});
    const fieldsBilling = {
      name: 'Bob',
      externalId: '12345',
      accountingId: 'bob_test',
      email: 'bob@email.com',
      billingDate: '',
      address: '1 rue de la Gare',
      companyName: 'Bob corp',
      postalCode: '88888',
      city: 'Bob City',
      note: '',
      billingType: 'debit',
      dateNextBilling: '2019-05-30T20:59:59.999Z',
      goCardLessSetup: true,
      mandateId: 'MD00074KS37123',
      customerId: 'MD00074KS37456',
      technicalContact: 'contact@bob.com',
      accountingContact: 'contact2@john.com',
      RGPDContact: 'contact2@john.com',
      garageIds: [garage.id],
    };
    await app.models.BillingAccount.create(fieldsBilling);
  });

  it('it should should retrieve enabled price', () => {
    const subscription = {
      priceValidated: false,
      Maintenance: { enabled: true, price: 0 },
      NewVehicleSale: { enabled: true, price: 0 },
      UsedVehicleSale: { enabled: true, price: 0 },
      Lead: { enabled: true, price: 42 },
      EReputation: {},
      VehicleInspection: {},
      Analytics: { enabled: true, price: 0 },
      CrossLeads: {
        included: 0,
        unitPrice: 0,
        restrictMobile: false,
        minutePrice: 0,
      },
      Automation: {
        enabled: true,
        price: 0,
        included: 0,
        every: 0,
      },
      active: true,
      dateEnd: null,
      setup: {
        enabled: true,
        price: 133.33,
        monthOffset: 2,
        alreadyBilled: false,
      },
      users: { included: 3, price: 2.5 },
      contacts: { bundle: false, included: 0, every: 0, price: 0.12 },
    };

    const result = _garageSubscriptionPrice(subscription);
    expect(result.Lead.price).equal(42);
    expect(result.Lead.code).equal(7061);
  });

  it('it should save bizdev', async () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const profit = new Map();
    profit.set('Maintenance', { code: 7061, price: 0 });
    profit.set('NewVehicleSale', { code: 7061, price: 26.5 });
    profit.set('UsedVehicleSale', { code: 7061, price: 26.5 });
    profit.set('Lead', { code: 7061, price: 0 });
    profit.set('EReputation', { code: 7066, price: 19 });
    profit.set('VehicleInspection', { code: 7061, price: 0 });
    profit.set('Analytics', { code: 7061, price: 18 });

    const goCardLessTrue = [];
    const garage = await app.models.Garage.findOne({});
    garage._id = garage.id;
    const users = await app.models.User.find({});
    garage.bizDevId = users[0].id;

    const result = await _saveBizdev(app, garage, profit, users, goCardLessTrue, month, year);
    expect(result).equal('ok');
  });

  it('it should calculate nb users by garage', async () => {
    const garage = await app.models.Garage.findOne({});
    const user = await app.models.User.findOne({});
    const goCardLessTrue = {};
    goCardLessTrue[garage.id] = [
      {
        email: 'bob@email.com',
        garageIds: [garage.id],
        id: user.id,
      },
    ];

    const result = await _calcNbUsersByGarage(goCardLessTrue, garage);
    expect(result.price).equal(DEFAULT_MAX_TOTAL_PRICE_FOR_USERS);
  });

  it('it should save garage with correct value', async () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    await addMonthPrice(app, month, year, true);

    const garage = await app.models.Garage.findOne({});
    const result = garage.monthPriceHistory.pop();

    expect(result.price.Maintenance.price).equal(100);
    expect(result.price.Maintenance.code).equal(7061);
    expect(result.price.NewVehicleSale.price).equal(37.87);
    expect(result.price.NewVehicleSale.code).equal(7061);
  });

  it('it should save performance manager with correct value', async () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    await addMonthPerfUsersHistory(app, month, year);

    const result = await app.models.User.findOne({});
    // save result last month
    expect(result.monthPerfHistory[0].subTotal).equal(157.98);
    expect(result.monthPerfHistory[0].subTotalPrev).equal(137.87);
    // the result for current month is 0, and M-1 is 157.98
    expect(result.monthPerfHistory[1].subTotal).equal(157.98);
    expect(result.monthPerfHistory[1].subTotalPrev).equal(137.87);
  });

  it('it check goCardLess status and set Status to true', async () => {
    const garage = await app.models.Garage.findOne({});
    const addPrime = {
      garageId: garage.id,
      goCardLess: false, // shoulb be true after checkFalseGoCardLess()
      name: 'Top Garage - Auto Limas',
      group: 'Top Garage - Auto Limas',
      month: null,
      year: 2020,
      profit: {
        Maintenance: {
          code: 7061,
          price: 10,
        },
      },
    };
    const user = await app.models.User.findOne({});
    user.monthPrimeHistory.push(addPrime);

    await app.models.User.findByIdAndUpdateAttributes(user.id, { monthPrimeHistory: user.monthPrimeHistory });
    await checkFalseGoCardLess(app, false);
    const result = await app.models.User.findOne({});

    expect(result.monthPrimeHistory[0].goCardLess).equal(true);
  });

  it('it return details from function _perfmanDetailsGarages()', async () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const user = await app.models.User.findOne({ email: 'bbodrefaux@garagescore.com' });
    const [details] = await _perfmanDetailsGarages(app, user.id, month, year);

    expect(details.profit.NewVehicleSale.price).above(20.97);
  });
  it('it check if bizdev get a bonus or malus', async () => {
    const month = new Date().getMonth();
    const year = new Date().getFullYear();

    await bizDevBonus(app, month, year);

    const result = await app.models.User.findOne({ email: 'bbodrefaux@garagescore.com' });
    expect(result.monthPrimeHistory[0].profit.NewVehicleSale.price).to.be.above(0.869);
  });

  it('it should month Price _compareMonthPrice', (done) => {
    const currentMonthPrice = {
      active: true,
      price: {
        Maintenance: { code: 7061, price: 63.9 },
        NewVehicleSale: { code: 7061, price: 39.23 },
        UsedVehicleSale: { code: 7061, price: 10 },
        Lead: { code: 7061, price: 0 },
        EReputation: { code: 7066, price: 0 },
        VehicleInspection: { code: 7061, price: 0 },
        Analytics: { code: 7061, price: 0 },
        CrossLeads: { code: 7068, price: 0 },
        Users: { code: 7065, price: 0 },
        xLeadSource: { code: 7069, price: 0 },
      },
    };

    const previousMonthPrice = {
      active: true,
      price: {
        Maintenance: { code: 7061, price: 63.9 },
        NewVehicleSale: { code: 7061, price: 39.23 },
        UsedVehicleSale: { code: 7061, price: 0 },
        Lead: { code: 7061, price: 0 },
        EReputation: { code: 7066, price: 0 },
        VehicleInspection: { code: 7061, price: 0 },
        Analytics: { code: 7061, price: 0 },
        CrossLeads: { code: 7068, price: 0 },
        Users: { code: 7065, price: 0 },
        xLeadSource: { code: 7069, price: 0 },
      },
    };
    // both subscription is active
    const active = _compareMonthPrice(currentMonthPrice, previousMonthPrice);
    expect(active.get('UsedVehicleSale').price).equal(10);

    // subsciption current monthPrice is terminate
    currentMonthPrice.active = false;
    currentMonthPrice.price.Maintenance.price = 0;
    currentMonthPrice.price.NewVehicleSale.price = 0;
    const terminate = _compareMonthPrice(currentMonthPrice, previousMonthPrice);
    expect(terminate.get('Maintenance').price).equal(-63.9);
    expect(terminate.get('NewVehicleSale').price).equal(-39.23);

    // current monthPrice is active, previous is terminate
    currentMonthPrice.active = true;
    currentMonthPrice.price.Maintenance.price = 51;
    currentMonthPrice.price.NewVehicleSale.price = 29;

    previousMonthPrice.active = false;
    previousMonthPrice.price.Maintenance.price = 0;
    previousMonthPrice.price.NewVehicleSale.price = 0;
    const jakpot = _compareMonthPrice(currentMonthPrice, previousMonthPrice);
    expect(jakpot.get('Maintenance').price).equal(51);
    expect(jakpot.get('NewVehicleSale').price).equal(29);
    done();
  });
});
