'use strict';

var config = require('config');
var debug = require('debug')('garagescore:common:lib:dropbox:client'); // eslint-disable-line max-len,no-unused-vars
var dbox = require('dbox');

var dboxApp = dbox.app({
  app_key: config.get('dropbox.app.key'),
  app_secret: config.get('dropbox.app.secret'),
});

var dboxAccessToken = {
  oauth_token_secret: config.get('dropbox.oAuth.tokenSecret'),
  oauth_token: config.get('dropbox.oAuth.token'),
  uid: config.get('dropbox.uid'),
};

var dboxClient = dboxApp.client(dboxAccessToken);

module.exports = dboxClient;
