const chai = require('chai');
const { ObjectId } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const _sendQueryAs = require('./_send-query-as');
const ContactTicketStatus = require('../../common/models/data/type/contact-ticket-status');
const { expect } = chai;
const testApp = new TestApp();

/* Get garage data from api */
describe('Data set contactTicket', () => {
  beforeEach(async function () {
    await testApp.reset();
    const garage = await testApp.addGarage({ allowReviewCreationFromContactTicket: true });
    let data = await testApp.models.Data.create({
      garageId: garage.id,
      type: 'Maintenance',
      garageType: 'Dealership',
      contactTicket: {
        status: ContactTicketStatus.TO_RECONTACT,
      },
    });
  });
  it('It should set contactTicket status to terminated', async () => {
    const user = await testApp.addUser({ email: 'hit@me.com' });
    const data = await testApp.models.Data.findOne();

    const request = `
    mutation dataSetContactTicket_CdaEDaFeHEHHIFcIdAAbAcaDHAGJddJD ($dataSetContactTicket0id: String,$dataSetContactTicket0status: String,$dataSetContactTicket0score: Int,$dataSetContactTicket0unsatisfiedCriteria: [String],$dataSetContactTicket0resolved: Int,$dataSetContactTicket0comment: String,$dataSetContactTicket0assigner: String,$dataSetContactTicket0leadAssigner: String,$dataSetContactTicket0leadComment: String,$dataSetContactTicket0leadType: String,$dataSetContactTicket0leadTiming: String,$dataSetContactTicket0leadBodyType: [String],$dataSetContactTicket0leadEnergy: [String],$dataSetContactTicket0leadCylinder: [String],$dataSetContactTicket0leadFinancing: String,$dataSetContactTicket0leadSaleType: String,$dataSetContactTicket0leadBudget: String,$dataSetContactTicket0leadTradeIn: String,$dataSetContactTicket0leadBrandModel: String) {
      dataSetContactTicket (id: $dataSetContactTicket0id,status: $dataSetContactTicket0status,score: $dataSetContactTicket0score,unsatisfiedCriteria: $dataSetContactTicket0unsatisfiedCriteria,resolved: $dataSetContactTicket0resolved,comment: $dataSetContactTicket0comment,assigner: $dataSetContactTicket0assigner,leadAssigner: $dataSetContactTicket0leadAssigner,leadComment: $dataSetContactTicket0leadComment,leadType: $dataSetContactTicket0leadType,leadTiming: $dataSetContactTicket0leadTiming,leadBodyType: $dataSetContactTicket0leadBodyType,leadEnergy: $dataSetContactTicket0leadEnergy,leadCylinder: $dataSetContactTicket0leadCylinder,leadFinancing: $dataSetContactTicket0leadFinancing,leadSaleType: $dataSetContactTicket0leadSaleType,leadBudget: $dataSetContactTicket0leadBudget,leadTradeIn: $dataSetContactTicket0leadTradeIn,leadBrandModel: $dataSetContactTicket0leadBrandModel) { 
        status
        leadType
        leadAssigner
        leadComment
        leadTiming
        leadFinancing
        leadSaleType
        leadTradeIn
        leadBudget
        leadBrandModel
        leadBodyType
        leadEnergy
        updatedAt
        closedAt
        }
     }
      `;

    const variables = {
      dataSetContactTicket0comment: 'Clôturer sans traitement',
      dataSetContactTicket0id: data.id.toString(),
      dataSetContactTicket0status: ContactTicketStatus.TERMINATED,
    };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    const dataExpect = await testApp.models.Data.findOne();
    // result from apollo request
    expect(res.data.dataSetContactTicket.status).equal(ContactTicketStatus.TERMINATED);
    // data before
    expect(data.contactTicket.status).equal(ContactTicketStatus.TO_RECONTACT);
    // data after
    expect(dataExpect.contactTicket.status).equal(ContactTicketStatus.TERMINATED);
    expect(dataExpect.contactTicket.comment).equal('Clôturer sans traitement');
  });
  it('It should set contactTicket status to onGoing', async () => {
    const user = await testApp.addUser({ email: 'hit@me.com' });
    const data = await testApp.models.Data.findOne();

    const request = `
      mutation dataSetContactTicket_CdaEDaFeHEHHIFcIdAAbAcaDHAGJddJD ($dataSetContactTicket0id: String,$dataSetContactTicket0status: String,$dataSetContactTicket0score: Int,$dataSetContactTicket0unsatisfiedCriteria: [String],$dataSetContactTicket0resolved: Int,$dataSetContactTicket0comment: String,$dataSetContactTicket0assigner: String,$dataSetContactTicket0leadAssigner: String,$dataSetContactTicket0leadComment: String,$dataSetContactTicket0leadType: String,$dataSetContactTicket0leadTiming: String,$dataSetContactTicket0leadBodyType: [String],$dataSetContactTicket0leadEnergy: [String],$dataSetContactTicket0leadCylinder: [String],$dataSetContactTicket0leadFinancing: String,$dataSetContactTicket0leadSaleType: String,$dataSetContactTicket0leadBudget: String,$dataSetContactTicket0leadTradeIn: String,$dataSetContactTicket0leadBrandModel: String) {
        dataSetContactTicket (id: $dataSetContactTicket0id,status: $dataSetContactTicket0status,score: $dataSetContactTicket0score,unsatisfiedCriteria: $dataSetContactTicket0unsatisfiedCriteria,resolved: $dataSetContactTicket0resolved,comment: $dataSetContactTicket0comment,assigner: $dataSetContactTicket0assigner,leadAssigner: $dataSetContactTicket0leadAssigner,leadComment: $dataSetContactTicket0leadComment,leadType: $dataSetContactTicket0leadType,leadTiming: $dataSetContactTicket0leadTiming,leadBodyType: $dataSetContactTicket0leadBodyType,leadEnergy: $dataSetContactTicket0leadEnergy,leadCylinder: $dataSetContactTicket0leadCylinder,leadFinancing: $dataSetContactTicket0leadFinancing,leadSaleType: $dataSetContactTicket0leadSaleType,leadBudget: $dataSetContactTicket0leadBudget,leadTradeIn: $dataSetContactTicket0leadTradeIn,leadBrandModel: $dataSetContactTicket0leadBrandModel) { 
          status
          leadType
          leadAssigner
          leadComment
          leadTiming
          leadFinancing
          leadSaleType
          leadTradeIn
          leadBudget
          leadBrandModel
          leadBodyType
          leadEnergy
          updatedAt
          closedAt
          }
      }
      `;

    const variables = {
      dataSetContactTicket0comment: 'Clôturer sans traitement',
      dataSetContactTicket0id: data.id.toString(),
      dataSetContactTicket0status: ContactTicketStatus.ONGOING,
    };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    const dataExpect = await testApp.models.Data.findOne();
    // result from apollo request
    expect(res.data.dataSetContactTicket.status).equal(ContactTicketStatus.ONGOING);
    // data before
    expect(data.contactTicket.status).equal(ContactTicketStatus.TO_RECONTACT);
    // data after
    expect(dataExpect.contactTicket.status).equal(ContactTicketStatus.ONGOING);
  });
});
