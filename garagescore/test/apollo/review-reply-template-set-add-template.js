const chai = require('chai');
const TestApp = require('../../common/lib/test/test-app');
const sendQuery = require('./_send-query-as');
const Tools = require('../../common/lib/test/testtools');

const { expect } = chai;
const app = new TestApp();

const mutation = `mutation reviewReplyTemplateSetAddTemplate (
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

describe('Adding templates for review responses',async()=>{
  let template1, user1, user2, garage1, garage2, garage3, garage4;
  before(async function (){
    //this.timeout(9999999);
    await app.reset();
    const User = app.models.User;
    const Garage = app.models.Garage;
    template1 = Tools.random.reviewReplyTemplate();
    template1.createdAt = new Date();
    template1.updatedAt = new Date();

    user1 = Tools.random.user();
    user2 = Tools.random.user();

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

    user1.garageIds = [ garage1, garage2, garage3 ].map((garage) => garage.getId().toString());
    user2.garageIds = [ garage3 ].map((garage) => garage.getId().toString());

    user1 = await User.create(user1);
    user2 = await User.create(user2);

    template1.createdBy = user1.id.toString();
    template1.lastUpdateBy = user1.id.toString();
  });
  describe('Adding a template', async()=>{
    it ("shouldn't be added if the title is blank", async ()=>{
      
      template1.garageIds = user1.garageIds
      const priorTitle = template1.title.slice();
      template1.title = "          ";
      
      const template = await sendQuery(app, mutation, template1, user1.id.toString());
      
      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object');
      expect(template.data.reviewReplyTemplateSetAddTemplate.message).equal('The title cannot be blank');
      expect(template.data.reviewReplyTemplateSetAddTemplate.status).equal('FAILED');

      template1.title = priorTitle;
    })
    it ("shouldn't be added if the content is blank", async ()=>{
      
      template1.garageIds = user1.garageIds
      const priorContent = template1.content.slice();
      template1.content = "          ";
      
      const template = await sendQuery(app, mutation, template1, user1.id.toString());
      
      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object');
      expect(template.data.reviewReplyTemplateSetAddTemplate.message).equal('The content cannot be blank');
      expect(template.data.reviewReplyTemplateSetAddTemplate.status).equal('FAILED');

      template1.content = priorContent;
    })
    it ("shouldn't be added if a garage doesn't belong to you", async ()=>{
      
      template1.garageIds = [ garage1.getId().toString(),  garage4.getId().toString()];
      const template = await sendQuery(app, mutation, template1, user1.id.toString());
      
      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object');
      expect(template.data.reviewReplyTemplateSetAddTemplate.message).equal('Invalid garageId insertion');
      expect(template.data.reviewReplyTemplateSetAddTemplate.status).equal('FAILED');
    })
    it ("shouldn't be added if there's no EReputation subscription", async () =>{
      template1.garageIds = user2.garageIds;
      const template = await sendQuery(app, mutation, template1, user2.id.toString());
      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object');
      expect(template.data.reviewReplyTemplateSetAddTemplate.message).equal('Not a single of the provided garages is subscribed to EReputation');
      expect(template.data.reviewReplyTemplateSetAddTemplate.status).equal('FAILED');
    });
    it("shouldn't be added if any of the categories are wrong", async ()=>{
      const priorRatings = template1.ratingCategories.slice();
      template1.ratingCategories.push('fakeCategory');
      template1.garageIds = user1.garageIds;
      
      const template = await sendQuery(app, mutation, template1, user1.id.toString())

      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object');
      expect(template.data.reviewReplyTemplateSetAddTemplate.message).equal('Invalid review category');
      expect(template.data.reviewReplyTemplateSetAddTemplate.status).equal('FAILED');
     
      template1.ratingCategories = priorRatings;
    });
    it("shouldn't be added if the sources are wrong", async ()=>{
      const priorSources = template1.sources.slice();
      template1.sources.push('fakeSource');
      template1.garageIds = user1.garageIds;

      const template = await sendQuery(app, mutation, template1, user1.id.toString())

      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object');
      expect(template.data.reviewReplyTemplateSetAddTemplate.message).equal('Invalid source');
      expect(template.data.reviewReplyTemplateSetAddTemplate.status).equal('FAILED');

      template1.sources = priorSources;
    })
    it('should be added', async()=>{
      template1.garageIds = user1.garageIds
      const template = await sendQuery(app, mutation, template1, user1.id.toString())
      expect(template.errors).to.be.undefined;
      expect(template.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetAddTemplate');
      expect(template.data.reviewReplyTemplateSetAddTemplate).to.be.an('object')
      expect(template.data.reviewReplyTemplateSetAddTemplate.template).to.be.an('object').which.have.keys('_id', 'title', 'content', 'garageIds', 'sources', 'automated', 'createdBy');
      expect(template.data.reviewReplyTemplateSetAddTemplate.template._id).to.not.be.null; 
    })
  });
});

