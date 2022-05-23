/**
 * Issue #4325
 * Set survey.firstRespondedAt for datas from Chanoine garages so that
 * datas are counted for the calculation of Satisfaction KPIs (GarageHistory)
 */
db.getCollection('datas').updateMany(
  {
    garageId: {
      $in: [
        '5fb647e1eb47b800035b2f5a',
        '5fb64c84eb47b800035b302c',
        '5fb64ec1eb47b800035b3088',
        '5fb65059eb47b800035b30bd',
        '5fb653f6eb47b800035b31b4',
        '5fb6554aeb47b800035b31eb',
        '5fc4c86ff38f000003569c04',
      ],
    },
    'review.fromCockpitContact': true,
    'survey.firstRespondedAt': null,
  },
  [
    {
      $set: {
        'survey.firstRespondedAt': '$contactTicket.closedAt',
      },
    },
  ]
);
