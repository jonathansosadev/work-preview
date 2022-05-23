const optionsParser = require('../../../common/lib/garagescore/data-file/options-parser');
/**
 * Shared import options
 */

const _indexSharedFilters = function (app, req, res) {
  app.models.Configuration.getSharedImportFilters((err, filters) => {
    if (err) {
      res.status(500).send({ status: 'ko', error: err.message });
      return;
    }
    res.render('darkbo/darkbo-campaigns/shared-import-filters.nunjucks', {
      current_tab: 'pulls',
      filters: (filters && JSON.stringify(filters)) || '[]',
    });
  });
};
const _saveSharedFilters = function (app, req, res) {
  app.models.Configuration.setSharedImportFilters(req.body.filters, (err, filters) => {
    if (err) {
      res.status(500).send({ status: 'ko', error: err.message });
      return;
    }
    res.status(200).send({ status: 'ok', filters });
  });
};

/*
 * Test import filters syntax
 */

const _testFilter = function (app, req, res) {
  const filter = req.body.filter || req.query.filter;
  if (!filter) {
    res.status(500).send({ status: 'ok' });
    return;
  } // error: 'Filter missing'
  try {
    optionsParser.parseRowsFilter(filter, null, true, true);
    res.status(200).send({ status: 'ok' });
  } catch (err) {
    res.status(400).send({ status: 'ko', error: err.message });
  }
};

module.exports = {
  indexSharedFilters: _indexSharedFilters,
  saveSharedFilters: _saveSharedFilters,
  testFilter: _testFilter,
};
