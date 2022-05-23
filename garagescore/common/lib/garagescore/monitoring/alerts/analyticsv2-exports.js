/*
  This script will get events from internalEvent collection with eventType = INCONSISTENT_VALUE and send an alert to slack
*/
const TimeHelper = require('../../../util/time-helper');
const exportsContext = require('../internal-events/contexts/exports-context');

const previousDay = (date) => {
  date.setDate(date.getDate() - 1);
  return date;
};

const eventDay = TimeHelper.dayNumber(previousDay(new Date()));

module.exports = {
  enabled: true,
  model: 'InternalEvent',
  pipeline: [
    {
      $match: {
        eventType: exportsContext.EVENT,
        eventDay: eventDay,
      },
    },
    {
      $project: {
        _id: false,
        jobId: '$key1',
        counters: {
          $objectToArray: '$counters',
        },
      },
    },
    {
      $unwind: {
        path: '$counters',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        jobId: true,
        columnName: '$counters.k',
        nSamples: '$counters.v',
      },
    },
    {
      $group: {
        _id: '$columnName',
        nSamples: {
          $sum: '$nSamples',
        },
        jobIds: {
          $push: '$jobId',
        },
      },
    },
  ],
  shouldSendMessage: (res) => res.length,
  message: (res) => {
    const fields = res.map((event) => `\t- \`${event._id}\` pour les jobs : \n\t\t\`[${event.jobIds.join(', ')}]\``);
    return `:warning: Des valeurs invalides ont été détectées dans les exports de la veille. Les champs concernés sont : \n ${fields.join(
      '\n'
    )}`;
  },
  slackChannel: 'çavapastrop',
};
