const moment = require('moment');
const CronRunner = require('../../../common/lib/cron/runner');
const app = require('../../../server/server.js');
const {
  bizDevBonus,
  addMonthPrice,
  addMonthPerfUsersHistory,
  checkFalseGoCardLess,
} = require('../../../common/lib/garagescore/prime/update-prime');

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'every month, calc total subscription price',
  forceExecution: process.argv[2] === '--force',
});

const _parseArgs = (args) => {
  const options = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    skipGarage: false,
    saveBiz: true,
    savePm: true,
  };

  args.forEach((arg) => {
    if (/--force/.test(arg)) {
      options.force = true;
    }
    if (/--month/.test(arg)) {
      options.month = parseInt(arg.match(/(\d){1,2}/)[0]) - 1;
    }
    if (/--year/.test(arg)) {
      options.year = parseInt(arg.match(/(\d){4}/)[0]);
    }
    if (/--skip/.test(arg)) {
      options.skipGarage = true;
    }
    if (/--notSaveBiz/.test(arg)) { // skip save bizdev
      options.saveBiz = false;
    }
    if (/--notSavePm/.test(arg)) { // skip save pm
      options.savePm = false;
    }
  });

  return options;
};

const loadScript = async (app, options) => {
  console.log('==============start update garages, bizdev and perf man');
  console.time('execution_time');
  if (!options.skipGarage) {
    await addMonthPrice(app, options.month, options.year, options.saveBiz);
  }
  if (options.savePm) {
    await addMonthPerfUsersHistory(app, options.month, options.year);
  }
  if (options.saveBiz) {
    await bizDevBonus(app, options.month, options.year);
  }
  await checkFalseGoCardLess(app, options.month, options.year);
  console.timeEnd('execution_time');
  console.log('==============script end without error');
};

// start CRON
app.on('booted', async () => {
  try {
    const parsedArgs = _parseArgs(process.argv);
    // force execution
    if (parsedArgs.force) {
      await loadScript(app, parsedArgs);
      process.exit(0);
    } else {
      runner.execute = async (options, done) => {
        // only execute the first day of month
        const today = new Date().getDate();
        if (today !== 1) {
          console.log('--only execute the 1st day every month');
          done();
          return;
        }
        await loadScript(app, parsedArgs);
        done();
      };
      runner.run((err) => {
        if (err) {
          console.log(err);
        }
        process.exit(err ? -1 : 0);
      });
    }
  } catch (err) {
    console.log(err);
    process.exit(2);
  }
});
