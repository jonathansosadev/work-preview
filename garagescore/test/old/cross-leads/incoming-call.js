const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const app = new TestApp();
const { generateMockIncomingCall } = require('./_utils')(app);
const crossLeadsIncomingCall = require('../../../workers/jobs/scripts/cross-leads-incoming-call.js');
const crossLeadsSendSelfAssignReminder = require('../../../workers/jobs/scripts/cross-leads-send-self-assign-reminder.js');
const { ContactTypes, TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const SourceBy = require('../../../common/models/data/type/source-by.js');
const TicketStatus = require('../../../common/models/data/type/lead-ticket-status.js');
const LeadTimings = require('../../../common/models/data/type/lead-timings.js');
const KpiTypes = require('../../../common/models/kpi-type.js');
const promises = require('../../../common/lib/util/promises');
const nuxtRender = require('../../../common/lib/garagescore/contact/render');
const LA_CENTRALE_ANONYMOUS_CALL = require('../../../common/lib/garagescore/cross-leads/examples/calls/raw_anonymous-call.json');
const LA_CENTRALE_ANONYMOUS_MISSED_CALL = require('../../../common/lib/garagescore/cross-leads/examples/calls/raw_anonymous-missed-call.json');

const { expect } = chai;

describe('Test cross leads incoming calls', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });
  it('should create a ticket without phone when we receive a anonymous call', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(
      garage.id,
      SourceTypes.LA_CENTRALE,
      { duration: 0 },
      false,
      LA_CENTRALE_ANONYMOUS_CALL
    );
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('customer.contact.mobilePhone.value')).to.be.equal(undefined);
    expect(datas[0].get('leadTicket.status')).to.be.equal(TicketStatus.WAITING_FOR_MEETING);
    expect(datas[0].get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_CALL);
  });
  it('should create a ticket without phone when we missed a anonymous call', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(
      garage.id,
      SourceTypes.LA_CENTRALE,
      { duration: 0 },
      false,
      LA_CENTRALE_ANONYMOUS_MISSED_CALL
    );
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('customer.contact.mobilePhone.value')).to.be.equal(undefined);
    expect(datas[0].get('leadTicket.status')).to.be.equal(TicketStatus.WAITING_FOR_CONTACT);
    expect(datas[0].get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_MISSED_CALL);
  });
  it('add 2 time the same phone call', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    const call2 = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN, {
      creationDatetime: new Date().toISOString(),
    });
    const job = { payload: { callId: call.id.toString() } };
    const job2 = { payload: { callId: call2.id.toString() } };
    await crossLeadsIncomingCall(job);
    let datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('customer.contact.mobilePhone.value')).to.be.equal('+33621982935');
    await crossLeadsIncomingCall(job2);
    datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('leadTicket.actions').length).to.be.equal(3); // Two incomingCall action registered cause we didn't separate them
    expect(datas[0].get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_CALL);
  });
  it('Test missed call', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN, { duration: 0 }, false);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('customer.contact.mobilePhone.value')).to.be.equal('+33621982935');
    expect(datas[0].get('leadTicket.status')).to.be.equal(TicketStatus.WAITING_FOR_CONTACT);
    expect(datas[0].get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_MISSED_CALL);
  });
  it('Test call answered', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('customer.contact.mobilePhone.value')).to.be.equal('+33621982935');
    expect(datas[0].get('leadTicket.status')).to.be.equal(TicketStatus.WAITING_FOR_MEETING);
    expect(datas[0].get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_CALL);
  });
  it('2 same calls at the same time should not create 2 tickets', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN, { duration: 0 }, false);
    const call2 = await generateMockIncomingCall(garage.id, SourceTypes.LA_CENTRALE, {
      creationDatetime: new Date().toISOString(),
    });
    const job = { payload: { callId: call.id.toString() } };
    const job2 = { payload: { callId: call2.id.toString() } };
    await Promise.all([crossLeadsIncomingCall(job), crossLeadsIncomingCall(job2)]);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    expect(datas[0].get('customer.contact.mobilePhone.value')).to.be.equal('+33621982935');
    expect(datas[0].get('leadTicket.status')).to.be.equal(TicketStatus.WAITING_FOR_MEETING);
    expect(datas[0].get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_MISSED_CALL);
    expect(datas[0].get('leadTicket.actions')[2].name).to.be.equal(TicketActionNames.INCOMING_CALL);
  });
  it('Check information', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN, { duration: 0 }, false);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    const data = datas[0];
    expect(data.get('customer.contact.mobilePhone.value')).to.be.equal('+33621982935');
    expect(data.get('leadTicket.status')).to.be.equal(TicketStatus.WAITING_FOR_CONTACT);
    expect(data.get('leadTicket.actions')[1].name).to.be.equal(TicketActionNames.INCOMING_MISSED_CALL);
    expect(data.get('leadTicket.saleType')).to.be.equal(SourceTypes.saleType(SourceTypes.LE_BON_COIN));
    expect(data.get('source.by')).to.be.equal(SourceBy.PHONE);
    expect(data.get('leadTicket.timing')).to.be.equal(LeadTimings.NOW);
  });
  it('Lead alert CROSS_LEADS_SELF_ASSIGN_CALL should NOT be sent if disabled when calling as been made', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' });
    const garage = await app.addGarage({ enableCrossLeadsSelfAssignCallAlert: false });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: true, LeadVn: true, LeadVo: true });
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    const contacts = await app.models.Contact.find();
    expect(contacts.length).to.be.equal(0);
  });
  it('Lead alert CROSS_LEADS_SELF_ASSIGN_CALL should be sent if enabled when calling as been made', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' });
    const garage = await app.addGarage({ enableCrossLeadsSelfAssignCallAlert: true });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: true, LeadVn: true, LeadVo: true });
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    const contacts = await app.models.Contact.find();
    expect(contacts.length).to.be.equal(1);
    const [contact] = contacts;
    const finalPayload = await contact.getFinalPayloadForTests();
    expect(contact.type).to.be.equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_CALL);
    expect(finalPayload.data.get('source.type')).to.be.equal(SourceTypes.LE_BON_COIN);
  });
  it('New lead missed called alert should be sent when missing a call', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    const garage = await app.addGarage();
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: false, LeadVn: false, LeadVo: true }); // LeadVo should be enough
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN, { duration: 0 }, false);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const datas = await garage.datas();
    expect(datas.length).to.be.equal(1);
    const contacts = await app.models.Contact.find();
    expect(contacts.length).to.be.equal(1); // There is 2 user because one of them is the manager by default on the garage
    const alert = contacts[0];
    expect(alert.type).to.be.equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL);
  });
  it('Is the followup programmed', async function test() {
    const garage = await app.addGarage();
    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    const job = { payload: { callId: call.id.toString() } };
    await crossLeadsIncomingCall(job);
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_LEAD_FOLLOWUP } });
    expect(jobs.length).equal(1);
    expect(jobs[0].type).equal('SEND_LEAD_FOLLOWUP');
  });
  it('After each reminder, it should generate a contact and a other job until 4 reminder for MISSED CALL', async function test() {
    const garage = await app.addGarage();

    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: false, LeadVn: false, LeadVo: true }); // LeadVo should be enough

    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN, { duration: 0 }, false);
    await crossLeadsIncomingCall({ payload: { callId: call.id.toString() } });
    let [job, undefinedJob] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    let [contact, undefinedContact] = await app.models.Contact.find();
    /** First alert */
    expect(undefinedJob).equal(undefined);
    expect(undefinedContact).equal(undefined);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL);
    expect(contact.payload.stage).equal(0);
    const contactSentAt = Math.floor(new Date(contact.createdAt).getTime() / 1000 / 60);
    expect(job.payload.stage).equal(1);
    expect(job.payload.contacts[0].payload.stage).equal(0); // test if the contacts are in the job payload
    expect(job.scheduledAt).to.be.above(contactSentAt + (15 - 1)); // Programmed in 15min

    /** Alert reminder 1/4 */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 2 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 1 } });
    expect(job.payload.stage).equal(2);
    expect(contact.payload.stage).equal(1);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL);

    /** Alert reminder 2/4 */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 3 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 2 } });
    expect(job.payload.stage).equal(3);
    expect(contact.payload.stage).equal(2);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL);

    /** Alert reminder 3/4 */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 4 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 3 } });
    expect(job.payload.stage).equal(4);
    expect(contact.payload.stage).equal(3);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL);

    /** Alert reminder 4/4 LAST ONE, Should NOT create a new job */
    await crossLeadsSendSelfAssignReminder(job);
    [undefinedJob] = await app.jobs({
      where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 5 },
    });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 4 } });
    expect(undefinedJob).equal(undefined);
    expect(contact.payload.stage).equal(4);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL);

    /** SHOULD NOT SEND MORE ALERTS */
    [undefinedContact] = await app.models.Contact.find({ where: { 'payload.stage': 5 } });
    expect(undefinedContact).equal(undefined);
  });
  it('Answered calls should not send alert if disabled or reminders !', async function test() {
    const garage = await app.addGarage({ enableCrossLeadsSelfAssignCallAlert: false });

    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: false, LeadVn: false, LeadVo: true }); // LeadVo should be enough

    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    await crossLeadsIncomingCall({ payload: { callId: call.id.toString() } });
    const [undefinedJob] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    const [undefinedContact1, undefinedContact2] = await app.models.Contact.find();
    expect(undefinedJob).equal(undefined);
    expect(undefinedContact1).equal(undefined);
    expect(undefinedContact2).equal(undefined);
  });
  it('Answered calls should not send reminders', async function test() {
    const garage = await app.addGarage({ enableCrossLeadsSelfAssignCallAlert: true });

    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: false, LeadVn: false, LeadVo: true }); // LeadVo should be enough

    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    await crossLeadsIncomingCall({ payload: { callId: call.id.toString() } });
    const [undefinedJob] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    const [contact, undefinedContact] = await app.models.Contact.find();
    /** First alert ONLY */
    expect(undefinedJob).equal(undefined);
    expect(undefinedContact).equal(undefined);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_CALL);
    expect(contact.payload.stage).equal(0);
  });

  it('should create a followup alert when not contacted', async function test() {
    await nuxtRender.setTestMode();
    const garage = await app.addGarage();

    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ LeadVo: true }); // LeadVo should be enough

    const call = await generateMockIncomingCall(garage.id, SourceTypes.LE_BON_COIN);
    await crossLeadsIncomingCall({ payload: { callId: call.id.toString() } });
    const [undefinedJob] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    const [job] = await app.jobs({ where: { type: JobTypes.SEND_LEAD_FOLLOWUP } });
    await job.run();
    const [data] = await garage.datas();
    const actions = [(updates) => updates.updateFollowupLead({ recontacted: false })];
    const updates = data.survey_prepareUpdates(data.getSurveyInProgress());
    actions.forEach((a) => a(updates));
    updates.updateProgress(5, 5, true, new Date());
    await promises.makeAsyncPrototype(updates, 'run')();
    await promises.makeAsyncPrototype(data, 'campaign_checkSurveyUdpates')();
    await app.sendAlerts();
    const [contact] = await app.contacts({ where: { 'payload.alertType': 'LeadFollowupVoNotRecontacted' } });
    const email = await contact.render();
    expect(email.htmlBody.length > 0).to.be.true;
    expect(email.subject.length).equal(82);
  });
});
