'use strict';
/**
 Run everyday by the cron
 loop over all garages and push on s3 the daily csv file for every mecaplanning garage
 */

const app = require('../../../server/server');
const gsDataFileDataTypes = require('../../../common/models/data-file.data-type');
// const debug = require('debug')('garagescore:bin:pullers:pull-mecaplanning'); // eslint-disable-line max-len,no-unused-vars
const gsS3DataPusher = require('../../../common/lib/garagescore/garage/data-s3-pusher');
const DMS = require('../../../common/lib/dms/dms');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const { log, JS } = require('../../../common/lib/util/log');
const slackClient = require('../../../common/lib/slack/client');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Parcourt tous les garages et envoie sur s3 le fichier quotidien csv pour les garages mecaplanning.',
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
    if (/--startDate/.test(arg)) {
      // reverse date 30/06/2020 -> 2020/06/30
      const startDateArg = arg
        .match(/([\d]+)\/([\d]+)\/([\d]+)/)[0]
        .split('/')
        .reverse()
        .join('/');
      startDate = new Date(startDateArg);
    }
    if (/--endDate/.test(arg)) {
      const endDateArg = arg
        .match(/([\d]+)\/([\d]+)\/([\d]+)/)[0]
        .split('/')
        .reverse()
        .join('/');
      endDate = new Date(endDateArg);
    }
    if (/--where=/.test(arg)) {
      where = eval(`(${arg.match(/--where=([\w\W]+)/)[1]})`);
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

  return { force, garageIds, startDate, endDate, where };
};
/**
 * push garage to S3, only work with mecaPlanning !
 */
const pullGarage = async (garage, startDate, endDate, optionsRunner) => {
  try {
    if (!garage) {
      console.log(`garage not found`);
      return;
    }
    const dataType = gsDataFileDataTypes.MAINTENANCES;
    const uploadMethod = garage.getUploadMethod(dataType);
    if (uploadMethod !== DMS.MECAPLANNING) {
      console.log(`${garage.publicDisplayName} DMS is not ${DMS.MECAPLANNING}`);
      return;
    }

    if (startDate && endDate) {
      // add +1 day because it get the previous day
      const startDayNumber = timeHelper.dayNumber(startDate) + 1;
      const endDayNumber = timeHelper.dayNumber(endDate) + 1;

      for (let i = startDayNumber; i <= endDayNumber; i++) {
        const today = timeHelper.dayNumberToDate(i);
        console.log(`${garage.publicDisplayName} push To S3 date : ${today}`);
        await gsS3DataPusher.pushToS3(garage, today, dataType);
      }
    } else {
      const today = optionsRunner.executionStepNumber
        ? timeHelper.dayNumberToDate(optionsRunner.executionStepNumber)
        : new Date();
      console.log(`${garage.publicDisplayName} push To S3 date : ${today}`);
      await gsS3DataPusher.pushToS3(garage, today, dataType);
    }
  } catch (err) {
    const slackText = `Pull Mecaplanning : Erreur lors du lancement du flux mecaplanning pour ${garage.id} ${garage.publicDisplayName} : ${err.message}`;
    await new Promise((res, rej) =>
      slackClient.postMessage(
        {
          channel: `#çavapastroplesflux`,
          username: 'Flux Mecaplanning',
          text: slackText,
        },
        (answer) => (answer ? rej(answer) : res())
      )
    );
    console.error(slackText);
  }
};

app.on('booted', async function () {
  const { force, garageIds, startDate, endDate, where } = _parseArgs(process.argv);

  if (force) {
    try {
      const executeGarageIds = garageIds.map(async (garageId) => {
        let whereArg = {};
        if (where) whereArg = where;
        whereArg.id = garageId;

        const fields = { id: 1, slug: 1, publicDisplayName: 1, dms: 1 };
        const garage = await app.models.Garage.findOne({ where: whereArg, fields });
        return pullGarage(garage, startDate, endDate, null);
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
    const executeGarages = garages.map(async (garage) => {
      return pullGarage(garage, null, null, options);
    });

    await Promise.all(executeGarages);
    callback();
  };

  runner.run(function (err) {
    if (err) {
      log.info(JS, err);
    }
    process.exit(err ? -1 : 0);
  });
});
