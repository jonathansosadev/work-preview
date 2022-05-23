/*
There are 2 parts in this script:
  1. Get all users from DB and create a CSV with all addresses and send CSV to mailgun
  2. Ten by ten delete users from mailgun bounces
*/
const app = require('../../../server/server');

const axios = require('axios');
const config = require('config');
const FormData = require('form-data');

const API_KEY = config.get('mailgun.apiKey'); // 'key-a1a526e74440c5c1c1dd618a5d78e697'
const DOMAIN = config.get(`mailgun.mg.domain`); //'mg.garagescore.com'

const mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });

const SAMPLE_VALUE = (process.argv[2] && Number(process.argv[2])) || 100;

const retrieveUsersEmail = async () => {
  return (
    await app.models.User.getMongoConnector()
      .find({}, { fields: { _id: 0, email: 1 } })
      .toArray()
  ).map((user) => user.email);
};

const uploadWhitelistToMailgun = async (emails) => {
  const data = new FormData();
  data.append('', 'address,domain\n' + emails.join(',\n') + ',');
  // we can't use mailgun-js for import
  const config = {
    method: 'post',
    url: `https://api.mailgun.net/v3/${DOMAIN}/whitelists/import`,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...data.getHeaders(),
    },
    auth: {
      username: 'api',
      password: API_KEY,
    },
    data: data,
  };
  try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.log(error);
  }
};

// minimum time to prevent mailgun api limit
const minimumRequestTime = (ms) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, ms)
  );

const deleteEmailsFromMailgunBounce = async (emails) => {
  const emailsToDelete = emails
    .splice(-SAMPLE_VALUE, SAMPLE_VALUE)
    .map((email) => mailgun.delete(`/${DOMAIN}/bounces/${email}`));
  const promises = await Promise.allSettled([...emailsToDelete, minimumRequestTime(2500)]);

  if (promises.filter((promise) => promise.reason && promise.reason.statusCode === 429) > 0) {
    throw Error(`LIMIT HAS BEEN REACH, use a lower SAMPLE_VALUE and be patient, current value: ${SAMPLE_VALUE}`);
  }

  if (emails.length > 0) deleteEmailsFromMailgunBounce(emails);
  else console.log('*** END WHITELIST USERS ***');
  return;
};

app.on('booted', async function () {
  try {
    console.log('*** START WHITELIST USERS ***');
    const emails = await retrieveUsersEmail();
    await uploadWhitelistToMailgun(emails);
    await deleteEmailsFromMailgunBounce(emails);
  } catch (e) {
    console.log(e);
    console.log('*** END WHITELIST USERS WITH ERRORS ***');
  }
  process.exit();
});
