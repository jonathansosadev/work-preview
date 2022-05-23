const chai = require('chai');
const path = require('path');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');

const expect = chai.expect;
const app = new TestApp();

describe('apollo::kpiByPeriodGetList', () => {
  let allGarages;
  let godUser;
  let garage1;
  let garage2;

  beforeEach(async function beforeEach() {
    await app.reset();
    // create datas for test
    await app.restore(path.resolve(`${__dirname}/dumps/garage-kpi-by-period-list.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/user-kpiByPeriod-list.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/kpiByPeriod-list.dump`));
    allGarages = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true } })
      .toArray();
    garage1 = allGarages[Math.floor(Math.random() * allGarages.length)]
    garage2 = allGarages[Math.floor(Math.random() * allGarages.length)]
    godUser = await app.addUser({ garageIds: allGarages.map(({ _id }) => _id) });
  });

  it('kpiByPeriodGetList returns kpi list (view: leads/garages)', async () => {
    // apollo request
    const query = `
    query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
      kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
        list {
          garageId
          displayName
          hideDirectoryPage
          countLeads
          countLeadsUntouched
          countLeadsTouched
          countLeadsClosedWithSale
          countLeadsReactive
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
          userId
        }
        hasMore
      }
    }
    `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'lead',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: '',
      skip: 0,
      sort: 'countLeads',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result
    expect(queryRes.data.kpiByPeriodGetList.list.length).equal(1);
    expect(queryRes.data.kpiByPeriodGetList.list[0].hideDirectoryPage).equal(true);
    expect(queryRes.data.kpiByPeriodGetList.list[0].displayName).equal('Garage Dupont');
    expect(queryRes.data.kpiByPeriodGetList.list[0].countLeads).equal(484);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countLeadsUntouched).equal(57);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countLeadsTouched).equal(28);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countLeadsClosedWithSale).equal(0);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countLeadsReactive).equal(347);
    expect(queryRes.data.kpiByPeriodGetList.hasMore).not.null;
  });

  it('kpiByPeriodGetList search externalId (view: leads/garages)', async () => {
    // apollo request
    const query = `
    query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
      kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
        list {
          garageId
          externalId
          displayName
          hideDirectoryPage
          countLeads
          countLeadsUntouched
          countLeadsTouched
          countLeadsClosedWithSale
          countLeadsReactive
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
          userId
        }
        hasMore
      }
    }
    `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'lead',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: 'garagescore',
      skip: 0,
      sort: 'countLeads',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.data.kpiByPeriodGetList.list.length).equal(1);
    expect(queryRes.data.kpiByPeriodGetList.list[0].externalId).equal('GarageScore');
    expect(queryRes.data.kpiByPeriodGetList.list[0].displayName).equal('Garage Dupont');
  });

  it('kpiByPeriodGetList returns kpi list (view: unsatisfied/garages)', async () => {
    // apollo request
    const query = `
    query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
      kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
        list {
          displayName
          hideDirectoryPage
          countUnsatisfied
          countUnsatisfiedUntouched
          countUnsatisfiedTouched
          countUnsatisfiedClosedWithResolution
          countUnsatisfiedReactive
          garageId
          userId
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
        }
        hasMore
      }
    }
    `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'unsatisfied',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: '',
      skip: 0,
      sort: 'countLeads',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result
    expect(queryRes.data.kpiByPeriodGetList.list.length).equal(1);
    expect(queryRes.data.kpiByPeriodGetList.list[0].hideDirectoryPage).equal(true);
    expect(queryRes.data.kpiByPeriodGetList.list[0].displayName).equal('Garage Dupont');
    expect(queryRes.data.kpiByPeriodGetList.list[0].countUnsatisfied).equal(522);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countUnsatisfiedUntouched).equal(285);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countUnsatisfiedTouched).equal(237);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countUnsatisfiedClosedWithResolution).equal(128);
    expect(queryRes.data.kpiByPeriodGetList.list[0].countUnsatisfiedReactive).equal(125);
    expect(queryRes.data.kpiByPeriodGetList.hasMore).not.null;
  });

  it('kpiByPeriodGetList Search externalId (view: unsatisfied/garages)', async () => {
    // apollo request
    const query = `
    query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
      kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
        list {
          displayName
          hideDirectoryPage
          countUnsatisfied
          countUnsatisfiedUntouched
          countUnsatisfiedTouched
          countUnsatisfiedClosedWithResolution
          countUnsatisfiedReactive
          garageId
          externalId
          userId
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
        }
        hasMore
      }
    }
    `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'unsatisfied',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: 'GarageScore',
      skip: 0,
      sort: 'countLeads',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());

    // result
    expect(queryRes.data.kpiByPeriodGetList.list.length).equal(1);
    expect(queryRes.data.kpiByPeriodGetList.list[0].externalId).equal('GarageScore');
    expect(queryRes.data.kpiByPeriodGetList.list[0].displayName).equal('Garage Dupont');
  });

  it('kpiByPeriodGetList returns kpi list (view: leads/team)', async () => {
    // apollo request
    const query = `
    query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
      kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
        list {
          garageId
          displayName
          countLeads
          countLeadsUntouched
          countLeadsTouched
          countLeadsClosedWithSale
          countLeadsReactive
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
          userId
        }
        hasMore
      }
    }
    `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'users',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'lead',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: '',
      skip: 0,
      sort: 'countLeads',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result (first 2 results are unassigned and deletedUser meh)
    expect(queryRes.data.kpiByPeriodGetList.list.length).equal(10);
    expect(queryRes.data.kpiByPeriodGetList.list[2].displayName).equal('Dupont Francois');
    expect(queryRes.data.kpiByPeriodGetList.list[2].countLeads).equal(61);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countLeadsUntouched).equal(1);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countLeadsTouched).equal(1);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countLeadsClosedWithSale).equal(0);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countLeadsReactive).equal(48);
    expect(queryRes.data.kpiByPeriodGetList.hasMore).not.null;
  });

  it('kpiByPeriodGetList returns kpi list (view: unsatisfied/team)', async () => {
    // apollo request
    const query = `
    query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
      kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
        list {
          displayName
          countUnsatisfied
          countUnsatisfiedUntouched
          countUnsatisfiedTouched
          countUnsatisfiedClosedWithResolution
          countUnsatisfiedReactive
          garageId
          userId
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
        }
        hasMore
      }
    }
    `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'users',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'unsatisfied',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: '',
      skip: 0,
      sort: 'countUnsatisfied',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result (first 2 results are unassigned and deletedUser meh)
    expect(queryRes.data.kpiByPeriodGetList.list.length).equal(10);
    expect(queryRes.data.kpiByPeriodGetList.list[2].displayName).equal('Dupont Francois');
    expect(queryRes.data.kpiByPeriodGetList.list[2].countUnsatisfied).equal(64);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countUnsatisfiedUntouched).equal(49);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countUnsatisfiedTouched).equal(15);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countUnsatisfiedClosedWithResolution).equal(7);
    expect(queryRes.data.kpiByPeriodGetList.list[2].countUnsatisfiedReactive).equal(11);
    expect(queryRes.data.kpiByPeriodGetList.hasMore).not.null;
  });

  it('kpiByPeriodGetList returns the garage searched (view: lead/garages)', async () => {
    // apollo request
    const query = `
      query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
        kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
          list {
            garageId
            displayName
            garagePublicDisplayName
          }
        }
      }
      `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'lead',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: 'Dupont',
      skip: 0,
      sort: 'countLeads',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    // result
    expect(queryRes.data.kpiByPeriodGetList.list).not.to.be.null;
    for (const { displayName, garagePublicDisplayName } of queryRes.data.kpiByPeriodGetList.list) {
      expect(displayName).to.have.string('Dupont');
      expect(garagePublicDisplayName).to.have.string('Dupont');
    }
  });

  it('kpiByPeriodGetList returns the user searched (view: unsatisfied/garages)', async () => {
    // apollo request
    const query = `
      query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
        kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
          list {
            displayName
            garagePublicDisplayName
          }
        }
      }
      `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: null,
      limit: 10,
      listType: 'unsatisfied',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: 'Dupont',
      skip: 0,
      sort: 'countUnsatisfied',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    for (const { displayName, garagePublicDisplayName } of queryRes.data.kpiByPeriodGetList.list) {
      expect(displayName).to.have.string('Dupont');
      expect(garagePublicDisplayName).to.have.string('Dupont');
    }
  });

  it('kpiByPeriodGetList for one garage', async () => {
    // apollo request
    const query = `
      query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
        kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
          list {
            displayName
            garagePublicDisplayName
          }
        }
      }
      `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: [garage1._id.toString()],
      limit: 10,
      listType: 'unsatisfied',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: 'Dupont',
      skip: 0,
      sort: 'countUnsatisfied',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    for (const { displayName, garagePublicDisplayName } of queryRes.data.kpiByPeriodGetList.list) {
      expect(displayName).to.have.string('Dupont');
      expect(garagePublicDisplayName).to.have.string('Dupont');
    }
  });

  it('kpiByPeriodGetList for a list of garages', async () => {
    // apollo request
    const query = `
      query kpiByPeriodGetList ($cockpitInterface: String,$periodId: String!,$garageId: [String],$cockpitType: String,$sort: String,$order: String,$search: String,$limit: Int,$skip: Int,$userId: String,$listType: String) {
        kpiByPeriodGetList (cockpitInterface: $cockpitInterface,periodId: $periodId,garageId: $garageId,cockpitType: $cockpitType,sort: $sort,order: $order,search: $search,limit: $limit,skip: $skip,userId: $userId,listType: $listType) {
          list {
            displayName
            garagePublicDisplayName
          }
        }
      }
      `;
    // apollo variables
    const variablesApollo = {
      cockpitInterface: 'garages',
      cockpitType: 'Dealership',
      garageId: [garage1._id.toString(),garage2._id.toString()],
      limit: 10,
      listType: 'unsatisfied',
      order: 'DESC',
      periodId: 'ALL_HISTORY',
      search: 'Dupont',
      skip: 0,
      sort: 'countUnsatisfied',
      userId: null,
    };
    // send query
    const queryRes = await sendQueryAs(app, query, variablesApollo, godUser.getId());
    for (const { displayName, garagePublicDisplayName } of queryRes.data.kpiByPeriodGetList.list) {
      expect(displayName).to.have.string('Dupont');
      expect(garagePublicDisplayName).to.have.string('Dupont');
    }
  });

});
