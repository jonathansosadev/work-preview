const debug = require('debug')('garagescore:common:lib:cron:runner');
const app = require('../../../server/server');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/service');
const SupervisorMessageType = require('../../../common/models/supervisor-message.type');
const Enum = require('../../lib/util/enum');
const async = require('async');
const moment = require('moment');
const timeHelper = require('../../lib/util/time-helper');
const ping = require('../workerbeats/ping');

const p = '[CRON/RUNNER] ';

/**
 * WARNING : this tool stop the execution if its execution exceed the 95% of the frequency it is considered as the maximum execution time
 * This tools is used to manage and track the execution of a cron.
 * - add errors to supervisor
 * - stop the execution if it exceed the allowed execution time
 * - warn in the supervisor if the execution exceeds the half of script allowed time
 * - track the information of the last execution in the CronInformation collection
 * - retry last missed executions steps
 * - could specify --min-step-number and --max-step-number as Cli option to execute a specific interval of steps
 * - possibility of adding custom cli option in supportedCliOptions
 * StepNumber = Date in ms / executionFrequency in ms
 */
class CronRunner {
  constructor(options) {
    this.path = this._getCallerFileName();
    // frequency are in milliseconds
    if (!CronRunner.supportedFrequencies.hasValue(options.frequency)) {
      throw new Error('insupported run frequency');
    }
    this.frequency = options.frequency;
    this.description = options.description;
    // options mst be in this forme --toto-tata-titi
    // and will be injected in execute function in this form : totoTataTiti
    this.supportedCliOptions = options.supportedCliOptions;
    this.forceExecution = options.forceExecution;
  }

  _getCallerFileName() {
    let caller = null;

    for (caller = module.parent; caller && caller.parent; caller = caller.parent);
    return caller.filename.slice(caller.filename.indexOf('scripts'));
  }

  /**
   * must be implemented in the script
   * @param options Object must have options : executionStepNumber, cliOptions
   * @param callback
   */
  execute(options, callback) {
    callback(new Error('Must override execute function to contain the body of the cron'));
  }
  _initCliOptions() {
    this.cliOptions = {};
    process.argv.forEach((val, index) => {
      if (val === '--min-step-number') {
        this.cliOptions.minStepNumber = parseInt(process.argv[index + 1], 10);
      }
      if (this.supportedCliOptions && this.supportedCliOptions[val]) {
        this.cliOptions[val.replace('')] = parseInt(process.argv[index + 1], 10);
      }
      if (val === '--max-step-number') {
        this.cliOptions.maxStepNumber = parseInt(process.argv[index + 1], 10);
        if (!this.cliOptions.minStepNumber || this.cliOptions.minStepNumber >= this.cliOptions.maxStepNumber) {
          throw new Error('invalid maxStepNumber');
        }
      }
      if (val === '--max-steps') {
        this.cliOptions.maxSteps = parseInt(process.argv[index + 1], 10);
      }
      if (val === '--offset') {
        this.cliOptions.offset = parseInt(process.argv[index + 1], 10);
      }
    });
    if (this.forceExecution) {
      const offset = Number.isInteger(this.cliOptions.offset) ? this.cliOptions.offset : -1;
      let dateOffset = (offset) => moment().toDate();
      switch (this.frequency) {
        case CronRunner.supportedFrequencies.DECA_MINUTE:
          dateOffset = (os) =>
            moment()
              .add(10 * os, 'minutes')
              .toDate();
          this.cliOptions.minStepNumber = timeHelper.decaMinuteNumber(dateOffset(offset));
          this.cliOptions.maxStepNumber = timeHelper.decaMinuteNumber(dateOffset(offset + 1));
          break;
        case CronRunner.supportedFrequencies.HOURLY:
          dateOffset = (os) => moment().add(os, 'hours').toDate();
          this.cliOptions.minStepNumber = timeHelper.hourNumber(dateOffset(offset));
          this.cliOptions.maxStepNumber = timeHelper.hourNumber(dateOffset(offset + 1));
          break;
        case CronRunner.supportedFrequencies.TWO_HOURS:
          dateOffset = (os) =>
            moment()
              .add(2 * os, 'hours')
              .toDate();
          this.cliOptions.minStepNumber = timeHelper.twoHoursNumber(dateOffset(offset));
          this.cliOptions.maxStepNumber = timeHelper.twoHoursNumber(dateOffset(offset + 1));
          break;
        case CronRunner.supportedFrequencies.DAILY:
          dateOffset = (os) => moment().add(os, 'days').toDate();
          this.cliOptions.minStepNumber = timeHelper.dayNumber(dateOffset(offset));
          this.cliOptions.maxStepNumber = timeHelper.dayNumber(dateOffset(offset + 1));
          break;
      }
    }
  }

