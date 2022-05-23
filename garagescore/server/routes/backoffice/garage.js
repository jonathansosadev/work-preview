const async = require('async');
const config = require('config');
const moment = require('moment');

const gsDataFileDataTypes = require('../../../common/models/data-file.data-type');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const dataType = require('../../../common/models/data/type/data-types');
const GarageTypes = require('../../../common/models/garage.type.js');
const mecaplanningDownloader = require('../../../common/lib/garagescore/garage/dms-downloaders/mecaplanning-downloader');
const nextlaneDownloader = require('../../../common/lib/garagescore/garage/dms-downloaders/nextlane-downloader');
const yuzerDownloader = require('../../../common/lib/garagescore/garage/dms-downloaders/yuzer-downloader');
const contactsConfig = require('../../../common/lib/garagescore/data-campaign/contacts-config.js');
const VmobilityScrapper = require('../../../common/lib/garagescore/vmobility/VmobilityScrapper');
const gsImportSchemas = require('../../../common/lib/garagescore/data-file/import-schemas');
const gsLogos = require('../../../common/lib/garagescore/garage/logo');
const gsClient = require('../../../common/lib/garagescore/client');
const { getDefaultScenarioId } = require('../../../common/lib/util/app-config.js');
const { AutoBrands, MotoBrands, OtherBrands, CaravanBrands, JobTypes } = require('../../../frontend/utils/enumV2');
const facebook = require('../../../common/lib/util/facebook');
const google = require('../../../common/lib/util/google');
const crypto = require('../../../common/lib/util/crypto');
const gsDMS = require('../../../common/lib/dms/dms');
const boWorkers = require('../../workers/backoffice-workers');
const publicApi = require('../../../common/lib/garagescore/api/public-api');
const slackClient = require('../../../common/lib/slack/client');
const garageTimezones = require('../../../common/models/garage.timezones');
const PhoneBucketTypes = require('../../../common/models/phone-bucket.types.js');
const handleIncomingEmail = require('../../../common/lib/garagescore/cross-leads/handle-incoming-email.js'); // eslint-disable-line
const exampleEmailList = require('../../../common/lib/garagescore/cross-leads/example-email-list.js');
const OVH = require('../../../common/lib/garagescore/cross-leads/ovh-telephony-api.js');
const { getNextTimeSlot } = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const { crossLeadsAdd } = require('../../../common/lib/garagescore/cross-leads/darkbo-add-ovh-phones.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');
const { getOutlets } = require('../../../workers/jobs/scripts/export-leads-to-salesforce');

const encryptPassword = (rawPassword, cryptoAlgo, algo, cryptoSecretKey) => {
  if (/selectup/.test(algo) || /selectup/.test(cryptoSecretKey)) {
    const algorithm = config.has(algo) && config.get(algo);
    const cryptoKey = config.has(cryptoSecretKey) && config.get(cryptoSecretKey);
    if (!algorithm || !cryptoKey) {
      return rawPassword;
    }
    return crypto.encrypt(rawPassword, algorithm, cryptoKey);
  }
  const [secretKey, alg] = config.has(cryptoAlgo) && config.get(cryptoAlgo).split('.');
  if (!secretKey || !secretKey) {
    return rawPassword;
  }
  return crypto.encrypt(rawPassword, alg, secretKey);
};

