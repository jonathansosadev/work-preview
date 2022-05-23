/** Monitor issues and pr on our github repo */
require('dotenv').config({ silent: true });
const qa = require('./monitoring/qa');
const supportInterne = require('./monitoring/support_interne');
const { log, JS } = require('../util/log');

const options = process.env.NODE_ENV === 'test' ? { sendToConsole: true } : { sendToSlack: true };

module.exports = async () => {
  log.debug(JS, options);
  const today = new Date();
  // no flood on week ends
  if (today.getDay() != 0 && today.getDay() != 6) {
    log.debug(JS, 'Monitoring QA stats');
    await qa(options);
    log.debug(JS, 'Monitoring support_interne stats');
    await supportInterne(options);
  }
  log.debug(JS, 'Bye');
};

if (require.main === module) {
  module.exports();
}
