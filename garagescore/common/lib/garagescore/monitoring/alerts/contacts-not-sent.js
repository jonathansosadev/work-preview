const ContactType = require('../../../../models/contact.type');
const { associate, genMessageData } = require('../utils');

const $match = { createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
const $group = { _id: "$type", total: { $sum: 1 } };



// Add ContactType here to exclude them from the monitor
const contactTypesToExclude = [
	'TEST',
	'CAMPAIGNS_READY',
	'FTP_CREDENTIALS',
	'SUPERVISOR_GARAGE_REPORT_EMAIL',
	'SUPERVISOR_SYNCHRONISATION_REPORT',
	'SUPERVISOR_X_LEADS_STATS_REPORT',
	'SUBSCRIPTION_REQUEST_EMAIL',
	'SUBSCRIPTION_CONFIRMATION_EMAIL',
	'SUBSCRIPTION_FEATURE_REQUEST_EMAIL',
	'USER_ACCESS_REQUEST',
];

const contactTypes = {};
ContactType.values().filter(value => !contactTypesToExclude.some(valueExclude => valueExclude === value)).forEach(value => contactTypes[value] = 0);


module.exports = {
    enabled: true,
    model: 'Contact',
    pipeline: [
        { $match },
        { $group },
    ],
    shouldSendMessage: (res) => {
        const allContactTypes = associate(res, contactTypes);
        return Object.keys(allContactTypes).find(contactType => allContactTypes[contactType] === 0);
    },
    message: async (res) => {
        let message = '*[GarageScore]* Monitoring email not sent\n';
        const allContactTypes = associate(res, contactTypes);
        const messageData = await genMessageData(allContactTypes, {}, 'type')
        messageData.forEach(data => message += `no \`${data.type}\` emails sent since last week, last at : ${data.lastSendAt}\n`)
        return message;

    },
    slackChannel: 'çavapastrop',
};

