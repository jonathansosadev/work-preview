/* global db, ObjectId, ISODate */
db.datas
  .aggregate([
    { $match: { 'review.createdAt': { $gte: new Date(ISODate().getTime() - 1000 * 86400 * 14) } } }, // eslint-disable-line
    {
      $group: {
        _id: {
          year: { $year: '$review.createdAt' },
          month: { $month: '$review.createdAt' },
          day: { $dayOfMonth: '$review.createdAt' },
        },
        count: { $sum: 1 },
        createdAt: { $first: '$review.createdAt' },
      },
    },
    { $sort: { _id: 1 } },
  ])
  .forEach((d) => {
    const day = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][d.createdAt.getDay()];
    print(`${day} ${d._id.year}/${d._id.month}/${d._id.day}: ${d.count} `);
  });
