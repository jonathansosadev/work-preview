const chai = require('chai');
const TestApp = require('../../../common/lib/test/test-app');
const AccumulatorsPool = require('../../../common/lib/garagescore/monitoring/internal-events/accumulators-pool');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

const expect = chai.expect;
chai.should();
const app = new TestApp();
/**
 * Lance un tableau de promesses en parallèle
 * En limitant le nombre de promesses exécutées en même temps
 */
async function concurrentpromiseAll(promises, maxConcurrentRequests) {
  const allPromises = promises.map((p) => {
    return p;
  });
  const recurse = () => {
    const promise = allPromises.shift(); // on prend la prochaine promesse de la liste
    return !promise
      ? null
      : Promise.allSettled([promise()]).then(() => {
          // une promesse vient de finir, on lance la suivante;
          return recurse();
        });
  };
  return Promise.all(
    /* on commence en lancant x promesses (en utilisant un faux tableau avec juste length) */
    Array.from({ length: maxConcurrentRequests }, recurse)
  );
}

describe('Accumulate events', () => {
  beforeEach(async () => {
    await app.reset();
  });
  it('accumulated events dont lose data', async () => {
    const dataTypes = ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale'];
    const stepNumbers = [18645, 18646, 18647, 18648, 18649, 18650, 18651];
    function sendEvent(i, accumulatorsPool, sleep) {
      return new Promise((resolve) => {
        const dataType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
        const stepNumber = stepNumbers[Math.floor(Math.random() * stepNumbers.length)];

        const garageId = GaragesTest.GARAGE_DUPONT;
        let type, counters;
        counters = { [`counters.ftp2s3.total`]: 1 };
        type = 'IMPORT_FILE';
        accumulatorsPool.add({ key1: garageId, key2: dataType, key3: stepNumber }, type, counters, 1);
        setTimeout(() => {
          resolve();
        }, sleep);
      });
    }
    let eventCount = 0;
    const accumulatorsPool = new AccumulatorsPool((e) => {
      expect(e.nEvents).is.not.undefined;
      eventCount += e.nEvents;
      expect(e.key1).is.not.undefined;
      expect(e.key2).is.not.undefined;
      expect(e.key3).is.not.undefined;
      expect(e.counters).is.not.undefined;
    });
    const allPromises = [];
    const NEVENTS = 50;
    for (let i = 0; i < NEVENTS; i++) {
      allPromises.push(() => sendEvent(i, accumulatorsPool, 1 /*50 + Math.random() * 1000*/));
    }
    await concurrentpromiseAll(allPromises, 5);

    await accumulatorsPool.emit();
    expect(eventCount).equals(NEVENTS);
  });
});
