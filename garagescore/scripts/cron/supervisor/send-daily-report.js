const moment = require('moment');
const app = require('../../../server/server.js');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/reporter');
const CronRunner = require('../../../common/lib/cron/runner');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Envoi du rapport du supervisor quotidien.',
  forceExecution: process.argv[2] === '--force',
});

// const async = require('async');
app.on('booted', () => {
  runner.execute = (options, callback) => {
    const yesterdayStart = moment().subtract(1, 'days').startOf('day');
    const yesterdayEnd = moment().subtract(1, 'days').endOf('day');
    GsSupervisor.sendReport(
      {
        where: {
          and: [{ createdAt: { gt: yesterdayStart.toDate() } }, { createdAt: { lte: yesterdayEnd.toDate() } }],
        },
      },
      yesterdayStart.format('YYYY-MM-DD'),
      callback
    );
  };
  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
