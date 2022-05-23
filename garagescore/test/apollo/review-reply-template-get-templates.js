const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');

const { expect } = chai;
const app = new TestApp();

const createMutation = `mutation reviewReplyTemplateSetAddTemplate (
  $title: String!,
  $content: String!,
  $garageIds: [ID]!,
  $sources: [String]!,
  $ratingCategories: [String]!,
  $automated: Boolean!
  ){
  reviewReplyTemplateSetAddTemplate (
    title: $title,
    content: $content,
    garageIds: $garageIds,
    sources: $sources,
    ratingCategories: $ratingCategories,
    automated: $automated
    ){
      message
      status
      template{
        _id
        title
        content
        garageIds
        sources
        automated
        createdBy
      } 
    }
  }`;

  const getQuery = 
  `query reviewReplyTemplateGetTemplates (
    $page: Int
    $queryText: String
    $source: String
    $ratingCategory: String
    ){
    reviewReplyTemplateGetTemplates (
      page: $page,
      queryText: $queryText
      source: $source
      ratingCategory: $ratingCategory
      ){
        hasMore
        templates{
          _id
          title
          content
          garageIds
          sources
          automated
          createdBy
        }
      }
    }`


describe('Getting templates for review responses', async()=>{
  let template1, user1, garage1, garage2, garage3, garage4;
  before(async function (){
    await app.reset();
    const User = app.models.User;
    const Garage = app.models.Garage;

    user1 = Tools.random.user();

    garage1 = Tools.random.garage();
    garage2 = Tools.random.garage();
    garage3 = Tools.random.garage(); // not subscribed to EReputation
    garage4 = Tools.random.garage(); // doesn't belong to the user
    
    garage1.subscriptions = { EReputation: { enabled: true } };
    garage2.subscriptions = { EReputation: { enabled: true } };
    garage3.subscriptions = { EReputation: { enabled: false } };
    garage4.subscriptions = { EReputation: { enabled: true } };

    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);
    garage3 = await Garage.create(garage3);
    garage4 = await Garage.create(garage4);

    user1.garageIds = [ garage1, garage2, garage3, garage4 ].map((garage) => garage.getId().toString());
    user1 = await User.create(user1);

    // create 25 random templates
    for (let i = 0; i < 25; i++){
      let template = Tools.random.reviewReplyTemplate();
      template.createdAt = new Date();
      template.updatedAt = new Date();
      template.createdBy = user1.id.toString();
      template.lastUpdateBy = user1.id.toString();
      template.garageIds = [ garage1, garage2, garage3, garage4 ].map((garage) => garage.getId().toString());

      await sendQuery(app, createMutation, template, user1.id.toString())
    }
  });
  it ("should get 20 garages in one page", async() =>{
    const firstQuery =  {
      page: 0
    };
    const result = await sendQuery(app, getQuery, firstQuery, user1.id.toString());
    expect(result.errors).to.be.undefined;
    expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateGetTemplates');
    expect(result.data.reviewReplyTemplateGetTemplates.templates).to.be.an('Array');
    expect(result.data.reviewReplyTemplateGetTemplates.templates.length).equal(20);  
  });
  it("should get 5 garages in the next page", async() =>{      
    const secondQuery =  {
      page: 1
    };
    const result = await sendQuery(app, getQuery, secondQuery, user1.id.toString());

    expect(result.errors).to.be.undefined;
    expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateGetTemplates');
    expect(result.data.reviewReplyTemplateGetTemplates.templates).to.be.an('Array');
    expect(result.data.reviewReplyTemplateGetTemplates.templates.length).equal(5);
  });
});

