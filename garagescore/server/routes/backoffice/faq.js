var faq = function (page) {
  return function (app, req, res) {
    res.render('darkbo/darkbo-faq/' + page, {
      current_tab: 'faq',
    });
  };
};
module.exports = {
  // GET /backoffice/faq/surveys
  surveys: faq('surveys'),
  // PUT /backoffice/alerts
  alerts: faq('alerts'),
  // /backoffice/garage/reports
  reports: faq('reports'),
  // /backoffice/garage/api
  api: faq('api'),
  // /backoffice/garage/www
  widget: faq('widget'),
  // /backoffice/garage/www
  www: faq('www'),
  // /backoffice/garage/admin
  admin: faq('admin'),
};
