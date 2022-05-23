const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

const removeMutation = `mutation garageRemoveTag(
  $tag: String!
  ){
    garageRemoveTag(
      tag: $tag)
      {
        message,
        status
      }
  }`;

const createMutation = `mutation garageSetTag(
  $tag: String!,
  $garageIds: [ID!]!
  ){
    garageSetTag(
      tag: $tag,
      garageIds: $garageIds)
      {
        message,
        status
      }
  }`;

describe('Garage removes a tag', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it("Can't remove a blank tag", async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "Brilliant Garages" };
    await sendQuery(testApp, createMutation, variables, user.userId);

    const res = await sendQuery(testApp, removeMutation, { tag: "      " }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageRemoveTag).to.not.be.undefined;
    expect(res.data.garageRemoveTag.status).equal('FAILED');
    expect(res.data.garageRemoveTag.message).equal("Tag can't be empty");
    garageInstance = await testGarage.getInstance();
    expect(garageInstance.tags[0]).to.be.equal("Brilliant Garages");
  });
  it('Removes a tag', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const variables = { garageIds: [garageInstance.getId().toString()], tag: "Brilliant Garages" };
    await sendQuery(testApp, createMutation, variables, user.userId);
    garageInstance = await testGarage.getInstance();
    expect(garageInstance.tags[0]).to.be.equal("Brilliant Garages");

    const res = await sendQuery(testApp, removeMutation, { tag: "Brilliant Garages" }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageRemoveTag).to.not.be.undefined;
    expect(res.data.garageRemoveTag.status).equal('OK');
    expect(res.data.garageRemoveTag.message).equal('Tag removed correctly');
    garageInstance = await testGarage.getInstance();
    expect(garageInstance.tags.length).to.be.equal(0);
  });
});
