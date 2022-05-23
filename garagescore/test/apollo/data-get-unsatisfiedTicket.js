const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const GarageTypes = require('../../common/models/garage.type');
const RejectedReason = require('../../common/models/data/type/rejected-reasons');
const ModerationStatus = require('../../common/models/data/type/moderation-status');

const DataBuilder = require('../../common/lib/test/test-instance-factory/data-builder');

let garage;
let garageNotAssociatedToUser;
let user;
let dataWithNoTicket;
let data;
let sampleData;
const fields = ['unsatisfiedTicket', 'customer', 'garage', 'unsatisfied', 'review', 'id', 'service'];

const customer = {
  fullName: 'test',
  contact: {
    mobilePhone: null,
    email: 'test@test.com',
  },
};

const actions = [
  {
    name: 'unsatisfiedStarted',
    createdAt: '2021-08-25T14:45:36.386Z',
    reminderActionName: null,
    reminderStatus: null,
    reminderDate: null,
    assigner: null,
    reminderTriggeredBy: null,
    ticketManager: {
      id: '606f0c25984cd2000428fe74',
      email: 'izandi@garagescore.com',
      firstName: 'izad',
      lastName: 'zandi',
      job: 'Custeed',
    },
    isManual: true,
    unsatisfactionResolved: null,
    followupIsRecontacted: null,
    providedSolutions: null,
    claimReasons: null,
    newArrayValue: null,
    previousArrayValue: null,
    previousValue: null,
    field: null,
    comment: null,
    followupStatus: null,
  },
  {
    name: 'reminder',
    createdAt: '2021-08-25T15:15:46.299Z',
    reminderActionName: 'customerCall',
    reminderStatus: 'Cancelled',
    reminderDate: '2021-08-26T00:00:00.000Z',
    assigner: {
      id: '606f0c25984cd2000428fe74',
      email: 'izandi@garagescore.com',
      firstName: 'izad',
      lastName: 'zandi',
    },
    reminderTriggeredBy: {
      id: '606f0c25984cd2000428fe74',
      email: 'izandi@garagescore.com',
      firstName: 'izad',
      lastName: 'zandi',
    },
    ticketManager: {
      id: '606f0c25984cd2000428fe74',
      email: 'izandi@garagescore.com',
      firstName: 'izad',
      lastName: 'zandi',
      job: 'Custeed',
    },
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
  {
    name: 'garageSecondVisit',
    createdAt: '2021-08-26T09:12:05.955Z',
    reminderActionName: null,
    reminderStatus: null,
    reminderDate: null,
    assigner: {
      id: '606f0c25984cd2000428fe74',
      email: 'izandi@garagescore.com',
      firstName: 'izad',
      lastName: 'zandi',
    },
    reminderTriggeredBy: null,
    ticketManager: null,
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
  {
    name: 'unsatisfiedClosed',
    createdAt: '2021-08-26T09:15:51.123Z',
    reminderActionName: null,
    reminderStatus: null,
    reminderDate: null,
    assigner: {
      id: '606f0c25984cd2000428fe74',
      email: 'izandi@garagescore.com',
      firstName: 'izad',
      lastName: 'zandi',
    },
    reminderTriggeredBy: null,
    ticketManager: null,
    isManual: null,
    unsatisfactionResolved: true,
    followupIsRecontacted: null,
    providedSolutions: ['CustomerCall'],
    claimReasons: null,
    newArrayValue: null,
    previousArrayValue: null,
    previousValue: null,
    field: null,
    comment: '',
    followupStatus: null,
  },
];
const request = `query dataGetUnsatisfiedTicket($id: ID!) {
      dataGetUnsatisfiedTicket(id: $id) {
        id
        unsatisfiedTicket {
            createdAt
            closedAt
            comment
            type
            status
            frontDeskUserName
            customer {
                fullName
                contact {
                    mobilePhone
                    email
                }
            }
            vehicle {
                model
                plate
                make
                makeModel
            }
            actions {
                name
                createdAt
                reminderActionName
                reminderStatus
                reminderDate
                assigner {
                  id
                  email
                  firstName
                  lastName
                }
                reminderTriggeredBy {
                  id
                  email
                  firstName
                  lastName
                }
                ticketManager {
                  id
                  email
                  firstName
                  lastName
                  job
                }
                isManual
                unsatisfactionResolved
                followupIsRecontacted
                providedSolutions
                claimReasons
                newArrayValue
                previousArrayValue
                previousValue
                field
                comment
                followupStatus
            }
            manager {
                firstName
                lastName
                email
                id
            }
        }
        customer {
            city {
                value
            }
        }
        garage {
            id
            publicDisplayName
            type
            users {
              id
              email
              firstName
              lastName
              job
              hasOnlyThisGarage
            }
        }
        unsatisfied {
            criteria {
                label
                values
            }
        }
        review {
            comment {
                text
            }
            rating {
              value
            }
            reply {
              status
              text
              rejectedReason
            }
        }
        service {
          providedAt
        }
      }
    }`;

describe('Apollo::dataGetUnsatisfiedTicket', async function () {
  before(async () => {
    await app.reset();
    garage = await app.addGarage({ publicDisplayName: 'Garage Test' });
    garageNotAssociatedToUser = await app.addGarage({ publicDisplayName: 'Garage Test', type: GarageTypes.DEALERSHIP });
    user = await app.addUser({
      garageIds: [garage.getId()],
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });

    dataWithNoTicket = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .type('UsedVehicleSale')
      .shouldSurfaceInStatistics(true)
      .create();

    data = await new DataBuilder(app)
      .garage(garageNotAssociatedToUser.getId().toString())
      .type('UsedVehicleSale')
      .unsatisfiedTicket({ userId: user.getId() })
      .shouldSurfaceInStatistics(true)
      .create();

    sampleData = await new DataBuilder(app)
      .garage(garage.getId().toString())
      .type('UsedVehicleSale')
      .customerField('city', { value: 'Paris' })
      .unsatisfiedTicket({ userId: user.getId(), actions, customer })
      .reviewComment('un autre commentaire')
      .reviewRating(8)
      .reviewReply()
      .unsatisfied()
      .shouldSurfaceInStatistics(true)
      .create();
  });

  it('should return a valid unsatisfiedTicket when everything is good', async function () {
    const variables = {
      id: sampleData.id.toString(),
    };
    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataGetUnsatisfiedTicket');
    expect(res.data.dataGetUnsatisfiedTicket).to.be.an('object').which.have.keys(fields);

    //CUSTOMER
    expect(res.data.dataGetUnsatisfiedTicket.customer).to.be.an('object').which.have.keys('city');
    expect(res.data.dataGetUnsatisfiedTicket.customer.city).to.be.an('object').which.have.keys('value');
    expect(res.data.dataGetUnsatisfiedTicket.customer.city.value).to.be.equal(sampleData.customer.city.value);
    // GARAGE
    expect(res.data.dataGetUnsatisfiedTicket.garage)
      .to.be.an('object')
      .which.have.keys('publicDisplayName', 'id', 'type', 'users');
    expect(res.data.dataGetUnsatisfiedTicket.garage.publicDisplayName).to.be.equal('Garage Test');
    expect(res.data.dataGetUnsatisfiedTicket.garage.id).to.be.equal(garage.id.toString());
    expect(res.data.dataGetUnsatisfiedTicket.garage.users).to.be.an('array').lengthOf(1);
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0])
      .to.be.an('object')
      .which.have.keys('id', 'email', 'firstName', 'lastName', 'job', 'hasOnlyThisGarage');
    const awaitedUser = await user.getInstance();
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0].id).to.be.equal(awaitedUser.id.toString());
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0].email).to.be.equal(awaitedUser.email);
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0].firstName).to.be.null;
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0].lastName).to.be.null;
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0].job).to.be.equal(awaitedUser.job);
    expect(res.data.dataGetUnsatisfiedTicket.garage.users[0].hasOnlyThisGarage).to.be.true;
    // REVIEW
    expect(res.data.dataGetUnsatisfiedTicket.review).to.be.an('object').which.have.keys('comment', 'comment', 'reply');
    expect(res.data.dataGetUnsatisfiedTicket.review.comment).to.be.an('object').which.have.keys('text');
    expect(res.data.dataGetUnsatisfiedTicket.review.comment.text).to.be.equal(sampleData.review.comment.text);
    expect(res.data.dataGetUnsatisfiedTicket.review.reply)
      .to.be.an('object')
      .which.have.keys('status', 'text', 'rejectedReason');
    expect(res.data.dataGetUnsatisfiedTicket.review.reply.status).to.be.equal(ModerationStatus.APPROVED);
    expect(res.data.dataGetUnsatisfiedTicket.review.reply.text).to.be.equal('une reponse');
    expect(res.data.dataGetUnsatisfiedTicket.review.reply.rejectedReason).to.be.equal(
      RejectedReason.AUTHOR_IS_NOT_INDIVIDUAL
    );
    expect(res.data.dataGetUnsatisfiedTicket.review.rating).to.be.an('object').which.have.keys('value');
    expect(res.data.dataGetUnsatisfiedTicket.review.rating.value).to.be.equal(sampleData.review.rating.value);

    // UNSATISFIED
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfied).to.be.an('object').which.have.keys('criteria');
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfied.criteria).to.be.an('array').lengthOf(1);
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfied.criteria[0])
      .to.be.an('object')
      .which.have.keys('label', 'values');
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfied.criteria[0].label).to.be.equal(
      sampleData.unsatisfied.criteria[0].label
    );
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfied.criteria[0].values).to.be.an('array').lengthOf(1);
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfied.criteria[0].values[0]).to.be.equal(
      sampleData.unsatisfied.criteria[0].values[0]
    );
    // UNSATISFIEDTICKET
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket)
      .to.be.an('object')
      .which.have.keys(
        'createdAt',
        'closedAt',
        'type',
        'status',
        'comment',
        'frontDeskUserName',
        'customer',
        'vehicle',
        'actions',
        'manager'
      );
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.createdAt.toString()).to.be.equal(
      sampleData.unsatisfiedTicket.createdAt.toString()
    );
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.comment).to.be.equal(
      sampleData.unsatisfiedTicket.comment
    );
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.closedAt.toString()).to.be.equal(
      sampleData.unsatisfiedTicket.closedAt.toString()
    );
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.status).to.be.equal(sampleData.unsatisfiedTicket.status);
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.type).to.be.equal(sampleData.unsatisfiedTicket.type);
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.frontDeskUserName).to.be.equal(
      sampleData.unsatisfiedTicket.frontDeskUserName
    );
    // unsatisfiedTicket customer
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.customer)
      .to.be.an('object')
      .which.have.keys('fullName', 'contact');
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.customer.fullName).to.be.equal(customer.fullName);
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.customer.contact)
      .to.be.an('object')
      .which.have.keys('mobilePhone', 'email');
    for (const key in customer.contact) {
      expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.customer.contact[key]).to.be.equal(
        customer.contact[key]
      );
    }
    // unsatisfiedTicket vehicle
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.vehicle).to.be.null;
    // unsatisfiedTicket actions
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.actions).to.be.an('array').lengthOf(4);
    for (const action in res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.actions) {
      for (const keyInAction of action) {
        expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.actions[action][keyInAction]).to.be.equal(
          sampleData.unsatisfiedTicket.actions[action][keyInAction]
        );
      }
    }
    // unsatisfiedTicket manager
    user = await user.getInstance();
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.manager)
      .to.be.an('object')
      .which.have.keys('firstName', 'lastName', 'email', 'id');
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.manager.id).to.be.equal(user.id.toString());
    expect(res.data.dataGetUnsatisfiedTicket.unsatisfiedTicket.manager.email).to.be.equal(user.email);
  });

  it('should return a message error when no data was found', async function () {
    const variables = {
      id: new ObjectID().toString(),
    };

    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.an('array').lengthOf(1);
    expect(res.errors[0]).to.be.an('object').which.have.any.keys('message');
    expect(res.errors[0].message).to.be.equal('Data not found');
    expect(res.data).to.be.an('object').which.have.keys('dataGetUnsatisfiedTicket');
    expect(res.data.dataGetUnsatisfiedTicket).to.be.null;
  });

  it('should return a message error when no unsatisfiedTicket was found in the provided data', async function () {
    const variables = {
      id: dataWithNoTicket.getId().toString(),
    };

    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.an('array').lengthOf(1);
    expect(res.errors[0]).to.be.an('object').which.have.any.keys('message');
    expect(res.errors[0].message).to.be.equal('UnsatisfiedTicket not found');
    expect(res.data).to.be.an('object').which.have.keys('dataGetUnsatisfiedTicket');
    expect(res.data.dataGetUnsatisfiedTicket).to.be.null;
  });

  it('should return a message error when the user can t access the garage associated to the data', async function () {
    const variables = {
      id: data.getId().toString(),
    };

    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.an('array').lengthOf(1);
    expect(res.errors[0]).to.be.an('object').which.have.any.keys('message');
    expect(res.errors[0].message).to.be.equal('Not authorized to access the garage associated to the ticket');
    expect(res.data).to.be.an('object').which.have.keys('dataGetUnsatisfiedTicket');
    expect(res.data.dataGetUnsatisfiedTicket).to.be.null;
  });
});
