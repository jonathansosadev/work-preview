const { ObjectId } = require('mongodb');
const { expect } = require('chai');
const path = require('path');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');

const app = new TestApp();

describe('apollo::dataGetUnsatisfiedList', () => {
  let allGarages;
  let allUnsatisfied;
  let godUser;

  beforeEach(async () => {
    await app.reset();
    // create datas for test
    await app.restore(path.resolve(`${__dirname}/dumps/garage-get-unsatisfied-list.dump`));
    await app.restore(path.resolve(`${__dirname}/dumps/data-get-unsatisfied-list.dump`));
    allGarages = await app.models.Garage.getMongoConnector()
      .find({}, { projection: { _id: true } })
      .toArray();
    allUnsatisfied = await app.models.Data.getMongoConnector()
      .find(
        {},
        {
          projection: { _id: true, 'unsatisfiedTicket.referenceDate': true, garageId: true },
          sort: { 'unsatisfiedTicket.referenceDate': -1 },
        }
      )
      .toArray();
    godUser = await app.addUser({
      authorization: { ACCESS_TO_COCKPIT: true },
      garageIds: allGarages.map(({ _id }) => _id.toString()),
    });
  });

  it('dataGetUnsatisfiedList returns unsatisfied only for one garages in scope', async () => {
    const garageStringId = allUnsatisfied[1].garageId;
    const nunsatisfied = allUnsatisfied.filter(({ garageId }) => garageId === garageStringId).length;
    const user = await app.addUser({
      authorization: { ACCESS_TO_COCKPIT: true },
      garageIds: [new ObjectId(garageStringId)],
    });
    const query = `query dataGetUnsatisfiedList($limit: Int, $before: String, $periodId: String!,  $garageId: [String],  $cockpitType: String,  $search: String,  $unsatisfiedDataType: String,  $unsatisfiedElapsedTime: String,  $surveySatisfactionLevel: String,  $unsatisfiedHasLead: String,  $unsatisfiedManager: String,  $unsatisfiedStatus: String,  $unsatisfiedFollowUpStatus: String) {
      dataGetUnsatisfiedList(limit: $limit, before: $before, periodId: $periodId,  garageId: $garageId,  cockpitType: $cockpitType,  search: $search,  unsatisfiedDataType: $unsatisfiedDataType,  unsatisfiedElapsedTime: $unsatisfiedElapsedTime,  surveySatisfactionLevel: $surveySatisfactionLevel,  unsatisfiedHasLead: $unsatisfiedHasLead,  unsatisfiedManager: $unsatisfiedManager,  unsatisfiedStatus: $unsatisfiedStatus,  unsatisfiedFollowUpStatus: $unsatisfiedFollowUpStatus) {
        datas {
          id
          garage {
            id
          }
        }
      }
    }`;
    const variablesApollo = {
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
      garageId: [garageStringId],
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    const { datas } = res.data.dataGetUnsatisfiedList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(nunsatisfied);
    const representedGarageIds = datas.map(({ garage }) => garage.id).filter((gId, i, a) => a.indexOf(gId) === i);
    expect(representedGarageIds).to.have.lengthOf(1).and.to.contain(garageStringId);
  });

  it('dataGetUnsatisfiedList returns unsatisfied only for a list of garages in scope', async () => {
    const garageStringId = allUnsatisfied[1].garageId;
    const garageStringId2 = allUnsatisfied[2].garageId;
    const nunsatisfied = allUnsatisfied.filter(({ garageId }) => (garageId === garageStringId || garageId === garageStringId2 )).length;
    const user = await app.addUser({
      authorization: { ACCESS_TO_COCKPIT: true },
      garageIds: [new ObjectId(garageStringId),new ObjectId(garageStringId2)],
    });
    const query = `query dataGetUnsatisfiedList($limit: Int, $before: String, $periodId: String!,  $garageId: [String],  $cockpitType: String,  $search: String,  $unsatisfiedDataType: String,  $unsatisfiedElapsedTime: String,  $surveySatisfactionLevel: String,  $unsatisfiedHasLead: String,  $unsatisfiedManager: String,  $unsatisfiedStatus: String,  $unsatisfiedFollowUpStatus: String) {
      dataGetUnsatisfiedList(limit: $limit, before: $before, periodId: $periodId,  garageId: $garageId,  cockpitType: $cockpitType,  search: $search,  unsatisfiedDataType: $unsatisfiedDataType,  unsatisfiedElapsedTime: $unsatisfiedElapsedTime,  surveySatisfactionLevel: $surveySatisfactionLevel,  unsatisfiedHasLead: $unsatisfiedHasLead,  unsatisfiedManager: $unsatisfiedManager,  unsatisfiedStatus: $unsatisfiedStatus,  unsatisfiedFollowUpStatus: $unsatisfiedFollowUpStatus) {
        datas {
          id
          garage {
            id
          }
        }
      }
    }`;
    const variablesApollo = {
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
      garageId: [garageStringId,garageStringId2],
    };
    // send query
    const res = await sendQueryAs(app, query, variablesApollo, user.getId());
    const { datas } = res.data.dataGetUnsatisfiedList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(nunsatisfied);
    const representedGarageIds = datas.map(({ garage }) => garage.id).filter((gId, i, a) => a.indexOf(gId) === i);
    expect(representedGarageIds).to.have.lengthOf([new ObjectId(garageStringId),new ObjectId(garageStringId2)].length).and.to.contain(garageStringId,garageStringId2);
  });


  it('dataGetUnsatisfiedList returns list of unsatisfiedList', async () => {
    // apollo request
    const query = `query dataGetUnsatisfiedList($limit: Int, $before: String, $periodId: String!,  $garageId: [String],  $cockpitType: String,  $search: String,  $unsatisfiedDataType: String,  $unsatisfiedElapsedTime: String,  $surveySatisfactionLevel: String,  $unsatisfiedHasLead: String,  $unsatisfiedManager: String,  $unsatisfiedStatus: String,  $unsatisfiedFollowUpStatus: String) {
      dataGetUnsatisfiedList(limit: $limit, before: $before, periodId: $periodId,  garageId: $garageId,  cockpitType: $cockpitType,  search: $search,  unsatisfiedDataType: $unsatisfiedDataType,  unsatisfiedElapsedTime: $unsatisfiedElapsedTime,  surveySatisfactionLevel: $surveySatisfactionLevel,  unsatisfiedHasLead: $unsatisfiedHasLead,  unsatisfiedManager: $unsatisfiedManager,  unsatisfiedStatus: $unsatisfiedStatus,  unsatisfiedFollowUpStatus: $unsatisfiedFollowUpStatus) {
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
    const { datas, hasMore } = queryRes.data.dataGetUnsatisfiedList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(10);
    expect(hasMore).to.be.true;
    for (let i = 0; i < datas.length; i++) {
      const { id } = datas[i];
      expect(id).to.equal(allUnsatisfied[i]._id.toString());
    }
  });

  it('dataGetUnsatisfiedList paginates', async () => {
    // apollo request
    const query = `query dataGetUnsatisfiedList($limit: Int, $before: String, $periodId: String!,  $garageId: [String],  $cockpitType: String,  $search: String,  $unsatisfiedDataType: String,  $unsatisfiedElapsedTime: String,  $surveySatisfactionLevel: String,  $unsatisfiedHasLead: String,  $unsatisfiedManager: String,  $unsatisfiedStatus: String,  $unsatisfiedFollowUpStatus: String) {
      dataGetUnsatisfiedList(limit: $limit, before: $before, periodId: $periodId,  garageId: $garageId,  cockpitType: $cockpitType,  search: $search,  unsatisfiedDataType: $unsatisfiedDataType,  unsatisfiedElapsedTime: $unsatisfiedElapsedTime,  surveySatisfactionLevel: $surveySatisfactionLevel,  unsatisfiedHasLead: $unsatisfiedHasLead,  unsatisfiedManager: $unsatisfiedManager,  unsatisfiedStatus: $unsatisfiedStatus,  unsatisfiedFollowUpStatus: $unsatisfiedFollowUpStatus) {
        datas {
          id
          unsatisfiedTicket {
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
    const { hasMore, cursor, datas } = resPage1.data.dataGetUnsatisfiedList;
    expect(hasMore).to.be.true;
    expect(cursor).not.to.be.null;
    expect(new Date(cursor)).to.deep.equal(new Date(allUnsatisfied[datas.length - 1].unsatisfiedTicket.referenceDate));
    expect(new Date(cursor)).to.deep.equal(new Date(datas[datas.length - 1].unsatisfiedTicket.referenceDate));
    // send query 2nd page
    const variablesApolloPage2 = {
      limit: 10,
      periodId: 'ALL_HISTORY',
      cockpitType: 'Dealership',
      before: cursor.toString(),
    };
    // send query 2nd page
    const resPage2 = await sendQueryAs(app, query, variablesApolloPage2, godUser.getId());
    const { hasMore: hasMore2, cursor: cursor2, datas: datas2 } = resPage2.data.dataGetUnsatisfiedList;
    expect(hasMore2).to.be.false;
    expect(cursor2).to.be.false;
    expect(datas2).to.be.an('Array').and.to.have.lengthOf(8);
    for (let i = 0; i < datas2.length; i++) {
      const { id } = datas2[i];
      expect(id).to.equal(allUnsatisfied[10 + i]._id.toString());
    }
  });

  it('dataGetUnsatisfiedList returns unsatisfied only for garages in scope', async () => {
    const garageStringId = allUnsatisfied[1].garageId;
    const nunsatisfied = allUnsatisfied.filter(({ garageId }) => garageId === garageStringId).length;
    const user = await app.addUser({
      authorization: { ACCESS_TO_COCKPIT: true },
      garageIds: [new ObjectId(garageStringId)],
    });
    const query = `query dataGetUnsatisfiedList($limit: Int, $before: String, $periodId: String!,  $garageId: [String],  $cockpitType: String,  $search: String,  $unsatisfiedDataType: String,  $unsatisfiedElapsedTime: String,  $surveySatisfactionLevel: String,  $unsatisfiedHasLead: String,  $unsatisfiedManager: String,  $unsatisfiedStatus: String,  $unsatisfiedFollowUpStatus: String) {
      dataGetUnsatisfiedList(limit: $limit, before: $before, periodId: $periodId,  garageId: $garageId,  cockpitType: $cockpitType,  search: $search,  unsatisfiedDataType: $unsatisfiedDataType,  unsatisfiedElapsedTime: $unsatisfiedElapsedTime,  surveySatisfactionLevel: $surveySatisfactionLevel,  unsatisfiedHasLead: $unsatisfiedHasLead,  unsatisfiedManager: $unsatisfiedManager,  unsatisfiedStatus: $unsatisfiedStatus,  unsatisfiedFollowUpStatus: $unsatisfiedFollowUpStatus) {
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
    const { datas } = res.data.dataGetUnsatisfiedList;
    expect(datas).to.be.an('Array').and.to.have.lengthOf(nunsatisfied);
    const representedGarageIds = datas.map(({ garage }) => garage.id).filter((gId, i, a) => a.indexOf(gId) === i);
    expect(representedGarageIds).to.have.lengthOf(1).and.to.contain(garageStringId);
  });
});
