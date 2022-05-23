/**
 * That's going to be hell of a migration
 * We have to migrate all datas with a lead or unsatisfiedTicket
 * Of course we can't do them all
 * My strategy : => limit to periods available on cockpit to this day and excluding data from the 500th page
 * That gives us max: 5000 docs to migrate per period
 */
const { TicketActionNames } = require('../../../frontend/utils/enumV2');
const ReminderStatuses = require('../../../common/models/data/type/userActions/reminder-status');
const timeHelper = require('../../../common/lib/util/time-helper');
const { ANASS, log } = require('../../../common/lib/util/log');

const getTicketQuery = (ticketType, { minDay, maxDay, dataIds }) => ({
  // Finds datas with leadTickets having a REMINDER action, NOT_RESOLVED, for the required dayNumbers
  $or: [
    {
      _id: { $in: dataIds },
      [`${ticketType}.actions`]: {
        $elemMatch: {
          name: TicketActionNames.REMINDER,
          reminderStatus: ReminderStatuses.NOT_RESOLVED,
          reminderFirstDay: { $gte: minDay, $lte: timeHelper.dayNumber(new Date()) },
        },
      },
    },
    {
      _id: { $in: dataIds },
      [`${ticketType}.createdAt`]: {
        $gte: timeHelper.dayNumberToDate(minDay - 90),
        $lt: timeHelper.dayNumberToDate(maxDay + 1),
      },
    },
  ],
});

const ONE_DAY = 8.64e7;
const filterRelevantReminder = ({ minDay, maxDay }) => ({
  // Basically repeating the $elemMatch we ran to find the datas.
  // But here we want to specifically keep only the actions that fulfill the condition
  $and: [
    { $eq: ['$$this.name', TicketActionNames.REMINDER] },
    { $eq: ['$$this.reminderStatus', ReminderStatuses.NOT_RESOLVED] },
    ...(minDay !== maxDay
      ? [{ $gte: ['$$this.reminderFirstDay', minDay] }, { $lte: ['$$this.reminderFirstDay', maxDay] }]
      : [{ $eq: ['$$this.reminderFirstDay', minDay] }]),
  ],
});
const determineReferenceDate = (ticketType, { minDay, maxDay }) => {
  /* Damned, is all I can say...
   * The equivalent in JS is :
   * data[ticketType].actions
   *  .filter(filterRelevantReminder)
   *  .map(({ reminderFirstDay }) => timeHelper.dayNumberToDate(reminderFirstDay))
   *  .reduce((mostRecentDate, reminderDate) => {
   *    if (reminderFirstDate > (mostRecentDate || new Date(0))) {
   *      return reminderFirstDate;
   *    }
   *    return mostRecentDate;
   *  }, null);
   */
  const $convertToDate = (input) => ({ $convert: { input, to: 'date', onError: null } });
  return {
    $reduce: {
      input: {
        $map: {
          input: {
            $filter: {
              input: `$${ticketType}.actions`,
              cond: filterRelevantReminder({ minDay, maxDay: timeHelper.dayNumber(new Date()) }),
            },
          },
          // Transform the reminderFirstDay (dayNumber) into a Date
          in: $convertToDate({ $multiply: ['$$this.reminderFirstDay', ONE_DAY] }),
        },
      },
      // Starting with null so if there's no relevant action we return null
      initialValue: null,
      in: {
        $cond: [
          // Important part, transform the initialValue into a Date so it doesn't crash
          // The idea here is to get the latest reminderFirstDay that is in the boundaries
          { $gt: ['$$this', { $ifNull: ['$$value', $convertToDate(0)] }] },
          '$$this',
          '$$value',
        ],
      },
    },
  };
};

const getTicketUpdateOperation = (ticketType, { minDay, maxDay }) => ({
  $ifNull: [determineReferenceDate(ticketType, { minDay, maxDay }), `$${ticketType}.createdAt`],
});

/* WITH updateMany, can't have a limit */
// Defining the operations that will be run on those datas
// damn it ! I really hope it works
const getUpdatePipeline = (ticketType, { minDay, maxDay }) => [
  {
    $set: {
      [`${ticketType}.referenceDate`]: getTicketUpdateOperation(ticketType, { minDay, maxDay }),
    },
  },
];

