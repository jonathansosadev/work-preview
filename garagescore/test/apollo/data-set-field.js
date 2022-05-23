const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const DataBuilder = require('../../common/lib/test/test-instance-factory/data-builder');

let user;
let data;
const fields = ['message', 'status'];
const mobilePhone = {
  value: '+3367060000',
  original: '+3367060000',
  isSyntaxOK: true,
  isEmpty: false,
  isValidated: true,
};
describe('Apollo::dataSetField', async function () {
  beforeEach(async function () {
    await app.reset();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_COCKPIT]: true,
      },
    });

    const garage = await app.addGarage({
      locale: 'fr_FR',
    });
    data = await new DataBuilder(app)
      .garage(garage.id)
      .type('UsedVehicleSale')
      .shouldSurfaceInStatistics(true)
      .mobilePhone(mobilePhone)
      .email({
        value: 'dupont.jean@laposte.net',
        original: 'dupont.jean@laposte.net',
        isSyntaxOK: true,
        isEmpty: false,
        isValidated: true,
      })
      .customerField('title', {
        value: 'Monsieur',
        revised: 'Monsieur',
        isSyntaxOK: true,
        isEmpty: false,
        isValidated: true,
      })
      .create();
  });

  it('should return confirmation of updated field', async function () {
    const request = `mutation dataSetField($id: ID!, $field: String, $value: String) {
      dataSetField(id: $id, field: $field, value: $value) {
        status
        message
      }
    }`;

    const variables = {
      id: data.id.toString(),
      field: 'title',
      value: 'Madame',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetField');
    expect(res.data.dataSetField).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetField.message).to.be.null;
    expect(res.data.dataSetField.status).to.be.equal(true);
    const updatedData = await app.models.Data.getMongoConnector().findOne(
      { _id: data.id },
      { projection: { [`customer.${variables.field}`]: true } }
    );
    expect(updatedData).to.be.an('object').which.have.any.keys('customer');
    expect(updatedData.customer).to.be.an('object').which.have.any.keys('title');
    expect(updatedData.customer.title).to.be.an('object').which.have.any.keys('value');
    expect(updatedData.customer.title.value).to.be.equal(variables.value);
  });

  it('should return confirmation of updated mobilePhone field', async function () {
    const request = `mutation dataSetField($id: ID!, $field: String, $value: String) {
      dataSetField(id: $id, field: $field, value: $value) {
        status
        message
      }
    }`;

    const variables = {
      id: data.id.toString(),
      field: 'contact.mobilePhone',
      value: '0670607890',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetField');
    expect(res.data.dataSetField).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetField.message).to.be.null;
    expect(res.data.dataSetField.status).to.be.equal(true);
    const updatedData = await app.models.Data.getMongoConnector().findOne(
      { _id: data.id },
      { projection: { [`customer.${variables.field}`]: true } }
    );

    expect(updatedData).to.be.an('object').which.have.any.keys('customer');
    expect(updatedData.customer).to.be.an('object').which.have.any.keys('contact');
    expect(updatedData.customer.contact).to.be.an('object').which.have.keys('mobilePhone');
    expect(updatedData.customer.contact.mobilePhone).to.be.an('object').which.have.any.keys(['value', 'original']);
    expect(updatedData.customer.contact.mobilePhone.value).to.be.equal('+33' + variables.value.substring(1));
    expect(updatedData.customer.contact.mobilePhone.original).to.be.equal(mobilePhone.value);
  });

  it('should ignore when a wrong mobilePhone is supplied', async function () {
    const request = `mutation dataSetField($id: ID!, $field: String, $value: String) {
      dataSetField(id: $id, field: $field, value: $value) {
        status
        message
      }
    }`;

    const variables = {
      id: data.id.toString(),
      field: 'contact.mobilePhone',
      value: 'thisisnotamobilephonebelieveme',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetField');
    expect(res.data.dataSetField).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetField.message).to.be.null;
    expect(res.data.dataSetField.status).to.be.equal(true);
    const updatedData = await app.models.Data.getMongoConnector().findOne(
      { _id: data.id },
      { projection: { [`customer.${variables.field}`]: true } }
    );

    expect(updatedData).to.be.an('object').which.have.any.keys('customer');
    expect(updatedData.customer).to.be.an('object').which.have.any.keys('contact');
    expect(updatedData.customer.contact).to.be.an('object').which.have.keys('mobilePhone');
    expect(updatedData.customer.contact.mobilePhone).to.be.an('object').which.have.any.keys(['value', 'original']);
    expect(updatedData.customer.contact.mobilePhone.value).to.be.equal(mobilePhone.value);
    expect(updatedData.customer.contact.mobilePhone.original).to.be.equal(mobilePhone.value);
  });

  it('should return even when the value is the same a confirmation of updated field', async function () {
    const request = `mutation dataSetField($id: ID!, $field: String, $value: String) {
      dataSetField(id: $id, field: $field, value: $value) {
        status
        message
      }
    }`;

    const variables = {
      id: data.id.toString(),
      field: 'title',
      value: 'Monsieur',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetField');
    expect(res.data.dataSetField).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetField.message).to.be.null;
    expect(res.data.dataSetField.status).to.be.equal(true);
    const updatedData = await app.models.Data.getMongoConnector().findOne(
      { _id: data.id },
      { projection: { [`customer.${variables.field}`]: true } }
    );
    expect(updatedData).to.be.an('object').which.have.any.keys('customer');
    expect(updatedData.customer).to.be.an('object').which.have.any.keys('title');
    expect(updatedData.customer.title).to.be.an('object').which.have.any.keys('value');
    expect(updatedData.customer.title.value).to.be.equal(variables.value);
  });

  it('should ignore a nonexistent field supplied', async function () {
    const request = `mutation dataSetField($id: ID!, $field: String, $value: String) {
      dataSetField(id: $id, field: $field, value: $value) {
        status
        message
      }
    }`;

    const variables = {
      id: data.id.toString(),
      field: 'test',
      value: 'Ceciestuntestmonsieur',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetField');
    expect(res.data.dataSetField).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetField.message).to.be.equal('Data not found');
    expect(res.data.dataSetField.status).to.be.equal(false);
  });

  it('should return an error message when no data was found', async function () {
    const request = `mutation dataSetField($id: ID!, $field: String, $value: String) {
      dataSetField(id: $id, field: $field, value: $value) {
        status
        message
      }
    }`;

    const variables = {
      id: new ObjectID().toString(),
      field: 'mobilePhone',
      value: '0789797979',
    };
    const res = await sendQueryAs(app, request, variables, user.getId());

    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('dataSetField');
    expect(res.data.dataSetField).to.be.an('object').which.have.keys(fields);
    expect(res.data.dataSetField.message).to.be.equal('Data not found');
    expect(res.data.dataSetField.status).to.be.equal(false);
  });
});
