/**
 * Warning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * must be migrated to graphql
 * Warning !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
const xlsCache = require('../../common/lib/util/xlsCache.js');

module.exports = {
  downloadXLS(app, req, res) {
    if (!req.params.dowloadKey) {
      res.status(404).send('missing downloadKey');
      return;
    }
    if (!xlsCache.has(parseInt(req.params.dowloadKey, 10))) {
      res.status(404).send('file not found in server retry your download');
      return;
    }
    res.status(200).setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('charset', 'utf-8');
    xlsCache.get(parseInt(req.params.dowloadKey, 10)).xlsx.write(res);
  },
};
