const chai = require('chai');
const redisClient = require('../../common/lib/garagescore/redis/redis-client');

const expect = chai.expect;
let redis = null;

/**
 * Theses tests the redis class
 */
describe('Testing redis', () => {
  beforeEach(async function beforeEach() {
    if (!redis) {
      redis = await redisClient('redisTest', (op) => {
        // console.log(JSON.stringify(op));
      });
    }
    await redis.del('testQueue');
  });
  after(async function after() {
    await redis.del('testQueue');
    await redis.quit();
  });
  it('test cache get set', async function test() {
    await redis.set('myKey', JSON.stringify({ userAgent: 'Blabla', ip: '::1' }));
    await redis.set('myKey2', JSON.stringify({ userAgent: 'Blabla', ip: '::1' }));
    const key = JSON.parse(await redis.get('myKey'));
    expect(key.userAgent).to.be.equal('Blabla');
  });

  it('test cache get all', async function test() {
    await redis.set('id1', JSON.stringify({ userAgent: 'Blabla', ip: '::1' }));
    await redis.set('id2', JSON.stringify({ userAgent: 'Blabla', ip: '::1' }));
    await redis.set('id3', JSON.stringify({ userAgent: 'Blabla', ip: '::1' }));
    const id2 = JSON.parse(await redis.get('id2'));
    await expect(id2.userAgent).to.be.equal('Blabla');
  });

  it('push an element to a list', async function test() {
    const elementToInsert = {
      username: 'username1',
      email: 'email1',
    };
    const elementToInsert2 = {
      username: 'username2',
      email: 'email2',
    };
    await redis.rpush('testQueue', JSON.stringify(elementToInsert));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert2));
    const allElements = (await redis.lrange('testQueue', 0)).map(JSON.parse);
    expect(allElements.length).to.be.equal(2);
    expect(allElements[0].username).to.be.equal(elementToInsert.username);
    expect(allElements[1].email).to.be.equal(elementToInsert2.email);
  });

  it('get an element by index from a list', async function test() {
    const elementToInsert = { username: 'username1', email: 'email1' };
    const elementToInsert2 = { username: 'username2', email: 'email2' };
    await redis.rpush('testQueue', JSON.stringify(elementToInsert));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert2));
    const element = JSON.parse(await redis.lindex('testQueue', 1));

    expect(element.username).to.be.equal(elementToInsert2.username);
    expect(element.email).to.be.equal(elementToInsert2.email);
  });

  it('get a range of element from a list', async function test() {
    const elementToInsert = { username: 'username1', email: 'email1' };
    const elementToInsert2 = { username: 'username2', email: 'email2' };
    const elementToInsert3 = { username: 'username3', email: 'email3' };
    await redis.rpush('testQueue', JSON.stringify(elementToInsert));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert2));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert3));
    const elements = (await redis.lrange('testQueue', 1, 2)).map(JSON.parse);

    expect(elements.length).to.be.equal(2);
    expect(elements[0].username).to.be.equal(elementToInsert2.username);
    expect(elements[1].email).to.be.equal(elementToInsert3.email);
  });

  it('remove an element from a list by its value', async function test() {
    const elementToInsert = { username: 'username1', email: 'email1' };
    const elementToInsert2 = { username: 'username2', email: 'email2' };
    const elementToInsert3 = { username: 'username3', email: 'email3' };
    await redis.rpush('testQueue', JSON.stringify(elementToInsert));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert2));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert3));
    const count = await redis.lrem('testQueue', 1, JSON.stringify(elementToInsert2));
    const allElements = (await redis.lrange('testQueue', 0)).map(JSON.parse);

    expect(count).to.be.equal(1);
    expect(allElements.length).to.be.equal(2);
    expect(allElements[0].username).to.be.equal(elementToInsert.username);
    expect(allElements[1].username).to.be.equal(elementToInsert3.username);
  });

  it('remove a key from cache', async function test() {
    const elementToInsert = { username: 'username1', email: 'email1' };
    await redis.rpush('testQueue', JSON.stringify(elementToInsert));
    const allElements = (await redis.lrange('testQueue', 0)).map(JSON.parse);

    expect(allElements.length).to.be.equal(1);

    await redis.del('testQueue');

    const allElements2 = (await redis.lrange('testQueue', 0)).map(JSON.parse);

    expect(allElements2.length).to.be.equal(0);
  });

  it('pop last element from a list', async function test() {
    const elementToInsert = { username: 'username1', email: 'email1' };

    const elementToInsert2 = { username: 'username2', email: 'email2' };
    const elementToInsert3 = { username: 'username3', email: 'email3' };
    await redis.rpush('testQueue', JSON.stringify(elementToInsert));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert2));
    await redis.rpush('testQueue', JSON.stringify(elementToInsert3));

    const element = JSON.parse(await redis.rpop('testQueue'));
    const allElements = (await redis.lrange('testQueue', 0)).map(JSON.parse);

    expect(element.username).to.be.equal(elementToInsert3.username);
    expect(allElements.length).to.be.equal(2);
    expect(allElements[0].username).to.be.equal(elementToInsert.username);
    expect(allElements[1].email).to.be.equal(elementToInsert2.email);
  });

  it('pop last element from an empty list', async function test() {
    const element = await redis.rpop('testQueue');

    expect(element).to.be.equal(null);
  });
});
