const { ObjectId } = require('mongodb');
const moment = require('moment');
const { AutomationCampaignsEventsType } = require('../../../../frontend/utils/enumV2');
const { dayNumber } = require('../../util/time-helper');

const availableColumns = [
  {
    label: 'Nom établissement',
    collection: 'Garage',
    localField: 'garageId',
    foreignField: '_id',
    field: 'publicDisplayName',
  },
  {
    label: 'Groupe',
    collection: 'Garage',
    localField: 'garageId',
    foreignField: '_id',
    field: 'group',
  },
  { label: 'Email user', field: 'email' },
  { label: 'Mobile user', field: 'phone' },
  { label: 'Opt-in RGPD', fct: _isOptIn },
  { label: 'Date opt out', fct: _findOptOutDate },
];

// Misc
function _isOptIn({ unsubscribed }) {
  return unsubscribed === true ? 'Non' : 'Oui';
}
function _findOptOutDate({ unsubscribed, automationCampaignsEvents, updatedAt }) {
  if (!unsubscribed) return 'Non applicable';
  if (automationCampaignsEvents) {
    const unsubscribeEvent = automationCampaignsEvents.find((event) =>
      [AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED, AutomationCampaignsEventsType.UNSUBSCRIBED].includes(event.type)
    );
    if (unsubscribeEvent) {
      return moment(new Date(unsubscribeEvent.time || updatedAt)).format('DD/MM/YYYY');
    }
    return moment(updatedAt).format('DD/MM/YYYY');
  }
  return moment(updatedAt).format('DD/MM/YYYY');
}

const _getFilter = (filters, searchedField) => {
  const filter = filters.find(({ field }) => field === searchedField);
  return filter ? filter.values : null;
};

const _buildGaragesMap = (res, { _id, publicDisplayName, group }) => {
  res[_id.toString()] = { publicDisplayName, group };
  return res;
};

const _queryAccepted = (garages, dateBoundaries) => {
  const nGarages = garages ? Object.keys(garages).length : 1000000;
  const minBoundary = dateBoundaries.find((boundary) => boundary.$gte);
  const maxBoundary = dateBoundaries.find((boundary) => boundary.$lte);
  const minDate = minBoundary && moment(minBoundary.$gte);
  const maxDate = maxBoundary && moment(maxBoundary.$lte);

  let maxAcceptedPeriod = moment.duration(3, 'months');
  if (nGarages < 5) {
    maxAcceptedPeriod = moment.duration(1, 'year');
  }
  if (nGarages < 50) {
    maxAcceptedPeriod = moment.duration(6, 'months');
  }

  const difference = moment.duration(maxDate.diff(minDate));
  const queryAccepted = difference.as('ms') < maxAcceptedPeriod.as('ms');
  const nMonths = maxAcceptedPeriod.as('months');
  const message = `Période de temps doit être inférieur à ${nMonths} mois car ${nGarages} garages`;
  return {
    queryAccepted,
    message: queryAccepted ? 'OK' : message,
  };
};

// Formatting
const _getCustomerValueForColumn = (customer, garages, { collection, localField, foreignField, field, fct }) => {
  // Simple, that comes from the customer itself
  if (!collection) {
    if (field && typeof field === 'string') {
      return customer[field] || 'Non renseigné';
    }
    if (fct && typeof fct === 'function') {
      return fct(customer) || 'Non renseigné';
    }
    return 'OUCH no field or function specified';
  }
  // More complex we are getting those from another collection, based on customer's props
  // Here garage
  if (collection === 'Garage') {
    const garageToSearch = customer[localField];
    if (!garageToSearch) {
      return `OUCH customer doesn't have ${localField}`;
    }
    // For the moment we only have garageIds so, we'll search in a map with keys being the garageId
    const foundGarage = garages[garageToSearch];
    if (!foundGarage) {
      return `OUCH garage ${garageToSearch} not found`;
    }
    /** Preparing the future, considering garages is an array
     * const founcGarage = garages.find((garage) => garage[foreignField] === customer[localField])
     */

    // We're ready
    if (field && typeof field === 'string') {
      return foundGarage[field] || 'Non renseigné';
    }
    if (fct && typeof fct === 'function') {
      return fct(foundGarage) || 'Non renseigné';
    }
  }
};

