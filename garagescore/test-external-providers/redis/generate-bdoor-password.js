const chai = require('chai');
const passwords = require('../../server/passport-bdoor/lib/passwords');

const expect = chai.expect;

/**
 * Theses tests the redis class
 */
describe('Testing backdoor with redis', () => {
  after(async function after() {
    await passwords.redisQuit();
  });
  it.only('generate and check password', async function test() {
    const pwd = await passwords.generate('myUser');
    expect(typeof pwd).to.be.equal('string');
    const wrongpassword = await passwords.check('myUser', 'wrongpassword');
    expect(wrongpassword).to.be.equal(false);
    const wronguser = await passwords.check('wrongUser', pwd);
    expect(wronguser).to.be.equal(false);
    const ok = await passwords.check('myUser', pwd);
    expect(ok).to.be.equal(true);
  });
});
