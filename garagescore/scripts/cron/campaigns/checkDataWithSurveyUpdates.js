const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const timeHelper = require('../../../common/lib/util/time-helper');
const { ObjectId } = require('mongodb');

/**
Check survey updates
Must be run every 10 minutes
*/

var runner = new CronRunner({
  path: __filename.replace(/.*cron(.*)$/, 'scripts/cron$1'),
  frequency: CronRunner.supportedFrequencies.DECA_MINUTE,
  description:
    "Vérifie les enquêtes modifiées il y a 30 minutes, pour préparer l'envoi des remerciements et/ou followups",
});
console.log('Checking if some campaignItems had survey updates...');
console.log('Execute on data, add parameters --force and --dataId (ex: --force --dataId=5fc0081021679b0004f6b58c)');

const _parseArgs = async (args, app) => {
  let dataId = null;
  let force = false;
  let decaNow = null;
  args.forEach((arg) => {
    if (/--dataId/.test(arg)) {
      dataId = arg.match(/=([a-z0-9,]+)/)[1];
    }
    if (/--force/.test(arg)) {
      force = true;
    }
  });

  if (dataId) {
    console.log('Check survey on dataId: ', dataId);
    try {
      decaNow = timeHelper.decaMinuteNumber(new Date());
      await app.models.Data.getMongoConnector().updateOne(
        { _id: ObjectId(dataId) },
        { $set: { 'campaign.contactScenario.nextCheckSurveyUpdatesDecaminute': decaNow, } }
      )
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }
  return { force, decaNow }
};

app.on('booted', async function () {
  const { force, decaNow } = await _parseArgs(process.argv, app);

  if (force && decaNow) {
    app.models.Data.campaign_checkSurveyUdpatesForDecaMinute(decaNow, function (err, count) {
      process.exit(err ? -1 : 0);
    });
  } else {
    runner.execute = function (options, callback) {
      if (!options.executionStepNumber) {
        callback(new Error('option.executionStepNumber not found'));
        return;
      }
      app.models.Data.campaign_checkSurveyUdpatesForDecaMinute(options.executionStepNumber, function (err, count) {
        if (!err) {
          console.log('processed ' + count + ' for ' + runner._describeStepNumber(options.executionStepNumber));
        }
        callback(err, count);
      });
    };
    runner.run(function (err) {
      if (err) {
        console.log(err);
      }
      process.exit(err ? -1 : 0);
    });
  }
});
