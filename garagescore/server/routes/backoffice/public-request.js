const { ObjectId } = require('mongodb');
const config = require('config');
const app = require('../../server');
const { dayNumber } = require('../../../common/lib/util/time-helper');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler');
const { AutomationCampaignsEventsType, JobTypes } = require('../../../frontend/utils/enumV2');
const GarageTypes = require('../../../common/models/garage.type');

const _createAddLog = async (customer, campaign, eventType, campaignRunDay, optionnal) => {
  await app.models.AutomationCampaignsEvents.addLog(
    {
      garageId: customer.garageId,
      campaignId: campaign._id,
      customerId: customer._id,
      eventType,
      contactType: campaign.contactType,
      campaignType: campaign.type,
      target: campaign.target,
      campaignRunDay,
    },
    optionnal
  );
};

const automationCampaign = async (req, res) => {
  const campaignDuration = app.models.AutomationCampaign.campaignDuration;
  if (!req.params.customerid) {
    res.status(400).send(JSON.stringify({ error: 'No customerid' }));
    return;
  }
  if (!req.params.campaignid) {
    res.status(400).send(JSON.stringify({ error: 'No campaignid' }));
    return;
  }
  const customerId = ObjectId(req.params.customerid);
  const campaignId = ObjectId(req.params.campaignid);
  const isLead = req.params.isLead === 'isLead' || req.params.isLead === 'isLeadFromLP';
  const isLeadFromLP = req.params.isLead === 'isLeadFromLP';
  const fromMobile = req.params.fromMobile === 'true';
  const dataType = req.params.dataType;
  const todayDayNumber = dayNumber(new Date());
  // We first go for the customer
  const [customer] = await app.models.Customer.mongoFindByIds([customerId]);
  if (!customer) {
    res.status(400).json({ error: 'customerNotFound' });
    return;
  }
  // We will need to get every targeted and lead events for this customer and this campaign, to be able to determine if the customer already answered or if the campaign is over
  // if the customer is a fused one, we want to search for any ids he has, else, only its id
  let customerIds = [customer._id];
  if (customer.fusedCustomersIds && customer.fusedCustomerIds.length) {
    customerIds = [...customer.fusedCustomerIds, ...customerIds];
  }
  // We fetch the campaign and check it exists (Also will be helpful to get the campaign payload for wave 2)
  const [garage, campaign, events] = await Promise.all([
    app.models.Garage.getMongoConnector().findOne(
      { _id: customer.garageId },
      { projection: { type: 1, publicDisplayName: 1, brandNames: 1, logoDirectoryPage: 1, locale: 1, phone: 1 } }
    ),
    app.models.AutomationCampaign.getMongoConnector().findOne(
      { _id: campaignId },
      { projection: { target: true, type: true, contactType: true } }
    ),
    app.models.AutomationCampaignsEvents.getMongoConnector()
      .find({
        campaignId,
        'samples.customerId': { $in: customerIds.map((id) => ObjectId(id.toString())) },
        type: {
          $in: [
            AutomationCampaignsEventsType.LEAD,
            AutomationCampaignsEventsType.TARGETED,
            AutomationCampaignsEventsType.LANDING_OPENED_FROM_SMS,
            AutomationCampaignsEventsType.SENT,
          ],
        },
      })
      .sort({ eventDay: -1 })
      .project({ eventDay: true, campaignRunDay: true, type: true, customContentId: true })
      .toArray(),
  ]);
  if (!garage) {
    res.status(400).json({ error: 'garageNotFound' });
    return;
  }
  // We check that the campaign exists.
  if (!campaign) {
    res.status(400).json({ error: 'campaignNotFound' });
    return;
  }

  const logoUrls = garage.logoDirectoryPage || ['nologofromsrver'];
  // We now search for a targeted event that would be NOT older than campaignDuration(30 as of today) days. If we find it, the campaign isn't closed yet.
  const legitTargetedEvent = events.find((e) => {
    return e.eventDay > todayDayNumber - campaignDuration && e.type === AutomationCampaignsEventsType.TARGETED;
  });
  const legitLeadEvent = events.find(
    (e) =>
      legitTargetedEvent &&
      e.eventDay >= legitTargetedEvent.eventDay &&
      e.eventDay < legitTargetedEvent.eventDay + campaignDuration &&
      e.type === AutomationCampaignsEventsType.LEAD
  );
  const legitSentEvent = events.find((e) => {
    return (
      legitTargetedEvent &&
      e.eventDay >= legitTargetedEvent.eventDay &&
      e.eventDay < legitTargetedEvent.eventDay + campaignDuration &&
      e.type === AutomationCampaignsEventsType.SENT
    );
  });
  const customContentId = legitSentEvent && legitSentEvent.customContentId;
  const customContent = await app.models.AutomationCampaign.getCustomContentPayload(customContentId);
  const isCampaignActive = legitTargetedEvent && legitTargetedEvent.eventDay > todayDayNumber - campaignDuration;
  // if campaign is not active
  if (!isCampaignActive) {
    res.status(200).json({
      isCampaignActive,
      phone: garage.phone,
      target: campaign.target,
      brandName: garage.brandNames && garage.brandNames[0],
      logoUrls,
      garagePublicDisplayName: garage.publicDisplayName,
      customerName: customer.fullName || '',
    });
    return;
  }
  // if Targeted event not found
  if (!legitTargetedEvent) {
    res.status(200).json({
      thanks: true,
      logoUrls,
      garagePublicDisplayName: garage.publicDisplayName,
      message: 'Targeted event not found',
    });
    return;
  }
  // if Lead event is find
  if (legitLeadEvent) {
    res.status(200).json({
      thanks: true,
      logoUrls,
      garagePublicDisplayName: garage.publicDisplayName,
      message: 'Lead event already existing',
    });
    return;
  }
  // if is lead from landing page (SMS)
  if (isLeadFromLP) {
    await _createAddLog(
      customer,
      campaign,
      AutomationCampaignsEventsType.LANDING_PAGE_LEAD,
      legitTargetedEvent.campaignRunDay,
      { leadFromMobile: fromMobile }
    );
  }
  if (isLead) {
    await _createAddLog(customer, campaign, AutomationCampaignsEventsType.LEAD, legitTargetedEvent.campaignRunDay, {
      leadFromMobile: fromMobile,
      customContentId: legitSentEvent && legitSentEvent.customContentId,
    });
    await Scheduler.upsertJob(
      JobTypes.AUTOMATION_CREATE_TICKET,
      {
        customerId: customerId.toString(),
        campaignId: campaignId.toString(),
        dataType,
        campaignRunDay: legitTargetedEvent.campaignRunDay,
      },
      new Date()
    );
    res.status(200).json({
      thanks: true,
      brandName: garage.brandNames && garage.brandNames[0],
      logoUrls,
      garagePublicDisplayName: garage.publicDisplayName,
      message: 'OK!',
      customContent,
    });
  } else {
    const legitLandingEvent = events.find(
      (e) =>
        e.eventDay >= legitTargetedEvent.eventDay &&
        e.eventDay < legitTargetedEvent.eventDay + campaignDuration &&
        e.type === AutomationCampaignsEventsType.LANDING_OPENED_FROM_SMS
    );
    if (!legitLandingEvent) {
      await _createAddLog(
        customer,
        campaign,
        AutomationCampaignsEventsType.LANDING_OPENED_FROM_SMS,
        legitTargetedEvent.campaignRunDay,
        {
          leadFromMobile: fromMobile,
          customContentId: legitSentEvent && legitSentEvent.customContentId,
        }
      );
    }
    res.status(200).json({
      isCampaignActive,
      phone: garage.phone,
      target: campaign.target,
      brandName: garage.brandNames && garage.brandNames[0],
      logoUrls,
      garagePublicDisplayName: garage.publicDisplayName,
      customerName: customer.fullName || '',
      isMotorbikeDealership: garage.type === GarageTypes.MOTORBIKE_DEALERSHIP,
      customContent,
    });
  }
};

