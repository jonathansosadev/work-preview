const path = require('path');
const chai = require('chai');
const TestApp = require('../../../../common/lib/test/test-app');

const { expect } = chai;
const app = new TestApp();

describe('Restore dump from user', async () => {
  it('Restore user with garages', async function test() {
    await app.reset();
    await app.restore(path.resolve(`${__dirname}/datas/users-garages.dump`));
    const garages = await app.find('Garage', {});
    expect(garages.length).equals(1);
    expect(garages[0].publicDisplayName).equals('Autostanding (Nissan Douai)');
    const users = await app.find('User', {});
    expect(users.length).equals(27);
    expect(users[0].email).equals('god@custeed.com');
    expect(users[users.length - 1].email).equals('sfaid@garagescore.com');
  });
});
