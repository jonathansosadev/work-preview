/**
 * Test your single alert here
 * alerts-test-single-alert.js alertfile.js
 */
require('dotenv').config({ silent: true });
const path = require('path');
const slackClient = require('../../slack/client');
const app = require('../../../../server/server');

async function sendToSlack(message, channel = 'test') {
  return new Promise((resolve, reject) => {
    /*console.log(message);
    resolve();
    return;*/
    slackClient.postMessage(
      {
        text: `${message}`, // (an emoji is added in the final script)
        channel: `#${channel}`,
        username: 'common/lib/garagescore/monitoring/alerts.js',
      },
      (slackError) => {
        if (slackError) {
          console.error(slackError);
          reject(slackError);
        }
        resolve();
      }
    );
  });
}
async function main(app) {
  try {
    const { model, pipeline, script, shouldSendMessage, message, slackChannel } = require(path.resolve(
      `common/lib/garagescore/monitoring/alerts/${process.argv[2]}`
    ));
    let res = null;
    if (script) {
      res = await script(app);
    } else {
      const collection = app.models[model].getMongoConnector();
      res = await collection.aggregate(pipeline).toArray();
    }
    if (await shouldSendMessage(res)) {
      const m = await message(res);
      console.error(m);
      await sendToSlack(m, slackChannel);
    }
  } catch (e) {
    console.error(e);
  }
  process.exit();
}
app.on('booted', async () => {
  await new Promise((r) => setTimeout(r, 2000)); // wait for mongo
  await main(app);
});
