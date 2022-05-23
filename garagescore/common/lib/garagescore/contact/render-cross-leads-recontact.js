const { ObjectId } = require('mongodb');
const app = require('../../../../server/server');

module.exports = {
  getCrossLeadsRecontactPayload: async (contact) => {
    const payload = {};
    if (contact.payload.dataId) {
      payload.data = await app.models.Data.getMongoConnector().findOne(
        { _id: ObjectId(contact.payload.dataId) },
        { projection: { source: true, garageId: true, leadTicket: true } }
      );
    }
    if (!payload.data) throw Error(`getRecontactPayload error: No data for dataId: ${contact.payload.dataId}`);
    payload.garage = await app.models.Garage.getMongoConnector().findOne(
      { _id: ObjectId(payload.data.garageId) },
      { projection: { publicDisplayName: true, locale: true } }
    );
    if (!payload.garage) throw Error(`getRecontactPayload error: No garage for garageId: ${payload.data.garageId}`);
    payload.locale = payload.garage && payload.garage.locale;
    payload.currentAction = contact.payload.args;
    if (!payload.currentAction) throw Error(`getRecontactPayload error: No  for currentAction: ${payload.data.action}`);
    return payload;
  },
};
