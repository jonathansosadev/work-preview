const TestApp = require('../../../../../common/lib/test/test-app');

const TestGarage = require('../../../../../common/lib/test/test-app/test-garage')
const { ObjectID } = require('mongodb');
const chai = require('chai');

const { JobStatuses, JobTypes } = require('../../../../../frontend/utils/enumV2');
const UserAuthorization = require('../../../../../common/models/user-autorization');
const DataFileTypes = require('../../../../../common/models/data-file.data-type');
const { SourceTypes, RatingCategories } = require('../../../../../frontend/utils/enumV2');

const sendQueryAs = require('../../../../apollo/_send-query-as');
const publicApi = require('../../../../../common/lib/garagescore/api/public-api');
const DataBuilder = require('../../../../../common/lib/test/test-instance-factory/data-builder');



const expect = chai.expect;
const app = new TestApp();

/**
 * Tests templating !
 */
describe('Automatic reply to reviews run', () => {
  let garage1 = {}, garage2 = {}, garage1Instance = {}, garage2Instance = {}, template1 = {}
  const exogenousReviewsConfigurations = {
    [SourceTypes.GOOGLE]: {
      connectedBy: 'auto@reply.test',
      error: '',
      token: 'da_token',
      externalId: 'da_google_ext_id',
    },
    [SourceTypes.FACEBOOK]: {
      connectedBy: 'auto@reply.test',
      error: '',
      token: 'da_token',
      externalId: 'da_google_ext_id',
    },
  };

  const createReviewFromPublicApi = async (garage, { id, source, rating, comment, author, replies = [] }) => {
    const exogenousToken = garage.exogenousReviewsConfigurations[source].externalId;
    const randomId = Math.round(1000 * Math.random());
    const reviewsToAdd = {
      sourceType: source,
      method: 'FULL',
      reviews: [
        {
          id: id || `${exogenousToken}/reviews/${randomId}`,
          text: comment,
          score: rating,
          author,
          origin: source,
          replies,
        },
      ],
    };
    await publicApi.addReviews(garage.id.toString(), reviewsToAdd);
  };

  const createReviewFromCampaign = async (garage, { rating, comment }) => {
    const campaign = await garage.runNewCampaign(DataFileTypes.MAINTENANCES);
    const survey = await campaign.getSurvey();
    await survey.rate(rating).setReview(comment).submit();
    return (await campaign.datas())[0];
  };

  const createReview = async (garage, { source = SourceTypes.DATAFILE, rating, comment }) => {
    const data = await new DataBuilder(app)
      .shouldSurfaceInStatistics()
      .garage(garage.id.toString())
      .type(DataFileTypes.MAINTENANCES)
      .source(source)
      .reviewComment(comment)
      .reviewRating(rating)
      .create();
    data._id = new ObjectID(data.id);
    return data;
  };
  before(async () => {
    await app.reset();

    garage1 = await app.addGarage({ exogenousReviewsConfigurations });
    garage2 = await app.addGarage({});
    garage3 = await app.addGarage({});

    garage1Instance = await garage1.getInstance();
    garage2Instance = await garage2.getInstance();
    garage3Instance = await garage3.getInstance();

    template1 = await app.addReviewReplyTemplateMongo({
      content: " test @InitialName @GarageName @LastName @FirstName @Sign @Collaborator @GroupName",
      ratingCategories: [RatingCategories.PASSIVE, RatingCategories.PROMOTER, RatingCategories.DETRACTOR],
      garageIds: [garage1.id],
      automated: true,
      sources: [SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.FACEBOOK],
    })
  });

  describe('Job behavior', () => {
    beforeEach(async () => {
      await app.models.Job.getMongoConnector().deleteMany({});
      await app.models.Data.getMongoConnector().deleteMany({});
      await app.models.Campaign.getMongoConnector().deleteMany({});
    });
    it('job AUTOMATIC_REPLY is created when a review is created', async () => {
      const data = await createReviewFromCampaign(garage1, { rating: 8, comment: 'Check job create' });
      const output = await app.jobs({ where: {} })
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job).not.to.be.undefined;
      expect(job.payload.dataId.toString()).to.equal(data.id.toString());
    });
    it("job payload contains garage's data's review", async () => {
      const data = await createReviewFromCampaign(garage1, { rating: 8, comment: 'Check job payload' });
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job.payload)
        .to.be.an('object')
        .which.have.all.keys('garageId', 'dataId', 'review', 'source');

      const { review, source } = job.payload;
      expect(source.type).to.equal(SourceTypes.DATAFILE);
      expect(review).to.be.an('object').which.contains.keys('rating', 'comment');
      expect(review.rating.value).to.equal(8);
      expect(review.comment.text).to.equal('Check job payload');;
    });
    it('job AUTOMATIC_REPLY is cancelled if the garage has already replied to the review', async () => {
      const data = await createReviewFromCampaign(garage1, { rating: 8, comment: 'Check job replied' });
      // replyToThatReview; use the graphQL resolver
      const request = `mutation dataSetCreateReply($reviewId: String!, $exogenous: Boolean, $comment: String) {
        dataSetCreateReply(reviewId: $reviewId, exogenous: $exogenous, comment: $comment) {
          status
        }
      }`;
      const variables = { reviewId: data.getId().toString(), comment: 'this is a comment' };
      const user = await app.addUser({ authorization: { [UserAuthorization.ACCESS_TO_COCKPIT]: true } });
      await sendQueryAs(app, request, variables, user.getId());
      //
      let [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job.status).to.equals(JobStatuses.CANCELLED);
    });
    it('job AUTOMATIC_REPLY is cancelled if the campaign/data is hidden', async () => {
      const campaign = await garage1.runNewCampaign(DataFileTypes.MAINTENANCES);
      const survey = await campaign.getSurvey();
      await survey.rate(8).setReview('WILL BE CANCELLED').submit();
      await campaign.cancel();
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job.status).to.equals(JobStatuses.CANCELLED);
    });

    it('job AUTOMATIC_REPLY is created when exogenous review is created', async () => {
      const review = { source: SourceTypes.GOOGLE, rating: 8, comment: 'Hello from Google', author: 'Plopi plopa' };
      await createReviewFromPublicApi(garage1Instance, review);
      const [data] = await app.datas();
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job).not.to.be.undefined;
      expect(job.payload.dataId.toString()).to.equal(data.id.toString());
    });
    it('job AUTOMATIC_REPLY is NOT created when exogenous review already has a response from owner', async () => {
      let replies = [{ id: 42, text: 'Hi Plopi', author: 'Da garageot' }];
      const reviewGoogle = { source: SourceTypes.GOOGLE, rating: 9, comment: 'Hello', author: 'Plopi plopa', replies };
      await createReviewFromPublicApi(garage1Instance, reviewGoogle);
      const jobs = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(jobs).to.have.lengthOf(0);
      // FB cases
      replies = [{ id: 42, text: 'Hi Plopi', author: 'Da garageot', isFromOwner: true }];
      const reviewFB = { source: SourceTypes.FACEBOOK, rating: 9, comment: 'Hello', author: 'Plopi plopa', replies };
      await createReviewFromPublicApi(garage1Instance, reviewFB);
      const jobs2 = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(jobs2).to.have.lengthOf(0);
    });
    it('job AUTOMATIC_REPLY is created when exogenous review has a reply not from owner (FB)', async () => {
      const replies = [{ id: 42, text: 'Hi Plopi', author: 'Da garageot', isFromOwner: false }];
      const review = { source: SourceTypes.FACEBOOK, rating: 9, comment: 'Hello', author: 'Plopi plopa', replies };
      await createReviewFromPublicApi(garage1Instance, review);
      const [data] = await app.datas();
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job).not.to.be.undefined;
      expect(job.payload.dataId.toString()).to.equal(data.id.toString());
    });

    it('job AUTOMATIC_REPLY is CANCELLED when exogenous review receives a reply (Google)', async () => {
      const review = { id: 1, source: SourceTypes.GOOGLE, rating: 9, comment: 'Hello', author: 'Plopi plopa' };
      const replies = [{ id: 42, text: 'Hi Plopi', author: 'Da garageot' }];
      await createReviewFromPublicApi(garage1Instance, review);
      await createReviewFromPublicApi(garage1Instance, { ...review, replies });
      const [data] = await app.datas();
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job).not.to.be.undefined;
      expect(job.status).to.equals(JobStatuses.CANCELLED);
      expect(job.payload.dataId.toString()).to.equal(data.id.toString());
    });
    it('job AUTOMATIC_REPLY is CANCELLED when exogenous review receives a reply (FB)', async () => {
      const review = { id: 2, source: SourceTypes.FACEBOOK, rating: 9, comment: 'Hello', author: 'Plopi plop' };
      const replies = [{ id: 42, text: 'Hi Plopi', author: 'Da garageot', isFromOwner: true }];
      await createReviewFromPublicApi(garage1Instance, review);
      await createReviewFromPublicApi(garage1Instance, { ...review, replies });
      const [data] = await app.datas();
      const [job] = await app.jobs({ where: { type: JobTypes.SEND_AUTOMATIC_REPLY } });
      expect(job).not.to.be.undefined;
      expect(job.status).to.equals(JobStatuses.CANCELLED);
      expect(job.payload.dataId.toString()).to.equal(data.id.toString());
    });
  });

  describe('Automatic reply computation', async () => {
    beforeEach(async () => {
      // Bye bye datas
      await app.models.Data.getMongoConnector().deleteMany({});
    });
    it('Promotor condition texts are selected for promotor reviews', async () => {
      const datas = await Promise.all(
        Array.from(Array(100)).map(() => createReview(garage1, { rating: 9, comment: 'PROMOTOR' }))
      );
      const replies = await Promise.all(datas.map(async (data) => await data.review_getAutomaticReplyToReview()));
      const uniqueReplies = Array.from(new Set(replies));
      expect(uniqueReplies).to.have.lengthOf(1);
    });
    it('Neutral condition texts are selected for neutral reviews', async () => {
      const datas = await Promise.all(
        Array.from(Array(100)).map(() => createReview(garage1, { rating: 7, comment: 'NEUTRAL' }))
      );
      const replies = await Promise.all(datas.map(async (data) => await data.review_getAutomaticReplyToReview()));
      const uniqueReplies = Array.from(new Set(replies));
      expect(uniqueReplies).to.have.lengthOf(1);
    });
    it('Detractor condition texts are selected for detractor reviews', async () => {
      const datas = await Promise.all(
        Array.from(Array(100)).map(async () => await createReview(garage1, { rating: 2, comment: 'DETRACTOR' }))
      );
      const replies = await Promise.all(datas.map((async (data) => await data.review_getAutomaticReplyToReview())));
      const uniqueReplies = Array.from(new Set(replies));
      expect(uniqueReplies).to.have.lengthOf(1);
    });
    it('The correct condition text for the correct source is selected', async () => {
      for (const source of [SourceTypes.DATAFILE, SourceTypes.GOOGLE, SourceTypes.FACEBOOK]) {
        const datasPromotors = await Promise.all(
          Array.from(Array(50)).map(() => createReview(garage1, { source, rating: 9, comment: 'PROMOTOR' }))
        );
        const repliesPromotors = await Promise.all(datasPromotors.map(async (data) =>
          await data.review_getAutomaticReplyToReview()
        ));
        const uniqueRepliesPromotors = Array.from(new Set(repliesPromotors));
        expect(uniqueRepliesPromotors)
          .to.have.lengthOf(1);

        const datasNeutrals = await Promise.all(
          Array.from(Array(50)).map(() => createReview(garage1, { source, rating: 7, comment: 'NEUTRAL' }))
        );
        const repliesNeutrals = await Promise.all(datasNeutrals.map(async (data) => await data.review_getAutomaticReplyToReview()));
        const uniqueRepliesNeutrals = Array.from(new Set(repliesNeutrals));
        expect(uniqueRepliesNeutrals)
          .to.have.lengthOf(1)

        const datasDetractors = await Promise.all(
          Array.from(Array(50)).map(() => createReview(garage1, { source, rating: 2, comment: 'DETRACTOR' }))
        );
        const repliesDetractors = await Promise.all(datasDetractors.map(async (data) =>
          await data.review_getAutomaticReplyToReview())
        );
        const uniqueRepliesDetractors = Array.from(new Set(repliesDetractors));
        expect(uniqueRepliesDetractors)
          .to.have.lengthOf(1)
      }
    });
    it('Returns undefined if the garageID doesnt exist', async () => {
      const randomRating = () => Math.floor(11 * Math.random());

      const datas = await Promise.all(
        Array.from(Array(2)).map(async () => await createReview(garage2, { rating: randomRating(), comment: 'comment' }))
      );
      const replies = []
      for (let i in datas) {
        let temp = await datas[i].review_getAutomaticReplyToReview()
        replies.push(temp)
      }
      expect(replies.some((reply) => reply !== undefined)).to.be.false;
    });
    it('Returns undefined if no answer configured for the satisfaction condition', async () => {
      const randomRating = () => Math.floor(8 * Math.random());
      const datas = await Promise.all(
        Array.from(Array(100)).map(() =>
          createReview(garage2, { rating: randomRating(), comment: '' })
        )
      );
      const replies = []
      for (let i in datas) {
        let temp = datas[i].review.comment.text !== '' ? await datas[i].review_getAutomaticReplyToReview() : undefined
        replies.push(temp)
      }
      expect(replies.some((reply) => reply !== undefined)).to.be.false;
    });
    it('Returns undefined if answers for the source are not configured', async () => {
      const randomRating = () => Math.floor(11 * Math.random());
      const datas = await Promise.all(
        Array.from(Array(100)).map(() =>
          createReview(garage2, { source: SourceTypes.GOOGLE, rating: randomRating(), comment: 'comment' })
        )
      );
      const replies = await Promise.all(datas.map(async (data) => await data.review_getAutomaticReplyToReview()));

      expect(replies.some((reply) => reply !== undefined)).to.be.false;
    });
    it('Returns undefined if the source is not supported (cf SourceTypes.json)', async () => {
      const randomRating = () => Math.floor(11 * Math.random());
      const datas = await Promise.all(
        Array.from(Array(100)).map(() =>
          createReview(garage3, {
            source: SourceTypes.AUTOMATION,
            rating: randomRating(),
            comment: 'comment',
          })
        )
      );
      const replies = await Promise.all(datas.map(async (data) => await data.review_getAutomaticReplyToReview()));
      expect(replies.some((reply) => reply !== undefined)).to.be.false;
    });
  });

  describe('Automatic reply write', () => {
    beforeEach(async () => {
      // Bye bye datas
      await app.models.Data.getMongoConnector().deleteMany({});
    });
    it('Writes the automatic reply just like a classic reply to a review', async () => {
      const data = await createReview(garage1, { rating: 9, comment: 'PROMOTOR' });
      data.service = {
        frontDeskUserName: "James Euro"
      }
      data.customer = {
        firstName: { value: "Luigi" },
        lastName: { value: "Bambino" }
      }
      await data.review_replyAutomaticallyToReview();
      const [dataFromDB] = await app.datas();
      expect(dataFromDB.review.reply).to.be.an('object');
      const reply = dataFromDB.review.reply.text
      const responsibleLastName = garage1Instance.surveySignature.defaultSignature.lastName;
      const responsibleFirstName = garage1Instance.surveySignature.defaultSignature.firstName;
      const responsibleJob = garage1Instance.surveySignature.defaultSignature.job;
      const collaborator = data.service.frontDeskUserName;
      const garageGroup = garage1Instance.group;
      const garageName = garage1Instance.publicDisplayName;
      //@InitialName @GarageName @LastName @FirstName @Sign @Collaborator @GroupName
      // Test for diynamic labels
      // Initials
      const initialsLabel = reply.includes("LB");
      expect(initialsLabel).to.equal(true);
      // Garage Name
      const garageNameLabel = reply.includes(garageName);
      expect(garageNameLabel).to.equal(true);
      // Last name of Responsible Person
      const lastNameLabel = reply.includes(responsibleLastName);
      expect(lastNameLabel).to.equal(true);
      // Fist Name of Responsible Person
      const firstNameLabel = reply.includes(responsibleFirstName);
      expect(firstNameLabel).to.equal(true);
      // Signature
      const signatureLabel = reply.includes(`${responsibleFirstName} ${responsibleLastName}, ${responsibleJob}`);
      expect(signatureLabel).to.equal(true);
      // Collaborator
      const collaboratorLabel = reply.includes(collaborator);
      expect(collaboratorLabel).to.equal(true);
      // Garage Group
      const groupLabel = reply.includes(garageGroup)
      expect(groupLabel).to.equal(true);

      const { text } = dataFromDB.review.comment;
      expect(text).to.be.a('string');
      expect(['PROMOTOR', 'PROMOTOR_ALT']).to.include(text);
    });
    it("Doesn't write the automatic reply if the garage doesnt exist", async () => {
      const data = await createReview(garage2, { rating: 9, comment: 'PROMOTOR' }); //{_id:'', source:{}, review:{}}
      await data.review_replyAutomaticallyToReview();
      const [dataFromDB] = await app.datas();
      expect(dataFromDB.review.reply).to.be.undefined;
    });
  });
});
