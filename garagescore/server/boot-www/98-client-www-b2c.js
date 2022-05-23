const debug = require('debug')('garagescore:server:boot:client-www-b2c'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:client-www-b2c');
const path = require('path');
const nunjucks = require('nunjucks');
const gsAPI = require('../../common/lib/garagescore/api/public-api');
const moment = require('moment');
const express = require('express');
const config = require('config');
const { GaragesTest } = require('../../frontend/utils/enumV2');

const resolve = function (file) {
  return path.resolve(__dirname, file);
};

const isProd = process.env.NODE_ENV === 'production';

debugPerfs('Starting boot client-www-b2b');

const nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../..', 'common/templates/www/b2c')), {
  autoescape: true,
  watch: process.env.NODE_APP_INSTANCE === 'review',
});

nunjucksEnv.addGlobal('_getStarBetween', (min, max, ratio) => {
  if (ratio <= min) {
    return '/static/latest/images/www/b2c/stars/empty.png';
  }
  if (ratio >= max) {
    return '/static/latest/images/www/b2c/stars/full.png';
  }
  return ratio >= (min + max) / 2
    ? '/static/latest/images/www/b2c/stars/half.png'
    : '/static/latest/images/www/b2c/stars/empty.png';
});

nunjucksEnv.addGlobal('_getMiniTrophyBackgroundUrl', (rating) => {
  const rouderedRating = Math.round(rating * 2) / 2;
  return `/static/latest/images/www/b2c/mini-trophy/${rouderedRating.toString().replace(/\./, ',')}.png`;
});

nunjucksEnv.addGlobal('_dateFormat', (date) => {
  if (!date) {
    return '';
  }
  return moment.tz(date, 'Europe/Paris').format('DD MMMM YYYY');
});

nunjucksEnv.addGlobal('_validReview', (review) => {
  const keys = ['submittedAt', 'score', 'authorPublicDisplayName', 'comment'];
  let i = 0;

  for (i = 0; i < keys.length; i++) {
    if (!review[keys[i]]) {
      return false;
    }
  }

  return true;
});

/**
 * render www page
 * @param app
 */

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
  let _lastGaragesUpdate = 0;
  let _garages = null;
  let _lastReviewsUpdate = 0;
  let _reviews = null;
  const _aHour = 60 * 60 * 1000;

  function _getGarages() {
    return new Promise((next, error) => {
      app.models.Garage.find({}, (err, garages) => {
        if (err) {
          error(err);
          return;
        }
        _garages = {};
        garages.forEach((g) => {
          _garages[g.getId()] = g;
        }); // store the whole garage ??
        _lastGaragesUpdate = Date.now();
        next();
      });
    });
  }
  async function garagebyId(garageId) {
    if (Date.now() - _lastGaragesUpdate > _aHour) {
      // Refresh cache every hours
      await _getGarages();
    }
    return _garages[garageId];
  }

  async function _getLastTenReviews() {
    if (Date.now() - _lastReviewsUpdate > _aHour) {
      // Refresh cache every hours
      _lastReviewsUpdate = Date.now();
    } else return _reviews;
    try {
      const allReviews = await gsAPI.reviews(null, null, null, 50, null);
      const reviews = allReviews.filter((r) => !GaragesTest.hasValue(r.garageId)); // don't take garagescore-example
      const countReviews = reviews.length < 10 ? reviews.length : 10;
      for (let i = 0; i < countReviews; i++) {
        reviews[i].garage = await garagebyId(reviews[i].garageId);
      }
      return reviews.slice(0, countReviews);
    } catch (err) {
      throw err;
    }
  }

  /*app.get('/', (req, res) => {
    _getLastTenReviews().then((reviews) => {
      res.send(nunjucksEnv.render('index.nunjucks', {
        reviews,
        language: 'fr',
        captchaSiteKey: config.get('google.captchaSiteKey')
      }));
    }).catch((err) => {
      res.send(nunjucksEnv.render('index.nunjucks', { err, reviews: [] }));
    });
  });*/
  app.get('/css/b2c.css', (req, res) => {
    res.set('Content-Type', 'text/css');
    res.send(nunjucksEnv.render('css/index.nunjucks', { ie: req.query.ie !== undefined }));
  });
};
