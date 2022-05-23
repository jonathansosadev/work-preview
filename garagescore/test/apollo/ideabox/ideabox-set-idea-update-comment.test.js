const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../../common/lib/test/test-app');
const sendQuery = require('../_send-query');

const { expect } = chai;
const app = new TestApp();

describe('apollo::ideabox-set-idea-update-comment', () => {
  beforeEach(async () => {
    await app.reset();
    await app.models.Idea.getMongoConnector().insertOne({
      title: 'Test the ideabox',
      author: 'custeed',
      category: 'Enquêtes',
      likes: [],
      comments: [
        {
          author: 'obama',
          comment: ':+1:',
          createdAt: new Date(),
        },
        {
          author: 'obama',
          comment: ':+1:',
          createdAt: new Date(),
        },
      ],
      open: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('IdeaboxSetIdea update comment', async () => {
    const user = 'test';
    let idea = await app.models.Idea.getMongoConnector().findOne({});
    expect(idea.comments[1].comment).equals(':+1:');
    const ideaId = idea._id.toString();
    let query = `mutation IdeaboxSetIdeaUpdateComment($user: String!, $ideaId: String!, $commentId: Int!, $newComment: String!) {
      IdeaboxSetIdeaUpdateComment(user: $user, ideaId: $ideaId, commentId: $commentId, newComment: $newComment) {
        status
      }
    }`;
    let queryRes = await sendQuery(app, query, { user, ideaId, commentId: 1, newComment: ':-1:' });
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    expect(queryRes.data.IdeaboxSetIdeaUpdateComment.status).equals('OK');
    idea = await app.models.Idea.getMongoConnector().findOne({});
    expect(idea.comments[1].comment).equals(':-1:');
  });
});
