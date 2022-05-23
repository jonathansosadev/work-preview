module.exports = {
  enabled: true,
  model: 'IncomingCrossLead',
  pipeline: [
    {
      $match: {
        type: 'Email',
        error: { $not: /Blacklisted/ },
        status: 'Transferred',
        receivedAt: { $gte: new Date(Date.now() - 1000 * 3600 * 24) },
      },
    },
    {
      $lookup: { from: 'garages', localField: 'garageId', foreignField: '_id', as: 'garage' },
    },
  ],
  shouldSendMessage: (res) => res.length,
  message: (res) => {
    return (
      `*[XLeads]* Suspicious transfers in the last 24h:\n` +
      res
        .map(
          (r) =>
            `\`${r.garageId}\` - ${r.garage[0].publicDisplayName} - ${r.payload && r.payload.subject} - 
            *Source* ${r.sourceType} - *receivedAt:* ISODate("${r.receivedAt.toISOString()}")`
        )
        .join('\n')
    );
  },
  slackChannel: 'çavapastrop',
};
