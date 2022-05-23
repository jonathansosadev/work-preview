const app = require('../../../server/server');
const { ANASS, time, timeEnd, log } = require('../../../common/lib/util/log');

const parseArgs = () => {
  return {
    rollback: process.argv.includes('--rollback'),
    rollbackNumber:
      process.argv.includes('--rollback') && process.argv[process.argv.findIndex((arg) => arg === '--rollback') + 1],
    migrate: process.argv.includes('--migrate'),
  };
};

// Rollback
const rollbackUsers = async (backupNumber) => {
  time(ANASS, 'Rollback');
  try {
    const BACKUP_COLLECTION_NAME = `User_backup_${backupNumber}`;
    const backupCollectionConnector = app.models.User.getDataSource().connector.db.collection(BACKUP_COLLECTION_NAME);
    await backupCollectionConnector.aggregate([{ $match: {} }, { $out: 'User' }]).toArray();
    await backupCollectionConnector.drop();
    log.info(ANASS, 'Rollback successful !');
  } catch (errRollback) {
    log.error(ANASS, 'Error during rollback: check that you used the right backup number');
    log.error(ANASS, errRollback);
    process.exit(404);
  }
  timeEnd(ANASS, 'Rollback');
  process.exit(0);
};

// Backup
const backupUsers = async () => {
  const backupNumber = Math.floor(Math.random() * 90 + 10);
  const backupCollection = `User_backup_${backupNumber}`;
  time(ANASS, 'Building backup collection done');
  log.info(`Backing up to collection: ${backupCollection}...`);
  const aggregateCopy = [{ $match: {} }, { $out: backupCollection }];
  await app.models.User.getMongoConnector().aggregate(aggregateCopy).toArray();
  timeEnd(ANASS, 'Building backup collection done');
  return backupNumber;
};

const getCusTeamIdsList = () => {
  return app.models.User.getMongoConnector()
    .find({ email: /@garagescore\.com|@custeed\.com/ }, { projection: { _id: true } })
    .toArray();
};

// Migrate
const migrateUsers = async (cusTeamIds) => {
  time(ANASS, 'All users migration done');
  const $match = {};

  const conditions = {
    SuperAdmin: { $or: [{ $in: ['$_id', cusTeamIds] }, { $in: ['$parentId', cusTeamIds] }] },
    Admin: { $eq: ['$authorization.MANAGE_CHILDREN', true] },
  };
  const $set = {
    role: {
      $cond: {
        if: conditions.SuperAdmin,
        then: 'SuperAdmin',
        else: { $cond: { if: conditions.Admin, then: 'Admin', else: 'User' } },
      },
    },
  };

  const $unset = ['availableGarageIds', 'parent', 'parentId', 'ancestors', 'authorization.MANAGE_CHILDREN'];

  const $merge = {
    into: 'User',
    on: '_id',
    whenMatched: 'replace',
    whenNotMatched: 'discard',
  };

  const pipeline = [{ $match }, { $set }, { $unset }, { $merge }];

  await app.models.User.getMongoConnector().aggregate(pipeline).toArray();
  timeEnd(ANASS, 'All users migration done');
};

const generateUsersRolesCSV = async () => {
  console.log('');
  const header = ['UserId', 'Email', 'Role'];

  const projection = { _id: true, email: true, role: true };
  const users = await app.models.User.getMongoConnector().find({}, { projection }).toArray();
  const usersRows = users.map(({ _id, email, role }) => [_id.toString(), email, role]);

  console.log([header, ...usersRows].map((line) => line.join(',')).join('\n'));
};

app.on('booted', async () => {
  try {
    const { rollback, rollbackNumber, migrate } = parseArgs();
    if ((!rollback && !rollbackNumber && !migrate) || (rollback && !rollbackNumber)) {
      console.log('Usage: scripts/migration/user/migrate-user-roles.js [--migrate || --rollback "backupNumber"]');
      process.exit(0);
    }
    if (rollback) {
      await rollbackUsers(rollbackNumber);
      process.exit(0);
    } else if (migrate) {
      const cusTeamIds = await getCusTeamIdsList();
      const backupNumber = await backupUsers();
      await migrateUsers(cusTeamIds.map(({ _id }) => _id));
      await generateUsersRolesCSV();
      console.log('Backup number is:', backupNumber);
      process.exit(0);
    }
  } catch (err) {
    log.error(ANASS, err);
    process.exit(42);
  }
});
