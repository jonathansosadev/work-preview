/** Test scheduler manually */
require('dotenv').config({ silent: true });
const scheduler = require('./scheduler');
const { JobTypes } = require('../../../../frontend/utils/enumV2');

(async function main() {
  for (let i = 0; i < 1; i++) {
    const insertedItem = await scheduler.upsertJob(
      JobTypes.TEST_RATING_UPDATED,
      { dataId: '5ce46cbf94a7009632396f81', i }, // Le payload qui contient les données du job (sert a créer le jobId)
      new Date('January 25 2019 19:08'), // La date mini a laquelle le job sera crée
      {
        // Les contraintes, a voir dans le fichier scheduler.js
        utc: 2,
        setMin: 15,
        workingHours: true,
        noWeekEnd: true,
      }
    );
    console.log(`Job created : ${insertedItem.getId().toString()}:${new Date(insertedItem.scheduledAtAsDate)}`);
  }
  process.exit();
})();
