const app = require('../../../server/server');
const { ANASS, time, timeEnd } = require('../../../common/lib/util/log');

const rollbackGarages = async () => {
  time(ANASS, 'Rollback');
  try {
    await app.models.Garage.getMongoConnector().updateMany({}, { $unset: { surveySignature: 'plop' } });
    console.log('Rollback successful !');
  } catch (errRollback) {
    console.error('Error during rollback');
    console.error(errRollback);
    process.exit(42);
  }
  timeEnd(ANASS, 'Rollback');
};

const migrateGarages = async () => {
  time(ANASS, 'Migration');
  try {
    const getManagerProp = (key, type = '') => ({ $ifNull: [`$manager${type}.${key}`, ''] });
    const isManagerPropUndefined = (key, type) => ({
      $or: [{ $not: `$manager${type}.${key}` }, { $eq: [`$manager${type}.${key}`, ''] }],
    });
    const useDefaultCond = {
      $and: [
        isManagerPropUndefined('lastName', 'Apv'),
        isManagerPropUndefined('firstName', 'Apv'),
        isManagerPropUndefined('lastName', 'Vn'),
        isManagerPropUndefined('firstName', 'Vn'),
        isManagerPropUndefined('lastName', 'Vo'),
        isManagerPropUndefined('firstName', 'Vo'),
      ],
    };
    // Preparing the pipeline which will set the properties on surveySignature accordingly to the legacy managerXXX
    const updatePipeline = [
      {
        $set: {
          surveySignature: {
            useDefault: { $cond: [useDefaultCond, true, false] },
            defaultSignature: {
              lastName: getManagerProp('lastName'),
              firstName: getManagerProp('firstName'),
              job: getManagerProp('job'),
              phone: getManagerProp('phone'),
            },
            Maintenance: {
              lastName: getManagerProp('lastName', 'Apv'),
              firstName: getManagerProp('firstName', 'Apv'),
              job: getManagerProp('job', 'Apv'),
              phone: getManagerProp('phone', 'Apv'),
            },
            NewVehicleSale: {
              lastName: getManagerProp('lastName', 'Vn'),
              firstName: getManagerProp('firstName', 'Vn'),
              job: getManagerProp('job', 'Vn'),
              phone: getManagerProp('phone', 'Vn'),
            },
            UsedVehicleSale: {
              lastName: getManagerProp('lastName', 'Vo'),
              firstName: getManagerProp('firstName', 'Vo'),
              job: getManagerProp('job', 'Vo'),
              phone: getManagerProp('phone', 'Vo'),
            },
          },
        },
      },
    ];
    // Perform the Update
    await app.models.Garage.getMongoConnector().updateMany({}, updatePipeline);
    console.log('Migration successful !');
  } catch (errRollback) {
    console.error('Error during Migration');
    console.error(errRollback);
    process.exit(42);
  }
  timeEnd(ANASS, 'Migration');
};

const finalizeMigration = async () => {
  time(ANASS, 'Finalize');
  console.log('This is a cleanup, it will remove the previous values for managerXXX on garages');
  console.log(`If you ain't sure about what you do I give you 5 seconds to smash Ctrl+C to cancel the op`);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('Too late !');

  try {
    const updateObj = { $unset: { manager: '', managerApv: '', managerVn: '', managerVo: '' } };
    await app.models.Garage.getMongoConnector().updateMany({}, updateObj);
    console.log('Finalize successful !');
  } catch (errRollback) {
    console.error('Error during Finalize');
    console.error(errRollback);
    process.exit(42);
  }
  timeEnd(ANASS, 'Finalize');
};

const parseArgs = (args) => {
  const helpRequested = ['-h', '--help'].some((opt) => args.includes(opt));
  if (helpRequested) {
    console.log('Migrates the garages managerXXX into a surveySignature property');
    console.log('To migrate: Use -m | -M | --migrate | --go | --run');
    console.log('To delete the previous managerXXX props: Use --finalize | --final | --clean');
    console.log(`To rollback (provided you didn t finalize):
      Use --rollback | -r | -R | --restore | --backuck | -b | -B`);
    console.log(`PS: When doing a heroku run avoid using shortened arguments.
      They might be interpreted as arguments of heroku run`);
    process.exit(0);
  }

  const rollbackOpts = ['--rollback', '-r', '-R', '--restore', '--backup', '-b', '-B'];
  const rollback = rollbackOpts.some((opt) => args.includes(opt));
  if (rollback) {
    return { rollback };
  }
  const migrate = ['-m', '-M', '--migrate', '--go', '--run'].some((opt) => args.includes(opt));
  if (migrate) {
    return { migrate };
  }

  const finalize = ['--finalize', '--final', '--clean'].some((opt) => args.includes(opt));
  if (finalize) {
    return { finalize };
  }

  return {};
};

app.on('booted', async () => {
  const { rollback, migrate, finalize } = parseArgs(process.argv);
  if (rollback) {
    await rollbackGarages();
    process.exit(0);
  } else if (migrate) {
    await migrateGarages();
    process.exit(0);
  } else if (finalize) {
    await finalizeMigration();
    process.exit(0);
  } else {
    console.warn("We'll not be doing anything, you sure you got the correct args ?");
  }
});
