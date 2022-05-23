const { ObjectID } = require('mongodb');
const app = require('../../../server/server');
const LeadTypes = require('../../../common/models/data/type/lead-types');
const LeadTimings = require('../../../common/models/data/type/lead-timings');
const { AutomationCampaignTargets, DataTypes, SourceTypes } = require('../../../frontend/utils/enumV2');
const GarageTypes = require('../../../common/models/garage.type');

const _checkIsDataExist = async (campaignId, customerId, campaignRunDay) => {
  return app.models.DatasAsyncviewLeadTicket.getMongoConnector().findOne(
    {
      'source.type': SourceTypes.AUTOMATION,
      'automation.campaignId': campaignId,
      'automation.customerId': customerId,
      'automation.campaignRunDay': campaignRunDay,
    },
    { projection: { _id: true } }
  );
};

module.exports = async (job) => {
  const customerId = new ObjectID(job.payload.customerId);
  const campaignId = new ObjectID(job.payload.campaignId);
  const campaignRunDay = job.payload.campaignRunDay;

  const isDataExist = await _checkIsDataExist(campaignId, customerId, campaignRunDay);
  if (isDataExist) {
    return;
  }

  let customer = await app.models.Customer.mongoFindByIds([customerId]);
  const campaignFields = { type: true, contactType: true, target: true };
  const campaign = await app.models.AutomationCampaign.findOne({ where: { id: campaignId }, fields: campaignFields });
  const dataType =
    job.payload.dataType || app.models.AutomationCampaign.campaignTypeToDataTypeLeadTicket(campaign.type);
  if (!customer[0]) {
    throw new Error(
      `automation-create-ticket :: no customer for customerId ${customerId.toString()} in ${JSON.stringify(job)}`
    );
  }
  [customer] = customer;
  const garage = await app.models.Garage.findById(customer.garageId.toString());
  const data = await app.models.Data.init(garage.getId().toString(), {
    type: DataTypes.AUTOMATION_CAMPAIGN,
    garageType: (garage && garage.type) || GarageTypes.DEALERSHIP,
    raw: {},
    automation: {
      campaignId,
      customerId,
      contactType: campaign.contactType,
      campaignRunDay: job.payload.campaignRunDay,
    },
    sourceId: campaignId,
    sourceType: SourceTypes.AUTOMATION,
    // I replaced customerId by the data type we used to target the customer. Anyways the customerId is available elswhere in the doc
    sourceBy: AutomationCampaignTargets.getPropertyFromValue(campaign.target, 'dataTypeSource'),
    lead: { type: LeadTypes.INTERESTED, saleType: dataType },
    customer: {
      mobilePhone: customer.phone,
      email: customer.email,
      fullName: customer.fullName,
      city: customer.city,
    },
    vehicle: {
      plate: customer.plate,
    },
  });
  await data.save();
  const newData = await data.addLeadTicket(garage, {
    source: 'automation',
    rawManagerId: null,
    sourceData: {
      phone: customer.phone,
      email: customer.email,
      fullName: customer.fullName,
      leadSaleType: dataType,
      campaignId,
      customerId,
    },
    leadTiming: LeadTimings.NOW,
  });
  await newData.save();
};
