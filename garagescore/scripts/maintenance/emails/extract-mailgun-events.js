/* eslint-disable strict */
const moment = require('moment');
const Mailgun = require('mailgun-js');

const app = require('../../../server/server');

const _parseArgs = (args) => {
  if (args.length >= 4) {
    // Parsing dates which are the 1st 2 args
    const d1 = moment(args[2]);
    const d2 = moment(args[3]);
    if (!d1.isValid() || !d2.isValid()) {
      console.log(' ERROR: Invalid date(s)');
      console.log(`${d1.isValid() ? '' : 'Date start not valid'} ${d2.isValid() ? '' : 'Date end not valid'}`);
      process.exit(11);
    }
    const dateStart = d1.isBefore(d2) ? d1.startOf('day') : d2.startOf('day');
    const dateEnd = d1.isBefore(d2) ? d2.endOf('day') : d1.endOf('day');

    // Parsing the other options which can be defaulted
    const supportedEventTypes = [
      'rejected',
      'delivered',
      'failed',
      'opened',
      'clicked',
      'unsubscribed',
      'complained',
      'stored',
    ];
    const defaultEventTypes = ['delivered', 'opened', 'clicked', 'unsubscribed'];

    const options = {
      dateStart,
      dateEnd,
      host: process.env.DONOTUSE_MG_HOST,
      domain: process.env.DONOTUSE_MG_DOMAIN,
      eventTypes: defaultEventTypes,
    };

    args.slice(2).forEach((val, index) => {
      if (['--help', '-h'].includes(args[2])) {
        console.log('');
        console.log('* Extracts mailgun events using their API : it uses the DONOTUSE_ prefixed env vars');
        console.log('');
        console.log(
          'Usage node scripts/maintenance/emails/extract-mailgun-events.js <date start> <date end> [--host|-h <host>] [--domain|-d <domain>] [--type|-t <eventTypes comma separated>]'
        );
        console.log('Date formats: ISODate (yyyy-mm-ddThh:mm:ss.xxxZ)');
        process.exit(0);
      }

      if (val === '--host' || val === '-h') {
        options.host = process.argv[index + 1];
      }
      if (val === '--domain' || val === '-d') {
        options.domain = process.argv[index + 1];
      }
      if (val === '--type' || val === '-t') {
        options.eventTypes = process.argv[index + 1].split(',').filter((t) => supportedEventTypes.includes(t));
      }
    });
    return options;
  }
  if (['--help', '-h'].includes(args[2])) {
    console.log('');
    console.log('* Extracts mailgun events using their API : it uses the DONOTUSE_ prefixed env vars');
    console.log('');
    console.log(
      'Usage node scripts/maintenance/emails/extract-mailgun-events.js <date start> <date end> [-h <host>] [-d <domain>] [-t <eventType>]'
    );
    console.log('Date formats: ISODate (yyyy-mm-ddThh:mm:ss.xxxZ)');
    process.exit(0);
  } else {
    console.log('');
    console.log('ERROR : args not valid');
    console.log('');
    console.log(
      'Usage node scripts/maintenance/emails/extract-mailgun-events.js <host> <domain> <date start> <date end>'
    );
    console.log('Date formats: ISODate (yyyy-mm-ddThh:mm:ss.xxxZ)');
    process.exit(10);
  }
};

const initMailgun = (host, domain) => {
  const requiredVars = [
    'DONOTUSE_MG_SECRET_API_KEY',
    'DONOTUSE_MG_PUBLIC_API_KEY',
    'DONOTUSE_MG_DOMAIN',
    'DONOTUSE_MG_HOST',
    'DONOTUSE_MG_PORT',
    'DONOTUSE_MG_PROTOCOL',
  ];
  const missingVars = requiredVars.filter((k) => !process.env[k]);
  if (missingVars.length) {
    return missingVars;
  }

  const mailgunApiCredentials = {
    // Replica of the env vars to use prod's mailgun
    publicApiKey: process.env.DONOTUSE_MG_PUBLIC_API_KEY || '',
    apiKey: process.env.DONOTUSE_MG_SECRET_API_KEY || '',
    protocol: process.env.DONOTUSE_MG_PROTOCOL || '',
    port: process.env.DONOTUSE_MG_PORT || '',
    domain,
    host,
  };

  return Mailgun(mailgunApiCredentials);
};

app.on('booted', async () => {
  const { dateStart, dateEnd, host, domain, eventTypes } = _parseArgs(process.argv);
  const URI = `/${domain}/events`;
  const LIMIT = 300; // Maximum given by Mailgun's API doc
  const mailgunApi = initMailgun(host, domain);

  for (const event of eventTypes) {
    try {
      const params = {
        begin: dateStart.unix(),
        end: dateEnd.unix(),
        limit: LIMIT,
        event,
      };
      if (event === 'failed') params.severity = 'permanent';
      const results = await mailgunApi.get(URI, params);
      console.log('\n', JSON.stringify(results, null, 2));
    } catch (e) {
      console.error(e);
    }
  }
});
