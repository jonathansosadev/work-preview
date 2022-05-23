/**
 * Script to retrieve ovh calls manually, see usage
 */
const app = require('../../../server/server');
const { handleIncomingCalls } = require('../../../common/lib/garagescore/cross-leads/handle-incoming-calls.js');
const { ObjectId } = require('mongodb');

const _parseArgs = (fieldsToParse) => {
  const options = {};
  for (let i = 0; i < process.argv.length; i++) {
    const field = process.argv[i].replace('--', '');
    if (fieldsToParse.includes(field)) {
      options[field] = process.argv[i + 1] && !process.argv[i + 1].includes('--') ? process.argv[i + 1] : true;
    }
  }
  return options;
};
let { garageId, from, to, create } = _parseArgs(['garageId', 'from', 'to', 'create']);
if (!garageId || !from || !to) {
  console.log(
    'Usage: node scripts/maintenance/cross-lead/manual-ovh-retriever.js --garageId 57f3b7594566381900623c8b --from 2020-09-14T14:20:00.709Z --to 2020-09-14T14:50:00.709Z (--create)'
  );
  process.exit(0);
}
from = new Date(from);
to = new Date(to);
from.setHours(from.getHours() - 2);
to.setHours(to.getHours() - 2);
app.on('booted', async () => {
  let phones = null;
  // let phones = [{ value: phone, garageId: null, sourceType: 'manual-ovh-retriever' }];
  if (garageId) phones = await app.models.Garage.getAllTakenPhones([ObjectId(garageId.toString())]);
  if (!phones || !phones.length) {
    console.log(`No phones founds for garageId ${garageId}`);
    process.exit(0);
  }
  const retrievedCalls = await handleIncomingCalls(phones, from, to, create);
  console.log(`${retrievedCalls.length} retrievedCalls`);
  console.log(retrievedCalls);
  console.log(`manual-ovh-retriever.js Finished !`);
  process.exit(0);
});
