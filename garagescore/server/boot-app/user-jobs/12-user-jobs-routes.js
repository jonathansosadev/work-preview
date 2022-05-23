const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const gsUrls = require('../../../common/lib/garagescore/urls');
const userJobsCtrl = require('./12-user-jobs-controller');
const GarageTypes = require('../../../common/models/garage.type.js');

class UserJobsRoutes {
  constructor(app) {
    this._policy = ensureLoggedIn(gsUrls.getUrl('AUTH_SIGNIN'));
    this._gsPolicy = (req, res, next) => {
      if (req.user.email.match(/@garagescore\.com|@custeed\.com/)) {
        next();
        return;
      }
      res.status(403).send('');
    };
    this._baseUrl = gsUrls.getUrlNamespace('USER_JOBS');
    this._ctrl = userJobsCtrl;

    this._start(app);
  }

  _start(app) {
    // Jaubz
    app.get(this._baseUrl.GET_ALL, this._policy, this._ctrl.getAllUserJobs.bind(this._ctrl, app));
    app.post(this._baseUrl.SAVE, this._policy, this._gsPolicy, this._ctrl.saveUserJobs.bind(this._ctrl, app));
    app.delete(this._baseUrl.DELETE, this._policy, this._gsPolicy, this._ctrl.deleteUserJobs.bind(this._ctrl, app));

    // Front-end
    app.get(this._baseUrl.FRONT_END, this._policy, (req, res) => {
      app.models.UserJob.find({}, (err, userJobs) => {
        if (err) {
          res.send(err);
          return;
        }
        res.render('darkbo/darkbo-users/user-jobs', {
          current_tab: 'userJobs',
          userJobs: JSON.stringify(userJobs),
          user: req.user,
          GarageTypes: JSON.stringify(GarageTypes.translations()),
        });
      });
    });
  }
}

module.exports = (app) => new UserJobsRoutes(app);
