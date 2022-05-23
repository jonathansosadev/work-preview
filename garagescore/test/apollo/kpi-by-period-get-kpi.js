const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const { ObjectId } = require('mongodb');
const kpiType = require('../../common/models/kpi-type');
const app = new TestApp();

const kpiDb = require('./dumps/kpiByPeriod.json');

const query = `query kpiByPeriodGetKpi($periodId: String!, $cockpitType: String, $garageId: [String], $userId: String, $kpiType: Int ) {
    kpiByPeriodGetKpi(periodId: $periodId, cockpitType: $cockpitType, garageId: $garageId, userId: $userId, kpiType: $kpiType ) {
          garagesKpi {
                countLeads
                countLeadsUntouched
                countLeadsTouched
                countLeadsClosedWithSale
                countLeadsUnassigned
                countLeadsAssigned
                countLeadsWaitingForContact
                countLeadsContactPlanned
                countLeadsWaitingForMeeting
                countLeadsMeetingPlanned
                countLeadsWaitingForProposition
                countLeadsPropositionPlanned
                countLeadsWaitingForClosing
                countLeadsClosedWithoutSale
                countUnsatisfiedUntouched
                countUnsatisfied
                countUnsatisfiedTouched
                countUnsatisfiedClosedWithResolution
                countUnsatisfiedTouchedClosed
                countUnsatisfiedOpenUnassigned
                countUnsatisfiedAssigned
                countUnsatisfiedWaitingForContact
                countUnsatisfiedContactPlanned
                countUnsatisfiedWaitingForVisit
                countUnsatisfiedVisitPlanned
                countUnsatisfiedWaitingForClosing
                countUnsatisfiedClosedWithoutResolution
          }
          usersKpi {
                countLeads
                countLeadsUntouched
                countLeadsTouched
                countLeadsClosedWithSale
                countLeadsUnassigned
                countLeadsAssigned
                countLeadsWaitingForContact
                countLeadsContactPlanned
                countLeadsWaitingForMeeting
                countLeadsMeetingPlanned
                countLeadsWaitingForProposition
                countLeadsPropositionPlanned
                countLeadsWaitingForClosing
                countLeadsClosedWithoutSale
                countUnsatisfiedUntouched
                countUnsatisfied
                countUnsatisfiedTouched
                countUnsatisfiedClosedWithResolution
                countUnsatisfiedTouchedClosed
                countUnsatisfiedOpenUnassigned
                countUnsatisfiedAssigned
                countUnsatisfiedWaitingForContact
                countUnsatisfiedContactPlanned
                countUnsatisfiedWaitingForVisit
                countUnsatisfiedVisitPlanned
                countUnsatisfiedWaitingForClosing
                countUnsatisfiedClosedWithoutResolution
          }
         }
   }`;
