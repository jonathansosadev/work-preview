/** Mini users backup */
const { ObjectId } = require('mongodb');
const { JS, log } = require('../util/log.js');
const app = require('../../../server/server');

/* Check the latest updated users and store them in another collection */
async function backup() {
  const Backup = app.models.BackupUser.getMongoConnector();
  const User = app.models.User.getMongoConnector();
  let lastBackup = await Backup.find({}).project({ '_id.date': 1 }).sort({ '_id.date': -1 }).limit(1).toArray();
  lastBackup = (lastBackup && lastBackup.length > 0 && lastBackup[0]._id.date) || new Date(0);
  const $match = { updatedAt: { $gt: lastBackup } };
  const hasUpdate = await User.count($match);
  if (hasUpdate) {
    await User.aggregate([
      { $match },
      { $project: { user: '$$ROOT' } },
      { $addFields: { _id: { userId: '$user._id', date: new Date() } } },
      { $merge: 'backupUser' },
    ]).toArray();
    log.debug(JS, `${hasUpdate} users saved in the backup for ${lastBackup}`);
  } else {
    log.debug(JS, `No user updated after ${lastBackup} => no updates`);
  }
}
// List all available backup (list of dates) available for an user
async function listUserBackup(userId) {
  const id = new ObjectId(userId.toString());
  const Backup = app.models.BackupUser.getMongoConnector();
  const backups = await Backup.aggregate([
    { $match: { 'user._id': id } },
    {
      $project: {
        date: 1,
      },
    },
  ]).toArray();
  return backups;
}
// TODO
async function restore(userId, fromDate) {}

module.exports = { backup, listUserBackup, restore };
