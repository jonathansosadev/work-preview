require('dotenv').config({ silent: true });
const moment = require('moment');
const { ObjectID } = require('mongodb');
const VmobilityScrapper = require('../../../common/lib/garagescore/vmobility/VmobilityScrapper');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const s3Uploader = require('../../../common/lib/garagescore/garage/dms-downloaders/s3-uploader');
const DMS = require('../../../common/lib/dms/dms');
const timeHelper = require('../../../common/lib/util/time-helper');
const CronRunner = require('../../../common/lib/cron/runner');
const app = require('../../../server/server');
const { BANG, log } = require('../../../common/lib/util/log');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Parcours tous les garages et envoie sur s3 le fichier quotidien csv pour les garages V-Mobility.',
  forceExecution: process.argv.includes('--force'),
});

const _parseArgs = () => {
  const forceExecution = process.argv.includes('--force');
  // Processing garage arg to be able to launch the puller on a predefined set of garages
  const garageArgNames = ['--garage', '--garages', '--garageId', '--garageIds'];
  const gArgPos = process.argv.indexOf(garageArgNames.find((argName) => process.argv.includes(argName)));
  const forcedGaragesArg = gArgPos !== -1 && process.argv[gArgPos + 1] && process.argv[gArgPos + 1].split(',');
  const forcedGarages = forcedGaragesArg && forcedGaragesArg.map((gId) => new ObjectID(gId));
  // Enabling screenshots to be made
  const debugArgs = ['--debug', '--screenshot', '--screenshots'];
  const debugMode = !!debugArgs.some((argName) => process.argv.includes(argName));
  // With this we'll be able to select a date of execution
  const dateArgNames = ['--date', '--force'];
  const dArgPos = process.argv.indexOf(dateArgNames.find((argName) => process.argv.includes(argName)));
  const dateArg = dArgPos !== -1 && process.argv[dArgPos + 1] && moment(process.argv[dArgPos + 1], 'DD/MM/YYYY');
  const forcedDate = dateArg && dateArg.isValid() && dateArg;
  const stopDateArg = process.argv.indexOf(['--stopDate'].find((argName) => process.argv.includes(argName)));
  const stopDate =
    stopDateArg !== -1 && process.argv[stopDateArg + 1] && moment(process.argv[stopDateArg + 1], 'DD/MM/YYYY');
  // --catchup start from dateA to dateB
  const catchup = process.argv.includes('--catchup');
  if (catchup && (!forceExecution || !forcedDate || !stopDate)) {
    log.error('ERROR: --catchup need parameters --force, --date and --stopDate!');
    process.exit(1);
  }
  return { forceExecution, forcedGarages, debugMode, forcedDate, catchup, stopDate };
};

const runVmobility = async (garages, today, yesterday, debugMode, stopDate) => {
  const allowedDataFileTypes = [
    dataFileTypes.MAINTENANCES,
    dataFileTypes.NEW_VEHICLE_SALES,
    dataFileTypes.USED_VEHICLE_SALES,
  ];
  const results = {};
  for (const garage of garages) {
    for (const dataFileType of allowedDataFileTypes) {
      if (garage.getUploadMethod(dataFileType) === DMS.VMOBILITY) {
        try {
          log.info(
            BANG,
            `${garage.publicDisplayName} Does Have ${dataFileType} Configured For VMobility : Scrapping Initialization`
          );
          const garageId = garage.id.toString();
          const mode = _translateDataFileType(dataFileType);
          const username = garage.dms && garage.dms[dataFileType] && garage.dms[dataFileType].username;
          const password = garage.dms && garage.dms[dataFileType] && garage.dms[dataFileType].password;
          const vmobilityScrapper = new VmobilityScrapper(
            garageId,
            mode,
            username,
            password,
            yesterday,
            debugMode,
            stopDate
          );
          const result = await vmobilityScrapper.run();
          if (result) {
            await uploadS3(result, garage, today, dataFileType);
          } else {
            log.warning(BANG, `Nothing To Upload On S3 For ${dataFileType} For ${garage.publicDisplayName} @ ${today}`);
          }
        } catch (e) {
          log.error(
            BANG,
            `ERROR FOR ${garage.publicDisplayName} / ${dataFileType} @ ${today} : ${JSON.stringify(e.message)}`
          );
        }
      }
    }
  }
  return results;
};

const uploadS3 = async (result, garage, today, dataFileType) => {
  if (result) {
    return await new Promise((res, rej) =>
      s3Uploader(result, garage, today, dataFileType, (e) => (e ? rej(e) : res()))
    );
  }
};

app.on('booted', function () {
  runner.execute = async function ({ executionStepNumber }, callback) {
    const { forceExecution, forcedGarages, debugMode, forcedDate, catchup, stopDate } = _parseArgs();
    const garagesWhere = forcedGarages ? { id: { inq: forcedGarages } } : {};
    const garages = await new Promise((res, rej) =>
      app.models.Garage.dailyUpdatedGarages(garagesWhere, (e, g) => (e ? rej(e) : res(g)))
    );
    const dateFromStepNumber = executionStepNumber ? timeHelper.dayNumberToDate(executionStepNumber) : new Date();
    const today = forceExecution && forcedDate ? forcedDate : dateFromStepNumber;
    const yesterday = moment(today).subtract(1, 'day');
    await runVmobility(garages, today, yesterday, debugMode, stopDate);
    log.info(BANG, `Executing For ${today}`);
    callback();
  };

  runner.run(function (err) {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});

function _translateDataFileType(dataFileType) {
  if (dataFileType === dataFileTypes.MAINTENANCES) {
    return 'APV';
  }
  if (dataFileType === dataFileTypes.NEW_VEHICLE_SALES) {
    return 'VN';
  }
  if (dataFileType === dataFileTypes.USED_VEHICLE_SALES) {
    return 'VO';
  }
}
