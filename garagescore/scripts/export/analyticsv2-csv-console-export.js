const app = require('../../server/server');
const { MongoClient } = require('mongodb');
const config = require('config');
const serializer = require('../../common/lib/util/serializer');
const excelGenerators = require('../../common/lib/garagescore/cockpit-exports/excels/excel-generators');
const ArgParser = require('minimist');
/*
  Related ticket : https://github.com/garagescore/support_interne/issues/37

  This script aims to reduce the server's memory consumption by not generating an Excel file on the server but instead log each line in CSV format to the console.
  The Excel file can be built locally with no lines limits (currently 10k) using a bash command.

  Arguments : 
    --jobId : the ID of the job targeted (required)
    --pr : the PR number (optionnal) => used to target the right collection since in PR apps , the job collection is appended with the PR number (example : jobs_4242)
    --bash: log the bash command to use
    --windows: display the command to use for windows cmd line (optionnal => default to true) , use --windows=false otherwise
    USAGE :
    - node scripts/export/analyticsv2-csv-console-export.js --jobId <Job_ID> --bash
*/

//--------------------------------------------------------------------------------------//
//                                    Global Methods                                    //
//--------------------------------------------------------------------------------------//

const Global = Object.seal({
  DB: null,
  processedArgs: {},
  /* in a Pr , Jobs are saved in collection jobs_<PR-NUMBER> */
  /* so if the argument --pr is passed, append it to the collection name */
  get jobsConnector() {
    if (Global.processedArgs.pr) {
      return this.DB.collection(`jobs_${Global.processedArgs.pr}`);
    }
    return app.models.Job.getMongoConnector();
  },
  exitWithError(msg = 'An Error Occured') {
    this.logError(msg);
    process.exit(1);
  },
  logGreen(str) {
    console.log('\x1b[32m', `[ CSV-EXPORT ] ${str}`, '\x1b[0m');
  },
  logYellow(str) {
    console.log('\x1b[33m', `[ CSV-EXPORT ] ${str}`, '\x1b[0m');
  },
  logError(str) {
    /* prepended with separator to log in csv potential errors */
    console.log(`[ CSV-ERROR ] ${str}`);
  },
});

//--------------------------------------------------------------------------------------//
//                                        Start                                         //
//--------------------------------------------------------------------------------------//

app.on('booted', async () => {
  /* process args (validation and save value) */
  Global.processedArgs = ArgParser(process.argv.slice(2), {
    string: ['jobId', 'pr'],
    boolean: ['bash', 'windows'],
    default: { windows: true },
  });
  if (!Global.processedArgs.jobId || !Global.processedArgs.jobId.startsWith('START_EXPORT')) {
    Global.exitWithError(`Invalid argument "jobId" with value "${Global.processedArgs.jobId}"`);
  }

  /* log args */
  for (const argName in Global.processedArgs) {
    if (argName !== '_') Global.logYellow(`Running Script with argument ${argName} = ${Global.processedArgs[argName]}`);
  }

  /* connect mongo client */
  await connectMongoClient();

  /* fetch the job document */
  const job = await fetchJob(Global.processedArgs.jobId);
  const cmdFilter = {
    windows: 'FINDSTR > Export.csv /i /r "^\\".*; CSV-ERROR"',
    linux: "awk '(/CSV-ERROR/ || /^\".*;/) && !/News?Relic/i' > Export.csv",
  };
  if (Global.processedArgs.bash) {
    const pr = Global.processedArgs.pr || '';
    const bashCommand = `heroku run -a ${
      pr ? 'beta-app-pr-' + pr : 'garagescore --size=performance-m'
    } node scripts/export/analyticsv2-csv-console-export.js --jobId ${Global.processedArgs.jobId} ${
      pr ? '--pr ' + pr : ''
    } | ${Global.processedArgs.windows ? cmdFilter.windows : cmdFilter.linux}`;
    Global.logGreen('Bash command to use : ');
    console.log(bashCommand);
    Global.logGreen('Stopping the script, you can run it again using the above command');
    process.exit(0);
  }

  /* log the result to the console in CSV format */
  const { exportType, dataTypes, fields, locale } = job.payload;

  try {
    await excelGenerators.getGeneratedExcel(serializer.deserialize(job.payload.query), {
      exportType,
      locale,
      dataTypes,
      fields,
      logOnlyToConsole: true,
      onError: (err) => console.log('CSV-ERROR', err),
    });
  } catch (error) {
    Global.exitWithError(error.message);
  }
  Global.logGreen('Done, the export has been successfully generated');

  process.exit(0);
});

//--------------------------------------------------------------------------------------//
//                                      Fetch Job                                       //
//--------------------------------------------------------------------------------------//

async function fetchJob(jobId = Global.processedArgs.jobId) {
  try {
    const job = await Global.jobsConnector.findOne({ _id: jobId }, { payload: 1 });
    if (!job) {
      Global.exitWithError(`Unable to find job with id ${jobId}`);
    }
    Global.logGreen('Job Found, processing ...');
    return job;
  } catch (error) {
    Global.exitWithError(`Error occured while fetching the job ${error.message}`);
  }
}

//--------------------------------------------------------------------------------------//
//                                 Connect MongoClient                                  //
//--------------------------------------------------------------------------------------//

async function connectMongoClient() {
  try {
    const client = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
    Global.DB = client.db();
    Global.logGreen('MongoClient connected');
  } catch (error) {
    Global.exitWithError(`Unable to connect MongoDB ${error.message}`);
  }
}
