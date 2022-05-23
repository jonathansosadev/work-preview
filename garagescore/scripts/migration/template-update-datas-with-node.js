/** Template to update the datas collection (mongo shell) */
const config = require('config');
const app = require('../../server/server');
const MongoClient = require('mongodb').MongoClient;
const promises = require('../../common/lib/util/promises');
const Observable = require('zen-observable');
// initial MONGO (not loopback) query to get the datas to be modified
const findQuery = {};

// mongo query may not be enough
// you can get here some data's fields and run some code
// return true if you want data to be modified
const condition = (data) => {
  // eslint-disable-line
  return false;
};

// configure the data.sets
// dont forget data.set('fixes.[ticketID]')
const setMethod = async (data) => {
  // eslint-disable-line
  return;
};

/**
 * You do not need to modify the code below
 * */

/**
 * Create an observable to loop through the results of a mongo query
 * where: mongo query where
 * results: mongo query option (like skip, projection... see mongo module api doc)
 */
const findObservable = (where = {}, options = {}) => {
  const observable = new Observable((observer) => {
    async function run() {
      const db = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
      const Model = app.models.Data;
      try {
        const records = await db.collection('datas').find(where, options);
        while (await records.hasNext()) {
          const record = await records.next();
          const instance = new Model(record);
          observer.next(instance);
        }
        console.log('done');
        observer.complete();
      } catch (e) {
        console.error(e);
        observer.complete();
      }
    }
    run();
  });
  return observable;
};

// even if data._id already exists in db, because its been made with 'new Model()'
// loopback considers it like a new entry and just create a new record on save()
// so we need to get the 'real' instance before saving it
const makeMutable = async (data) => app.models.Data.findById(data._id);
// just make save async
const save = async (data) => await promises.makeAsync(data.save.bind(data))();

const main = async () => {
  console.time('time');
  let i = 0;
  let pendingUpdates = 0;
  let fixedDatas = 0;
  let done = false;
  const exitIfNoPendingUpdates = () => {
    if (done && pendingUpdates === 0) {
      process.exit();
    }
  };
  findObservable(findQuery, { skip: 0, projection: {} })
    .forEach(async (data) => {
      i++;
      if (i === 1 || i % 1000 === 0) console.log(`${i} read`);
      try {
        if (condition(data)) {
          pendingUpdates++;
          const instance = await makeMutable(data);
          await setMethod(instance);
          await save(instance);
          fixedDatas++;
          pendingUpdates--;
          exitIfNoPendingUpdates();
        }
      } catch (e) {
        console.error(e);
      }
    })
    .then(() => {
      console.timeEnd('time');
      console.log('Finished successfully');
      console.log(`${fixedDatas} fixed datas`);
      done = true;
      exitIfNoPendingUpdates();
    })
    .catch((err) => {
      console.timeEnd('time');
      console.log(`Finished with error: ${err}`);
    });
};

app.on('booted', main);
