import Enum from '~/utils/enum.js'

export default new Enum({
  DROPPED_ALERT_EMAIL: 'DROPPED_ALERT_EMAIL',
  LOST_GARAGE: 'LOST_GARAGE',
  MESSAGE_QUEUE_ERROR: 'MESSAGE_QUEUE_ERROR',
  EXPORT_AWS_ERROR: 'EXPORT_AWS_ERROR',
  STATS_SYNCHRONIZE_ERROR: 'STATS_SYNCHRONIZE_ERROR',
  REPORT_GENERATION_ERROR: 'REPORT_GENERATION_ERROR',
  CRON_EXECUTION_ERROR: 'CRON_EXECUTION_ERROR',
  HIGH_EXECUTION_TIME: 'HIGH_EXECUTION_TIME',
  EXECUTION_TIMEOUT: 'EXECUTION_TIMEOUT',
  SEND_NEXT_CONTACT_ERROR: 'SEND_NEXT_CONTACT_ERROR',
  SEND_RECONTACT_ERROR: 'SEND_RECONTACT_ERROR',
  ESELLER_LEAD_EXPORT_ERROR: 'ESELLER_LEAD_EXPORT_ERROR',
  REDIS_CONNECTION_ERROR: 'REDIS_CONNECTION_ERROR',
  HTTP2FTP_ERROR: 'HTTP2FTP_ERROR',
  EXOGENOUS_REVIEW_ERROR: 'EXOGENOUS_REVIEW_ERROR',
  EMPTY_CONTACT: 'EMPTY_CONTACT',
  JOB_ERROR: 'JOB_ERROR',
  KPI_ERROR: 'KPI_ERROR'
});

