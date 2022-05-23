/**
 Create a consumer binded to a queue

A consumer has a rate limit and can only process X request per minute

When a message is consumed, the consumer can ack it to remove it from the queue or decide to keep it

http://www.squaremobius.net/amqp.node/channel_api.html#channel_ack

------
Usage:

  const consumer = new Consumer(queueNAme, messagePerMinute);
  consumer.start(handler);

  > handler : function (msg, done) is called for every message to be consumed
  > @msg (string) message to consume
  > @done (function) : callback,
  >                      done(err) => an error occured (and the message can be kept or not)
  >                      done(null, false) => message consumed, do not keep it in the queue
  >                      done(null, true) => message consumed, keep it in the queue
**/

const common = require('./common');
const { JS, log } = require('../../util/log');

const Consumer = class Consumer {
  constructor(queueName, maxRequestsPerMinute) {
    this.queue = queueName;
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.requestsRead = 0;
    this.rateLimiterWindow = 0;
    this.rateLimiterResetWindow = true;
    this.rateLimiterCounter = 0;
    this.rateLimiterWindowMs = 60 * 1000;
  }

  // start a consumer that will listen to maxRequestsPerMinute max every minute
  //   consumeMQ : function (msg, done) is called for every message to be consumed
  //   @msg (string) message to consume
  //   @done (function) : callback,
  //                     done(err) => an error occured (and the message can be kept or not)
  //                     done(null, false) => message consumed, do not keep it in the queue
  //                     done(null, true) => message consumed, keep it in the queue
  //
  async start(consumeMQ) {
    const cfg = await common.initQueue(this.queue);
    if (cfg === 'NO_LOCAL_QUEUE') {
      // a specific condition when running in local without any ampq server
      log.error(JS, `${this.queue} will not be consumed (no server found)`);
      return;
    }
    if (!cfg) {
      log.error(JS, `Message Queue Consumer init error on ${this.queue}`);
      process.exit();
    }
    this.channel = cfg.channel;

    // do not give more than one message to a worker at a time.
    // Ie, don't dispatch a new message to a worker until it has processed and acknowledged the previous one
    await this.channel.prefetch(1);

    const self = this;

    const proc = function proc(message) {
      const start = function start() {
        consumeMQ(message.content.toString(), (errConsume, keep = false) => {
          if (errConsume) {
            log.error(JS, 'Error during message consuming');
            log.error(JS, errConsume);
          }
          self.requestsRead++;
          self.rateLimiterCounter++;
          if (!keep) {
            self.channel.ack(message);
          }
        });
      };
      const now = Date.now();
      if (self.rateLimiterResetWindow) {
        self.rateLimiterWindow = now;
        self.rateLimiterResetWindow = false;
        self.rateLimiterCounter = 0;
      }
      // We rate limit with a fixed windows: TODO something more sexy with a sliding window
      let wait = 0;
      if (self.rateLimiterCounter > self.maxRequestsPerMinute) {
        wait = Math.min(self.rateLimiterWindowMs, self.rateLimiterWindowMs + self.rateLimiterWindow - now);
        log.info(JS, `Consumer ${self.queue} - Too many requests, wait ${wait} ms`);
        self.rateLimiterResetWindow = false;
        self.rateLimiterResetWindow = true;
      }
      setTimeout(start, wait);
    };

    this.channel.consume(this.queue, proc, { noAck: false }); // consume message and Ack manually
  }
  /** Remove all unread messages from a queue */
  async purgeQueue() {
    if (!this.channel) {
      const cfg = await common.initQueue(this.queue);
      if (cfg === 'NO_LOCAL_QUEUE') {
        // a specific condition when running in local without any ampq server
        log.error(JS, `${this.queue} will not be consumed (no server found)`);
        return;
      }
      if (!cfg) {
        log.error(JS, `Message Queue Consumer init error on ${this.queue}`);
        process.exit(); // better exit than resuming
      }
      this.channel = cfg.channel;
    }
    return this.channel.purgeQueue(this.queue);
  }
};

module.exports = Consumer;
