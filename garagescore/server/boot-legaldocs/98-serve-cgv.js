const express = require('express');
const path = require('path');

const resolve = function (file) {
  return path.resolve(__dirname, file);
};

const isProd = process.env.NODE_ENV === 'production';
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

module.exports = function renderWWW(app) {
  app.use('/CGU.pdf', serve('../../resources/CGU.pdf', true));
  app.use('/CGV.pdf', serve('../../resources/CGV.pdf', true));
  app.use('/CGV-Connect.pdf', serve('../../resources/CGV-Connect.pdf', true));
  app.use('/CGV-es.pdf', serve('../../resources/CGV-es.pdf', true));
  app.use('/CGU-es.pdf', serve('../../resources/CGU-es.pdf', true));
  app.use('/privacy.pdf', serve('../../resources/privacy.pdf', true));
  app.use('/privacy-es.pdf', serve('../../resources/privacy-es.pdf', true));
};
