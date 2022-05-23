const { graphql } = require('graphql');
const objectHash = require('object-hash');
const app = require('../../server/server');
const schema = require('../../common/lib/garagescore/api/graphql');

/** run a graphql query */

async function query(str, loopback, user) {
  const req = { user, app: loopback };
  return graphql(schema, str, null, req);
}

const buildReq = (reportId) => `{
  monthlySummary(reportId: "${reportId}", dataType: "allServices") {
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
    }
    availableDataTypes {
      leads
      satisfaction
      problemResolution
      validEmails
    }
    bestLeadsPerf
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
      }
      convertedLeadsM {
        newProjects
        knownProjects
        wonFromCompetition
      }
      convertedLeadsM1 {
        newProjects
        knownProjects
        wonFromCompetition
      }
      convertedLeadsM2
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
      }
      satisfactionM {
        promotors
        passives
        detractors
      }
      satisfactionM1 {
        promotors
        passives
        detractors
      }
      detailsUrl
    }
    problemResolution {
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
      }
      problemProcessingM {
        notProcessed
        noAction
        contacted
      }
      problemProcessingM1 {
        notProcessed
        noAction
        contacted
      }
      detailsUrl
    }
    validEmails {
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
      }
      emailQualityM {
        validEmails
        wrongEmails
        missingEmails
      }
      emailQualityM1 {
        validEmails
        wrongEmails
        missingEmails
      }
      detailsUrl
    }
    employeesRanking {
      leads {
        employeeName
        garageName
        convertedLeads12M
        convertedLeadsM
        convertedLeadsM1
      }
      problemResolution {
        employeeName
        garageName
        solvingRate12M
        solvingRateM
        solvingRateM1
      }
    }
  }
}`;

async function main() {
  const hashes = [];
  const bb = await app.models.User.findOne({ email: 'bbodrefaux@garagescore.com' });
  const monthlySummaries = await app.models.Report.find({
    where: { reportConfigId: 'monthlySummary', year: 2019, month: 5 },
    limit: 100,
    sort: '_id ASC',
  });

  for (const monthlySummary of monthlySummaries) {
    const data = await query(buildReq(monthlySummary.id.toString()), app, bb);
    console.log('\n', 'Email: ', monthlySummary.userEmail);
    console.log(JSON.stringify(data));
    hashes.push(`${monthlySummary.userEmail},${objectHash(data, { unorderedArrays: true })}`);
  }

  console.log('\n');
  console.log('\n');
  console.log(hashes.join('\n'));
  console.log('\n');
  process.exit(0);
}

main();
