const { expect } = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQueryAs = require('./_send-query-as');
const app = new TestApp();
const UserAuthorization = require('../../common/models/user-autorization');
const slackStubs = require('../../common/lib/test/test-app/mock-slack-postMessage');
let user;

const request = `mutation userSetSendSlackMessage($message: String!, $channel: String) {
    userSetSendSlackMessage(message: $message, channel: $channel) {
    status
    }
}`;

describe('Apollo::userSetSendSlackMessage', async function () {
  beforeEach(async () => {
    await app.reset();
    slackStubs.on();
    user = await app.addUser({
      authorization: {
        [UserAuthorization.ACCESS_TO_GREYBO]: true,
      },
    });
  });

  afterEach(() => {
    slackStubs.off();
  });

  it('should send a slack message through the provided channel', async function () {
    const variables = {
      message: 'this is a message for the slack channel test',
      channel: 'test',
    };

    const res = await sendQueryAs(app, request, variables, user._userId);
    expect(res.errors).to.be.undefined;
    expect(res.data).to.be.an('object').which.have.keys('userSetSendSlackMessage');
    expect(res.data.userSetSendSlackMessage).to.be.an('object').which.have.keys('status');
    expect(res.data.userSetSendSlackMessage.status).to.be.true;
  });
});
