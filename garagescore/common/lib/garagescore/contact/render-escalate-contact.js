const app = require('../../../../server/server');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const SourceTypes = require('../../../../common/models/data/type/source-types.js');

const getEscalateAlertPayload = async function getEscalateAlertPayload(contact) {
  const payload = {};
  const alertType = contact.type.includes('LEAD') ? 'lead' : 'unsatisfied';
  if (contact.payload.dataId) payload.data = await app.models.Data.findById(contact.payload.dataId);
  if (!payload.data) throw Error(`Escalate email rendering failed : No data for dataId: ${contact.payload.dataId}`);
  payload.alertedUser = contact.payload.alertedUser;
  payload.managerName = null;
  payload.sourceTypeCategory = SourceTypes.getCategory(payload.data.get('source.type'));
  if (payload.sourceTypeCategory === 'AUTOMATION' && payload.data.get('leadTicket.automationCampaignId')) {
    const automationCampaignId = payload.data.get('leadTicket.automationCampaignId');
    const automationCampaign = await app.models.AutomationCampaign.findById(automationCampaignId, {
      fields: { displayName: 1 },
    });
    payload.campaignDisplayName = (automationCampaign && automationCampaign.displayName) || '';
  }
  const followup = await app.models.Job.findOne({
    // Getting the job so we know when the followup gonna be sent
    where: {
      'payload.dataId': payload.data.get('id').toString(),
      type: JobTypes[`SEND_${alertType.toUpperCase()}_FOLLOWUP`],
    },
    fields: { scheduledAtAsDate: 1 },
  });
  payload.followupScheduledAt = new Date((followup && followup.scheduledAtAsDate) || '');
  if (payload.data.get(`${alertType}Ticket.manager`)) {
    const manager = await app.models.User.find({
      where: { id: payload.data.get(`${alertType}Ticket.manager`) },
      fields: { firstName: 1, lastName: 1 },
    });
    payload.managerName = (manager[0] && manager[0].getFullName()) || null;
  }
  payload.garage = await app.models.Garage.findById(payload.data.get('garageId'), {
    fields: { publicDisplayName: 1, locale: 1, timezone: 1 },
  });
  if (!payload.garage)
    throw Error(`Escalate email rendering failed : No garage for garageId: ${payload.data.garageId}`);
  payload.locale = payload.garage && payload.garage.locale;
  payload.timezone = (payload.garage && payload.garage.timezone) || null;
  payload.dataId = contact.payload.dataId;
  return payload;
};

module.exports = {
  getEscalateAlertPayload,
};
