const { GaragesTest } = require('../../../../../frontend/utils/enumV2');
const { ObjectId } = require('mongodb');

const MONDAY = 1;
const twoWeeks = 1000 * 3600 * 24 * 14;
module.exports = {
  enabled: true,
  model: 'Garage',
  pipeline: [
    {
      $match: {
        status: { $nin: ['Stopped'] },
        _id: { $nin: [...GaragesTest.values().map((id) => new ObjectId(id))] },
        $or: [
          { 'googlePlace.lastUpdate': { $lt: new Date(Date.now() - twoWeeks) } },
          { 'googlePlace.lastUpdate': { $exists: false } },
        ],
      },
    },
  ],
  shouldSendMessage: (res) => res.length && new Date().getDay() === MONDAY,
  message: (garages) => {
    return (
      `*[Administration]* Google PlaceId in error:\n` +
      garages
        .map((g) => {
          return `\`${g._id.toString()}\` - ${g.publicDisplayName} - \`${g.googlePlaceId || 'Vide'}\``;
        })
        .join('\n')
    );
  },
  slackChannel: 'çavapastrop',
};
