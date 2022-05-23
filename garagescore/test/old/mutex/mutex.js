const TestApp = require('../../../common/lib/test/test-app');

const MongoObjectID = require('mongodb').ObjectID;
const chai = require('chai');

const expect = chai.expect;
const app = new TestApp();

const gsMutex = require('../../../common/lib/garagescore/mutex/mutex');

describe('GsMUTEX', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Lock, unlock and destroy the mutex correctly', async () => {
    const dataId = new MongoObjectID().toString();

    await gsMutex.lockByDataId(dataId);

    expect(gsMutex.isLockedByDataId(dataId), 'gsMutex.isLockedByDataId(dataId)').to.equals(true);
    setTimeout(() => gsMutex.unlockByDataId(dataId), 500);
    await gsMutex.lockByDataId(dataId);
    expect(gsMutex.isLockedByDataId(dataId), 'gsMutex.isLockedByDataId(dataId)').to.equals(true);
    gsMutex.unlockByDataId(dataId);
    gsMutex.deleteMutexByDataId(dataId);
    expect(gsMutex.mutexExistsByDataId(dataId), 'gsMutex.mutexExistsByDataId(dataId)').to.equals(false);
  });
});
