const ContactType = require('../../../common/models/contact.type');
const CampaignTypes = require('../../../common/models/campaign.type.js');
const AlertType = require('../../../common/models/alert.types');
const contactStatus = require('../../../common/models/contact.status');
const contactsConfigs = require('../../../common/lib/garagescore/data-campaign/contacts-config.js');
const { renderContactForData } = require('../../../common/lib/garagescore/contact/render-campaign-contact');
const gsIDEncryption = require('../../../common/lib/util/public-link-encrypted-id');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const dataTypes = require('../../../common/models/data/type/data-types');
const alertTypes = require('../../../common/models/alert.types');
const GarageTypes = require('../../../common/models/garage.type.js');
const ReportConfigs = require('../../../common/lib/garagescore/report/configuration');
const config = require('config');
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
const mailgun = require('../../../common/lib/mailgun/api');
const { promisify } = require('util');
const contactsSender = require('../../../workers/contacts-sender');
const { ObjectId } = require('mongodb');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

const _renderContactPayload = async function _renderContactPayload(app, contactKey, garageId) {
  const garage = await app.models.Garage.findById(garageId || GaragesTest.GARAGE_DUPONT);
  if (!contactKey) throw new Error('contactKey not found');
  const firstName = _.sample([
    'Philippe',
    'Patrick',
    'Jean',
    'Pascal',
    'Michel',
    'Olivier',
    'Benjamin',
    'Alain',
    'Didier',
  ]);
  const lastName = _.sample(['MARTIN', 'BERNARD', 'THOMAS', 'PETIT', 'ROBERT', 'RICHARD', 'DUBOIS', 'MOREAU']);
  const data = new app.models.Data();
  data.set('garageType', garage.type);
  data.set('service.providedAt', new Date());
  data.set('source', { type: SourceTypes.DATAFILE, importedAt: new Date() });
  const testUrls = {
    base: '/',
    baseShort: 'http://ow.ly/YAWym',
    score: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };
  if (contactsConfigs[contactKey].campaignType === CampaignTypes.VEHICLE_SALE) {
    data.set('type', _.sample([dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE]));
  } else {
    data.set('type', dataTypes.MAINTENANCE);
  }
  data.set('survey.urls', testUrls);
  data.set('surveyFollowupUnsatisfied.urls', testUrls);
  data.set('surveyFollowupLead.urls', testUrls);
  data.set('customer.title', {
    value: 'Monsieur',
    original: 'Monsieur',
    isSyntaxOK: true,
    isEmpty: false,
    isValidated: true,
  });
  data.set('customer.gender', { value: 'M', original: 'M', isSyntaxOK: true, isEmpty: false, isValidated: true });
  data.set('customer.fullName', {
    value: `${firstName} ${lastName}`,
    original: `${firstName} ${lastName}`,
    isSyntaxOK: true,
    isEmpty: false,
    isValidated: true,
  }); // eslint-disable-line max-len
  // if (req.body.vehicleMake) { data.addVehicle(req.body.vehicleMake); } // OLD
  return promisify(renderContactForData)(data, garage, contactKey, null);
};

