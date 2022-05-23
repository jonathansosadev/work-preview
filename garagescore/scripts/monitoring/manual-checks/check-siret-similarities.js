/**
 * this script must reset the counter user.countActiveLeadTicket which will be shown in the lead page KPI on cockpit for a given userId
 */
const fs = require('fs');
const app = require('../../../server/server.js');
const promises = require('../../../common/lib/util/promises');

const run = async function () {
  const allGarages = await app.models.Garage.find({});
  const siretToId = new Map();
  for (let k = 0; k < allGarages.length; k++) {
    const garage = allGarages[k];
    if (garage.businessId) {
      if (!siretToId.get(garage.businessId)) {
        siretToId.set(garage.businessId, [garage.getId().toString()]);
      } else {
        siretToId.get(garage.businessId).push(garage.getId().toString());
      }
    }
  }
  const keys = [...siretToId.keys()];
  let similarities = '';
  for (key of keys) {
    const entry = siretToId.get(key);
    if (entry.length > 1) {
      let log = `${key} : `;
      for (garageId of entry) {
        log += `${garageId} - `;
      }
      log[log.length - 1] = '\n';
      similarities += log;
    }
  }
  fs.writeFileSync('siretSimilarities.txt', similarities, 'utf8');
};

app.on('booted', () => {
  console.log(`Check started : ${new Date()}`);
  run()
    .then(() => {
      console.log(`Check ended : ${new Date()}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
      process.exit(-1);
    });
});
