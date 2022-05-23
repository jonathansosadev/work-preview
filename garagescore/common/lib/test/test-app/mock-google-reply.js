const sinon = require('sinon');
const Google = require('../../util/google');

let googleReply;
const replies = [];

/** Mock api call to google reply method*/
module.exports = {
  // start mocking
  on: () => {
    if (googleReply) {
      googleReply.restore();
    }
    googleReply = sinon.stub(Google, 'reply').callsFake(async function (refreshToken, reviewName, comment) {
      if (refreshToken !== 'error' && reviewName && comment) {
        replies.push({ [reviewName]: comment });
        return { message: 'Reply created' };
      }
      return { error: 'An error occured with the google service' };
    });
  },
  // stop mocking
  off: () => {
    if (googleReply) {
      googleReply.restore();
    }
  },
  reset: () => {
    replies.length = 0;
  },
  // return all replies sent with the stub
  replies: () => replies,
  // return all replies sent with the stub and clear the list
  findById: (id) => replies.find((replie) => replie[id]),
};
