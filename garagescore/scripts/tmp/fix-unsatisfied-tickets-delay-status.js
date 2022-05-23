const app = require('../../server/server');
const DelayStatus = require('../../common/models/data/type/delay-status');

const ONE_DAY = 1000 * 60 * 60 * 24;

app.on('booted', async () => {
  try {
    const mongoData = app.models.Data.getMongoConnector();

    // Closed tickets with NEW delay status but which should be IMMINENT
    const request1 = [
      {
        'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
        'unsatisfiedTicket.closedAt': { $gte: new Date(0) },
        'unsatisfiedTicket.delayStatus': DelayStatus.NEW,
        $expr: {
          $and: [
            {
              $gt: [{ $subtract: ['$unsatisfiedTicket.closedAt', '$unsatisfiedTicket.createdAt'] }, ONE_DAY],
            },
            {
              $lte: [{ $subtract: ['$unsatisfiedTicket.closedAt', '$unsatisfiedTicket.createdAt'] }, 4 * ONE_DAY],
            },
          ],
        },
      },
      { $set: { 'unsatisfiedTicket.delayStatus': DelayStatus.IMMINENT } },
    ];

    // Open tickets with NEW delay status but which should be IMMINENT
    const request2 = [
      {
        'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
        'unsatisfiedTicket.closedAt': { $exists: false },
        'unsatisfiedTicket.delayStatus': DelayStatus.NEW,
        $expr: {
          $and: [
            {
              $gt: [{ $subtract: ['$$NOW', '$unsatisfiedTicket.createdAt'] }, ONE_DAY],
            },
            {
              $lte: [{ $subtract: ['$$NOW', '$unsatisfiedTicket.createdAt'] }, 4 * ONE_DAY],
            },
          ],
        },
      },
      { $set: { 'unsatisfiedTicket.delayStatus': DelayStatus.IMMINENT } },
    ];

    // Closed tickets with NEW delay status but which should be EXCEEDED
    const request3 = [
      {
        'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
        'unsatisfiedTicket.closedAt': { $gte: new Date(0) },
        'unsatisfiedTicket.delayStatus': DelayStatus.NEW,
        $expr: {
          $gt: [{ $subtract: ['$unsatisfiedTicket.closedAt', '$unsatisfiedTicket.createdAt'] }, 4 * ONE_DAY],
        },
      },
      { $set: { 'unsatisfiedTicket.delayStatus': DelayStatus.EXCEEDED } },
    ];

    // Open tickets with NEW delay status but which should be EXCEEDED
    const request4 = [
      {
        'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
        'unsatisfiedTicket.closedAt': { $exists: false },
        'unsatisfiedTicket.delayStatus': DelayStatus.NEW,
        $expr: {
          $gt: [{ $subtract: ['$$NOW', '$unsatisfiedTicket.createdAt'] }, 4 * ONE_DAY],
        },
      },
      { $set: { 'unsatisfiedTicket.delayStatus': DelayStatus.EXCEEDED } },
    ];

    // Closed tickets with IMMINENT delay status but which should be EXCEEDED
    const request5 = [
      {
        'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
        'unsatisfiedTicket.closedAt': { $gte: new Date(0) },
        'unsatisfiedTicket.delayStatus': DelayStatus.IMMINENT,
        $expr: {
          $gt: [{ $subtract: ['$unsatisfiedTicket.closedAt', '$unsatisfiedTicket.createdAt'] }, 4 * ONE_DAY],
        },
      },
      { $set: { 'unsatisfiedTicket.delayStatus': DelayStatus.EXCEEDED } },
    ];

    // Open tickets with IMMINENT delay status but which should be EXCEEDED
    const request6 = [
      {
        'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
        'unsatisfiedTicket.closedAt': { $exists: false },
        'unsatisfiedTicket.delayStatus': DelayStatus.IMMINENT,
        $expr: {
          $gt: [{ $subtract: ['$$NOW', '$unsatisfiedTicket.createdAt'] }, 4 * ONE_DAY],
        },
      },
      { $set: { 'unsatisfiedTicket.delayStatus': DelayStatus.EXCEEDED } },
    ];

    const [result1, result2, result3, result4, result5, result6] = await Promise.all([
      mongoData.updateMany(request1[0], request1[1]),
      mongoData.updateMany(request2[0], request2[1]),
      mongoData.updateMany(request3[0], request3[1]),
      mongoData.updateMany(request4[0], request4[1]),
      mongoData.updateMany(request5[0], request5[1]),
      mongoData.updateMany(request6[0], request6[1]),
    ]);

    console.log(`Closed Tickets NEW --> IMMINENT : ${result1.modifiedCount}`);
    console.log(`Open Tickets NEW --> IMMINENT : ${result2.modifiedCount}`);
    console.log(`Closed Tickets NEW --> EXCEEDED : ${result3.modifiedCount}`);
    console.log(`Open Tickets NEW --> EXCEEDED : ${result4.modifiedCount}`);
    console.log(`Closed Tickets IMMINENT --> EXCEEDED : ${result5.modifiedCount}`);
    console.log(`Open Tickets IMMINENT --> EXCEEDED : ${result6.modifiedCount}`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
