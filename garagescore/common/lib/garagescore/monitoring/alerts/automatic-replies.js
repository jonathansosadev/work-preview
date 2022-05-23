const timeHelper = require('../../../util/time-helper');

function pipeline() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);
  const $match = {
    type: 'SEND_AUTOMATIC_REPLY',
    scheduledAt: {
      $gte: timeHelper.minuteNumber(yesterday),
    },
  };
  const $project = {
    source: '$payload.source.type',
    rating: '$payload.review.rating.value',
    passive: {
      $cond: [
        { $and: [{ $gte: ['$payload.review.rating.value', 7] }, { $lte: ['$payload.review.rating.value', 8] }] },
        1,
        0,
      ],
    },
    promoter: { $cond: [{ $gte: ['$payload.review.rating.value', 9] }, 1, 0] },
    detractor: { $cond: [{ $lte: ['$payload.review.rating.value', 6] }, 1, 0] },
    status: 1,
  };

  const $group = {
    _id: { source: '$source', status: '$status' },
    promoters: { $sum: '$promoter' },
    detractors: { $sum: '$detractor' },
    passives: { $sum: '$passive' },
  };
  console.log(JSON.stringify([{ $match }, { $project }, { $group }]));

  return [{ $match }, { $project }, { $group }];
}

module.exports = {
  enabled: true,
  model: 'Job',
  pipeline: pipeline(),
  shouldSendMessage: async () => {
    return true;
  },
  message: async (res) => {
    const message = [];

    message.push(`Statistiques de réponse automatique des 24 dernières heures:`);

    message.push(`Promoteurs: ${res.reduce((sum, d) => sum + d.promoters, 0)}`);
    message.push(`Passifs: ${res.reduce((sum, d) => sum + d.passives, 0)}`);
    message.push(`Détracteurs: ${res.reduce((sum, d) => sum + d.detractors, 0)}`);
    const getCount = (source, status) => {
      const d = res.find((r) => r._id.source === source && r._id.status === status);
      if (!d) return 0;
      return d.promoters + d.detractors + d.passives;
    };
    const g = (status) => getCount('Google', status);
    const f = (status) => getCount('Facebook', status);
    const d = (status) => getCount('DataFile', status);

    message.push(
      `\n*GarageScore*:\nFinis: ${d('DONE')}\nEncore en Attente: ${d('WAITING')}\nAnnulés: ${d(
        'CANCELLED'
      )}\nEn erreur: ${d('ERROR')} (${
        d('ERROR') === 0 ? 0 : Math.round((100 * d('ERROR')) / (d('DONE') + d('WAITING') + d('ERROR')))
      }%)`
    );
    message.push(
      `\n*Google*:\nFinis: ${g('DONE')}\nEncore en Attente: ${g('WAITING')}\nAnnulés: ${g('CANCELLED')}\nEn erreur: ${g(
        'ERROR'
      )} (${g('ERROR') === 0 ? 0 : Math.round((100 * g('ERROR')) / (g('DONE') + g('WAITING') + g('ERROR')))}%)`
    );
    message.push(
      `\n*Facebook*:\nFinis: ${f('DONE')}\nEncore en Attente: ${f('WAITING')}\nAnnulés: ${f(
        'CANCELLED'
      )}\nEn erreur: ${d('ERROR')} (${
        f('ERROR') === 0 ? 0 : Math.round((100 * f('ERROR')) / (f('DONE') + f('WAITING') + f('ERROR')))
      }%)`
    );
    return message.join('\n');
  },
  slackChannel: 'çavapastrop',
};
