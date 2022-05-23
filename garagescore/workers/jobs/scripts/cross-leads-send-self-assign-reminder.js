/**
 * send every self assign reminder stages until the 4th
 */
const { promisify } = require('util');
const app = require('../../../server/server');

const { SIMON, log } = require('../../../common/lib/util/log');
const ContactService = require('../../../common/lib/garagescore/contact/service');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
const { TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');

module.exports = async (job) => {
  const sendContact = promisify(ContactService.prepareForSend).bind(ContactService);
  const ref = 'cross-leads-send-self-assign-reminder.js';
  const { dataId, stage, contacts, googleOpeningHours, timezone } = job.payload;

  if (!dataId) {
    log.error(SIMON, `${ref}: no dataId in ${JSON.stringify(job)}`);
    return;
  }
  if (!contacts || !contacts.length) {
    log.error(SIMON, `${ref}: no contacts in ${JSON.stringify(job)}`);
    return;
  }
  if (!stage) {
    log.error(SIMON, `${ref}: no stage in ${JSON.stringify(job)}`);
    return;
  }

  const data = await app.models.Data.findById(dataId, { fields: { leadTicket: true } });
  if (!data) {
    log.error(SIMON, `${ref}: no data with id ${dataId}`);
    return;
  }

  if (data.get('leadTicket.selfAssignedTo')) {
    log.info(SIMON, `${ref}: ${dataId} is selfAssignedTo ${data.get('leadTicket.selfAssignedTo')}, stop sending alert`);
    return;
  }

  const isActionPerformed = (data.get('leadTicket.actions') || []).find(
    (action) =>
      ![
        TicketActionNames.LEAD_STARTED,
        TicketActionNames.INCOMING_EMAIL,
        TicketActionNames.INCOMING_CALL,
        TicketActionNames.INCOMING_MISSED_CALL,
      ].includes(action.name)
  );
  // Someone already took care of the leadTicket
  if (isActionPerformed) {
    log.info(SIMON, `${ref}: ${dataId} is already touched by ${data.get('leadTicket.manager')}, stop sending alert`);
    return;
  }

  for (const contact of contacts) {
    contact.payload.stage = stage; // Overwrite the last contact stage to update the alert content
    contact.sendAt = null; // Delete sendAt from the last contact sent
    await sendContact(contact);
  }
  if (stage < 4) {
    // Time next reminder in 15mins
    await Scheduler.upsertJob(
      JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER,
      {
        dataId,
        stage: stage + 1,
        contacts,
        googleOpeningHours,
        timezone,
      },
      new Date(),
      {
        noWeekEnd: true,
        saturdayOk: true,
        planJobAfterXHoursOfOpeningHours: {
          hours: 15 / 60,
          googleOpeningHours,
          timezone,
          minimumScheduledHour: 9,
        },
      }
    );
  }
};
