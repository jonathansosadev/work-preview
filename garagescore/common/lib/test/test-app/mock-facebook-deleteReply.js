const sinon = require('sinon');
const Facebook = require('../../util/facebook');

let facebookReply;
let replies = [];

/** Mock api call to facebook reply method*/
module.exports = {
  // start mocking
  on: () => {
    if (facebookReply) {
      facebookReply.restore();
    }
    facebookReply = sinon.stub(Facebook, 'deleteComment').callsFake(async (externalId, token, commentId) => {
      if (externalId && token !== 'error' && commentId) {
        replies = replies.filter((reply) => reply.id !== commentId);
        return { status: 'Approved', thread: replies };
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
  addReply: (reply) => replies.push(reply), // reply is an object {id: blabla, reply: blabla}
  replies: () => replies,
  // return all replies sent with the stub
  findReply: (replyId) => replies.find((reply) => reply.id === replyId),
};
