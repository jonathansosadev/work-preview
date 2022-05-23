/* eslint-disable */

module.exports = {
  label: 'AutomationCampaignSetStatusToggle',
  before: async () => {},
  queryApollo: `mutation AutomationCampaignSetStatusToggle($automationCampaignId: String!) {
    AutomationCampaignSetStatusToggle(automationCampaignId: $automationCampaignId) {
      campaignId
      campaignStatus
      campaignRunDayNumber
      message
      status
    }
  }`,
  variablesApollo: {
    automationCampaignId: '5ece846a8fd33421d30527c6',
  },
  legacyQuery: `{ 
    queryName(arg1: value) {
      field1
      field2
    }
  }`,
  getLegacyResults: (data) => {
    return JSON.stringify(data.queryName, null, 2);
  },
  getResults: (data) => {
    return JSON.stringify(data.AutomationCampaignSetStatusToggle, null, 2);
  },
  expected: `Schweppes, what did you expect ?`,
};
