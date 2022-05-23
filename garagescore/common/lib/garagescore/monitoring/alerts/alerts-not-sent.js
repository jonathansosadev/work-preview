const ContactType = require('../../../../models/contact.type');
const AlertType = require('../../../../../common/models/alert.types')
const { associate, genMessageData } = require('../utils');

const $match = { createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, type: ContactType.ALERT_EMAIL };
const $group = { _id: "$payload.alertType", total: { $sum: 1 } };

// Add AlertType here to exclude them from the monitor
const alertTypesToExclude = [
    AlertType.SENSITIVE_VI,
    AlertType.UNSATISFIED_FOLLOWUP_VI,
    AlertType.LEAD,
    AlertType.LEAD_APV,
    AlertType.AUTOMATION_LEAD_VO,
    AlertType.UNSATISFIED,
    AlertType.NEW_R2,
    AlertType.MAKE_SURVEYS,
    AlertType.GOOGLE_CAMPAIGN_ACTIVATED,
    AlertType.GOOGLE_CAMPAIGN_DESACTIVATED,
    AlertType.LEAD_TICKET_REOPEN,
    AlertType.UNSATISFIED_TICKET_REOPEN,
    AlertType.SATISFIED_MAINTENANCE,
    AlertType.SATISFIED_MAINTENANCE_WITH_LEAD,
    AlertType.SATISFIED_VN,
    AlertType.SATISFIED_VO,
    AlertType.SATISFIED_VI,
]

const alertTypes = {};
AlertType.values().filter(value => !alertTypesToExclude.some(valueExclude => valueExclude === value)).forEach(value => alertTypes[value] = 0);


module.exports = {
    enabled: true,
    model: 'Contact',
    pipeline: [
        { $match },
        { $group },
    ],
    shouldSendMessage: (res) => {
        const allAlertTypes = associate(res, alertTypes);
        return Object.keys(allAlertTypes).find(alertType => allAlertTypes[alertType] === 0);
    },
    message: async (res) => {
        let message = '*[GarageScore]* - Alert not sent since last week\n';
        const allAlertTypes = associate(res, alertTypes);
        const messageData = await genMessageData(allAlertTypes, { type: ContactType.ALERT_EMAIL }, 'payload.alertType')
        messageData.forEach(data => message += `no ALERT_EMAIL \`${data.type}\` sent since last week, last at : ${data.lastSendAt}\n`)
        return message;
    },
    slackChannel: 'çavapastrop',
};

