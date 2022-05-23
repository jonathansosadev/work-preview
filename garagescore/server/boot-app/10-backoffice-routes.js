const debug = require('debug')('garagescore:server:boot:backoffice-routes'); // eslint-disable-line max-len,no-unused-vars
const debugPerfs = require('debug')('perfs:server:boot:backoffice-routes');
const { ObjectId } = require('mongodb');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsClient = require('../../common/lib/garagescore/client');
const monitoringRoutes = require('../routes/backoffice/monitoring');
const campaignsRoutes = require('../routes/backoffice/campaigns');
const scheduledContactsRoutes = require('../routes/backoffice/scheduled-contacts');
const campaignScenariosRoutes = require('../routes/backoffice/campaigns-scenario');
const dataFileValidatorRoutes = require('../routes/backoffice/datafile-validator');
const publicReviewsRoutes = require('../routes/backoffice/public-reviews');
const customersRoutes = require('../routes/backoffice/customers');
const garageRoutes = require('../routes/backoffice/garage');
const applicationRoutes = require('../routes/backoffice/application');
const reputyScoreRoutes = require('../routes/backoffice/reputyscore');
const usersRoutes = require('../routes/backoffice/users');
const dataFileRoutes = require('../routes/backoffice/data-file');
const generateApiUrl = require('../routes/backoffice/generate-api-url.js');
const leadsExportsRoutes = require('../routes/backoffice/leads-exports');
const contactRoutes = require('../routes/backoffice/contact.js');
const faqRoutes = require('../routes/backoffice/faq.js');
const importsRoutes = require('../routes/backoffice/imports');
const exportsRoutes = require('../routes/backoffice/exports');
const automationRoutes = require('../routes/backoffice/automation');
const dataFileParsersRoutes = require('../routes/backoffice/data-file-parsers.js');
const gsImportSchemas = require('../../common/lib/garagescore/data-file/import-schemas');
const UserAuthorization = require('../../common/models/user-autorization');
const dataManagerRoutes = require('../routes/backoffice/data-manager.js');
const apiIdGenerator = require('../../common/lib/garagescore/api/app-id-generator.js');
const GarageTypes = require('../../common/models/garage.type.js');
const appInfos = require('../../common/lib/garagescore/api/app-infos');
const { getPlaceDetails, mergePlaceDetailsWithGarage } = require('../../common/lib/util/google-place-api.js');
const simulator = require('../boot-simulators/03-importer');
const xLeadsFilters = require('../routes/backoffice/xLeadsFilters');
const jobs = require('../routes/backoffice/jobs');

debugPerfs('Starting boot backoffice-routes');

