/* Push to the other Contacts queue */
const axios = require('axios');
const Mailgun = require('mailgun-js');
const { MailComposer } = require('mailcomposer');

const app = require('../../../server/server');
const gsAPISignature = require('../../../common/lib/garagescore/api/signature');
const appInfos = require('../../../common/lib/garagescore/api/app-infos');

const _parseArgs = () => {
  const options = {};
  process.argv.forEach((val, index) => {
    if (val === '--help' || val === '-h') {
      console.log('');
      console.log('* Manually sends an email to a given email adress using the contactId provided');
      console.log('');
      console.log(
        'Usage node scripts/maintenance/contacts/manual-send-contact.js [--email <email address>] [--contactId <contactId>]'
      );
      process.exit(0);
    }

    if (val === '--email' || val === '--address' || val === '-e') {
      options.email = process.argv[index + 1];
      console.log('Email :', options.email);
    }
    if (val === '--contactId' || val === '--id' || val === '-c') {
      options.contactId = process.argv[index + 1];
      console.log('ContactId :', options.contactId);
    }
  });
  return options;
};

const initMailgun = () => {
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
    apiKey: process.env.DONOTUSE_MG_SECRET_API_KEY || '',
    publicApiKey: process.env.DONOTUSE_MG_PUBLIC_API_KEY || '',
    domain: process.env.DONOTUSE_MG_DOMAIN || '',
    host: process.env.DONOTUSE_MG_HOST || '',
    port: process.env.DONOTUSE_MG_PORT || '',
    protocol: process.env.DONOTUSE_MG_PROTOCOL || '',
  };

  return Mailgun(mailgunApiCredentials);
};

const composeEmailMimeParameters = (dest, contact, messageSource) => {
  const sendMimeParameters = {
    to: dest, // e-mail address is mandatory for Mailgun
    message: messageSource,
    'v:contactId': contact.getId().toString(),
  };
  if (contact.payload && contact.payload.tags) {
    sendMimeParameters['o:tag'] = contact.payload.tags;
  }
  return sendMimeParameters;
};

const composeEmailMessageSource = (addr, content) => {
  const mailcomposer = new MailComposer();

  mailcomposer.setMessageOption({
    to: addr,
    from: mailcomposer.convertAddress({
      name: 'Sender d emails manuel',
      address: 'manual.send@custeed.com',
    }),
    subject: content.subject,
    body: content.textBody,
    html: content.htmlBody,
  });

  return new Promise((res, rej) => {
    mailcomposer.buildMessage((err, source) => {
      if (err) {
        rej(err);
        return;
      }
      res(source);
    });
  });
};

const getRenderedContact = async (contactId) => {
  const renderUrl = `${process.env.APP_URL}/public-api/renderContact/${contactId}`;
  const { appId, appSecret } = Object.values(appInfos.currentApps)[0];
  let renderedContact;
  try {
    const signature = gsAPISignature.sign(appId, appSecret, 'GET', renderUrl);
    renderedContact = await axios.get(`${renderUrl}?appId=${appId}&signature=${signature}`);
  } catch (axiosErr) {
    console.error(`Request to get rendered contact failed : ${axiosErr}`);
    process.exit(31);
  }
  if (!renderedContact || renderedContact.status !== 200 || !renderedContact.data) {
    console.error('Contact not rendered properly');
    process.exit(30);
  }

  return renderedContact.data;
};

const { email, contactId } = _parseArgs();
// Getting the args and ensuring they're valid
const emailIsValid = (addr) => /([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/.test(addr);
if (!email || !emailIsValid(email)) {
  console.error(`Please ensure the email adress is valid. Currently: ${email}`);
  process.exit(10);
}
if (!contactId) {
  console.error('No contact id provided');
  process.exit(20);
}

const mailgunApi = initMailgun();
if (Array.isArray(mailgunApi)) {
  // When an env var is missing I return all vars that need to be set
  console.error('Cannot initiate mailgunApi, environment variables are missing');
  console.error(`Need to set ${mailgunApi.join(', ')}`);
  process.exit(40);
}

app.on('booted', async () => {
  const contactObj = await app.models.Contact.findById(contactId);
  if (!contactObj) {
    console.error(`Contact with id: ${contactId} not found`);
    process.exit(21);
  }

  // Rendering the contact
  const renderedContact = await getRenderedContact(contactId);

  // Using mailgun to send the contact
  const messageSource = await composeEmailMessageSource(email, renderedContact);
  const mimeParameters = composeEmailMimeParameters(email, contactObj, messageSource);
  let mailgunResult;
  try {
    mailgunResult = await mailgunApi.messages().sendMime(mimeParameters);
  } catch (mailgunError) {
    console.error(`Error while calling mailgunApi ${mailgunError}`);
    process.exit(41);
  }
  console.log(mailgunResult);
  process.exit(0);
});
