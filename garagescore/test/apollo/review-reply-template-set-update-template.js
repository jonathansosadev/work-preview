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
      template {
        _id
        sources
        ratingCategories
        title
        content
        garageIds
        automated
        createdAt
        createdBy
        createdById
        updatedBy
        updatedAt
        updatedById
      } 
    }
  }`;

const updateMutation =
  `mutation reviewReplyTemplateSetUpdateTemplate (
    $templateId: ID!,
    $title: String,
    $content: String,
    $garageIds: [ID],
    $sources: [String],
    $ratingCategories: [String],
    $automated: Boolean
    ){
    reviewReplyTemplateSetUpdateTemplate (
      templateId: $templateId,
      title: $title,
      content: $content,
      garageIds: $garageIds,
      sources: $sources,
      ratingCategories: $ratingCategories,
      automated: $automated
      ){
        message
        status
        template {
          _id
          sources
          ratingCategories
          title
          content
          garageIds
          automated
          createdAt
          createdBy
          createdById
          updatedBy
          updatedAt
          updatedById
        }
      }
    }`


describe('Updating templates for review responses', async () => {
  let template, template1, template2, user2, user1, garage1, garage2, garage3, garage4;
  before(async function () {
    await app.reset();
    const User = app.models.User;
    const Garage = app.models.Garage;
    template1 = Tools.random.reviewReplyTemplate();
    template1.createdAt = new Date(),
      template1.updatedAt = new Date()

    user1 = Tools.random.user();
    user2 = Tools.random.user();

    garage1 = Tools.random.garage();
    garage2 = Tools.random.garage();
    garage3 = Tools.random.garage(); // not subscribed to EReputation
    garage4 = Tools.random.garage(); // doesn't belong to the user

    garage1.subscriptions = { EReputation: { enabled: true } };
    garage2.subscriptions = { EReputation: { enabled: true } };
    garage3.subscriptions = { EReputation: { enabled: false } };
    garage4.subscriptions = { EReputation: { enabled: false } };

    garage1 = await Garage.create(garage1);
    garage2 = await Garage.create(garage2);
    garage3 = await Garage.create(garage3);
    garage4 = await Garage.create(garage4);

    user1.garageIds = [garage1, garage2, garage3].map((garage) => garage.getId().toString());
    user2.garageIds = [garage4.getId().toString()]

    user1 = await User.create(user1);
    user2 = await User.create(user2);

    template1.createdBy = user1.id.toString();
    template1.lastUpdateBy = user1.id.toString();
    template1.garageIds = user1.garageIds;

    template = await sendQuery(app, createMutation, template1, user1.id.toString())
    template = template.data.reviewReplyTemplateSetAddTemplate.template
  });
  describe('Updating an existing template', async () => {
    it("shouldn't be updated if the title is blank", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        title: '          '
      };
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("The title cannot be blank");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');

    });
    it("shouldn't be updated if the content is blank", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        content: '          '
      };
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("The content cannot be blank");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');

    });
    it("shouldn't be updated if doesn't exist", async () => {
      const changeTemplate = {
        templateId: "5d8a141616d99e001570f32c",
        title: 'Meant to Fail'
      };
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("Template not found");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');

    });
    it("shouldn't be updated if the template doesn't belongs to you", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        title: 'Meant to Fail'
      };
      const result = await sendQuery(app, updateMutation, changeTemplate, user2.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("This template doesn't belong to you");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');
    });
    it("shouldn't be updated if an inserted garage doesn't belong to you", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        garageIds: [garage4.getId().toString()]
      }
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("The garage(s) you are trying to set doesn't belong to you");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');
    });
    it("shouldn't be updated if no garages are set in automatic mode", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        garageIds: [],
        automated: true
      }
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());

      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("No valid garageIds where included");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');
    });
    it("shouldn't be updated there's not EReputation garages provided", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        garageIds: [garage3.getId().toString()],
      }
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());

      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("No garages with EReputation subscription where provided");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');
    });
    it("shouldn't be updated if the rating categories are wrong", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        ratingCategories: ['fakeCategory']
      }

      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("Invalid review category");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');
    });
    it("shouldn't be update if the sources are wrong", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        sources: ['fakebook']
      }
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());

      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("Invalid sources");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('FAILED');
    })
    it("should update a template with valid fields", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        title: "New title",
        content: "New content",
        garageIds: [garage1.getId().toString()],
        ratingCategories: ['passive'],
        sources: ['Facebook'],
        automated: true
      }
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("Template updated");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('OK');
    })
    it("should update a manual template with blank garageIds", async () => {
      const changeTemplate = {
        templateId: template._id.toString(),
        garageIds: [],
        automated: false
      }
      const result = await sendQuery(app, updateMutation, changeTemplate, user1.id.toString());
      expect(result.errors).to.be.undefined;
      expect(result.data).to.be.an('object').which.have.keys('reviewReplyTemplateSetUpdateTemplate');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object');
      expect(result.data.reviewReplyTemplateSetUpdateTemplate).to.be.an('object').which.have.keys(['message', 'status', 'template']);
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.template).to.be.an('object');
      const templateKeys = [
        '_id',
        'sources',
        'ratingCategories',
        'title',
        'content',
        'garageIds',
        'automated',
        'createdAt',
        'createdBy',
        'createdById',
        'updatedBy',
        'updatedAt',
        'updatedById'
      ];
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.template).to.be.an('object').which.have.keys(templateKeys);


      expect(result.data.reviewReplyTemplateSetUpdateTemplate.message).equal("Template updated");
      expect(result.data.reviewReplyTemplateSetUpdateTemplate.status).equal('OK');
    })
  });
});

