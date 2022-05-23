const app = require('../../../../server/server');

module.exports = {
  getSelfAssignPayload: async (contact) => {
    const payload = {};
    if (contact.payload.dataId) payload.data = await app.models.Data.findById(contact.payload.dataId);
    if (!payload.data) throw Error(`getSelfAssignPayload error: No data for dataId: ${contact.payload.dataId}`);
    payload.stage = contact.payload.stage;
    payload.garage = await app.models.Garage.findById(payload.data.get('garageId'), {
      fields: { publicDisplayName: 1, locale: 1 },
    });
    if (!payload.garage) throw Error(`getSelfAssignPayload error: No garage for garageId: ${payload.data.garageId}`);
    payload.locale = payload.garage && payload.garage.locale;
    return payload;
  },
};
