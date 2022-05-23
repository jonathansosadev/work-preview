/**
 * A simple app to open/close tickets
 */
require('dotenv').config({ silent: true });
const express = require('express');
const bodyParser = require('body-parser');

const { getApi, postApi, patchApi } = require('../../../common/lib/github/github-rest-api');
const slackClient = require('../../../common/lib/slack/client');

const REST_ROUTE = '/repos/garagescore/sandbox/issues';
const labels = ['Incident'];
const titlePrefix = ':rotating_light: ';

const DRY_MODE = false; // if true do not send anything to github/slack

/// FUNCTIONS
/** open a ticket wiht the same title or comment in the existing one */
async function openTicket(t) {
  const title = titlePrefix + t;
  let issues = await getApi(REST_ROUTE, { labels });
  issues = issues.map((i) => ({ number: i.number, title: i.title, url: i.html_url }));
  const oldIssue = issues.find((i) => i.title === title);
  if (oldIssue) {
    console.log(`Commenting on issue #${oldIssue.number}`);
    if (!DRY_MODE) {
      const body = '🔥 Incident still ongoing';
      const res = await postApi(`${REST_ROUTE}/${oldIssue.number}/comments`, { body });
      await slackClient.postMessageAsync(body + ' ' + oldIssue.url + '\n> ' + title.replace('${rotatingEmoji}', ''), {
        channel: '#çavapas',
      });
      console.log(res);
    }
  } else {
    console.log('Creating a new Issue');
    if (!DRY_MODE) {
      const res = await postApi(REST_ROUTE, { title, labels });
      console.log(res);
      if (res) {
        await slackClient.postMessageAsync(title + ' ' + res.html_url, { channel: '#çavapas' });
      }
    }
  }
}
/** close a ticket with the same title or comment in the existing one */
async function closeTicket(t) {
  const title = titlePrefix + t;
  let issues = await getApi(REST_ROUTE, { labels });
  issues = issues.map((i) => ({ number: i.number, title: i.title, url: i.html_url }));
  const oldIssue = issues.find((i) => i.title === title);
  if (oldIssue) {
    console.log(`Commenting on issue #${oldIssue.number}`);
    if (!DRY_MODE) {
      await slackClient.postMessageAsync('😀 Incident resolved\n> ' + title.replace('${rotatingEmoji}', ''), {
        channel: '#çavapas',
      });
      await postApi(`${REST_ROUTE}/${oldIssue.number}/comments`, { body: '😀 Incident resolved' });
    }
    console.log(`Closing the issue #${oldIssue.number}`);
    if (!DRY_MODE) {
      const res = await patchApi(`${REST_ROUTE}/${oldIssue.number}`, { state: 'closed' });
      console.log(res);
    }
  } else {
    console.log('No issue with title ' + title);
  }
}
/// ROUTES
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Registering QUETAL route to test app health, avoiding common/lib/garagescore/monitoring/utils.js to not use loopback
function _pad(s) {
  return (s < 10 ? '0' : '') + s;
}
function getUptime() {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);
  return `${_pad(hours)}h${_pad(minutes)}m${_pad(seconds)}`;
}
app.get('/quetal', (req, res) => res.send(getUptime()));
/**
 * Tests with
    var axios = require("axios");
    var options = {
    method: "post",
    baseURL: "http://localhost:3000",
    url:"/open",
    data: {title: "test"},
    };
    axios.request(options).then(res => { console.log(res.data)});
 */
app.post('/open', async (req, res) => {
  const title = req.body && req.body.title;
  if (!title) {
    res.send('Params error');
    return;
  }
  await openTicket(title);
  res.send('OK');
});
app.post('/close', async (req, res) => {
  const title = req.body && req.body.title;
  if (!title) {
    res.send('Params error');
    return;
  }
  await closeTicket(title);
  res.send('OK');
});

const port = process.env.PORT || 80;
console.log(`Starting github-incidents server on port ${port}`);
app.listen(port, (err) => {
  if (err) {
    console.error(err);
  }
});

(async function () {})();
