const AWS = require('aws-sdk');
const config = require('config');

const { ContactTypes, JobTypes } = require('../../../frontend/utils/enumV2');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler');
const ContactService = require('../../../common/lib/garagescore/contact/service');
const excelGenerators = require('../../../common/lib/garagescore/cockpit-exports/excels/excel-generators');
const serializer = require('../../../common/lib/util/serializer');
const { TIBO, log } = require('../../../common/lib/util/log');
const internalEventsExportContext = require('../../../common/lib/garagescore/monitoring/internal-events/contexts/exports-context');
const EventsEmitter = require('../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const { isUnitTest } = require('../../../common/lib/util/process-env');

module.exports = async (job, upload = true) => {
  const eventsEmitterContext = internalEventsExportContext.create(job.jobId);
  const eventsEmitter = new EventsEmitter(eventsEmitterContext);

  const {
    exportName,
    exportType,
    recipients = [],
    dataTypes = [],
    garageIds = [],
    periodId,
    startPeriodId,
    endPeriodId,
    fields = [],
    locale,
    fullLocale,
    frequency,
    automationCampaignType,
  } = job.payload;
  const query = serializer.deserialize(job.payload.query);
  const excel = await excelGenerators.getGeneratedExcel(query, {
    exportType,
    locale,
    dataTypes,
    fields,
    onError: (key) => {
      eventsEmitter.accumulatorAdd(internalEventsExportContext.EVENT, {
        [key]: 1,
      });
    },
  });
  const isEmptyExcel = excel.worksheets && excel.worksheets[0].rowCount <= 1;

  eventsEmitter.accumulatorEmit();

  if (!excel) {
    log.error(TIBO, `[JOB - START-EXPORT] Unknown Export Type ${exportType} For Job ${job.jobId}`);
    return null;
  }

  if (upload && !isUnitTest()) {
    const uploadParameters = {};
    const key = excelGenerators.getExportFileName(locale, exportType, { periodId, startPeriodId, endPeriodId });
    let bucket = null;
    let uploadResult = null;

    AWS.config.region = config.get('cockpitExportsUpload.awsS3BucketRegion');
    bucket = new AWS.S3({ params: { Bucket: config.get('cockpitExportsUpload.awsS3BucketName') } });
    await new Promise((res) => bucket.createBucket(() => res()));

    uploadParameters.Key = key;
    uploadParameters.ACL = 'public-read';
    uploadParameters.ContentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    uploadParameters.Body = await excel.xlsx.writeBuffer();

    uploadResult = await new Promise((res, rej) => bucket.upload(uploadParameters, (e, d) => (e ? rej(e) : res(d))));
    const { Key, Bucket, Location } = uploadResult;

    log.info(TIBO, `[JOB - START-EXPORT] Successfully Uploaded File ${Key} In Bucket ${Bucket}`);
    log.info(TIBO, `[JOB - START-EXPORT] Creating ExportCleaning Job Of Type ${exportType}, FileKey: ${Key}`);

    const cleanExportDate = new Date().setDate(new Date().getDate() + config.get('cockpitExportsUpload.ttlInDays'));
    await Scheduler.upsertJob(JobTypes.CLEAN_EXPORT, { bucket: Bucket, key: Key }, cleanExportDate);

    await Promise.all(
      recipients.map(async (email) => {
        const commonContact = {
          from: 'no-reply@custeed.com',
          sender: 'Custeed',
          type: ContactTypes.COCKPIT_EXPORT_EMAIL,
        };
        const payload = {
          downloadUrl: Location,
          locale: fullLocale,
          disableMailgunClickTracking: true,
          exportName,
          exportType,
          dataTypes,
          garageIds,
          nGarages: garageIds.length,
          periodId,
          startPeriodId,
          endPeriodId,
          frequency,
          automationCampaignType,
          isEmptyExcel,
        };
        const contact = { to: email, recipient: email, ...commonContact, payload };
        return new Promise((res, rej) => ContactService.prepareForSend(contact, (e, r) => (e ? rej(e) : res(r))));
      })
    );
  }

  return excel || null;
};
