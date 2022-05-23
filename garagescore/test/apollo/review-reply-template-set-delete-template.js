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

  const deleteMutation = 
  `mutation reviewReplyTemplateSetDeleteTemplate (
    $templateId: ID!
    ){
    reviewReplyTemplateSetDeleteTemplate (
      templateId: $templateId
      ){
        message
        status
      }
    }`


describe('Deleting templates for review responses', async()=>{
  let template, template1, template2, user2, user1, garage1, garage2, garage3, garage4;
  before(async function (){
    //this.timeout(9999999);
    await app.reset();
    const User = app.models.User;
    const Garage = app.models.Garage;
    template1 = Tools.random.reviewReplyTemplate();
    template1.createdAt = new Date();
    template1.updatedAt = new Date();

    template2 = Tools.random.reviewReplyTemplate();
    template2.createdAt = new Date(),
    template2.updatedAt = new Date()

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
    user2.garageIds = [ garage4.getId().toString() ]

    user1 = await User.create(user1);
    user2 = await User.create(user2);

    template1.createdBy = user1.id.toString();
    template1.lastUpdateBy = user1.id.toString();
    template1.garageIds = user1.garageIds;

    template2.createdBy = user2.id.toString();
    template2.lastUpdateBy = user2.id.toString();
    template2.garageIds = user2.garageIds;

    template = await sendQuery(app, createMutation, template1, user1.id.toString());
    template = template.data.reviewReplyTemplateSetAddTemplate.template;

    template2 = await sendQuery(app, createMutation, template2, user2.id.toString());
    template2 = template2.data.reviewReplyTemplateSetAddTemplate.template;
  });
  describe('Deleting an existing template', async()=>{
    it ("shouldn't be deleted if doesn't exist", async() =>{
      const deleteTemplate =  {
        templateId: "5d8a141616d99e001570f32c"
      };
      const result = await sendQuery(app, deleteMutation, deleteTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetDeleteTemplate');
      expect(result.data.reviewReplyTemplateSetDeleteTemplate).to.be.an('object');
      expect(result.data.reviewReplyTemplateSetDeleteTemplate.message).equal("Template not found");
      expect(result.data.reviewReplyTemplateSetDeleteTemplate.status).equal('FAILED');

    });
    it("shouldn't be deleted if the template doesn't belongs to you", async() =>{      
      const deleteTemplate =  {
        templateId: template2._id.toString()
      };
      const result = await sendQuery(app, deleteMutation, deleteTemplate, user1.id.toString());

      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetDeleteTemplate');
      expect(result.data.reviewReplyTemplateSetDeleteTemplate).to.be.an('object');
      expect(result.data.reviewReplyTemplateSetDeleteTemplate.message).equal("This template doesn't belong to you");
      expect(result.data.reviewReplyTemplateSetDeleteTemplate.status).equal('FAILED');
    });
    it("should be deleted", async ()=>{
      const deleteTemplate =  {
        templateId: template._id.toString()
      };
      const result = await sendQuery(app, deleteMutation, deleteTemplate, user1.id.toString());

      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetDeleteTemplate');
      expect(result.data.reviewReplyTemplateSetDeleteTemplate).to.be.an('object');
      expect(result.data.reviewReplyTemplateSetDeleteTemplate.message).equal("Template deleted");
      expect(result.data.reviewReplyTemplateSetDeleteTemplate.status).equal('OK');
    });
  });
});

