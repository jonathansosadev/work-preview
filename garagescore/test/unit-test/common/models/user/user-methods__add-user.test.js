const TestApp = require('../../../../../common/lib/test/test-app');
const chai = require('chai');

const { addUser } = require('../../../../../common/models/user/user-methods');
const { UserRoles } = require('../../../../../frontend/utils/enumV2');
const UserSubscriptionStatus = require('../../../../../common/models/user-subscription-status.js');

const expect = chai.expect;
const app = new TestApp();

describe('Create a new user in mongo', () => {
  beforeEach(async () => {
    await app.reset();
  });

  it('Should set default role to "UserRoles.USER"', async () => {
    const newUser = await addUser(app, {
      email: 'newUser@custeed.com',
      lastName: 'newUserLastName',
      firstName: 'newUserFirstName',
    });
    expect(newUser.role).equals(UserRoles.USER);
  });

  it('Should set default authorization', async () => {
    const newUser = await addUser(app, {
      email: 'newUser@custeed.com',
      lastName: 'newUserLastName',
      firstName: 'newUserFirstName',
    });
    expect(newUser.authorization).to.be.not.null;
  });

  it('Should set default subscriptionStatus to "UserSubscriptionStatus.INITIALIZED"', async () => {
    const newUser = await addUser(app, {
      email: 'newUser@custeed.com',
      lastName: 'newUserLastName',
      firstName: 'newUserFirstName',
    });
    expect(newUser.subscriptionStatus).equals(UserSubscriptionStatus.INITIALIZED);
  });

  it('Should set default user.job to jobName : "Secrétariat général"', async () => {
    const newUser = await addUser(app, {
      email: 'newUser@custeed.com',
      lastName: 'newUserLastName',
      firstName: 'newUserFirstName',
    });
    expect(newUser.job).equals('Secrétariat général');
  });
});
