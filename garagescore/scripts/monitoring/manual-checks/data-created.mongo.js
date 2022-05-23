/* global db, ObjectId, ISODate */
let lastDate = null;
db.datas
  .aggregate([
    { $match: { createdAt: { $gte: new Date(ISODate().getTime() - 1000 * 86400 * 14) } } }, // eslint-disable-line
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          type: '$type',
        },
        count: { $sum: 1 },
        createdAt: { $first: '$createdAt' },
      },
    },
    { $sort: { _id: 1 } },
  ])
  .forEach((d) => {
    if (lastDate !== `${d._id.year}/${d._id.month}/${d._id.day}`) {
      if (lastDate) {
        print('-------------------------');
        print(['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][d.createdAt.getDay()]);
      } else {
        print(['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][d.createdAt.getDay()]);
      }
      lastDate = `${d._id.year}/${d._id.month}/${d._id.day}`;
    }
    print(`${d._id.year}/${d._id.month}/${d._id.day} - ${d._id.type}: ${d.count} `);
  });
