/**
 * Automation
 */
const { ObjectID } = require('mongodb');
const timeHelper = require('../../../common/lib/util/time-helper');
const { AutomationCampaignTargets } = require('../../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../../common/models/automation-campaign-channel.type');
const { promisify } = require('util');

const _events = async function _events(app, req, res) {
  const garages = await app.models.Garage.find({
    where: { 'subscriptions.Automation.enabled': true },
    fields: { id: true, publicDisplayName: true },
  });
  res.render('darkbo/darkbo-application/automation-events.nunjucks', {
    current_tab: 'monitoring',
    garages: JSON.stringify(garages),
    campaignTargets: JSON.stringify([null, ...AutomationCampaignTargets.values()]),
    contactTypes: JSON.stringify([null, ...AutomationCampaignChannelTypes.values()]),
  });
};
const _eventsfetch = async function _eventsfetch(app, req, res) {
  try {
    const today = timeHelper.todayDayNumber();
    const { period, garage, campaignTarget, contactType } = req.query;
    const $match = {
      campaignRunDay: {
        $gt: today - period,
        $lte: today,
      },
    };
    if (garage) {
      $match.garageId = new ObjectID(garage);
    }
    if (campaignTarget || contactType) {
      const whereCampaigns = {};
      if (campaignTarget) whereCampaigns.target = campaignTarget;
      if (contactType) whereCampaigns.contactType = contactType;
      if (garage) whereCampaigns.garageId = new ObjectID(garage);
      const foundCampaignIds = await app.models.AutomationCampaign.find({ where: whereCampaigns }, { id: true });
      if (foundCampaignIds && foundCampaignIds.length) {
        $match.campaignId = { $in: foundCampaignIds.map((c) => c.id) };
      }
    }
    const $group = {
      // _id: { type: '$type', day: '$campaignRunDay' }, // version we had before
      _id: { type: '$type' },
      count: { $sum: '$nsamples' },
      countDesktop: { $sum: '$nsamplesDesktop' },
    };
    const $project = {
      type: '$_id.type',
      // day: '$_id.day', // that was here before
      count: 1,
      countDesktop: 1,
    };
    const a = [{ $match }, { $group }, { $project }];
    const events = await app.models.AutomationCampaignsEvents.getMongoConnector().aggregate(a).toArray();
    const eventsPerVersionAndType = {};
    const gdprEventsPerVersionAndType = {};
    const eventsType = {};
    const gdprEventsType = {};
    const versions = {};
    const gdprVersions = {};
    events.forEach((e) => {
      const { count, type } = e;
      if (type.indexOf('GDPR') === 0) {
        gdprEventsType[type] = true;
        gdprEventsPerVersionAndType[type] = count;
      } else {
        eventsType[type] = true;
        eventsPerVersionAndType[type] = count;
      }
    });
    const v = {
      // order
      TARGETED: 1,
      PRESSURE_BLOCKED: 2,
      UNSUBSCRIBED: 3,
      SENT: 4,
      DROPPED: 5,
      RECEIVED: 6,
      OPENED: 7,
      CLICKED: 8,
      LANDING_OPENED_FROM_SMS: 9,
      LANDING_PAGE_LEAD: 10,
      LEAD: 11,
      REACTIVE_LEAD: 12,
      WAITING_FOR_MEETING: 13, // They're not in the enum but I found them during my last visit of the page in the beta
      WAITING_FOR_PROPOSITION: 14, // They're not in the enum but I found them during my last visit of the page in the beta
      FOLLOWUP_ANSWERED: 15,
      FOLLOWUP_HAS_CALLED_BACK: 16,
      FOLLOWUP_HAS_NEW_APPOINTMENT: 17,
      WAITING_FOR_CLOSING: 18,
      CONVERTED: 19,
    };
    const v2 = {
      GDPR_SENT: 1,
      GDPR_UNSUBSCRIBED: 2,
      GDPR_OPENED: 3,
    };
    const data = {
      today,
      period,
      garage,
      counts: eventsPerVersionAndType,
      gdprCounts: gdprEventsPerVersionAndType,
      eventsType: Object.keys(eventsType).sort((aa, b) => (v[aa] || 99) - (v[b] || 99)),
      gdprEventsType: Object.keys(gdprEventsType).sort((aa, b) => (v2[aa] || 99) - (v2[b] || 99)),
      versions: Object.keys(versions).sort(),
      gdprVersions: Object.keys(gdprVersions).sort(),
    };
    res.send(JSON.stringify({ status: 'ok', data }));
  } catch (e) {
    res.send(JSON.stringify({ status: 'ko', error: e.message }));
  }
};

const _getSettings = async (app, req, res) => {
  try {
    const automationMonitoringSettings = await promisify(app.models.Configuration.getAutomationMonitoringSettings)();
    res.json(automationMonitoringSettings);
  } catch (e) {
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

const _updateSettings = async (app, req, res) => {
  try {
    const { type, day, setting } = req.body;
    const automationMonitoringSettings = await promisify(app.models.Configuration.getAutomationMonitoringSettings)();
    if (type && setting) {
      setting.min = Number(setting.min);
      setting.max = Number(setting.max);
      automationMonitoringSettings[type][`${day}`] = setting;
      await promisify(app.models.Configuration.setAutomationMonitoringSettings)(automationMonitoringSettings);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).send({ status: 'ko', error: e.message });
  }
};

module.exports = {
  events: _events,
  eventsfetch: _eventsfetch,
  getSettings: _getSettings,
  updateSettings: _updateSettings,
};
