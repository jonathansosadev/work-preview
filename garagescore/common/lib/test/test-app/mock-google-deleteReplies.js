const sinon = require('sinon');
const Google = require('../../util/google');

let googleReply;
let replies = [];

/** Mock api call to google delete method*/
module.exports = {
  // start mocking
  on: () => {
    if (googleReply) {
      googleReply.restore();
    }
    googleReply = sinon.stub(Google, 'delete').callsFake(async (token, commentId) => {
      if (token !== 'error' && commentId) {
        replies = replies.filter((reply) => reply.id !== commentId);
        return true;
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
  replies: () => replies,

  addReply: (reply) => replies.push(reply), // reply is an object {id: blabla, reply: blabla}
  findReply: (replyId) => replies.find((reply) => reply.id === replyId),
};
