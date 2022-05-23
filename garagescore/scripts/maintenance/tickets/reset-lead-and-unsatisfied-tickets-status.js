// GarageScore Modules
const commonTicket = require('../../../common/models/data/_common-ticket.js');
const app = require('../../../server/server.js');

// Local Constants
const forceUpdate = process.argv.slice(2).includes('--force');
const sum = {};

//
// Main Function
//
app.on('booted', async () => {
  await processLeadTickets(); // eslint-disable-line no-use-before-define
  await processUnsatisfiedTickets(); // eslint-disable-line no-use-before-define
  console.log(sum);
  process.exit(0);
});

//
// Lead Tickets
//
async function processLeadTickets() {
  const where = { 'leadTicket.createdAt': { gte: new Date(0) } };
  const fields = {
    id: true,
    garageId: true,
    type: true,
    garageType: true,
    shouldSurfaceInStatistics: true,
    leadTicket: true,
  };
  const order = 'leadTicket.createdAt DESC';
  const limit = 1000;
  const max = await app.models.Data.count(where);
  let interval = null;
  let datas = null;
  let skip = 0;
  let processed = 0;
  let updated = 0;

  console.log(`${max} Lead Ticket To Process`);
  interval = setInterval(
    () => console.log(`${Math.round((processed / max) * 100)}% Done : ${max - processed} (Lead) Datas Remaining`),
    2 * 1000
  ); // eslint-disable-line max-len
  while ((datas = await app.models.Data.find({ where, fields, limit, skip, order })).length) {
    // eslint-disable-line no-cond-assign
    for (const data of datas) {
      const newStatus = commonTicket.determineLeadStatusFromActions(
        data.leadTicket.actions,
        commonTicket.leadIsSold(data)
      );
      if (newStatus !== data.leadTicket.status || forceUpdate) {
        const key = `${data.leadTicket.status}/${newStatus}`;
        sum[key] = typeof sum[key] !== 'undefined' ? sum[key] + 1 : 1;
        await data.updateAttributes({ 'leadTicket.status': newStatus });
        ++updated;
      }
      ++processed;
    }
    skip += limit;
  }
  clearInterval(interval);
  console.log(`100% Done : 0 (Lead) Datas Remaining --> ${updated} Status Updated`);
}

//
// Unsatisfied Ticket
//
async function processUnsatisfiedTickets() {
  const where = { 'unsatisfiedTicket.createdAt': { gte: new Date(0) } };
  const fields = {
    id: true,
    garageId: true,
    type: true,
    garageType: true,
    shouldSurfaceInStatistics: true,
    unsatisfied: true,
    unsatisfiedTicket: true,
  }; // eslint-disable-line max-len
  const order = 'unsatisfiedTicket.createdAt DESC';
  const limit = 1000;
  const max = await app.models.Data.count(where);
  let interval = null;
  let datas = null;
  let skip = 0;
  let processed = 0;
  let updated = 0;

  console.log(`${max} Unsatisfied Ticket To Process`);
  interval = setInterval(
    () =>
      console.log(`${Math.round((processed / max) * 100)}% Done : ${max - processed} (Unsatisfied) Datas Remaining`),
    2 * 1000
  ); // eslint-disable-line max-len
  while ((datas = await app.models.Data.find({ where, fields, limit, skip, order })).length) {
    // eslint-disable-line no-cond-assign
    for (const data of datas) {
      const newStatus = commonTicket.determineUnsatisfiedStatusFromActions(
        data.unsatisfiedTicket.actions,
        commonTicket.unsatisfiedIsResolved(data)
      ); // eslint-disable-line max-len
      if (newStatus !== data.unsatisfiedTicket.status || forceUpdate) {
        const key = `${data.unsatisfiedTicket.status}/${newStatus}`;
        sum[key] = typeof sum[key] !== 'undefined' ? sum[key] + 1 : 1;
        await data.updateAttributes({ 'unsatisfiedTicket.status': newStatus });
        ++updated;
      }
      ++processed;
    }
    skip += limit;
  }
  clearInterval(interval);
  console.log(`100% Done : 0 (Unsatisfied) Datas Remaining --> ${updated} Status Updated`);
}
