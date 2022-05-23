const TestApp = require('../../../common/lib/test/test-app');
/* eslint-disable no-unused-expressions */
const app = new TestApp();
const chai = require('chai');
const ShortUrlStatus = require('../../../common/models/short-url.status');
const config = require('config');
const timeHelper = require('../../../common/lib/util/time-helper');
const shortUrlRefresh = require('../../../workers/jobs/scripts/short-url-refresh');

const expect = chai.expect;
let shortUrlBase = '';

describe('Test ShortUrl', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    shortUrlBase = config.get('shortUrl.baseUrl');
  });
  it('Generate a set of 200000 token and they must be different', async () => {
    const objectRes = {};
    for (let i = 0; i < 200000; i++) {
      const token = app.models.ShortUrl.generateKey();
      expect(token.length <= 9).to.equal(true);
      expect(!!objectRes[token]).to.equal(false);
      objectRes[token] = true;
    }
  });
  it('Init DB with app.models.ShortUrl.REFILL_AMOUNT free urls', async () => {
    let amountUrls = await app.models.ShortUrl.count();
    expect(amountUrls).to.be.equal(0);
    await app.models.ShortUrl.refill();
    amountUrls = await app.models.ShortUrl.count();
    expect(amountUrls).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT);
  });
  it('Init DB with app.models.ShortUrl.REFILL_AMOUNT free urls, then fill it again', async () => {
    let amountUrls = await app.models.ShortUrl.count();
    expect(amountUrls).to.be.equal(0);
    await app.models.ShortUrl.refill();
    amountUrls = await app.models.ShortUrl.count();
    expect(amountUrls).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT);
    await app.models.ShortUrl.refill();
    amountUrls = await app.models.ShortUrl.count();
    expect(amountUrls).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT * 2);
  });
  it('Init DB with app.models.ShortUrl.REFILL_AMOUNT, then create a short url', async () => {
    let amountUrlsAvailable = await app.models.ShortUrl.count();
    expect(amountUrlsAvailable).to.be.equal(0);
    await app.models.ShortUrl.refill();
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT);
    const newShortUrl = await app.models.ShortUrl.getShortUrl('testurl');
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT - 1);
    const amountUrlsUsed = await app.models.ShortUrl.count({ status: ShortUrlStatus.USED });
    expect(amountUrlsUsed).to.be.equal(1);
    expect(newShortUrl.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrl.expirationDayNumber).to.be.equal(0);
    expect(newShortUrl.url).to.be.equal(shortUrlBase + newShortUrl.key);
    expect(newShortUrl.redirectLocation).to.be.equal('testurl');
  });
  it('Init DB with app.models.ShortUrl.REFILL_AMOUNT, then create a short url with expiration date, trigger reset short url used command', async () => {
    const todayDayNumber = timeHelper.dayNumber(new Date());
    let amountUrlsAvailable = await app.models.ShortUrl.count();
    expect(amountUrlsAvailable).to.be.equal(0);
    await app.models.ShortUrl.refill();
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT);
    const newShortUrl = await app.models.ShortUrl.getShortUrl('testurl', 0);
    const newShortUrlEarlier = await app.models.ShortUrl.getShortUrl('testurl', -1);
    let newShortUrlLater = await app.models.ShortUrl.getShortUrl('testurl', 1);
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT - 3);
    const amountUrlsUsed = await app.models.ShortUrl.count({ status: ShortUrlStatus.USED });
    expect(amountUrlsUsed).to.be.equal(3);
    expect(newShortUrl.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrl.expirationDayNumber).to.be.equal(todayDayNumber);
    expect(newShortUrl.url).to.be.equal(shortUrlBase + newShortUrl.key);
    expect(newShortUrl.redirectLocation).to.be.equal('testurl');
    expect(newShortUrlEarlier.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrlEarlier.expirationDayNumber).to.be.equal(todayDayNumber - 1);
    expect(newShortUrlEarlier.url).to.be.equal(shortUrlBase + newShortUrlEarlier.key);
    expect(newShortUrlEarlier.redirectLocation).to.be.equal('testurl');
    expect(newShortUrlLater.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrlLater.expirationDayNumber).to.be.equal(todayDayNumber + 1);
    expect(newShortUrlLater.url).to.be.equal(shortUrlBase + newShortUrlLater.key);
    expect(newShortUrlLater.redirectLocation).to.be.equal('testurl');
    await app.models.ShortUrl.clean(timeHelper.dayNumber(new Date()));
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT - 1);
    newShortUrlLater = await app.models.ShortUrl.findById(newShortUrlLater.getId());
    expect(newShortUrlLater.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrlLater.expirationDayNumber).to.be.equal(todayDayNumber + 1);
    expect(newShortUrlLater.url).to.be.equal(shortUrlBase + newShortUrlLater.key);
    expect(newShortUrlLater.redirectLocation).to.be.equal('testurl');
  });
  it('Init DB with app.models.ShortUrl.REFILL_AMOUNT, then create a short url with expiration date, trigger reset and fill with cron', async () => {
    const todayDayNumber = timeHelper.dayNumber(new Date());
    let amountUrlsAvailable = await app.models.ShortUrl.count();
    expect(amountUrlsAvailable).to.be.equal(0);
    await app.models.ShortUrl.refill();
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT);
    const newShortUrl = await app.models.ShortUrl.getShortUrl('testurl', 0);
    const newShortUrlEarlier = await app.models.ShortUrl.getShortUrl('testurl', -1);
    let newShortUrlLater = await app.models.ShortUrl.getShortUrl('testurl', 1);
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(app.models.ShortUrl.REFILL_AMOUNT - 3);
    const amountUrlsUsed = await app.models.ShortUrl.count({ status: ShortUrlStatus.USED });
    expect(amountUrlsUsed).to.be.equal(3);
    expect(newShortUrl.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrl.expirationDayNumber).to.be.equal(todayDayNumber);
    expect(newShortUrl.url).to.be.equal(shortUrlBase + newShortUrl.key);
    expect(newShortUrl.redirectLocation).to.be.equal('testurl');
    expect(newShortUrlEarlier.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrlEarlier.expirationDayNumber).to.be.equal(todayDayNumber - 1);
    expect(newShortUrlEarlier.url).to.be.equal(shortUrlBase + newShortUrlEarlier.key);
    expect(newShortUrlEarlier.redirectLocation).to.be.equal('testurl');
    expect(newShortUrlLater.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrlLater.expirationDayNumber).to.be.equal(todayDayNumber + 1);
    expect(newShortUrlLater.url).to.be.equal(shortUrlBase + newShortUrlLater.key);
    expect(newShortUrlLater.redirectLocation).to.be.equal('testurl');
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    await shortUrlRefresh();
    amountUrlsAvailable = await app.models.ShortUrl.count({ status: ShortUrlStatus.AVAILABLE });
    expect(amountUrlsAvailable).to.be.equal(2 * app.models.ShortUrl.REFILL_AMOUNT - 1);
    newShortUrlLater = await app.models.ShortUrl.findById(newShortUrlLater.getId());
    expect(newShortUrlLater.status).to.be.equal(ShortUrlStatus.USED);
    expect(newShortUrlLater.expirationDayNumber).to.be.equal(todayDayNumber + 1);
    expect(newShortUrlLater.url).to.be.equal(shortUrlBase + newShortUrlLater.key);
    expect(newShortUrlLater.redirectLocation).to.be.equal('testurl');
  });
});