const getBatch = (app, ticketType, { limit, after }) => {
  // We can use ticket.createdAt as a cursor because there's so few duplicates that the risk is very limited
  // I will mitigate this risk by using $gte instead of $gt (I might run the update twice on a ticket but that's okay because it's non destructive)
  const query = {
    shouldSurfaceInStatistics: { $in: [true, false] }, // To use the index lead_ticket_created_at OR unsatisfied_ticket_created_at
    [`${ticketType}.createdAt`]: { $gte: after || new Date(0) },
  };
  const projection = { _id: true, [`${ticketType}.createdAt`]: true };
  const sort = { [`${ticketType}.createdAt`]: 1 };

  return app.models.Data.getMongoConnector().find(query, { projection }).sort(sort).limit(limit).toArray();
};

const getCursorFromBatch = (ticketsBatch, ticketType) => {
  const lastTicket = ticketsBatch[ticketsBatch.length - 1];
  return (lastTicket && lastTicket[ticketType] && lastTicket[ticketType].createdAt) || null;
};

const setReferenceDateForPeriod = async (app, { minDay, maxDay, batchSize = 5000 }) => {
  /*
    Ok so first of all, I discovered that ticket.actions.reminderDate... is not a date but a string
      So I can't perform any range filtering on it, and running a migration script will blow up Mongo
    I'm going to rely on reminderFirstDay which is set as the translation of reminderDate into a dayNumber
    But then, on my update, I need to translate that dayNumber back into a date
    A word on indexes, we need 2 of them :
      - { 'leadTicket.name': 1, 'leadTicket.reminderStatus': 1, 'leadTicket.reminderFirstDay': 1 }
      - { 'unsatisfiedTicket.name': 1, 'unsatisfiedTicket.reminderStatus': 1, 'unsatisfiedTicket.reminderFirstDay': 1 }
    That function has to be thoroughly tested
  */
  let hasMoreLeads = true;
  let nLeadTicketsModified = 0;
  let leadsCursor;
  let hasMoreUnsatisfied = true;
  let nUnsatisfiedTicketsModified = 0;
  let unsatisfiedCursor;
  let nIterations = 0;
  while (hasMoreLeads || hasMoreUnsatisfied) {
    if (hasMoreLeads) {
      const leadTicketsBatch = await getBatch(app, 'leadTicket', { limit: batchSize, after: leadsCursor });
      const leadTicketIds = leadTicketsBatch.map(({ _id }) => _id);
      // pray for the DB not to go Чорнобиль, else БЛЯТЬ
      const leadTicketMigrationResult = await app.models.Data.getMongoConnector().updateMany(
        getTicketQuery('leadTicket', { minDay, maxDay, dataIds: leadTicketIds }),
        getUpdatePipeline('leadTicket', { minDay, maxDay })
      );
      // updating cursor & nModified & hasMore
      leadsCursor = getCursorFromBatch(leadTicketsBatch, 'leadTicket');
      nLeadTicketsModified += leadTicketMigrationResult.modifiedCount;
      hasMoreLeads = leadTicketsBatch.length === batchSize;
    }
    if (hasMoreUnsatisfied) {
      const unsatisfiedBatch = await getBatch(app, 'unsatisfiedTicket', { limit: batchSize, after: unsatisfiedCursor });
      const unsatisfiedTicketIds = unsatisfiedBatch.map(({ _id }) => _id);
      // pray for the DB not to go Чорнобиль, else БЛЯТЬ
      const unsatisfiedTicketMigrationResult = await app.models.Data.getMongoConnector().updateMany(
        getTicketQuery('unsatisfiedTicket', { minDay, maxDay, dataIds: unsatisfiedTicketIds }),
        getUpdatePipeline('unsatisfiedTicket', { minDay, maxDay })
      );
      // updating cursor & nModified & hasMore
      unsatisfiedCursor = getCursorFromBatch(unsatisfiedBatch, 'unsatisfiedTicket');
      nUnsatisfiedTicketsModified += unsatisfiedTicketMigrationResult.modifiedCount;
      hasMoreUnsatisfied = unsatisfiedBatch.length === batchSize;
    }

    log.info(
      ANASS,
      `Iteration n°${++nIterations} done : ${nLeadTicketsModified} leadTickets & ${nUnsatisfiedTicketsModified} unsatisfiedTickets so far`
    );
  }

  return { nLeadTicketsModified, nUnsatisfiedTicketsModified };
};

module.exports = { setReferenceDateForPeriod };
