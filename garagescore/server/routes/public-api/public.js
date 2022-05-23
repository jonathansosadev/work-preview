const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const common = require('./common');

/** All Garage datas and ratings (paginated)
  "data" : [garages]
  "next": link to the next page
*/
const garagesData = async function (req, res) {
  const appId = req.query.appId;
  const after = req.params.after;
  try {
    const datas = await gsAPI.garages(appId, after, 101);
    const results = { datas: [] };
    if (datas.length === 101) {
      datas.pop();
      results.next = `garages/data/after/${datas[datas.length - 1].garageId}`;
    }
    results.datas = datas;
    res.send(JSON.stringify(results));
  } catch (err) {
    common.apiError(res, err);
    console.error(err);
  }

};
/** Garage data and ratings */
const garageData = async function (req, res) {
  const appId = req.query.appId;
  const garageId = req.params.garageId;
  if (!garageId) {
    res.status(404).send(JSON.stringify({ error: 'No garageId' }));
    return;
  }
  try {

    const data = await gsAPI.garage(appId, garageId);
    res.send(JSON.stringify(data));
  } catch (err) {
    common.apiError(res, errAPI);
    console.error(errAPI);
    return;
  }
};
/** Search garage from criteria */
const garageSearch = async function (req, res) {
  const appId = req.query.appId;
  const criteria = req.params.criteria;
  const value = req.params.value;
  const where = {};
  if (!criteria) {
    res.status(400).send(JSON.stringify({ error: 'No criteria' }));
    return;
  }
  if (!value) {
    res.status(400).send(JSON.stringify({ error: 'No criteria value' }));
    return;
  }
  if (criteria !== 'businessId' && criteria !== 'externalId') {
    res.status(400).send(JSON.stringify({ error: 'Incorrect criteria' }));
    return;
  }
  where[criteria] = value;
  try {
    const data = await gsAPI.garageSearch(appId, where);
    if (!data) {
      res.send(404, `No garage found with ${JSON.stringify(where)}`);
    } else {
      res.send(JSON.stringify(data));
    }
  } catch (err) {
    common.apiError(res, err);
    console.log(errAPI.message);
  }

};

/** Leads for a garage */
const garageLeads = function (req, res) {
  const appId = req.query.appId;
  const garageId = req.params.garageId;
  const page = req.query.pagina;
  const limit = req.query.pLimit || 50;

  const skip = page ? page * limit : 0;

  if (!garageId) {
    res.status(404).send(JSON.stringify({ error: 'No garageId' }));
    return;
  }
  try {
    const leads = gsAPI.leadsByGarage(appId, garageId, limit, skip);
    res.send(JSON.stringify(leads));
  } catch (err) {
    common.apiError(res, err);
    console.error(err);
  }

};
/** Leads for a date of all garages authorized to the appId of the requester */
const leadsByDate = function (req, res) {
  const appId = req.query.appId;
  const day = req.params.day;
  const month = req.params.month;
  const year = req.params.year;
  const after = req.params.after;

  const leadSaleType = req.query.leadSaleType;
  const source = req.query.source;

  const pageSize = req.query.pagination ? 101 : 251;

  gsAPI
    .leadsByDate2(appId, { day, month, year, leadSaleType, source, limit: pageSize, after })
    .then((leads) => {
      const results = { leads: [] };
      if (leads.length === pageSize) {
        leads.pop();
        const queryParams = {
          ...(req.query.pagination ? { pagination: req.query.pagination } : {}),
          ...(req.query.leadSaleType ? { leadSaleType: req.query.leadSaleType } : {}),
          ...(req.query.source ? { source: req.query.source } : {}),
        };
        const toQueryParamString = (queryParams) => {
          if (!queryParams || !Object.keys(queryParams).length) return '';
          const paramStr = Object.entries(queryParams)
            .map(([param, value]) => `${param}=${value}`)
            .join('&');
          return `?${paramStr}`;
        };
        results.next = `garage/leads/${day}/${month}/${year}/after/${leads[leads.length - 1].id}`;
        results.next += toQueryParamString(queryParams);
      }
      results.leads = leads;
      res.send(JSON.stringify(results));
    })
    .catch((errAPI) => {
      common.apiError(res, errAPI);
      console.error(errAPI);
      return;
    });
};

/** Add reviews */
const addReviews = async function (req, res) {
  try {
    const changes = await gsAPI.addReviews(req.params.garageId, req.body);
    return res.json({ changes });
  } catch (e) {
    console.error(e);
    return common.apiError(res, e);
  }
};

/** Lastest reviews of a garage
  param pagina is reserved to YellowPages
*/
const garageReviews = async function (req, res) {
  const appId = req.query.appId;
  const garageId = req.params.garageId;
  const page = req.query.pagina;
  const limit = req.query.pLimit || 50;

  const skip = page ? page * limit : 0;

  if (!garageId) {
    res.status(404).send(JSON.stringify({ error: 'No garageId' }));
    return;
  }
  try {
    const reviews = await gsAPI.reviewsByGarage(appId, garageId, limit, skip);
    res.send(JSON.stringify(reviews));
  } catch (err) {
    common.apiError(res, err);
    console.error(err);
  }

};
/** Reviews for a date, returns review for all garages linked to the appId */
const reviewsByDate = function (req, res) {
  const pageSize = req.query.pagination ? 101 : 251;
  const dateField = req.query.dateField;
  const appId = req.query.appId;
  const day = req.params.day;
  const month = req.params.month;
  const year = req.params.year;
  const after = req.params.after;
  gsAPI.reviewsByDate(
    appId,
    null,
    'Europe/Paris',
    day,
    month,
    year,
    dateField,
    pageSize,
    after,
    (errAPI, reviews, nHits) => {
      // eslint-disable-line max-len
      if (errAPI) {
        common.apiError(res, errAPI);
        console.error(errAPI);
        return;
      }
      const results = { reviews: [] };
      if (nHits === pageSize) {
        reviews.pop(); // Pourquoi on jette celui là ?
        results.next = `garage/reviews/${day}/${month}/${year}/after/${reviews[reviews.length - 1].id}`;
        if (req.query.pagination) results.next += '?pagination=true';
      }
      results.reviews = reviews;
      res.send(JSON.stringify(results));
    }
  );
};

/** get garages Configurations for external review sites */
const getGaragesExogenousConfigurations = async function (req, res) {
  try {
    const results = await gsAPI.getGaragesExogenousConfigurations();
    return res.json(results);
  } catch (e) {
    console.error(e);
    return common.apiError(res, e);
  }
};

const signalExogenousReviewError = function (req, res) {
  const appId = req.query ? req.query.appId : req.body.appId;
  const { garageId } = req.params;
  gsAPI
    .signalExogenousReviewError(appId, garageId, req.body)
    .then(() => res.json({ status: 'ok' }))
    .catch((error) => common.apiError(res, error));
};

const renderContact = async (req, res) => {
  try {
    const results = await gsAPI.renderContact(req.query.appId, req.params.id);
    return res.json(results);
  } catch (e) {
    console.error(e);
    return common.apiError(res, e);
  }
};

module.exports = {
  garagesData,
  garageData,
  garageSearch,

  garageLeads,
  leadsByDate,

  addReviews,
  garageReviews,
  reviewsByDate,

  getGaragesExogenousConfigurations,
  signalExogenousReviewError,

  renderContact,
};
