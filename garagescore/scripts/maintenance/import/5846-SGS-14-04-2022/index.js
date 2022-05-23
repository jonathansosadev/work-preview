'use strict';

const app = require('../../../../server/server.js');
const fs = require('fs');
const { parse } = require('csv');
const { promisify } = require('util');
// @ts-ignore
const { ObjectId } = require('mongodb');
const parseAsync = promisify(parse);

/**
 * process csv file
 * 
 * @param {*} db 
 */
async function importOfSGSAffectation(db) {

  const fileName = './scripts/maintenance/import/5846-SGS-14-04-2022/reaffectation.RR.xlsx.-.Feuil1.csv';
  const rows = await parseAsync(fs.readFileSync(fileName));

  // first line in csv file
  const header = rows.shift();
  
  // create objects
  const records = rows.map((row) => {
    return header.reduce((results, propName, index) => {
      results[propName] = row[index];
      return results
    }, {});
  })

  // garages grouped by user
  const userNameAndGaragesByUserid = records.reduce((results, record) => {
    if (!results[record.USERID]) {
      results[record.USERID] = {
        name: record['NOM PRENOM RR'],
        garages: []
      }
    }

    results[record.USERID].garages.push(record['CODE CENTRE'])

    return results
  }, {});
  

  // update users
  for (const userID in userNameAndGaragesByUserid) {
    if (Object.hasOwnProperty.call(userNameAndGaragesByUserid, userID)) {
      const userName = userNameAndGaragesByUserid[userID].name;
      const externalIds = userNameAndGaragesByUserid[userID].garages;

      const garageIds = await db.collection('garages')
        .aggregate([
          { $match: { externalId: { $in: externalIds } } },
          { $project: { _id: 1, externalId: 1 } },
        ])
        .toArray();

      const knownExternalIds = garageIds.map(elem => elem.externalId);
      const unknownExternalIds = externalIds.filter(externalId => knownExternalIds.indexOf(externalId) === -1);

      if (unknownExternalIds.length > 0) {
        console.error(`
          unexpected error during import of datas for user: ${userName} (${userID}).
          ${unknownExternalIds.length} garages can't be found.
          please verify the following "CODE CENTRE" for that user:
          (${unknownExternalIds.join(', ')})
        `)
      }

      console.log(`modification de l'utilisateur ${userName} (${userID})`)

      await db.collection('User').updateOne(
        { _id: ObjectId(userID)},
        { 
          $set: { 
            garageIds: garageIds.map(elem => ObjectId(elem._id)) 
          } 
        }
      );

      console.log(`modification de l'utilisateur ${userName} (${userID}) terminé`)
    }
  }
}


app.on('booted', async () => {
    try {
      console.log(`================= Import SGS affectation`);
      console.time('execution_time');
      // @ts-ignore
      await importOfSGSAffectation(app.datasources.garagescoreMongoDataSource.connector.db);
      console.timeEnd('execution_time');
      console.log('=================script end without error');
    } catch (err) {
      console.log(err);
    }
    process.exit(0);
});
  