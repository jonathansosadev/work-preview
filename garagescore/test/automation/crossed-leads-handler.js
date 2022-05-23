const chai = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const { todayDayNumber } = require('../../common/lib/util/time-helper');
const {
  TicketActionNames,
  AutomationCampaignsEventsType,
  AutomationCampaignTargets,
} = require('../../frontend/utils/enumV2');
const DataTypes = require('../../common/models/data/type/data-types');
const SourceTypes = require('../../common/models/data/type/source-types');
const TicketStatus = require('../../common/models/data/type/lead-ticket-status.js');
const AutomationCrossLeadsHandler = require('../../common/lib/garagescore/automation/automation-crossed-leads-handler');
const AutomationCampaign = require('../../common/models/automation-campaign.type');
const { createCampaign } = require('./common/_utils');

const expect = chai.expect;
const app = new TestApp();

const createDefaultData = async (campaignType, dayToBillingDay, campaignRunDay, eventDay) => {
  const garage = await app.addGarage({ locale: 'fr_FR' });
  await createCampaign(app, garage, AutomationCampaignTargets.M_M);
  const campaign = await app.models.AutomationCampaign.findOne();
  await app.models.Customer.create({
    garageId: ObjectId(garage.id.toString()),
    phone: '+34610336580',
    status: 'New',
    emailList: [],
    phoneList: ['+34610336580'],
    unsubscribed: false,
    automationCampaigns: [
      {
        campaignId: ObjectId(campaign.id.toString()),
        campaignType: campaignType,
        campaignRunDay: campaignRunDay,
        garageId: ObjectId(garage.id.toString()),
        isMobile: true,
        target: AutomationCampaignTargets.M_M,
        targetedDay: campaignRunDay,
        gdprSentDay: campaignRunDay,
        gdprOpenedDay: campaignRunDay,
        sentDay: eventDay,
        receivedDay: eventDay,
        openedDay: eventDay,
        convertedDay: eventDay,
        crossedDay: eventDay,
        billingDay: eventDay,
        billingDataId: ObjectId('609ce03b7ff81600031c9158'),
        crossed: false,
        ...dayToBillingDay,
      },
    ],
    automationCampaignsEvents: [
      {
        _id: ObjectId('608fcb9af6c1eacffe4b47b0'),
        campaignId: ObjectId(campaign.id.toString()),
        campaignRunDay: campaignRunDay,
        campaignType: campaignType,
        eventDay: eventDay,
        garageId: ObjectId('6061f76b302aae00033f64a3'),
        type: 'TARGETED',
        target: AutomationCampaignTargets.M_M,
        time: 1620036506979.0,
        isMobile: true,
        leadFromMobile: null,
        convertedFromCockpit: null,
      },
      {
        _id: ObjectId('609d93aaf6c1eacffef215d3'),
        campaignId: ObjectId(campaign.id.toString()),
        campaignRunDay: campaignRunDay,
        campaignType: campaignType,
        eventDay: eventDay,
        garageId: ObjectId('6061f76b302aae00033f64a3'),
        target: AutomationCampaignTargets.M_M,
        type: 'CONVERTED',
        time: 1620259200000.0,
        isMobile: true,
        leadFromMobile: null,
        convertedFromCockpit: null,
      },
    ],
  });
  const customer = await app.models.Customer.getMongoConnector().findOne();
  await app.models.Data.create({
    garageId: garage.id.toString(),
    type: 'Maintenance',
    garageType: 'Dealership',
    leadTicket: {
      createdAt: new Date(),
      status: 'WaitingForContact',
      actions: [
        {
          name: 'leadStarted',
          createdAt: new Date(),
          assignerUserId: null,
          comment: '',
          isManual: false,
        },
        {
          name: 'incomingEmail',
          createdAt: new Date(),
          sourceType: 'maisonClose',
          email: 'maison@close.fr',
          lastName: 'Jo',
          message: 'Jo le bricoleur',
        },
      ],
    },
    source: { type: SourceTypes.AUTOMATION },
    automation: {
      customerId: ObjectId(customer._id.toString()),
      campaignId: ObjectId(campaign.id.toString()),
      campaignRunDay: campaignRunDay,
    },
  });
};
describe('Automation Crossed Leads Handler', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Should Reopened LeadTickets That Were Automatically Closed Before', async function () {
    const garage = await app.addGarage();

    await app.models.Data.getMongoConnector().insertMany([
      {
        garageId: garage.getId().toString(),
        type: DataTypes.MAINTENANCE,
        leadTicket: {
          createdAt: new Date(),
          status: TicketStatus.CLOSED_WITH_SALE,
          actions: [
            {
              name: TicketActionNames.LEAD_CLOSED,
              automaticClose: true,
            },
          ],
        },
        source: {
          type: SourceTypes.AUTOMATION,
        },
      },
      {
        garageId: garage.getId().toString(),
        type: DataTypes.MAINTENANCE,
        leadTicket: {
          createdAt: new Date(),
          status: TicketStatus.CLOSED_WITH_SALE,
          actions: [
            {
              name: TicketActionNames.LEAD_CLOSED,
              automaticClose: false,
            },
          ],
        },
        source: {
          type: SourceTypes.AUTOMATION,
        },
      },
    ]);

    const reopenedTickets = await AutomationCrossLeadsHandler._reopenAutomaticallyClosedLeadTickets();

    expect(reopenedTickets.length).to.equals(1);
  });

  it('Should create event CROSSED APV because openedDayToBillingDay > CROSSED_DELAY_APV', async () => {
    const campaignRunDay = todayDayNumber() - 10;
    const eventDay = todayDayNumber();
    await createDefaultData(
      AutomationCampaign.AUTOMATION_MAINTENANCE,
      { openedDayToBillingDay: app.models.Customer.CROSSED_DELAY_APV + 1 },
      campaignRunDay,
      eventDay
    );
    await AutomationCrossLeadsHandler.generateConvertedAndCrossedEvents();
    // no events was create
    const expectEvent = await app.models.AutomationCampaignsEvents.find({});
    expect(expectEvent.length).equals(0);
  });
  it('Should create an event CROSSED APV and close leadTicket if openedDayToBillingDay < CROSSED_DELAY_APV', async () => {
    const campaignRunDay = todayDayNumber() - 10;
    const eventDay = todayDayNumber();
    await createDefaultData(
      AutomationCampaign.AUTOMATION_MAINTENANCE,
      { openedDayToBillingDay: app.models.Customer.CROSSED_DELAY_APV - 1 },
      campaignRunDay,
      eventDay
    );
    await AutomationCrossLeadsHandler.generateConvertedAndCrossedEvents();

    const expectEvent = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
      type: AutomationCampaignsEventsType.CROSSED,
    });
    const data = await app.models.Data.getMongoConnector().findOne({});
    const expectAction = data.leadTicket.actions.find(({ name }) => name === TicketActionNames.LEAD_CLOSED);

    expect(expectEvent.type).equals(AutomationCampaignsEventsType.CROSSED);
    expect(expectEvent.samples.length).equals(1);
    expect(expectAction.name).equals(TicketActionNames.LEAD_CLOSED);
  });

  it('Should not create an event CROSSED APV and close leadTicket if the delay expired', async () => {
    const campaignRunDay = todayDayNumber() - (app.models.Customer.CROSSED_DELAY_APV + 1);
    const eventDay = todayDayNumber();
    await createDefaultData(
      AutomationCampaign.AUTOMATION_MAINTENANCE,
      { openedDayToBillingDay: app.models.Customer.CROSSED_DELAY_APV - 1 },
      campaignRunDay,
      eventDay
    );
    await AutomationCrossLeadsHandler.generateConvertedAndCrossedEvents();

    const expectEvent = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
      type: AutomationCampaignsEventsType.CROSSED,
    });

    expect(expectEvent).equals(null);
  });

  it('Should not event CROSSED Sales if leadDayToBillingDay > CROSSED_DELAY_SALE', async () => {
    const campaignRunDay = todayDayNumber() - 10;
    const eventDay = todayDayNumber();
    await createDefaultData(
      AutomationCampaign.AUTOMATION_VEHICLE_SALE,
      { leadDayToBillingDay: app.models.Customer.CROSSED_DELAY_SALE + 1 },
      campaignRunDay,
      eventDay
    );
    await AutomationCrossLeadsHandler.generateConvertedAndCrossedEvents();

    const expectEvent = await app.models.AutomationCampaignsEvents.find({});
    // no events was create
    expect(expectEvent.length).equals(0);
  });
  it('Should create an event CROSSED Sales, close LeadTIcket if leadDayToBillingDay < CROSSED_DELAY_SALE', async () => {
    const campaignRunDay = todayDayNumber() - 10;
    const eventDay = todayDayNumber();
    await createDefaultData(
      AutomationCampaign.AUTOMATION_VEHICLE_SALE,
      { leadDay: eventDay, leadDayToBillingDay: app.models.Customer.CROSSED_DELAY_SALE - 1 },
      campaignRunDay,
      eventDay
    );
    await AutomationCrossLeadsHandler.generateConvertedAndCrossedEvents();

    const expectEvent = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
      type: AutomationCampaignsEventsType.CROSSED,
    });
    const data = await app.models.Data.getMongoConnector().findOne({});
    const expectAction = data.leadTicket.actions.find(({ name }) => name === TicketActionNames.LEAD_CLOSED);

    expect(expectEvent.type).equals(AutomationCampaignsEventsType.CROSSED);
    expect(expectEvent.samples.length).equals(1);
    expect(expectAction.name).equals(TicketActionNames.LEAD_CLOSED);
  });
  it('Should not create event CROSSED Sales if the delay expired', async () => {
    const campaignRunDay = todayDayNumber() - (app.models.Customer.CROSSED_DELAY_SALE + 1);
    const eventDay = todayDayNumber();
    await createDefaultData(
      AutomationCampaign.AUTOMATION_VEHICLE_SALE,
      { leadDay: eventDay, leadDayToBillingDay: app.models.Customer.CROSSED_DELAY_SALE - 1 },
      campaignRunDay,
      eventDay
    );
    await AutomationCrossLeadsHandler.generateConvertedAndCrossedEvents();

    const expectEvent = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
      type: AutomationCampaignsEventsType.CROSSED,
    });
    expect(expectEvent).equals(null);
  });
});
