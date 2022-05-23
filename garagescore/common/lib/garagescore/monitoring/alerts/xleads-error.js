module.exports = {
  enabled: true,
  model: 'IncomingCrossLead',
  pipeline: [
    {
      $match: { status: 'Error', receivedAt: { $gte: new Date(Date.now() - 1000 * 3600 * 24) } },
    },
    {
      $lookup: { from: 'garages', localField: 'garageId', foreignField: '_id', as: 'garage' },
    },
  ],
  shouldSendMessage: (res) => res.length,
  message: (res) => {
    return (
      `*[XLeads]* Suspicious errors in the last 24h:\n` +
      res
        .filter((r) => !r.error.includes('is disabled'))
        .map((r) => {
          let subject = '';
          const garageName = (r.garage && r.garage[0] && r.garage[0].publicDisplayName) || '';
          if (r.payload && r.payload.subject) subject += `*Sujet* ${r.payload.subject.slice(0, 30)}`;
          else if (r.payload && r.payload.phone) subject += `*Téléphone* ${r.payload.phone}`;
          return `\`${r.garageId}\` - ${garageName} - ${subject} *Erreur* ${r.error} - *Source* ${r.sourceType
            } - *receivedAt:* ISODate("${r.receivedAt.toISOString()}")`;
        })
        .join('\n')
    );
  },
  slackChannel: 'çavapastrop',
};
