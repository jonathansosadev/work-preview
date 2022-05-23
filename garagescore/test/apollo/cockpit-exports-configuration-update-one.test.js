const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const sendQuery = require('./_send-query-as');

const TestApp = require('../../common/lib/test/test-app');
const { ObjectID } = require('mongodb');
const testApp = new TestApp();
const { ExportPeriods, ExportFrequencies } = require('../../frontend/utils/enumV2');

const mutationName = 'cockpitExportsConfigurationUpdateOne';
const mutation = `mutation ${mutationName}($id: String!, $userId: String!, $exportType: String!, $periodId: String, $startPeriodId: String, $endPeriodId: String, $frequency: String!, $dataTypes: [String]!, $garageIds: [String!]!, $fields: [String!]!, $name: String!, $recipients: [String!]!) {
  ${mutationName}(id: $id, userId: $userId, exportType: $exportType, periodId: $periodId, startPeriodId: $startPeriodId, endPeriodId: $endPeriodId, frequency: $frequency, dataTypes: $dataTypes, garageIds: $garageIds, fields: $fields, name: $name, recipients: $recipients) {
    status
    message
    data {
        id
    }
  }
}`;

describe('Apollo - cockpitExportsConfigurationUpdateOne', () => {
  let USERS;
  let USER_1_GARAGES;
  let USER_1_ID; // 5fda1b93654b8b53b8aa2874, config index 2 and 3
  let USER_2_ID; // 5ffc123bc81a8b0003714cc5 , config index 0 and 1

  let COCKPIT_EXPORTS_CONFIGURATION;
  let VALID_ARGS;

  beforeEach(async function () {
    await testApp.reset();
    // create datas for test

    await testApp.restore(path.resolve(`${__dirname}/dumps/analytics-v2/User.dump`));
    await testApp.restore(path.resolve(`${__dirname}/dumps/analytics-v2/CockpitExportConfiguration.dump`));
    // 2 users
    USERS = await testApp.models.User.getMongoConnector().find({}).sort({ _id: 1 }).toArray();
    USER_1_ID = USERS[0]._id.toString();
    USER_1_GARAGES = USERS[0].garageIds.map((id) => id.toString());
    // eslint-disable-next-line no-unused-vars
    USER_2_ID = USERS[1]._id.toString();

    // 4 configurations, 2 for user1 and 2 for user2
    COCKPIT_EXPORTS_CONFIGURATION = await testApp.models.CockpitExportConfiguration.getMongoConnector()
      .find({})
      .sort({ _id: 1 })
      .toArray();

    VALID_ARGS = {
      id: COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString(),
      userId: USER_1_ID,
      exportType: 'LEADS',
      fields: ['BD_CON__GENDER', 'BD_CON__FULLNAME'],
      dataTypes: ['NewVehicleSale'],
      periodId: ExportPeriods.LAST_QUARTER,
      startPeriodId: null,
      endPeriodId: null,
      frequency: ExportFrequencies.NONE,
      name: 'TOTO',
      garageIds: [USERS[0].garageIds[0].toString()],
      recipients: ['toto@gmail.com'],
    };
  });

  it('should update the document from the collection', async () => {
    const res = await sendQuery(testApp, mutation, VALID_ARGS, USER_1_ID);
    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('success');
    expect(res.data[mutationName].data).to.exist;
    expect(res.data[mutationName].data.id).to.equal(VALID_ARGS.id);

    /*check that the document has been updated */
    const updatedDocument = await testApp.models.CockpitExportConfiguration.getMongoConnector().findOne({
      _id: ObjectID(VALID_ARGS.id),
    });
    expect(updatedDocument).to.exist;

    for (const [key, value] of Object.entries(VALID_ARGS)) {
      if (key !== 'id') {
        expect(
          JSON.stringify(updatedDocument[key]),
          `field ${key} has not been updated to value : ${value}. Found : ${updatedDocument[key]}`
        ).to.equal(JSON.stringify(value));
      }
    }
  });

  it("should send an error when updating a configuration that doesn't belong to the user making the request", async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      id: COCKPIT_EXPORTS_CONFIGURATION[0]._id.toString(), //this config belongs to USER_2
      name: 'TOTO',
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID); //USER_1 is making the request

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('error');
    expect(res.data[mutationName].data).to.be.null;
  });

  //--------------------------------------------------------------------------------------//
  //                                      GarageIds                                       //
  //--------------------------------------------------------------------------------------//

  it('should NOT send an error when updating the garageIds with a garageId that belongs to the user', async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      id: COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString(), //this config belongs to USER_1
      garageIds: [USER_1_GARAGES[0]], //belongs to USER_1
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID); //USER_1 is making the request

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('success');
    expect(res.data[mutationName].data).to.exist;
    expect(res.data[mutationName].data.id).to.equal(FIELDS_TO_UPDATE.id);
  });

  it("should send an error when updating the garageIds with a garageId that doesn't belong to the user", async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      id: COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString(), //this config belongs to USER_1
      garageIds: ['57308e1d198cee1a00ee7b0a'], //this garageId doesn't belong to USER_1
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('error');
    expect(res.data[mutationName].data).to.be.null;
  });

  it("should not send an error when updating garageIds with 'All'", async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      id: COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString(), //this config belongs to USER_1
      garageIds: ['All'],
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('success');
    expect(res.data[mutationName].data).to.exist;
    expect(res.data[mutationName].data.id).to.equal(FIELDS_TO_UPDATE.id);
  });

  //--------------------------------------------------------------------------------------//
  //                                   Missing argument                                   //
  //--------------------------------------------------------------------------------------//

  it('should send an error if an argument is missing', async () => {
    const requiredArgs = Object.keys(VALID_ARGS).filter((arg) => !['periodId', 'startPeriodId', 'endPeriodId']);
    for (const arg of requiredArgs) {
      const MISSING_ARG = { ...VALID_ARGS };
      /* delete one arg */
      delete MISSING_ARG[arg];
      const res = await sendQuery(testApp, mutation, MISSING_ARG, USER_1_ID);
      expect(res).to.exist;
      expect(res.errors).to.be.an.array;
      expect(res.errors[0].message, `Fails when missing argument is ${arg}`).to.include('required');
    }
    // Special tests for periodId & customPeriods
    {
      const ARG_MISSING = { ...VALID_ARGS };
      ARG_MISSING.periodId = null;
      ARG_MISSING.startPeriodId = null;
      ARG_MISSING.endPeriodId = null;
      const { data } = await sendQuery(testApp, mutation, ARG_MISSING, USER_1_ID);
      expect(data.cockpitExportsConfigurationUpdateOne).to.exist;
      expect(data.cockpitExportsConfigurationUpdateOne.status).to.equal('error');
      expect(data.cockpitExportsConfigurationUpdateOne.message, `Fails when missing argument is periodId`).to.include(
        'required'
      );
    }
  });

  //--------------------------------------------------------------------------------------//
  //                         ExportType, Fields and DataTypes compatibility               //
  //--------------------------------------------------------------------------------------//

  /* send all 3 compatible args exportType, fields and dataTypes */
  it('should NOT send an error if all fields are compatible and none are missing', async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      id: COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString(),
      exportType: 'SATISFACTION', // category : BY_DATA
      fields: ['BD_COM__FRONT_DESK_USER', 'BD_COM__INTERNAL_REFERENCE'], // BY_DATA
      dataTypes: ['Maintenance'],
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID);
    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('success');
    expect(res.data[mutationName].data).to.exist;
    expect(res.data[mutationName].data.id).to.equal(FIELDS_TO_UPDATE.id);
  });

  // /* exportType is not compatible with fields */
  it('should send an error if the exportType is not compatible with fields', async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      id: COCKPIT_EXPORTS_CONFIGURATION[2]._id.toString(),
      exportType: 'GARAGES', // category : BY_GARAGES
      fields: ['BD_COM__FRONT_DESK_USER', 'BD_COM__INTERNAL_REFERENCE'], // category : BY_DATA
      dataTypes: ['Maintenance'],
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    expect(res.data[mutationName]).exist;
    expect(res.data[mutationName].status).to.equal('error');
    expect(res.data[mutationName].message).to.includes('fields');
    expect(res.data[mutationName].data).to.be.null;
  });

  it('should return an error if the frequency is invalid', async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      frequency: 'toto',
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${mutationName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('frequency');
    expect(queryResult.data).to.be.null;
  });

  it('should return an error if the frequency is not "NONE" and the startPeriodId/endPeriodId is not null', async () => {
    const FIELDS_TO_UPDATE = {
      ...VALID_ARGS,
      frequency: ExportFrequencies.EVERY_DAY,
      periodId: null,
      startPeriodId: '2020-month01',
      endPeriodId: '2020-month01',
    };

    const res = await sendQuery(testApp, mutation, FIELDS_TO_UPDATE, USER_1_ID);

    expect(res).to.exist;
    expect(res.data).to.exist;
    const queryResult = res.data[`${mutationName}`];
    expect(queryResult.status).to.equal('error');
    expect(queryResult.message).to.includes('cannot have a CustomPeriod with a frequency other than NONE');
    expect(queryResult.data).to.be.null;
  });
});
