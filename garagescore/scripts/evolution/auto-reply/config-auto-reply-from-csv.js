const app = require('../../../server/server');
const { fetchConfigCSV, configCsv2json } = require('./config-auto-reply-utils');
const { activateAutomaticReplies } = require('../../../common/models/garage/garage-methods');
const { ANASS, log } = require('../../../common/lib/util/log');


const main = async () => {
  await new Promise((res) => app.on('booted', res));
  const configCsv = await fetchConfigCSV(process.argv[2]);
  log.debug(ANASS, 'ConfigCsv nLines : ' +  configCsv.split('\n').length);
  const configJson = configCsv2json(configCsv);
  log.debug(ANASS, `Nb garages : ${Object.keys(configJson).length}`);


  // Normally I should use concurrentpromiseAll, but it looks like it doesn"t really work so...
  await Promise.all(
    Object.entries(configJson).map(([garageId, automaticReplyConfig]) => {
      if (process.argv.includes('--debug')) {
        log.debug(ANASS, `For garage : ${garageId}`);
        log.debug(ANASS, `Config : ${JSON.stringify(automaticReplyConfig, null, 2)}`);
      }
      return activateAutomaticReplies(app, garageId, automaticReplyConfig);
    })
  );

  process.exit(0);
};

main();
