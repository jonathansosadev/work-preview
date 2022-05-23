const app = require('../../../server/server');
const AutomationCampaignChannelTypes = require('../../../common/models/automation-campaign-channel.type');
const ContactService = require('../../../common/lib/garagescore/contact/service');
const { AutomationCampaignsEventsType, ContactTypes, JobTypes } = require('../../../frontend/utils/enumV2');
const { ObjectId } = require('mongodb');
const config = require('config');
const { decodePhone } = require('../../../common/lib/garagescore/cross-leads/util');
const GarageTypes = require('../../../common/models/garage.type');
const timeHelper = require('../../../common/lib/util/time-helper');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');

// add event on collection AutomationCampaignsEvents
const _createEventLog = async (job, campaignType, eventType) => {
  await app.models.AutomationCampaignsEvents.addLog({
    garageId: job.payload.garageId,
    campaignId: job.payload.campaignId,
    customerId: job.payload.customerId,
    eventType,
    contactType: job.payload.contactType,
    campaignType,
    target: job.payload.target,
    campaignRunDay: job.payload.campaignRunDay,
  });
};

const _getCustomer = async (job, customerId, campaignType) => {
  const [customer] = await app.models.Customer.mongoFindByIds([ObjectId(customerId)]);
  if (!customerId || !customer) {
    const err = !customer ? 'customer not found' : 'no customerId';
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    throw new Error(`automation-send-contact-to-customer :: ${err} in ${JSON.stringify(job)}`);
  }
  return customer;
};

const _getGarage = async (job, garageId, campaignType) => {
  const garage = await app.models.Garage.getMongoConnector().findOne(
    { _id: ObjectId(garageId) },
    { projection: { _id: 1, type: 1, publicDisplayName: 1, locale: 1, timezone: 1, logoEmail: 1, brandNames: 1 } }
  );
  if (!garageId || !garage) {
    const err = !garage ? 'garage not found' : 'no garageId';
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    throw new Error(`automation-send-contact-to-customer :: ${err} in ${JSON.stringify(job)}`);
  }
  return garage;
};

const _getCampaignAutomation = async (job, campaignId, campaignType) => {
  const campaign = await app.models.AutomationCampaign.getMongoConnector().findOne(
    { _id: ObjectId(campaignId) },
    { projection: { target: true, type: true, customContentId: true } }
  );

  if (!campaignId) {
    throw new Error(`automation-send-contact-to-customer :: no campaignId in ${JSON.stringify(job)}`);
  }
  if (!campaign) {
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    throw new Error(`automation-send-contact-to-customer :: campaign not found in ${JSON.stringify(job)}`);
  }
  if (campaignType !== campaign.type || !campaignType) {
    const err = !campaignType
      ? 'no campaignType'
      : `campaignType changed ? Payload Campaign type: ${campaignType}, Campaign type: ${campaign.type}`;
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    throw new Error(`automation-send-contact-to-customer :: ${err}`);
  }
  return campaign;
};

const _getContactTo = async (job, customer, contactType, contactTypeList) => {
  const blackListField = `${contactType}BlackList`;
  // check for blacklist entries
  const blackListItems = await app.models.BlackListItem.getMongoConnector()
    .find({ to: { $in: customer[contactTypeList] } })
    .project({ to: true })
    .toArray();
  const blacklistedItems = blackListItems.map((e) => e.to);
  const invalidContactList = customer[contactTypeList].filter((contact) => {
    try {
      if (contactTypeList === 'emailList') return !/@/.test(contact);
      if (contactTypeList === 'phoneList') return !decodePhone(contact);
    } catch (err) {
      return contact;
    }
  });

  if (blacklistedItems.length || invalidContactList.length) {
    const newContactList = customer[contactTypeList].filter((e) => {
      return ![...blacklistedItems, ...invalidContactList].includes(e);
    });
    const { modifications } = await app.models.Customer.consolidate(customer);
    await app.models.Customer.getMongoConnector().updateOne(
      { _id: customer._id || customer.getId() },
      {
        $set: {
          ...modifications,
          [contactTypeList]: newContactList,
          [contactType]: newContactList[0] || null,
          [blackListField]: [...new Set([...(customer[blackListField] || []), ...blacklistedItems])],
        },
      }
    );
    return newContactList[0];
  }

  return customer[contactType];
};

