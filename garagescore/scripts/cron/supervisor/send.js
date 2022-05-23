/**
 * CRON USE TO SEND REPORTS // Disabled for now cause we don't use it.
 */
const { promisify } = require('util');
const app = require('../../../server/server');
const CronRunner = require('../../../common/lib/cron/runner');
const TimeHelper = require('../../../common/lib/util/time-helper');
const ContactTypes = require('../../../common/models/contact.type.js');
const ContactService = require('../../../common/lib/garagescore/contact/service.js');

const sendEmail = promisify(ContactService.prepareForSend).bind(ContactService);
const _sendAlert = async (type, payload) =>
  sendEmail({
    to: 'plateforme@custeed.com',
    from: 'no-reply@custeed.com',
    sender: 'GarageScore',
    type,
    payload: payload || {},
  });

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Envoi générique des rapport de supervisions (SUPERVISOR_X_LEADS_STATS_REPORT, ...)',
  forceExecution: process.argv[2] === '--force',
});

const SUNDAY = 0;
const MONDAY = 1;
// const TUESDAY = 2; // Uncomment to use
// const WEDNESDAY = 3; // Uncomment to use
// const THURSDAY = 4; // Uncomment to use
// const FRIDAY = 5; // Uncomment to use
const SATURDAY = 6;

app.on('booted', () => {
  runner.execute = async (options, done) => {
    const executionDay =
      (options.executionStepNumber && TimeHelper.dayNumberToDate(options.executionStepNumber)) || new Date();
    if (!executionDay) {
      done();
      return;
    }
    const day = executionDay.getDay(); // (add "+ 1" if you use "--force" for testing, it take yesterday executionStepNumber...)

    console.log('week day:', day);
    if (day === SATURDAY || day === SUNDAY) {
      done();
      return;
    } // Skip week-ends
    try {
      if (day === MONDAY) {
        await _sendAlert(ContactTypes.SUPERVISOR_X_LEADS_STATS_REPORT);
        console.log('SUPERVISOR_X_LEADS_STATS_REPORT SENT with success !');
      } else console.log("NOTHING to send, it't ok, see you tomorrow !");
      done();
    } catch (err) {
      console.error('ERROR ON SUPERVISOR SENDER CRON: ', err.message);
      done(err);
    }
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
