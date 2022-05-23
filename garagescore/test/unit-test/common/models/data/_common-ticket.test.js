const { ObjectId } = require('mongodb');
const { GarageTypes, LeadSaleTypes, DataTypes } = require('../../../../../frontend/utils/enumV2');
const { expect } = require('chai');
const TestApp = require('../../../../../common/lib/test/test-app');
const { getTicketDefaultManager } = require('../../../../../common/models/data/_common-ticket');

const app = new TestApp();

describe('getTicketDefaultManager', () => {
  const GLOBAL = {
    user: null,
    garage: null,
    leadDataByType: {}, // leadSaleType
    unsatisfiedDataByType: {}, // dataTypes
    garageVI: null,
    dataVI: null,
  };
  before(async () => {
    await app.reset();
    const user = await app.addUser();
    GLOBAL.user = await user.getInstance();
    /* create a garage with all possible ticket configurations */
    const garage = await app.addGarage({
      ticketsConfiguration: {
        ...LeadSaleTypes.values().reduce((acc, cv) => {
          acc[`Lead_${cv}`] = ObjectId(GLOBAL.user.id);
          return acc;
        }, {}),

        ...DataTypes.values().reduce((acc, cv) => {
          acc[`Unsatisfied_${cv}`] = ObjectId(GLOBAL.user.id);
          return acc;
        }, {}),
      },
    });
    GLOBAL.garage = await garage.getInstance();

    const garageVI = await app.addGarage({
      type: GarageTypes.VEHICLE_INSPECTION,
      ticketsConfiguration: {
        VehicleInspection: ObjectId(GLOBAL.user.id.toString()),
      },
    });
    GLOBAL.garageVI = await garageVI.getInstance();

    /* type : lead , datas for every leadSaleTypes */
    for (const type of LeadSaleTypes.values()) {
      GLOBAL.leadDataByType[type] = await app.models.Data.create({
        garageId: GLOBAL.garage.id,
        // not used in the test, but required to create the data
        type: DataTypes.MAINTENANCE,
        lead: {
          saleType: type,
        },
      });
    }

    /* type : unsatisfied , datas for every DataTypes */
    for (const type of DataTypes.values()) {
      GLOBAL.unsatisfiedDataByType[type] = await app.models.Data.create({
        garageId: GLOBAL.garage.id,
        type: type,
      });
    }

    /* garage type : VI */
    GLOBAL.dataVI = await app.models.Data.create({
      garageId: GLOBAL.garageVI.id,
      type: DataTypes.MAINTENANCE,
      lead: {
        saleType: LeadSaleTypes.MAINTENANCE,
      },
    });
  });

  it(`[garageType : ${GarageTypes.VEHICLE_INSPECTION}] : should return the correct default manager ID in an ObjectId format`, async () => {
    const res = getTicketDefaultManager('lead', GLOBAL.garageVI, GLOBAL.dataVI);

    expect(typeof res).to.equal('object');
    expect(res.equals(GLOBAL.user.id)).to.be.true;
  });

  it('[type : lead] : should return the correct default manager ID in an ObjectId format', async () => {
    for (const leadSaleType of LeadSaleTypes.values()) {
      const res = getTicketDefaultManager('lead', GLOBAL.garage, GLOBAL.leadDataByType[leadSaleType]);
      expect(typeof res, `Fails for leadSaleType ${leadSaleType}`).to.equal('object');
      expect(res.equals(GLOBAL.user.id), `Fails for leadSaleType ${leadSaleType}`).to.be.true;
    }
  });

  it('[type : unsatisfied] : should return the correct default manager ID in an ObjectId format', async () => {
    for (const dataType of DataTypes.values()) {
      const res = getTicketDefaultManager('unsatisfied', GLOBAL.garage, GLOBAL.unsatisfiedDataByType[dataType]);
      expect(typeof res, `Fails for dataType ${dataType}`).to.equal('object');
      expect(res.equals(GLOBAL.user.id), `Fails for dataType ${dataType}`).to.be.true;
    }
  });
});
