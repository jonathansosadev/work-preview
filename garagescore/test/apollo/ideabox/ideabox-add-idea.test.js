const { ObjectId } = require('mongodb');
const chai = require('chai');
const path = require('path');
const TestApp = require('../../../common/lib/test/test-app');
const sendQuery = require('../_send-query');

const { expect } = chai;
const app = new TestApp();

describe('apollo::ideabox-add-idea', () => {
  beforeEach(async () => {
    await app.reset();
  });

  it('IdeaboxAddIdea add idea', async () => {
    const user = 'test';
    const title = 'eerez';
    const category = 'erezreze';
    let query = `mutation IdeaboxAddIdea($user: String!, $title: String!, $category: String!) {
      IdeaboxAddIdea(user: $user, title: $title, category: $category) {
        status
      }
    }`;
    let queryRes = await sendQuery(app, query, { user, category, title });
    // result
    expect(queryRes.errors, queryRes.errors).to.be.undefined;
    expect(queryRes.data.IdeaboxAddIdea.status).equals('OK');
    const idea = await app.models.Idea.getMongoConnector().findOne({});
    expect(idea.title).equals(title);
    expect(idea.category).equals(category);
    expect(idea.open).equals(true);
    expect(idea.comments).to.be.an('Array').and.to.have.lengthOf(0);
    expect(idea.likes).to.be.an('Array').and.to.have.lengthOf(0);
    expect(idea.createdAt).to.not.be.undefined;
    expect(idea.updatedAt).to.not.be.undefined;
  });
});
