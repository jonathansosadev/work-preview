/** Reproduce a graphql query and display its runTime */
/*eslint-disable */
process.env.QUERY_LOGGER = false;
process.env.NODE_APP_INSTANCE = 'app';
const schema = require('../../../common/lib/garagescore/api/graphql');
const app = require('../../../server/server');
const objectHash = require('object-hash');
const fs = require('fs');

const { graphql } = require('graphql');

//const request = fs.readFileSync('./scripts/maintenance/perfs/request.graphql', 'utf8');
const request = `
{
  monthlySummary(reportId: "5e93f41587f59b00036204fc", dataType: "allServices") {
    id
month
year
garages {
  garageId
garageName
group
authorizations {
  leads
satisfaction
problemResolution
validEmails

}
}availableDataTypes {
  leads
satisfaction
problemResolution
validEmails

}bestLeadsPerf
bestSatisfactionPerf
bestProblemResolutionPerf
bestValidEmailsPerf
averageLeadsPerf
averageSatisfactionPerf
averageProblemResolutionPerf
averageValidEmailsPerf
leads {
  garageId
garageName
convertedLeads12M {
  newProjects
knownProjects
wonFromCompetition

}convertedLeadsM {
  newProjects
knownProjects
wonFromCompetition

}convertedLeadsM1 {
  newProjects
knownProjects
wonFromCompetition

}convertedLeadsM2
convertedLeadsM3
detailsUrl

}satisfaction {
  garageId
garageName
surveysResponded12M
surveysRespondedM
surveysRespondedM1
surveysRespondedM2
surveysRespondedM3
ponderatedScore12M
ponderatedScoreM
ponderatedScoreM1
ponderatedScoreM2
ponderatedScoreM3
satisfaction12M {
  promotors
passives
detractors

}satisfactionM {
  promotors
passives
detractors

}satisfactionM1 {
  promotors
passives
detractors

}detailsUrl

}problemResolution {
  garageId
garageName
countUnsatisfied12M
countUnsatisfiedM
countUnsatisfiedM1
countUnsatisfiedM2
countUnsatisfiedM3
unsatisfiedSolved12M
unsatisfiedSolvedM
unsatisfiedSolvedM1
unsatisfiedSolvedM2
unsatisfiedSolvedM3
problemProcessing12M {
  notProcessed
noAction
contacted

}problemProcessingM {
  notProcessed
noAction
contacted

}problemProcessingM1 {
  notProcessed
noAction
contacted

}detailsUrl

}validEmails {
  garageId
garageName
totalForEmails12M
totalForEmailsM
totalForEmailsM1
totalForEmailsM2
totalForEmailsM3
validEmails12M
validEmailsM
validEmailsM1
validEmailsM2
validEmailsM3
emailQuality12M {
  validEmails
wrongEmails
missingEmails

}emailQualityM {
  validEmails
wrongEmails
missingEmails

}emailQualityM1 {
  validEmails
wrongEmails
missingEmails

}detailsUrl

}employeesRanking {
  leads {
  employeeName
garageName
convertedLeads12M
convertedLeadsM
convertedLeadsM1

}problemResolution {
  employeeName
garageName
solvingRate12M
solvingRateM
solvingRateM1

}
}
  }
}
`;

async function main(query) {
  const user = await app.models.User.findOne({ where: { email: 'bbodrefaux@garagescore.com' } });
  const req = {};
  req.user = user;
  req.app = app;
  console.time('graphql');
  const res = await graphql(schema, query, null, req);
  //console.log(JSON.stringify(res,null,2));
  console.timeEnd('graphql');
  console.log(objectHash(res));
  process.exit();
}

const request = `
{
  getPerfmanUsers {
    id
    name
    perf {
      uTotal
      uVariance
      uDif
      xTotal
      xVariance
      xDif

    }
  }
}

`;
// eg if we need some cache before executing graphql
const initByRequest = [
  (cb) => {
    cb();
  },
  (cb) => {
    cb();
  },
  (cb) => {
    cb();
  },
];
const requestToTest = 2;
initByRequest[requestToTest](() => {
  main(request);
});
