var batch = [];

var userJob = db.userJobs.findOne({ name: 'Secrétariat général' });
db.User.find({ $or: [{ job: { $exists: false } }, { job: { $in: ['', null] } }] }).forEach(function (user) {
  print(user._id);

  var $set = { job: userJob.name };
  if (!user.reportConfigs && !user.allGaragesAlerts) {
    $set.reportConfigs = userJob.defaultUserConfig.reportConfigs;
    $set.allGaragesAlerts = userJob.defaultUserConfig.allGaragesAlerts;
  }
  batch.push({
    updateOne: {
      filter: { _id: user._id },
      update: { $set },
    },
  });
});

if (batch.length) {
  db.User.bulkWrite(batch);
}
