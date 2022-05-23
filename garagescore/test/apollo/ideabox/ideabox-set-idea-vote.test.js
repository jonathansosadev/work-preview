const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../../common/lib/test/test-app');
const sendQuery = require('../_send-query');

const { expect } = chai;
const app = new TestApp();

describe('apollo::ideabox-set-idea-vote', () => {
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

  it('IdeaboxSetIdea Vote', async () => {
    const user = 'test';
    let idea = await app.models.Idea.getMongoConnector().findOne({});
    const ideaId = idea._id.toString();
    let query = `mutation IdeaboxSetIdeaVote($user: String!, $ideaId: String!, $isLike: Boolean!) {
      IdeaboxSetIdeaVote(user: $user, ideaId: $ideaId, isLike: $isLike) {
        status
      }
    }`;
    let queryRes = await sendQuery(app, query, { user, ideaId, isLike: true });
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    expect(queryRes.data.IdeaboxSetIdeaVote.status).equals('OK');
    idea = await app.models.Idea.getMongoConnector().findOne({});
    expect(idea.likes[0]).equals(user);
  });
});
