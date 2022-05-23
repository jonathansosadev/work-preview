module.exports = {
  enabled: true,
  model: 'AutomationCampaignsEvents',
  script: async (app) => {
    const tickets = await app.models.DatasAsyncviewLeadTicket.getMongoConnector().count({
      'source.type': 'Automation',
    });
    let events = await app.models.AutomationCampaignsEvents.getMongoConnector()
      .aggregate([{ $match: { type: 'LEAD' } }, { $group: { _id: null, count: { $sum: '$nsamples' } } }])
      .toArray();
    events = events.length > 0 ? events[0].count : -1;
    return { tickets, events };
  },
  shouldSendMessage: async (res) => {
    return res.tickets !== res.events;
  },
  message: async (res) => {
    return `[Automation] le nombre d'events LEAD (${res.events}) n'est pas égal au nombre de leadTickets (${res.tickets})`;
  },
  slackChannel: 'çavapastrop',
};
