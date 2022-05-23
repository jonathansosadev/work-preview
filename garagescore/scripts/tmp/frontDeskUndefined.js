const app = require('../../server/server');

app.on('booted', async () => {
  try {
    const dailyConnector = app.models.KpiByDailyPeriod.getMongoConnector();

    // const dailyKpis = await dailyConnector.find({ '1': 'FRONT_DESK_USERNAME_UNDEFINED' }).toArray();

    // const docs = [];
    // let count = 0;
    // for (const doc of dailyKpis) {
    //   if (Object.keys(doc).length === 8) {
    //     count++;
    //   }
    // }
    // console.log('\x1b[32m', `TOTAL : ${dailyKpis.length}`, '\x1b[0m');
    // console.log('\x1b[33m', `Empty : ${count}`, '\x1b[0m');

    const dailyKpis = await dailyConnector.find({}).toArray();

    const type = {};
    for (const doc of dailyKpis) {
      if (Object.keys(doc).length === 8) {
        if (!(doc['2'] in type)) {
          type[doc['2']] = [];
        }
        type[doc['2']].push(doc);
      }
    }

    for (const t in type) {
      if (t == '21') {
        console.log('\x1b[33m', `var : ${JSON.stringify(type[t], null, 2)}`, '\x1b[0m');
      }
      // console.log('\x1b[32m', `Type : ${t} = ${type[t].length}`, '\x1b[0m');
    }
    // console.log('\x1b[32m', `TOTAL : ${dailyKpis.length}`, '\x1b[0m');
    // console.log('\x1b[33m', `Empty : ${count}`, '\x1b[0m');

    // console.log('\x1b[33m', `docs : ${JSON.stringify(docs, null, 2)}`, '\x1b[0m');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
});
