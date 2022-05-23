const debug = require('debug')('garagescore:server:boot:serve-static-files'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:serve-static-files');
const path = require('path');
const loopback = require('loopback');
const version = require('../../common/lib/garagescore/version');
const express = require('express');
const config = require('config');

const isProd = process.env.NODE_ENV === 'production';
const resolve = function (file) {
  return path.resolve(__dirname, file);
};
const serve = function (path1, cache) {
  return express.static(resolve(path1), {
    setHeaders(res) {
      if (cache && isProd) {
        res.setHeader('Cache-Control', 'max-age=604800'); // one week
        res.setHeader('ETag', '');
        res.setHeader('Expires', new Date(Date.now() + 86400 * 1000 * 7).toUTCString());
        res.removeHeader('Vary'); // google speed audit dont like it
      } else {
        res.setHeader('Cache-Control', 'max-age=no-cache');
        res.removeHeader('Vary'); // google speed audit dont like it
      }
    },
    etag: false,
  });
};

debugPerfs('Starting boot serve-static-files');
module.exports = function serveStaticFiles(app) {
  // every restart is considered to be a new version for our cached static content
  const setHeadersCurrent = function (res /* , path */) {
    res.setHeader('Cache-Control', 'max-age=315360000');
    res.removeHeader('Vary'); // google speed audit dont like it
  };
  const setHeadersLatest = function (res /* , path */) {
    if (config.get('client.www.useCache')) {
      res.setHeader('Cache-Control', 'max-age=604800'); // one week
      res.setHeader('Expires', new Date(Date.now() + 86400 * 1000 * 7).toUTCString());
      res.removeHeader('Vary'); // google speed audit dont like it
    } else {
      res.setHeader('Cache-Control', 'max-age=no-cache');
      res.removeHeader('Vary'); // google speed audit dont like it
    }
  };

  app.use('/external-lib/fingerprint.js', serve('../../common/templates/tracking/fingerprint.js', true));
  app.use('/external-lib/vue/vue.min.js', serve('../../node_modules/vue/dist/vue.min.js', true));
  app.use('/external-lib/axios/axios.js', serve('../../node_modules/axios/dist/axios.js'));
  app.use('/external-lib/roboto-fontface', serve('../../node_modules/roboto-fontface', true));
  app.use('/external-lib/font-awesome', serve('../../node_modules/font-awesome', true));
  app.use('/external-lib/bootstrap', serve('../../node_modules/bootstrap', true));
  app.use('/external-lib/google-maps', serve('../../node_modules/google-maps', true));
  app.use('/external-lib/survey-vue/survey.vue.min.js', serve('../../node_modules/survey-vue/survey.vue.min.js', true));
  app.use(
    '/external-lib/survey-vue/star-rating.min.js',
    serve('../../client/static/external-lib/surveyjs-star-rating.js', true)
  );
  app.use(
    '/external-lib/survey-vue/star-rating.css',
    serve('../../client/static/external-lib/surveyjs-star-rating.css', true)
  );
  app.use('/internal-lib/tools', serve('../../client/static/js/app/backoffice', true));
  app.use(
    `/static/${version}/`,
    loopback.static(path.resolve(__dirname, '../../client/static'), { setHeaders: setHeadersCurrent })
  );
  app.use(
    '/static/latest/',
    loopback.static(path.resolve(__dirname, '../../client/static'), { setHeaders: setHeadersLatest })
  );
};
