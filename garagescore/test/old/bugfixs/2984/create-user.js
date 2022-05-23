const chai = require('chai');
const TestApp = require('../../../../common/lib/test/test-app');

const { expect } = chai;
const app = new TestApp();
let garageId;
describe('#2984', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    const garage = await app.addGarage();
    garageId = garage.getId().toString();
    await app.addUser({
      email: 'user@garagescore.com',
      godMode: true,
    });
  });

  it('create user loopback', async function () {
    /**
     * This test was created after adding a depedency to bson to our package.json
     * Loopback failed to validate fields with objectId
     * The instance couldnt be created a an expection was thrown
     */

    const userData = {
      password: '$2a$10$4JQYT6G7Dcmqm6cMyMU7eeXJ61vFP5buVAAW7xdyQ2C39EZj6M7Wm',
      email: 'toto@toto.fr',
      subscriptionStatus: 'Initialized',
      job: 'Direction qualité & méthodes groupe',
      garageIds: [garageId],
      groupIds: [],
      trolled: null,
    };
    const instance = await app.models.User.createUserInstance(userData);
    const user = await app.models.User.create(instance);
    expect(user).not.null;
  });
});
