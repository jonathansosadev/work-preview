const contactsConfigs = require('../../../common/lib/garagescore/data-campaign/contacts-config.js');
const boWorkers = require('../../workers/backoffice-workers');
const ScheduledContactsAggregatorStream = require('../../../common/lib/garagescore/contact/Scheduled-contacts-aggregator-stream');
const getScheduledContacts = require('../../../common/lib/garagescore/contact/scheduled-contacts.js');

const _scheduledContactsIndex = function (app, req, res) {
  const contactsKeys = [];
  const recontactsKey = ScheduledContactsAggregatorStream.recontacts;
  // recontacts are return as a contact name called ScheduledContactsAggregatorStream.recontacts, hide the others
  contactsConfigs.toArray.forEach((c) => {
    if (!c.isRecontact) contactsKeys.push(c.key);
  });
  contactsKeys.push(recontactsKey);
  const contactsConfigCopie = JSON.parse(JSON.stringify(contactsConfigs));
  contactsConfigCopie[recontactsKey] = {
    name: '** TOUS LES RECONTACTS **',
    isRecontact: true,
  };
  try {
    res.render('darkbo/darkbo-emails/scheduled-contacts.nunjucks', {
      current_tab: 'current_tab',
      contactsKeys: JSON.stringify(contactsKeys),
      contactsConfigs: JSON.stringify(contactsConfigCopie),
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

const _scheduledContactsList = function (app, req, res) {
  const filters = req.query.filter ? JSON.parse(req.query.filter) : {};
  boWorkers.launch(res, (emit, done) => {
    getScheduledContacts({ filters, checkRecontact: true }, done);
  });
};

const _scheduledContactsGarages = function (app, req, res) {
  getScheduledContacts(
    {
      filters: req.query.filter ? JSON.parse(req.query.filter) : {},
      groupBy: 'garageId',
    },
    (err, scheduledContactsByGarages) => {
      app.models.Garage.find(
        {
          where: {
            id: {
              inq: Object.keys(scheduledContactsByGarages),
            },
          },
        },
        (err2, garages) => {
          res.json({
            error: err || err2 ? err.message || err.toString() || err2.message || err2.toString() : null,
            status: err ? 'ko' : 'ok',
            garages,
            scheduledContactsByGarages,
          });
        }
      );
    }
  );
};

const _scheduledContactsDatas = function (app, req, res) {
  app.models.Data.find(req.query.filter ? JSON.parse(req.query.filter) : {}, (err, datas) => {
    res.json({
      error: err ? err.message || err.toString() : null,
      status: err ? 'ko' : 'ok',
      datas,
    });
  });
};

const _forceSendScheduledByDay = async function (app, req, res) {
  const filters = req.query.filter ? JSON.parse(req.query.filter) : {};
  if (!filters.contactKey || !filters.day) {
    res.json({
      error: 'No contactKey or day',
      status: 'ko',
    });
    return;
  }
  if (filters.contactKey === ScheduledContactsAggregatorStream.recontacts) {
    try {
      await app.models.Data.campaign_sendReContactForDay(filters.day, filters.garageId);
      res.json({ status: 'ok' });
    } catch (e) {
      res.json({ error: e.message || e.toString(), status: 'ko' });
    }
  } else {
    app.models.Data.campaign_sendNextCampaignContactForDay(filters.contactKey, filters.day, filters.garageId)
      .then(() => {
        res.json({
          status: 'ok',
        });
      })
      .catch((e) => {
        res.json({
          error: e.message || e.toString(),
          status: 'ko',
        });
      });
  }
};

module.exports = {
  // /backoffice/campaign-items/scheduled-contact
  index: _scheduledContactsIndex,
  // /backoffice/campaign-items/scheduled-contact-list
  list: _scheduledContactsList,
  // /backoffice/campaign-items/scheduled-contacts-garages
  garages: _scheduledContactsGarages,
  // /backoffice/campaign-items/scheduled-contacts-campaign-items
  datas: _scheduledContactsDatas,
  // /backoffice/campaign-items/force-send-scheduled-by-day/:day
  forceSendScheduledByDay: _forceSendScheduledByDay,
};
