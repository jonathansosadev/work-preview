// GarageScore Modules
const app = require('../../../server/server');

//
// Main Function
//
app.on('booted', async () => {
  const leadErrors = await _processLeadTickets(); // eslint-disable-line no-use-before-define
  const unsatisfiedErrors = await _processUnsatisfiedTickets(); // eslint-disable-line no-use-before-define

  console.log(`Done. ${leadErrors} LeadTicket Errors, ${unsatisfiedErrors} UnsatisfiedTicket Errors`);
  process.exit(0);
});

//
// Lead Tickets
//
async function _processLeadTickets() {
  const datas = await app.models.Data.find({
    where: {
      shouldSurfaceInStatistics: true,
      'leadTicket.createdAt': { gte: new Date(0) },
      and: [{ 'leadTicket.manager': { neq: 'undefined' } }, { 'leadTicket.manager': { neq: null } }],
    },
    fields: {
      id: true,
      garageId: true,
      leadTicket: true,
      type: true,
      garageType: true,
      shouldSurfaceInStatistics: true,
    },
  });

  let errors = 0;

  for (const data of datas) {
    const user = await app.models.User.findOne({ where: { id: data.leadTicket.manager } });
    const userGarageIds = user ? user.garageIds : [];
    const garage = await app.models.Garage.findOne({ where: { id: data.garageId } });

    if (garage.type === 'Dealership') {
      if (!user) {
        console.log(
          `User ${
            data.leadTicket.manager
          } does not exist anymore, removing him off the management of LeadTicket ${data.id.toString()}`
        ); // eslint-disable-line max-len
        data.updateAttributes({ 'leadTicket.manager': 'undefined' });
        ++errors;
      } else if (!userGarageIds.map((g) => g.toString()).includes(data.garageId)) {
        console.log(
          `User ${data.leadTicket.manager} does not have access to garage ${
            data.garageId
          }, removing him off the management of LeadTicket ${data.id.toString()}`
        ); // eslint-disable-line max-len
        data.updateAttributes({ 'leadTicket.manager': 'undefined' });
        ++errors;
      }
    }
  }
  return errors;
}

//
// Unsatisfied Ticket
//
async function _processUnsatisfiedTickets() {
  const datas = await app.models.Data.find({
    where: {
      shouldSurfaceInStatistics: true,
      'unsatisfiedTicket.createdAt': { gte: new Date(0) },
      and: [{ 'unsatisfiedTicket.manager': { neq: 'undefined' } }, { 'unsatisfiedTicket.manager': { neq: null } }],
    },
    fields: {
      id: true,
      garageId: true,
      unsatisfiedTicket: true,
      type: true,
      garageType: true,
      shouldSurfaceInStatistics: true,
    },
  });

  let errors = 0;

  for (const data of datas) {
    const user = await app.models.User.findOne({ where: { id: data.unsatisfiedTicket.manager } });
    const userGarageIds = user ? user.garageIds : [];
    const garage = await app.models.Garage.findOne({ where: { id: data.garageId } });

    if (garage.type === 'Dealership') {
      if (!user) {
        console.log(
          `User ${
            data.unsatisfiedTicket.manager
          } does not exist anymore, removing him off the management of UnsatisfiedTicket ${data.id.toString()}`
        ); // eslint-disable-line max-len
        data.updateAttributes({ 'unsatisfiedTicket.manager': 'undefined' });
        ++errors;
      } else if (!userGarageIds.map((g) => g.toString()).includes(data.garageId)) {
        console.log(
          `User ${data.unsatisfiedTicket.manager} does not have access to garage ${
            data.garageId
          }, removing him off the management of UnsatisfiedTicket ${data.id.toString()}`
        ); // eslint-disable-line max-len
        data.updateAttributes({ 'unsatisfiedTicket.manager': 'undefined' });
        ++errors;
      }
    }
  }
  return errors;
}
