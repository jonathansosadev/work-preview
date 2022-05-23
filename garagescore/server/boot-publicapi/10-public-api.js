const debugPerfs = require('debug')('perfs:server:boot:public-api');
const Firewall = require('../../common/lib/garagescore/firewall');

const common = require('../routes/public-api/common');
const ftp = require('../routes/public-api/ftp');
const pub = require('../routes/public-api/public');
const partners = require('../routes/public-api/partners');
const ping = require('../routes/public-api/ping');
const internalEvents = require('../routes/public-api/internal-events');
const config = require('config');

debugPerfs('Starting boot public-api');

// a firewall to block them all at every connexion
const allowedIps = common.customersIps.slice();
// allowedIps.push('127.0.0.1');
// allowedIps.push('localhost');
// allowedIps.push('::1');
allowedIps.push('52.57.80.173'); // nginx proxy api.garagescore.com
allowedIps.push('127.0.0.1:443'); // Nuxt default port
const firewall = new Firewall({ allowedIps });

module.exports = function mountPublicAPI(app) {
  const isAuthorized = function (method) {
    return function (req, res, next) {
      const appId = req.query ? req.query.appId : req.body.appId;
      if (!appId) {
        res.status(404).send(JSON.stringify({ error: 'No appId' }));
        return;
      }
      common.isAuthorized(method, req, appId, (errAuthorized, authorized, notAuthorizedResponse) => {
        if (errAuthorized || !authorized) {
          common.accessForbidden(req, res, notAuthorizedResponse);
          return;
        }
        next();
      });
    };
  };
  if (!config.has('api.open') || !config.get('api.open')) {
    app.use('/public-api', firewall.checkConnection);
    app.use('/public-api/*', firewall.checkConnection);
  }
  app.get('/public-api/ping', ping.ping);
  app.get('/public-api/help-signature/*', ping.helpSignature);

  /* Special route to render a contact through API */
  app.get('/public-api/renderContact/:id', isAuthorized('public'), pub.renderContact);

  /* Garages routes */
  app.get('/public-api/garages/data', isAuthorized('public'), pub.garagesData);
  app.get('/public-api/garages/data/after/:after', isAuthorized('public'), pub.garagesData);
  app.get('/public-api/garage/:garageId/data', isAuthorized('public'), pub.garageData);
  app.get('/public-api/garage/searchwith/:criteria/:value', isAuthorized('public'), pub.garageSearch);

  /* Leads routes */
  app.get('/public-api/garage/:garageId/leads', isAuthorized('public'), pub.garageLeads);
  app.get('/public-api/garage/leads/:day/:month/:year', isAuthorized('public'), pub.leadsByDate);
  app.get('/public-api/garage/leads/:day/:month/:year/after/:after', isAuthorized('public'), pub.leadsByDate);

  /* Reviews routes */
  app.post('/public-api/reviews/:garageId/add', isAuthorized('public'), pub.addReviews);
  app.get('/public-api/garage/:garageId/reviews', isAuthorized('public'), pub.garageReviews);
  app.get('/public-api/garage/reviews/:day/:month/:year', isAuthorized('public'), pub.reviewsByDate);
  app.get('/public-api/garage/reviews/:day/:month/:year/after/:after', isAuthorized('public'), pub.reviewsByDate);

  app.post('/public-api/reviews/:garageId/error', isAuthorized('public'), pub.signalExogenousReviewError);
  app.get('/public-api/reviews/configurations', isAuthorized('public'), pub.getGaragesExogenousConfigurations);

  /* FTP routes */
  app.get('/public-api/ftp/nextcreate', isAuthorized('ftp'), ftp.nextCreate);
  app.get('/public-api/ftp/accountcreated', isAuthorized('ftp'), ftp.accountCreated);

  app.get('/public-api/ftp/ftp2s3/garages', isAuthorized('ftp2s3'), ftp.garagesWithCopyFTP2S3);
  app.get('/public-api/ftp/ftp2s3/conf', isAuthorized('ftp2s3'), ftp.garageConf);
  app.post('/public-api/ftp/ftp2s3/log', isAuthorized('ftp2s3'), ftp.setLog);
  app.get('/public-api/ftp/ftp2s3/log', isAuthorized('ftp2s3'), ftp.getLog);
  app.get('/public-api/ftp/ftp2s3/poptransfer', isAuthorized('ftp2s3'), ftp.popTransfer);

  /* Partners routes */
  app.get('/public-api/share-reviews/garages', isAuthorized('partners'), partners.sharedReviewsGarages);
  app.get(
    '/public-api/share-reviews/garages2delete',
    isAuthorized('partners'),
    partners.sharedReviewsAllGarageReviewsToDelete
  );
  app.get(
    '/public-api/share-reviews/moderatedShared',
    isAuthorized('partners'),
    partners.sharedReviewsModeratedReviewsToDelete
  );

  app.post('/public-api/events/add/:event/:nEvents/:key1', internalEvents.addEvent);
  app.post('/public-api/events/add/:event/:nEvents/:key1/:key2', internalEvents.addEvent);
  app.post('/public-api/events/add/:event/:nEvents/:key1/:key2/:key3', internalEvents.addEvent);
  app.post('/public-api/events/add/:event/:nEvents/:key1/key2/:key3/:key4', internalEvents.addEvent);
  app.post('/public-api/events/add/:event/:nEvents/:key1/key2/:key3/:key4/:key5', internalEvents.addEvent);
  app.post('/public-api', (req, res) => {
    res.status(404).end();
  });
  app.post('/public-api/*', (req, res) => {
    res.status(404).end();
  });
};
