const app = require('../../../../server/server');
const { promisify } = require('util');
const { BANG, log } = require('../../util/log');

const dataStampCache = {};

/*
 The idea is to have a single file that we can use to register routes to monitor an app health
 */
module.exports = {
  routeName: '/quetal',

  // All quetal route should behave the same, use this controller whenever you can
  async routeController(req, res, label) {
    res.status(200).send(
      JSON.stringify({
        slug: process.env.HEROKU_SLUG_COMMIT || 'Unknown HEROKU_SLUG_COMMIT',
        dbHash: (await this.getDataStamp(label)).toString(16),
        uptime: this.getUptime(),
      })
    );
  },

  _pad(s) {
    return (s < 10 ? '0' : '') + s;
  },

  // A simple uptime of the current process
  getUptime() {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${this._pad(hours)}h${this._pad(minutes)}m${this._pad(seconds)}`;
  },

  // Get the Data count at T time, we use that to check if there is an healthy connection to the db
  async getDataStamp(label) {
    try {
      if (!dataStampCache[label] || dataStampCache[label] <= 0) {
        dataStampCache[label] = await app.models.Data.count();
      }
      return dataStampCache[label];
    } catch (e) {
      log.error(BANG, `Unable to count Data for ${label} /quetal route`);
      return -1;
    }
  },
  /**
   * [getExpectedMinMaxPerPeriod] Get the expected [min,max] over a period of time
   * @param {Number} period the period in days to compute min/max from
   * @param {[Array]} expectedPerDay array of min/max thresholds for each day starting with sunday
   * @returns {[Number, Number]} [min,max] Returns the min max computed for the period given
   */
  getExpectedMinMaxPerPeriod(period, expectedPerDay) {
    const today = new Date().getDay();
    const n = expectedPerDay.length;
    let min = 0,
      max = 0;
    for (let i = 0; i < period; i++) {
      const dayIndex = today - i - 1;
      // ((dayIndex % n) + n) % n , permet à la fonction de transformer un index negatif en index valide
      // -1 devient 6 (samedi)
      const expected = expectedPerDay[((dayIndex % n) + n) % n];
      min += expected[0];
      max += expected[1];
    }

    return [min, max];
  },
  /**
   *
   * @param {*} type lead, sent, open, targeted
   * @returns return expectedPerDay = [
   *  [8, 40], // Sunday
   *  [100, 500],
   *  [20, 150],
   *  [15, 120],
   *  [50, 300],
   *  [50, 200],
   *  [20, 80]
   * ]
   */
  async getExpectedPerDay(type) {
    try {
      const automationMonitoringSettings = await promisify(app.models.Configuration.getAutomationMonitoringSettings)();
      return Object.keys(automationMonitoringSettings[type]).map((day) => [
        automationMonitoringSettings[type][day].min,
        automationMonitoringSettings[type][day].max,
      ]);
    } catch (e) {
      log.info(BANG, `document AutomationMonitoringSettings on collection Configuration is missing: ${e.message}`);
      return [
        [8, 40], // Sunday
        [100, 500],
        [20, 150],
        [15, 120],
        [50, 300],
        [50, 200],
        [20, 80],
      ];
    }
  },

  associate: (mongoResult, allTypes) => {
    const obj = { ...allTypes };
    Object.keys(obj).forEach(target => {
      const inMongo = mongoResult.find(item => item._id === target)
      if (inMongo) {
        obj[target] = inMongo.total;
      }
    })
    return obj;
  },

  genMessageData: async (allTypesFilled, find, opt) => {
    const keysTab = Object.keys(allTypesFilled)
    const data = [];
    for (const key of keysTab) {
      if (allTypesFilled[key] === 0) {
        const [lastSendAt] = await app.models.Contact.getMongoConnector().find({ ...find, [opt]: key }, { projection: { sendDate: true } }).sort({ sendAt: -1 }).limit(1).toArray();
        data.push({ type: key, lastSendAt: lastSendAt && lastSendAt.sendDate ? lastSendAt.sendDate : 'Never' })
      }
    }
    return data;
  }
};