const decryptPassword = (rawPassword, cryptoAlgo, algo, cryptoSecretKey) => {
  if (/selectup/.test(algo) || /selectup/.test(cryptoSecretKey)) {
    const algorithm = config.has(algo) && config.get(algo);
    const cryptoKey = config.has(cryptoSecretKey) && config.get(cryptoSecretKey);
    if (!algorithm || !cryptoKey) {
      return rawPassword;
    }
    return crypto.decrypt(rawPassword, algorithm, cryptoKey);
  }
  const [secretKey, alg] = config.has(cryptoAlgo) && config.get(cryptoAlgo).split('.');
  if (!secretKey || !secretKey) {
    return rawPassword;
  }
  return crypto.decrypt(rawPassword, alg, secretKey);
};
/** Garage creation / edition */
//Clean garages object
const cleanGarage = function (garage) {
  if (garage.lastPostOnGoogleMyBusinessAt) {
    garage.lastPost = moment(garage.lastPostOnGoogleMyBusinessAt).format('DD-MM-YYYY HH:mm:ss');
  }
  if (garage.postOnGoogleMyBusiness === undefined) {
    garage.postOnGoogleMyBusiness = true;
  }

  const exogenousReviewsConfigurations = {
    Google: { token: '', error: '', lastRefresh: null, externalId: '' },
    Facebook: { token: '', error: '', lastRefresh: null, externalId: '' },
    PagesJaunes: { token: '', error: '', lastRefresh: null, externalId: '' },
    Allogarage: { token: '', error: '', lastRefresh: null, externalId: '' },
  };

  garage.brandNames = garage.brandNames || [];
  garage.brandName = garage.brandName || '';

  garage.links = garage.links || [];
  garage.cic = garage.cic || { email: '', lastEmailSentDate: null, details: {} };
  garage.cic.lastEmailSentDate = garage.cic.lastEmailSentDate || null;

  garage.dataImportStartedAt = garage.dataImportStartedAt || garage.createdAt;

  garage.subscriptions = garage.subscriptions || {};

  garage.logoDirectoryPage = garage.logoDirectoryPage || [];

  garage.selectup = garage.selectup || { enabled: false, login: '', loginVO: '', password: '' };
  garage.salesforce = garage.salesforce || {
    enabled: false,
    clientId: '',
    clientSecret: '',
    user: '',
    pw: '',
    token: '',
    allowedSourceTypes: [],
  };
  garage.daimler = garage.daimler || {
    enabled: false,
    urlApi: '',
  };

  garage.businessId = garage.businessId || '';
  garage.externalId = garage.externalId || '';

  if (garage.exogenousReviewsConfigurations) {
    garage.exogenousReviewsConfigurations.Google =
      garage.exogenousReviewsConfigurations.Google || exogenousReviewsConfigurations.Google;
    garage.exogenousReviewsConfigurations.PagesJaunes =
      garage.exogenousReviewsConfigurations.PagesJaunes || exogenousReviewsConfigurations.PagesJaunes;
    garage.exogenousReviewsConfigurations.Facebook =
      garage.exogenousReviewsConfigurations.Facebook || exogenousReviewsConfigurations.Facebook;
    garage.exogenousReviewsConfigurations.Allogarage =
      garage.exogenousReviewsConfigurations.Allogarage || exogenousReviewsConfigurations.Allogarage;
  } else {
    garage.exogenousReviewsConfigurations = exogenousReviewsConfigurations;
  }

  garage.thresholds = garage.thresholds || {};
  if (!garage.thresholds.alertSensitiveThreshold) {
    garage.thresholds.alertSensitiveThreshold = { maintenance: 6, sale_new: 6, sale_used: 6, vehicle_inspection: 6 }; // new
  }
  if (garage.shareReviews === undefined) {
    garage.shareReviews = true;
  }
  if (garage.selectup && garage.selectup.password) {
    garage.selectup.password = decryptPassword(garage.selectup.password, null, 'selectup.algo', 'selectup.cryptoKey');
  }
  if (garage.salesforce && garage.salesforce.clientSecret) {
    garage.salesforce.clientSecret = decryptPassword(garage.salesforce.clientSecret, 'salesforce.cryptoAlgo');
  }
  if (garage.salesforce && garage.salesforce.pw) {
    garage.salesforce.pw = decryptPassword(garage.salesforce.pw, 'salesforce.cryptoAlgo');
  }
  if (garage.salesforce && garage.salesforce.token) {
    garage.salesforce.token = decryptPassword(garage.salesforce.token, 'salesforce.cryptoAlgo');
  }
  return garage;
};

/** page /backoffice/garages */
const _index = async function (app, req, res) {
  const fields = {
    id: 1,
    selectup: 1,
    exogenousReviewsConfigurations: 1,
  };

  const [garages, campaignScenarios, parsers] = await Promise.all([
    app.models.Garage.find({ fields }),
    app.models.CampaignScenario.find({}),
    app.models.ParserConfig.find({}),
  ]);

  let schemas = parsers.map((p) => p._reference);
  garages.forEach((garage) => {
    const newGarage = garage;
    if (newGarage.selectup && newGarage.selectup.password && newGarage.selectup.password.length) {
      newGarage.selectup.password = '';
    }

    if (!newGarage.exogenousReviewsConfigurations) {
      newGarage.exogenousReviewsConfigurations = {
        PagesJaunes: { token: '' },
        Allogarage: { token: '' },
        Facebook: { token: '' },
        Google: { token: '' },
      };
    }
  });

  schemas = schemas.concat(gsImportSchemas.availablePaths);
  res.render('darkbo/darkbo-garages/garages.nunjucks', {
    LogoEmails: JSON.stringify(gsLogos.availableEmailLogos),
    timezones: JSON.stringify(garageTimezones.values()),
    LogoDirectoryPages: JSON.stringify(gsLogos.availableDirectoryPages),
    brands: JSON.stringify({
      ...AutoBrands.toObject(),
      ...MotoBrands.toObject(),
      ...CaravanBrands.toObject(),
      ...OtherBrands.toObject(),
    }),
    campaignScenarios: JSON.stringify(campaignScenarios),
    contactsConfig: JSON.stringify(contactsConfig),
    dms: JSON.stringify(gsDMS),
    importSchemas: JSON.stringify(schemas),
    dataFileTypes: JSON.stringify(gsDataFileDataTypes.values()),
    GarageTypes: JSON.stringify(GarageTypes.translations()),
    gsClient,
    user: JSON.stringify(req.user),
  });
};

const _allGarages = async function (app, req, res) {
  const fields = {
    id: 1,
    group: 1,
    type: 1,
    slug: 1,
    publicDisplayName: 1,
    importSchema: 1,
  };
  const garages = await app.models.Garage.find({ fields });
  if (!garages) {
    res.status(403).send('all garages not found!');
    return;
  }
  res.json(garages);
};
// get groups from garages
const _groups = async function (app, req, res) {
  const query = [
    {
      $group: {
        _id: null,
        groups: {
          $addToSet: '$group',
        },
      },
    },
  ];
  const mongo = app.models.Garage.getMongoConnector();
  const result = await mongo.aggregate(query).toArray();
  if (!result[0].groups) {
    res.status(403).send('no groups not found!');
    return;
  }
  res.json(result[0].groups);
};

