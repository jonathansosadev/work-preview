/**
 Create a consumer binded to a queue
 */
const common = require('./common');
const { JS, log } = require('../../util/log');

const Producer = class Producer {
  constructor(queueName) {
    this.queue = queueName;
  }

  // start a producer before publishing
  async start() {
    const cfg = await common.initQueue(this.queue);
    if (!cfg) {
      log.error(JS, `Message Queue Producer init error on ${this.queue}`);
      process.exit(-1);
    }
    this.channel = cfg.channel;
    this.exchangeName = cfg.exchangeName;
  }
  // publis one message (json object)
  async publish(msg) {
    return this.channel.publish(this.exchangeName, this.queue, Buffer.from(JSON.stringify(msg)), { persistent: false });
  }
};

module.exports = Producer;
