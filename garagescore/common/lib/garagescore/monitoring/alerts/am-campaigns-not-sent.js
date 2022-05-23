const { AutomationCampaignTargets } = require('../../../../../frontend/utils/enumV2');
const ContactType = require('../../../../models/contact.type');
const { associate, genMessageData } = require('../utils');

// Add AutomationCampaignTargets here to exclude them from the monitor
const automationCampaignTargetsToExclude = [
    AutomationCampaignTargets.COVID,
    AutomationCampaignTargets.COVID1,
    AutomationCampaignTargets.COVID2,
    AutomationCampaignTargets.M_NVS,
    AutomationCampaignTargets.M_NVS_14,
    AutomationCampaignTargets.M_NVS_23,
    AutomationCampaignTargets.M_NVS_26,
    AutomationCampaignTargets.M_NVS_35,
    AutomationCampaignTargets.VS_NVS_18,
    AutomationCampaignTargets.VS_NVS_24,
]

const $match = { createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, type: { $in: [ContactType.AUTOMATION_CAMPAIGN_EMAIL, ContactType.AUTOMATION_CAMPAIGN_SMS] } };
const $group = { _id: "$payload.target", total: { $sum: 1 } };



const automationCampaignTargets = {};
AutomationCampaignTargets.values().filter(value => !automationCampaignTargetsToExclude.some(valueExclude => valueExclude === value)).forEach(value => automationCampaignTargets[value] = 0);



module.exports = {
    enabled: true,
    model: 'Contact',
    pipeline: [
        { $match },
        { $group },
    ],
    shouldSendMessage: (res) => {
        const allAutomationCampaignTarget = associate(res, automationCampaignTargets);
        return Object.keys(allAutomationCampaignTarget).find(automationCampaignTarget => allAutomationCampaignTarget[automationCampaignTarget] === 0);
    },
    message: async (res) => {
        let message = '*[GarageScore]* - Automation Campaign not sent since last week\n';
        const allAutomationCampaignTarget = associate(res, automationCampaignTargets);
        const messageData = await genMessageData(allAutomationCampaignTarget, { type: { $in: [ContactType.AUTOMATION_CAMPAIGN_EMAIL, ContactType.AUTOMATION_CAMPAIGN_SMS] } }, 'payload.target')
        messageData.forEach(data => message += `no Automation campaign \`${data.type}\` sent since last week, last at : ${data.lastSendAt}\n`)
        return message;
    },

    slackChannel: 'çavapastrop',
};


