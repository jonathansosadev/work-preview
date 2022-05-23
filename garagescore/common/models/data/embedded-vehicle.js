const { Revisable, RevisableDate } = require('./definition-helpers');
/**
 * A vehicle (car)
 */
const model = () => ({
  properties: {
    /* Were some data changed by the owner */
    isRevised: {
      type: 'boolean',
      default: false,
    },
    /* Were the data valided by his owner */
    isValidated: {
      type: 'boolean',
      default: false,
    },
    /* Last time the data were revised*/
    lastRevisionAt: {
      type: 'date',
    },
    /* Vehicle data */
    make: {
      type: Revisable,
    },
    model: {
      type: Revisable,
    },
    mileage: {
      type: Revisable,
    },
    plate: {
      type: Revisable,
    },
    vin: {
      type: Revisable,
    },
    countryCode: {
      type: Revisable,
    },
    registrationDate: {
      type: RevisableDate,
    },
    categoryId: {
      // what is that?
      type: Revisable,
    },
  },
});

module.exports = { model };
