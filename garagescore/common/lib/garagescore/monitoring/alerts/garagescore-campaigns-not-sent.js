const app = require('../../../../../server/server');
const contactsConfig = require('../../data-campaign/contacts-config')
const { associate, genMessageData } = require('../utils');

const $match = { createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, type: { $in: ["CAMPAIGN_SMS", "CAMPAIGN_EMAIL"] } };
const $group = { _id: "$payload.key", total: { $sum: 1 } };
const options = { hint: "createdAt_-1" }


const campaignTypes = {};

// Add contactsConfigTypes here to exclude them from the monitor
const campaignTypesToExclude = []

contactsConfig.toArray.filter(config => !campaignTypesToExclude.some(valueExclude => valueExclude === config.key)).forEach(config => campaignTypes[config.key] = 0);


module.exports = {
    enabled: true,
    model: 'Contact',
    pipeline: [
        { $match },
        { $group },
    ],
    options,
    shouldSendMessage: (res) => {
        const allCampaignTypes = associate(res, campaignTypes);
        return Object.keys(allCampaignTypes).find(campaignType => allCampaignTypes[campaignType] === 0);
    },
    message: async (res) => {
        let message = '*[GarageScore]* Campaign contact no sent last week:\n';
        const allCampaignTypes = associate(res, campaignTypes);
        const messageData = await genMessageData(allCampaignTypes, { type: { $in: ["CAMPAIGN_SMS", "CAMPAIGN_EMAIL"] } }, 'payload.key')
        messageData.forEach(data => message += `no CAMPAIGN \`${data.type}\` sent since last week, last at : ${data.lastSendAt}\n`)
        return message;
    },
    slackChannel: 'çavapastrop',
};

