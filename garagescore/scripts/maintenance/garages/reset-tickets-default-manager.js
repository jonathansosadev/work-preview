const app = require('../../../server/server');
const { ObjectID } = require('mongodb');
const GarageTypes = require('../../../common/models/garage.type');

const argv = process.argv.slice(2);
// If --force it will reset all default tickets configs for every garage
// If not it will only set the missing ones
const forceReset = argv.includes('--force');

app.on('booted', async () => {
  const garages = await app.models.Garage.find({});
  const usersFields = { id: true, createdAt: true, job: true, firstName: true, lastName: true };

  for (const garage of garages) {
    let garageNeedSaving = false;

    // 1. If the garage is a VehicleInspection
    if (garage.type === GarageTypes.VEHICLE_INSPECTION) {
      if (!garage.ticketsConfiguration || !garage.ticketsConfiguration.VehicleInspection || forceReset) {
        const users = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(garage.id.toString(), usersFields);
        users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const user = users.find((u) => u.job === 'Directeur de centre') || users[0];

        garage.ticketsConfiguration = {};
        garage.ticketsConfiguration.VehicleInspection = user ? new ObjectID(user.id.toString()) : null;
        garageNeedSaving = true;
        if (user) {
          console.log(
            `${garage.publicDisplayName} @ VehicleInspection --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
          );
        }
      }
    }

    // 2. If it's any other kind of garage
    if (garage.type !== GarageTypes.VEHICLE_INSPECTION) {
      if (
        forceReset ||
        !garage.ticketsConfiguration ||
        !garage.ticketsConfiguration.Unsatisfied_Maintenance ||
        !garage.ticketsConfiguration.Unsatisfied_NewVehicleSale ||
        !garage.ticketsConfiguration.Unsatisfied_UsedVehicleSale ||
        !garage.ticketsConfiguration.Lead_Maintenance ||
        !garage.ticketsConfiguration.Lead_NewVehicleSale ||
        !garage.ticketsConfiguration.Lead_UsedVehicleSale
      ) {
        const users = await app.models.Garage.getUsersForGarageWithoutCusteedUsers(garage.id.toString(), usersFields);
        users.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (!garage.ticketsConfiguration || forceReset) {
          garage.ticketsConfiguration = {};
          garageNeedSaving = true;
        }

        if (!garage.ticketsConfiguration.Unsatisfied_Maintenance || forceReset) {
          const user =
            users.find((u) => u.job === "Chef d'atelier concession") ||
            users.find((u) => u.job === 'Directeur de concession') ||
            users[0]; // eslint-disable-line
          garage.ticketsConfiguration.Unsatisfied_Maintenance = user ? new ObjectID(user.id.toString()) : null;
          garageNeedSaving = true;
          if (user) {
            console.log(
              `${garage.publicDisplayName} @ Unsatisfied APV --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
            );
          }
        }

        if (!garage.ticketsConfiguration.Unsatisfied_NewVehicleSale || forceReset) {
          const user =
            users.find((u) => u.job === 'Responsable des ventes VN concession') ||
            users.find((u) => u.job === 'Responsable des ventes VN & VO concession') ||
            users.find((u) => u.job === 'Directeur de concession') ||
            users[0];
          garage.ticketsConfiguration.Unsatisfied_NewVehicleSale = user ? new ObjectID(user.id.toString()) : null;
          garageNeedSaving = true;
          if (user) {
            console.log(
              `${garage.publicDisplayName} @ Unsatisfied VN --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
            );
          }
        }

        if (!garage.ticketsConfiguration.Unsatisfied_UsedVehicleSale || forceReset) {
          const user =
            users.find((u) => u.job === 'Responsable des ventes VO concession') ||
            users.find((u) => u.job === 'Responsable des ventes VN & VO concession') ||
            users.find((u) => u.job === 'Directeur de concession') ||
            users[0];
          garage.ticketsConfiguration.Unsatisfied_UsedVehicleSale = user ? new ObjectID(user.id.toString()) : null;
          garageNeedSaving = true;
          if (user) {
            console.log(
              `${garage.publicDisplayName} @ Unsatisfied VO --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
            );
          }
        }

        if (!garage.ticketsConfiguration.Lead_Maintenance || forceReset) {
          const eligibleJobs = [
            'Responsable marketing concession',
            'Responsable digital',
            'Secrétariat atelier',
            "Chef d'atelier concession",
            'Directeur de concession',
          ];
          const [user] = [...eligibleJobs.map((job) => users.find((u) => u.job === job)), users[0]].filter((e) => e);
          garage.ticketsConfiguration.Lead_Maintenance = user ? new ObjectID(user.id.toString()) : null;
          garageNeedSaving = true;
          if (user) {
            console.log(
              `${garage.publicDisplayName} @ Lead APV --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
            );
          }
        }

        if (!garage.ticketsConfiguration.Lead_NewVehicleSale || forceReset) {
          const user =
            users.find((u) => u.job === 'Responsable des ventes VN concession') ||
            users.find((u) => u.job === 'Responsable des ventes VN & VO concession') ||
            users.find((u) => u.job === 'Directeur de concession') ||
            users[0];
          garage.ticketsConfiguration.Lead_NewVehicleSale = user ? new ObjectID(user.id.toString()) : null;
          garageNeedSaving = true;
          if (user) {
            console.log(
              `${garage.publicDisplayName} @ Lead VN --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
            );
          }
        }

        if (!garage.ticketsConfiguration.Lead_UsedVehicleSale || forceReset) {
          const user =
            users.find((u) => u.job === 'Responsable des ventes VO concession') ||
            users.find((u) => u.job === 'Responsable des ventes VN & VO concession') ||
            users.find((u) => u.job === 'Directeur de concession') ||
            users[0];
          garage.ticketsConfiguration.Lead_UsedVehicleSale = user ? new ObjectID(user.id.toString()) : null;
          garageNeedSaving = true;
          if (user) {
            console.log(
              `${garage.publicDisplayName} @ Lead VO --> ${user.firstName} ${user.lastName}, ${user.job} Is The New Default Manager`
            );
          }
        }
      }
    }

    // 3. We save modifications
    if (garageNeedSaving) {
      await garage.save();
    }
  }
  console.log('Done.');
  process.exit(0);
});