const _buildCsvLines = (customers, garages /*,selectedColumns */) => {
  const columns = availableColumns; // .filter(({ label }) => selectedColumns.includes(label))

  const header = columns.map(({ label }) => label);
  const lines = customers.map((customer) => {
    return columns.map((column) => _getCustomerValueForColumn(customer, garages, column));
  });

  return [header, ...lines];
};

// Querying the DB here
const _getGarages = async (app, garageIds, groups) => {
  const projection = { _id: true, publicDisplayName: true, group: true };
  const query = {};

  if (garageIds && garageIds.length) {
    const mongoGarageIds = garageIds.filter((gId) => ObjectId.isValid(gId)).map((gId) => new ObjectId(gId));
    query._id = { $in: mongoGarageIds };
  }
  if (groups && groups.length) {
    query.group = { $in: groups };
  }

  return app.models.Garage.getMongoConnector().find(query, { projection }).toArray();
};

const _getExportedCustomers = async (app, garagesMap, dateBoundaries) => {
  const garageIds = Object.keys(garagesMap).map((gId) => new ObjectId(gId));
  const projection = {
    garageId: true,
    email: true,
    phone: true,
    unsubscribed: true,
    automationCampaignsEvents: true,
    updatedAt: true,
  };

  const query = {
    garageId: { $in: garageIds },
    'automationCampaignsEvents.type': AutomationCampaignsEventsType.TARGETED,
  };
  if (dateBoundaries && dateBoundaries.length) {
    query.$and = dateBoundaries.map((boundary) => ({ 'automationCampaignsEvents.time': boundary }));
  }

  return app.models.Customer.getMongoConnector().find(query, { projection }).toArray();
};

// Exported Functions
const getAvailableColumns = (labelsOnly = false) => {
  if (labelsOnly) return availableColumns.map(({ label }) => label);
  return availableColumns;
};

const exportAutomation = async (app, filters /*, selectedColumns */) => {
  // Parse filters
  const garageIds = _getFilter(filters, 'garageId');
  const groups = _getFilter(filters, 'group');
  const dateBoundaries = _getFilter(filters, 'date');
  // Get the garages
  const garages = (await _getGarages(app, garageIds, groups)).reduce(_buildGaragesMap, {});
  // Accepted ?
  const { queryAccepted, message } = _queryAccepted(garages, dateBoundaries);
  if (!queryAccepted) {
    return message;
  }
  // Get the customers
  const customers = await _getExportedCustomers(app, garages, dateBoundaries);
  // Build array of CSV lines
  const csvArray = _buildCsvLines(customers, garages /*, selectedColumns */);
  // Tranform the array into a string
  return csvArray.map((line) => line.join(';')).join('\n');
};

/**
 * the function allows you to export all customers who have been contacted
 * @param {Function} app main function for mongo connexion
 * @param {Number} month month number [0-11]
 * @returns
 */
const exportSentAutomation = async (app, month) => {
  const startMonth = month === 0 ? 11 : month - 1;
  const year = new Date().getFullYear();
  const startYear = month === 0 ? year - 1 : year;
  const day = 1;
  const monthsName = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  let csv = `publicDisplayName;garageId;Volume en ${monthsName[startMonth]} ${startYear} (email & sms);\n`;
  // get customers contacted beetwwen 1st of month and 1st of next month
  const eventSent = await app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          type: 'SENT',
          eventDay: {
            $gte: dayNumber(new Date(startYear, startMonth, day)),
            $lt: dayNumber(new Date(year, month, day)),
          },
        },
      },
      {
        $project: {
          garageId: true,
          nsamples: true,
        },
      },
      {
        $group: {
          _id: '$garageId',
          countTargeted: {
            $sum: '$nsamples',
          },
        },
      },
      {
        $sort: {
          countTargeted: -1,
        },
      },
    ])
    .toArray();
  // get garage name
  const garages = await app.models.Garage.getMongoConnector()
    .find({ _id: { $in: eventSent.map(({ _id }) => _id) } })
    .project({ publicDisplayName: 1 })
    .toArray();
  // create CSV text
  eventSent.forEach((event) => {
    const garage = garages.find((g) => g._id.toString() === event._id.toString());
    csv += `${garage.publicDisplayName};${event._id};${event.countTargeted};\n`;
  });
  return csv;
};

module.exports = {
  getAvailableColumns,
  exportAutomation,
  exportSentAutomation,
};