const _checkPressure = async (customer, job, campaignType, today, delayedBySmsDays, campaignDuration) => {
  if (!customer.hasRecentlyBeenContacted || !customer.hasRecentlyBeenContacted[campaignType]) {
    return;
  }
  // if customer receive a campaign recently (less 30 day), he is under pressure otherwise he can receive another campaign
  // if we check the date, may be we can delete the job type AUTOMATION_RESET_PRESSURE
  const todayDayNumber = timeHelper.todayDayNumber();
  const recentlyBeenContacted = timeHelper.dayNumber(customer.hasRecentlyBeenContacted[campaignType]);
  if (todayDayNumber - recentlyBeenContacted > campaignDuration) {
    return;
  }
  // If the job is an sms job, and the contact triggering the pressure is very recent (less than 3 days), we postpone the sms sending job to have a backup for a failed email send
  const recentlyContactedDate = new Date(customer.hasRecentlyBeenContacted[campaignType]);
  const isMobile = job.payload.contactType === AutomationCampaignChannelTypes.MOBILE;
  const isRecent = (today.getTime() - recentlyContactedDate.getTime()) / (1000 * 3600 * 24) < delayedBySmsDays;
  if (isMobile && isRecent) {
    await Scheduler.upsertJob(
      JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      Object.assign({ delayedBySmsChecking: true }, job.payload),
      new Date(today.getTime() + 1000 * 3600 * 24 * delayedBySmsDays)
    );
    // Sms job, email has surely triggered right before, we want to be able to send an sms if the email dropped so we try again in a few days (delayedBySmsDays)
    return AutomationCampaignsEventsType.DELAYED_BY_SMS_CHECKING;
  }
  // Customer has been blocked by the pressure, he can't receive too many campaigns on a limited timespan
  return AutomationCampaignsEventsType.PRESSURE_BLOCKED;
};

