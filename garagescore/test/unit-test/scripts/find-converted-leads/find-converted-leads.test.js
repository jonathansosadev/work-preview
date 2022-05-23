const TestApp = require('../../../../common/lib/test/test-app');
const chai = require('chai');
const { ObjectId } = require('mongodb');

const expect = chai.expect;
const app = new TestApp();

const { findConvertedLeads } = require('../../../../common/lib/garagescore/find-converted-leads/find-converted-leads');
const { dataClosedWithoutSale, convertedSaleDataClosedWithoutSale } = require('./data-closed-without-sale');
const { dataClosedWithSale, convertedSaleDataClosedWithSale } = require('./data-closed-with-sale');
const { dataNotClosed, convertedSaleDataNotClosed } = require('./data-not-closed');
const { CLOSED_WITH_SALE } = require('../../../../common/models/data/type/lead-ticket-status');
const { TicketActionNames } = require('../../../../frontend/utils/enumV2');

describe('Find-converted-leads', () => {
  let garage;
  beforeEach(async function () {
    await app.reset();
    garage = await app.addGarage({ _id: '577a30d774616c1a0056c263' });
  });

  describe('findConvertedLeads', () => {
    it('Ticket closed without a sale : should reopen the ticket and closed it', async () => {
      /* Arrange */
      const data = await app.addData({ ...dataClosedWithoutSale, garageId: garage.id.toString() });
      await app.addData({ ...convertedSaleDataClosedWithoutSale, garageId: garage.id.toString() });

      /* Act */
      await findConvertedLeads({}, () => { }, app);
      await app.models.Data.leadTicket_closeTicketsConvertedToSale();

      /* Assert */
      const res = await app.models.Data.getMongoConnector().findOne({ _id: data.id }); 
      // check status : closed
      expect(res.leadTicket.status).to.be.equal(CLOSED_WITH_SALE);
      // check actions : reopened + closed (+2 actions)
      expect(res.leadTicket.actions.length).to.be.equal(data.leadTicket.actions.length + 2);
      expect(res.leadTicket.actions[res.leadTicket.actions.length-2].name).to.be.equal(TicketActionNames.LEAD_REOPENED);
      expect(res.leadTicket.actions[res.leadTicket.actions.length-1].name).to.be.equal(TicketActionNames.LEAD_CLOSED);
      expect(res.leadTicket.actions[res.leadTicket.actions.length-1].automaticClose).to.be.true;
    });

    it('Ticket closed with a sale : should keep the same status and the same history', async () => {
       /* Arrange */
      const initialData = await app.addData({ ...dataClosedWithSale, garageId: garage.id.toString() });
      await app.addData({ ...convertedSaleDataClosedWithSale, garageId: garage.id.toString() });

      /* Act */
      await findConvertedLeads({}, () => { }, app);
      await app.models.Data.leadTicket_closeTicketsConvertedToSale();

      /* Assert */
      const res = await app.models.Data.getMongoConnector().findOne({ _id: initialData.id }); 
      // check status : closed
      expect(res.leadTicket.status).to.be.equal(CLOSED_WITH_SALE);
      // check actions : nothing (+0 action)
      expect(res.leadTicket.actions.length).to.be.equal(initialData.leadTicket.actions.length);
    });

    it('Ticket not closed : should close the ticket', async () => {
      /* Arrange */
      const initialData = await app.addData({ ...dataNotClosed, garageId: garage.id.toString() });
      await app.addData({ ...convertedSaleDataNotClosed, garageId: garage.id.toString() });

      /* Act */
      await findConvertedLeads({}, () => { }, app);
      await app.models.Data.leadTicket_closeTicketsConvertedToSale();

      /* Assert */
      const res = await app.models.Data.getMongoConnector().findOne({ _id: initialData.id });
      // check status : closed
      expect(res.leadTicket.status).to.be.equal(CLOSED_WITH_SALE);
      // check actions : closed (+1 action)
      expect(res.leadTicket.actions.length).to.be.equal(initialData.leadTicket.actions.length + 1);
      expect(res.leadTicket.actions[res.leadTicket.actions.length-1].name).to.be.equal(TicketActionNames.LEAD_CLOSED);
      expect(res.leadTicket.actions[res.leadTicket.actions.length-1].automaticClose).to.be.true;
    });
  });
});
