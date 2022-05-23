'use strict';
/**
 Run everyday by the cron
 loop over all garages and push on s3 the daily csv file for every yuzer garage
 */

const app = require('../../../server/server');
const gsDataFileDataTypes = require('../../../common/models/data-file.data-type');
const gsS3DataPusher = require('../../../common/lib/garagescore/garage/data-s3-pusher');
const DMS = require('../../../common/lib/dms/dms');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const { log, JS } = require('../../../common/lib/util/log');
const slackClient = require('../../../common/lib/slack/client');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Parcourt tous les garages et envoie sur s3 le fichier quotidien csv pour les garages Yuzer.',
});

const _parseArgs = (args) => {
  let force = null;
  let garageIds = null;
  let startDate = null;
  let endDate = null;
  let where = null;
  args.forEach((arg) => {
    if (/--force/.test(arg)) {
      force = true;
    }
    if (/--garageId/.test(arg)) {
      garageIds = arg.match(/=([a-z0-9,]+)/)[1].split(',');
    }

    if (/--where=/.test(arg)) {
      where = eval(`(${arg.match(/--where=([\w\W]+)/)[1]})`);
    }
    if (/--startDate/.test(arg)) {
      let startDateArg = arg.match(/([\d]+)\/([\d]+)\/([\d]+)/)[0];
      startDateArg = startDateArg.split('/');
      startDateArg = [startDateArg[1], startDateArg[0], startDateArg[2]].join('/');
      startDate = new Date(startDateArg);
    }
    if (/--endDate/.test(arg)) {
      let endDateArg = arg.match(/([\d]+)\/([\d]+)\/([\d]+)/)[0];
      endDateArg = endDateArg.split('/');
      endDateArg = [endDateArg[1], endDateArg[0], endDateArg[2]].join('/');
      endDate = new Date(endDateArg);
    }
  });
  // display missing parameter
  if (force && !garageIds) {
    console.log(`___garageId ${garageIds} parameter is missing (ex: --garageId=5e4ffe3823c93b0015babc36)`);
    process.exit(1);
  }
  if (force && (!startDate || !endDate)) {
    console.log(`___startDate or enDate parameter is missing (ex: --startDate=20/05/2020)`);
    process.exit(1);
  }

  return { force, garageIds, where, startDate, endDate };
};
/**
 * push garage to S3, only work with yuzer !
 */
const pullGarage = async (garage, optionsRunner, startDate, endDate) => {
  if (!garage) {
    console.log(`garage not found`);
    return;
  }
  const dataTypes = gsDataFileDataTypes.values();
  let errors = [];
  for (const dataType of dataTypes) {
    try {
      const uploadMethod = garage.getUploadMethod(dataType);
      if (uploadMethod !== DMS.YUZER) {
        console.log(`${garage.publicDisplayName} not find DMS ${DMS.YUZER} for ${dataType}`);
      } else {
        if (startDate && endDate) {
          const startDayNumber = timeHelper.dayNumber(startDate) + 1;
          const endDayNumber = timeHelper.dayNumber(endDate) + 1;

          for (let i = startDayNumber; i <= endDayNumber; i++) {
            const today = timeHelper.dayNumberToDate(i);
            console.log(`${garage.publicDisplayName} push To S3 date : ${today}`);
            await gsS3DataPusher.pushToS3(garage, today, dataType);
          }
        } else {
          console.log(`${garage.publicDisplayName} find DMS ${DMS.YUZER} for ${dataType}`);
          const today =
            optionsRunner && optionsRunner.executionStepNumber
              ? timeHelper.dayNumberToDate(optionsRunner.executionStepNumber)
              : new Date();
          console.log(`${garage.publicDisplayName} push To S3 date : ${today}`);

          await gsS3DataPusher.pushToS3(garage, today, dataType);
        }
      }
    } catch (err) {
      const slackText = `Pull YUZER : Erreur lors du lancement du flux YUZER pour ${garage.id} ${garage.publicDisplayName} on dataType ${dataType} : ${err.message}`;
      await new Promise((res, rej) =>
        slackClient.postMessage(
          {
            channel: `#çavapastroplesflux`,
            username: 'Flux yuzer',
            text: slackText,
          },
          (answer) => (answer ? rej(answer) : res())
        )
      );
      errors.push(slackText);
      console.error(slackText);
    }
  }
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
};

app.on('booted', async function () {
  const { force, garageIds, where, startDate, endDate } = _parseArgs(process.argv);

  if (force) {
    try {
      const executeGarageIds = garageIds.map(async (garageId) => {
        let whereArg = {};
        if (where) whereArg = where;
        whereArg.id = garageId;

        const fields = { id: 1, slug: 1, publicDisplayName: 1, dms: 1 };
        const garage = await app.models.Garage.findOne({ where: whereArg, fields });
        return pullGarage(garage, null, startDate, endDate);
      });

      await Promise.all(executeGarageIds);
      console.log('______Script end without error');
      process.exit(0);
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  runner.execute = async function (options, callback) {
    const garages = await new Promise((res, rej) => {
      app.models.Garage.dailyUpdatedGarages({}, (e, r) => (e ? rej(e) : res(r)));
    });

    for (const garage of garages) {
      await pullGarage(garage, options);
    }
    callback();
  };

  runner.run(function (err) {
    if (err) {
      log.info(JS, err);
    }
    process.exit(err ? -1 : 0);
  });
});