const _createShortUrl = async (langage, job, isGrpd, campaignDuration) => {
  const { campaignId, customerId } = job.payload;

  if (!isGrpd) {
    const url =
      config.get('publicUrl.app_url') +
      '/public/automation-campaign?campaignid=' +
      campaignId +
      '&customerid=' +
      customerId;
    const shortUrl = await app.models.ShortUrl.getShortUrl(url, campaignDuration);
    return shortUrl.url;
  }
  // create short url for unsubscribe when the garage is not french
  if (langage === 'fr_FR') {
    return null;
  }
  const url =
    config.get('publicUrl.app_url') +
    `/public/automation-campaign/unsubscribe?customerid=${customerId}&campaignid=${campaignId}`;
  const shortUrl = await app.models.ShortUrl.getShortUrl(url, campaignDuration);
  // remove http://gsco.re/xExvVmAp -> gsco.re/xExvVmAp
  return shortUrl.url.replace(/http:\/\/|https:\/\//g, '');
};

const _sendGdpr = async (customer, garage, campaign, job, contactTo, campaignDuration) => {
  const { garageId, customerId, campaignId, campaignType } = job.payload;
  const unsubscribeUrl = `${config.get('publicUrl.app_url')}/public/automation-campaign/unsubscribe?customerid=${
    job.payload.customerId
  }&campaignid=${job.payload.campaignId}`;

  let GDPRSendAt = new Date();
  if (!job.payload.sendGDPRInstantly) {
    GDPRSendAt.setDate(GDPRSendAt.getDate() + 1);
    GDPRSendAt.setHours(1);
  }
  let contactType = 'email';
  let GDPRtype = ContactTypes.AUTOMATION_GDPR_EMAIL;
  let GDPRsender = garage.publicDisplayName;
  if (job.payload.contactType === AutomationCampaignChannelTypes.MOBILE) {
    contactType = 'phone';
    GDPRtype = ContactTypes.AUTOMATION_GDPR_SMS;
    GDPRsender = garage.brandNames[0] || garage.publicDisplayName.slice(0, 11);
  }
  // we need short URL for unsubscribed RGPD when phone number is not FR
  const shortUrlRgpd = await _createShortUrl(garage.locale, job, true, campaignDuration);

  const contactData = {
    to: contactTo,
    recipient: customer.fullName || contactTo,
    from: 'oo@custeed.com',
    sender: GDPRsender,
    type: GDPRtype,
    sendAt: GDPRSendAt,
    payload: {
      garageId,
      customerId,
      campaignId,
      customerName: customer.fullName,
      garagePublicDisplayName: garage.publicDisplayName,
      garageLocale: garage.locale,
      garageTimezone: garage.timezone,
      unsubscribeUrl,
      logoUrl: garage.logoEmail && garage.logoEmail[0],
      campaignType: campaign.type,
      target: campaign.target,
      campaignRunDay: job.payload.campaignRunDay,
      shortUrl: shortUrlRgpd,
    },
  };
  // send GDPR
  await new Promise((res, rej) =>
    ContactService.prepareForSend(contactData, async (e) => {
      if (e) {
        await Scheduler.upsertJob(
          JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER,
          { customerId: customerId.toString() },
          new Date()
        );
        await updateCustomerContact(customer._id, contactType, contactTo);
        await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
        rej(e);
      }
      res();
    })
  );
  const receivedGdprAt = new Date();
  await app.models.Customer.findByIdAndUpdateAttributes(customer._id, { hasReceivedGDPRContactAt: receivedGdprAt });
  return receivedGdprAt;
};

const updateCustomerContact = async (customerId, contactType, contactTo) => {
  const customer = await app.models.Customer.getMongoConnector().findOne({ _id: customerId });
  const contactTypeList = `${contactType}List`;
  const blackListField = `${contactType}BlackList`;
  customer[contactTypeList] = customer[contactTypeList].filter((contact) => contact !== contactTo);
  return app.models.Customer.getMongoConnector().updateOne(
    { _id: customerId },
    {
      $set: {
        [contactType]: customer[contactTypeList][0] || null,
        [contactTypeList]: customer[contactTypeList],
      },
      $push: {
        [blackListField]: contactTo,
      },
    }
  );
};

const _sendContactToCustomer = async (customer, campaign, garage, contactTo, job) => {
  const { garageId, customerId, campaignId, campaignType } = job.payload;
  let contactType = 'email';
  let type = ContactTypes.AUTOMATION_CAMPAIGN_EMAIL;
  let sender = garage.publicDisplayName;
  let shortUrl = null;
  if (job.payload.contactType === AutomationCampaignChannelTypes.MOBILE) {
    contactType = 'phone';
    type = ContactTypes.AUTOMATION_CAMPAIGN_SMS;
    sender = garage.brandNames[0] || sender.substring(0, 11);
    shortUrl = await _createShortUrl(garage.locale, job, false);
  }

  const customContent = await app.models.AutomationCampaign.getCustomContentPayload(campaign.customContentId);
  const contactData = {
    to: contactTo,
    recipient: customer.fullName || contactTo,
    from: 'am@custeed.com',
    sender,
    type,
    payload: {
      garageId,
      campaignId,
      customerId,
      customerName: customer.fullName,
      garagePublicDisplayName: garage.publicDisplayName,
      garageLocale: garage.locale,
      garageTimezone: garage.timezone,
      target: campaign.target,
      campaignType: campaign.type,
      shortUrl,
      logoUrl: garage.logoEmail && garage.logoEmail[0],
      brandName: garage.brandNames && garage.brandNames[0],
      campaignRunDay: job.payload.campaignRunDay,
      customContent,
      isMotorbikeDealership: garage.type === GarageTypes.MOTORBIKE_DEALERSHIP,
    },
  };
  const isSend = await new Promise((res, rej) =>
    ContactService.prepareForSend(contactData, async (e) => {
      if (e) {
        await updateCustomerContact(customer._id, contactType, contactTo);
        await Scheduler.upsertJob(
          JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER,
          { customerId: customerId.toString() },
          new Date()
        );
        await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
        rej(e);
      }
      res(true);
    })
  );

  const key = `hasRecentlyBeenContacted.${campaignType}`;
  const result = await app.models.Customer.findByIdAndUpdateAttributes(customer._id, { [key]: new Date() });
  return !!result && isSend;
};

module.exports = async (job) => {
  const GDPRDelayDay = 3;
  const delayedBySmsDays = 1;
  const today = new Date();
  const contactType = job.payload.contactType === AutomationCampaignChannelTypes.MOBILE ? 'phone' : 'email';
  const contactTypeList = `${contactType}List`;
  const { customerId, campaignId, garageId, campaignType } = job.payload;
  const campaignDuration = app.models.AutomationCampaign.campaignDuration;

  const customer = await _getCustomer(job, customerId, campaignType);
  const garage = await _getGarage(job, garageId, campaignType);
  const campaign = await _getCampaignAutomation(job, campaignId, campaignType);
  // checking for blacklisted endpoints and get contact email or phone
  const contactTo = await _getContactTo(job, customer, contactType, contactTypeList);
  if (!contactTo) {
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS);
    return;
  }
  // if customer is unsubscribed, we don't send anything, just create an event #4157
  if (customer.unsubscribed || !customer[contactTypeList] || !customer[contactTypeList].length) {
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_UNSUBSCRIBED);
    return;
  }
  // check pressure, abort sending in case pressure is here
  const pressureEvent = await _checkPressure(customer, job, campaignType, today, delayedBySmsDays, campaignDuration);
  if (pressureEvent) {
    await _createEventLog(job, campaignType, pressureEvent);
    return;
  }
  // received GDPR
  let receivedGdprAt = customer.hasReceivedGDPRContactAt;
  if (!receivedGdprAt) {
    receivedGdprAt = await _sendGdpr(customer, garage, campaign, job, contactTo, campaignDuration);
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.PREPARE_TO_SEND_GDPR);
  }
  // delay by GDPR
  const GDPRDelay = timeHelper.addDays(new Date(), GDPRDelayDay).getTime() - today.getTime();
  if (today.getTime() < receivedGdprAt.getTime() + GDPRDelay) {
    const constraints = { noWeekEnd: true, workingHours: true };
    await Scheduler.upsertJob(
      JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
      Object.assign({ delayedByGDPR: true }, job.payload),
      new Date(today.getTime() + GDPRDelay + 1000 * 60 * 3),
      constraints
    );
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.DELAYED_BY_GDPR);
    return;
  }
  // send email || sms to customer
  const isSendContactToCustomer = await _sendContactToCustomer(customer, campaign, garage, contactTo, job);
  if (isSendContactToCustomer) {
    await _createEventLog(job, campaignType, AutomationCampaignsEventsType.PREPARE_TO_SEND);
  }
  // reset pressure after the campaign duration (30 days by default)
  const nextDateDayNumber = timeHelper.todayDayNumber() + campaignDuration;
  const nextDate = timeHelper.dayNumberToDate(nextDateDayNumber);
  await Scheduler.upsertJob(JobTypes.AUTOMATION_RESET_PRESSURE, { customerId, campaignType }, nextDate);
};
