const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');
const { ObjectID } = require('mongodb');
const { AutomationCampaignsEventsType, JobTypes } = require('../../../frontend/utils/enumV2');
const timeHelper = require('../../../common/lib/util/time-helper');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');

app.on('booted', async () => {
  try {
    const directMongoCustomer = app.models.Customer.getMongoConnector();
    const directMongoData = app.models.Data.getMongoConnector();
    let customersFixed = 0;

    const dateStart = new Date();
    const max = await directMongoCustomer.countDocuments({
      automationCampaignsEvents: { $exists: true },
      garageId: { $exists: false },
    });

    log.info(FED, `${max} customers to process. Started at ${dateStart}`);
    const interval = setInterval(
      () =>
        log.info(
          FED,
          `${Math.round((customersFixed / max) * 100)}% Done. ${
            max - customersFixed
          } customers Remaining --> ${customersFixed} customers fixed`
        ),
      5 * 1000
    ); // eslint-disable-line max-len

    // Looping through the datas and alimenting the customers
    const customers = await directMongoCustomer
      .find({ automationCampaignsEvents: { $exists: true }, garageId: { $exists: false } })
      .toArray();
    for (const customer of customers) {
      // here
      const dataIds = customer.index
        .filter((e) => e.k[0] === 'd' && e.k.length === 25)
        .map((e) => new ObjectID(e.k.slice(1, e.k.length)));
      const datas = await directMongoData.find({ _id: { $in: dataIds } }).toArray();
      datas.sort((d1, d2) => d1.createdAt.getTime() - d2.createdAt.getTime());
      for (const data of datas) {
        const addData = app.models.Customer.addData.bind(customer);
        await addData(data, { noConsolidate: true, noSave: true });
      }
      customer.createdAt = datas[0].createdAt;
      customer.updatedAt = new Date();
      customer.unsubscribed = !!customer.automationCampaignsEvents.find(
        (e) =>
          e.type === AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED ||
          e.type === AutomationCampaignsEventsType.UNSUBSCRIBED
      );
      const GDPRSentEvent = customer.automationCampaignsEvents.find(
        (e) => e.type === AutomationCampaignsEventsType.GDPR_SENT
      );
      if (GDPRSentEvent) {
        customer.hasReceivedGDPRContactAt = new Date(GDPRSentEvent.time);
      }
      customer.automationCampaignsEvents.map(async (event) => {
        const eventDay = timeHelper.dayNumber(new Date(event.time));
        const dateDifference = timeHelper.todayDayNumber() - eventDay;
        if (
          event.type === AutomationCampaignsEventsType.SENT &&
          dateDifference < app.models.AutomationCampaign.campaignDuration
        ) {
          if (!customer.hasRecentlyBeenContacted) {
            customer.hasRecentlyBeenContacted = {};
          }
          customer.hasRecentlyBeenContacted[event.campaignType] = new Date(event.time);
          await Scheduler.upsertJob(
            JobTypes.AUTOMATION_RESET_PRESSURE,
            {
              customerId: customer._id.toString(),
              campaignType: event.campaignType,
            },
            timeHelper.dayNumberToDate(eventDay + app.models.AutomationCampaign.campaignDuration)
          );
        }
      });
      await app.models.Customer.consolidate(customer);
      await directMongoCustomer.update({ _id: customer._id }, customer);
      customersFixed++;
    }
    clearInterval(interval);
    log.info(
      FED,
      `100% Done : 0 customers Remaining --> ${customersFixed} customers fixed. Started at ${dateStart}.Ended at ${new Date()}`
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
