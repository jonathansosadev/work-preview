/*
 * Create or remove lead ticket if necessary
 */
const app = require('../../../../../server/server');
const Scheduler = require('../../../garagescore/scheduler/scheduler.js');
const { JobTypes } = require('../../../../../frontend/utils/enumV2');
const LeadSaleTypes = require('../../../../../common/models/data/type/lead-sale-types.js');
const SourceTypes = require('../../../../../common/models/data/type/source-types');
const GarageTypes = require('../../../../models/garage.type');
const commonTicket = require('../../../../models/data/_common-ticket');

const addTicket = async (self, data, garage, callback) => {
  const parentId = garage.parent && garage.parent.garageId;
  const saleType =
    data.get('lead.saleType') === LeadSaleTypes.UNKNOWN || !data.get('lead.saleType')
      ? LeadSaleTypes.NEW_VEHICLE_SALE
      : data.get('lead.saleType');
  const shouldForwardTicket = garage.isSharingTickets(saleType);
  if (shouldForwardTicket) {
    try {
      const parent = await app.models.Garage.findById(parentId, { fields: { type: true } });
      const forwardedData = new app.models.Data({
        garageId: parentId,
        type: data.get('type'),
        garageType: (parent && parent.type) || GarageTypes.DEALERSHIP,
        shouldSurfaceInStatistics: true,
      });
      await forwardedData.save(); // So we can have a data.id

      /** Copy the 'lead' object so we can init the leadTicket as if it was our own */
      forwardedData.set('lead', JSON.parse(JSON.stringify(data.get('lead'))));
      forwardedData.set('customer', JSON.parse(JSON.stringify(data.get('customer'))));
      forwardedData.set('vehicle', JSON.parse(JSON.stringify(data.get('vehicle'))));
      forwardedData.set('source', {
        type: SourceTypes.AGENT,
        sourceId: data.getId().toString(),
        garageId: data.garageId,
        importedAt: new Date(),
      });
      await forwardedData.save();
      /** IMPORTANT: We need to save the data.source before adding the leadTicket so the kpi can have the followedGarageId field */
      await forwardedData.addLeadTicket(null, {}); // SEE PREVIOUS COMMENT LINE
      await forwardedData.save();
      data.set('lead', { forwardedTo: forwardedData.getId().toString(), forwardedAt: new Date() });
      data.set('leadTicket', null);
      await data.save();
      callback();
    } catch (e) {
      callback(e);
    }
  } else {
    try {
      await data.addLeadTicket(garage, {});
      await data.save();
      callback();
    } catch (e) {
      callback(e);
    }
  }
};

const removeTicket = async (self, data, callback) => {
  const forwardedTo = data.get('lead.forwardedTo');

  if (forwardedTo) {
    try {
      const forwardedData = await app.models.Data.findById(forwardedTo);
      await Scheduler.removeJob(JobTypes.ESCALATE, { dataId: forwardedTo, type: 'lead', stage: 1 });
      await Scheduler.removeJob(JobTypes.SEND_LEAD_FOLLOWUP, { dataId: forwardedTo });
      await Scheduler.removeJob(JobTypes.CLOSE_EXPIRED_LEAD_TICKET, { dataId: forwardedTo });
      await forwardedData.destroy();
      await data.set('lead', null);
      await data.set('leadTicket', null);
      await data.save();
      self.modelInstances.data = data;
      callback();
    } catch (e) {
      callback(e);
    }
  } else {
    try {
      const updatedData = await data.leadTicket_deleteTicket();
      await Scheduler.removeJob(JobTypes.ESCALATE, { dataId: data.getId().toString(), type: 'lead', stage: 1 });
      await Scheduler.removeJob(JobTypes.SEND_LEAD_FOLLOWUP, { dataId: data.getId().toString() });
      await Scheduler.removeJob(JobTypes.CLOSE_EXPIRED_LEAD_TICKET, { dataId: data.getId().toString() });
      self.modelInstances.data = updatedData;
      callback();
    } catch (e) {
      callback(e);
    }
  }
};

const adapTicket = async (leadTime, leadTicketTime, forwardedTo, data, garage) => {
  if (!leadTicketTime && !forwardedTo) return;
  const email = data.get('customer.contact.email.value');
  const mobilePhone = data.get('customer.contact.mobilePhone.value');
  const gender = data.get('customer.gender.value');
  const title = data.get('customer.title.value');
  const firstName = data.get('customer.firstName.value');
  const lastName = data.get('customer.lastName.value');
  const fullName = data.get('customer.fullName.value');
  const street = data.get('customer.street.value');
  const postalCode = data.get('customer.postalCode.value');
  const city = data.get('customer.city.value');
  const countryCode = data.get('customer.countryCode.value');
  const optOutMailing = data.get('customer.optOutMailing.value');
  const optOutSMS = data.get('customer.optOutSM.value');
  const { customer } = data.addCustomer(
    email,
    mobilePhone,
    gender,
    title,
    firstName,
    lastName,
    fullName,
    street,
    postalCode,
    city,
    countryCode,
    optOutMailing,
    optOutSMS
  );
  if (forwardedTo) {
    const lead = data.get('lead');
    data = await app.models.Data.findById(forwardedTo);
    garage = await app.models.Garage.findById(data.get('garageId'));
    leadTicketTime = data.get('leadTicket.createdAt') ? data.get('leadTicket.createdAt').getTime() : null;
    data.lead = lead;
    data.customer = customer;
  }
  if (leadTicketTime && leadTicketTime < leadTime) {
    await commonTicket.initLeadTicket(data, garage, {});
  }
};

async function updateTicket(callback) {
  const self = this;
  const { data, garage } = self.modelInstances;
  const ticketAlreadyExists =
    (data.get('leadTicket') && data.get('leadTicket.createdAt')) || data.get('lead.forwardedTo');
  const shouldHaveATicket = data.get('lead.potentialSale');
  const leadTime = (data.get('lead.reportedAt') && data.get('lead.reportedAt').getTime()) || new Date().getTime();
  const leadTicketTime = data.get('leadTicket.createdAt');
  const forwardedTo = data.get('lead.forwardedTo');

  await adapTicket(leadTime, leadTicketTime, forwardedTo, data, garage);

  if (shouldHaveATicket && ticketAlreadyExists) callback();
  else if (!shouldHaveATicket && !ticketAlreadyExists) callback();
  else if (shouldHaveATicket && !ticketAlreadyExists) await addTicket(self, data, garage, callback);
  else if (!shouldHaveATicket && ticketAlreadyExists) await removeTicket(self, data, callback);
}

module.exports = updateTicket;
