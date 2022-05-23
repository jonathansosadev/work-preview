const app = require('../../server/server');
const contactsSender = require('../../workers/contacts-sender');
const ContactStatus = require('../../common/models/contact.status');
const ContactTypes = require('../../common/models/contact.type');
const { ObjectId } = require('mongodb');
const { log, ALEX } = require('../../common/lib/util/log');

async function exec() {
  log.debug(ALEX, 'Rattrapement des leads non envoyés.');
  const contactConnector = app.models.Contact.getMongoConnector();
  const contactIds = (await contactConnector.find({ 
    createdAt: {
      $gte: new Date("2022-02-21T15:40:00Z"),
    },
    type: ContactTypes.ALERT_EMAIL,
    status: ContactStatus.SKIPPED,
    'payload.alertType': { 
      $regex: /Lead/,
      $nin: ['UnsatisfiedMaintenanceWithLead', 'SensitiveMaintenanceWithLead', 'LeadTicketReminder'],
    }
  }, { projection: { _id: true }}).toArray()).map(contact => contact._id.toString());
  for (const id of contactIds) {
      log.debug(ALEX, `Processing : ${id}`);
      try {
        await contactsSender.queueContact(id, ContactTypes.ALERT_EMAIL, new Date());
        await contactConnector.updateOne({ _id: new ObjectId(id) }, { $set: { status: ContactStatus.WAITING } });
      } catch(err) {
        log.debug(ALEX, `Error : ${err}`);
      }
  }
  log.debug(ALEX, 'Tous les leads ont été rattrapé.');
}

app.on('booted', () => {
  exec()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(-1);
    });
});
