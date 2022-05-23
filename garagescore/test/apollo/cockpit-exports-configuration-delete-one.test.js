const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const sendQuery = require('./_send-query-as');

const TestApp = require('../../common/lib/test/test-app');
const { ObjectID } = require('mongodb');
const testApp = new TestApp();

const mutationName = 'cockpitExportsConfigurationDeleteOne';
const mutation = `mutation ${mutationName}($id: String!) {
  ${mutationName}(id: $id) {
    status
    message
    data {
        id
    }
  }
}`;

describe('Apollo - cockpitExportsConfigurationDeleteOne', () => {
  let USERS;
  let USER_1_ID; // 5fda1b93654b8b53b8aa2874, config index 2 and 3
  let USER_2_ID; // 5ffc123bc81a8b0003714cc5 , config index 0 and 1

  let COCKPIT_EXPORTS_CONFIGURATION;

  beforeEach(async function () {
    await testApp.reset();
    // create datas for test

    await testApp.restore(path.resolve(`${__dirname}/dumps/analytics-v2/User.dump`));
    await testApp.restore(path.resolve(`${__dirname}/dumps/analytics-v2/CockpitExportConfiguration.dump`));
    // 2 users
    USERS = await testApp.models.User.getMongoConnector().find({}).sort({ _id: 1 }).toArray();
    USER_1_ID = USERS[0]._id.toString();
    // eslint-disable-next-line no-unused-vars
    USER_2_ID = USERS[1]._id.toString();

    // 4 configurations, 2 for user1 and 2 for user2
    COCKPIT_EXPORTS_CONFIGURATION = await testApp.models.CockpitExportConfiguration.getMongoConnector()
      .find({})
      .sort({ _id: 1 })
      .toArray();
  });

  it('should delete the document from the collection', async () => {
    const EXPORT_CONFIG_ID = COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString();

    const res = await sendQuery(testApp, mutation, { id: EXPORT_CONFIG_ID }, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('success');
    expect(res.data[mutationName].data).to.exist;
    expect(res.data[mutationName].data.id).to.equal(EXPORT_CONFIG_ID);

    /*checks that the document is not present in the collection */
    const deletedDocument = await testApp.models.CockpitExportConfiguration.getMongoConnector().findOne({
      _id: ObjectID(EXPORT_CONFIG_ID),
    });

    expect(deletedDocument).to.be.null;
  });

  it("should NOT delete the document if the configuration doesn't belongs to the user making the request", async () => {
    const EXPORT_CONFIG_ID_USER_2 = COCKPIT_EXPORTS_CONFIGURATION[0]._id.toString();
    /* the config belongs to USER_2 and USER_1 is sending the request */
    const res = await sendQuery(testApp, mutation, { id: EXPORT_CONFIG_ID_USER_2 }, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('error');
    expect(res.data[mutationName].data).to.be.null;
  });
});
