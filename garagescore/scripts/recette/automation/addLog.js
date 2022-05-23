const app = require('../../../server/server');

const intro = '[Automation - Generate Log] :';

const timeHelper = require('../../../common/lib/util/time-helper');
const { AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');
const { AutomationCampaignTargets } = require('../../../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../../common/models/automation-campaign-channel.type.js');
const MongoObjectID = require('mongodb').ObjectID;

const showHelp = (error) => {
  console.error(`${intro} : ERREUR : ${error}`);
  process.exit(-1);
};

async function exec() {
  if (process.argv.length < 3 || process.argv.includes('--help')) {
    console.log(`${intro} Generate Log Helper :
  --logType : ${AutomationCampaignsEventsType.values().join(', ')}

  --dayNumber : 18704

  --customerId : 5feyuizyefyzuifyezui
  OU
  --customerEmail : lele@lele.fr
  OU
  --customerPhone : +33678763568 (Le +33 est important, mettre le numéro sous forme internationale.)

  --campaignId : 567578636437648
  OU
  --campaignTarget : ${AutomationCampaignTargets.values().join(
    ', '
  )} (M_M = maintenance to maintenance, probablement celle que tu testera pour les conversions)
  --campaignContactType : EMAIL, MOBILE

  Exemples de commandes :

$ node scripts/recette/automation/addLog.js --logType LEAD --dayNumber 18603 --customerPhone +33685195125 --campaignTarget M_M --campaignContactType EMAIL
  node scripts/recette/automation/addLog.js --logType CONVERTED --date 22/04/2020 --customerId HREUIRHIEZ56575675 --campaignId 467F376F376F736


    `);
  }
  // LogType
  let logType = process.argv.indexOf('--logType');
  if (logType === -1 || !process.argv[logType + 1]) {
    showHelp('--logType absent de la ligne de commande.');
  }
  logType = process.argv[logType + 1];
  if (!AutomationCampaignsEventsType.values().includes(logType)) {
    showHelp('--logType invalide.');
  }
  console.log(`${intro} logType: `, logType);
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
  //Customer
  let customerId = process.argv.indexOf('--customerId');
  let customerEmail = process.argv.indexOf('--customerEmail');
  let customerPhone = process.argv.indexOf('--customerPhone');
  customerId = customerId === -1 ? null : process.argv[customerId + 1];
  customerEmail = customerEmail === -1 ? null : process.argv[customerEmail + 1];
  customerPhone = customerPhone === -1 ? null : process.argv[customerPhone + 1];
  if (!customerId && !customerPhone && !customerEmail) {
    showHelp('Aucun moyen de sélectionner un customer (--customerid, email ou phone)');
  }
  let whereCustomer = {};
  if (customerId) {
    whereCustomer = { _id: new MongoObjectID(customerId) };
  } else if (customerEmail) {
    whereCustomer = { emailList: customerEmail };
  } else if (customerPhone) {
    whereCustomer = { phoneList: customerPhone };
  }
  let customer = await app.models.Customer.getMongoConnector().findOne(
    { ...whereCustomer },
    { projection: { _id: true, garageId: true } }
  );
  if (!customer) {
    showHelp('Aucun customer trouvé. Vérifie les infos données');
  }
  customerId = customer._id;
  console.log(`${intro} customerId: `, customerId.toString());
  console.log(`${intro} garageId: `, customer.garageId.toString());
  // Campaign
  let campaignId = process.argv.indexOf('--campaignId');
  let campaignTarget = process.argv.indexOf('--campaignTarget');
  let campaignContactType = process.argv.indexOf('--campaignContactType');
  campaignId = campaignId === -1 ? null : process.argv[campaignId + 1];
  campaignTarget = campaignTarget === -1 ? null : process.argv[campaignTarget + 1];
  campaignContactType = campaignContactType === -1 ? null : process.argv[campaignContactType + 1];
  if (!campaignId && (!campaignTarget || !campaignContactType)) {
    showHelp("Paramètres de campagne erronés. On a besoin soit de l'ID, soit de la target ET du type de contact.");
  }

  let where = { garageId: customer.garageId, target: campaignTarget, contactType: campaignContactType };
  if (campaignId) {
    where = { id: new MongoObjectID(campaignId) };
  } else {
    if (!AutomationCampaignTargets.values().includes(campaignTarget)) {
      showHelp('--campaignTarget invalide.');
    }
    if (!AutomationCampaignChannelTypes.values().includes(campaignContactType)) {
      showHelp('--campaignContactType invalide.');
    }
  }
  let [campaign] = await app.models.AutomationCampaign.find({
    where: where,
    fields: { type: true, id: true, contactType: true, target: true },
  });

  if (!campaign) {
    showHelp('Campagne non trouvée. Vérifie les infos données');
  }
  console.log(`${intro} campaignId: `, campaign.getId().toString());
  console.log(`${intro} Target: `, campaign.target);
  console.log(`${intro} ContactType: `, campaign.contactType);
  console.log(`${intro} Adding log...`);
  await app.models.AutomationCampaignsEvents.addLog(
    {
      garageId: customer.garageId.toString(),
      campaignId: campaign.getId().toString(),
      customerId: customerId,
      eventType: logType,
      contactType: campaign.contactType,
      target: campaign.target,
      campaignType: campaign.type,
      campaignRunDay: 'todo_recetteAddLog',
    },
    {
      forceDate: timeHelper.dayNumberToDate(dayNumber),
    }
  );
  console.log(`${intro} Log added !`);
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
