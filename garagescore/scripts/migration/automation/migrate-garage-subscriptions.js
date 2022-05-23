/* eslint-disable no-restricted-syntax */
/* I will do that using loopback because it's simple and I guess perfs won't be so bad */
const app = require('../../../server/server');
const GarageTypes = require('../../../common/models/garage.type.js');
const { ANASS, time, timeEnd } = require('../../../common/lib/util/log');

const buildAvailableServices = ({
  type: garageType,
  subscriptions: { Maintenance, NewVehicleSale, UsedVehicleSale, VehicleInspection },
}) => ({
  Maintenance: Maintenance && Maintenance.enabled && garageType !== GarageTypes.VEHICLE_INSPECTION,
  NewVehicleSale: NewVehicleSale && NewVehicleSale.enabled && garageType !== GarageTypes.VEHICLE_INSPECTION,
  UsedVehicleSale: UsedVehicleSale && UsedVehicleSale.enabled && garageType !== GarageTypes.VEHICLE_INSPECTION,
  VehicleInspection: VehicleInspection && VehicleInspection.enabled && garageType === GarageTypes.VEHICLE_INSPECTION,
});

const buildSatisfactionSub = ({ subscriptions, subscriptions: { availableServices } }) => {
  const enabledServices = Object.keys(availableServices).filter((service) => availableServices[service]);
  const enabled = !!enabledServices.length;
  const price = enabledServices
    .map((service) => subscriptions[service] && subscriptions[service].price)
    .reduce((r, p) => (r += p), 0);
  const date = enabled
    ? new Date(
        Math.min(
          ...enabledServices.map((service) => subscriptions[service] && (subscriptions[service].date || new Date()))
        )
      )
    : null;
  return { enabled, price, date, selectedServices: availableServices };
};

const cleanGarageSubscriptions = (subscriptions) => {
  const toRemove = ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale', 'VehicleInspection'];
  return Object.fromEntries(Object.entries(subscriptions).filter(([key]) => !toRemove.includes(key)));
};

app.on('booted', async () => {
  const allGarages = await app.models.Garage.find({});
  time(ANASS, `Processing all garages ${allGarages.length}`);
  let i = 0;

  for (const garage of allGarages) {
    if ((allGarages.length - i) % 100 === 0) {
      console.log(`${i}/${allGarages.length} garages processed`);
    }
    garage.subscriptions.availableServices = buildAvailableServices(garage);
    garage.subscriptions.Satisfaction = buildSatisfactionSub(garage);
    garage.subscriptions.__data = cleanGarageSubscriptions(garage.subscriptions.__data);
    await garage.save();

    i++;
  }

  timeEnd(ANASS, `Processing all garages ${allGarages.length}`);

  process.exit(0);
});
