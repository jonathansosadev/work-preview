// Usage node scripts/migration/3221-default-alerts/jobs-set-default-user-config.js scripts/migration/3221-default-alerts/jobs-config.csv [--updateJobs] [--updateUsers]

/** IMPORTANT NOTE ABOUT THE CSV FORMAT
 *  1st line contains the config keys make sure to leave the 1st column empty (UnsatisfiedMaintenance, EscalationUnsatisfiedVn, ect...)
 *  2nd line contains 0 or 1 that indicate if the above config is to be overriden in each user (jobs will be overriden no matter what)
 *  1st column contains the jobs names
 *  For each job & config key: 0 to disable, 1 to enable
 */
const app = require('../../../server/server');
const fs = require('fs');
const GarageTypes = require('../../../common/models/garage.type');

const _parseArgs = (args) => {
  const fileName = args.find((arg) => /.*.csv/.test(arg));
  const mustUpdateJobs = args.includes('--updateJobs');
  const mustUpdateUsers = args.includes('--updateUsers');

  return { fileName, mustUpdateJobs, mustUpdateUsers };
};

const extractConfigFromCSV = (fileName) => {
  const fileContent = fs.readFileSync(fileName, 'utf8');
  const [configKeysLine, overridesLine, ...jobsLines] = fileContent.split('\n').filter((line) => line);
  const [useless, ...configKeys] = configKeysLine.split(',');
  const [empty, ...overrides] = overridesLine.split(',');

  const parsedJobConfig = (configsForJob) => {
    const parsedJobConfig = Object.fromEntries(
      configsForJob.map((value, index) => {
        const configKey = configKeys[index].trim();
        const override = overrides[index].trim() === '1';
        return [configKey, { value: value.trim() === '1', override }];
      })
    );
    return parsedJobConfig;
  };

  /* Object with the following format:
  {
    "Job name": { // Directeur général for example
      configKey: { // UnsatisfiedMaintenance for example
        value: true or false,
        override: true or false
      }
    }
  }
  */
  const configPerJob = Object.fromEntries(
    jobsLines
      .map((line) => line.split(','))
      .map(([jobName, ...configPerJob]) => [jobName, parsedJobConfig(configPerJob)])
  );

  return configPerJob;
};

const updateUserJobs = async (configPerJob) => {
  // Do not opti, we got at most 30 jobs so no need to over engineer it
  const updateUserJobsPromises = Object.entries(configPerJob).map(([jobName, configForJob]) => {
    const query = {
      garageType: GarageTypes.DEALERSHIP,
      name: jobName,
    };
    // Basically we will transform configKey: { value, override } into configKey: value
    const updatedFields = Object.fromEntries(
      Object.entries(configForJob).map(([configKey, { value }]) => {
        return [`defaultUserConfig.allGaragesAlerts.${configKey}`, value];
      })
    );
    const updateOps = {
      $set: updatedFields,
    };
    return app.models.UserJob.getMongoConnector().updateOne(query, updateOps, { upsert: false });
  });

  const updateResults = await Promise.allSettled(updateUserJobsPromises);
  const totalUpdated = updateResults.reduce((r, { value }) => (r += value && value.modifiedCount), 0);
  const nErrs = updateResults.filter(({ status }) => status === 'rejected').length;
  const errors = updateResults.filter(({ status }) => status === 'rejected').map(({ reason }) => reason);
  console.log(`
    Modified ${totalUpdated} userJobs. ${nErrs} updateOnes have an error
    Errors: ${errors.length ? errors.join('; ') : 'None'}
  `);
};

const updateUsers = async (configForJob) => {
  const updateUsersPromises = Object.entries(configForJob).map(([jobName, configForJob]) => {
    const query = {
      job: jobName,
    };
    // Basically we will transform configKey: { value, override } into configKey: value
    // but we have to take override into consideration
    const updatedFields = Object.fromEntries(
      Object.entries(configForJob).map(([configKey, { value, override }]) => {
        const updateOp = override ? value : { $ifNull: [`$allGaragesAlerts.${configKey}`, value] };
        return [`allGaragesAlerts.${configKey}`, updateOp];
      })
    );
    // Updating with an aggregation pipeline which will enable us to take the override into consideration
    const updateOps = [
      {
        $set: updatedFields,
      },
    ];

    return app.models.User.getMongoConnector().updateMany(query, updateOps);
  });

  const updateResults = await Promise.allSettled(updateUsersPromises);
  const totalUpdated = updateResults.reduce((r, { value }) => (r += value && value.modifiedCount), 0);
  const nErrs = updateResults.filter(({ status }) => status === 'rejected').length;
  const errors = updateResults.filter(({ status }) => status === 'rejected').map(({ reason }) => reason);
  console.log(`
    Modified ${totalUpdated} Users. ${nErrs} updateManies have an error
    Errors: ${errors.length ? errors.join('; ') : 'None'}
  `);
};

const main = async () => {
  const { fileName, mustUpdateJobs, mustUpdateUsers } = _parseArgs(process.argv);
  if (!fileName) {
    console.error('No csv file provided');
    process.exit(42);
  }

  const configPerJob = await extractConfigFromCSV(fileName);

  if (mustUpdateJobs) {
    await updateUserJobs(configPerJob);
  }
  if (mustUpdateUsers) {
    await updateUsers(configPerJob);
  }

  console.log('Finished, will exit now');
  process.exit(0);
};

app.on('booted', async () => {
  try {
    await main(app);
  } catch (err) {
    console.error(err);
    process.exit(127);
  }
});