describe('apollo::kpiByPeriodGetKpi', async () => {
  let godUser;
  let allGarages;
  let garage1;
  let garage2;

  before(async function before() {
    await app.reset();
    // create datas for test
    allGarages = [await app.addGarage(), await app.addGarage()];
    garage1 = allGarages[0];
    garage2 = allGarages[1];
    godUser = await app.addUser({
      garageIds: allGarages.map((garage) => garage.getId()),
      authorization: { ACCESS_TO_COCKPIT: true },
    });

    Object.keys(kpiDb).forEach((kpiType) => {
      kpiDb[kpiType].forEach(async (kpi) => {
        kpi['0'] = ObjectId(allGarages[0].getId());
        kpi['1'] = ObjectId(godUser.getId());
        await app.models.KpiByPeriod.getMongoConnector().insert(kpi);
      });
    });
  });

  it('should get all kpi with kpiType = AGENT_GARAGE_KPI for one garage', async () => {
    // apollo request
    const variablesApollo = {
      periodId: '2020',
      cockpitType: 'Dealership',
      kpiType: kpiType.AGENT_GARAGE_KPI,
      garageId: [garage1.getId()],
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.errors).to.be.undefined;
    expect(queryRes.data).to.be.an('object').which.have.keys('kpiByPeriodGetKpi');
    expect(queryRes.data.kpiByPeriodGetKpi).to.be.an('object').which.have.keys('garagesKpi', 'usersKpi');
    expect(queryRes.data.kpiByPeriodGetKpi['garagesKpi'])
      .to.be.an('object')
      .which.have.keys(
        'countLeads',
        'countLeadsUntouched',
        'countLeadsTouched',
        'countLeadsClosedWithSale',
        'countLeadsUnassigned',
        'countLeadsAssigned',
        'countLeadsWaitingForContact',
        'countLeadsContactPlanned',
        'countLeadsWaitingForMeeting',
        'countLeadsMeetingPlanned',
        'countLeadsWaitingForProposition',
        'countLeadsPropositionPlanned',
        'countLeadsWaitingForClosing',
        'countLeadsClosedWithoutSale',
        'countUnsatisfiedUntouched',
        'countUnsatisfied',
        'countUnsatisfiedTouched',
        'countUnsatisfiedClosedWithResolution',
        'countUnsatisfiedTouchedClosed',
        'countUnsatisfiedOpenUnassigned',
        'countUnsatisfiedAssigned',
        'countUnsatisfiedWaitingForContact',
        'countUnsatisfiedContactPlanned',
        'countUnsatisfiedWaitingForVisit',
        'countUnsatisfiedVisitPlanned',
        'countUnsatisfiedWaitingForClosing',
        'countUnsatisfiedClosedWithoutResolution'
      );
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeads']).to.be.equal(5);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsUntouched']).to.be.equal(1);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsTouched']).to.be.equal(4);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsMeetingPlanned']).to.be.null;
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countUnsatisfiedUntouched']).to.be.equal(0);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countUnsatisfiedWaitingForContact']).to.be.null;
    expect(queryRes.data.kpiByPeriodGetKpi.usersKpi).to.be.null;
  });

  it('should get all kpi with kpiType = AGENT_GARAGE_KPI for a list of garages', async () => {
    // apollo request
    const variablesApollo = {
      periodId: '2020',
      cockpitType: 'Dealership',
      kpiType: kpiType.AGENT_GARAGE_KPI,
      garageId: [garage1.getId(), garage2.getId()],
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.errors).to.be.undefined;
    expect(queryRes.data).to.be.an('object').which.have.keys('kpiByPeriodGetKpi');
    expect(queryRes.data.kpiByPeriodGetKpi).to.be.an('object').which.have.keys('garagesKpi', 'usersKpi');
    expect(queryRes.data.kpiByPeriodGetKpi['garagesKpi'])
      .to.be.an('object')
      .which.have.keys(
        'countLeads',
        'countLeadsUntouched',
        'countLeadsTouched',
        'countLeadsClosedWithSale',
        'countLeadsUnassigned',
        'countLeadsAssigned',
        'countLeadsWaitingForContact',
        'countLeadsContactPlanned',
        'countLeadsWaitingForMeeting',
        'countLeadsMeetingPlanned',
        'countLeadsWaitingForProposition',
        'countLeadsPropositionPlanned',
        'countLeadsWaitingForClosing',
        'countLeadsClosedWithoutSale',
        'countUnsatisfiedUntouched',
        'countUnsatisfied',
        'countUnsatisfiedTouched',
        'countUnsatisfiedClosedWithResolution',
        'countUnsatisfiedTouchedClosed',
        'countUnsatisfiedOpenUnassigned',
        'countUnsatisfiedAssigned',
        'countUnsatisfiedWaitingForContact',
        'countUnsatisfiedContactPlanned',
        'countUnsatisfiedWaitingForVisit',
        'countUnsatisfiedVisitPlanned',
        'countUnsatisfiedWaitingForClosing',
        'countUnsatisfiedClosedWithoutResolution'
      );
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeads']).to.be.equal(5);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsUntouched']).to.be.equal(1);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsTouched']).to.be.equal(4);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsMeetingPlanned']).to.be.null;
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countUnsatisfiedUntouched']).to.be.equal(0);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countUnsatisfiedWaitingForContact']).to.be.null;
    expect(queryRes.data.kpiByPeriodGetKpi.usersKpi).to.be.null;
  });

  it('should get all kpi with kpiType = USER_KPI & GARAGE_KPI by default', async () => {
    // apollo request
    const variablesApollo = {
      periodId: '2020',
      cockpitType: 'Dealership',
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.errors).to.be.undefined;
    expect(queryRes.data).to.be.an('object').which.have.keys('kpiByPeriodGetKpi');
    expect(queryRes.data.kpiByPeriodGetKpi).to.be.an('object').which.have.keys('garagesKpi', 'usersKpi');
    for (const key in queryRes.data.kpiByPeriodGetKpi) {
      expect(queryRes.data.kpiByPeriodGetKpi[key])
        .to.be.an('object')
        .which.have.keys(
          'countLeads',
          'countLeadsUntouched',
          'countLeadsTouched',
          'countLeadsClosedWithSale',
          'countLeadsUnassigned',
          'countLeadsAssigned',
          'countLeadsWaitingForContact',
          'countLeadsContactPlanned',
          'countLeadsWaitingForMeeting',
          'countLeadsMeetingPlanned',
          'countLeadsWaitingForProposition',
          'countLeadsPropositionPlanned',
          'countLeadsWaitingForClosing',
          'countLeadsClosedWithoutSale',
          'countUnsatisfiedUntouched',
          'countUnsatisfied',
          'countUnsatisfiedTouched',
          'countUnsatisfiedClosedWithResolution',
          'countUnsatisfiedTouchedClosed',
          'countUnsatisfiedOpenUnassigned',
          'countUnsatisfiedAssigned',
          'countUnsatisfiedWaitingForContact',
          'countUnsatisfiedContactPlanned',
          'countUnsatisfiedWaitingForVisit',
          'countUnsatisfiedVisitPlanned',
          'countUnsatisfiedWaitingForClosing',
          'countUnsatisfiedClosedWithoutResolution'
        );
    }
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeads']).to.be.equal(46);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsUntouched']).to.be.equal(23);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsClosedWithoutSale']).to.be.equal(null);
    expect(queryRes.data.kpiByPeriodGetKpi.usersKpi['countLeads']).to.be.equal(44);
    expect(queryRes.data.kpiByPeriodGetKpi.usersKpi['countLeadsUntouched']).to.be.equal(2);
    expect(queryRes.data.kpiByPeriodGetKpi.usersKpi['countUnsatisfiedOpenUnassigned']).to.be.equal(0);
  });

  it('should get all kpi with kpiType = AGENT_GARAGE_KPI', async () => {
    // apollo request
    const variablesApollo = {
      periodId: '2020',
      cockpitType: 'Dealership',
      kpiType: kpiType.AGENT_GARAGE_KPI,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.errors).to.be.undefined;
    expect(queryRes.data).to.be.an('object').which.have.keys('kpiByPeriodGetKpi');
    expect(queryRes.data.kpiByPeriodGetKpi).to.be.an('object').which.have.keys('garagesKpi', 'usersKpi');
    expect(queryRes.data.kpiByPeriodGetKpi['garagesKpi'])
      .to.be.an('object')
      .which.have.keys(
        'countLeads',
        'countLeadsUntouched',
        'countLeadsTouched',
        'countLeadsClosedWithSale',
        'countLeadsUnassigned',
        'countLeadsAssigned',
        'countLeadsWaitingForContact',
        'countLeadsContactPlanned',
        'countLeadsWaitingForMeeting',
        'countLeadsMeetingPlanned',
        'countLeadsWaitingForProposition',
        'countLeadsPropositionPlanned',
        'countLeadsWaitingForClosing',
        'countLeadsClosedWithoutSale',
        'countUnsatisfiedUntouched',
        'countUnsatisfied',
        'countUnsatisfiedTouched',
        'countUnsatisfiedClosedWithResolution',
        'countUnsatisfiedTouchedClosed',
        'countUnsatisfiedOpenUnassigned',
        'countUnsatisfiedAssigned',
        'countUnsatisfiedWaitingForContact',
        'countUnsatisfiedContactPlanned',
        'countUnsatisfiedWaitingForVisit',
        'countUnsatisfiedVisitPlanned',
        'countUnsatisfiedWaitingForClosing',
        'countUnsatisfiedClosedWithoutResolution'
      );
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeads']).to.be.equal(5);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsUntouched']).to.be.equal(1);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsTouched']).to.be.equal(4);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countLeadsMeetingPlanned']).to.be.null;
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countUnsatisfiedUntouched']).to.be.equal(0);
    expect(queryRes.data.kpiByPeriodGetKpi.garagesKpi['countUnsatisfiedWaitingForContact']).to.be.null;
    expect(queryRes.data.kpiByPeriodGetKpi.usersKpi).to.be.null;
  });
});