const _addExogenousConfiguration = function (app, req, res) {
  const garageId = req.params.garageId;
  const type = req.params.type;
  const code = req.body.code;
  let refreshToken = null;
  const url = req.body.url;
  if (!code || !garageId) {
    res.json({ status: 'KO', message: 'garageId or code missing' });
    return;
  }
  if (!SourceTypes.isExogenous(type)) {
    res.json({ status: 'KO', message: `${type} not available.` });
    return;
  }
  app.models.Garage.findOne({ where: { id: garageId } }, async (errGarage, garage) => {
    if (errGarage) {
      res.json({ status: 'KO', message: errGarage });
      return;
    }
    if (typeof garage.exogenousReviewsConfigurations !== 'object') garage.exogenousReviewsConfigurations = {};
    if (type === 'Google' && code) refreshToken = await google.generateRefreshTokenFromCode(code); // generate refresh token from code
    if (type === 'Facebook' && code) refreshToken = await facebook.generateLongTimeToken(code);
    garage.exogenousReviewsConfigurations[type] = { token: refreshToken || url, error: '', lastRefresh: new Date() };
    if (!refreshToken && !url) {
      res.json({ status: 'KO', message: "ERROR: Couldn't have refreshToken or url" });
      return;
    }
    garage.save((err, garageSaved) => {
      if (!err) res.json({ status: 'OK', message: 'CONFIG SAVED !', garageSaved });
      else res.json({ status: 'KO', message: err });
    });
  });
};

const _disconnectFromSource = function (app, req, res) {
  const garageId = req.params.garageId;
  const type = req.params.type;

  if (!garageId) {
    res.json({ status: 'KO', message: 'garageId missing' });
    return;
  }
  if (!SourceTypes.isExogenous(type)) {
    res.json({ status: 'KO', message: `${type} not available.` });
    return;
  }
  app.models.Garage.findById(garageId, async (errGarage, garage) => {
    if (errGarage) {
      res.json({ status: 'KO', message: errGarage });
      return;
    }
    if (typeof garage.exogenousReviewsConfigurations !== 'object') garage.exogenousReviewsConfigurations = {};
    garage.exogenousReviewsConfigurations[type] = {
      token: '',
      error: '',
      lastRefresh: null,
      externalId: '',
      lastError: null,
      lastFetch: null,
      connectedBy: '',
    };
    garage.save((err, garageSaved) => {
      if (!err) {
        app.models.Data.destroyAll({ garageId, type: dataType.EXOGENOUS_REVIEW, 'source.type': type }, (errDestroy) => {
          if (!errDestroy) {
            res.json({ status: 'OK', message: 'CONFIG SAVED !', garageSaved });
          } else {
            res.json({ status: 'KO', message: errDestroy });
          }
        });
      } else res.json({ status: 'KO', message: err });
    });
  });
};

const _getGarageOutlet = async (app, req, res) => {
  const urlApi = req.body.urlApi;
  const salesforce = {
    clientId: req.body.clientId,
    clientSecret: req.body.clientSecret,
    user: req.body.user,
    pw: req.body.pw,
    token: req.body.token,
  };
  const results = await getOutlets(urlApi, salesforce);
  res.json(results);
};

const _getSourceTypes = async (app, req, res) => {
  res.json(SourceTypes.values());
};