const automationCampaignRedirect = async (req, res) => {
  const campaignDuration = app.models.AutomationCampaign.campaignDuration;
  if (!req.params.customerid) {
    res.status(400).send(JSON.stringify({ error: 'No customerid' }));
    return;
  }
  if (!req.params.campaignid) {
    res.status(400).send(JSON.stringify({ error: 'No campaignid' }));
    return;
  }
  if (!req.params.customContentId) {
    res.status(400).send(JSON.stringify({ error: 'No customContentId' }));
    return;
  }
  const customerId = ObjectId(req.params.customerid);
  const campaignId = ObjectId(req.params.campaignid);
  const customContentId = ObjectId(req.params.customContentId);
  const dataType = req.params.dataType;
  const isLead = req.params.isLead === 'isLead' || req.params.isLead === 'isLeadFromLP';
  const isLeadFromLP = req.params.isLead === 'isLeadFromLP';
  const fromMobile = req.params.fromMobile === 'true';
  const todayDayNumber = dayNumber(new Date());
  // retrieve customer and campaign
  const [[customer], campaign, customContent] = await Promise.all([
    app.models.Customer.mongoFindByIds([customerId]),
    app.models.AutomationCampaign.getMongoConnector().findOne(
      { _id: campaignId },
      { projection: { target: true, type: true, contactType: true } }
    ),
    app.models.AutomationCampaign.getCustomContentPayload(customContentId),
  ]);

  if (!customer) {
    res.status(400).json({ error: 'customerNotFound' });
    return;
  }
  if (!campaign) {
    res.status(400).json({ error: 'campaignNotFound' });
    return;
  }
  // We will need to get every events for this customer and this campaign, to be able to determine if the customer already answered or if the campaign is over
  // if the customer is a fused one, we want to search for any ids he has, else, only its id
  let customerIds = [customer._id];
  if (customer.fusedCustomersIds && customer.fusedCustomerIds.length) {
    customerIds = [...customer.fusedCustomerIds, ...customerIds];
  }
  const events = await app.models.AutomationCampaignsEvents.getMongoConnector()
    .find({
      campaignId,
      'samples.customerId': { $in: customerIds.map((id) => ObjectId(id.toString())) },
      type: {
        $in: [
          AutomationCampaignsEventsType.TARGETED,
          AutomationCampaignsEventsType.LANDING_OPENED_FROM_SMS,
          AutomationCampaignsEventsType.LEAD,
        ],
      },
    })
    .sort({ eventDay: -1 })
    .project({ eventDay: 1, campaignRunDay: 1, type: 1, customContentId: 1 })
    .toArray();

  // We now search for a targeted event that would be NOT older than campaignDuration(30 as of today) days. If we find it, the campaign isn't closed yet.
  const legitTargetedEvent = events.find((e) => {
    return e.eventDay > todayDayNumber - campaignDuration && e.type === AutomationCampaignsEventsType.TARGETED;
  });
  const legitLeadEvent = events.find(
    (e) =>
      legitTargetedEvent &&
      e.eventDay >= legitTargetedEvent.eventDay &&
      e.eventDay < legitTargetedEvent.eventDay + campaignDuration &&
      e.type === AutomationCampaignsEventsType.LEAD
  );
  const legitLandingEvent = events.find(
    (e) =>
      e.eventDay >= legitTargetedEvent.eventDay &&
      e.eventDay < legitTargetedEvent.eventDay + campaignDuration &&
      e.type === AutomationCampaignsEventsType.LANDING_OPENED_FROM_SMS
  );

  const isCampaignActive = legitTargetedEvent && legitTargetedEvent.eventDay > todayDayNumber - campaignDuration;
  // if campaign is not active
  if (!isCampaignActive) {
    const url = `${config.get(
      'publicUrl.app_url'
    )}/public/automation-campaign?campaignid=${campaignId}&customerid=${customerId}&isLead=isLead`;
    res.redirect(302, url);
    return;
  }
  if (isLeadFromLP) {
    await _createAddLog(
      customer,
      campaign,
      AutomationCampaignsEventsType.LANDING_PAGE_LEAD,
      legitTargetedEvent.campaignRunDay,
      { leadFromMobile: fromMobile }
    );
  }
  if (!legitLandingEvent) {
    await _createAddLog(
      customer,
      campaign,
      AutomationCampaignsEventsType.LANDING_OPENED_FROM_SMS,
      legitTargetedEvent.campaignRunDay,
      { leadFromMobile: fromMobile, customContentId: customContentId }
    );
  }
  if (isLead && !legitLeadEvent) {
    await _createAddLog(customer, campaign, AutomationCampaignsEventsType.LEAD, legitTargetedEvent.campaignRunDay, {
      leadFromMobile: fromMobile,
      customContentId: customContentId,
    });
    await Scheduler.upsertJob(
      JobTypes.AUTOMATION_CREATE_TICKET,
      {
        customerId: customerId.toString(),
        campaignId: campaignId.toString(),
        dataType,
        campaignRunDay: legitTargetedEvent.campaignRunDay,
      },
      new Date()
    );
  }
  // redirect to custom URL
  if (!/http:\/\/|https:\/\//.test(customContent.customUrl)) {
    customContent.customUrl = 'https://' + customContent.customUrl;
  }
  if (isLeadFromLP) {
    // redirect by frontend landing page window.location
    res.json({ customUrl: customContent.customUrl });
    return;
  }
  // redirect by express
  res.redirect(302, customContent.customUrl);
};

