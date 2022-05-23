const debug = require('debug')('garagescore:server:boot:client-widget'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:client-widget-serve-locally');

debugPerfs('Starting boot client-widget');

const keys = [];
// embed content in html
const html = function (content) {
  const convert = content.replace(/\n/g, '<br/>');
  return `<html><head> <title>Recruit BoT</title><META NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW"></head><body>${convert}</body></html>`;
};

/*
 * Recruitment challenge
 */
module.exports = function mountClientWidget(app) {
  app.get('/recruitbot', (req, res) => {
    res.status(200).send(html("Bip . Bip ... I'm the recruit bot.. .. .\nPlease contact me using a POST request..."));
  });
  app.post('/recruitbot', (req, res) => {
    res
      .status(200)
      .send(
        'Bip . Bip ... Hooo thats better.. .. .\nHere is what you need to do:\n' +
          ' * Write a small program that\n' +
          ' ** get a key at POST /recruitbot/give-me-a-key\n' +
          ' ** use that key to unlock the next challenge by requesting POST /recruitbot/unlock?key=[key]'
      );
  });
  app.post('/recruitbot/give-me-a-key', (req, res) => {
    const key = Math.floor(Math.random() * 100000);
    keys.push(key.toString());
    if (keys.length > 100) {
      keys.shift();
    }
    res.send(200, key);
  });
  app.post('/recruitbot/unlock', (req, res) => {
    if (!req.query.key) {
      res.status(404).send('Missing key');
      return;
    }
    const i = keys.indexOf(req.query.key);
    if (i < 0) {
      res.status(404).send('Invalid or already used key');
      return;
    }
    keys.splice(i, 1);
    res
      .status(200)
      .send(
        'Well done !\nYou can find the next and last challenge in the repository,' +
          ' just open car.svg with a text editor and find the instructions.\n' +
          'Credentials to use: appId: "f10dfe479c65aa989406dc2b839d46a3" - appSecret: "dy3cXBViF4QCeuWD76sDunnpTTqg0rlw" '
      );
  });
};
