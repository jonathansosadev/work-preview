const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../../common/lib/test/test-app');
const sendQuery = require('../_send-query');

const { expect } = chai;
const app = new TestApp();

describe('apollo::ideabox-add-comment', () => {
  beforeEach(async () => {
    await app.reset();
    await app.models.Idea.getMongoConnector().insertOne({
      title: 'Test the ideabox',
      author: 'custeed',
      category: 'Enquêtes',
      likes: [],
      comments: [],
      open: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('IdeaboxSetIdea add comment', async () => {
    const user = 'test';
    const comment = 'comment';
    let idea = await app.models.Idea.getMongoConnector().findOne({});
    const ideaId = idea._id.toString();
    let query = `mutation IdeaboxSetIdeaAddComment($user: String!, $ideaId: String!, $newComment: String!) {
      IdeaboxSetIdeaAddComment(user: $user, ideaId: $ideaId, newComment: $newComment) {
        status
      }
    }`;
    let queryRes = await sendQuery(app, query, { user, ideaId, newComment: comment });
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    expect(queryRes.data.IdeaboxSetIdeaAddComment.status).equals('OK');
    idea = await app.models.Idea.getMongoConnector().findOne({});
    expect(idea.comments[0].author).equals(user);
    expect(idea.comments[0].comment).equals(comment);
    expect(idea.comments[0].createdAt).to.not.be.undefined;
  });
});
