process.env.NODE_ENV = 'dev'; // light logs
const app = require('../../../../../../server/server');
const { graphql } = require('graphql');
const schema = require('../../graphql');

const kpiList = {
  path: 'kpiList',
  query: `{
          kpiList(garageId: "593abfcb61b3e91900fcb2bf", periodId: "lastQuarter", cockpitType: "Dealership", interface: "users", sort: "countUnsatisfied", order: "DESC", limit: 10, skip: 0, listType: "unsatisfied") {
            displayName
            hideDirectoryPage
            countUnsatisfied
            countUnsatisfiedUntouched
            countUnsatisfiedTouched
            countUnsatisfiedClosedWithResolution
            countUnsatisfiedReactive
            garageId
            garageSlug
            garagePublicDisplayName
          }
      }`,
};

const cockpitFilters = {
  path: 'cockpitFilters',
  query: `{
          cockpitFilters(filterToFetch: "type", garageId: "559a9b04d4434d1900014ac9") {
            garageId
            garageType
            frontDeskUserName {
              frontDeskUserName
              garageId
            }
            manager {
              name
              userId
            }
            type
            source
          }
    }`,
};

const leadsList = {
  path: 'leadsList',
  query: `
    {
          leadsList(periodId: "lastQuarter", cockpitType: "Dealership") {
            id
            followupLeadRecontacted
            followupLeadSatisfied
            followupLeadSatisfiedReasons
            followupLeadNotSatisfiedReasons
            followupLeadAppointment
          }
    }
  `,
};

const garageHistoryList = {
  path: 'garageHistories',
  query: `{
       garageHistories(type: "NewVehicleSale", garageId: "5609171770ad25190055d4fc", periodId: "lastQuarter", cockpitType: "Dealership", garageHistoryOrderBy: "countSurveysRespondedPercent", garageHistoryOrder: "DESC", limit: 30, skip: 0) {
           periodId
           id
           garageId
           garagePublicDisplayName
           score
           countSurveysResponded
           countReceivedAndScheduledSurveys
      }}`,
};

const kpi = {
  path: 'kpi',
  query: `
  "{
          kpi(periodId: "lastQuarter", cockpitType: "Dealership") {
          }
    }"`,
};

/** run a graphql query */
async function query(str, loopback, user) {
  const req = {};
  req.user = user;
  req.app = loopback;
  return graphql(schema, str, null, req);
}
/* Prepare a graphql query with a autenticated user */
const request = async (graphqlQuery, userEmail) => {
  const user = await app.models.User.findOne({ where: { email: userEmail } });
  return async () => {
    return query(graphqlQuery, app, user);
  };
};

async function main() {
  console.log('main started');
  let start = null;
  start = Date.now();
  const req1 = await request(kpiList.query, 'bbodrefaux@garagescore.com');
  const result = await req1();
  console.log(result.data.kpiList && result.data.kpiList.map((e) => e.countUnsatisfied), result);
  console.log(`Req1 time= ${Date.now() - start}`);
  process.exit();
}
main();
