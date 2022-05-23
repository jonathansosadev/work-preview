/**
shared code by publishers and consumers to init a queue
*/
const config = require('config');
const { JS, log } = require('../../util/log');
const ampqOpen = require('amqplib');

const localQueue = 'amqp://localhost';
let ampqServer = null;
const shouldCreateMultipleConnexions =
  config.has('publicUrl.app_url') && config.get('publicUrl.app_url').includes('app.custeed.com');
const ampqUrl =
  (config.has('messageQueue.useLocalServer') && config.get('messageQueue.useLocalServer')) ||
  !config.has('cloudamp.url')
    ? localQueue
    : config.get('cloudamp.url');
const exchangeName = 'WORKERS';
const exchangeType = 'direct';
const exitOnInitError = ampqUrl.indexOf('localhost') < 0;
// * durable: if true, the queue will survive broker restarts
// * Auto-delete : if true, after all consumers have finished consuming it,
//   the exchange or queue will be deleted by broker.
const exchangeOptions = { durable: true, autoDelete: false };
const queueOptions = { durable: true, autoDelete: false };

const _queues = {};

// check if we can use queues
function queuesDisabled() {
  return (
    (!config.has('messageQueue.useLocalServer') || !config.get('messageQueue.useLocalServer')) && // no local server
    (!config.has('cloudamp.url') || config.get('cloudamp.url') === '-')
  ); // neither remote url
}

// initialize a queue, returns a channel and a queue
async function initQueue(queueName) {
  if (_queues[queueName]) {
    return _queues[queueName];
  }
  log.debug(JS, `Init message queue ${queueName}...`);
  try {
    log.debug(JS, `Connecting to ${ampqUrl}...`);
    if (shouldCreateMultipleConnexions || !ampqServer) {
      ampqServer = await ampqOpen.connect(ampqUrl); // hack for app reviews
    }
    log.debug(JS, `Asserting message queue channel on ${exchangeName}...`);
    const channel = await ampqServer.createChannel();
    await channel.assertExchange(exchangeName, exchangeType, exchangeOptions);
    log.debug(JS, `Asserting message queue ${queueName}...`);
    const queue = await channel.assertQueue(queueName, queueOptions);
    channel.bindQueue(queueName, exchangeName, queueName, {});
    _queues[queueName] = { channel, queue, exchangeName };
    log.debug(JS, `Message queue ${queueName} initiated`);
  } catch (e) {
    log.error(JS, '_initQueue error', e);
    if (exitOnInitError) {
      process.exit(-1);
    }
    return 'NO_LOCAL_QUEUE';
  }
  return _queues[queueName];
}
async function closeServer() {
  return ampqServer.close();
}

module.exports = {
  queuesDisabled,
  initQueue,
  closeServer,
};
