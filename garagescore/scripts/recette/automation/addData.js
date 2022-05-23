const app = require('../../../server/server');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

const intro = '[Automation - Generate Data] :';

const timeHelper = require('../../../common/lib/util/time-helper');
const CronRunner = require('../../../common/lib/cron/runner');
const dataTypes = require('../../../common/models/data/type/data-types');
const automationAddDatasToCustomer = require('../../../workers/jobs/scripts/automation-add-datas-to-customer.js');

const MongoObjectID = require('mongodb').ObjectID;

const showHelp = (error) => {
  console.error(`${intro} : ERREUR : ${error}`);
  process.exit(-1);
};

async function exec() {
  if (process.argv.length < 3 || process.argv.includes('--help')) {
    console.log(`${intro} Generate Datad Helper :
  --dataType : ${dataTypes.values().join(', ')}
  
  --dayNumber : 18704 (le service provided at)
  
  -garageId: 5645375423765476245765 (de base, garage dupont)
  
  --customerEmail : lele@lele.fr
  --customerPhone : +33678763568 (Le +33 est important, mettre le numéro sous forme internationale.)
  
  
  Exemples de commandes :
  
  node scripts/recette/automation/addData.js --dataType Maintenance --dayNumber 18603 --customerPhone +33685195125 
  
    `);
  }
  // dataType
  let dataType = process.argv.indexOf('--dataType');
  if (dataType === -1 || !process.argv[dataType + 1]) {
    showHelp('--dataType absent de la ligne de commande.');
  }
  dataType = process.argv[dataType + 1];
  if (!dataTypes.values().includes(dataType)) {
    showHelp('--dataType invalide.');
  }
  console.log(`${intro} dataType: `, dataType);
  // dayNumber
  let dayNumber = process.argv.indexOf('--dayNumber');
  if (dayNumber === -1 || !process.argv[dayNumber + 1]) {
    showHelp('--dayNumber absent de la ligne de commande.');
  }
  dayNumber = parseInt(process.argv[dayNumber + 1]);
  if (isNaN(dayNumber)) {
    showHelp('--dayNumber invalide.');
  }
  console.log(`${intro} Date: `, timeHelper.dayNumberToDate(dayNumber));
  //Garage
  let garageId = process.argv.indexOf('--garageId');
  garageId = garageId === -1 ? null : process.argv[garageId + 1];
  garageId = garageId || GaragesTest.GARAGE_DUPONT;
  let garage = await app.models.Garage.find({
    where: {
      id: new MongoObjectID(garageId),
    },
    fields: {
      id: true,
      publicDisplayName: true,
    },
  });
  garage = garage[0];
  if (!garage) {
    showHelp('Garage introuvable. Vérifiez le paramètre.');
  } else {
    console.log(`${intro} garage :`, garage.publicDisplayName);
  }
  //Contact
  let customerEmail = process.argv.indexOf('--customerEmail');
  let customerPhone = process.argv.indexOf('--customerPhone');
  customerEmail = customerEmail === -1 ? null : process.argv[customerEmail + 1];
  customerPhone = customerPhone === -1 ? null : process.argv[customerPhone + 1];
  if (!customerPhone && !customerEmail) {
    showHelp('Aucun moyen de contact ajouté, le data va etre ignoré lors de la recherche de customer à associer !');
  }
  let customer = null;

  console.log(`${intro} Adding data...`);
  const data = new app.models.Data({
    garageId,
    type: dataType,
    shouldSurfaceInStatistics: true,
    service: {
      providedAt: timeHelper.dayNumberToDate(dayNumber),
    },
    customer: {
      contact: {
        email: {
          value: customerEmail || null,
        },
        mobilePhone: {
          value: customerPhone || null,
        },
      },
    },
  });
  await data.save();
  console.log(`${intro} Data added !`);
  console.log(`${intro} Associating data ${data.getId().toString()} to customer...`);
  await automationAddDatasToCustomer({
    payload: {
      dataIds: [data.getId().toString()],
    },
  });
  console.log(`${intro} Data ${data.getId().toString()} associated !`);
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
