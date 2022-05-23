/**
 * * The main job sending contacts
 */
const { ObjectID } = require('mongodb');
const app = require('../../../server/server');
const { sendContact } = require('../../contacts-sender');

module.exports = async (job) => {
  const { contactId } = job.payload;
  if (!contactId) {
    throw new Error(`send-contact no contactId in ${JSON.stringify(job)}`);
  }
  const contact = await app.models.Contact.findOne({ where: { _id: new ObjectID(contactId.toString()) } });
  if (!contact) {
    throw new Error(`send-contact no contact with id ${contactId}`);
  }
  try {
    await sendContact(contact);
  } catch (e) {
    throw new Error(`send-contact contactId ${contactId} : ${e.toString()}`);
  }
};
