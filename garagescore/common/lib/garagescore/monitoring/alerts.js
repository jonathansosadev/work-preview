/**
 * Monitor our database
 * Run a list of queries
 * Each query is an aggregate pipeline with a validate function using its results
 * If validate returns false, an alert is sent
 */
const glob = require('glob');
const path = require('path');
const slackClient = require('../../slack/client');

const _SLACK_CHANNEL = 'çavapastrop';
const _EMOTES = [
  ':hamster:',
  ':rabbit:',
  ':chipmunk:',
  ':chicken:',
  ':dog:',
  ':cat:',
  ':tiger:',
  ':dragon_face:',
  ':lion_face:',
  ':monkey_face:',
  ':fox_face:',
  ':cow:',
];
const _QUERIES = [];
glob.sync('common/lib/garagescore/monitoring/alerts/*.js').forEach(function (file) {
  if (file.indexOf('/alerts/_') < 0) {
    // ignore file with _
    const q = require(path.resolve(file));
    _QUERIES.push({ ...q, alertPath: file });
  }
});

async function sendToSlack(message, channel = _SLACK_CHANNEL) {
  const emote = _EMOTES[Math.floor(Math.random() * _EMOTES.length)];
  return new Promise((resolve, reject) => {
    slackClient.postMessage(
      {
        text: `${emote} ${message}`,
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
/* currentBatch: only run the scripts of this currentBatch */
module.exports = async (app, currentBatch = 'NIGHT') => {
  for (const {
    enabled,
    batch = 'NIGHT',
    model,
    script,
    pipeline,
    options = {},
    shouldSendMessage,
    message,
    slackChannel,
    alertPath,
  } of _QUERIES) {
    if (!enabled) {
      continue;
    }
    if (currentBatch !== batch) {
      continue;
    }
    console.log('Running file : ', alertPath);
    let sendMessage = false;
    let res = null;
    if (script) {
      res = await script(app);
    } else {
      const collection = app.models[model].getMongoConnector();
      res = await collection.aggregate(pipeline, options).toArray();
    }
    try {
      sendMessage = await shouldSendMessage(res);
    } catch (e) {
      // console.log(e);
    }
    if (sendMessage) {
      let m = '';
      try {
        m = await message(res);
      } catch (e) {
        m = `Error in ${alertPath}: ${e.message}`;
      }
      console.error(m);
      await sendToSlack(m, slackChannel);
    }
  }
};
