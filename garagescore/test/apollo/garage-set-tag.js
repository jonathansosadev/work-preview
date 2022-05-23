const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

const mutation = `mutation garageSetTag(
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

/* Get garage data from api */
describe('Garage add a new tag', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it("Can't add a blank a tag to a garage", async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "    " };
    const res = await sendQuery(testApp, mutation, variables, user.userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetTag).to.not.be.undefined;
    expect(res.data.garageSetTag.status).equal('FAILED');
    expect(res.data.garageSetTag.message).equal("Tag can't be empty");
  });
  it("Can't add a tag to a garage you don't own", async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    const user2 = await testApp.addUser();

    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "Newest Garages" };
    const res = await sendQuery(testApp, mutation, variables, user2.userId);
  
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetTag).to.not.be.undefined;
    expect(res.data.garageSetTag.status).equal('FAILED');
    expect(res.data.garageSetTag.message).equal("Not authorized to access this resource");
  });
  it('Adds a tag to a garage', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "Ancient Garages" };
    const res = await sendQuery(testApp, mutation, variables, user.userId);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetTag).to.not.be.undefined;
    expect(res.data.garageSetTag.status).equal('OK');
    expect(res.data.garageSetTag.message).equal('Tag added correctly');
    garageInstance = await testGarage.getInstance();
    expect(garageInstance.tags[0]).to.be.equal('Ancient Garages');
  });
  it('Adds a tag to multiple garages', async () => {
    const testGarage1 = await testApp.addGarage();
    const testGarage2 = await testApp.addGarage();

    const user = await testApp.addUser();

    await user.addGarage(testGarage1);
    await user.addGarage(testGarage2);

    let garageInstance1 = await testGarage1.getInstance();
    let garageInstance2 = await testGarage2.getInstance();

    const garageIds = [garageInstance1.getId().toString(), garageInstance2.getId().toString()];
    const variables = { garageIds, tag: "Mysterious Garages" };
    await sendQuery(testApp, mutation, {garageIds:[garageInstance1.getId().toString()], tag:'Awesome Garages'}, user.userId);
    const res = await sendQuery(testApp, mutation, variables, user.userId); 
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageSetTag).to.not.be.undefined;
    expect(res.data.garageSetTag.status).equal('OK');
    expect(res.data.garageSetTag.message).equal('Tag added correctly');
    garageInstance1 = await testGarage1.getInstance();
    garageInstance2 = await testGarage2.getInstance();
    expect(garageInstance1.tags[0]).to.be.equal('Awesome Garages');
    expect(garageInstance1.tags[1]).to.be.equal('Mysterious Garages');
    expect(garageInstance2.tags[0]).to.be.equal('Mysterious Garages');
  });
});
