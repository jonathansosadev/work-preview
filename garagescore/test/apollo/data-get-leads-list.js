const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const exampleData = require('./examples/data-with-lead-ticket.js');

const { expect } = chai;
const app = new TestApp();

describe('apollo::dataGetLeadsList', () => {
  let allGarages;
  let allLeads;
  let godUser;

  beforeEach(async () => {
    await app.reset();
    // create datas for test
    await app.restore(path.resolve(`${__dirname}/dumps/garages-dealership-cockpit.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/data-get-leads-list.dump`));
    allGarages = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true } })
      .toArray();
    allLeads = await app.models.Data.getMongoConnector()
      .find(
        {},
        {
          projection: { _id: true, 'leadTicket.referenceDate': true, garageId: true },
          sort: { 'leadTicket.referenceDate': -1 },
        }
      )
      .toArray();
    godUser = await app.addUser({ garageIds: allGarages.map(({ _id }) => _id) });
  });



  it('dataGetLeadsList returns leads for one garages', async () => {
    const garageStringId = allLeads[0].garageId;
    const nLeads = allLeads.filter(({ garageId }) => (garageId === garageStringId)).length;
    const user = await app.addUser({ garageIds: [new ObjectId(garageStringId)] });
    const query = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
          garage {
            id
          }
        }
      }
    }`;
    const variablesApollo = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      garageId: [garageStringId],
      cockpitType: 'Dealership',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    const { datas } = res.data.dataGetLeadsList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(nLeads);
    for (let i = 0; i < datas.length; i++) {
      const { garage } = datas[i];
      expect([garageStringId]).to.includes(garage.id.toString());
    }
  });

  it('dataGetLeadsList returns leads for a list of garages', async () => {
    const garageStringId = allLeads[0].garageId;
    const garageStringId2 = allLeads[1].garageId;
    const nLeads = allLeads.filter(({ garageId }) => (garageId === garageStringId || garageId === garageStringId2)).length;
    const user = await app.addUser({ garageIds: [new ObjectId(garageStringId), new ObjectId(garageStringId2)] });
    const query = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
          garage {
            id
          }
        }
      }
    }`;
    const variablesApollo = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      garageId: [garageStringId, garageStringId2],
      cockpitType: 'Dealership',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    const { datas } = res.data.dataGetLeadsList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(nLeads);
    for (let i = 0; i < datas.length; i++) {
      const { garage } = datas[i];
      expect([garageStringId, garageStringId2]).to.includes(garage.id.toString());
    }
  });


  it('dataGetLeadsList returns list of leads', async () => {
    // apollo request
    const query = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
          garage {
            id
          }
        }
        hasMore
      }
    }`;
    // apollo variables
    const variablesApollo = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result
    const { datas, hasMore } = queryRes.data.dataGetLeadsList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(10);
    expect(hasMore).to.be.true;
    for (let i = 0; i < datas.length; i++) {
      const { id } = datas[i];
      expect(id).to.equal(allLeads[i]._id.toString());
    }
  });

  it('dataGetLeadsList paginates', async () => {
    // apollo request
    const query = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
          leadTicket {
            referenceDate
          }
        }
        hasMore
        cursor
      }
    }`;
    // apollo variables
    const variablesApolloPage1 = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };
    // send query 1st page
    const resPage1 = await sendQueryAs(app, query, variablesApolloPage1, godUser.getId());
    // result 1st page
    const { hasMore, cursor, datas } = resPage1.data.dataGetLeadsList;
    expect(hasMore).to.be.true;
    expect(cursor).not.to.be.null;
    expect(new Date(cursor)).to.deep.equal(new Date(allLeads[datas.length - 1].leadTicket.referenceDate));
    expect(new Date(cursor)).to.deep.equal(new Date(datas[datas.length - 1].leadTicket.referenceDate));

    // send query 2nd page
    const variablesApolloPage2 = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
      before: cursor,
    };
    // send query 2nd page
    const resPage2 = await sendQueryAs(app, query, variablesApolloPage2, godUser.getId());
    const { hasMore: hasMore2, cursor: cursor2, datas: datas2 } = resPage2.data.dataGetLeadsList;
    expect(hasMore2).to.be.true;
    expect(cursor2).not.to.be.null;
    expect(datas2).to.be.an('Array').and.to.have.lengthOf(10);
    for (let i = 0; i < datas2.length; i++) {
      const { id } = datas2[i];
      expect(id).to.equal(allLeads[10 + i]._id.toString());
    }
  });

  it('dataGetLeadsList returns leads only for garages in scope', async () => {
    const garageStringId = allLeads[0].garageId;
    const nLeads = allLeads.filter(({ garageId }) => garageId === garageStringId).length;
    const user = await app.addUser({ garageIds: [new ObjectId(garageStringId)] });
    const query = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
          garage {
            id
          }
        }
      }
    }`;
    const variablesApollo = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    const { datas } = res.data.dataGetLeadsList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(nLeads);
    const representedGarageIds = datas.map(({ garage }) => garage.id).filter((gId, i, a) => a.indexOf(gId) === i);
    expect(representedGarageIds).to.have.lengthOf(1).and.to.contain(garageStringId);
  });

  it('dataGetLeadsList returns 0 lead if 0 garages in scope', async () => {
    const user = await app.addUser({});
    const query = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
        }
        hasMore
        cursor
      }
    }`;
    const variablesApollo = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    expect(res.data.dataGetLeadsList.datas).to.have.lengthOf(0);
  });

});


