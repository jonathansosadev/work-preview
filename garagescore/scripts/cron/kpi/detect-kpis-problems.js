const Promise = require('es6-promise').Promise;

const app = require('../../../server/server');
const kpiEncoder = require('../../../common/lib/garagescore/kpi/KpiEncoder');
const CronRunner = require('../../../common/lib/cron/runner');
const GsSupervisor = require('../../../common/lib/garagescore/supervisor/service');
const SupervisorMessageType = require('../../../common/models/supervisor-message.type');

const problems = { garages: [], users: [] };

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Analyse les collections de backup KPIs et envoie un email superviseur si un problème est trouvé',
  forceExecution: process.argv[2] === '--force',
});

app.on('booted', () => {
  runner.execute = async (options, callback) => {
    try {
      const directMongoKpiByPeriodBackup = app.models.KpiByPeriod.getDataSource().connector.collection(
        `${app.models.KpiByPeriod.modelName}Backup`
      ); // eslint-disable-line
      let problemDetected = false;

      const kpiByPeriodBackupCursor = await directMongoKpiByPeriodBackup.find();

      while (await kpiByPeriodBackupCursor.hasNext()) {
        const kpiDocument = await kpiByPeriodBackupCursor.next();
        kpiEncoder.decodeObj(kpiDocument);

        for (const field of Object.keys(kpiDocument)) {
          if (field.includes('count') && kpiDocument[field] < 0) {
            problemDetected = true;
            if (kpiDocument.garageId) {
              problems.garages.push(kpiDocument.garageId.toString());
            }
            if (kpiDocument.userId) {
              problems.users.push(kpiDocument.userId.toString());
            }
          }
        }
      }
      if (problemDetected) {
        console.log('A problem was detected in the KPI collection, sending message to the supervisor...');
        await new Promise((res, rej) =>
          GsSupervisor.warn(
            {
              type: SupervisorMessageType.KPI_ERROR,
              payload: {
                error: 'Nous avons détecté des erreurs dans la collection KPI',
                context: 'KPIs',
                problems,
              },
            },
            (e) => (e ? rej(e) : res())
          )
        );
        console.log('Message sent!');
      }

      callback();
    } catch (err) {
      callback(err);
    }
  };

  runner.run((err) => {
    if (err) {
      console.log(err);
    }
    process.exit(err ? -1 : 0);
  });
});
