const chai = require('chai');

const TestApp = require('../../../common/lib/test/test-app');
const { random } = require('../../../common/lib/test/testtools');
const DataFileTypes = require('../../../common/models/data-file.data-type');
const DataTypes = require('../../../common/models/data/type/data-types.js');
const sendContactToCustomer = require('../../../workers/jobs/scripts/automation-send-contact-to-customer');
const automationCreateTicket = require('../../../workers/jobs/scripts/automation-create-ticket');
const { AutomationCampaignTargets } = require('../../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../../common/models/automation-campaign-channel.type');
const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const LeadTimings = require('../../../common/models/data/type/lead-timings');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types');

const expect = chai.expect;
const app = new TestApp();

describe('Test automation campaigns leadTickets:', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('check if the leadTicket created by a automationCampaign is correct', async function test() {
    const testGarage = await app.addGarage();
    const garage = await app.models.Garage.findById(testGarage.getId());

    // We try the campaigns M_M MOBILE and EMAIL
    await app.models.AutomationCampaign.initDefaultCampaigns(
      garage.id,
      garage.subscriptions,
      garage.dataFirstDays,
      'fr_FR',
      'RunningAuto'
    );
    const [campaign] = await app.models.AutomationCampaign.find({ where: { target: AutomationCampaignTargets.M_M } });
    // Update status from IDLE to RUNNING
    await app.models.AutomationCampaign.toggleStatus(campaign);
    // Creates the customer with a data
    const person = random.person({ email: 'toto@tata.com', mobilePhone: null });
    await testGarage.runNewCampaign(DataFileTypes.MAINTENANCES, person);
    let [customer] = await app.customers();

    // We set the customer last maintenance at in the past, to be targeted by the two M_M campaigns
    const [element] = customer.history;
    const newDate = new Date();
    newDate.setFullYear(newDate.getFullYear() - 1);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setMonth(newDate.getMonth() + 1);
    element.serviceProvidedAt = newDate;
    await customer.consolidate();
    await customer.save();

    // We run the campaigns, since they've been created with the garage.
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await app.models.AutomationCampaign.runCampaigns(tomorrow);

    // We expect one targeted events, since the M_M EMAIL campaign found a target (the customer we added in the beginning)
    let [targetEvent, undefinedEvent] = await app.models.AutomationCampaignsEvents.find();
    expect(undefinedEvent).to.equal(undefined);
    expect(targetEvent.type).to.equal(AutomationCampaignsEventsType.TARGETED);
    expect(targetEvent.nsamples).to.equal(1);

    // Get the job that send the GarageScore campaign email from the runCampaign at the beginning
    let [job] = await app.jobs({ where: { 'payload.contactType': AutomationCampaignChannelTypes.EMAIL } });
    // We execute the job
    await sendContactToCustomer(job);
    // Here, we have the 2 first jobs, one job to send the GDPR email and the email job that has been delayed by RGPD
    [job] = await app.jobs({ where: { 'payload.delayedByGDPR': true } });
    [customer] = await app.customers();
    // We set the gdpr sent in the past to trigger the campaign.
    customer.hasReceivedGDPRContactAt = new Date();
    customer.hasReceivedGDPRContactAt.setFullYear(customer.hasReceivedGDPRContactAt.getFullYear() - 1);
    await customer.consolidate();
    await customer.save();
    await sendContactToCustomer(job);
    [customer] = await app.customers();

    let [firstEvent] = await app.automationCampaignEvents();
    // Now we generate an event SENT, RECEIVED, OPEN, and LEAD to create the lead ticket associated to it
    for (const eventType of [
      AutomationCampaignsEventsType.SENT,
      AutomationCampaignsEventsType.RECEIVED,
      AutomationCampaignsEventsType.OPENED,
      AutomationCampaignsEventsType.LEAD,
    ]) {
      await app.models.AutomationCampaignsEvents.addLog({
        garageId: customer.garageId.toString(),
        campaignId: campaign.getId().toString(),
        customerId: customer.getId(),
        eventType,
        contactType: campaign.contactType,
        campaignType: campaign.type,
        target: campaign.target,
        campaignRunDay: firstEvent.campaignRunDay,
      });
    }
    const [firstEventUpdated] = await app.automationCampaignEvents();
    await automationCreateTicket({
      payload: {
        customerId: customer.getId(),
        campaignId: campaign.getId().toString(),
        campaignRunDay: firstEventUpdated.campaignRunDay,
      },
    });
    await customer.consolidateAndUpdate();
    let [automationLead] = await app.datas({ where: { type: 'AutomationCampaign' } });
    expect(automationLead.type).equal(DataTypes.AUTOMATION_CAMPAIGN);
    expect(automationLead.source.type).equal(SourceTypes.AUTOMATION);
    expect(automationLead.leadTicket.timing).equal(LeadTimings.NOW);
    expect(automationLead.leadTicket.saleType).equal(LeadSaleTypes.MAINTENANCE);
    // await commonTicket.addAction('lead', automationLead, {
    //   name: ticketActionName.LEAD_CLOSED,
    //   assignerUserId: '5a5e00d2f4609513002b4f02',
    //   wasTransformedToSale: true,
    // });
  });
});
