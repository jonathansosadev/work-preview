/** Start sending continuous pings */
const config = require('config');
const ping = require('./ping');
const { JS, log } = require('../util/log');

async function startBeats(type, prefix = 'Worker_') {
  if (!config.get('workerbeats.enabled')) {
    console.log('workerbeats.enabled=false');
    return null;
  }
  try {
    const monitor = `${prefix}${type}`;
    setInterval(async function () {
      await ping(monitor);
    }, config.get('workerbeats.heartBeatMs') || 300000); // avoid to ping with 0 delay :D
   await ping(monitor);
  } catch (e) {
    log.error(JS, e);
    return null;
  }
  //process.exit();
}
module.exports = startBeats;
