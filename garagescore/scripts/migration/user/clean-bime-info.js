/* eslint-disable no-restricted-syntax */
const app = require('../../../server/server');

app.on('booted', async () => {
  const $unset = { bimeAccessToken: null, bimeNamedUserGroupId: null, bimeDashboardIds: null };
  const result = await app.models.User.getMongoConnector().updateMany({}, { $unset });

  console.log(`Finished ! Total users modified: ${result.modifiedCount}`);
  process.exit(0);
});
