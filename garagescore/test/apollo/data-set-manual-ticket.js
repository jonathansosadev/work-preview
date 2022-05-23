const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const { decodePhone } = require('../../common/lib/garagescore/cross-leads/util');
const dataTypes = require('../../common/models/data/type/data-types');
let garage;
let user;
const locale = 'fr_FR';
const fields = ['message', 'status', 'id'];

describe('Apollo::dataSetManualTicket', async function () {
  beforeEach(async function () {
    await app.reset();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });

    const scenario = await app.models.CampaignScenario.getMongoConnector().insertOne({
      type: 'Dealership',
      followupAndEscalate: {
        ManualLead: {
          lead: {
            followup: {
              enabled: true,
              delay: 90,
            },
            escalate: {
              enabled: true,
              stage_1: 27,
              stage_2: 36,
            },
          },
        },
        ManualUnsatisfied: {
          unsatisfied: {
            followup: {
              enabled: true,
              delay: 45,
            },
            escalate: {
              enabled: true,
              stage_1: 9,
              stage_2: 27,
            },
          },
        },
        LaCentrale: {
          lead: {
            followup: {
              enabled: true,
              delay: 9,
            },
            escalate: {
              enabled: true,
              stage_1: 3,
              stage_2: 4,
            },
          },
        },
      },
    });

    garage = await app.addGarage({
      locale,
      type: 'Dealership',
      campaignScenarioId: scenario.insertedId,
    });
  });

  it('should return the result for a newly created ManualLead ticket', async function () {
    const request = `mutation dataSetManualTicket($ticketType: String!, $fullName: String, $email: String, $phone: String, $garageId: ID!, $brandModel: String, $sourceType: String, $requestType: String, $vehicleModel: String, $leadSaleType: String, $leadTiming: String, $leadFinancing: String, $leadTradeIn: String) {
      dataSetManualTicket(ticketType: $ticketType, fullName: $fullName, email: $email, phone: $phone, garageId: $garageId, brandModel: $brandModel, sourceType: $sourceType, requestType: $requestType, vehicleModel: $vehicleModel, leadSaleType: $leadSaleType, leadTiming: $leadTiming, leadFinancing: $leadFinancing, leadTradeIn: $leadTradeIn) {
        status
        message
        id
      }
    }`;

    const variables = {
      ticketType: dataTypes.MANUAL_LEAD,
      fullName: 'john',
      email: 'john@mymail.com',
      phone: '0707070707',
      garageId: garage.id.toString(),
      sourceType: 'LaCentrale',
      requestType: 'APPOINTMENT_REQUEST',
      vehicleModel: 'cli%20III',
      leadSaleType: 'Maintenance',
    };
    const phone = decodePhone(variables.phone, locale.substring(0, 2));
    const res = await sendQueryAs(app, request, variables, user._userId);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetManualTicket');
    expect(res.data.dataSetManualTicket).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetManualTicket.message).to.be.equal('Manual leadTicket added');
    expect(res.data.dataSetManualTicket.status).to.be.equal(true);
    expect(res.data.dataSetManualTicket.id).to.exist;
    const data = await app.models.Data.getMongoConnector().findOne(
      { _id: ObjectID(res.data.dataSetManualTicket.id) },
      { projection: { leadTicket: true, garageId: true } }
    );

    expect(data).to.be.an('object').which.have.any.keys(['leadTicket', 'garageId']);
    expect(data.garageId).to.be.equal(variables.garageId);
    expect(data.leadTicket)
      .to.be.an('object')
      .which.have.any.keys(['requestType', 'saleType', 'customer', 'vehicle', 'actions']);
    expect(data.leadTicket.requestType).to.be.equal(variables.requestType);
    expect(data.leadTicket.saleType).to.be.equal(variables.leadSaleType);
    expect(data.leadTicket.customer).to.be.an('object').which.have.any.keys(['contact', 'fullName']);
    expect(data.leadTicket.customer.fullName).to.be.equal(variables.fullName);
    expect(data.leadTicket.customer.contact).to.be.an('object').which.have.any.keys(['mobilePhone', 'email']);
    expect(data.leadTicket.customer.contact.email).to.be.equal(variables.email);
    expect(data.leadTicket.customer.contact.mobilePhone).to.be.equal(phone);
    expect(data.leadTicket.vehicle).to.be.an('object').which.have.any.keys(['makeModel']);
    expect(data.leadTicket.vehicle.makeModel).to.be.equal(variables.vehicleModel);
  });

  it('should return the result for a newly created ManualUnsatisfied ticket', async function () {
    const request = `mutation dataSetManualTicket($ticketType: String!, $fullName: String, $email: String, $phone: String, $garageId: ID!, $type: String,  $comment: String, $make: String, $model: String, $immat: String, $frontDeskUserName: String) {
      dataSetManualTicket(ticketType: $ticketType, fullName: $fullName, email: $email, phone: $phone, garageId: $garageId,type: $type, comment: $comment, make: $make, model: $model, immat: $immat, frontDeskUserName: $frontDeskUserName) {
        status
        message
        id
      }
    }`;

    const variables = {
      ticketType: dataTypes.MANUAL_UNSATISFIED,
      fullName: 'john',
      email: 'john@mymail.com',
      phone: '0707070707',
      garageId: garage.getId().toString(),
      type: 'Maintenance',
      comment: 'This%20is%20a%20test',
      make: 'Dacia',
      model: 'clio%20V',
      immat: 'AA000AA',
      frontDeskUserName: 'Jacques',
    };
    const phone = decodePhone(variables.phone, locale.substring(0, 2));
    const res = await sendQueryAs(app, request, variables);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetManualTicket');
    expect(res.data.dataSetManualTicket).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetManualTicket.message).to.be.equal('Manual unsatisfiedTicket added');
    expect(res.data.dataSetManualTicket.status).to.be.equal(true);
    expect(res.data.dataSetManualTicket.id).to.exist;
    const data = await app.models.Data.getMongoConnector().findOne(
      { _id: ObjectID(res.data.dataSetManualTicket.id) },
      { projection: { unsatisfiedTicket: true, garageId: true } }
    );

    expect(data).to.be.an('object').which.have.any.keys(['unsatisfiedTicket', 'garageId']);
    expect(data.garageId).to.be.equal(variables.garageId);
    expect(data.unsatisfiedTicket)
      .to.be.an('object')
      .which.have.any.keys(['comment', 'vehicle', 'frontDeskUserName', 'type', 'customer']);
    expect(data.unsatisfiedTicket.type).to.be.equal(variables.type);
    expect(data.unsatisfiedTicket.comment).to.be.equal(variables.comment);
    expect(data.unsatisfiedTicket.frontDeskUserName).to.be.equal(variables.frontDeskUserName);
    expect(data.unsatisfiedTicket.vehicle).to.be.an('object').which.have.any.keys(['make', 'model', 'plate']);
    expect(data.unsatisfiedTicket.vehicle.make).to.be.equal(variables.make);
    expect(data.unsatisfiedTicket.vehicle.model).to.be.equal(variables.model);
    expect(data.unsatisfiedTicket.vehicle.plate).to.be.equal(variables.immat);
    expect(data.unsatisfiedTicket.customer).to.be.an('object').which.have.any.keys(['contact', 'fullName']);
    expect(data.unsatisfiedTicket.customer.fullName).to.be.equal(variables.fullName);
    expect(data.unsatisfiedTicket.customer.contact).to.be.an('object').which.have.any.keys(['mobilePhone', 'email']);
    expect(data.unsatisfiedTicket.customer.contact.email).to.be.equal(variables.email);
    expect(data.unsatisfiedTicket.customer.contact.mobilePhone).to.be.equal(phone);
  });

  it('should return an error when an unknown ticketType is supplied', async function () {
    const request = `mutation dataSetManualTicket($ticketType: String!, $fullName: String, $email: String, $phone: String, $garageId: ID!, $brandModel: String, $sourceType: String, $requestType: String, $vehicleModel: String, $leadSaleType: String, $leadTiming: String, $leadFinancing: String, $leadTradeIn: String) {
      dataSetManualTicket(ticketType: $ticketType, fullName: $fullName, email: $email, phone: $phone, garageId: $garageId, brandModel: $brandModel, sourceType: $sourceType, requestType: $requestType, vehicleModel: $vehicleModel, leadSaleType: $leadSaleType, leadTiming: $leadTiming, leadFinancing: $leadFinancing, leadTradeIn: $leadTradeIn) {
        status
        message
        id
      }
    }`;

    const variables = {
      ticketType: 'unknown',
      fullName: 'john',
      email: 'john@mymail.com',
      phone: '0707070707',
      garageId: garage.getId().toString(),
      sourceType: 'Facebook',
      requestType: 'APPOINTMENT_REQUEST',
      vehicleModel: 'cli%20II',
      leadSaleType: 'Maintenance',
    };
    const res = await sendQueryAs(app, request, variables);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetManualTicket');
    expect(res.data.dataSetManualTicket).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetManualTicket.message).to.be.equal(
      'Cannot create Data with empty or unsupported type (unknown)'
    );
    expect(res.data.dataSetManualTicket.status).to.be.equal(false);
    expect(res.data.dataSetManualTicket.id).to.be.null;
  });

  it('should return an error when an unknown garageId is supplied', async function () {
    const request = `mutation dataSetManualTicket($ticketType: String!, $fullName: String, $email: String, $phone: String, $garageId: ID!, $brandModel: String, $sourceType: String, $requestType: String, $vehicleModel: String, $leadSaleType: String, $leadTiming: String, $leadFinancing: String, $leadTradeIn: String) {
      dataSetManualTicket(ticketType: $ticketType, fullName: $fullName, email: $email, phone: $phone, garageId: $garageId, brandModel: $brandModel, sourceType: $sourceType, requestType: $requestType, vehicleModel: $vehicleModel, leadSaleType: $leadSaleType, leadTiming: $leadTiming, leadFinancing: $leadFinancing, leadTradeIn: $leadTradeIn) {
        status
        message
        id
      }
    }`;

    const variables = {
      ticketType: dataTypes.MANUAL_LEAD,
      fullName: 'john',
      email: 'john@mymail.com',
      phone: '0707070707',
      garageId: new ObjectID().toString(),
      sourceType: 'Facebook',
      requestType: 'APPOINTMENT_REQUEST',
      vehicleModel: 'cli%20II',
      leadSaleType: 'Maintenance',
    };
    const res = await sendQueryAs(app, request, variables);

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetManualTicket');
    expect(res.data.dataSetManualTicket).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetManualTicket.message).to.be.equal("Garage couldn't be found");
    expect(res.data.dataSetManualTicket.status).to.be.equal(false);
    expect(res.data.dataSetManualTicket.id).to.be.null;
  });
});
