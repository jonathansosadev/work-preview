const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../../common/lib/test/test-app');
const sendQuery = require('../_send-query');

const { expect } = chai;
const app = new TestApp();

describe('apollo::ideabox-set-idea-content', () => {
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

  it('IdeaboxSetIdea update content', async () => {
    const user = 'test';
    const newTitle = 'erezrez';
    const newCategory = 'jlijoij';
    const newStatus = false;
    let idea = await app.models.Idea.getMongoConnector().findOne({});
    const ideaId = idea._id.toString();
    let query = `mutation IdeaboxSetIdeaContent($user: String!, $ideaId: String!, $newTitle: String!, $newCategory: String!, $newStatus: Boolean!) {
      IdeaboxSetIdeaContent(user: $user, ideaId: $ideaId, newTitle: $newTitle, newCategory: $newCategory, newStatus: $newStatus) {
        status
      }
    }`;
    let queryRes = await sendQuery(app, query, { user, ideaId, newTitle, newCategory, newStatus });
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    expect(queryRes.data.IdeaboxSetIdeaContent.status).equals('OK');
    idea = await app.models.Idea.getMongoConnector().findOne({});
    expect(idea.title).equals(newTitle);
    expect(idea.category).equals(newCategory);
    expect(idea.open).equals(newStatus);
  });
});