module.exports = function mountBackofficeRoutes(app) {
  // Most critical part of the app
  app.get('/backoffice/drawings', ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')), (req, res) => {
    app.models.Configuration.getDrawings(true, (err, data) => {
      res.send(err || !data ? '{}' : JSON.stringify(data));
    });
  });
  app.post('/backoffice/drawings/:field', ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')), (req, res) => {
    try {
      app.models.Configuration.getDrawings(true, (err, data) => {
        const update = err || !data ? {} : data;
        update[req.params.field] = req.body.data;
        app.models.Configuration.setDrawings(update);
        res.send('OK');
      });
    } catch (e) {
      console.error(e);
      res.send(e.message);
    }
  });

  app.post(
    gsClient.url.getUrlNamespace('GOOGLE_PLACE').UPDATE_ONE,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    async (req, res) => {
      const mongo = app.models.Garage.getMongoConnector();
      const projection = {
        googlePlaceId: true,
        googlePlace: true,
        streetAddress: true,
        postalCode: true,
        city: true,
        region: true,
        subRegion: true,
        phone: true,
      };
      const garage = await mongo.findOne({ _id: ObjectId(req.params.garageId) }, { projection });
      if (!garage || !garage.googlePlaceId) {
        res.status(500).send("The garage doesn't have a googlePlaceId");
        return;
      }
      const $set = mergePlaceDetailsWithGarage(garage, await getPlaceDetails(garage));
      await mongo.updateOne({ _id: garage._id }, { $set });
      delete garage._id;
      res.status(200).send(JSON.stringify({ result: { ...$set } }));
    }
  );

  // img proxy, maybe we should move this hack to another place...
  app.get(gsClient.url.getUrl('STATIC_REDIRECTS'), (req, res) => {
    res.redirect(301, gsClient.staticUrl(req.originalUrl.replace('/static-redirect', '')));
  });

  // check if user is from garagescore
  app.use(gsClient.url.getUrl('ADMIN_HOME'), ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')), (req, res, next) => {
    if (!req.user || !req.user.email) {
      console.error('Cannot connect as admin, no req.user.email defined');
      // res.send(404);
      res.redirect(302, '/');
      return;
    }
    if (!req.user.email.match(/@garagescore\.com|@custeed\.com/)) {
      console.error(`DBO access denied, user doesnt have a garagescore email ${req.user}`);
      res.redirect(302, '/');
      return;
    }
    if (
      req.query.bucket &&
      req.query.bucket === 'facturation-automatique' &&
      req.query.filePath &&
      (req.user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO) ||
        req.user.hasAuthorization(UserAuthorization.ACCESS_TO_DARKBO))
    ) {
      next();
      return;
    }
    if (!req.user.hasAuthorization(UserAuthorization.ACCESS_TO_DARKBO)) {
      console.error(`DBO access denied, user doesnt have ACCESS_TO_DARKBO ${req.user}`);
      res.redirect(302, '/');
      return;
    }
    next();
  });

  // admin home
  app.get(gsClient.url.getUrl('ADMIN_HOME'), ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')), (req, res) => {
    res.render('darkbo/index', {
      current_tab: 'index',
      user: JSON.stringify(req.user),
      GarageTypes: JSON.stringify(GarageTypes.translations()),
    });
  });

  // all import schemas
  app.get(
    gsClient.url.getUrlNamespace('DARKBO_IMPORT_SCHEMAS').GET_ALL,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    (req, res) => {
      app.models.ParserConfig.find({}, (errC, parsers) => {
        if (errC) {
          res.status(500).send('Unable to get schemas');
        } else {
          let schemas = parsers.map((p) => p._reference);
          schemas = schemas.concat(gsImportSchemas.availablePaths);
          res.status(200).send(JSON.stringify(schemas));
        }
      });
    }
  );

  // import campaigns from files
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_IMPORTER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileValidatorRoutes.index.bind(null, app)
  );

  // import campaigns from files
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_IMPORTER_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileValidatorRoutes.listFiles.bind(null, app)
  );

  // validate dataRecord sheets from dropbox files
  app.post(
    gsClient.url.getUrl('ADMIN_DATA_FILE_IMPORTER_VALIDATE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileValidatorRoutes.validate.bind(null, app)
  );

  // import campaigns from files
  app.post(
    gsClient.url.getUrl('ADMIN_DATA_FILE_IMPORTER_FROM_FILESTORE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileValidatorRoutes.import.bind(null, app)
  );

  // import dataRecord sheets from string
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_IMPORTER_STRING'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileRoutes.importStringGET.bind(null, app)
  );

  // import campaigns from string
  app.post(
    gsClient.url.getUrl('ADMIN_DATA_FILE_IMPORTER_FROM_STRING'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileRoutes.importStringPOST.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_API_ID_GENERATOR'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    (req, res) => {
      res.render('darkbo/darkbo-api/id-generator.nunjucks', {
        current_tab: 'api',
        generated: apiIdGenerator(),
      });
    }
  );

  app.get(
    gsClient.url.getUrl('ADMIN_API_REQUEST_SIMULATOR'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    (req, res) => {
      res.render('darkbo/darkbo-api/request-simulator.nunjucks', {
        current_tab: 'api',
        generated: apiIdGenerator(),
        appInfos: JSON.stringify(appInfos.currentApps),
        publicApiBaseUrl: process.env.PUBLIC_API_URL,
      });
    }
  );
  // Import Simulator
  app.get(
    gsClient.url.getUrlNamespace('SIMULATORS').IMPORTER,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    simulator.index.bind(null, app)
  );
  app.post(
    gsClient.url.getUrlNamespace('SIMULATORS').IMPORTER,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    simulator.importSimulator.bind(null, app)
  );
  // Configure and get stats for leads exports
  app.get(
    gsClient.url.getUrl('ADMIN_LEADS_EXPORTS_CONFIG'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    leadsExportsRoutes.config.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_LEADS_EXPORTS_STATS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    leadsExportsRoutes.stats.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_LEADS_EXPORTS_CONFIG'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    leadsExportsRoutes.saveConfig.bind(null, app)
  );
  app.delete(
    gsClient.url.getUrl('ADMIN_LEADS_EXPORTS_CONFIG'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    leadsExportsRoutes.deleteConfig.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_API_GENERATE_URL'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    generateApiUrl.generateUrl.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_API_SIGN_REQUEST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    generateApiUrl.sign.bind(null, app)
  );

  // display final customers list
  app.get(
    gsClient.url.getUrl('ADMIN_CUSTOMERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    customersRoutes.index.bind(null, app)
  );

  // get final customers list
  app.get(
    gsClient.url.getUrl('ADMIN_CUSTOMERS_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    customersRoutes.getMore.bind(null, app)
  );

  // public reviews
  app.get(
    gsClient.url.getUrl('ADMIN_PUBLIC_REVIEW'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.index.bind(null, app)
  );

  // update public reviews
  app.post(
    gsClient.url.getUrl('ADMIN_PUBLIC_REVIEW_UPDATE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.update.bind(null, app)
  );

  // moderate public reviews
  app.post(
    gsClient.url.getUrl('ADMIN_PUBLIC_REVIEW_MODERATE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.moderate.bind(null, app)
  );

  // test moderation
  app.get(
    gsClient.url.getUrl('ADMIN_REVIEWS_TEST_MODERATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.testModeration.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_REVIEWS_TEST_MODERATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.testModerationSendTest.bind(null, app)
  );

  // public censoredWords list
  app.get(
    gsClient.url.getUrl('ADMIN_REVIEWS_CENSORED_WORDS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.censoredWords.bind(null, app)
  );

  // public censoredWords update
  app.post(
    `${gsClient.url.getUrl('ADMIN_REVIEWS_CENSORED_WORDS_UPDATE')}:censoredWordsId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    publicReviewsRoutes.updateCensoredWords.bind(null, app)
  );

  // maintenance mode
  app.get(
    gsClient.url.getUrl('ADMIN_APPLICATION_MAINTENANCE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    applicationRoutes.index.bind(null, app)
  );

  // maintenance mode
  app.get(
    gsClient.url.getUrl('ADMIN_APPLICATION_MAINTENANCE_CONFIG'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    applicationRoutes.getMaintenanceMode.bind(null, app)
  );

  // maintenance mode
  app.put(
    gsClient.url.getUrl('ADMIN_APPLICATION_MAINTENANCE_CONFIG'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    applicationRoutes.setMaintenanceMode.bind(null, app)
  );

  // display cron informations
  app.get(
    gsClient.url.getUrl('ADMIN_APPLICATION_CRON_INFORMATION_INDEX'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    applicationRoutes.cronInformationIndex.bind(null, app)
  );

  // display scheduler monitoring
  app.get(
    gsClient.url.getUrl('ADMIN_APPLICATION_SCHEDULER_MONITORING_INDEX'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    applicationRoutes.schedulerMonitoringIndex.bind(null, app)
  );

  // monitor db query
  app.get(
    gsClient.url.getUrl('ADMIN_MONITORING_PROFILER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    monitoringRoutes.profiler.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_MONITORING_PROFILER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    monitoringRoutes.profilerReset.bind(null, app)
  );
  // ReputyScore
  app.get(
    gsClient.url.getUrl('ADMIN_REPUTYSCORE_MONITORING'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    reputyScoreRoutes.index.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_REPUTYSCORE_MONITORING_FETCH_GARAGES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    reputyScoreRoutes.fetchGarages.bind(null, app)
  );

  // garage management, index page
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.index.bind(null, app)
  );
  // list all garages
  app.get(
    gsClient.url.getUrl('ADMIN_ALL_GARAGES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.allGarages.bind(null, app)
  );
  // list all garages groups
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGES_GROUPS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.groups.bind(null, app)
  );
  // garage management, run ftp2s3
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_RUN_FTP2S3'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.runftp2s3.bind(null, app)
  );
  // garage management, get one garage
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_BY_ID'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.getGarage.bind(null, app)
  );
  // get outlets list use for saleforce setting
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_OUTLETS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.getGarageOutlet.bind(null, app)
  );
  // get sourcetype use for saleforce setting
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_SOURCETYPES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.getSourceTypes.bind(null, app)
  );
  // garage management, update a garage
  app.put(
    gsClient.url.getUrl('ADMIN_GARAGE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.update.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.crossLeads.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_ADD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.crossLeadsAdd.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_GET_FILTERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    xLeadsFilters.getFilters.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_ADD_FILTERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    xLeadsFilters.insertFilters.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_DELETE_FILTERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    xLeadsFilters.removeFilters.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_CLEAN_BUCKET'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.crossLeadsCleanBucket.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_SIMULATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.crossLeadsSimulation.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_OVH_NEW_PHONES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.crossLeadsOVHNewPhones.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_CROSS_LEADS_JOB_SIMULATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.crossLeadsJobSimulation.bind(null, app)
  );

  // add a refresh token to a garage from access code
  app.post(
    gsClient.url.getUrl('GARAGE_ADD_EXOGENOUS_CONFIGURATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.addExogenousConfiguration.bind(null, app)
  );

  app.delete(
    gsClient.url.getUrl('GARAGE_DELETE_EXOGENOUS_CONFIGURATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.disconnectFromSource.bind(null, app)
  );

  // garages list component
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGES_LIST_COMPONENT'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.garagesListComponentGetAllGarages.bind(null, app)
  );

  // garage management, create a new garage and returns its id
  app.put(
    gsClient.url.getUrl('ADMIN_GARAGE_NEW'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.new.bind(null, app)
  );

  // garage report, list garages to index
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_INDEXED_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.indexedList.bind(null, app)
  );

  // test mecaplanning conf
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_MECAPLANNING'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testmecaplannningIndex.bind(null, app)
  );

  // test mecaplanning conf
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_MECAPLANNING_GETCSV'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testmecaplannningGetCsv.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_NEXTLANE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testnextlaneIndex.bind(null, app)
  );

  // test nextlane conf
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_NEXTLANE_GETCSV'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testnextlaneGetCsv.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_YUZER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testyuzerIndex.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_YUZER_GETCSV'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testyuzerGetCsv.bind(null, app)
  );

  // test vmobility conf
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_VMOBILITY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testvmobilityIndex.bind(null, app)
  );

  // test widget conf
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_WIDGET'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testWidgetIndex.bind(null, app)
  );

  // test vmobility conf
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_TEST_VMOBILITY_GETCSV'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.testvmobilityGetCsv.bind(null, app)
  );

  // exports garages
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_EXPORTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    garageRoutes.exports.bind(null, app)
  );

  // scheduled future contacts
  app.get(
    gsClient.url.getUrl('ADMIN_SCHEDULED_CONTACTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    scheduledContactsRoutes.index.bind(null, app)
  );

  // scheduled future contacts list
  app.get(
    gsClient.url.getUrl('ADMIN_SCHEDULED_CONTACTS_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    scheduledContactsRoutes.list.bind(null, app)
  );

  // scheduled future contacts garages
  app.get(
    gsClient.url.getUrl('ADMIN_SCHEDULED_CONTACTS_GARAGES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    scheduledContactsRoutes.garages.bind(null, app)
  );

  // scheduled future contacts campaignItems
  app.get(
    gsClient.url.getUrl('ADMIN_SCHEDULED_CONTACTS_CAMPAIGN_ITEMS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    scheduledContactsRoutes.datas.bind(null, app)
  );

  // force send future contacts force send
  app.get(
    gsClient.url.getUrl('ADMIN_CAMPAIGN_FORCE_SEND_SCHEDULED_BY_DAY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    scheduledContactsRoutes.forceSendScheduledByDay.bind(null, app)
  );

  // campaign management, re-pulls
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_PULLS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.index.bind(null, app)
  );

  // campaign management, re-pulls
  app.get(
    gsClient.url.getUrl('ADMIN_CAMPAIGN_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.listIndex.bind(null, app)
  );

  // campaign management, re-pulls
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_LIST_DATA'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.dataFileList.bind(null, app)
  );

  // campaign management, get latests downloads
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_LIST_PUSHES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.listPushes.bind(null, app)
  );

  // campaign management, get campaigns list
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_LIST_CAMPAIGNS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.listcampaigns.bind(null, app)
  );

  // campaign management, get campaigns datas list
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_LIST_CAMPAIGN_DATAS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.listCampaignDatas.bind(null, app)
  );

  // campaign management, ask a download
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_DOWNLOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.download.bind(null, app)
  );

  // campaign management, ask stats about a datafile
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_DATA_FILE_STATS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.datafileStats.bind(null, app)
  );

  // campaign management, ask campaigns from a datafile
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_CAMPAIGNS_FROM_DATAFILE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.campaignsFromDataFile.bind(null, app)
  );

  // campaign management, delete a datafile in error
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_DATA_FILE_DELETE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.datafileDelete.bind(null, app)
  );

  // campaign management, import a datafile
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_IMPORT'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.import.bind(null, app)
  );

  // campaign management, run a campaign
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_RUN_CAMPAIGN'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.run.bind(null, app)
  );

  // campaign management, cancel a campaign
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_CANCEL_CAMPAIGN'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.cancel.bind(null, app)
  );

  // campaign management, delete a campaign
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_DELETE_CAMPAIGN'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.delete.bind(null, app)
  );

  // campaign management, hide a campaign
  app.post(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_HIDE_CAMPAIGN'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.hide.bind(null, app)
  );

  // campaign management, view a the content of file on s3
  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_PULL_VIEW_FILE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignsRoutes.viewfile.bind(null, app)
  );

  // campaign scenario management, index
  app.get(
    gsClient.url.getUrl('ADMIN_CAMPAIGN_SCENARIO_INDEX'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignScenariosRoutes.index.bind(null, app)
  );

  // campaign scenario management, add scenario
  app.post(
    gsClient.url.getUrl('ADMIN_CAMPAIGN_SCENARIO_DATA'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignScenariosRoutes.save.bind(null, app)
  );

  // campaign scenario management, add scenario
  app.delete(
    gsClient.url.getUrl('ADMIN_CAMPAIGN_SCENARIO_DATA'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    campaignScenariosRoutes.delete.bind(null, app)
  );

  // contact
  app.get(
    gsClient.url.getUrl('ADMIN_CONTACT_RENDERER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.renderContact.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_CONTACT_MANAGE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.manageContacts.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_CONTACT_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.list.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_CONTACT_RE_SEND_SMS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.reSendSms.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_CONTACT_SEARCH'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.searchRecipient.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_CONTACT_PREVIEW_INDEX'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.contactPreviewIndex.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_CONTACT_PREVIEW_CONTENT'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.contactPreviewContent.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_CONTACT_PREVIEW_BULK'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.contactPreviewBulk.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_CONTACT_PREVIEW_BULK_FETCH'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.contactPreviewBulkFetch.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_CONTACT_PREVIEW_BULK_SEND'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    contactRoutes.contactPreviewBulkSend.bind(null, app)
  );

  // user management
  app.get(
    gsClient.url.getUrl('ADMIN_USER_SEARCH'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.searchUser.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_USER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.findById.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_ALL_USERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.allUsers.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GET_ONE_USER'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.getOneUser.bind(null, app)
  );

  // Send text format of the user list
  app.get(
    gsClient.url.getUrl('ADMIN_USERS_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.usersList.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_USERS_JSON_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.jsonUsersList.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_USERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.index.bind(null, app)
  );

  // user management, edition
  app.post(
    gsClient.url.getUrl('ADMIN_USER_EDIT'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.edit.bind(null, app)
  );

  // Anonymize the user
  app.get(
    `${gsClient.url.getUrl('ADMIN_USERS_ANONYMIZE')}:id`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    usersRoutes.anonymize.bind(null, app)
  );

  // monitoring
  app.get(
    gsClient.url.getUrl('ADMIN_MONITORING_MONTHLY_SUMMARY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    monitoringRoutes.monthlySummary.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_MONITORING_MONTHLY_SUMMARY_VALIDATE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    monitoringRoutes.validateMonthlySummary.bind(null, app)
  );

  // FAQ
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_SURVEYS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.surveys.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_ALERTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.alerts.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_REPORTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.reports.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_API'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.api.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_WIDGET'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.widget.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_WWW'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.www.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_FAQ_ADMIN'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    faqRoutes.admin.bind(null, app)
  );

  // Dynamic datafile importer
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileRoutes.list.bind(null, app)
  );

  // Dynamic datafile importer
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_CONFIG'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.indexConfig.bind(null, app)
  );
  app.get(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_CONFIG_LOAD')}:configId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.loadConfig.bind(null, app)
  );
  app.post(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_CONFIG_SAVE')}:configId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.saveConfig.bind(null, app)
  );
  // Dynamic datafile importer, edit vehicleMakes
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_MAKES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.indexMakes.bind(null, app)
  );
  app.get(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_MAKES_LOAD')}:makesId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.loadMakes.bind(null, app)
  );
  app.post(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_MAKES_SAVE')}:makesId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.saveMakes.bind(null, app)
  );
  // UNDEFINED
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.indexUndefined.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED_LOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.loadUndefined.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED_APPLY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.applyUndefined.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED_SAVE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.saveUndefined.bind(null, app)
  );
  // Dynamic datafile importer, edit types
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_TYPES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.indexTypes.bind(null, app)
  );
  app.get(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_TYPES_LOAD')}:typesId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.loadTypes.bind(null, app)
  );
  app.post(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_TYPES_SAVE')}:typesId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.saveTypes.bind(null, app)
  );
  // Dynamic datafile importer, edit columns
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_COLUMNS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.indexColumns.bind(null, app)
  );
  app.get(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_COLUMNS_LOAD')}:columnsId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.loadColumns.bind(null, app)
  );
  app.post(
    `${gsClient.url.getUrl('ADMIN_DATA_FILE_DYNAMIC_PARSERS_COLUMNS_SAVE')}:columnsId`,
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataFileParsersRoutes.saveColumns.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_IMPORTS_SHARED_FILTERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    importsRoutes.indexSharedFilters.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_IMPORTS_SHARED_FILTERS_SAVE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    importsRoutes.saveSharedFilters.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_IMPORTS_FILTER_TEST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    importsRoutes.testFilter.bind(null, app)
  );

  // Exports
  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.index.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_GARAGES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.indexExportGarages.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_GARAGES_DOWNLOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.downloadExportGarages.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_SCENARIOS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.scenarios.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_DEFAULT_MANAGERS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.defaultManagers.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_GARAGE_EXPORTS_BILLING_CSV'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.exportsBillingGetCSV.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_AUTOMATION'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.indexExportAutomation.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_EXPORTS_AUTOMATION_DOWNLOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.downloadExportAutomation.bind(null, app)
  );

  app.post(
    gsClient.url.getUrl('ADMIN_EXPORTS_AUTOMATION_SENT_DOWNLOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.downloadExportSentAutomation.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_AUTOMATION_REPORT_CSV'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    customersRoutes.createCsvReport.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_CROSS_LEADS_STATS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.crossLeadsStats.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_EXPORTS_IDEASBOX'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    exportsRoutes.ideasbox.bind(null, app)
  );

  // Backoffice datas

  app.get(
    gsClient.url.getUrl('ADMIN_DATA_DISPLAY_ROOT'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.index.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_SEARCH'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.search.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_DISPLAY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.display.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_ANONYMIZE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.anonymize.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FORCE_SURVEY_UPDATE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.forceSurveyUpdate.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FORCE_SEND_NEXT_CAMPAIGN_CONTACT_FOR_DAY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.forceSendNextCampaignContactForDay.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FORCE_SEND_UNSATISFIED_FOLLOWUP'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.forceSendUnsatisfiedFollowup.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FORCE_SEND_LEAD_FOLLOWUP'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.forceSendLeadFollowup.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FORCE_SEND_NEXT_CAMPAIGN_RE_CONTACT_FOR_DAY'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.forceSendNextCampaignReContactForDay.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_DATA_FORCE_SEND_ALERTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.forceSendAlerts.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_DATA_DOWNLOAD'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.download.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_DATA_SWITCH_SHOULDSURFACEINSTATISTICS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    dataManagerRoutes.switchShouldSurfaceInStatistics.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_AUTOMATION_EVENTS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    automationRoutes.events.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_AUTOMATION_EVENTSFETCH'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    automationRoutes.eventsfetch.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_AUTOMATION_FETCH_MONITORING_SETTINGS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    automationRoutes.getSettings.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_AUTOMATION_UPDATE_MONITORING_SETTINGS'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    automationRoutes.updateSettings.bind(null, app)
  );

  app.get(
    gsClient.url.getUrl('ADMIN_JOBS_INDEX'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    jobs.index.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_JOBS_LIST'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    jobs.getJobs.bind(null, app)
  );
  app.get(
    gsClient.url.getUrl('ADMIN_JOBS_TYPES'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    jobs.getTypes.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_JOBS_EXECUTE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    jobs.execute.bind(null, app)
  );
  app.post(
    gsClient.url.getUrl('ADMIN_JOBS_MORE'),
    ensureLoggedIn(gsClient.url.getUrl('AUTH_SIGNIN')),
    jobs.more.bind(null, app)
  );
};
