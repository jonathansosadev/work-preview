const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const { expect } = chai;
const testApp = new TestApp();

const updateMutation = `mutation garageUpdateTag(
  $currentTag: String!,
  $newTag: String,
  $garageIds: [ID!]!
  ){
    garageUpdateTag(
      currentTag: $currentTag,
      newTag: $newTag,
      garageIds: $garageIds)
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

/* Get garage data from api */
describe('Garage add a new tag', () => {
  beforeEach(async function () {
    await testApp.reset();
  });
  it("Can't update with a blank a tag", async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "Performance Garages" };
    await sendQuery(testApp, createMutation, variables, user.userId);
    // Now we try to change it for a blank Tag
    const res = await sendQuery(testApp, updateMutation, { garageIds, currentTag: "Performance Garages", newTag: "    " }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageUpdateTag).to.not.be.undefined;
    expect(res.data.garageUpdateTag.status).equal('FAILED');
    expect(res.data.garageUpdateTag.message).equal("Tag can't be empty");
  });
  it("Can't update with a tag of a garage you don't own", async () => {
    const testGarage = await testApp.addGarage();


    const user = await testApp.addUser();
    const user2 = await testApp.addUser();

    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "Performance Garages" };
    await sendQuery(testApp, createMutation, variables, user.userId);
    // Now we try to change it for a blank Tag
    const res = await sendQuery(testApp, updateMutation, { garageIds, currentTag: "Performance Garages", newTag: "Good Folks" }, user2.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageUpdateTag).to.not.be.undefined;
    expect(res.data.garageUpdateTag.status).equal('FAILED');
    expect(res.data.garageUpdateTag.message).equal("Not authorized to access this resource");
  });
  it('Updates the tag of a garage', async () => {
    const testGarage = await testApp.addGarage();
    const user = await testApp.addUser();
    await user.addGarage(testGarage);

    let garageInstance = await testGarage.getInstance();

    const garageIds = [garageInstance.getId().toString()];
    const variables = { garageIds, tag: "Excellent Garages" };
    await sendQuery(testApp, createMutation, variables, user.userId);

    const res = await sendQuery(testApp, updateMutation, { garageIds, currentTag: "Excellent Garages", newTag: "Awards 2022" }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageUpdateTag).to.not.be.undefined;
    expect(res.data.garageUpdateTag.status).equal('OK');
    expect(res.data.garageUpdateTag.message).equal('Tag updated correctly');
    garageInstance = await testGarage.getInstance();
    expect(garageInstance.tags[0]).to.be.equal('Awards 2022');
  });
  it('Updates the tag of multiple garages', async () => {
    const testGarage1 = await testApp.addGarage();
    const testGarage2 = await testApp.addGarage();

    const user = await testApp.addUser();

    await user.addGarage(testGarage1);
    await user.addGarage(testGarage2);

    let garageInstance1 = await testGarage1.getInstance();
    let garageInstance2 = await testGarage2.getInstance();

    const garageIds = [garageInstance1.getId().toString(), garageInstance2.getId().toString()];
    const variables = { garageIds, tag: "Revenue Champions" };
    await sendQuery(testApp, createMutation, { garageIds: [garageInstance1.getId().toString()], tag: 'Awesome Garages' }, user.userId);
    await sendQuery(testApp, createMutation, variables, user.userId);
    const res = await sendQuery(testApp, updateMutation, { garageIds: [garageInstance1.getId().toString(), garageInstance2.getId().toString()], currentTag: "Revenue Champions", newTag: "Best Garage Nominees" }, user.userId);

    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.garageUpdateTag).to.not.be.undefined;
    expect(res.data.garageUpdateTag.status).equal('OK');
    expect(res.data.garageUpdateTag.message).equal('Tag updated correctly');
    garageInstance1 = await testGarage1.getInstance();
    garageInstance2 = await testGarage2.getInstance();
    expect(garageInstance1.tags[0]).to.be.equal('Awesome Garages');
    expect(garageInstance1.tags[1]).to.be.equal('Best Garage Nominees');
    expect(garageInstance2.tags[0]).to.be.equal('Best Garage Nominees');
  });
});
