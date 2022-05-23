const chai = require('chai');
const config = require('config');
const MQConsumer = require('../../common/lib/mq/workers/consumer');
const MQProducer = require('../../common/lib/mq/workers/producer');
const MQCommmon = require('../../common/lib/mq/workers/common');

var expect = chai.expect;
chai.should();
let consumer = null;
let producer = null;
describe('Message queue singleton', () => {
  beforeEach(async function () {
    const prefix = config.get('messageQueue.prefix') ? config.get('messageQueue.prefix') : '';
    const TEST_QUEUE = `${prefix}test`;
    consumer = new MQConsumer(TEST_QUEUE);
    producer = new MQProducer(TEST_QUEUE);
  });
  it('produce 2 messages and consume', async function () {
    this.timeout(20000);
    const messagesRead = [];
    const f = (msg, next) => {
      messagesRead.push(JSON.parse(msg));
      next();
    };
    await consumer.start(f);
    await consumer.purgeQueue();
    await producer.start();
    const m1 = '' + Date.now();
    const m2 = m1 + 'b';
    await producer.publish(m1);
    await producer.publish(m2);
    await new Promise((r) => setTimeout(r, 2000));
    expect(messagesRead[0]).equals(m1);
    expect(messagesRead[1]).equals(m2);

    await MQCommmon.closeServer();
  });
});
