const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');

const { expect } = chai;
const app = new TestApp();

const query = `query garageGetGaragesSignatures{
  garageGetGaragesSignatures{
    _id
    group
    lastName
    firstName
    job
  }
}`;

describe('Gets the signature of the available garages', async () => {
  let user1, garage1, garage2;
  before(async function () {
    await app.reset();
    const User = app.models.User;
    const Garage = app.models.Garage;
    user1 = Tools.random.user();
    garage1 = Tools.random.garage();
    garage2 = Tools.random.garage();

    garage1.surveySignature = {
      defaultSignature: {
        lastName: "Martin",
        firstName: "Ricky",
        job: "Executive Chief"
      }
    };
    garage1.group = "XYZ Group";

    garage2.surveySignature = {
      defaultSignature: {
        lastName: "Soublette",
        firstName: "Yemaya",
        job: "Branch Director"
      }
    };
    garage2.group = "Zyggy Group";

    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);

    user1.garageIds = [garage1, garage2].map((g) => g.getId().toString());
    user1 = await User.create(user1);
  });

  it('should return the signatures', async () => {
    const result = await sendQuery(app, query, {}, user1.id.toString());
    expect(result.errors).to.be.undefined;
    expect(result.data.garageGetGaragesSignatures[0]._id).to.be.equal(garage1.id.toString());
    expect(result.data.garageGetGaragesSignatures[0].group).to.be.equal(garage1.group);
    expect(result.data.garageGetGaragesSignatures[0].lastName).to.be.equal(garage1.surveySignature.defaultSignature.lastName);
    expect(result.data.garageGetGaragesSignatures[0].firstName).to.be.equal(garage1.surveySignature.defaultSignature.firstName);
    expect(result.data.garageGetGaragesSignatures[0].job).to.be.equal(garage1.surveySignature.defaultSignature.job);

    expect(result.data.garageGetGaragesSignatures[1]._id).to.be.equal(garage2.id.toString());
    expect(result.data.garageGetGaragesSignatures[1].group).to.be.equal(garage2.group);
    expect(result.data.garageGetGaragesSignatures[1].lastName).to.be.equal(garage2.surveySignature.defaultSignature.lastName);
    expect(result.data.garageGetGaragesSignatures[1].firstName).to.be.equal(garage2.surveySignature.defaultSignature.firstName);
    expect(result.data.garageGetGaragesSignatures[1].job).to.be.equal(garage2.surveySignature.defaultSignature.job);
  });
});
