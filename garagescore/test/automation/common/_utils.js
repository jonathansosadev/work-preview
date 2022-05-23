const { ObjectId } = require('mongodb');
const exampleDataDefault = require('../../apollo/examples/data-with-lead-ticket');
const { todayDayNumber, dayNumberToDate } = require('../../../common/lib/util/time-helper');
const { AutomationCampaignTargets } = require('../../../frontend/utils/enumV2');

/**
 * create customer ready to be target by campaign
 * @param {*} app
 * @param { String } target ennum like M_M
 * @param { Object } garage
 * @param { String } email customer email
 * @param { String } phone customer phone number
 */
const createCustomer = async (app, target, garage, email, phone) => {
  const dateToInterval = app.models.AutomationCampaign.dateToInterval;
  const mongoCustomer = app.models.Customer;
  const [, historicInMonth] = AutomationCampaignTargets.getProperty(target, 'historicNeededInMonth');
  const { gte } = dateToInterval(new Date(), historicInMonth || 0);
  const exampleData = { ...exampleDataDefault };
  delete exampleData._id;
  let providedAt = gte;

  if (target === AutomationCampaignTargets.VS_M_11) {
    const dateToScout = new Date();
    dateToScout.setDate(dateToScout.getDate() - 90);
    const { gte } = dateToInterval(dateToScout, 0);
    providedAt = gte;
  }
  // set data for Automation test
  const dataType = AutomationCampaignTargets.getProperty(target, 'dataTypeSource');
  if (email) {
    exampleData.customer.contact.email.value = email;
    exampleData.customer.contact.email.original = email;
  }
  if (phone) {
    exampleData.customer.contact.mobilePhone.value = phone;
    exampleData.customer.contact.mobilePhone.original = phone;
  }
  exampleData.service.providedAt = providedAt;
  exampleData.type = dataType;
  exampleData.garageId = garage.id.toString();
  const data = await app.models.Data.create(exampleData);
  // create customer
  await mongoCustomer.addData(data);
};
// create events LEAD or CONVERTED
const createEventInCustomerIndex = async (app, garage, target, dayNumberBefore, event) => {
  const mongoCustomer = app.models.Customer;
  const customer = await mongoCustomer.findOne({ where: { garageId: ObjectId(garage.id) } });
  if (event && customer) {
    await app.models.AutomationCampaignsEvents.create({
      campaignId: ObjectId('5efe19e49633ed00038748d6'),
      campaignRunDay: todayDayNumber(),
      campaignType: 'AUTOMATION_VEHICLE_SALE',
      eventDay: dayNumberBefore,
      garageId: ObjectId(garage.id),
      type: event,
      nsamples: 1,
      nsamplesDesktop: 1,
      target: target,
      samples: [
        {
          time: new Date().getTime(),
          customerId: ObjectId(customer.id),
        },
      ],
    });
    // consolidate for create customer index
    await customer.consolidateAndUpdate();
  }
};
/**
 * create and run Automation campaign
 * @param {*} app
 * @param { Object } garage
 * @param { String } target ennum like M_M
 */
const createAndRunAutomationCampaign = async (app, garage, target, contactType) => {
  const mongoAutomationCampaign = app.models.AutomationCampaign;
  const type = AutomationCampaignTargets.getProperty(target, 'leadDataType');
  const dayNumber = todayDayNumber();
  // create campaign
  await mongoAutomationCampaign.create({
    displayName: '',
    type: type,
    contactType: contactType || 'EMAIL',
    garageId: ObjectId(garage.id),
    status: 'RUNNING',
    frequency: 'DAILY',
    runDayNumber: todayDayNumber(),
    target: target,
    hidden: false,
  });
  // run campaign
  await mongoAutomationCampaign.runCampaigns(dayNumberToDate(dayNumber));
};
/**
 * * create Automation campaign
 * @param {*} app
 * @param { Object } garage
 * @param { String } target like M_M
 * @param { String } contactType enum email or phone
 */
const createCampaign = async (app, garage, target, contactType) => {
  const mongoAutomationCampaign = app.models.AutomationCampaign;
  const type = AutomationCampaignTargets.getProperty(target, 'leadDataType');
  await mongoAutomationCampaign.create({
    displayName: '',
    type: type,
    contactType: contactType || 'EMAIL',
    garageId: ObjectId(garage.id),
    status: 'RUNNING',
    frequency: 'DAILY',
    runDayNumber: todayDayNumber(),
    target: target,
    hidden: false,
  });
};
/**
 * customer by new vehicule, add information to customer Index
 * @param { String } email
 * @param { Date } lastVehicleSaleAt
 */
const addVehicleSaleAt = async (app, target, email, lastVehicleSaleAt) => {
  await app.models.Customer.getMongoConnector().updateOne(
    { email: email },
    { $push: { index: { k: 'lastVehicleSaleAt', v: lastVehicleSaleAt } } }
  );
  if (/NVS|UVS/.test(target)) {
    // campaign Vn/Vo, consolidate will update VehicleSaleAt with the most recent date
    const customer = await app.models.Customer.findOne({ where: { email: email } });
    const dataType = AutomationCampaignTargets.getProperty(target, 'dataTypeSource');
    customer.history.push({
      serviceProvidedAt: lastVehicleSaleAt,
      dataId: '5fcb3fb93521e400038c4105',
      plate: 'EQ-796-WM',
      serviceType: dataType,
    });

    await customer.consolidateAndUpdate();
  }
};

module.exports = {
  createCustomer,
  createEventInCustomerIndex,
  createAndRunAutomationCampaign,
  createCampaign,
  addVehicleSaleAt,
};
