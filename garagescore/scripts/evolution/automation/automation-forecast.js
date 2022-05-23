const app = require('../../../server/server');

app.on('booted', () => {
  const matchCovidCustomers = app.models.AutomationCampaign.targetQueryFunctions.COVID();
  // match cible covid
  // clients emails => hasEmail / sms => hasSMS && !hasEmail
  // for each garage => nb emails; nb sms
  const emailCondition = { $and: [{ $eq: ['$$this.k', 'hasEmail'] }, { $eq: ['$$this.v', true] }] };
  const smsCondition = { $and: [{ $eq: ['$$this.k', 'hasPhone'] }, { $eq: ['$$this.v', true] }] };
  const checkIndexArray = (condition) => ({
    $anyElementTrue: { $map: { input: '$index', in: { $cond: { if: condition, then: false, else: true } } } },
  });
  const $match = matchCovidCustomers;
  const $project = {
    garageId: true,
    emailCustomer: {
      $cond: {
        if: checkIndexArray(emailCondition),
        then: 1,
        else: 0,
      },
    },
    smsCustomer: {
      $cond: {
        if: checkIndexArray(smsCondition),
        then: 1,
        else: 0,
      },
    },
    smsOnlyCustomer: {
      $cond: {
        if: { $and: [checkIndexArray(smsCondition), { $not: checkIndexArray(emailCondition) }] },
        then: 1,
        else: 0,
      },
    },
  };
  const $group = {
    _id: '$garageId',
    emailCustomers: { $sum: '$emailCustomer' },
    smsCustomers: { $sum: '$smsCustomer' },
    smsOnlyCustomers: { $sum: '$smsOnlyCustomer' },
  };
  const $lookup = {
    from: 'garages',
    localField: '_id',
    foreignField: '_id',
    as: 'garage',
  };
  const $unwind = '$garage';
  const $project2 = {
    _id: true,
    emailCustomers: true,
    smsCustomers: true,
    smsOnlyCustomers: true,
    garageName: { $ifNull: ['$garage.publicDisplayName', '$garage.slug'] },
  };
  const query = [{ $match }, { $project }, { $group }, { $lookup }, { $unwind }, { $project: $project2 }];
  const res = app.models.Customers.getMongoConnector().aggregate(query).toArray();
  // transform res into CSV
  const lines = ['Nom du garage;garageId;customers email;customers sms; customers seulement sms;'];
  lines.push(
    ...res.map((r) => `${r.garageName};${r._id.toString()};${r.emailCustomers};${r.smsCustomers};${r.smsOnlyCustomers}`)
  );
  console.log('Here is le CSV: ', '\n\n\n', lines.join('\n'), '\n');
});
