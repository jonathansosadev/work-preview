const config = require('config');
const debug = require('debug')('garagescore:common:models:short-url'); // eslint-disable-line max-len,no-unused-vars
const ShortUrlStatus = require('./short-url.status');
const timeHelper = require('../lib/util/time-helper');
const slackClient = require('../lib/slack/client');

module.exports = function ShortUrlDefinition(ShortUrl) {
  ShortUrl.REFILL_AMOUNT = 1000;
  ShortUrl.generateKey = function generateKey() {
    let millis = parseInt(process.hrtime().join(''), 10);
    const orderedDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let token = '';
    while (millis > 0) {
      const quotient = Math.floor(millis / orderedDigits.length);
      const remainder = millis % orderedDigits.length;
      token += orderedDigits[remainder];
      millis = quotient;
    }
    return token;
  };
  ShortUrl.getShortUrl = async function getShortUrl(baseUrl, expirationDaysLater) {
    const expirationDayNumber =
      expirationDaysLater || expirationDaysLater === 0 ? timeHelper.dayNumber(new Date()) + expirationDaysLater : 0;
    const directMongoShortUrl = ShortUrl.getMongoConnector();
    let url = await directMongoShortUrl.findOneAndUpdate(
      { status: ShortUrlStatus.AVAILABLE },
      { $set: { status: ShortUrlStatus.USED } },
      { returnOriginal: false }
    );
    if (!url || !url.value) {
      console.error('No short urls available, we need to reload. This will add some time.');
      await ShortUrl.refill();
      url = await directMongoShortUrl.findOneAndUpdate(
        { status: ShortUrlStatus.AVAILABLE },
        { $set: { status: ShortUrlStatus.USED } },
        { returnOriginal: false }
      );
      if (!url) {
        throw new Error(
          "Short Urls : getShortUrl : We can't find an available URL after a refill, this is very abnormal."
        );
      }
    }
    url = url.value;
    const shortUrlBase = config.get('shortUrl.baseUrl');
    const sep = shortUrlBase[shortUrlBase.length - 1] === '/' ? '' : '?';
    return ShortUrl.findByIdAndUpdateAttributes(url._id, {
      expirationDayNumber,
      url: shortUrlBase + sep + url.key,
      redirectLocation: baseUrl,
    });
  };
  ShortUrl.clean = async function clean(expirationDayNumber) {
    const connector = ShortUrl.getMongoConnector();
    await connector.updateMany(
      {
        expirationDayNumber: { $gt: 0, $lte: expirationDayNumber || 0 },
      },
      {
        $set: {
          status: ShortUrlStatus.AVAILABLE,
          expirationDayNumber: 0,
          url: '',
          redirectLocation: '',
        },
      }
    );
  };
  ShortUrl.slackAlert = async function slackAlert(message) {
    try {
      await new Promise((res, rej) =>
        slackClient.postMessage(
          {
            text: message,
            channel: '#çavapas',
            username: 'Petit-Lien',
          },
          (e) => (e ? rej(e) : res())
        )
      );
    } catch (e) {
      console.error(e);
    }
  };
  ShortUrl.refill = async function refill() {
    let newUrls = [];
    let tries = 0;
    // While we don't have the necessary amount of clean url keys, we loop
    while (newUrls.length < ShortUrl.REFILL_AMOUNT) {
      tries++;
      if (tries === 3) {
        await ShortUrl.slackAlert(`Trois essais pour générer ${newUrls.length}/1000 shortUrls, on commence à saturer.`);
      }
      if (tries === 4) {
        await ShortUrl.slackAlert(`Quatre essais pour générer ${newUrls.length}/1000 shortUrls, il faut agir.`);
      }
      if (tries === 5) {
        throw new Error('Too many tries to generate 1000 shortUrls, aborting.');
      }
      const tempNewUrls = [];
      // We generate 1.5 times the amount of keys to make as less possible requests to the bdd as possible
      while (tempNewUrls.length < ShortUrl.REFILL_AMOUNT * 1.5) {
        tempNewUrls.push(ShortUrl.generateKey());
      }
      // We check for doubles in the bdd (We don't want a duplicated key)
      const doubles = await ShortUrl.find({
        where: {
          key: { inq: tempNewUrls },
        },
        fields: { key: true },
      });
      // We remove the doubles from our generated keys array
      tempNewUrls.filter((e) => !doubles.find((d) => d.key === e));
      // We add the clean new keys to the newUrls array
      newUrls = [...newUrls, ...tempNewUrls];
    }
    // We do not want to add more than REFILL_AMOUNT (Why not though ?)
    newUrls.length = Math.min(newUrls.length, ShortUrl.REFILL_AMOUNT);
    // We transform the keys into shortUrls items, and we bulkwrite
    newUrls = newUrls.map((e) => ({ insertOne: { document: { key: e, status: ShortUrlStatus.AVAILABLE } } }));
    const connector = ShortUrl.getMongoConnector();
    await connector.bulkWrite(newUrls);
  };

  ShortUrl.findByKey = function findByKey(key, callback) {
    // eslint-disable-line no-param-reassign
    return ShortUrl.findOne({ where: { key } }, callback);
  };
};
