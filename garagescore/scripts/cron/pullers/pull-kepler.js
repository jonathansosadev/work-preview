const debug = require('debug')('KeplerPuller-CRON');
const moment = require('moment');

const app = require('../../../server/server');
const DMS = require('../../../common/lib/dms/dms');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const dataFileTypes = require('../../../common/models/data-file.data-type');
const keplerPuller = require('../../../common/lib/garagescore/kepler/keplerPuller');
const s3Uploader = require('../../../common/lib/garagescore/garage/dms-downloaders/s3-uploader');

JSON.toCSV = function (json) {
  const sep = ';';
  if (!json || (Array.isArray(json) && !json.length)) return '';
  const getFields = (obj, prefix = '') => {
    return Object.keys(obj).reduce((fields, key) => {
      if (obj[key] && typeof obj[key] === 'object' && obj[key].constructor === Object) {
        // We've got a nested object so the CSV title will be key__subkey
        // That will normally not be used because I managed to flatten the JSON before calling toCSV
        fields.concat(getFields(obj[key], `${prefix}${key}__`));
      } else {
        fields.push(prefix + key);
      }
      return fields;
    }, []);
  };
  const getLine = (obj, fields) => {
    return fields.map((field) => {
      return field.split('/').reduce((value, key) => value && value[key], obj) || ''; // is it not __ instead of / ? too afraid to change
    });
  };
  const isDefined = (value) => value !== undefined && value !== null && value !== '';

  const fields = getFields(Array.isArray(json) ? json[0] : json);
  const lines = Array.isArray(json) ? json.map((line) => getLine(line, fields)) : getLine(json, fields);

  return [fields.join(sep), ...lines.filter((l) => l.some(isDefined)).map((l) => l.join(sep))].join('\n');
};

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Parcours tous les garages et envoie sur s3 le fichier quotidien csv pour les garages V-Mobility.',
  forceExecution: process.argv[2] === '--force',
});

app.on('booted', function () {
  runner.execute = async function (options, callback) {
    const garages = await new Promise((res, rej) =>
      app.models.Garage.dailyUpdatedGarages({}, (e, g) => (e ? rej(e) : res(g)))
    );
    const allowedDataFileTypes = [
      dataFileTypes.MAINTENANCES,
      dataFileTypes.NEW_VEHICLE_SALES,
      dataFileTypes.USED_VEHICLE_SALES,
      dataFileTypes.VEHICLE_SALES,
    ];
    const today = options.executionStepNumber ? timeHelper.dayNumberToDate(options.executionStepNumber) : new Date();
    const yesterday = moment(today).subtract(1, 'day');

    console.log(`Executing For ${today}`);
    for (const garage of garages) {
      for (const dataFileType of allowedDataFileTypes) {
        if (garage.getUploadMethod(dataFileType) === DMS.KEPLER) {
          try {
            console.log(`${garage.publicDisplayName} Does Have ${dataFileType} Configured For Kepler`);

            const apiKey = garage.dms && garage.dms[dataFileType] && garage.dms[dataFileType].apiKey;
            let result = await keplerPuller.getKeplerInvoices(apiKey, yesterday, dataFileType);
            result = JSON.toCSV(result);

            if (process.argv.includes('--simul')) {
              console.log(result, '\n');
            } else if (!result) {
              console.log(
                `Empty file, did not upload on S3 For ${dataFileType} For ${garage.publicDisplayName} @ ${today}`
              );
            } else {
              await new Promise((res, rej) =>
                s3Uploader(result, garage, today, dataFileType, (e) => (e ? rej(e) : res()))
              );
              console.log(`Uploaded ${dataFileType} File On S3 For ${garage.publicDisplayName} @ ${today}`);
            }
          } catch (e) {
            console.log(
              `FATAL ERROR FOR ${garage.publicDisplayName} / ${dataFileType} @ ${today} : ${JSON.stringify(e)}`
            );
          }
        }
      }
    }
    callback();
  };

  runner.run(function (err) {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
