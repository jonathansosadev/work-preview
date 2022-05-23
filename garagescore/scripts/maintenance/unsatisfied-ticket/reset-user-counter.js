/**
 * this script must reset the counter user.countActiveLeadTicket which will be shown in the lead page KPI on cockpit for a given userId
 */
const app = require('../../../server/server.js');
const promises = require('../../../common/lib/util/promises');
const ticketStatus = require('../../../common/models/data/type/ticket-status');

let userId;
process.argv.forEach((val, index) => {
  if (val === '--help') {
    console.log('');
    console.log('* Create the overAll statistics to show in light-Bi using GarageHistory Model');
    console.log('* GarageHistory is a model to cache calculated statistics for the 90 last days for each garage');
    console.log('');
    console.log(
      'Usage node scripts/maintenance/unsatisfied-ticket/reset-user-counter.js --user-id 5a5e00d2f4609513002b4f02'
    );
    process.exit(0);
  }
  if (val === '--user-id') {
    if (!process.argv[index + 1] || process.argv[index + 1].length !== 24) {
      console.error(`Invalid user id ${process.argv[index + 1]}`);
      process.exit(-1);
    }
    userId = process.argv[index + 1];
  }
});

if (!userId) {
  console.error('Error :No userId');
  process.exit(-1);
}
async function run() {
  const datas = await promises.wait((cb) =>
    app.models.Data.find(
      {
        where: {
          'unsatisfiedTicket.manager': userId,
        },
      },
      cb
    )
  );
  console.log(`Contribute in ${datas.length} unsatisfiedTickets`);
  let counter = 0;
  const user = await app.models.User.findById(userId);
  for (let i = 0; i < datas.length; i++) {
    const data = datas[i];
    if (!user.hasAccessToGarage(data.garageId)) {
      console.log(
        `User has no more access to garage ${
          data.garageId
        } so hi lost access to unsatisfiedTicket of id ${data.getId()}`
      );
    } else if ([ticketStatus.NEW, ticketStatus.RUNNING].includes(data.get('unsatisfiedTicket.status'))) {
      counter++;
    }
  }
  console.log(`countActiveUnsatisfiedTicket : ${counter}`);
  user.countActiveUnsatisfiedTicket = counter;
  await user.save();
}
app.on('booted', () => {
  console.log(`Fix started : ${new Date()}`);
  run()
    .then(() => {
      console.log(`Fix ended : ${new Date()}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
      process.exit(-1);
    });
});
