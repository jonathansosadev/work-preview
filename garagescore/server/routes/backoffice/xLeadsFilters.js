const { promisify } = require('util');
/**
 * Manage crossleads filters
 */

const getFilters = async (app, req, res) => {
  try {
    const xLeadsFilters = await promisify(app.models.Configuration.getXLeadsFilters)();
    res.json(xLeadsFilters);
  } catch (err) {
    res.json({ emails: [], phones: [] });
  }
};

const insertFilters = async (app, req, res) => {
  const { filters } = req.body;
  const xLeadsFilters = await promisify(app.models.Configuration.getXLeadsFilters)();

  if (xLeadsFilters) {
    if (filters.email && xLeadsFilters.emails) {
      xLeadsFilters.emails.push({ value: filters.email, enabled: true });
    }
    if (filters.phone && xLeadsFilters.phones) {
      xLeadsFilters.phones.push({ value: filters.phone, enabled: true });
    }
    await promisify(app.models.Configuration.setXLeadsFilters)(xLeadsFilters);
  }

  res.json({ status: 'ok' });
};

const removeFilters = async (app, req, res) => {
  const { type, value } = req.body;
  const xLeadsFilters = await promisify(app.models.Configuration.getXLeadsFilters)();

  if (xLeadsFilters) {
    if (type === 'email' && xLeadsFilters.emails) {
      xLeadsFilters.emails = xLeadsFilters.emails.filter((email) => email && email.value !== value);
    }
    if (type === 'phone' && xLeadsFilters.phones) {
      xLeadsFilters.phones = xLeadsFilters.phones.filter((phone) => phone && phone.value !== value);
    }
    await promisify(app.models.Configuration.setXLeadsFilters)(xLeadsFilters);
  }

  res.json({ status: 'ok' });
};

module.exports = {
  insertFilters: insertFilters,
  getFilters: getFilters,
  removeFilters: removeFilters,
};
