const app = require('../../../server/server');
const { TIBO, log } = require('../../../common/lib/util/log');

const CronRunner = require('../../../common/lib/cron/runner');
const setAutomationCampaigns = require('../../../common/lib/garagescore/automation/set-automation-campaigns');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Met à jour les campagnes automation, créer de nouvelles campagnes disponibles si besoin, etc.',
  forceExecution: process.argv.includes('--force'),
});

let garageIds = null;

process.argv.forEach((arg) => {
  if (arg === '--help') {
    console.log('For specific garages : --garageIds=id1,id2,id2,idn');
    process.exit(0);
  }
  if (arg.includes('--garageIds=')) {
    garageIds = arg.replace('--garageIds=', '').split(',');
  }
});

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    await setAutomationCampaigns.setAutomationCampaigns(garageIds);
    callback();
  };
  runner.run((err) => {
    if (err) {
      log.error(TIBO, `[SET AUTOMATION CAMPAIGNS] Error :: ${err}`);
    }
    process.exit(err ? -1 : 0);
  });
});
