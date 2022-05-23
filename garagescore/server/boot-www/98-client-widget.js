const debug = require('debug')('garagescore:server:boot:client-widget'); // eslint-disable-line max-len,no-unused-vars
const gsWidgetPublisher = require('../../common/lib/garagescore/garage/widget-publisher');
const debugPerfs = require('debug')('perfs:server:boot:client-widget-serve-locally');
const lruCache = require('lru-cache');
const config = require('config');

debugPerfs('Starting boot client-widget');

/** Memory caches*/
const resultsCache = lruCache({
  max: process.env.NODE_APP_INSTANCE === "www" ? 1 : 1024 * 1024 * 10, // 10 MB of cache
  length(n) {
    return n.length;
  },
  dispose(key) {
    debug(`Remove ${key} from cache`);
  },
  maxAge: process.env.NODE_APP_INSTANCE === "www" ? 1 : 1000 * 60 * 60, // last one hour
});

const _setCacheControl = function (req, res, age) {
  const maxAge = age || 3600;
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  res.removeHeader('Vary'); // google speed audit dont like it
};

// Caching middleware for result
const cachedResults = function (req, res, next) {
  res.___start = Date.now(); // eslint-disable-line

  const isCacheDisabled = (
    (req.query && req.query.nocache)
    || !config.get('client.www.useCache')
  );
  if (isCacheDisabled) {
    config.get('client.www.useCache')
      ? debug('www - cache disabled by config')
      : debug('www - cache disabled by query');

    return next();
  }

  _setCacheControl(req, res);
  const cacheKey = req.originalUrl || req.url;
  const isCached = resultsCache.has(cacheKey);

  if (isCached) {
    res.setHeader('X-servertime', Date.now() - res.___start);
    return res.send(resultsCache.get(cacheKey));
  }

  res.sendResponse = res.send;
  res.send = function (body) {
    resultsCache.set(cacheKey, body);
    res.setHeader('X-servertime', Date.now() - res.___start);
    res.sendResponse(body);
  };

  next();
};

/*
 * Serve widget
 */
module.exports = function mountClientWidget(app) {
  const clientWidgetBaseUrl = '/widget';
  const clientSeoBaseUrl = '/seo';
  debug('Serving widgets locally from “%s”', clientWidgetBaseUrl);

  // *
  // * WIDGETS /img
  // *
  function getBooleanFromString(text) {
    if (!text) {
      return false;
    }
    if (text === 'true' || text === '1') {
      return true;
    } else if (text === 'false') {
      return false;
    }
    return false;
  }
  function getWidgetRenderOptions(options) {
    const {
      background,
      brand,
      color,
      locale,
      preview,
      size,
    } = options;

    return {
      css: {
        ...(color ? { color } : {}),
        ...(
          background
            ? { background: getBooleanFromString(background)  }
            : {}
        ),
      },
      ...(size ? { size } : {}),
      ...(locale ? { locale } : {}),
      ...(brand ? { brand } : {}),
      ...(preview ? { preview: getBooleanFromString(preview) } : {}),
    };
  }

  app.get(
    `${clientWidgetBaseUrl}/:type/:slug/:widgetFormat`,
    cachedResults,
    async (req, res) => {
      const { slug, type, widgetFormat } = req.params;
      const widgetTypes = ['garage', 'group'];
      const isUnknownType = !widgetTypes.includes(type);

      if (isUnknownType) {
        return res
          .status(404)
          .send(`Unknown type of widget (${type}) please choose either 'garage' or 'group'`);
      }

      try {
        const renderOptions = getWidgetRenderOptions(req.query);
        const widget = await gsWidgetPublisher.renderWidget(
          app,
          slug,
          type,
          widgetFormat,
          renderOptions,
        );

        return res.send(widget);
      } catch (errRender) {
        return res.status(500).send(`Unable to render widget: ${errRender.toString()}`);
      }
    });

  app.get(`${clientSeoBaseUrl}/:type/:slug/enrich.js`, cachedResults, async (req, res) => {
    const { type, slug } = req.params;
    if (!['garage', 'group'].includes(type)) {
      return res.status(404).send('Unknown type of widget (garage||group)');
    }
    if (type === 'group') {
      // enrich data are not enabled for group
      // as a matter of fact it just does not work ^^
      return res.send('');
    }

    const isGarageEnrichScriptEnabled = await gsWidgetPublisher.isGarageEnrichScriptEnabled(app, slug);
    if (!isGarageEnrichScriptEnabled) {
      return res.send('');
    }

    try {
      const widget = await gsWidgetPublisher.renderWidget(app, slug, type, 'enrich.js');
      return res.send(widget);
    } catch (errRender) {
      console.log(errRender.message);
      res.status(500).send('Cannot render widget');
    }
  });
};
