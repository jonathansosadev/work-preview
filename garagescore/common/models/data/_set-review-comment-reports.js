/**
 * Save report in bdd
 * @param app the app instance
 * @param data the data which will contain the newly created report
 * @param channel the channel on slack to write the message example: `#report`
 * @param reporter String the username of the reporter
 * @param reason String A text message
 */
module.exports = async (app, { _id: dataId }, channel, reporter, reason) => {
  const report = {
    date: new Date(),
    channel,
    reporterId: reporter.getId(),
    reason,
  };
  return await app.models.Data.getMongoConnector().updateOne(
    { _id: dataId },
    { $push: { 'review.comment.reports': report } }
  );
};
