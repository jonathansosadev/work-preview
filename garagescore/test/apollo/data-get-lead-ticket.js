const chai = require('chai');
const { ObjectID } = require('mongodb');

const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const exampleData = require('./examples/data-with-lead-ticket.js');

const { expect } = chai;
const app = new TestApp();

/* data-get-lead-ticket */
describe('data get apollo lead ticket', () => {
  beforeEach(async function () {
    await app.reset();
  });
  it('get a lead ticket', async function test() {
    const garageTest = await app.addGarage();
    const garage = await garageTest.getInstance();
    const manager = await app.addUser({
      email: 'assistantToTheRegionalManager@DunderMifflin.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      job: 'Responsable des ventes VN concession',
    });

    exampleData.leadTicket.manager = manager.getId();
    exampleData.leadTicket.actions.forEach((a) => {
      if (a.assignerUserId) a.assignerUserId = manager.id;
      if (a.ticketManagerId) a.ticketManagerId = manager.id;
      if (a.previousTicketManagerId) a.previousTicketManagerId = manager.id;
      if (a.reminderTriggeredByUserId) a.reminderTriggeredByUserId = manager.id;
    });
    exampleData.garageId = garageTest.getId();
    await app.models.Data.create(exampleData);

    let [data] = await garageTest.datas();
    const user = await app.addUser({ email: 'user@test.com' });
    await app.models.User.getMongoConnector().updateOne({ _id: user.id }, { $set: { garageIds: [garage.id] } });
    await app.models.User.getMongoConnector().updateOne({ _id: manager.id }, { $set: { garageIds: [garage.id] } });
    const request = `query dataGetLeadTicket($dataId: String!) {
      dataGetLeadTicket(dataId: $dataId) {
        id
        source {
          type
          by
        }
        lead {
          reportedAt
          type
          brands
        }
        surveyFollowupLead {
          sendAt
          firstRespondedAt
        }
        customer {
          city {
            value
          }
        }
        followupLeadStatus
        garage {
          id
          type
          publicDisplayName
          users {
            id
            firstName
            lastName
            email
            job
            hasOnlyThisGarage
          }
        }
        leadTicket {
          status
          knowVehicle
          leadVehicle
          tradeIn
          energyType
          cylinder
          bodyType
          financing
          timing
          saleType
          closedAt
          createdAt
          brandModel
          vehicle {
            makeModel
            plate
          }
          followup {
            recontacted
            satisfied
            satisfiedReasons
            notSatisfiedReasons
            appointment
          }
          customer {
            fullName
            contact {
              mobilePhone
              email
            }
          }
          manager {
            id
            firstName
            lastName
            email
          }
          automationCampaign {
            id
            displayName
            contactType
          }
          actions {
            name
            createdAt
            comment
            selfAssigned
            sourceType
            phone
            message
            adUrl
            missedSaleReason
            wasTransformedToSale
            isManual
            crossLeadConverted
            closedForInactivity
            automaticReopen
            reminderFirstDay
            reminderStatus
            reminderDate
            reminderNextDay
            reminderActionName
            newValue
            previousValue
            newArrayValue
            previousArrayValue
            field
            followupLeadSendDate
            followupLeadResponseDate
            followupLeadRecontacted
            followupLeadSatisfied
            followupLeadSatisfiedReasons
            followupLeadNotSatisfiedReasons
            followupLeadAppointment
            assigner {
              id
              lastName
              firstName
              email
            }
            ticketManager {
              id
              lastName
              firstName
              email
            }
            previousTicketManager {
              id
              lastName
              firstName
              email
            }
            reminderTriggeredBy {
              id
              lastName
              firstName
              email
            }
          }
        }
        review {
          rating {
            value
          }
          comment {
            text
          }
        }
      }
    }`;
    const variables = { dataId: data.id.toString() };
    let req = await sendQueryAs(app, request, variables, user.getId());
    expect(req.errors, JSON.stringify(req.errors, null, 2)).to.be.undefined;
    const dataLeadTicket = req.data.dataGetLeadTicket;
    expect(dataLeadTicket.id).equal(data.id.toString());
    expect(dataLeadTicket.garage.id).equal(garage.id.toString());
    expect(dataLeadTicket.garage.type).equal(garage.type);
    expect(dataLeadTicket.garage.publicDisplayName).equal(garage.publicDisplayName);
    // data = await app.models.Data.findById(variables.dataId);
    // expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    // expect(res.data.DataSetLeadTicketSelfAssigned.status).to.be.equal(201);
    // expect(data.get('leadTicket.manager')).to.be.equal(user.getId());
    // expect(data.get('leadTicket.selfAssignedTo')).to.be.equal(user.getId());
  });
});
