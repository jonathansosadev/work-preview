/**
 *
 * Drain heroky logs
 * To test it in local use ngrok to create a tunnel and add your local drain
 * `heroku drains:add https://4aa54fbc.ngrok.io/logs -a garagescore`
 * (dont forget to remive it with `drains:remove`)``
 * Be carefull to not exceed too many req/min with ngrok
 *
 * Every log is sent sequentially to a module
 * A module is a function implementing async (message, headers) and doing whatever it want after that
 * headers is an object string:string
 * message is an object {priority, syslog_version, emitted_at,  hostname, appname, proc_id, msg_id, structured_data, message }
 */

const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const locks = require('locks');
const logParser = require('./heroku-log-parser.js');

const sendTimeoutsToDatadog = require('./modules/send-timeouts-to-datadog');
const sendSlowqueriesToDatadog = require('./modules/send-slowqueries-to-datadog');
const sendGrapqhlqueriesToDatadog = require('./modules/send-graphqlqueries-to-datadog');
const saveKpisIncInDb = require('./modules/save-kpis-inc-in-db');

const modules = [];
// init modules
modules.push(sendTimeoutsToDatadog);
modules.push(sendSlowqueriesToDatadog);
modules.push(sendGrapqhlqueriesToDatadog);
modules.push(saveKpisIncInDb);

const mutexes = [];
modules.forEach(() => {
  mutexes.push(locks.createMutex());
});
// init express
const app = express();
app.use(bodyParser.raw({ type: 'application/logplex-1', limit: '10mb' }));

// send a message to a module, assuring that the last message was processed
function sendMessageToModuleI(i, message, headers, db) {
  if (message && message.message && message.message.indexOf('Error L10 (output buffer overflow)') >= 0) {
    console.error('Drain cannot keep up with Heroku, L10 errors received');
    return;
  }
  mutexes[i].timedLock(5000, (le) => {
    if (le) {
      console.log('Could not get the lock within 5 seconds :(');
    } else {
      try {
        modules[i](message, headers, db, () => {
          mutexes[i].unlock();
        });
      } catch (e) {
        console.error(e);
        mutexes[i].unlock();
      }
    }
  });
}

(async () => {
  const db = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));

  console.log(
    `Connected to a Mongo database named ${db.databaseName}, at ${db.serverConfig.host} on port ${db.serverConfig.port}`
  );

  app.post('/logs', (req, res) => {
    res.status(201).send('OK');
    const headers = req.headers;
    const body = req.body.toString('utf8');
    for (let i = 0; i < modules.length; i++) {
      logParser(body).forEach((m) => {
        sendMessageToModuleI(i, m, headers, db);
      });
    }
  });

  const port = process.env.PORT || 3000;
  console.log(`Starting logdrain server on port ${port}`);
  app.listen(port, (err) => {
    if (err) {
      console.error(err);
    }
  });
})();
