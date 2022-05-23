/*
  Push to the other Contacts queue
*/
const contactsSender = require('../../../workers/contacts-sender');
const app = require('../../../server/server');

const SOFT_LIMIT = 100;

async function main(max, type) {
  const where = { status: 'Waiting' };
  if (type) {
    where.type = type;
  }
  let waitings = await app.models.Contact.find({ where, fields: { id: true, type: true } });
  if (!max && waitings.length > SOFT_LIMIT) {
    console.error(`Too many contacts waiting (${waitings.length}), please run the script with a push limit.`);
    console.error(
      'Example `scripts/maintenance/contacts/re-push-waiting-contacts.js 100` will only push the first 100 contacts found.'
    );
    process.exit();
  }
  let total = waitings.length;
  if (waitings.length > SOFT_LIMIT) {
    waitings = waitings.slice(0, max);
  }
  console.log(`Pushing ${waitings.length} contacts (over ${total} waiting)`);
  for (let waiting of waitings) {
    console.log({ id: waiting.getId().toString(), type: waiting.type });
    const waitingGarageId = (waiting.payload && waiting.payload.garageId) || null;
    await contactsSender.queueContact(waiting.getId().toString(), waiting.type, new Date(), waitingGarageId);
  }
  setTimeout(() => {
    process.exit();
  }, 1000);
}
main(process.argv[2], process.argv[3]);
