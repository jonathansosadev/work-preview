const { ObjectID } = require('mongodb');

const formatQuery = (obj) => {
  if (typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      obj[key] = formatQuery(obj[key]);
    });
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = formatQuery(obj[i]);
    }
  } else if (typeof obj === 'string') {
    if (obj.startsWith('newDate(')) {
      obj = new Date(obj.substr(9, 10)); // new Date('1995-12-17')
    } else if (obj.length === 24) {
      try {
        obj = new ObjectID(obj);
      } catch (e) {}
    }
  }
  return obj;
};

const queryCustomers = async (app, query) => {
  let where = {};
  let fields = {};
  if (query.mongoQuery) {
    where = formatQuery(JSON.parse(decodeURIComponent(query.mongoQuery)));
  }
  if (query.mongoFields) {
    fields = { projection: JSON.parse(decodeURIComponent(query.mongoFields)) };
  }
  return await app.models.Customer.mongoFind(
    where,
    fields,
    query.skip ? parseInt(query.skip, 10) : 0,
    (query.limit ? parseInt(query.limit, 10) : 10) + 1
  );
};

const index = async (app, req, res) => {
  try {
    if (!req.body) {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ status: 'ko', error: 'no params !' }));
      return;
    }
    const garageModelInstances = await app.models.Garage.find({
      where: {},
      fields: {
        id: true,
        publicDisplayName: true,
      },
    });
    const garages = {};
    garageModelInstances.forEach((garage) => {
      garages[garage.id] = garage.publicDisplayName;
    });
    const customers = await queryCustomers(app, req.query);
    customers.forEach((customer) => {
      if (customer.garageId) {
        customer.garagePublicDisplayName = garages[customer.garageId.toString()] || '';
      }
    });
    res.render('darkbo/darkbo-reviews/customers.nunjucks', {
      customers: JSON.stringify(customers),
      mongoQuery: req.query.mongoQuery,
      mongoFields: req.query.mongoFields,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
      skip: req.query.skip ? parseInt(req.query.skip, 10) : 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};

const getMore = async (app, req, res) => {
  try {
    if (!req.body) {
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ status: 'ko', error: 'no params !' }));
      return;
    }
    const customers = await queryCustomers(app, req.query);
    res.json(customers);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};

const createCsvReport = async (app, req, res) => {
  try {
    res.json('ok');
    await app.models.Customer.createCsvReport();
  } catch (e) {
    res.status(500).send('Error');
  }
};

module.exports = {
  index,
  getMore,
  createCsvReport,
};