/** update garage options*/
const _update = (app, req, res) => {
  try {
    const garage = req.body;
    const garageId = garage.id;
    if (!garageId) {
      return res.status(500).send({ status: 'ko', error: 'garage update fail garageId missing' });
    }

    app.models.Garage.findById(garageId, async (errGarage, oldGarage) => {
      if (!oldGarage) {
        console.error(`Garage not found id: ${garageId}`);
        res.status(500).send({ status: 'ko', error: `Garage not found id: ${garageId}` });
        return;
      }

      if (garage.status !== oldGarage.status && garage.status === 'Ready') {
        const billingAccount = await app.models.BillingAccount.findOne({ where: { garageIds: oldGarage.id } });
        const billingAccountId = billingAccount ? billingAccount.id.toString() : null;
        const dboUrl = `${config.get('publicUrl.app_url')}/backoffice/garages#${garageId}`;
        const gboUrl = `${config.get(
          'publicUrl.app_url'
        )}/grey-bo/automatic-billing/billing-account/${billingAccountId}/garages/${garageId}`;
        await new Promise((res, rej) =>
          slackClient.postMessage(
            {
              text: `Le statut de l'établissement ${
                garage.publicDisplayName || oldGarage.publicDisplayName
              } vient de passer en "Attente de GO" :rocket:`,
              channel: '#factu_en-attente-de-go',
              username:
                req.user.firstName || req.user.lastName ? `${req.user.firstName} ${req.user.lastName}` : req.user.email,
              attachments: [
                {
                  fallback: `Voir cet établissement à ${dboUrl}`,
                  actions: [
                    {
                      type: 'button',
                      text: 'Lien DarkBO 🐍',
                      url: dboUrl,
                    },
                    ...(billingAccountId
                      ? [
                          {
                            type: 'button',
                            text: 'Lien GreyBO 🔧',
                            url: gboUrl,
                          },
                        ]
                      : []),
                  ],
                },
              ],
            },
            (e) => (e ? rej(e) : res())
          )
        );
      }

      const updateGarage = async (newGarage, oldGarage) => {
        try {
          delete newGarage.id;
          const update = await oldGarage.updateFromObject(newGarage);
          res.send({ status: 'ok', response: update, requested_id: garageId });
        } catch (e) {
          res.status(500).send({ status: 'ko', error: e.message });
        }
      };

      app.models.Garage.emptyScenariosCache();

      garage.stopShareReviewsAt = oldGarage.stopShareReviewsAt;

      if (oldGarage.shareReviews === true && garage.shareReviews === false) {
        garage.stopShareReviewsAt = new Date();
      }
      if (garage.exogenousReviewsConfigurations) {
        if (garage.exogenousReviewsConfigurations.Google) {
          if (garage.exogenousReviewsConfigurations.Google.lastError === '') {
            garage.exogenousReviewsConfigurations.Google.lastError = null;
          }
          if (garage.exogenousReviewsConfigurations.Google.lastRefresh === '') {
            garage.exogenousReviewsConfigurations.Google.lastRefresh = null;
          }
          if (garage.exogenousReviewsConfigurations.Google.lastFetch === '') {
            garage.exogenousReviewsConfigurations.Google.lastFetch = null;
          }
          if (
            !(
              garage.exogenousReviewsConfigurations.Google.token &&
              garage.exogenousReviewsConfigurations.Google.externalId
            )
          ) {
            garage.exogenousReviewsConfigurations.Google.lastError = null;
            garage.exogenousReviewsConfigurations.Google.error = null;
          }
        }
        if (garage.exogenousReviewsConfigurations.Facebook) {
          if (garage.exogenousReviewsConfigurations.Facebook.lastError === '') {
            garage.exogenousReviewsConfigurations.Facebook.lastError = null;
          }
          if (garage.exogenousReviewsConfigurations.Facebook.lastRefresh === '') {
            garage.exogenousReviewsConfigurations.Facebook.lastRefresh = null;
          }
          if (garage.exogenousReviewsConfigurations.Facebook.lastFetch === '') {
            garage.exogenousReviewsConfigurations.Facebook.lastFetch = null;
          }
          if (
            !(
              garage.exogenousReviewsConfigurations.Facebook.token &&
              garage.exogenousReviewsConfigurations.Facebook.externalId
            )
          ) {
            garage.exogenousReviewsConfigurations.Facebook.lastError = null;
            garage.exogenousReviewsConfigurations.Facebook.error = null;
          }
        }
        if (garage.exogenousReviewsConfigurations.PagesJaunes) {
          if (garage.exogenousReviewsConfigurations.PagesJaunes.lastError === '') {
            garage.exogenousReviewsConfigurations.PagesJaunes.lastError = null;
          }
          if (garage.exogenousReviewsConfigurations.PagesJaunes.lastRefresh === '') {
            garage.exogenousReviewsConfigurations.PagesJaunes.lastRefresh = null;
          }
          if (garage.exogenousReviewsConfigurations.PagesJaunes.lastFetch === '') {
            garage.exogenousReviewsConfigurations.PagesJaunes.lastFetch = null;
          }
          if (
            !(
              garage.exogenousReviewsConfigurations.PagesJaunes.token &&
              garage.exogenousReviewsConfigurations.PagesJaunes.externalId
            )
          ) {
            garage.exogenousReviewsConfigurations.PagesJaunes.lastError = null;
            garage.exogenousReviewsConfigurations.PagesJaunes.error = null;
          }
        }
      }

      if (garage['selectup.password']) {
        garage['selectup.password'] = encryptPassword(
          garage['selectup.password'],
          null,
          'selectup.algo',
          'selectup.cryptoKey'
        );
      }
      if (garage['salesforce.clientSecret']) {
        garage['salesforce.clientSecret'] = encryptPassword(garage['salesforce.clientSecret'], 'salesforce.cryptoAlgo');
      }
      if (garage['salesforce.pw']) {
        garage['salesforce.pw'] = encryptPassword(garage['salesforce.pw'], 'salesforce.cryptoAlgo');
      }
      if (garage['salesforce.token']) {
        garage['salesforce.token'] = encryptPassword(garage['salesforce.token'], 'salesforce.cryptoAlgo');
      }
      updateGarage(garage, oldGarage);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

/** add a new garage */
const _new = (app, req, res) => {
  try {
    const rand = new Date().getTime();
    const newGarage = {
      type: GarageTypes.DEALERSHIP,
      campaignScenarioId: getDefaultScenarioId(GarageTypes.DEALERSHIP),
      publicDisplayName: `NOUVEAU Garage ${rand}`,
      securedDisplayName: `NOUVEAU Garage ${rand}`,
      brandNames: ['Autre'],
      slug: 'nc',
      logoEmail: [],
      logoDirectoryPage: [],
      status: 'ToPlug',
      ratingType: 'rating',
      subscriptions: {
        Maintenance: { enabled: true, price: 2, date: new Date() },
        NewVehicleSale: { enabled: true, price: 2, date: new Date() },
        UsedVehicleSale: { enabled: true, price: 2, date: new Date() },
        Lead: { enabled: true, price: 2, date: new Date() },
        EReputation: { enabled: false, price: 2, date: new Date() },
        VehicleInspection: { enabled: false, price: 2, date: new Date() },
      },
      exogenousReviewsConfigurations: {
        Google: { token: '', error: '', lastRefresh: null, externalId: '' },
        Facebook: { token: '', error: '', lastRefresh: null, externalId: '' },
        PagesJaunes: { token: '', error: '', lastRefresh: null, externalId: '' },
        Allogarage: { token: '', error: '', lastRefresh: null, externalId: '' },
      },
    };
    app.models.Garage.create(newGarage, (err, garage) => {
      if (err) {
        res.status(500).send({ status: 'ko', error: err.message });
      } else {
        const response = { status: 'ok', response: garage, garage_id: garage.id };
        res.send(response);
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

const _getById = async function (app, req, res) {
  try {
    if (!req.params.id) {
      res.status(403).send('No id !');
      return;
    }
    const garage = await app.models.Garage.findById(req.params.id);
    res.json(cleanGarage(garage));
  } catch (err) {
    res.status(403).send(err ? err.toString() : 'Garage not found!');
    return;
  }
};

const _getGarageQuota = function (app, req, res) {
  if (!req.params.id) {
    res.status(403).send('No id !');
    return;
  }
  app.models.Garage.findById(req.params.id, (err, garage) => {
    if (err) {
      res.status(403).send(err.toString());
      return;
    }
    app.models.Garage.countReallySubscribedUsers(garage.getId())
      .then((count) => {
        res.status(200).setHeader('Content-Type', 'application/json');
        res.send(
          JSON.stringify({
            id: garage.getId().toString(),
            usersQuota: garage.usersQuota,
            countAllSubscribedUsers: count,
          })
        );
      })
      .catch((err4) => {
        res.status(403).send(err4.toString());
      });
  });
};

/** garages indexed by web cralwers */
const _indexedList = function (app, req, res) {
  try {
    app.models.Garage.find({ where: { hideDirectoryPage: false }, order: 'publicDisplayName ASC' }, (err, garages) => {
      if (err) {
        res.status(500).send('Error');
      } else {
        res.render('darkbo/darkbo-garages/garages-indexed', {
          current_tab: 'garages',
          garages,
        });
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};
/** test mecaplanning conf */
const _testmecaplannningIndex = async (app, req, res) => {
  res.render('darkbo/darkbo-garages/garages-testmecaplannning', {
    current_tab: 'garages',
  });
};

const _testmecaplannningGetCsv = function (app, req, res) {
  if (!req.query.id || !req.query.start || !req.query.end) {
    res.status(500).send('Query error');
    return;
  }
  app.models.Garage.findById(req.query.id, (e, garage) => {
    if (e) {
      res.status(500).send(e.message);
      return;
    }
    if (!garage) {
      res.status(500).send(`No garage found ${req.query.id}`);
      return;
    }
    boWorkers.launch(res, (emit, done) => {
      mecaplanningDownloader.getCsv(garage, req.query.start, req.query.end, 'Maintenances', done);
    });
  });
};
/** test vmobility conf */
const _testvmobilityIndex = function (app, req, res) {
  res.render('darkbo/darkbo-garages/garages-test-vmobility', {
    current_tab: 'garages',
  });
};

const _testWidgetIndex = function (app, req, res) {
  async.auto(
    {
      garages(cb) {
        app.models.Garage.find({ order: 'createdAt ASC' }, cb);
      },
    },
    (err, results) => {
      if (err) {
        res.status(500).send('Error');
        return;
      }
      try {
        res.render('darkbo/darkbo-garages/garages-test-widget.nunjucks', {
          garages: JSON.stringify(results.garages),
        });
      } catch (e) {
        console.error(e);
        res.status(500).send('Error');
      }
    }
  );
};

const _testvmobilityGetCsv = async function (app, req, res) {
  if (!req.query.u || !req.query.p || !req.query.m || !req.query.d) {
    res.status(500).send('Missing argument');
  } else {
    boWorkers.launch(res, async (emit, done) => {
      try {
        const garage = await app.models.Garage.getMongoConnector().findOne({
          $and: [{ 'dms.Maintenances.password': req.query.p }, { 'dms.Maintenances.username': req.query.u }],
        });
        if (garage) {
          const vmobilityScrapper = new VmobilityScrapper(
            garage._id.toString(),
            req.query.m,
            req.query.u,
            req.query.p,
            req.query.d
          );
          const result = await vmobilityScrapper.run();
          done(null, result);
        } else {
          throw new Error('garage not found with this username and password');
        }
      } catch (e) {
        done(e, null);
      }
    });
  }
};

const _testnextlaneIndex = async (app, req, res) => {
  res.render('darkbo/darkbo-garages/garages-testnextlane', {
    current_tab: 'garages',
    dataFileTypes: JSON.stringify(gsDataFileDataTypes.values()),
  });
};

const _testnextlaneGetCsv = function (app, req, res) {
  if (!req.query.id) {
    res.status(500).send('Query error');
    return;
  }
  if (!req.query.dataType) {
    res.status(500).send('Query error');
    return;
  }
  app.models.Garage.findById(req.query.id, (e, garage) => {
    if (e) {
      res.status(500).send(e.message);
      return;
    }
    if (!garage) {
      res.status(500).send(`No garage found ${req.query.id}`);
      return;
    }
    boWorkers.launch(res, async (emit, done) => {
      try {
        const csv = await nextlaneDownloader.getCsv(garage, req.query.dataType);
        done(null, csv);
      } catch (e) {
        done(e);
      }
    });
  });
};

const _testyuzerIndex = async (app, req, res) => {
  res.render('darkbo/darkbo-garages/garages-testyuzer', {
    current_tab: 'garages',
    dataFileTypes: JSON.stringify(gsDataFileDataTypes.values()),
  });
};

const _testyuzerGetCsv = function (app, req, res) {
  if (!req.query.id) {
    res.status(500).send('Query error');
    return;
  }
  if (!req.query.dataType) {
    res.status(500).send('Query error');
    return;
  }
  app.models.Garage.findById(req.query.id, (e, garage) => {
    if (e) {
      res.status(500).send(e.message);
      return;
    }
    if (!garage) {
      res.status(500).send(`No garage found ${req.query.id}`);
      return;
    }
    boWorkers.launch(res, async (emit, done) => {
      try {
        const csv = await yuzerDownloader.getCsv(garage, req.query.dataType, req.query.startDate, req.query.endDate);
        done(null, csv);
      } catch (e) {
        done(e);
      }
    });
  });
};

const _exports = function (app, req, res) {
  res.render('darkbo/darkbo-garages/garages-exports', {
    current_tab: 'garages',
  });
};
const _runftp2s3 = function (app, req, res) {
  if (!req.query.garageId) {
    res.status(500).send('Query error');
    return;
  }
  const garageId = req.query.garageId;
  boWorkers.launch(res, async (emit, done) => {
    try {
      // ask a transfer
      const taskId = await publicApi.ftp2s3PushTransfer(null, garageId);
      emit(`taskId ${taskId}`);
      let intents = 0;
      // check 15 seconds if we have some logs
      const tick = 1000 * 15;
      const checkLog = async function () {
        intents++;
        try {
          const log = await publicApi.ftp2s3LogGet(null, taskId);
          if (log) {
            done(null, log);
            return;
          }
        } catch (noLog) {
          if (noLog && intents < 40) {
            setTimeout(checkLog, tick);
          } else {
            done(null, `Délai d'attente dépassé (${tick * 40}ms)`);
          }
        }
      };
      setTimeout(checkLog, tick);
    } catch (e) {
      done(e);
      return;
    }
  });
};

const _garagesListComponentGetAllGarages = function (app, req, res) {
  const fields =
    req.query && req.query.showAdvanced
      ? [
          'id',
          'type',
          'publicDisplayName',
          'slug',
          'group',
          'status',
          'hideDirectoryPage',
          'importSchema',
          'googlePlaceId',
          'locale',
          'zohoDealUrl',
          'disableZohoUrl',
          'ratingType',
          'isReverseRating',
          'annexGarageId',
          'bizDevId',
          'performerId',
          'allowReviewCreationFromContactTicket',
          'enableCrossLeadsSelfAssignCallAlert',
        ]
      : ['id', 'publicDisplayName', 'slug'];
  app.models.Garage.find({ fields }, (err, garages) => {
    if (err) {
      res.status(500).send(`Error 500::GarageListComponent::GetAllGarages::${err.message}`);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).send(JSON.stringify(garages));
    }
  });
};

const _crossLeads = async (app, req, res) => {
  const availablePhones = await app.models.PhoneBucket.find({ where: { status: PhoneBucketTypes.AVAILABLE } });
  let censoredWords = await app.models.CensoredWords.findOne({ where: { language: 'fr' } });
  censoredWords = censoredWords.words.filter((w) => !w.match(/\s/));
  res.render('darkbo/darkbo-garages/cross-leads', {
    availablePhones: JSON.stringify(availablePhones),
    censoredWord: censoredWords[Math.floor(Math.random() * censoredWords.length)]
      .split('')
      .reverse()
      .join('')
      .toLowerCase(),
  });
};

/**
 * Simulate incoming email (LaCentrale)
 */
const _crossLeadsSimulation = async (app, req, res) => {
  const json = { errors: [] };
  try {
    const [sourceType, parserType] = req.body.sourceType.split('.');
    if (!exampleEmailList[sourceType]) throw new Error(`Can 't emulate ${req.body.sourceType} for now...`);

    if (req.body.type === 'EMAIL') {
      const testEmail = JSON.parse(
        JSON.stringify(exampleEmailList[sourceType][parserType] || exampleEmailList[sourceType])
      );
      const newReq = {
        body: {
          isATest: true,
          ...testEmail.raw,
        },
      };
      req.body.raw.phone = req.body.raw.phone.trim();

      const phoneCleanedFromSpaces = req.body.raw.phone.replace(/ /g, '');

      if (newReq.body['body-html'] && newReq.body['body-html'].includes('jfgilles3@gmail.com')) {
        // OUEST_FRANCE_AUTO 2
        newReq.body['body-html'] = newReq.body['body-html'].replace(/0628538680/g, phoneCleanedFromSpaces);
        newReq.body['body-html'] = newReq.body['body-html'].replace(/jfgilles3@gmail\.com/g, req.body.raw.email);
      } else if (newReq.body['body-html'] && newReq.body['body-html'].includes('aroland346@gmail.com')) {
        // OUEST_FRANCE_AUTO_NEW_FORMAT
        newReq.body['body-html'] = newReq.body['body-html'].replace(/0767393149/g, phoneCleanedFromSpaces);
        newReq.body['body-html'] = newReq.body['body-html'].replace(/aroland346@gmail.com/g, req.body.raw.email);
      } else if (newReq.body['stripped-html'].includes('hai.li200888@gmail.com')) {
        // LA_CENTRALE
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0766711636', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'hai.li200888@gmail.com',
          req.body.raw.email
        );
      } else if (
        newReq.body['stripped-html'].includes('23ef9528-e88a-5f07-bf06-0fd52b578e2c@messagerie.lacentrale.fr')
      ) {
        // LA_CENTRALE_NEW_VITRINE
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('06.17.13.08.46', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '23ef9528-e88a-5f07-bf06-0fd52b578e2c@messagerie.lacentrale.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('olivierbesnard@sfr.fr')) {
        // LE_BON_COIN
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'olivierbesnard@sfr.fr',
          req.body.raw.email
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0674824455', phoneCleanedFromSpaces);
      } else if (newReq.body['stripped-html'].includes('Arbaa.sabrina@live.fr')) {
        // L_ARGUS
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '+33646781229',
          req.body.raw.phone.replace(/^0/, '+33').replace(/ /g, '')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'Arbaa.sabrina@live.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('happyly_2006@hotmail.com')) {
        // PARU_VENDU
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0651917517', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'happyly_2006@hotmail.com',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('pena.orthophonie@orange.fr')) {
        // PROMONEUVE
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '06&nbsp;70&nbsp;51&nbsp;28&nbsp;15',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /pena\.orthophonie@orange\.fr/g,
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('alefebvre52@yahoo.com')) {
        // OUEST_FRANCE_AUTO
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(/0757901558/g, phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /alefebvre52@yahoo\.com/g,
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('p.malochet@online.fr')) {
        // CUSTOM_VO_MOTOR_K
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0619914015', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'marine.ollivier-lestre@groupe-altair.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('RB+AUTOTHIVOLLES@CUSTEED.COM')) {
        // CUSTOM_VO_AUTOTHIVOLLE
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0634187168', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'RB+AUTOTHIVOLLES@CUSTEED.COM',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('dan.savasta@gmail.com')) {
        // ZOOMCAR
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0612731670', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'dan.savasta@gmail.com',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('0619563517')) {
        // CUSTOM_VO_ALHENA
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0619563517', phoneCleanedFromSpaces);
      } else if (newReq.body['stripped-html'].includes('tutti.fruttiVn@gmail.com')) {
        // CUSTOM_VN_ALHENA
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('06001020304', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'tutti.fruttiVn@gmail.com',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('tutti.fruttiApv@gmail.com')) {
        // CUSTOM_APV_ALHENA
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('06001020304', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'tutti.fruttiApv@gmail.com',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('bernard.guiral@sfr.fr')) {
        // CUSTOM_VN_SNDIFFUSION
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0698804184', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'bernard.guiral@sfr.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('jeromebalag@gmail.com')) {
        // CUSTOM_VN_SNDIFFUSION
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0618425625', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'jeromebalag@gmail.com',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('guimeradominique@club-internet.fr')) {
        // CUSTOM_VO_SNDIFFUSION
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0626860352', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'guimeradominique@club-internet.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('guillaumebaillade@gmail.com')) {
        // CUSTOM_VO_SNDIFFUSION_NEW_FORMAT
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace('0681753853', phoneCleanedFromSpaces);
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'guillaumebaillade@gmail.com',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('kristel.fleureau@sfr.fr')) {
        // EKONSILIO_VN
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '+33698596360',
          phoneCleanedFromSpaces.replace(/^0/, '+33')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'kristel.fleureau@sfr.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('fabrice.bossuyt@hotmail.fr')) {
        // EKONSILIO_VO
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '+33630310953',
          phoneCleanedFromSpaces.replace(/^0/, '+33')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          'fabrice.bossuyt@hotmail.fr',
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('florenceazard@yahoo.com')) {
        // CHANOINE_VO
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '0683562376',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /florenceazard@yahoo\.com/g,
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('christophe.bourdon77@sfr.fr')) {
        // CHANOINE_APV
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '0612273386',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /christophe\.bourdon77@sfr\.fr/g,
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('rbourbilieres@custeed.com')) {
        // CHANOINE_VN
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '0634187168',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /christophe\.bourdon77@sfr\.fr/g,
          req.body.raw.email
        );
      } else if (newReq.body['stripped-html'].includes('rb@custeed.com')) {
        // CHANOINE_VO_CUSTOM_SEARCH
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '0634187168',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(/rb@custeed\.com/g, req.body.raw.email);
      } else if (newReq.body['stripped-html'].includes('autodefi-fake@gmail.com')) {
        // AUTO_DEFI_VN  AUTO_DEFI_VO  AUTO_DEFI_APV
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '0701010101',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /autodefi-fake@gmail\.com/g,
          req.body.raw.email
        );
      } else if (
        newReq.body['stripped-html'].includes('fake-vulcain@gmail.com') ||
        newReq.body['body-html'].includes('fake-vulcain@gmail.com')
      ) {
        // AUTO_DEFI_VN  AUTO_DEFI_VO  AUTO_DEFI_APV
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          '0607080807',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['stripped-html'] = newReq.body['stripped-html'].replace(
          /fake-vulcain@gmail\.com/g,
          req.body.raw.email
        );
        newReq.body['body-html'] = newReq.body['stripped-html'].replace(
          '0607080807',
          req.body.raw.phone.replace(/ /g, '&nbsp;')
        );
        newReq.body['body-html'] = newReq.body['stripped-html'].replace(/fake-vulcain@gmail\.com/g, req.body.raw.email);
      }
      newReq.body['Message-Id'] = (req.body.sourceType + req.body.raw.phone + req.body.raw.email).replace(/ /g, '-');
      handleIncomingEmail(newReq, res); // res already in there
    } else if (req.body.type === 'CALL' || req.body.type === 'MISSED_CALL') {
      const garageId = GaragesTest.GARAGE_DUPONT;
      if (!req.body.raw.phone) req.body.raw.phone = '0anonymous';
      const callDetails = {
        // Real example
        designation: 'OVH VoIP',
        called: '0033184232717',
        destinationType: 'landline',
        countrySuffix: 'ovh',
        hangupNature: '',
        calling: req.body.raw.phone.replace(/^0/, '0033').replace(/ /g, ''),
        dialed: '0033184232717',
        priceWithoutTax: {
          currencyCode: 'EUR',
          value: 0,
          text: '0.00 €',
        },
        duration: req.body.type === 'CALL' ? Math.floor(Math.random() * 120) + 1 : 0,
        planType: 'priceplan',
        wayType: 'transfer',
        consumptionId: Math.floor(Math.random() * 999999999) + 8000000000, // Random ID
        creationDatetime: new Date().toISOString(),
      };
      let call = await app.models.IncomingCrossLead.initFromCall(callDetails, garageId, req.body.sourceType);
      if (call) {
        await Scheduler.insertJob(
          JobTypes.CROSS_LEADS_INCOMING_CALL,
          { callId: call.externalId },
          new Date(),
          null,
          `CROSS_LEADS-${garageId}`
        );
        res.status(201).send('OK');
      } else {
        json.errors.push('Call CENSORED !');
        res.json(json);
      }
    }
  } catch (e) {
    json.errors.push(e.message);
    res.json(json);
  }
};

/**
 * Get OVH phones and filter with already taken
 */

const _crossLeadsOVHNewPhones = async (app, req, res) => {
  const json = { phones: [], errors: [] };
  try {
    const ovhPhones = await OVH.getAllPhones();
    const gsPhones = await app.models.PhoneBucket.getAll();
    const newPhones = ovhPhones.filter((p) => !gsPhones.includes(p));
    json.phones = newPhones.map((p) => ({ value: p, area: `0${p[4]}` }));
  } catch (e) {
    json.errors.push(e.message);
    console.log('errors _crossLeadsOVHNewPhones:', e.message);
  }
  res.json(json);
};

/**
 * Clean phone bucket
 */

const _crossLeadsCleanBucket = async (app, req, res) => {
  const json = { errors: [] };
  try {
    await app.models.PhoneBucket.destroyAll({});
  } catch (e) {
    json.errors.push(e.message);
  }
  res.json(json);
};

/**
 * JOB ON OPENING HOURS SIMULATOR
 */
const _crossLeadsJobSimulation = async (app, req, res) => {
  // body -> job.date, job.hours, job.garageFieldName, job.garageFieldValue
  const json = {};
  const dayToName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  try {
    const garage = await app.models.Garage.findOne({
      where: { [req.body.job.garageFieldName || 'id']: req.body.job.garageFieldValue || GaragesTest.GARAGE_DUPONT },
    });
    json.startDate = req.body.job.date;
    json.finalDate = await getNextTimeSlot(
      JobTypes.SEND_LEAD_FOLLOWUP,
      {
        planJobAfterXHoursOfOpeningHours: {
          hours: req.body.job.hours,
          googleOpeningHours: (garage.googlePlace && garage.googlePlace.openingHours) || null,
          timezone: garage.timezone,
        },
        noWeekEnd: true,
        saturdayOk: true,
      },
      req.body.job.date,
      1000
    );
    console.log('JOB DATE SIMULATOR =========================');
    const timeToHour = (time) => `${time.slice(0, 2)}h${time.slice(2, 4)}`;
    json.googleOpeningHours = garage.googlePlace.openingHours.map((g) => {
      return `${dayToName[g.close.day]} ${timeToHour(g.open.time)}-${timeToHour(g.close.time)}`;
    });
    json.publicDisplayName = garage.publicDisplayName;
  } catch (e) {
    json.errors = [e.message];
  }
  res.json(json);
};

module.exports = {
  // GET /backoffice/garage
  index: _index,
  // PUT /backoffice/garage
  update: _update,
  // POST /garage/googleCode/:garageId
  addExogenousConfiguration: _addExogenousConfiguration,
  disconnectFromSource: _disconnectFromSource,
  // /backoffice/garage/new
  new: _new,
  // /garage/users_quota/:id
  getGarageQuota: _getGarageQuota,
  // /garage/:id
  getGarage: _getById,
  // /garage/outlets
  getGarageOutlet: _getGarageOutlet,
  // /garage/sourcestypes
  getSourceTypes: _getSourceTypes,
  // gell all garages with projections
  allGarages: _allGarages,
  // gell all garages groups
  groups: _groups,
  // /garage/indexed
  indexedList: _indexedList,
  // /garage/testmecaplannning
  testmecaplannningIndex: _testmecaplannningIndex,
  // /garage/testmecaplannninggetscv
  testmecaplannningGetCsv: _testmecaplannningGetCsv,
  // /garage/tests/vmobility
  testvmobilityIndex: _testvmobilityIndex,
  // /garage/tests/widget
  testWidgetIndex: _testWidgetIndex,
  // /garage/tests/vmobility/getcsv
  testvmobilityGetCsv: _testvmobilityGetCsv,
  // /garage/testnextlane
  testnextlaneIndex: _testnextlaneIndex,
  // /garage/testmecaplannninggetscv
  testnextlaneGetCsv: _testnextlaneGetCsv,
  // /garage/testyuzer
  testyuzerIndex: _testyuzerIndex,
  // /garage/testyuzergetscv
  testyuzerGetCsv: _testyuzerGetCsv,
  // /garage/run_ftp2s3
  runftp2s3: _runftp2s3,
  // /backoffice/garageslistcomponent/garages
  garagesListComponentGetAllGarages: _garagesListComponentGetAllGarages,
  // garages/exports
  exports: _exports,

  crossLeads: _crossLeads,
  crossLeadsAdd,
  crossLeadsSimulation: _crossLeadsSimulation,
  crossLeadsJobSimulation: _crossLeadsJobSimulation,
  crossLeadsOVHNewPhones: _crossLeadsOVHNewPhones,
  crossLeadsCleanBucket: _crossLeadsCleanBucket,
};
