const { expect } = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../../common/lib/test/test-app');
const DataTypes = require('../../../common/models/data/type/data-types');
const setGaragesFirstDataDay = require('../../../common/lib/garagescore/garage/set-garages-first-data-day');
const timeHelper = require('../../../common/lib/util/time-helper');

const testApp = new TestApp();

describe('Test automation campaigns:', () => {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should Update All DataTypes First Day For All Garages', async function () {
    let garage1 = await testApp.addGarage();
    let garage2 = await testApp.addGarage();
    let garage3 = await testApp.addGarage();

    await testApp.models.Data.getMongoConnector().insertMany([
      // Garage 1 has the whole package
      {
        garageId: garage1.id.toString(),
        type: DataTypes.MAINTENANCE,
        service: { providedAt: new Date('2019/01/01') },
      },
      {
        garageId: garage1.id.toString(),
        type: DataTypes.NEW_VEHICLE_SALE,
        service: { providedAt: new Date('2019/02/01') },
      },
      {
        garageId: garage1.id.toString(),
        type: DataTypes.NEW_VEHICLE_SALE,
        service: { providedAt: new Date('2016/02/01') },
      },
      {
        garageId: garage1.id.toString(),
        type: DataTypes.NEW_VEHICLE_SALE,
        service: { providedAt: new Date('2019/05/01') },
      },
      {
        garageId: garage1.id.toString(),
        type: DataTypes.USED_VEHICLE_SALE,
        service: { providedAt: new Date('2019/03/01') },
      },
      // Garage 2 only has sales
      {
        garageId: garage2.id.toString(),
        type: DataTypes.NEW_VEHICLE_SALE,
        service: { providedAt: new Date('2020/02/01') },
      },
      {
        garageId: garage2.id.toString(),
        type: DataTypes.USED_VEHICLE_SALE,
        service: { providedAt: new Date('2020/03/01') },
      },
    ]);

    await setGaragesFirstDataDay.setFirstDataDay();

    [garage1, garage2, garage3] = await testApp.models.Garage.getMongoConnector().find().toArray();

    expect(garage1.dataFirstDays.firstMaintenanceDay).to.equals(timeHelper.dayNumber(new Date('2019/01/01')));
    expect(garage1.dataFirstDays.firstNewVehicleSaleDay).to.equals(timeHelper.dayNumber(new Date('2016/02/01')));
    expect(garage1.dataFirstDays.firstUsedVehicleSaleDay).to.equals(timeHelper.dayNumber(new Date('2019/03/01')));
    expect(garage2.dataFirstDays.firstMaintenanceDay).to.equals(null);
    expect(garage2.dataFirstDays.firstNewVehicleSaleDay).to.equals(timeHelper.dayNumber(new Date('2020/02/01')));
    expect(garage2.dataFirstDays.firstUsedVehicleSaleDay).to.equals(timeHelper.dayNumber(new Date('2020/03/01')));
    expect(garage3.dataFirstDays.firstMaintenanceDay).to.equals(null);
    expect(garage3.dataFirstDays.firstNewVehicleSaleDay).to.equals(null);
    expect(garage3.dataFirstDays.firstUsedVehicleSaleDay).to.equals(null);
  });
});
