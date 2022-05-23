const sinon = require('sinon');
const Facebook = require('../../util/facebook');

let facebookReply;
const replies = [];

/** Mock api call to facebook reply method*/
module.exports = {
  // start mocking
  on: () => {
    if (facebookReply) {
      facebookReply.restore();
    }
    facebookReply = sinon.stub(Facebook, 'postComment').callsFake(async (externalId, token, id, message) => {
      if (externalId && token !== 'error' && id && message) {
        replies.push({ [id]: message });
        return { id: 'an id', message, created_time: new Date(), from: 'John Doe' };
      }
      return { error: 'An error occured with the facebook service' };
    });
  },
  // stop mocking
  off: () => {
    if (facebookReply) {
      facebookReply.restore();
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
