const SmsFactorRequest = require('../../../common/lib/smsfactor/request');
const mockSmsfactor = require('../../../common/lib/test/test-app/mock-smsfactor');
const chai = require('chai').use(require('chai-as-promised'));

const expect = chai.expect;
const fakeCredentials = {
  sfusername: 'iam@legend.com',
  sfpassword: '###',
  sfhost: '//smsdoctor.herokuapp.com',
};
describe('Test smsfactor mock', () => {
  before(async function beforeEach() {
    mockSmsfactor.on();
  });
  after(() => {
    mockSmsfactor.smsSentPop();
    mockSmsfactor.off();
  });
  it('test send sms', async () => {
    const request = new SmsFactorRequest(fakeCredentials);
    request.sendSms('12345', 'test', 'Dev');
    request.sendSms('123456', 'test2', 'Dev2');
    const smsSent = mockSmsfactor.smsSentPop();
    expect(mockSmsfactor.smsSent().length).equal(0);
    expect(smsSent.length).equal(2);
    expect(smsSent[0]).to.deep.equal({ phoneNumber: '12345', messageText: 'test', sender: 'Dev' });
    expect(smsSent[1]).to.deep.equal({ phoneNumber: '123456', messageText: 'test2', sender: 'Dev2' });
  });
  it('test drop sms', async () => {
    const request = new SmsFactorRequest(fakeCredentials);
    request.sendSms('+33600000000', 'Dropped SMS', 'FAKE');
    const smsSent = mockSmsfactor.smsSentPop();
    expect(mockSmsfactor.smsSent().length).equal(0);
    expect(smsSent.length).equal(1);
    expect(smsSent[0]).to.deep.equal({ phoneNumber: '+33600000000', messageText: 'Dropped SMS', sender: 'FAKE' });
  });
});
