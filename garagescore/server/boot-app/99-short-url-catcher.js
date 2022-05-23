const _ = require('underscore');
const config = require('config');
const debug = require('debug')('garagescore:server:boot:short-url-catcher'); // eslint-disable-line max-len,no-unused-vars
const URI = require('urijs');
const util = require('util');
const debugPerfs = require('debug')('perfs:server:boot:short-url-catcher');

debugPerfs('Starting boot short-url-catcher');

let shortUrlCatcherHostName;
let sharedHostName = false;
const hasHostname = config.has('shortUrlCatcher.hostname');
if (hasHostname) {
  shortUrlCatcherHostName = config.get('shortUrlCatcher.hostname');
  sharedHostName = config.get('publicUrl.app_url').indexOf(shortUrlCatcherHostName) >= 0;
}

module.exports = function mountShortUrlCatcher(app) {
  app.use((req, res, next) => {
    if (typeof req.hostname !== 'undefined') {
      if (shortUrlCatcherHostName === req.hostname) {
        if (typeof req.path !== 'undefined') {
          if (req.path.substr(0, 1) === '/') {
            let shortUrlKey = req.path.substr(1);
            if (shortUrlKey.indexOf('/') >= 0) {
              next();
              return;
            }
            if (!_.isEmpty(shortUrlKey)) {
              shortUrlKey = URI.decode(shortUrlKey);
              if (!_.isEmpty(shortUrlKey)) {
                app.models.ShortUrl.findOne({ where: { key: shortUrlKey } }, (err, shortUrl) => {
                  if (err) {
                    console.error(util.format('Error in shortUrlCatcher: findByKey(%s): %s', shortUrlKey, err));
                    res.status(503).send('ShortURL Service Unavailable');
                  }
                  if (shortUrl === 'undefined' || shortUrl === null || _.isEmpty(shortUrl)) {
                    debug(shortUrlKey, shortUrl);
                    if (sharedHostName) {
                      // this could be normal and a regular url
                      next();
                      return;
                    }
                    res.status(404).send('ShortURL Not Found');
                  } else if (shortUrl.redirectLocation === 'undefined' || _.isEmpty(shortUrl.redirectLocation)) {
                    console.error(
                      util.format('Error in shortUrlCatcher: undefined findByKey(%s).redirectLocation', shortUrlKey)
                    );
                    res.status(503).send('ShortURL Service Very Unavailable');
                  } else {
                    // Save click event and redirect to target URL
                    app.models.ShortUrl.emitEvent(
                      shortUrl,
                      'click',
                      {
                        shortUrl: {
                          request: {
                            ip: req.ip || req.connection.remoteAddress,
                            headers: req.headers,
                            body: req.body,
                          },
                        },
                      },
                      (emitEventErr) => {
                        if (emitEventErr) {
                          console.error(util.format('Error in shortUrlCatcher: emitEvent: %s', emitEventErr));
                          res.status(503).send('Service Very Very Unavailable');
                          return;
                        }

                        res.redirect(301, shortUrl.redirectLocation);
                        return;
                      }
                    );
                  }
                });
                return;
              }
            }
          }
        }
      }
    }
    next();
  });
};
