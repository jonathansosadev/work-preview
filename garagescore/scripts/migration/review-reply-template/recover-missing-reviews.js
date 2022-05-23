// This script fixes the missing delay config in the migrated garages
const app = require('../../../server/server');
const { upsertAutomaticReplyJob } = require('../../../common/models/data/data-methods.js');
const EventsEmitter = require('../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const internalEventsReviewContext = require('../../../common/lib/garagescore/monitoring/internal-events/contexts/review-context');

app.on('booted', async () => {
  const templateConnector = app.models.ReviewReplyTemplate.getMongoConnector();
  const dataConnector = app.models.Data.getMongoConnector();
  const jobsConnector = app.models.Job.getMongoConnector();

  //Delete the replies we know for sure are wrong (from 13-21 January)
  console.log('[RECOVERY] Deleting bad replies...');
  await dataConnector.updateMany(
    {
      'review.reply.text': {
        $regex: /@InitialName|@LastNameClient|@GarageName|@LastName|@FirstName|@Sign|@Collaborator|@GroupName|@Nom dy garage| Nom du garage/,
      },
      'review.createdAt': { $gte: new Date('2022-01-13T00:00:00.00Z'), $lte: new Date('2022-01-21T23:59:59.99Z') },
    },
    { $unset: { 'review.reply': '' } }
  );
  // Find wich garages have automatic replies

  const targetGarages = await templateConnector.distinct('garageIds', { automated: true });

  //Check for the datas from this garages that are elegible for replying
  console.log(`Found ${targetGarages.length} garages elegible for automatic reply`);
  //Delete the prior jobs so they wouldn't collide
  console.log(`Deleting prior 'SEND_AUTOMATIC_REPLY' jobs`);
  const deletedJobs = await jobsConnector.deleteMany({
    createdAt: { $gte: new Date('2022-01-13T00:00:00.00Z') },
    'payload.garageId': { $in: targetGarages.map((g) => g.toString()) },
    type: 'SEND_AUTOMATIC_REPLY',
  });
  console.log(`deleted ${deletedJobs.deletedCount} jobs`);
  console.log('creating new jobs');
  let count = 0;
  for (const pendingGarage of targetGarages) {
    const targetDatas = await dataConnector
      .find(
        {
          garageId: pendingGarage.toString(),
          review: { $exists: true },
          'review.reply': { $exists: false },
          'review.createdAt': { $gte: new Date('2022-01-13T00:00:00.00Z') },
        },
        { _id: 1 }
      )
      .toArray();

    for (const data of targetDatas) {
      const targetData = await app.models.Data.findById(data._id);
      const eventsEmitterContext = internalEventsReviewContext.create(pendingGarage, targetData.get('source.type'));
      let eventsEmitter = new EventsEmitter(eventsEmitterContext);
      eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.ADD_REVIEW, { review: true });
      await upsertAutomaticReplyJob({ app }, { id: pendingGarage }, targetData, eventsEmitter);
      count++;
    }
    console.log(`[RECOVERY] ${count} datas so far`);
  }
  console.log(`[RECOVERY] Success!!! ${count} datas processed`);
  process.exit(0);
});
