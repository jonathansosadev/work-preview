const { ObjectID } = require('mongodb');
const crossLeadsIncomingEmail = require('../../../workers/jobs/scripts/cross-leads-incoming-email.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');
const IncomingCrossLeadsStatus = require('../../../common/models/incoming-cross-leads.status.js');
const chai = require('chai');

const { expect } = chai;

const incomingEmailCustomExpect = (app, data, values) => {
  const fields = [
    'leadTicket.customer.contact.email',
    'leadTicket.customer.contact.mobilePhone',
    'leadTicket.adUrl',
    'leadTicket.message',
    'leadTicket.customer.fullName',
    'leadTicket.brandModel',
    'leadTicket.adId',
    'leadTicket.parsedRawData.0.gender',
    'leadTicket.sourceSubtype',
    'leadTicket.budget',
    'leadTicket.energyType.0',
    'leadTicket.vehicle.makeModel',
    'leadTicket.vehicle.plate',
    'leadTicket.vehicle.mileage',
  ];
  for (const field of fields)
    if (values[fields.indexOf(field)] !== undefined)
      expect(data.get(field)).equal(values[fields.indexOf(field)], field);
};

const generateMockIncomingEmail = async (app, garageId, emailJson, params) => {
  let example = emailJson || {
    type: 'Email',
    externalId: 'fus ro dah',
    status: IncomingCrossLeadsStatus.NEW,
    raw: {
      Subject: 'COUCOU',
      'body-html': '<div>COUCOU</div>',
      'body-plain': 'COUCOU plain text',
    },
    payload: {
      to: `lacentrale.${GaragesTest.GARAGE_DUPONT}@discuss.garagescore.com`,
      html: '<div>Nothing to parse here</div>',
    },
  };
  if (params) example = { ...example, ...params };
  example.receivedAt = new Date();
  example.payload.to = example.payload.to.replace(/\.(.*)@/, `.${garageId}@`);
  example.garageId = ObjectID(garageId);
  return app.models.IncomingCrossLead.create(example);
};

const generateMockIncomingCall = async (app, garageId, sourceType, params, canBeLive, rawData) => {
  const raw =
    rawData ||
    [
      {
        designation: 'OVH VoIP',
        called: '0033184232717',
        destinationType: 'landline',
        countrySuffix: 'ovh',
        hangupNature: '',
        calling: '0033621982935',
        dialed: '0033184232717',
        priceWithoutTax: {
          currencyCode: 'EUR',
          value: 0,
          text: '0.00 €',
        },
        duration: 18,
        planType: 'priceplan',
        wayType: 'transfer',
        consumptionId: 8204907756.0,
        creationDatetime: '2020-02-13T18:37:41+01:00',
        ...params,
      },
      {
        state: 'Answered',
        queue: 'queue_0033188336533_317126',
        onHold: false,
        callerIdName: ' 33621982935',
        answered: '2020-03-20T13:00:33+01:00',
        callerIdNumber: '33621982935',
        end: null,
        destinationNumber: '',
        id: 260437172,
        agent: '0033148405557',
        begin: '2020-03-20T13:00:26+01:00',
        ...params,
      },
    ][canBeLive ? Math.floor(Math.random() * 2) : 0];
  return app.models.IncomingCrossLead.initFromCall(raw, garageId, sourceType, !!raw.begin);
};

const routine = async (app, emailJson) => {
  const garage = await app.addGarage();
  const email = await generateMockIncomingEmail(app, garage.id.toString(), emailJson);
  const job = { payload: { emailId: email.id.toString() } };
  await crossLeadsIncomingEmail(job);
  const [data, shouldBeUndefined] = await garage.datas();
  if (shouldBeUndefined) throw new Error('Error in routine : datas.length > 1');
  return data;
};

module.exports = (app) => ({
  incomingEmailCustomExpect: (data, values) => incomingEmailCustomExpect(app, data, values),
  generateMockIncomingEmail: (garageId, emailJson, params) =>
    generateMockIncomingEmail(app, garageId, emailJson, params),
  generateMockIncomingCall: (garageId, sourceType, params, canBeLive = true, rawData) =>
    generateMockIncomingCall(app, garageId, sourceType, params, canBeLive, rawData),
  routine: (emailJson) => routine(app, emailJson),
});
