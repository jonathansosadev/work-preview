const app = require('../../../server/server');
const OVH = require('../../../common/lib/garagescore/cross-leads/ovh-telephony-api.js');
const { SIMON, log } = require('../../../common/lib/util/log.js');

const intro = 'update-agents-simultaneous-lines.js:';

app.on('booted', async () => {
  try {
    const payload = { simultaneousLines: 10 };
    let updated = 0;
    const mongo = app.models.PhoneBucket.getMongoConnector();
    const phones = (await mongo.find({ status: 'Taken' }, { projection: { value: true } }).toArray()).map(
      (p) => p.value
    );
    for (const phone of phones) {
      await OVH.updateAgents(phone, payload, true);
      log.info(SIMON, `${intro} ${phone} being update with ${JSON.stringify(payload)}`);
      updated++;
    }
    log.info(SIMON, `${intro} Successfully updated ${updated} phones on OVH !`);
    process.exit(0);
  } catch (err) {
    log.error(SIMON, err.message);
    process.exit(-1);
  }
});
