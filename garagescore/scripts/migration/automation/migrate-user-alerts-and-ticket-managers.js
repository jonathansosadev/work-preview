/** add default configuration to jobs */
const app = require('../../../server/server.js');

app.on('booted', async () => {
  console.log('Part 1 : Migrations on user alerts');
  const getPath = (key) => `allGaragesAlerts.${key}`;
  const queries = [
    // Remove specialized automation switches or mistakes I did
    {
      find: {},
      update: {
        $unset: {
          [getPath('AutomationLeadApv')]: '',
          [getPath('AutomationLeadVn')]: '',
          [getPath('AutomationLeadVo')]: '',
          [getPath('EscalationLeadApv')]: '',
        },
      },
    },
    // Set leadApv and escalation Apv to false for everyone
    {
      find: {},
      update: { $set: { [getPath('LeadApv')]: false, [getPath('EscalationLeadMaintenance')]: false } },
    },
  ];
  const updateResults = await Promise.allSettled(
    queries.map(({ find, update }) => app.models.User.getMongoConnector().updateMany(find, update))
  );

  const totalUpdated = updateResults.reduce((r, { value }) => (r += value && value.modifiedCount), 0);
  const nErrs = updateResults.filter(({ status }) => status === 'rejected').length;
  const errors = updateResults.filter(({ status }) => status === 'rejected').map(({ reason }) => reason);
  console.log(`
  Modified ${totalUpdated} alert subscriptions. ${nErrs} updateManies have an error
  Errors: ${errors ? errors.join('; ') : 'None'}
  `);

  console.log('Part 2 : Set default APV Lead ticket manager');
  console.log('Please launch : node scripts/maintenance/garages/reset-tickets-default-manager.js');

  process.exit();
});
