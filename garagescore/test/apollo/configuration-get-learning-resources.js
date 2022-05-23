const chai = require('chai');
const objectHash = require('object-hash');
const TestApp = require('../../common/lib/test/test-app');
const _sendQuery = require('./_send-query');

const { expect } = chai;
const testApp = new TestApp();

const learningResources = {
  resourcesByProduct: [
    {
      product: 'XLeads',
      resources: [
        {
          title: 'vid1',
          url: 'url1',
          description: 'desc1',
          thumbnail: 'thumb1',
        },
      ],
    },
  ],
};
/* Get garage data from api */
describe('Elearning resources', () => {
  it('Get Data from DB', async () => {
    await testApp.reset();
    await testApp._models().Configuration.create({
      reserved_field_name: 'LearningResources',
      learningResources,
    });
    const request = `query ConfigurationGetLearningResources {
      ConfigurationGetLearningResources {
        resourcesByProduct {
          product
          resources {
            title
            url
            thumbnail
            description
          }
        }
      }
    }`;
    const variables = {};
    const res = await _sendQuery(testApp, request, variables);
    expect(res.errors, JSON.stringify(res.errors)).to.be.undefined;
    expect(res.data).to.not.be.undefined;
    expect(res.data.ConfigurationGetLearningResources).to.not.be.undefined;
    // clean garbage from graphql
    const r = JSON.parse(JSON.stringify(res.data.ConfigurationGetLearningResources));
    // graphql returns exactly the same format than the db
    expect(objectHash(r)).equal(objectHash(learningResources));
  });
});
