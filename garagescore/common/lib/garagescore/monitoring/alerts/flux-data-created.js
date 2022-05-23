/**
 * Check if we created too much or not enough data
 */
const dataTypes = require('../../../../models/data/type/data-types');

const beforeYesterday = () => { // not really beforeYesterday, more like 48h before now
  return new Date(yesterday().getTime() - 24 * 60 * 60 * 1000);
};
const yesterday = () => { // not really yesterday, more like 24h before now
  return new Date(today().getTime() - 24 * 60 * 60 * 1000);
};
const today = () => {
  return new Date(new Date());
};

// get all types returned by the db
function getTypes(res) {
  const t = {};
  res.forEach((d) => {
    t[d._id.type] = true;
  });
  return Object.keys(t);
}
function getVolumeFromDay(res, type, day) {
  for (const d of res) {
    if (d._id.type === type && d._id.day === day) return d.count;
  }
  return 0;
}
/*
Format a bit our agg result to have something like this
[
  { type: 'ManualLead', yesterday: 0, beforeYesterday: 1, delta: 100 }
  { type: 'NewVehicleSale', yesterday: 657, beforeYesterday: 34, delta: 95 }
...
]
*/
function formatResults(res) {
  const formatted = [];
  const types = getTypes(res);
  types.forEach((type) => {
    const yesterday = getVolumeFromDay(res, type, 'yesterday');
    const beforeYesterday = getVolumeFromDay(res, type, 'beforeyesterday');
    let delta = 0; // pct of difference
    if (yesterday === 0 && beforeYesterday === 0) {
      delta === 0;
    } else if (yesterday > beforeYesterday) {
      delta = yesterday === 0 ? 0 : (100 * (yesterday - beforeYesterday)) / yesterday;
    } else {
      delta = beforeYesterday === 0 ? 0 : (100 * (beforeYesterday - yesterday)) / beforeYesterday;
    }
    delta = Math.round(delta);
    formatted.push({ type, yesterday, beforeYesterday, delta });
  });
  return formatted;
}
function THRESHOLD(type) {
  if (type === dataTypes.EXOGENOUS_REVIEW) return 50;
  return 30;
}
module.exports = {
  enabled: true,
  batch: 'MORNING',
  model: 'Data',
  pipeline: [
    {
      $match: {
        createdAt: {
          $gte: beforeYesterday(),
          $lt: today(),
        },
      },
    },
    {
      $project: {
        type: 1,
        day: { $cond: [{ $lte: ['$createdAt', yesterday()] }, 'beforeyesterday', 'yesterday'] },
      },
    },
    {
      $group: {
        _id: { type: '$type', day: '$day' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.day': 1 } },
  ],
  shouldSendMessage: (res) => {
    // dont run on monday because we have (almost) no data created on sunday
    if (yesterday().getDay() === 0) {
      return false;
    }
    const rows = formatResults(res);
    if (rows.length === 0) {
      return true;
    }
    for (const row of rows) {
      if (row.delta > THRESHOLD(row.type)) return true;
    }
    return false;
  },
  message: (res) => {
    const content = [];
    const rows = formatResults(res);
    if (rows.length === 0) {
      return '*[GarageScore]* Flow monitoring (campaigns + spiderscore): \n🚨 Aucun résultat renvoyé par la bdd ! 🚨';
    }
    for (const row of rows) {
      if (row.delta > THRESHOLD(row.type))
        content.push(
          `* ${'`' + row.type + '`'} Delta important (${row.delta
          }%) détecté entre le nombre de datas créés depuis 24h et il y a 48h.`
        );
    }
    return '*[GarageScore]* Flow monitoring (campaigns + spiderscore): \n' + content.join('\n');
  },
  slackChannel: 'çavapastrop',
};
