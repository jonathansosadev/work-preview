const { GaragesTest } = require('../../../../../frontend/utils/enumV2');

module.exports = (req, res) => {
  res.status(200).send(
    JSON.stringify({
      results: [
        { garageId: GaragesTest.GARAGE_DUPONT, countPotentialSales: 5665 },
        { garageId: '5732ffa438c0161a00830304', countPotentialSales: 123 },
        { garageId: '58ad7914e1b38d1a0073d952', countPotentialSales: 3483 },
      ],
    })
  );
};
