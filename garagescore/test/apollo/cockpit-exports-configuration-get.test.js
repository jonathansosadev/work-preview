const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const sendQuery = require('./_send-query-as');

const TestApp = require('../../common/lib/test/test-app');
const testApp = new TestApp();

const queryName = 'cockpitExportsConfigurationGet';
const query = `query ${queryName}($id: String, $userId: String) {
  ${queryName}(id: $id, userId: $userId) {
    status
    message
    data {
      id
      userId
      exportType
      periodId
      startPeriodId
      endPeriodId
      frequency
      dataTypes
      garageIds
      fields
      name
      recipients
    }
  }
}`;

describe('Apollo - cockpitExportsConfigurationGet', () => {
  let USERS;
  let USER_1_ID; // 5fda1b93654b8b53b8aa2874
  let USER_2_ID; // 5ffc123bc81a8b0003714cc5

  let COCKPIT_EXPORTS_CONFIGURATION;

  beforeEach(async function () {
    await testApp.reset();
    // create datas for test

    await testApp.restore(path.resolve(`${__dirname}/dumps/analytics-v2/User.dump`));
    await testApp.restore(path.resolve(`${__dirname}/dumps/analytics-v2/CockpitExportConfiguration.dump`));
    // 2 users
    USERS = await testApp.models.User.getMongoConnector().find({}).sort({ _id: 1 }).toArray();
    USER_1_ID = USERS[0]._id.toString();
    USER_2_ID = USERS[1]._id.toString();

    // 4 configurations, 2 for user1 and 2 for user2
    COCKPIT_EXPORTS_CONFIGURATION = await testApp.models.CockpitExportConfiguration.getMongoConnector()
      .find({})
      .sort({ _id: 1 })
      .toArray();
  });
  it('a user should not be able to retrieve others users configurations', async () => {
    /* sending query as USER_1 */
    const res = await sendQuery(testApp, query, {}, USER_1_ID);
    expect(res).to.exist;
    expect(res.data).to.exist;
    /* should send only USER_1 configs */
    expect(res.data[queryName].data).to.have.length(2);
    expect(res.data[queryName].data.every((config) => config.userId.toString() === USER_1_ID)).to.be.true;
  });

  it('a user should not be able to retrieve others users configurations even when the document id is specified', async () => {
    /* sending query as USER_1 but the configuration belongs to USER_2*/
    const res = await sendQuery(testApp, query, { id: COCKPIT_EXPORTS_CONFIGURATION[0]._id.toString() }, USER_1_ID);

    expect(res).to.exist;
    expect(res.data[queryName].data).to.exist;
    expect(res.data[queryName].data).to.have.length(0);
  });

  it('should return an error when trying to specify an userId that is not the one sending the query', async () => {
    /* sending query as USER_1 and specify USER_2_ID as arguments*/
    const res = await sendQuery(testApp, query, { userId: USER_2_ID }, USER_1_ID);
    expect(res).to.exist;
    expect(res.data[queryName].status).to.equal("error");
    expect(res.data[queryName].data).to.be.null;
  });
});