const automationCampaignUnsubscribe = async (req, res) => {
  if (!req.params.customerid) {
    res.status(400).send(JSON.stringify({ error: 'No customerid' }));
    return;
  }
  if (!req.params.campaignid) {
    res.status(400).send(JSON.stringify({ error: 'No campaignid' }));
    return;
  }
  const customerId = ObjectId(req.params.customerid);
  const campaignId = ObjectId(req.params.campaignid);
  // We first go for the customer
  const [customer, campaign, events] = await Promise.all([
    app.models.Customer.getMongoConnector().findOne({ _id: customerId }),
    app.models.AutomationCampaign.getMongoConnector().findOne(
      { _id: campaignId },
      { projection: { target: true, type: true, contactType: true } }
    ),
    app.models.AutomationCampaignsEvents.find({
      where: {
        campaignId,
        'samples.customerId': customerId,
        or: [
          { type: AutomationCampaignsEventsType.GDPR_SENT },
          { type: AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED },
        ],
      },
    }),
  ]);
  // We fetch the garage to get its name
  const garage = await app.models.Garage.getMongoConnector().findOne(
    { _id: customer.garageId },
    { projection: { publicDisplayName: true } }
  );
  // We check that the customer exists.
  if (!customer) {
    res.status(400).json({ error: 'customerNotFound' });
    return;
  }
  // We check that the campaign exists.
  if (!campaign) {
    res.status(400).json({ error: 'campaignNotFound' });
    return;
  }
  // We check that the garage exists.
  if (!garage) {
    res.status(400).json({ error: 'garageNotFound' });
    return;
  }
  // We check that the event exists.
  if (!events.find((e) => e.type === AutomationCampaignsEventsType.GDPR_SENT)) {
    res.status(400).json({ error: 'eventNotFound' });
    return;
  }
  if (!events.find((e) => e.type === AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED)) {
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: ObjectId(customer._id.toString()) },
      { $set: { unsubscribed: true } }
    );
    await app.models.AutomationCampaignsEvents.addLog({
      garageId: customer.garageId,
      campaignId,
      customerId,
      eventType: AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED,
      contactType: campaign.contactType,
      campaignType: campaign.type,
      target: campaign.target,
      campaignRunDay: events[0].campaignRunDay,
    });
  }
  res.status(200).json({ garageName: garage.publicDisplayName, message: 'OK!' });
};

const automationCampaignNotFound = (req, res) => {
  res.status(404).end();
};

module.exports = {
  automationCampaign,
  automationCampaignUnsubscribe,
  automationCampaignNotFound,
  automationCampaignRedirect,
};