describe('dataGetLeadsList reteurn leads list in function of manager settings', () => {
  beforeEach(async function () {
    await app.reset();
  });

  it('No Manager user sould not see leads of another user', async function test() {
    const garageTest = await app.addGarage();
    const garage = await garageTest.getInstance();

    await app.models.UserJob.getMongoConnector().insertOne({
      name: 'ManagerJob',
      isManager: true,
    });

    await app.models.UserJob.getMongoConnector().insertOne({
      name: 'NoManagerJob',
      isManager: false,
    });

    const managerUser = await app.addUser({
      email: 'managerUser@exemple.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      garageIds: [garage.id],
      job: 'ManagerJob',
    });

    const noManagerUser = await app.addUser({
      email: 'noManagerUser@exemple.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      garageIds: [garage.id],
      job: 'NoManagerJob',
    });

    exampleData.leadTicket.manager = managerUser.getId();
    exampleData.garageId = garageTest.getId();
    exampleData.leadTicket.referenceDate = new Date();

    await app.models.Data.create(exampleData);

    const request = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
        }
      }
    }`;
    const variables = {
      limit: 1,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };

    const req = await sendQueryAs(app, request, variables, noManagerUser.getId());
    expect(req.errors, JSON.stringify(req.errors, null, 2)).to.be.undefined;
    expect(req.data.dataGetLeadsList.datas.length).to.equal(0);

  });

  it('Manager user sould see leads of another user', async function test() {
    const garageTest = await app.addGarage();
    const garage = await garageTest.getInstance();

    await app.models.UserJob.getMongoConnector().insertOne({
      name: 'ManagerJob',
      isManager: true,
    });

    await app.models.UserJob.getMongoConnector().insertOne({
      name: 'NoManagerJob',
      isManager: true,
    });

    const managerUser = await app.addUser({
      email: 'managerUser@exemple.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      garageIds: [garage.id],
      job: 'ManagerJob',
    });

    const noManagerUser = await app.addUser({
      email: 'noManagerUser@exemple.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      garageIds: [garage.id],
      job: 'NoManagerJob',
    });

    exampleData.leadTicket.manager = managerUser.getId();
    exampleData.garageId = garageTest.getId();
    exampleData.leadTicket.referenceDate = new Date();

    await app.models.Data.create(exampleData);

    const request = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
        }
      }
    }`;
    const variables = {
      limit: 1,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };

    const req = await sendQueryAs(app, request, variables, noManagerUser.getId());
    expect(req.errors, JSON.stringify(req.errors, null, 2)).to.be.undefined;
    expect(req.data.dataGetLeadsList.datas.length).to.equal(1);

  });

  it('No Manager user sould see leads of another user if garage.leadsVisibleToEveryone = true', async function test() {
    const garageTest = await app.addGarage({ leadsVisibleToEveryone: true });
    const garage = await garageTest.getInstance();

    await app.models.UserJob.getMongoConnector().insertOne({
      name: 'ManagerJob',
      isManager: true,
    });

    await app.models.UserJob.getMongoConnector().insertOne({
      name: 'NoManagerJob',
      isManager: false,
    });

    const managerUser = await app.addUser({
      email: 'managerUser@exemple.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      garageIds: [garage.id],
      job: 'ManagerJob',
    });

    const noManagerUser = await app.addUser({
      email: 'noManagerUser@exemple.com',
      firstName: 'Dwight',
      lastName: 'Schrute',
      garageIds: [garage.id],
      job: 'NoManagerJob',
    });

    exampleData.leadTicket.manager = managerUser.getId();
    exampleData.garageId = garageTest.getId();
    exampleData.leadTicket.referenceDate = new Date();

    await app.models.Data.create(exampleData);

    const request = `query dataGetLeadsList($limit: Int, $before: Date, $followed: Boolean, $periodId: String!, $garageId: [String], $cockpitType: String, $search: String, $leadBodyType: String, $leadFinancing: String, $leadTiming: String, $leadSaleType: String, $leadManager: String, $leadStatus: String, $leadSource: String, $followupLeadStatus: String) {
      dataGetLeadsList(limit: $limit, before: $before, followed: $followed, periodId: $periodId, garageId: $garageId, cockpitType: $cockpitType, search: $search, leadBodyType: $leadBodyType, leadFinancing: $leadFinancing, leadTiming: $leadTiming, leadSaleType: $leadSaleType, leadManager: $leadManager, leadStatus: $leadStatus, leadSource: $leadSource, followupLeadStatus: $followupLeadStatus) {
        datas {
          id
        }
      }
    }`;
    const variables = {
      limit: 1,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
    };

    const req = await sendQueryAs(app, request, variables, noManagerUser.getId());
    expect(req.errors, JSON.stringify(req.errors, null, 2)).to.be.undefined;
    expect(req.data.dataGetLeadsList.datas.length).to.equal(1);

  });
})