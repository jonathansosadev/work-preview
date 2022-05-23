var baseUrls = {
  COCKPIT: '/cockpit',
  DARKBO: '/backoffice',
  ADMIN: '/cockpit/admin',
  GREY_BACKOFFICE: '/grey-bo',
  ANALYTICS: '/cockpit/analytics',
  API: '/api/v1',
  SURVEY: '/s',
};

var urls = {
  AUTH_SIGNIN: '/auth/signin',
  AUTH_SIGNIN_LOCAL: '/auth/signin/local',
  AUTH_BACKDOOR: '/auth/bdoor',
  AUTH_SIGNIN_BACKDOOR: '/auth/signin/bdoor',
  GENERATE_BACKDOOR_PASSWORD: '/auth/bdoor/generate',
  AUTH_REQUEST_NEW_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD_BACK: '/auth/reset-password',
  AUTH_CHECK_RESET_TOKEN: '/auth/check-reset-token',
  AUTH_RESET_PASSWORD: {
    // get by id
    link: '/auth/signin?token=',
    short: '/auth/signin?token=',
  },
  CLIENT_BACKOFFICE: '/cockpit/admin',
  USER_MY_USERS: '/user/my_users',
  USER_CREATE: '/user/create',
  USER_EDIT: {
    // get by id
    link: '/user/edit/:id',
    short: '/user/edit/',
  },
  USER_GARAGES: {
    // get by id
    link: '/user/garages/:id',
    short: '/user/garages/',
  },
  USER_BY_ID: {
    // get by id
    link: '/user/:id',
    short: '/user/',
  },
  PUBLIC_REDIRECT_TO_GOOGLE_WRITE_REVIEW: '/public/writereview/google/:dataid/:googlePlaceId',
  AUTOMATION_CAMPAIGN: '/automation-campaign/:campaignid/:customerid/:isLead/:fromMobile',
  AUTOMATION_CAMPAIGN_REDIRECT:
    '/public/automation-campaign-redirect/:campaignid/:customerid/:customContentId/:isLead/:fromMobile',
  AUTOMATION_CAMPAIGN_UNSUBSCRIBE: '/automation-campaign/unsubscribe/:customerid/:campaignid',
  WIDGET_GROUPS: {
    link: '/user/groups/:id',
    short: '/user/groups/',
    specific: '/user/groups/:id/:groupId',
    GET_ALL: baseUrls.API + '/users/currentUser/widgetGroups',
    GET_ONE: baseUrls.API + '/users/currentUser/widgetGroups/:widgetGroupId',
    CREATE: baseUrls.API + '/users/currentUser/widgetGroups',
    UPDATE: baseUrls.API + '/users/currentUser/widgetGroups/:widgetGroupId',
    DELETE: baseUrls.API + '/users/currentUser/widgetGroups/:widgetGroupId',
    GARAGES: {
      ADD: baseUrls.API + '/users/currentUser/widgetGroups/:widgetGroupId/garages',
      REMOVE: baseUrls.API + '/users/currentUser/widgetGroups/:widgetGroupId/garages/:garageId',
    },
  },
  DARKBO_IMPORT_SCHEMAS: {
    GET_ALL: baseUrls.API + '/darkbo/importSchemas',
  },
  GARAGE_USERS_QUOTA: {
    // get by id
    link: baseUrls.ADMIN + '/garage/users_quota/:id',
    short: baseUrls.ADMIN + '/garage/users_quota/',
  },
  GARAGE_USERS_CREATE_FORM_CONTACT: {
    // get by id
    link: baseUrls.ADMIN + '/createUser/:contactId',
    short: baseUrls.ADMIN + '/createUser/',
  },
  USER_SEARCH: '/user/search',
  GARAGE_BY_ID: {
    // get by id
    link: '/garages/:id',
    short: '/garages/',
  },
  ADMIN: baseUrls.ADMIN,
  ADMIN_HOME: baseUrls.DARKBO,
  ADMIN_CAMPAIGN_SCENARIO_INDEX: baseUrls.DARKBO + '/campaign/scenarios',
  ADMIN_CAMPAIGN_SCENARIO_DATA: baseUrls.DARKBO + '/campaign/scenario',
  ADMIN_CAMPAIGN_LIST: baseUrls.DARKBO + '/campaign/list',
  ADMIN_SCHEDULED_CONTACTS: baseUrls.DARKBO + '/campaign-items/scheduled-contacts',
  ADMIN_SCHEDULED_CONTACTS_LIST: baseUrls.DARKBO + '/campaign-items/scheduled-contacts-list',
  ADMIN_SCHEDULED_CONTACTS_GARAGES: baseUrls.DARKBO + '/campaign-items/scheduled-contacts-garages',
  ADMIN_SCHEDULED_CONTACTS_CAMPAIGN_ITEMS: baseUrls.DARKBO + '/campaign-items/scheduled-contacts-campaign-items',
  ADMIN_CAMPAIGN_ITEM_RETRY: {
    link: baseUrls.DARKBO + '/campaign-items/retry/:id',
    short: baseUrls.DARKBO + '/campaign-items/retry/',
  },
  ADMIN_CAMPAIGN_FORCE_SEND_SCHEDULED_BY_DAY: '/campaign-items/force-send-scheduled-by-day',
  ADMIN_DATA_FILE_LIST_DATA: baseUrls.DARKBO + '/data-files',
  ADMIN_DATA_FILE_LIST: baseUrls.DARKBO + '/data-file',
  ADMIN_DATA_FILE_IMPORTER: baseUrls.DARKBO + '/data-file/file-importer',
  ADMIN_DATA_FILE_IMPORTER_LIST: {
    link: baseUrls.DARKBO + '/data-file/importer/list-files/:garageId',
    short: baseUrls.DARKBO + '/data-file/importer/list-files/',
  },
  ADMIN_DATA_FILE_IMPORTER_VALIDATE: baseUrls.DARKBO + '/data-file/importer/validate',
  ADMIN_DATA_FILE_IMPORTER_FROM_FILESTORE: {
    link:
      baseUrls.DARKBO +
      '/data-file/importer/import-from-filestore/:garageId/:filePath/:importSchemaName/:dataType/:importAutomation',
    short: baseUrls.DARKBO + '/data-file/importer/import-from-filestore/',
  },
  ADMIN_DATA_FILE_IMPORTER_STRING: baseUrls.DARKBO + '/data-file/string-importer',
  ADMIN_API_ID_GENERATOR: baseUrls.DARKBO + '/api/id-generator',
  ADMIN_API_REQUEST_SIMULATOR: baseUrls.DARKBO + '/api/request-simulator',
  ADMIN_API_GENERATE_URL: baseUrls.DARKBO + '/api/generate-api-url',
  ADMIN_API_SIGN_REQUEST: baseUrls.DARKBO + '/api/sign-api-request',
  ADMIN_LEADS_EXPORTS_CONFIG: baseUrls.DARKBO + '/api/leadsExports/config',
  ADMIN_LEADS_EXPORTS_STATS: baseUrls.DARKBO + '/api/leadsExports/stats',
  ADMIN_DATA_FILE_IMPORTER_FROM_STRING: {
    link: baseUrls.DARKBO + '/data-file/importer/import-from-string/:garageId/:dataType',
    short: baseUrls.DARKBO + '/data-file/importer/import-from-string/',
  },
  ADMIN_CUSTOMERS: baseUrls.DARKBO + '/customers',
  ADMIN_CUSTOMERS_LIST: baseUrls.DARKBO + '/customers/list',
  ADMIN_PUBLIC_REVIEW: baseUrls.DARKBO + '/public-reviews',
  ADMIN_PUBLIC_REVIEW_UPDATE: baseUrls.DARKBO + '/public-reviews/update',
  ADMIN_PUBLIC_REVIEW_MODERATE: baseUrls.DARKBO + '/public-reviews/moderate',
  ADMIN_REVIEWS_TEST_MODERATION: baseUrls.DARKBO + '/reviews/test-moderation',
  ADMIN_REVIEWS_CENSORED_WORDS: baseUrls.DARKBO + '/reviews/censored-words',
  ADMIN_REVIEWS_CENSORED_WORDS_UPDATE: baseUrls.DARKBO + '/reviews/censored-words/update/',
  ADMIN_APPLICATION: baseUrls.DARKBO + '/application',
  ADMIN_APPLICATION_MAINTENANCE: baseUrls.DARKBO + '/application/maintenance',
  ADMIN_APPLICATION_MAINTENANCE_CONFIG: baseUrls.DARKBO + '/application/maintenance/config',
  ADMIN_APPLICATION_CRON_INFORMATION_INDEX: baseUrls.DARKBO + '/application/cron-information',
  ADMIN_APPLICATION_SCHEDULER_MONITORING_INDEX: baseUrls.DARKBO + '/application/scheduler-monitoring',
  ADMIN_APPLICATION_EMPTYWORDS: baseUrls.DARKBO + '/application/empty-words',
  ADMIN_APPLICATION_EMPTYWORDS_SAVE: baseUrls.DARKBO + '/application/empty-words/save',
  ADMIN_APPLICATION_MONGO_JOURNAL: baseUrls.DARKBO + '/application/mongo-journal',
  ADMIN_APPLICATION_MONGO_JOURNAL_RESET: baseUrls.DARKBO + '/application/mongo-journal/reset',
  ADMIN_REPUTYSCORE_MONITORING: baseUrls.DARKBO + '/reputyscore/monitoring',
  ADMIN_REPUTYSCORE_MONITORING_FETCH_GARAGES: baseUrls.DARKBO + '/reputyscore/monitoring/garages',
  GARAGE_ADD_EXOGENOUS_CONFIGURATION: {
    link: '/garage/addExogenousConfiguration/:garageId/:type',
    short: '/garage/addExogenousConfiguration/',
  },
  GARAGE_DELETE_EXOGENOUS_CONFIGURATION: {
    link: '/garage/deleteExogenousConfiguration/:garageId/:type',
    short: '/garage/addExogenousConfiguration/',
  },
  ADMIN_GARAGES: baseUrls.DARKBO + '/garages',
  ADMIN_ALL_GARAGES: baseUrls.DARKBO + '/garages/all',
  ADMIN_GARAGES_GROUPS: baseUrls.DARKBO + '/garages/groups',
  ADMIN_GARAGE: baseUrls.DARKBO + '/garage',
  ADMIN_GARAGE_BY_ID: {
    link: baseUrls.DARKBO + '/garage/:id',
    short: baseUrls.DARKBO + '/garage/',
  },
  ADMIN_GARAGE_OUTLETS: baseUrls.DARKBO + '/garage/outlets',
  ADMIN_GARAGE_SOURCETYPES: baseUrls.DARKBO + '/garages/sourcestypes',
  ADMIN_GARAGES_LIST_COMPONENT: baseUrls.DARKBO + '/garageslistcomponent/garages',
  ADMIN_GARAGE_NEW: baseUrls.DARKBO + '/garage/new',
  ADMIN_GARAGE_AWS_SYNC: baseUrls.DARKBO + '/garage/aws_sync',
  ADMIN_GARAGE_RESET_COCKPIT_DATA: baseUrls.DARKBO + '/garage/reset_cockpit_data',
  ADMIN_GARAGE_RUN_FTP2S3: baseUrls.DARKBO + '/garage/run_ftp2s3',
  ADMIN_GARAGE_PULLS: baseUrls.DARKBO + '/garages/pulls',
  ADMIN_GARAGE_PULL_LIST_PUSHES: baseUrls.DARKBO + '/garages/pull/listpushes',
  ADMIN_GARAGE_PULL_LIST_CAMPAIGNS: baseUrls.DARKBO + '/garages/pull/listcampaigns',
  ADMIN_GARAGE_PULL_LIST_CAMPAIGN_DATAS: baseUrls.DARKBO + '/garages/pull/list-campaign-datas',
  ADMIN_GARAGE_PULL_DOWNLOAD: baseUrls.DARKBO + '/garages/pull/download',
  ADMIN_GARAGE_PULL_DATA_FILE_STATS: baseUrls.DARKBO + '/garages/pull/datafilestats',
  ADMIN_GARAGE_PULL_CAMPAIGNS_FROM_DATAFILE: baseUrls.DARKBO + '/garages/pull/campaignsfromdatafile',
  ADMIN_GARAGE_PULL_DATA_FILE_DELETE: baseUrls.DARKBO + '/garages/pull/datafiledelete',
  ADMIN_GARAGE_PULL_IMPORT: baseUrls.DARKBO + '/garages/pull/import',
  ADMIN_GARAGE_PULL_RUN_CAMPAIGN: baseUrls.DARKBO + '/garages/pull/runcampaign',
  ADMIN_GARAGE_PULL_CANCEL_CAMPAIGN: baseUrls.DARKBO + '/garages/pull/cancelcampaign',
  ADMIN_GARAGE_PULL_DELETE_CAMPAIGN: baseUrls.DARKBO + '/garages/pull/deletecampaign',
  ADMIN_GARAGE_PULL_HIDE_CAMPAIGN: baseUrls.DARKBO + '/garages/pull/hidecampaign',
  ADMIN_GARAGE_PULL_VIEW_FILE: baseUrls.DARKBO + '/garages/pull/viewfile',
  ADMIN_GARAGE_INDEXED_LIST: baseUrls.DARKBO + '/garages/indexed',
  ADMIN_GARAGE_TEST_MECAPLANNING: baseUrls.DARKBO + '/garages/testmecaplannning',
  ADMIN_GARAGE_TEST_MECAPLANNING_GETCSV: baseUrls.DARKBO + '/garages/testmecaplannninggetscv',
  ADMIN_GARAGE_TEST_NEXTLANE: baseUrls.DARKBO + '/garages/testnextlane',
  ADMIN_GARAGE_TEST_NEXTLANE_GETCSV: baseUrls.DARKBO + '/garages/testnextlanegetcsv',
  ADMIN_GARAGE_TEST_YUZER: baseUrls.DARKBO + '/garages/testyuzer',
  ADMIN_GARAGE_TEST_YUZER_GETCSV: baseUrls.DARKBO + '/garages/testyuzergetcsv',
  ADMIN_GARAGE_TEST_VMOBILITY: baseUrls.DARKBO + '/garages/tests/vmobility',
  ADMIN_GARAGE_EXPORTS: baseUrls.DARKBO + '/garages/tests/exports',
  ADMIN_GARAGE_CROSS_LEADS: baseUrls.DARKBO + '/garages/cross-leads',
  ADMIN_GARAGE_CROSS_LEADS_CLEAN_BUCKET: baseUrls.DARKBO + '/garages/cross-leads/clean',
  ADMIN_GARAGE_CROSS_LEADS_ADD: baseUrls.DARKBO + '/garages/cross-leads/add',
  ADMIN_GARAGE_CROSS_LEADS_SIMULATION: baseUrls.DARKBO + '/garages/cross-leads/simulation',
  ADMIN_GARAGE_CROSS_LEADS_JOB_SIMULATION: baseUrls.DARKBO + '/garages/cross-leads/simulation/job',
  ADMIN_GARAGE_CROSS_LEADS_STATS: baseUrls.DARKBO + '/garages/cross-leads/stats',
  ADMIN_GARAGE_CROSS_LEADS_OVH_NEW_PHONES: baseUrls.DARKBO + '/garages/cross-leads/ovhNewPhones',
  ADMIN_GARAGE_CROSS_LEADS_GET_FILTERS: baseUrls.DARKBO + '/garages/cross-leads/get/xLeadsFilters',
  ADMIN_GARAGE_CROSS_LEADS_ADD_FILTERS: baseUrls.DARKBO + '/garages/cross-leads/add/xLeadsFilters',
  ADMIN_GARAGE_CROSS_LEADS_DELETE_FILTERS: baseUrls.DARKBO + '/garages/cross-leads/delete/xLeadsFilters',
  ADMIN_GARAGE_TEST_WIDGET: baseUrls.DARKBO + '/garages/tests/widget',
  ADMIN_GARAGE_TEST_VMOBILITY_GETCSV: baseUrls.DARKBO + '/garages/tests/vmobility/getcsv',
  ADMIN_REPORT_RENDER: baseUrls.DARKBO + '/report/render-report',
  ADMIN_REPORT_GENERATE: baseUrls.DARKBO + '/report/generate-report',
  ADMIN_REPORT_LIST: baseUrls.DARKBO + '/report/list',

  ADMIN_MONITORING_PROFILER: baseUrls.DARKBO + '/monitoring/profiler',
  ADMIN_MONITORING_MONTHLY_SUMMARY: baseUrls.DARKBO + '/monitoring/monthly-summary',
  ADMIN_MONITORING_MONTHLY_SUMMARY_VALIDATE: baseUrls.DARKBO + '/monitoring/monthly-summary/validate',

  ADMIN_USERS: baseUrls.DARKBO + '/users',
  ADMIN_ALL_USERS: baseUrls.DARKBO + '/users/all',
  ADMIN_GET_ONE_USER: {
    link: baseUrls.DARKBO + '/users/info/:id',
    short: baseUrls.DARKBO + '/users/info/',
  },
  ADMIN_USERS_LIST: baseUrls.DARKBO + '/users_list/download',
  ADMIN_USERS_JSON_LIST: baseUrls.DARKBO + '/users/list',
  ADMIN_USERS_ANONYMIZE: baseUrls.DARKBO + '/users/anonymize/',
  ADMIN_USER_SEARCH: baseUrls.DARKBO + '/user/search',
  ADMIN_CONTACT_MANAGE: baseUrls.DARKBO + '/contacts',
  ADMIN_CONTACT_LIST: baseUrls.DARKBO + '/contact/list',
  ADMIN_CONTACT_RE_SEND_SMS: baseUrls.DARKBO + '/contact/resend-sms',
  ADMIN_CONTACT_SEARCH: baseUrls.DARKBO + '/contact/search',
  ADMIN_CONTACT_PREVIEW_INDEX: baseUrls.DARKBO + '/contact/preview',
  ADMIN_CONTACT_PREVIEW_BULK: baseUrls.DARKBO + '/contact/preview-bulk',
  ADMIN_CONTACT_PREVIEW_BULK_FETCH: baseUrls.DARKBO + '/contact/preview-bulk/fetch',
  ADMIN_CONTACT_PREVIEW_BULK_SEND: baseUrls.DARKBO + '/contact/preview-bulk/send',
  ADMIN_CONTACT_PREVIEW_CONTENT: baseUrls.DARKBO + '/contact/preview-generate',
  ADMIN_CONTACT_RENDERER: {
    link: baseUrls.DARKBO + '/contact/renderer/:id',
    short: baseUrls.DARKBO + '/contact/renderer/',
  },
  ADMIN_USER: {
    // get by id
    link: baseUrls.DARKBO + '/user/:id',
    short: baseUrls.DARKBO + '/user/',
  },
  ADMIN_USER_UPDATE_COCKPIT_TYPE: {
    // update cockpit type
    link: baseUrls.DARKBO + '/user/cockpit-type/:id',
    short: baseUrls.DARKBO + '/user/cockpit-type/',
  },
  ADMIN_USER_EDIT: {
    link: baseUrls.DARKBO + '/users/edit/:command',
    short: baseUrls.DARKBO + '/users/edit/',
  },
  ADMIN_FAQ_SURVEYS: baseUrls.DARKBO + '/faq/surveys',
  ADMIN_FAQ_ALERTS: baseUrls.DARKBO + '/faq/alerts',
  ADMIN_FAQ_REPORTS: baseUrls.DARKBO + '/faq/reports',
  ADMIN_FAQ_API: baseUrls.DARKBO + '/faq/api',
  ADMIN_FAQ_WIDGET: baseUrls.DARKBO + '/faq/widget',
  ADMIN_FAQ_WWW: baseUrls.DARKBO + '/faq/www',
  ADMIN_FAQ_ADMIN: baseUrls.DARKBO + '/faq/admin',

  ADMIN_EXPORTS: baseUrls.DARKBO + '/exports',
  ADMIN_EXPORTS_GARAGES: baseUrls.DARKBO + '/exports/garages',
  ADMIN_EXPORTS_GARAGES_DOWNLOAD: baseUrls.DARKBO + '/exports/garages/download',
  ADMIN_EXPORTS_SCENARIOS: baseUrls.DARKBO + '/exports/scenarios',
  ADMIN_EXPORTS_DEFAULT_MANAGERS: baseUrls.DARKBO + 'exports/default-managers',
  ADMIN_GARAGE_EXPORTS_BILLING_CSV: baseUrls.DARKBO + '/exports/billing/csv',
  ADMIN_EXPORTS_AUTOMATION: baseUrls.DARKBO + '/exports/automation',
  ADMIN_EXPORTS_AUTOMATION_DOWNLOAD: baseUrls.DARKBO + '/exports/automation/download',
  ADMIN_EXPORTS_AUTOMATION_SENT_DOWNLOAD: baseUrls.DARKBO + '/exports/automation/targeted/download',
  ADMIN_EXPORTS_AUTOMATION_REPORT_CSV: baseUrls.DARKBO + '/exports/automation/csv/dataToAddToCustomers',
  ADMIN_EXPORTS_CROSS_LEADS_STATS: baseUrls.DARKBO + '/exports/cross-leads/stats',
  ADMIN_EXPORTS_IDEASBOX: baseUrls.DARKBO + '/exports/ideasbox',

  ADMIN_DATA_FILE_DYNAMIC_PARSERS_CONFIG: baseUrls.DARKBO + '/data-file/parsers/config',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_CONFIG_LOAD: baseUrls.DARKBO + '/data-file/parsers/config/load/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_CONFIG_SAVE: baseUrls.DARKBO + '/data-file/parsers/config/save/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_MAKES: baseUrls.DARKBO + '/data-file/parsers/makes',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_MAKES_LOAD: baseUrls.DARKBO + '/data-file/parsers/makes/load/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_MAKES_SAVE: baseUrls.DARKBO + '/data-file/parsers/makes/save/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED: baseUrls.DARKBO + '/data-file/parsers/undefined',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED_LOAD: baseUrls.DARKBO + '/data-file/parsers/undefined/load/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED_APPLY: baseUrls.DARKBO + '/data-file/parsers/undefined/apply/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_UNDEFINED_SAVE: baseUrls.DARKBO + '/data-file/parsers/undefined/save/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_COLUMNS: baseUrls.DARKBO + '/data-file/parsers/columns',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_TYPES: baseUrls.DARKBO + '/data-file/parsers/types',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_TYPES_LOAD: baseUrls.DARKBO + '/data-file/parsers/types/load/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_TYPES_SAVE: baseUrls.DARKBO + '/data-file/parsers/types/save/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_COLUMNS_LOAD: baseUrls.DARKBO + '/data-file/parsers/columns/load/',
  ADMIN_DATA_FILE_DYNAMIC_PARSERS_COLUMNS_SAVE: baseUrls.DARKBO + '/data-file/parsers/columns/save/',

  ADMIN_IMPORTS_SHARED_FILTERS: baseUrls.DARKBO + '/imports/shared-options',
  ADMIN_IMPORTS_SHARED_FILTERS_SAVE: baseUrls.DARKBO + '/imports/shared-options/save',
  ADMIN_IMPORTS_FILTER_TEST: baseUrls.DARKBO + '/imports/filter/test',
  ADMIN_DATA_SEARCH: baseUrls.DARKBO + '/data/search',
  ADMIN_AUTOMATION_EVENTS: baseUrls.DARKBO + '/automation/events',
  ADMIN_AUTOMATION_EVENTSFETCH: baseUrls.DARKBO + '/automation/eventsfetch',
  ADMIN_AUTOMATION_FETCH_MONITORING_SETTINGS: baseUrls.DARKBO + '/automation/get/settings',
  ADMIN_AUTOMATION_UPDATE_MONITORING_SETTINGS: baseUrls.DARKBO + '/automation/update/settings',
  ADMIN_DATA_DISPLAY_ROOT: baseUrls.DARKBO + '/data/',
  ADMIN_DATA_DISPLAY: baseUrls.DARKBO + '/data/:dataId',
  ADMIN_DATA_SWITCH_SHOULDSURFACEINSTATISTICS: {
    link: baseUrls.DARKBO + '/data/switch/:dataId',
    short: baseUrls.DARKBO + '/data/switch/',
  },

  ADMIN_JOBS_INDEX: baseUrls.DARKBO + '/jobs/index',
  ADMIN_JOBS_LIST: baseUrls.DARKBO + '/jobs/list',
  ADMIN_JOBS_TYPES: baseUrls.DARKBO + '/jobs/types',
  ADMIN_JOBS_EXECUTE: baseUrls.DARKBO + '/jobs/execute/:jobId',
  ADMIN_JOBS_MORE: baseUrls.DARKBO + '/jobs/more',

  ADMIN_DATA_DOWNLOAD_ROOT: baseUrls.DARKBO + '/data/download/',
  ADMIN_DATA_DOWNLOAD: baseUrls.DARKBO + '/data/download/:dataId',
  ADMIN_DATA_ANONYMIZE_ROOT: baseUrls.DARKBO + '/data/anonymize/',
  ADMIN_DATA_FORCE_SURVEY_UPDATE_ROOT: baseUrls.DARKBO + '/data/force-survey-update/',
  ADMIN_DATA_FORCE_SURVEY_UPDATE: baseUrls.DARKBO + '/data/force-survey-update/:dataId',
  ADMIN_DATA_FORCE_SEND_NEXT_CAMPAIGN_CONTACT_FOR_DAY_ROOT:
    baseUrls.DARKBO + '/data/force-send-next-campaign-contact-for-day/',
  ADMIN_DATA_FORCE_SEND_NEXT_CAMPAIGN_CONTACT_FOR_DAY:
    baseUrls.DARKBO + '/data/force-send-next-campaign-contact-for-day/:dataId',
  ADMIN_DATA_FORCE_SEND_NEXT_CAMPAIGN_RE_CONTACT_FOR_DAY_ROOT:
    baseUrls.DARKBO + '/data/force-send-next-campaign-re-contact-for-day/',
  ADMIN_DATA_FORCE_SEND_UNSATISFIED_FOLLOWUP_ROOT: baseUrls.DARKBO + '/data/force-send-unsatisfied-followup/',
  ADMIN_DATA_FORCE_SEND_UNSATISFIED_FOLLOWUP: baseUrls.DARKBO + '/data/force-send-unsatisfied-followup/:dataId',
  ADMIN_DATA_FORCE_SEND_LEAD_FOLLOWUP_ROOT: baseUrls.DARKBO + '/data/force-send-lead-followup/',
  ADMIN_DATA_FORCE_SEND_LEAD_FOLLOWUP: baseUrls.DARKBO + '/data/force-send-lead-followup/:dataId',

  ADMIN_DATA_FORCE_SEND_NEXT_CAMPAIGN_RE_CONTACT_FOR_DAY:
    baseUrls.DARKBO + '/data/force-send-next-campaign-re-contact-for-day/:dataId',
  ADMIN_DATA_FORCE_SEND_ALERTS_ROOT: baseUrls.DARKBO + '/data/force-send-alerts/',
  ADMIN_DATA_FORCE_SEND_ALERTS: baseUrls.DARKBO + '/data/force-send-alerts/:dataId',
  ADMIN_DATA_ANONYMIZE: baseUrls.DARKBO + '/data/anonymize/:dataId',
  ANALYTICS_HOME: baseUrls.ANALYTICS,
  ANALYTICS_DASHBOARDS: {
    link: baseUrls.ANALYTICS + '/dashboard/*',
    short: baseUrls.ANALYTICS + '/dashboard/',
  },
  ANALYTICS_APV: baseUrls.ANALYTICS + '/apv',
  ANALYTICS_VN: baseUrls.ANALYTICS + '/vn',
  ANALYTICS_VO: baseUrls.ANALYTICS + '/vo',
  ANALYTICS_LEADS: baseUrls.ANALYTICS + '/leads',
  ANALYTICS_TEAM: baseUrls.ANALYTICS + '/team',
  ANALYTICS_MAP: baseUrls.ANALYTICS + '/map',
  GREY_BACKOFFICE_BASE: baseUrls.GREY_BACKOFFICE + '/',
  GREY_BACKOFFICE_ALL_ROUTES: baseUrls.GREY_BACKOFFICE + '/*',
  GREY_BACKOFFICE_TEST_SURVEY: baseUrls.GREY_BACKOFFICE + '/test-survey',
  GREY_BACKOFFICE_DIST: baseUrls.GREY_BACKOFFICE + '/dist',
  GREY_BACKOFFICE_SERVICE_WORKER: baseUrls.GREY_BACKOFFICE + '/service-worker.js',
  GREY_BACKOFFICE_MANIFEST: baseUrls.GREY_BACKOFFICE + '/manifest.json',
  COCKPIT_HOME: {
    link: baseUrls.COCKPIT + '(?garageId=:garageId)',
    short: baseUrls.COCKPIT,
  },
  COCKPIT_WELCOME: {
    link: baseUrls.COCKPIT + '/welcome',
    short: baseUrls.COCKPIT + '/welcome',
  },
  COCKPIT_CONTACT_QUALIFICATION: {
    link: baseUrls.COCKPIT + '/contacts(/garage/:garageId)?',
    short: baseUrls.COCKPIT + '/contacts',
  },
  COCKPIT_PUBLIC_REVIEW_REPORT: baseUrls.COCKPIT + '/public-review/report',
  COCKPIT_DATA_RECORD_STATISTICS_DOWNLOAD: {
    link: baseUrls.COCKPIT + '/data-record-statistics/download/:dowloadKey/:docName.:ext',
    short: baseUrls.COCKPIT + '/data-record-statistics/download/',
  },
  COCKPIT_COMMENT_THREAD_ADD_COMMENT: baseUrls.COCKPIT + '/data-record-comment-thread/add-comment',
  COCKPIT_COMMENT_THREAD_CHANGE_STATUS: baseUrls.COCKPIT + '/data-record-comment-thread/changeStatus',
  STATIC_REDIRECTS: {
    link: '/static-redirect*',
    short: '/static-redirect',
  },
  PUBLIC_REPORT: '/report/:token',
  MONTLHY_SUMMARY: {
    link: '/report/monthlySummary/:token',
    short: '/report/monthlySummary',
  },
  TEAM: {
    REVIEW: {
      FRONT_END: '/team/review',
      GET_PROJECTS: baseUrls.API + '/team/review/projects',
      GET_COLUMNS: baseUrls.API + '/team/review/projects/:projectId/columns',
      GET_CARDS: baseUrls.API + '/team/review/projects/:projectId/columns/:columnId/cards',
      ADD_CARD: baseUrls.API + '/team/review/projects/:projectId/columns/:columnId/cards',
      DELETE_CARD: baseUrls.API + '/team/review/projects/:projectId/columns/:columnId/cards/:cardId',
      UPDATE_CARD: baseUrls.API + '/team/review/projects/:projectId/columns/:columnId/cards/:cardId',
      MOVE_CARD: baseUrls.API + '/team/review/projects/:projectId/columns/:columnId/cards/:cardId/moves',
    },
  },
  USER_JOBS: {
    GET_ALL: baseUrls.API + '/userJobs',
    SAVE: baseUrls.API + '/userJobs',
    DELETE: baseUrls.API + '/userJobs/:userJobName',
    FRONT_END: baseUrls.DARKBO + '/userJobs',
  },
  GOOGLE_PLACE: {
    UPDATE_ONE: baseUrls.API + '/googlePlace/:garageId',
  },
  CERTIFICAT: {
    GET_ONE: '/garage/v2/:slug',
  },
  YELLOW_PAGE: {
    BASE: '/public/share-on-yellow-pages/',
    SHARE: '/public/share-on-yellow-pages/:id',
    REMOVE: '/public/share-on-yellow-pages/toremove',
  },
  // cockpit v2
  COCKPIT_DIST: baseUrls.COCKPIT + '/dist',
  COCKPIT_SERVICE_WORKER: baseUrls.COCKPIT + '/service-worker.js',
  COCKPIT_MANIFEST: baseUrls.COCKPIT + '/manifest.json',
  COCKPIT_LEAD: baseUrls.COCKPIT + '/leads',
  COCKPIT_E_REPUTATION: baseUrls.COCKPIT + '/e-reputation',
  COCKPIT_LEAD_GARAGE: {
    link: baseUrls.COCKPIT + '/leads/garage/:garageId',
    short: baseUrls.COCKPIT + '/leads/garage/',
  },
  COCKPIT_LEAD_TICKET: {
    link: baseUrls.COCKPIT + '/leads/:dataId',
    short: baseUrls.COCKPIT + '/leads/',
  },
  COCKPIT_UNSATISFIED: baseUrls.COCKPIT + '/unsatisfied',
  COCKPIT_UNSATISFIED_GARAGE: {
    link: baseUrls.COCKPIT + '/unsatisfied/garage/:garageId',
    short: baseUrls.COCKPIT + '/unsatisfied/garage/',
  },
  COCKPIT_UNSATISFIED_TICKET: {
    link: baseUrls.COCKPIT + '/unsatisfied/:dataId',
    short: baseUrls.COCKPIT + '/unsatisfied/',
  },
  COCKPIT_ADMIN_USER: {
    link: baseUrls.COCKPIT + '/admin/user',
    short: baseUrls.COCKPIT + '/admin/user',
  },
  COCKPIT_ACCEPT_NEW_USER_REQUEST: {
    link: baseUrls.COCKPIT + '/user/accept-new-user-request/:dataId',
    short: baseUrls.COCKPIT + '/user/accept-new-user-request/',
  },
  COCKPIT_SHOWCASE: baseUrls.COCKPIT + '/show-case',
  COCKPIT_PREVIEW_EMAIL: baseUrls.COCKPIT + '/contact/preview-generate',

  COCKPIT: {},
  GREYBO: {
    BILLING: {
      BILLING_ACCOUNTS: {
        GET: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId',
        GET_ALL: baseUrls.API + '/darkbo/billing/billingaccounts',
        GET_BILL: baseUrls.API + '/darkbo/billing/get-the-bill',
        GET_CURRENT_MONTH_BILL: baseUrls.API + '/darkbo/billing/get-current-month-bill',
        CREATE: baseUrls.API + '/darkbo/billing/billingaccounts',
        UPDATE: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId',
        DELETE: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId',
        GARAGES: {
          ADD: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId/garages',
          REMOVE: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId',
          SUBSCRIPTIONS: {
            CREATE: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId/',
            STOP: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId/stop',
            UPDATE: baseUrls.API + '/darkbo/billing/billingaccounts/:billingAccountId/garages/:garageId/',
          },
        },
      },
    },
    SUBSCRIPTIONS: {
      GET_ALL: baseUrls.GREY_BACKOFFICE + '-api/subscription-requests/fetch',
    },
  },
  SURVEY: {
    GARAGE: baseUrls.SURVEY,
    MOBILE_LANDING_PAGE: '/m',
    UNSATISFIED_LANDING: '/u',
  },
  SUBSCRIPTION_FORM_ROOT: '/subscription-api/subscription-form',
  SUBSCRIPTION_FORM: '/subscription-api/subscription-form/:slug',
  SUBSCRIPTION_SUBMIT: '/subscription-api/subscription-form/:slug/submit',
  SIMULATORS: {
    IMPORTER: '/simulators/importer',
    MAILGUM: '/simulators/mailgum',
    SMSDOCTOR: '/simulators/smsdoctor',
  },
};

module.exports = {
  getShortUrl: function (name) {
    if (!urls[name]) {
      throw new Error('Url name ' + name + ' is not found ');
    }
    var url = urls[name];
    if (typeof url === 'string') {
      return url;
    }
    return url.short;
  },
  getUrl: function (name) {
    if (!urls[name]) {
      throw new Error('Url name ' + name + ' is not found ');
    }
    var url = urls[name];
    if (typeof url === 'string') {
      return url;
    }
    return url.link;
  },
  getSpecificUrl: function (name) {
    if (!urls[name]) {
      throw new Error('Url name ' + name + ' is not found ');
    }
    var url = urls[name];
    if (typeof url === 'string') {
      return url;
    }
    return url.specific;
  },
  getUrls: function () {
    return urls;
  },
  getUrlNamespace: function (name) {
    return urls[name] || {};
  },
};