  /**
   * add some attributes in the current script associated CronInformation model instance
   * @param attributes Object
   * @param callback Function
   * @private
   */
  _setCronInformationAttributes(attributes, callback) {
    this._getCronInformation((err2, cronConfig) => {
      if (err2) {
        callback(err2);
        return;
      }
      cronConfig.updateAttributes(attributes, callback);
    });
  }

  /**
   * get the current script associated CronConfiguration
   * create one if it doesn't exist
   * @param callback Function
   * @private
   */
  _getCronInformation(callback) {
    app.models.CronInformation.findOne(
      {
        where: { path: this.path, frequency: this.frequency },
      },
      (err, config1) => {
        if (config1) {
          if (this.frequency === config1.frequency && this.description === config1.description) {
            callback(null, config1);
            return;
          }
          if (this.frequency !== config1.frequency) {
            config1.oldFrequency = config1.frequency; // eslint-disable-line no-param-reassign
            config1.frequency = this.frequency; // eslint-disable-line no-param-reassign
          }
          if (this.description !== config1.description) {
            config1.oldDescription = config1.description; // eslint-disable-line no-param-reassign
            config1.description = this.description; // eslint-disable-line no-param-reassign
          }
          config1.save(callback);
          return;
        }
        app.models.CronInformation.create(
          {
            path: this.path,
            frequency: this.frequency,
            description: this.description,
            supportedCliOptions: this.supportedCliOptions,
          },
          callback
        );
      }
    );
  }

  /**
   * return an array of the current context step numbers to be executed
   * @param callback Function function(err,arrayOfNumbers){}
   * @private
   */
  _getStepNumbersToExecute(callback) {
    const currentStepNumber = Math.floor(Date.now() / this.frequency);
    debug(`Current ${this._describeStepNumber(currentStepNumber)}`);
    if (this.cliOptions.minStepNumber) {
      const numbers = [];
      for (let i = this.cliOptions.minStepNumber; i < (this.cliOptions.maxStepNumber || currentStepNumber); i++) {
        if (this.cliOptions.maxSteps && numbers.length >= this.cliOptions.maxSteps) {
          break; // As per maxSteps we got enough steps to run, stop adding more
        }
        numbers.push(i);
      }
      callback(null, numbers);
      return;
    }
    this._getCronInformation((err, cronConfig) => {
      if (err) {
        callback(err);
        return;
      }
      const lastExecutedStepNumber = cronConfig.lastExecutedStepNumber
        ? cronConfig.lastExecutedStepNumber
        : currentStepNumber - 1;
      const numbers = [];
      for (let i = lastExecutedStepNumber + 1; i <= currentStepNumber; i++) {
        if (this.cliOptions.maxSteps && numbers.length >= this.cliOptions.maxSteps) {
          break; // As per maxSteps we got enough steps to run, stop adding more
        }
        numbers.push(i);
      }
      callback(null, numbers);
    });
  }

  _describeStepNumber(stepNumber) {
    const date = new Date(stepNumber * this.frequency);
    switch (this.frequency) {
      case CronRunner.supportedFrequencies.DECA_MINUTE:
        return `decaMinute number ${stepNumber} : ${moment(date).format('DD/MM/YYYY  HH:mm')}`;
      case CronRunner.supportedFrequencies.HOURLY:
        return `hour number ${stepNumber} : ${moment(date).format('DD/MM/YYYY HH:mm')}`;
      case CronRunner.supportedFrequencies.TWO_HOURS:
        return `two hours number ${stepNumber} : ${moment(date).format('DD/MM/YYYY HH:mm')}`;
      case CronRunner.supportedFrequencies.DAILY:
        return `day number ${stepNumber} : ${moment(date).format('DD/MM/YYYY')}`;
      default:
        return `stepNumber ${stepNumber}`;
    }
  }