// get contents of every contacts of a garage to be sent or displayed
function _getBulkContent(app, req, callback) {
  app.models.Garage.findById(req.body.garageId, (err0, garage) => {
    if (err0 || !garage) {
      callback(err0 || new Error('garage not found !'));
      return;
    }
    const firstName = _.sample([
      'Philippe',
      'Patrick',
      'Jean',
      'Pascal',
      'Michel',
      'Olivier',
      'Benjamin',
      'Alain',
      'Didier',
    ]);
    const lastName = _.sample(['MARTIN', 'BERNARD', 'THOMAS', 'PETIT', 'ROBERT', 'RICHARD', 'DUBOIS', 'MOREAU']);
    const data = new app.models.Data();
    data.set('garageType', req.body.garageType);
    data.set('service.providedAt', new Date());
    const testUrls = {
      base: '/',
      baseShort: 'http://ow.ly/YAWym',
      score: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
    const renderFn = function (contactId, cb) {
      if (contactsConfigs[contactId].campaignType === CampaignTypes.VEHICLE_SALE) {
        data.set('type', _.sample([dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE]));
      } else {
        data.set('type', dataTypes.MAINTENANCE);
      }
      data.set('survey.urls', testUrls);
      data.set('surveyFollowupUnsatisfied.urls', testUrls);
      data.set('surveyFollowupLead.urls', testUrls);
      data.set('customer.title', {
        value: 'Monsieur',
        original: 'Monsieur',
        isSyntaxOK: true,
        isEmpty: false,
        isValidated: true,
      });
      data.set('customer.gender', { value: 'M', original: 'M', isSyntaxOK: true, isEmpty: false, isValidated: true });
      data.set('customer.fullName', {
        value: `${firstName} ${lastName}`,
        original: `${firstName} ${lastName}`,
        isSyntaxOK: true,
        isEmpty: false,
        isValidated: true,
      }); // eslint-disable-line max-len
      if (req.body.vehicleMake) {
        data.addVehicle(req.body.vehicleMake);
      }
      renderContactForData(data, garage, contactId, null, cb);
    };
    garage.getCampaignScenario((errScenario, scenario) => {
      if (errScenario) {
        callback(errScenario || new Error('scenario not found !'));
        return;
      }
      const contacts = scenario.listContacts();
      const results = {};
      async.forEachSeries(
        contacts,
        (contactKey, next) => {
          renderFn(contactKey, (err, content) => {
            content.contactName = contactsConfigs[contactKey].name;
            content.contactKey = contactKey;
            results[contactKey] = content;
            next();
          });
        },
        (err) => {
          if (err) {
            callback(err);
            return;
          }
          callback(null, results);
        }
      );
    });
  });
}

function addInfoToContact(contact, callback) {
  if (!contact) {
    console.error('addInfoToContact: contact is null');
    callback('addInfoToContact: contact is null');
    return;
  }
  const app = require('../../../server/server'); // eslint-disable-line
  async.auto(
    {
      data(cb) {
        if (contact.payload && contact.payload.dataId) {
          app.models.Data.findById(contact.payload.dataId, cb);
          return;
        }
        cb();
      },
      report(cb) {
        if (contact.payload && contact.payload.reportId) {
          app.models.Report.findById(contact.payload.reportId, cb);
          return;
        }
        cb();
      },
      alert(cb) {
        if (contact.payload && contact.payload.alertId) {
          app.models.Alert.findById(contact.payload.alertId, cb);
          return;
        }
        cb();
      },
      garage: [
        'data',
        function (cb, resx) {
          if ((contact.payload && contact.payload.garageId) || (resx.data && resx.data.garageId)) {
            app.models.Garage.findById(contact.payload.garageId || resx.data.garageId, cb);
            return;
          }
          cb();
        },
      ],
      dataFile: [
        'data',
        function (cb, resx) {
          if (
            resx.data &&
            resx.data.get('source.sourceType') === SourceTypes.DATAFILE &&
            resx.data.get('source.sourceId')
          ) {
            app.models.DataFile.findById(resx.data.get('source.sourceId'), cb);
            return;
          }
          cb();
        },
      ],
    },
    (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      contact.dataRecord = result.dataRecord; // eslint-disable-line no-param-reassign
      contact.dataFile = result.dataFile
        ? {
            // eslint-disable-line no-param-reassign
            id: result.dataFile.getId(),
            dataType: result.dataFile.dataType,
            filePath: result.dataFile.filePath,
            fileStore: result.dataFile.fileStore,
          }
        : null;
      contact.vehicle = result.vehicle; // eslint-disable-line no-param-reassign
      contact.data = result.data; // eslint-disable-line no-param-reassign
      contact.garage = result.garage; // eslint-disable-line no-param-reassign
      contact.alert = result.alert; // eslint-disable-line no-param-reassign
      if (result.report) {
        const usedConfig = ReportConfigs.get(result.report.reportConfigId);
        const months = [
          'Janvier',
          'Février',
          'Mars',
          'Avril',
          'Mai',
          'Juin',
          'Juillet',
          'Août',
          'Septembre',
          'Octobre',
          'Novembre',
          'Décembre',
        ];
        if (result.report.reportConfigId === 'monthlySummary') {
          contact.report = {
            reportLabel: usedConfig.label,
            context: result.report.context,
            contacts: result.report.contacts,
            period: `${months[result.report.month]} ${result.report.year}`,
            createdAt: result.report.createdAt,
            reportId: result.report.getId(),
          };
        } else {
          contact.report = {
            // eslint-disable-line no-param-reassign
            reportLabel: usedConfig.label,
            context: result.report.context,
            contacts: result.report.contacts,
            period: GarageHistoryPeriod.getDisplayableDate(result.report),
            createdAt: result.report.createdAt,
            config: result.report.config,
            garageIds: result.report.garageIds,
            reportPublicToken: gsIDEncryption.encrypt(result.report.getId()),
          };
        }
      }
      callback(null, contact);
    }
  );
}
module.exports = {
  addInfoToContact,
  manageContacts(app, req, res) {
    res.render('darkbo/darkbo-emails/manage-contact.nunjucks', {
      contactTypes: JSON.stringify(ContactType.values()),
      contactsConfigs: JSON.stringify(contactsConfigs),
      alertTypes: JSON.stringify(AlertType.values()),
      contactsStatus: JSON.stringify(contactStatus.values()),
      base_url: config.get('publicUrl.app_url'),
    });
  },
  list(app, req, res) {
    const supportedFormat = 'DD-MM-YYYY HH:mm';
    async.auto(
      {
        resend(cbr) {
          const resend = req.query.resend && req.query.resend.split('~');
          if (!resend) {
            cbr();
            return;
          }
          const [id, type] = resend;
          contactsSender.queueContact(id, type, new Date()).then(() => {
            app.models.Contact.getMongoConnector()
              .updateOne({ _id: new ObjectId(id) }, { $set: { status: contactStatus.WAITING } })
              .then(() => {
                cbr();
              });
          });
        },
        filters: [
          'resend',
          function filtersF(cb) {
            const filters = req.query.filter ? JSON.parse(req.query.filter) : {};
            if (!filters.limit) {
              filters.limit = 10; // eslint-disable-line no-param-reassign
            }
            if (!filters.order) {
              filters.order = 'createdAt DESC'; // eslint-disable-line no-param-reassign
            }
            const maxDate =
              filters.maxDate && moment(filters.maxDate, supportedFormat).isValid()
                ? moment(filters.maxDate, supportedFormat).toDate()
                : null;
            const minDate =
              filters.minDate && moment(filters.minDate, supportedFormat).isValid()
                ? moment(filters.minDate, supportedFormat).toDate()
                : null;
            if (maxDate && minDate) {
              filters.where.and = [{ createdAt: { gt: minDate } }, { createdAt: { lte: maxDate } }];
            } else {
              if (maxDate) {
                filters.where.createdAt = { lte: maxDate };
              }
              if (minDate) {
                filters.where.createdAt = { gt: minDate };
              }
            }
            cb(null, filters);
          },
        ],
        contacts: [
          'filters',
          function (cb, resx) {
            app.models.Contact.find(resx.filters, cb);
          },
        ],
        contactsInfo: [
          'contacts',
          function (cb, resx) {
            async.mapSeries(resx.contacts, addInfoToContact, cb);
          },
        ],
        total: [
          'filters',
          function (cb, resx) {
            app.models.Contact.count(resx.filters.where || {}, cb);
          },
        ],
      },
      (err, results) => {
        if (err) {
          res.status(403).send(err.toString());
          return;
        }
        res.status(200).setHeader('Content-Type', 'application/json');
        res.send(
          JSON.stringify({
            limit: results.filters.limit,
            skip: results.filters.skip || 0,
            contacts: results.contactsInfo,
            total: results.total,
          })
        );
      }
    );
  },
  async reSendSms(app, req, res) {
    const { contactId, sfusername, sfpassword, sfhost } = req.body;
    const contact = await app.models.Contact.findOne({ where: { _id: ObjectId(contactId) } });
    const credentialsSms = {
      sfusername,
      sfpassword,
      sfhost,
    };
    await contactsSender.sendContact(contact, { credentialsSms });
    res.json('ok');
  },
  contactPreviewIndex(app, req, res) {
    res.render('darkbo/darkbo-emails/render-contact', {
      current_tab: 'render-contact',
      contactsConfigs: JSON.stringify(contactsConfigs),
      GarageTypes: JSON.stringify(GarageTypes.translations()),
      alertTypes: JSON.stringify(alertTypes.values()),
      notificationTypes: JSON.stringify(
        ContactType.values().filter((e) => !['ALERT_EMAIL', 'CAMPAIGN_EMAIL', 'CAMPAIGN_SMS'].includes(e))
      ),
      defaultEmail: req.user.email,
    });
  },
  async contactPreviewContent(app, req, res) {
    const contactType = req.body.contactType;
    const forceLocale = req.body.locale || 'fr_FR';
    if (!contactType) return res.status(500).json('req.body or contactType not found in the body');
    if (contactType === 'Campaign') {
      return res.json(
        await _renderContactPayload(app, req.body.contactId, req.body.garageId || GaragesTest.GARAGE_DUPONT)
      );
    }
    const query = {
      where: {
        ...(contactType === 'Alert'
          ? { 'payload.alertType': req.body.alertType }
          : { type: req.body.notificationType }),
      },
      order: 'createdAt DESC',
    };
    const randomContact = await app.models.Contact.findOne(query); // Not so random lele
    if (randomContact) return res.json(await randomContact.render({ forceLocale }));
    return res.status(500).json(`Couldn't found the renderer for ${JSON.stringify(req.body)}`);
  },
  contactPreviewBulk(app, req, res) {
    res.render('darkbo/darkbo-emails/render-contact-bulk', {
      current_tab: 'render-contact',
      garages: JSON.stringify([
        // French garages
        { value: GaragesTest.GARAGE_DUPONT, name: GaragesTest.getProperty('GARAGE_DUPONT', 'publicDisplayName') },
        { value: GaragesTest.MOTO_DUBOIS, name: GaragesTest.getProperty('MOTO_DUBOIS', 'publicDisplayName') },
        {
          value: GaragesTest.VEHICULE_INSPECTION_DURANT,
          name: GaragesTest.getProperty('VEHICULE_INSPECTION_DURANT', 'publicDisplayName'),
        },
        // English garages
        { value: GaragesTest.GARAGE_SMITH, name: GaragesTest.getProperty('GARAGE_SMITH', 'publicDisplayName') },
        { value: GaragesTest.MOTO_MOORE, name: GaragesTest.getProperty('MOTO_MOORE', 'publicDisplayName') },
        {
          value: GaragesTest.VEHICULE_INSPECTION_CLARK,
          name: GaragesTest.getProperty('VEHICULE_INSPECTION_CLARK', 'publicDisplayName'),
        },
        // Spanish garages
        {
          value: GaragesTest.GARAGE_DEL_BOSQUE,
          name: GaragesTest.getProperty('GARAGE_DEL_BOSQUE', 'publicDisplayName'),
        },
        { value: GaragesTest.MOTO_DEL_MAR, name: GaragesTest.getProperty('MOTO_DEL_MAR', 'publicDisplayName') },
        {
          value: GaragesTest.VEHICULE_INSPECTION_DEL_CIELO,
          name: GaragesTest.getProperty('VEHICULE_INSPECTION_DEL_CIELO', 'publicDisplayName'),
        },
        // Catalan garages
        { value: GaragesTest.GARAGE_NORD, name: GaragesTest.getProperty('GARAGE_NORD', 'publicDisplayName') },
        { value: GaragesTest.MOTO_SUD, name: GaragesTest.getProperty('MOTO_SUD', 'publicDisplayName') },
        {
          value: GaragesTest.VEHICULE_INSPECTION_CENTRE,
          name: GaragesTest.getProperty('VEHICULE_INSPECTION_CENTRE', 'publicDisplayName'),
        },
        // Belgian wallon garages
        { value: GaragesTest.GARAGE_LAMBERT, name: GaragesTest.getProperty('GARAGE_LAMBERT', 'publicDisplayName') },
        { value: GaragesTest.MOTO_LAMBERT, name: GaragesTest.getProperty('MOTO_LAMBERT', 'publicDisplayName') },
        {
          value: GaragesTest.VEHICULE_INSPECTION_LAMBERT,
          name: GaragesTest.getProperty('VEHICULE_INSPECTION_LAMBERT', 'publicDisplayName'),
        },
        // Belgian vlaams garages
        { value: GaragesTest.GARAGE_MERTENS, name: GaragesTest.getProperty('GARAGE_MERTENS', 'publicDisplayName') },
        { value: GaragesTest.MOTO_MERTENS, name: GaragesTest.getProperty('MOTO_MERTENS', 'publicDisplayName') },
        {
          value: GaragesTest.VEHICULE_INSPECTION_MERTENS,
          name: GaragesTest.getProperty('VEHICULE_INSPECTION_MERTENS', 'publicDisplayName'),
        },
      ]),
      defaultEmail: req.user.email,
    });
  },
  contactPreviewBulkFetch(app, req, res) {
    if (!req.body || !req.body.garageId) {
      res.status(500).json('req.body problems');
      return;
    }
    _getBulkContent(app, req, (err, results) => {
      if (err) {
        res.status(500).json(err);
        return;
      }
      res.status(200).json(JSON.stringify(results));
    });
  },
  contactPreviewBulkSend(app, req, res) {
    if (!req.body || !req.body.garageId || !req.body.email) {
      res.status(500).json('req.body problems');
      return;
    }
    const email = req.body.email;
    _getBulkContent(app, req, (err, results) => {
      if (err) {
        res.status(500).json(err);
        return;
      }
      res.status(200).send(`Emails sent to ${email}`);
      Object.keys(results).forEach((contact) => {
        if (contact.indexOf('email') >= 0) {
          const data = {
            from: 'darkbo@custeed.com',
            to: email,
            subject: results[contact].subject,
            html: results[contact].htmlBody,
          };
          mailgun
            .initFromContactType(ContactType.CAMPAIGN_EMAIL)
            .messages()
            .send(data, (error, body) => {
              console.log({ error, body });
            });
        }
      });
    });
  },
  searchRecipient(app, req, res) {
    if (!req.query.token) {
      res.status(403).send('No token !');
      return;
    }
    const ContactModel = app.models.Contact;
    ContactModel.find(
      {
        where: { to: req.query.token },
        fields: { id: true, to: true },
      },
      (err, contacts) => {
        if (err) {
          res.status(403).send(err.toString());
          return;
        }
        res.status(200).setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(_.uniq(contacts.map((contact) => contact.to))));
      }
    );
  },
  async renderContact(app, req, res) {
    const contact = await app.models.Contact.findById(req.params.id);
    const contactRendered = await contact.render();
    res.send(JSON.stringify(contactRendered));
  },
};
