const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');

const expect = chai.expect;
const app = new TestApp();

describe('Test status mailgun webhooks', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  const contactToInsert = {
    "type": "CAMPAIGN_EMAIL",
    "from": "survey@mg.garagescore.com",
    "sender": "Brian Cranston",
    "to": "bryan.cranston@breakingbad.co",
    "overrideTo": "next@garagescore.com",
    "recipient": "Aaron Paul",
    "payload": {
      "key": "sale_email_thanks_1",
      "dataId": "my_data_id",
      "garageId": "my_garage_id"
    },
    "createdAt": "2021-04-08T17:30:41.201Z",
    "updatedAt": "2021-04-08T17:30:41.201Z",
    "status": "Waiting",
    "app_url": "http://localhost:3001",
    "sendAt": "2021-04-08T17:30:41.201Z"
  };

  const partialMailgunEvent = {
    timestamp: "1617865053",
    token: "648aaf695415ff84a4e6daa50f358092eae85739ba3630c15a",
    signature: "6face8856b4294697f67676dafc673d32af860e662a33bea81ead6cf5e175439",
    event: "delivered",
    recipient: "carrosserie@garageduchateau.fr",
  }

  it('should add to contact a status Delivered when event name is delivered', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "delivered",
    };
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Delivered');
  });

  it('should add to contact a status Clicked when event name is clicked', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "clicked",
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Clicked');
  });

  it('should add to contact a status Complained when the event name is complained', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "complained",
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Complained');
  });

  it('should add to contact a status Opened when the event name is opened', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "opened",
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Opened');
  });

  it('should add to contact a status Unsubscribed when the event name is unsubscribed', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "unsubscribed",
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Unsubscribed');
  });

  it('should add to contact a status Dropped and a failureDescription when the event name is failed', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "failed",
      deliveryStatusCode: 550,
      deliveryStatusDescription: 'this is a description'
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Dropped');
    expect(docUpdated.failureDescription).equal(mailgunEvent.deliveryStatusDescription);
  });

  it('should add to contact a status Bounced when the event name is failed and status code 605', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "failed",
      deliveryStatusCode: 605,
      deliveryStatusDescription: 'this is an other description'
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Bounced');
    expect(docUpdated.failureDescription).equal(undefined);
  });

  it('should add to contact a status Unsubscribed when the event name is failed and status code 606', async function test() {
    const newContact = await app.models.Contact.create(contactToInsert);

    const mailgunEvent = {
      ...partialMailgunEvent,
      contactId: String(newContact.id),
      event: "failed",
      deliveryStatusCode: 606,
    }
    await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    const docUpdated = await app.models.Contact.findById(newContact.id);

    expect(docUpdated).not.to.be.null;
    expect(docUpdated.status).equal('Unsubscribed');
    expect(docUpdated.failureDescription).equal(undefined);
  });
});
