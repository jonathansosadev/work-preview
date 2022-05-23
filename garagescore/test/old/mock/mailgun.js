const TestApp = require('../../../common/lib/test/test-app');
const mockMailgun = require('../../../common/lib/test/test-app/mock-mailgun');
const chai = require('chai').use(require('chai-as-promised'));
const mailgunApi = require('../../../common/lib/mailgun/api');
const MailComposer = require('mailcomposer').MailComposer;

const expect = chai.expect;
const app = new TestApp();

async function _composeEmailMessageSource(sender, recipient, subject, body) {
  return new Promise((resolve, reject) => {
    const mailcomposer = new MailComposer();

    const fromString = mailcomposer.convertAddress({
      name: 'sender',
      address: sender,
    });

    const toString = mailcomposer.convertAddress({
      name: 'recipient',
      address: recipient,
    });

    mailcomposer.setMessageOption({
      to: toString,
      from: fromString,
      subject,
      body,
      html: body,
    });
    mailcomposer.buildMessage((e, ...res) => {
      if (e) {
        reject(e);
      } else {
        resolve(res);
      }
    });
  });
}

const _sendEmail = async (sender, recipient, subject, body) => {
  const messageSource = await _composeEmailMessageSource(sender, recipient, subject, body);

  const mimeParameters = {
    to: recipient, // e-mail address is mandatory for Mailgun
    message: messageSource,
    'v:contactId': 'contactId',
  };
  return await mailgunApi.initFromDomainKey('default').messages().sendMime(mimeParameters);
};

describe('Test mailgun mock', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    mockMailgun.on();
  });

  after(() => {
    mockMailgun.emailSentPop();
    mockMailgun.off();
  });

  it('test send email', async () => {
    await _sendEmail('from@gscore.com', 'to@client.com', 'test', 'coucou');
    await _sendEmail('from2@gscore.com', 'to2@client.com', 'test2', 'coucou2');
    const emailSent = mockMailgun.emailSentPop();
    expect(mockMailgun.emailSent().length).equal(0);
    expect(emailSent.length).equal(2);
    expect(emailSent[0]).to.deep.equal({
      to: '"recipient" <to@client.com>',
      from: '"sender" <from@gscore.com>',
      subject: 'test',
      body: 'coucou',
      html: 'coucou',
    });
    expect(emailSent[1]).to.deep.equal({
      to: '"recipient" <to2@client.com>',
      from: '"sender" <from2@gscore.com>',
      subject: 'test2',
      body: 'coucou2',
      html: 'coucou2',
    });
  });
});
