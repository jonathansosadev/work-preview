/**
 * Export unsatisfied and send email to all garages who have a cic.email and garage.externalId and at least one unsatisfied !
 */

const usage = () => {
  console.log('');
  console.log('* Usage : node scripts/cron/CIC-export/CIC-export.js');
  console.log('* Export unsatisfied and send email to all garages who have a cic.email');
  console.log('');
  process.exit(0);
};

if (process.argv.includes('--help')) usage();

/** require are here for better performances in case of argv errors */
require('dotenv').config({ silent: true });

const moment = require('moment');
const path = require('path');
const juice = require('juice');
require('moment-timezone');
const CronRunner = require('../../../common/lib/cron/runner');
const app = require('../../../server/server.js');
const DataTypes = require('../../../common/models/data/type/data-types.js');
const MailgunApi = require('../../../common/lib/mailgun/api');
const nunjucks = require('nunjucks');
const TimeHelper = require('../../../common/lib/util/time-helper');
const Excel = require('exceljs');

const nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../../../common/')), {
  autoescape: true,
  watch: false,
});

const runner = new CronRunner({
  frequency: CronRunner.supportedFrequencies.DAILY,
  description: 'Export unsatisfied and send email to all garages who have a cic.email',
  forceExecution: process.argv[2] === '--force',
});

const objectToCsvLine = (d, g) => [
  g.externalId,
  'GarageScore',
  'APV',
  d.get('service.providedAt') ? moment(d.get('service.providedAt')).format('YYYY/MM/DD') : '',
  d.get('customer.fullName.value') || `${d.get('customer.firstName.value')} ${d.get('customer.lastName.value')}`,
  typeof d.get('source.raw.cells.NumeroSerie') === 'string' ? d.get('source.raw.cells.NumeroSerie').slice(0, 7) : '',
  d.get('source.raw.cells.NumeroSerie'),
  `${d.get('review.rating.value')}/10 - ${d.get('review.comment.text')}`,
  'oui',
];

const garagesInfos = [];

app.on('booted', () => {
  runner.execute = async (options, done) => {
    const executionDay = options.executionStepNumber
      ? TimeHelper.dayNumberToDate(options.executionStepNumber)
      : new Date();
    if (executionDay && executionDay.getDay() !== 1) {
      done();
      return;
    } // Only on mondays ! (Tuesday for testing)
    const oneWeekBefore = new Date(executionDay.getTime());
    oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
    const garagesWithCicEmail = await app.models.Garage.find({ where: { 'cic.email': { nin: ['', null] } } });
    console.log(`${garagesWithCicEmail.length} garages with cic.email !`);
    for (const garage of garagesWithCicEmail) {
      const details = {};
      details.externalId = garage.externalId;
      details.id = garage.id;
      details.email = (garage.cic && garage.cic.email) || '';
      details.unsatisfied = await app.models.Data.find({
        where: {
          garageId: garage.id.toString(),
          type: DataTypes.MAINTENANCE,
          and: [{ 'review.createdAt': { gte: oneWeekBefore } }, { 'review.createdAt': { lt: executionDay } }],
          'review.rating.value': { lte: 6 },
        },
      });
      details.emailSent = !!(details.unsatisfied.length && details.externalId && details.email);
      details.success = true;
      if (details.emailSent) {
        console.log(
          'EXPORT -',
          oneWeekBefore,
          'to',
          executionDay,
          garage.publicDisplayName,
          details.unsatisfied.length,
          'unsatisfied.'
        );
        try {
          const filePath = '/tmp/cic-export.xls';
          const workbook = new Excel.Workbook();
          workbook.creator = 'GarageScore';
          const worksheet = workbook.addWorksheet('Liste Mécontents');
          worksheet.columns = [
            { header: 'Code Concession', key: 'externalId', width: 20 },
            { header: 'Source', key: 'source', width: 20 },
            { header: 'Activité', key: 'activity', width: 20 },
            { header: "Date d'évènement", key: 'activity', width: 20 },
            { header: 'Nom client', key: 'name', width: 20 },
            { header: 'Châssis', key: 'chassis', width: 20 },
            { header: 'Châssis 17', key: 'chassis17', width: 20 },
            { header: 'Verbatim client', key: 'review', width: 80 },
            { header: 'Rappel souhaité', key: 'callWanted', width: 20 },
          ];
          for (const data of details.unsatisfied) worksheet.addRow(objectToCsvLine(data, garage));
          await workbook.xlsx.writeFile(filePath);
          const date = moment.tz(new Date(), 'Europe/Paris').format('DD/MM/YYYY');
          await MailgunApi.initFromDomainKey('mg')
            .messages()
            .send({
              from: 'no-reply@custeed.com',
              to: details.email,
              subject: `GarageScore - ${garage.publicDisplayName} Export automatique des ${details.unsatisfied.length} mécontents (${date})`,
              html: juice(nunjucksEnv.render('./templates/email/cic-export/html.nunjucks', {}), {
                preserveMediaQueries: true,
              }),
              body: 'Bonjour, voici ci-joint un export automatique des mécontents de la semaine dernière.',
              attachment: filePath,
            });
          details.success = true;
        } catch (e) {
          details.errors = e.message;
          details.success = false;
        }
      }
      garagesInfos.push(details);
    }
    done();
  };
  runner.run(async (err) => {
    for (const garage of garagesInfos) {
      const updates = {};
      const details = [];
      if (garage.emailSent) updates['cic.lastEmailSentDate'] = new Date();
      if (!garage.externalId) details.push('ExternalId missing');
      if (!garage.unsatisfied.length) details.push('No unsatisfied to send');
      if (garage.errors) details.push(garage.errors);
      if (garage.emailSent) details.push(garage.success ? 'Sent successfully' : 'Sending error');
      updates['cic.details.message'] = details.join(', ');
      await app.models.Garage.findByIdAndUpdateAttributes(garage.id, updates);
    }
    console.log('Bye');
    process.exit(err ? -1 : 0);
  });
});
