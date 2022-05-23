const chai = require('chai');
const expect = chai.expect;
const Tools = require('../../common/lib/test/testtools');
const UserAuthorization = require('../../common/models/user-autorization');
const { ExportTypes, ExportPeriods, ExportFrequencies } = require('../../frontend/utils/enumV2');
const DataTypes = require('../../common/models/data/type/data-types');
const sendQuery = require('./_send-query-as');

const TestApp = require('../../common/lib/test/test-app');
const testApp = new TestApp();

const queryName = 'cockpitExportsConfigurationAddOne';
const mutation = `mutation ${queryName}($userId: String!, $exportType: String!, $periodId: String, $startPeriodId: String, $endPeriodId: String, $frequency: String!, $dataTypes: [String]!, $garageIds: [String!]!, $fields: [String!]!, $name: String!, $recipients: [String!]!) {
  ${queryName}(userId: $userId, exportType: $exportType, periodId: $periodId, startPeriodId: $startPeriodId, endPeriodId: $endPeriodId, frequency: $frequency, dataTypes: $dataTypes, garageIds: $garageIds, fields: $fields, name: $name, recipients: $recipients) {
    status
    message
    data {
        id
    }
  }
}`;

describe('Apollo - cockpitExportsConfigurationAddOne', () => {
  let ARGS_VALID;

  let User;
  let user1;
  let user2;
  let user_with_no_access_to_cockpit; // no cockpit authorization
  let user_with_no_garageIds;

  let Garage;
  let garage1;
  let garage2;

  beforeEach(async function () {
    await testApp.reset();
    Garage = testApp.models.Garage;
    garage1 = Tools.random.garage();
    garage1 = await Garage.create(garage1);
    garage2 = Tools.random.garage();
    garage2 = await Garage.create(garage2);

    User = testApp.models.User;
    user1 = Tools.random.user();
    user1.authorization = {};
    user1.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user1.garageIds = [garage1.getId(), garage2.getId()];
    user1 = await User.create(user1);

    user2 = Tools.random.user();
    user2.authorization = {};
    user2.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user2.garageIds = [garage1.getId()];
    user2 = await User.create(user2);

    user_with_no_access_to_cockpit = Tools.random.user();
    user_with_no_access_to_cockpit.authorization = {};
    user_with_no_access_to_cockpit.garageIds = [garage1.getId()];
    user_with_no_access_to_cockpit = await User.create(user_with_no_access_to_cockpit);

    user_with_no_garageIds = Tools.random.user();
    user_with_no_garageIds.authorization = {};
    user_with_no_garageIds = await User.create(user_with_no_garageIds);

    ARGS_VALID = {
      userId: user1.id.toString(),
      exportType: ExportTypes.GARAGES,
      periodId: ExportPeriods.LAST_QUARTER,
      startPeriodId: null,
      endPeriodId: null,
      frequency: ExportFrequencies.NONE,
      dataTypes: [DataTypes.MAINTENANCE],
      garageIds: [garage1.getId().toString()],
      fields: ['BG_SAT__REVIEWS_COUNT', 'BG_SAT__NPS'],
      name: 'monSuperExport',
      recipients: ['giroud@gmail.com', 'lachevre@gmail.com'],
    };
  });
  it('should add a new configuration when all arguments are valid', async () => {
    const res = await sendQuery(testApp, mutation, ARGS_VALID, user1.id.toString());

    expect(res).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult).to.exist;
    expect(queryResult.status).to.equal('success');
    expect(queryResult.message).to.equal('Configuration created');
    /* check that only one document have been created */
    const collectionContent = await testApp.models.CockpitExportConfiguration.getMongoConnector()
      .find({})
      .sort({ _id: 1 })
      .toArray();
    expect(collectionContent).to.be.an.array;
    expect(collectionContent).to.have.length(1);
    /* the document id match the one sent by the query */
    expect(collectionContent[0]._id.toString()).to.equal(queryResult.data.id.toString());
  });

  /* user2 sends the query on behalf of user1 */
  it('a user cannot create a configuration on behalf of another user', async () => {
    const ARGS_INVALID_USER_ID = {
      ...ARGS_VALID,
      userId: user1.id.toString(),
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_USER_ID, user2.id.toString());
    expect(res).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.equal("Not authorized to create this user export's configuration");
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the user does not have access to cockpit', async () => {
    const ARGS_USER_MISSING_ACCESS = {
      ...ARGS_VALID,
      userId: user_with_no_access_to_cockpit.id.toString(),
    };

    const res = await sendQuery(
      testApp,
      mutation,
      ARGS_USER_MISSING_ACCESS,
      user_with_no_access_to_cockpit.id.toString()
    );

    expect(res).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.equal('Not authorized');
    expect(queryResult.data).to.be.null;
  });

  //--------------------------------------------------------------------------------------//
  //                                   Query Arguments                                    //
  //--------------------------------------------------------------------------------------//

  it('should return an error when userId is not a valid id', async () => {
    const ARGS_INVALID_USER_ID = {
      ...ARGS_VALID,
      userId: 'INVALID_USER_ID',
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_USER_ID, user1.id.toString());
    expect(res).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('userId');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the exportType is not valid', async () => {
    const ARGS_INVALID_EXPORT_TYPE = {
      ...ARGS_VALID,
      exportType: 'INVALID_EXPORT_TYPE',
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_EXPORT_TYPE, user1.id.toString());

    expect(res).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('INVALID_EXPORT_TYPE');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the periodId is not valid', async () => {
    const ARGS_INVALID_PERIOD = {
      ...ARGS_VALID,
      periodId: 'lastQuarter', // invalid => LAST_QUARTER
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_PERIOD, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('periodId');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the dataTypes are not valid', async () => {
    const ARGS_INVALID_DATATYPES = {
      ...ARGS_VALID,
      dataTypes: ['toto'],
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_DATATYPES, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('dataTypes');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the name is not valid', async () => {
    const ARGS_INVALID_NAME = {
      ...ARGS_VALID,
      name: '',
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_NAME, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('name');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the recipients are not valid', async () => {
    const ARGS_INVALID_RECIPIENTS = {
      ...ARGS_VALID,
      recipients: ['toto'],
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_RECIPIENTS, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('recipients');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the fields are not valid', async () => {
    const ARGS_INVALID_FIELDS = {
      ...ARGS_VALID,
      fields: ['toto'],
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_FIELDS, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('fields');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if there is a missing argument', async () => {
    const requiredArgs = Object.keys(ARGS_VALID).filter((arg) => !['periodId', 'startPeriodId', 'endPeriodId']);
    for (const arg of requiredArgs) {
      const ARG_MISSING = { ...ARGS_VALID };
      /* remove one arg */
      delete ARG_MISSING[arg];
      const res = await sendQuery(testApp, mutation, ARG_MISSING, user1.id.toString());
      expect(res).to.exist;
      expect(res.errors).to.be.an.array;
      expect(res.errors[0].message, `Fails when missing argument is ${arg}`).to.include('required');
    }
    // Special tests for periodId & customPeriods
    {
      const ARG_MISSING = { ...ARGS_VALID };
      ARG_MISSING.periodId = null;
      ARG_MISSING.startPeriodId = null;
      ARG_MISSING.endPeriodId = null;
      const { data } = await sendQuery(testApp, mutation, ARG_MISSING, user1.id.toString());
      expect(data.cockpitExportsConfigurationAddOne).to.exist;
      expect(data.cockpitExportsConfigurationAddOne.status).to.equal('error');
      expect(data.cockpitExportsConfigurationAddOne.message, `Fails when missing argument is periodId`).to.include(
        'required'
      );
    }
  });

  it('should return an error if the frequency is invalid', async () => {
    const ARGS_INVALID_FIELDS = {
      ...ARGS_VALID,
      frequency: 'toto',
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_FIELDS, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('frequency');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the frequency is not "NONE" and the startPeriodId/endPeriodId is not null', async () => {
    const ARGS_INVALID_FIELDS = {
      ...ARGS_VALID,
      frequency: ExportFrequencies.EVERY_DAY,
      periodId: null,
      startPeriodId: '2020-month01',
      endPeriodId: '2020-month01',
    };

    const res = await sendQuery(testApp, mutation, ARGS_INVALID_FIELDS, user1.id.toString());

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${queryName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('cannot have a CustomPeriod with a frequency other than NONE');
    expect(queryResult.data).to.be.null;
  });
});
