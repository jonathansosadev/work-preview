const { expect } = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const DataBuilder = require('../../common/lib/test/test-instance-factory/data-builder');
const UserAuthorization = require('../../common/models/user-autorization');
const DataTypes = require('../../common/models/data/type/data-types');
const reminderStatus = require('../../common/models/data/type/userActions/reminder-status');

let data;
let dataWithNoReminderAction;
let dataAlreadyCancelled;
let garage;
let user = {};
const createdAt = new Date();
const request = `
mutation dataSetCancelReminder ($id: ID!, $userId: ID!, $createdAt: String!, $ticketType: String!) {
    dataSetCancelReminder (id: $id, userId: $userId, createdAt: $createdAt, ticketType: $ticketType) {
        status
    }
}
`;

describe('Apollo::dataSetCancelReminder', async function () {
  before(async function () {
    await app.reset();
    user.authorization = {};
    user.authorization[UserAuthorization.ACCESS_TO_COCKPIT] = true;
    user = await app.addUser(user);
    garage = await app.addGarage();

    data = await new DataBuilder(app)
      .garage(garage.id)
      .type(DataTypes.EXOGENOUS_REVIEW)
      .shouldSurfaceInStatistics(true)
      .unsatisfiedTicket({
        actions: [
          {
            name: 'reminder',
            createdAt,
            reminderActionName: 'customerCall',
            reminderDate: '2021-08-26T00:00:00.000Z',
            reminderStatus: 'Resolved',
            ticketManagerId: '606f0c25984cd2000428fe74',
            isManual: null,
            unsatisfactionResolved: null,
            followupIsRecontacted: null,
            providedSolutions: null,
            claimReasons: null,
            newArrayValue: null,
            previousArrayValue: null,
            previousValue: null,
            field: null,
            comment: '',
            followupStatus: null,
          },
        ],
      })
      .create();

    dataWithNoReminderAction = await new DataBuilder(app)
      .garage(garage.id)
      .type(DataTypes.EXOGENOUS_REVIEW)
      .shouldSurfaceInStatistics(true)
      .unsatisfiedTicket({
        actions: [
          {
            name: 'unsatisfiedStarted',
            createdAt,
            assignerUserId: null,
            ticketManagerId: '606f0c25984cd2000428fe74',
            comment: null,
            isManual: false,
          },
        ],
      })
      .create();

    dataAlreadyCancelled = await new DataBuilder(app)
      .garage(garage.id)
      .type(DataTypes.EXOGENOUS_REVIEW)
      .shouldSurfaceInStatistics(true)
      .unsatisfiedTicket({
        actions: [
          {
            name: 'reminder',
            createdAt,
            reminderActionName: 'customerCall',
            reminderDate: '2021-08-26T00:00:00.000Z',
            reminderStatus: reminderStatus.CANCELLED,
            ticketManagerId: '606f0c25984cd2000428fe74',
            isManual: null,
            unsatisfactionResolved: null,
            followupIsRecontacted: null,
            providedSolutions: null,
            claimReasons: null,
            newArrayValue: null,
            previousArrayValue: null,
            previousValue: null,
            field: null,
            comment: '',
            followupStatus: null,
          },
        ],
      })
      .create();
  });

  it('should cancel a ticket reminder action', async function () {
    const variables = {
      id: data.id.toString(),
      userId: user.id.toString(),
      createdAt: createdAt.toISOString(),
      ticketType: 'unsatisfied',
    };

    const res = await sendQueryAs(app, request, variables, user.id);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('dataSetCancelReminder');
    expect(res.data.dataSetCancelReminder).to.be.an('object').which.have.keys('status');
    expect(res.data.dataSetCancelReminder.status).to.be.true;

    const updatedData = await app.models.Data.getMongoConnector().findOne(
      { _id: data.id },
      { projection: { 'unsatisfiedTicket.actions': true } }
    );
    expect(updatedData).to.be.an('object').which.have.any.keys('unsatisfiedTicket');
    expect(updatedData.unsatisfiedTicket).to.be.an('object').which.have.keys('actions');
    expect(updatedData.unsatisfiedTicket.actions).to.be.an('array').lengthOf(1);
    expect(updatedData.unsatisfiedTicket.actions[0]).to.be.an('object').which.have.any.keys('reminderStatus');
    expect(updatedData.unsatisfiedTicket.actions[0].reminderStatus).to.be.equal(reminderStatus.CANCELLED);
  });

  it('should return an invalid response when no data was found', async function () {
    const variables = {
      id: new ObjectId().toString(),
      userId: user.id.toString(),
      createdAt: createdAt.toISOString(),
      ticketType: 'unsatisfied',
    };

    const res = await sendQueryAs(app, request, variables, user.id);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('dataSetCancelReminder');
    expect(res.data.dataSetCancelReminder).to.be.an('object').which.have.keys('status');
    expect(res.data.dataSetCancelReminder.status).to.be.false;
  });

  it('should return an invalid response when an unknown type was supplied', async function () {
    const variables = {
      id: data.id.toString(),
      userId: user.id.toString(),
      createdAt: createdAt.toISOString(),
      ticketType: 'TEST',
    };

    const res = await sendQueryAs(app, request, variables, user.id);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('dataSetCancelReminder');
    expect(res.data.dataSetCancelReminder).to.be.an('object').which.have.keys('status');
    expect(res.data.dataSetCancelReminder.status).to.be.false;
  });

  it('should return a valid response with data unchanged when no action reminder was found', async function () {
    const variables = {
      id: dataWithNoReminderAction.id.toString(),
      userId: user.id.toString(),
      createdAt: createdAt.toISOString(),
      ticketType: 'unsatisfied',
    };

    const res = await sendQueryAs(app, request, variables, user.id);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('dataSetCancelReminder');
    expect(res.data.dataSetCancelReminder).to.be.an('object').which.have.keys('status');
    expect(res.data.dataSetCancelReminder.status).to.be.true;

    const updatedData = await app.models.Data.getMongoConnector().findOne(
      { _id: dataWithNoReminderAction.id },
      { projection: { 'unsatisfiedTicket.actions': true } }
    );
    expect(updatedData).to.be.an('object').which.have.any.keys('unsatisfiedTicket');
    expect(updatedData.unsatisfiedTicket).to.be.an('object').which.have.keys('actions');
    expect(updatedData.unsatisfiedTicket.actions).to.be.an('array').lengthOf(1);
    const noReminder = updatedData.unsatisfiedTicket.actions.filter(({ name }) => name === 'reminder');
    expect(noReminder).to.be.an('array').lengthOf(0);
  });

  it('should return a valid response when the action was already cancelled', async function () {
    const variables = {
      id: dataAlreadyCancelled.id.toString(),
      userId: user.id.toString(),
      createdAt: createdAt.toISOString(),
      ticketType: 'unsatisfied',
    };

    const res = await sendQueryAs(app, request, variables, user.id);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').and.to.have.keys('dataSetCancelReminder');
    expect(res.data.dataSetCancelReminder).to.be.an('object').which.have.keys('status');
    expect(res.data.dataSetCancelReminder.status).to.be.true;
  });
});
