const debug = require('debug')('garagescore:server:boot:client-www-b2c'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:client-www-b2c');
const lruCache = require('lru-cache');
const config = require('config');
const express = require('express');
const path = require('path');
const CertificateBuilder = require('../../common/lib/garagescore/certificate');

const resolve = function (file) {
  return path.resolve(__dirname, file);
};

debugPerfs('Starting boot client-www-certificate');

/** Memory caches*/
const resultsCache = lruCache({
  max: 1024 * 1024 * 50, // 50 MB of cache
  length(n) {
    return n.length;
  },
  dispose(key) {
    debug(`Remove ${key} from cache`);
  },
  maxAge: 1000 * 60 * 60, // last one hour
});
const slugCache = lruCache(1000);

const _setCacheControl = function (req, res, age) {
  if (!(req.query && req.query.nocache)) {
    const maxage = age || 3600;
    res.setHeader('Cache-Control', `public, max-age=${maxage}`);
    res.setHeader('Expires', new Date(Date.now() + maxage * 1000).toUTCString());
  }
};

// use cache
const cachedResults = function (req, res, next) {
  res.___start = Date.now(); // eslint-disable-line
  const key = req.originalUrl || req.url;
  let cached = resultsCache.get(key);
  let cacheDisabled = false;
  if (req.query && req.query.nocache) {
    debug('www - cache disabled by query');
    cached = null;
    cacheDisabled = true;
  }
  if (!config.get('client.useCache')) {
    debug('www - cache disabled by config');
    cached = null;
    cacheDisabled = true;
  }
  if (cached) {
    debug(`${key} in cache`);
    _setCacheControl(req, res);
    res.setHeader('X-servertime', Date.now() - res.___start);
    res.removeHeader('Vary'); // google speed audit dont like it
    res.send(cached);
    return;
  }
  res.sendResponse = res.send; // eslint-disable-line
  res.send = function (body) {
    // eslint-disable-line
    if (!cacheDisabled) {
      resultsCache.set(key, body);
    }
    _setCacheControl(req, res);
    res.setHeader('X-servertime', Date.now() - res.___start);
    res.removeHeader('Vary'); // google speed audit dont like it
    res.sendResponse(body);
  };
  next();
};
module.exports = function mountWWWb2c(app) {
  /*
   * Serve “/garage/:garageId” locally by dynamically rendering Garage Directory Pages
   */

  const garageDirectoryBaseUrl = '/garage';
  const searchDirectoryBaseUrl = '/search';

  const commentsDirectoryBaseUrl = '/comments';

  debug('Serving garage directory pages locally from “%s”', garageDirectoryBaseUrl);

  // get the garageId from the slug
  const _getIdFromSlug = function (slug, cb) {
    const cached = slugCache.get(slug);
    if (cached) {
      cb(null, cached);
      return;
    }
    app.models.Garage.findOne({ where: { slug } }, (err, garage) => {
      if (err) {
        cb(err);
        return;
      }
      if (!garage) {
        cb(new Error(`Unknown slug ${slug}`));
        return;
      }
      slugCache.set(slug, garage.getId().toString());
      cb(null, slugCache.get(slug));
    });
  };

  // ajax request, paginated comments per type
  const ajaxCommentPerTypePagination = async function (req, res) {
    // eslint-disable-line
    try {
      const slug = req.params.slug;
      const type = req.params.type;
      const reviewsPerPage = Math.min(1000, Math.max(0, req.params.reviewsPerPage || 50));
      const pageNumber = parseInt(req.params.pageId, 10);
      const page = await app.$CertificateBuilder.FetchReviewsForTypeAndPage(slug, type, pageNumber, reviewsPerPage);

      _setCacheControl(req, res);
      res.send(page);
    } catch (e) {
      res.status(500).send(e.message || e.toString());
    }
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

  app.use('/certificate/dist', serve('../../common/templates/www/certificate/dist', true));
  app.use('/certificate/static', serve('../../client/www/certificate', true));
  app.use('/certificate/fonts', serve('../../client/static/fonts', true));
  app.use('/certificate/bootstrap', serve('../../node_modules/bootstrap', true));
  app.use('/certificate/font-awesome', serve('../../node_modules/font-awesome', true));
  app.use('/certificate/moment', serve('../../node_modules/moment', true));
  app.use('/certificate/momenttz', serve('../../node_modules/moment-timezone', true));
  app.use(
    `${garageDirectoryBaseUrl}/:slug/manifest.json`,
    serve('../../common/templates/www/certificate/manifest.json', true)
  );
  app.use(
    `${garageDirectoryBaseUrl}/:slug/service-worker.js`,
    serve('../../common/templates/www/certificate/dist/service-worker.js')
  );

  /*
  We declare a new instance of CertificateBuilder, the cache will be built automatically
  Nuxt will access the CertificateBuilder via req.app.$CertificateBuilder and from then
  Nuxt will retrieve the certificate context to render the page
   */
  try {
    const withCache = !!(
      process.env.NODE_ENV &&
      process.env.NODE_ENV.toLowerCase().includes('prod') &&
      config.util.getEnv('NODE_APP_INSTANCE') !== 'review'
    );
    app.$CertificateBuilder = new CertificateBuilder(app, withCache); // eslint-disable-line no-param-reassign
  } catch (e) {
    console.error(`[CERTIFICATE - FATAL ERROR] Unable to build cache : ${e}`);
  }
  // ajax request, paginated comments per type
  app.get(
    `${garageDirectoryBaseUrl}/:slug${commentsDirectoryBaseUrl}/:type/page/:pageId/:reviewsPerPage?`,
    ajaxCommentPerTypePagination
  );

  const redirectToGarage = function (req, res) {
    res.redirect(301, `/garage/${req.params.slug}`);
  };
  const redirectToHome = function (req, res) {
    res.redirect(301, '/');
  };

  // former /search
  app.get(searchDirectoryBaseUrl, redirectToHome);
  app.get(`${garageDirectoryBaseUrl}/:brand/:city`, redirectToHome);

  // former pagination
  app.get(`${garageDirectoryBaseUrl}/:slug/after/:id`, (req, res) => {
    res.redirect(301, `${process.env.WWW_URL + garageDirectoryBaseUrl}/${req.params.slug}`);
  });
  app.get(`${garageDirectoryBaseUrl}/:slug/page/:id`, (req, res) => {
    res.redirect(301, `${process.env.WWW_URL + garageDirectoryBaseUrl}/${req.params.slug}`);
  });

  // former city pages now redirected with old ajax requests
  app.get(`${garageDirectoryBaseUrl}/:slug${commentsDirectoryBaseUrl}/page/:pageId`, redirectToGarage);
  app.get(`${garageDirectoryBaseUrl}/:slug${commentsDirectoryBaseUrl}/:type`, redirectToGarage);
  app.get(`${garageDirectoryBaseUrl}/:slug/:city`, redirectToGarage);
  app.get(`${garageDirectoryBaseUrl}/:slug/:city/page/:pageId`, redirectToGarage);
  app.get(`${garageDirectoryBaseUrl}/:slug/:city${commentsDirectoryBaseUrl}/page/:pageId`, redirectToGarage);
  app.get(`${garageDirectoryBaseUrl}/:slug/:city${commentsDirectoryBaseUrl}/:type`, redirectToGarage);
  app.get(`${garageDirectoryBaseUrl}/:slug/:city${commentsDirectoryBaseUrl}/:type/page/:pageId`, redirectToGarage);
};
