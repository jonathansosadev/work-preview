/**
 * Fetch routed email from mailgun and store them
 * To test it:
 * - update the route discuss-test.garagescore.com on mailgun
 * - run ngrok
 * - send email to @discuss-test.garagescore.com
 */
require('dotenv').config({ silent: true });

const express = require('express');
const handleIncomingEmail = require('../../../common/lib/garagescore/cross-leads/handle-incoming-email.js');
const bodyParser = require('body-parser');

const monitoringUtils = require('../../../common/lib/garagescore/monitoring/utils');
const app = express();

app.post('/queuemessage', bodyParser.urlencoded({ limit: '50mb' }) /* upload.any() */, handleIncomingEmail);

// Registering QUETAL route to test app health
app.get(monitoringUtils.routeName, (req, res) => monitoringUtils.routeController(req, res, 'COMMON'));

const port = process.env.PORT || 80;
console.log(`Starting discuss server on port ${port}`);
app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
});
