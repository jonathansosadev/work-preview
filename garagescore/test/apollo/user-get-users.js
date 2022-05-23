const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const { UserRoles } = require('../../frontend/utils/enumV2.js');
const _sendQueryAs = require('./_send-query-as');

const { expect } = chai;
const app = new TestApp();

const request = `query userGetUsers ($skip: Int, $limit: Int, $search: String) {
  userGetUsers (skip: $skip, limit: $limit, search: $search) {
    id
    email
    firstName
    garagesCount
  }
}`;
let loggedUser = null;

/* Get users for admin/users */
describe('userGetUsers', async function descr() {
  beforeEach(async function () {
    this.timeout(9999999);
    await app.reset();
    for (let i = 0; i < 10; i++) await app.addGarage();
    const garages = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true } })
      .toArray();
    for (let i = 0; i < 5; i++) {
      await app.addUser({
        firstName: `simon${i}`,
        garageIds: garages.map(({ _id }) => _id),
        role: UserRoles.ADMIN,
      });
    }
    for (let i = 0; i < 5; i++) {
      await app.addUser({
        firstName: `Poutate${i}`,
        garageIds: garages.map(({ _id }) => _id),
        role: UserRoles.SUPER_ADMIN,
      });
    }
    loggedUser = await app.addUser({ garageIds: [garages[0]._id], role: UserRoles.ADMIN });
  });
  it('get users', async function it() {
    const arguments = { skip: 0, limit: 10, search: 'simon' };
    const res = await _sendQueryAs(app, request, arguments, loggedUser.userId.toString());
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.userGetUsers).to.not.be.undefined;
    expect(res.data.userGetUsers.length).equals(5);
    expect(res.data.userGetUsers[0].garagesCount).equals(10);
  });
});