  /**
   * lunch the script
   */
  run(callback) {
    setTimeout(() => {
      GsSupervisor.warn(
        {
          type: SupervisorMessageType.HIGH_EXECUTION_TIME,
          payload: {
            error: 'High execution time greater than the half of script allowed time',
            context: this.path,
          },
        },
        () => {}
      );
    }, Math.floor(this.frequency * 0.5));
    setTimeout(() => {
      GsSupervisor.warn(
        {
          type: SupervisorMessageType.EXECUTION_TIMEOUT,
          payload: {
            error: 'Execution time greater than script allowed time will exit now',
            context: this.path,
          },
        },
        () => {
          callback(new Error('The execution exceeded its execution time'));
        }
      );
    }, Math.floor(this.frequency * 0.95));
    this._initCliOptions();
    this._getStepNumbersToExecute((err, numbers) => {
      console.log(`${p}## Starting Runner ##`);
      if (err) {
        debug(err);
        console.log(`${p}## Shutting Down Runner With Error [${err.message}] - Bye! ##`);
        return;
      }
      if (numbers.length === 0) {
        debug('Nothing to execute');
        console.log(
          `${p}## Shutting Down Runner With Warning [Nothing To Execute / Already Executed This Step] - Bye! ##`
        );
        callback();
      }
      async.timesSeries(
        numbers.length,
        (n, next) => {
          const start = moment.utc();
          debug(`Running for ${this._describeStepNumber(numbers[n])}`);
          async.series(
            [
              (cb) => {
                const verb = this.forceExecution ? 'FORCING' : 'Starting';
                const describedStepNumber = this._describeStepNumber(numbers[n]);
                console.log(
                  `${p} # ${verb} Executing Script Inside Runner [${this.path}] For Step [${describedStepNumber}] #`
                ); // eslint-disable-line max-len
                this._setCronInformationAttributes({ lastStart: new Date(), currentlyRunning: true }, cb);
              },
              (cb) => {
                this.execute({ executionStepNumber: numbers[n] }, cb);
              },
              (cb) => {
                const updateObj = { lastEnd: new Date(), currentlyRunning: false, lastError: null };
                if (!this.cliOptions.maxStepNumber) {
                  updateObj.lastExecutedStepNumber = numbers[n];
                }
                this._setCronInformationAttributes(updateObj, cb);
              },
            ],
            async (err2) => {
              if (err2) {
                console.log(`${p} # Script Inside Runner [Not Runner Itself] Finished With Error [${err2.message}] #`);
                this._setCronInformationAttributes(
                  {
                    lastError: err2 ? `Error:: ${err2.message} Stack :: ${err2.stack}` : null,
                    currentlyRunning: false,
                  },
                  () => next(err2)
                );

                await ping(`CronsInError_${this.path}`);
                return;
              }
              const duration = moment.duration(moment().valueOf() - start.valueOf());
              console.log(
                `${p} # Script Inside Runner [Not Runner Itself] Finished With Success For Step [${this._describeStepNumber(
                  numbers[n]
                )}] In ${duration.hours()} Hours, ${duration.minutes()} Minutes, ${duration.seconds()} Seconds #`
              ); // eslint-disable-line max-len
              debug(`Finished ${this._describeStepNumber(numbers[n])}`);
              await ping(`CronsDone_${this.path}`);
              next();
            }
          );
        },
        (err4) => {
          if (err4) {
            debug(err4);
            console.log(`${p}## Shutting Down Runner [ERROR] [${err4.message}] - Bye! ##`);
            GsSupervisor.warn(
              {
                type: SupervisorMessageType.CRON_EXECUTION_ERROR,
                payload: {
                  error: `Error:: ${err4.message} Stack :: ${err4.stack}`,
                  context: `Runner:: Script:: ${this.path}`,
                },
              },
              () => {
                callback(err4);
              }
            );
            return;
          }
          debug('bye');
          console.log(`${p}## Shutting Down Runner [Ok] - Bye! ##`);
          callback();
        }
      );
    });
  }
}

CronRunner.supportedFrequencies = new Enum({
  DECA_MINUTE: timeHelper.tenMinutes,
  HOURLY: timeHelper.oneHour,
  TWO_HOURS: timeHelper.twoHours,
  DAILY: timeHelper.oneDay,
});

module.exports = CronRunner;
