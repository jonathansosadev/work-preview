const { expect } = require('chai');
const { ObjectID } = require('mongodb');
const TestApp = require('../../common/lib/test/test-app');
const { TicketActionNames } = require('../../frontend/utils/enumV2');
const GarageTypes = require('../../common/models/garage.type');
const KpiTypes = require('../../common/models/kpi-type');
const KpiPeriods = require('../../common/lib/garagescore/kpi/KpiPeriods');
const KpiDictionnary = require('../../common/lib/garagescore/kpi/KpiDictionary');
const _sendQueryAs = require('./_send-query-as');
const testApp = new TestApp();

describe('Apollo - request dataSetAction', async function () {
  beforeEach(async function () {
    await testApp.reset();
  });

  it('Should add action and self assign ticket', async function () {
    const user = await testApp.addUser({ email: 'user@custeed.com' });
    const garage1 = await testApp.addGarage();
    // create kpibyperiod document
    await user.addGarage(garage1);
    await testApp.models.KpiByPeriod.getMongoConnector().insertMany([
      {
        [KpiDictionnary.garageId]: new ObjectID(garage1.id),
        [KpiDictionnary.kpiType]: KpiTypes.GARAGE_KPI,
        [KpiDictionnary.garageType]: GarageTypes.getIntegerVersion(GarageTypes.DEALERSHIP),
        [KpiDictionnary.period]: KpiPeriods.LAST_90_DAYS,
      },
    ]);

    let data = await testApp.models.Data.create({
      garageId: garage1.id.toString(),
      type: 'Maintenance',
      garageType: 'Dealership',
      source: {
        type: 'LeBonCoin',
      },
      leadTicket: {
        createdAt: new Date(),
        touched: false,
        reactive: false,
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
            sourceType: 'LeBonCoin',
            email: 'enibas@xlead.fr',
            lastName: 'Jo',
            message: 'Jo le bricoleur',
          },
        ],
        crossLeadData: true,
        sourceSubtype: 'LeBonCoinVo',
      },
    });
    const request = `
    mutation dataSetAction_HeDbdfFdBdCedcfEJdEbbabIacdddHJe ($dataSetAction0id: String,$dataSetAction0name: String,$dataSetAction0createdAt: String,$dataSetAction0type: String,$dataSetAction0assignerUserId: String,$dataSetAction0comment: String,$dataSetAction0alertContributors: Boolean) {
    dataSetAction (id: $dataSetAction0id,name: $dataSetAction0name,createdAt: $dataSetAction0createdAt,type: $dataSetAction0type,assignerUserId: $dataSetAction0assignerUserId,comment: $dataSetAction0comment,alertContributors: $dataSetAction0alertContributors) {
        message
        status
      }
    }
    `;
    const variables = {
      dataSetAction0alertContributors: false,
      dataSetAction0assignerUserId: user.id.toString(),
      dataSetAction0comment: 'call of Cthulhu !',
      dataSetAction0createdAt: new Date().toString(),
      dataSetAction0id: data.id.toString(),
      dataSetAction0name: TicketActionNames.CUSTOMER_CALL,
      dataSetAction0type: 'lead',
    };
    const res = await _sendQueryAs(testApp, request, variables, user.userId);
    const dataExpect = await testApp.models.Data.findOne();
    const customerCall = dataExpect.leadTicket.actions.find(({ name }) => name === TicketActionNames.CUSTOMER_CALL);
    const selfAssign = dataExpect.leadTicket.actions.find(({ name }) => name === TicketActionNames.TRANSFER);

    expect(res.data.dataSetAction.status).equal('OK');
    expect(res.data.dataSetAction.message).equal('Action added successfully');
    expect(customerCall.name).equal(TicketActionNames.CUSTOMER_CALL);
    expect(selfAssign.name).equal(TicketActionNames.TRANSFER);
    expect(selfAssign.assignerUserId).equal(user.id.toString());
    expect(dataExpect.leadTicket.actions.length > data.leadTicket.actions.length).equal(true);
  });
});
