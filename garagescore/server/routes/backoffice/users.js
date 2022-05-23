const async = require('async');
const momentTz = require('moment-timezone');
const { ObjectId } = require('mongodb');

const GarageSubscriptionTypes = require('../../../common/models/garage.subscription.type.js');
const { getUserGarages } = require('../../../common/models/user/user-mongo');
const { isSubscribed } = require('../../../common/models/garage/garage-methods');
const GodMode = require('../../../common/lib/garagescore/api/god-mode');

const areaList = require('../../../common/lib/garagescore/country/area.json');
/* order for export alerts */
const allGarageAlertsOrder = [
  'UnsatisfiedVI',
  'UnsatisfiedMaintenance',
  'UnsatisfiedVn',
  'UnsatisfiedVo',
  'LeadVn',
  'LeadVo',
];
const orderConfigs = ['daily', 'weekly', 'monthly', 'monthlySummary'];
const orderConfigKeys = [
  'UnsatisfiedVI',
  'unsatisfiedApv',
  'unsatisfiedVn',
  'unsatisfiedVo',
  'leadVn',
  'leadVo',
  'contactsApv',
  'contactsVn',
  'contactsVo',
  'contactsVI',
];

/** Manage users */

// edit a user
function _index(app, req, res) {
  try {
    res.render('darkbo/darkbo-users/users');
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
}
/**
 * assign area for bizdev
 * @param {*} user user object
 */
function _assignArea(user) {
  const gsUser = user;
  if (/garagescore\.com|custeed\.com/.test(gsUser.email)) {
    let france = [];
    let belgium = [];
    let spain = [];
    let netherlands = [];
    // retrieve assign area on bizdev
    if (gsUser.area && gsUser.isBizDev) {
      france = france.concat(gsUser.area.france);
      belgium = belgium.concat(gsUser.area.belgium);
      spain = spain.concat(gsUser.area.spain);
      netherlands = netherlands.concat(gsUser.area.netherlands);
    }
    // assign department without bizdev
    if (!gsUser.area) {
      gsUser.area = { france: [], belgium: [], spain: [], netherlands: [] };
    }
    gsUser.notAssign = {
      france: areaList.france.filter((e) => !france.some((item) => item.name === e.name)),
      belgium: areaList.belgium.filter((e) => !belgium.some((item) => item.name === e.name)),
      spain: areaList.spain.filter((e) => !spain.some((item) => item.name === e.name)),
      netherlands: areaList.netherlands.filter((e) => !netherlands.some((item) => item.name === e.name)),
    };
  }

  return gsUser;
}
/**
 * Anonymize the user by removing all access.['ip', 'userAgent']
 * @param app
 * @param req
 * @param res
 * @private
 */
const _anonymize = function _anonymize(app, req, res) {
  const userId = req.body.id || req.params.id;
  const anonymizedField = ['ip', 'userAgent'];
  if (userId) {
    app.models.User.findById(userId, (err, user) => {
      if (err) {
        res.status(403).send(err.toString());
        return;
      }
      user.accessHistory = user.accessHistory.map((access) => {
        // eslint-disable-line
        const anonymizedAccess = access;
        anonymizedField.forEach((field) => {
          anonymizedAccess[field] = '';
        });
        return anonymizedAccess;
      });
      user.save((errSave) => {
        if (errSave) {
          res.status(403).send(errSave.toString());
          return;
        }
        res.json({ status: 'OK', message: 'user access updated' });
      });
    });
  } else {
    res.status(400).json({ status: 'KO', message: 'userId not found' });
  }
};

/**
 * Edit a user
 * Before entering, please beware of Uranus.
 * ha ben bravo Simon
 */
const _edit = async (app, req, res) => {
  try {
    const User = app.models.User;
    const returnUserByInstance = (err, userInstance) => {
      if (err) {
        res.status(500).send({ status: 'ko', error: err.message });
      } else {
        res.send({ status: 'ok', user: userInstance });
      }
    };

    /* ---------------------------------------------------------------------------- */

    // update user attributes
    const updateUser = (userId, data, updateCB) => {
      User.findOne({ where: { id: userId } }, (err, user) => {
        if (err) {
          res.status(500).send({ status: 'ko', error: err.message });
          return;
        }
        user.updateAttributes(data, (errUpdate) => {
          if (errUpdate) {
            updateCB(errUpdate);
          } else {
            User.findOne({ where: { id: userId } }, updateCB);
          }
        });
      });
    };

    // update an user password
    const updatePassword = () => {
      const userId = req.body.user_id;
      const newPassword = req.body.new_password;
      if (!userId) {
        res.status(400).send({ status: 'ko', error: 'no user_id provided' });
        return;
      }
      if (!newPassword) {
        res.status(400).send({ status: 'ko', error: 'no new_password provided' });
        return;
      }
      updateUser(userId, { password: newPassword }, returnUserByInstance);
    };

    /* ---------------------------------------------------------------------------- */
    // update an user godmode
    const updateGodMode = () => {
      const userId = req.body.user_id;
      const godMode = !!req.body.godMode;
      if (!userId) {
        res.status(400).send({ status: 'ko', error: 'no user_id provided' });
        return;
      }
      updateUser(userId, { godMode }, returnUserByInstance);
      GodMode.refreshGodsList();
    };
    // update an user auth
    const updateAuthorization = () => {
      const userId = req.body.user_id;
      const authorization = req.body.authorization;
      if (!userId) {
        res.status(400).send({ status: 'ko', error: 'no user_id provided' });
        return;
      }
      updateUser(userId, { authorization }, returnUserByInstance);
    };
    /* ---------------------------------------------------------------------------- */

    const command = req.params.command;
    if (command === 'password') {
      updatePassword();
      return;
    } else if (command === 'godMode') {
      updateGodMode();
      return;
    } else if (command === 'authorization') {
      updateAuthorization();
      return;
    }
    res.status(404).send('Page not found');
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};

const _searchUser = (app, req, res) => {
  if (!req.query.token) {
    res.status(403).send('No token !');
    return;
  }
  const matchRegexp = req.query.token ? new RegExp(req.query.token.split('').join('\\s*'), 'i') : null;
  app.models.User.find(
    {
      where: {
        or: [
          { firstName: { regexp: matchRegexp } },
          { lastName: { regexp: matchRegexp } },
          { email: { regexp: matchRegexp } },
        ],
      },
      fields: { id: true, email: true, firstName: true, lastName: true },
    },
    (err, users) => {
      if (err) {
        res.status(403).send(err.toString());
        return;
      }
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(users));
    }
  );
};

const _replaceSemicolon = (string) => {
  if (!string) {
    return '';
  }
  return string.replace(/[;"']/g, ' ');
};

function _formatGaragesAlert(alerts) {
  return allGarageAlertsOrder.map((key) => (alerts && alerts[key] ? 'Oui;' : 'Non;')).join('');
}
function _formatReportConfigs(configs) {
  return orderConfigs
    .map((order) => {
      if (configs && configs[order] && configs[order].enable) {
        const configUser = configs[order];
        return orderConfigKeys.map((key) => (configUser[key] ? 'Oui;' : 'Non;')).join('');
      }
      return orderConfigKeys.map(() => 'Non;').join('');
    })
    .join('');
}

const _formatAlerts = (user) => {
  return _formatGaragesAlert(user.allGaragesAlerts) + _formatReportConfigs(user.reportConfigs);
};

const _fromUsersListToCsv = (users) => {
  let m = null;
  let line = '';
  let c = null;
  let output =
    '\ufeffId;Email;Nombre de garages;Garages;Accès au darkbo;Accès au greybo;' +
    'Accès à Cockpit;Accès à Admin;Accès à Analytics;Accès a Accueil;' +
    'Gestion de widgets;' +
    'Civilité;Nom complet;Prenom;Nom;Téléphone;Téléphone portable;Fax;Entreprise;' +
    'Adresse;Code postal;Ville;Adresse 2;Métier;Dernière connexion à cockpit;Date de création;';
  output += `${allGarageAlertsOrder.join(';')};`;

  orderConfigs.forEach((orderConf) => {
    orderConfigKeys.forEach((orderConfigKey) => {
      output += `${orderConf} ${orderConfigKey};`;
    });
  });

  output += '\r';

  for (let i = 0; i < users.length; ++i) {
    const user = users[i];
    line += (user._id.toString() || '') + ';';
    line += (user.email || '') + ';';
    line += (user.garages ? user.garages.length : '0') + ';';
    for (let j = 0; j < user.garages.length; ++j) {
      const g = user.garages[j];

      line += ((g && g.publicDisplayName && g.publicDisplayName.replace(';', '')) || '') + '|';
    }

    line += ';' + (user.authorization.ACCESS_TO_DARKBO ? 'Oui' : 'Non') + ';';
    line += (user.authorization.ACCESS_TO_GREYBO ? 'Oui' : 'Non') + ';';
    line += (user.authorization.ACCESS_TO_COCKPIT ? 'Oui' : 'Non') + ';';
    line += (user.authorization.ACCESS_TO_ADMIN ? 'Oui' : 'Non') + ';';
    line += (user.authorization.ACCESS_TO_ESTABLISHMENT ? 'Oui' : 'Non') + ';';
    line += (user.authorization.ACCESS_TO_TEAM ? 'Oui' : 'Non') + ';';
    line += (user.authorization.ACCESS_TO_WELCOME ? 'Oui' : 'Non') + ';';
    line += (user.authorization.WIDGET_MANAGEMENT ? 'Oui' : 'Non') + ';';
    line += (_replaceSemicolon(user.civility) || '') + ';';
    line += (_replaceSemicolon(user.fullName) || '') + ';';
    line += (_replaceSemicolon(user.firstName) || '') + ';';
    line += (_replaceSemicolon(user.lastName) || '') + ';';
    line += (_replaceSemicolon(user.phone) || '').replace('+', "'+") + ';';
    line += (_replaceSemicolon(user.mobilePhone) || '').replace('+', "'+") + ';';
    line += (_replaceSemicolon(user.fax) || '').replace('+', "'+") + ';';
    line += (_replaceSemicolon(user.businessName) || '') + ';';
    line += (_replaceSemicolon(user.address) || '') + ';';
    line += (_replaceSemicolon(user.postCode) || '') + ';';
    line += (_replaceSemicolon(user.city) || '') + ';';
    line += (_replaceSemicolon(user.postalAddress) || '') + ';';
    line += (_replaceSemicolon(user.job) || '') + ';';
    if (user.lastCockpitOpenAt) {
      m = momentTz(user.lastCockpitOpenAt).tz('Europe/Paris');
      line += m.date() + '/' + (m.month() + 1) + '/' + m.year() + ';';
    } else {
      line += ';';
    }
    if (user.createdAt) {
      c = momentTz(user.createdAt).tz('Europe/Paris');
      line += c.date() + '/' + (c.month() + 1) + '/' + c.year() + ';';
    } else {
      line += ';';
    }

    line += `${_formatAlerts(user)}`;

    output += `${line}\r`;
    line = '';
  }
  return output;
};

const getGaragesNames = (garageObj, garageIds) => {
  return garageIds.map((id) => {
    return { id: id, publicDisplayName: garageObj[id] };
  });
};

const _usersList = async (app, req, res) => {
  const startTime = Date.now();
  const uFields = {
    garageIds: true,
    email: true,
    fullName: true,
    civility: true,
    phone: true,
    mobilePhone: true,
    address: true,
    postCode: true,
    businessName: true,
    city: true,
    job: true,
    fax: true,
    lastName: true,
    firstName: true,
    postalAddress: true,
    lastCockpitOpenAt: true,
    authorization: true,
    createdAt: true,
    allGaragesAlerts: true,
    reportConfigs: true,
  };
  const gFields = {
    publicDisplayName: true,
  };

  const mongoUser = app.models.User.getMongoConnector();
  const mongoGarage = app.models.Garage.getMongoConnector();
  const [allUsers, allGarages] = await Promise.all([
    await mongoUser
      .find({ email: { $not: /@garagescore|@custeed/ } })
      .project(uFields)
      .toArray(),
    await mongoGarage.find({}).project(gFields).toArray(),
  ]);

  const allGaragesObj = {};
  for (const garage of allGarages) {
    allGaragesObj[garage._id.toString()] = garage.publicDisplayName;
  }

  const userEmailMapping = {};
  allUsers.forEach((u) => {
    userEmailMapping[u._id.toString()] = u.email;
  });

  const usersToSend = allUsers.map((user) => {
    user.garages = getGaragesNames(allGaragesObj, user.garageIds);
    return user;
  });

  console.log(`19880411 process spend time : ${Date.now() - startTime}`);
  res.set('Content-Disposition', 'attachment; filename="export-users.csv"');
  res.end(_fromUsersListToCsv(usersToSend), 'utf-8');
};

const _jsonUsersList = (app, req, res) => {
  app.models.User.find({}, (err, users) => {
    if (err) {
      res.status(403).send(err.toString());
      return;
    }
    res.json(users);
  });
};

const _allUsers = async (app, req, res) => {
  try {
    const fields = {
      id: 1,
      email: 1,
    };
    const users = await app.models.User.find({ fields });
    res.json(users);
  } catch (err) {
    res.status(403).send(err.toString());
  }
};

const _getOneUser = async (app, req, res) => {
  try {
    if (!req.params.id) {
      res.status(403).send('No id !');
      return;
    }
    let user = await app.models.User.findById(req.params.id);
    user = _assignArea(user);
    res.json(user);
  } catch (err) {
    res.status(403).send(err.toString());
    return;
  }
};

const _getById = (app, req, res) => {
  if (!req.params.id) {
    res.status(403).send('No id !');
    return;
  }
  app.models.User.findById(req.params.id, (err, user) => {
    if (err || !user) {
      res.status(403).send(err ? err.toString() : 'User not found');
      return;
    }
    res.status(200).setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(app.models.User.getReducedFormat(user)));
  });
};

const __garagesGenerator = (app, req, res, user) => {
  if (!user) {
    res.status(403).send('user not found !');
    return;
  }
  const filterObj = req.query.filter ? JSON.parse(req.query.filter) : {};
  const { limit, skip } = filterObj;
  async.auto(
    {
      allGarages(cb) {
        const fields = {
          _id: true,
          publicDisplayName: true,
          subscriptions: true,
          usersQuota: true,
          slug: true,
          links: true,
        };
        const additionalStages = [
          { $sort: { publicDisplayName: 1 } },
          ...(skip ? [{ $skip: skip }] : []),
          ...(limit ? [{ $limit: limit }] : []),
          { $addFields: { id: { $toString: '$_id' } } },
          { $project: { _id: false } },
        ];
        getUserGarages(app, user.getId(), fields, additionalStages)
          .then((garages) => {
            cb(null, garages);
          })
          .catch((err) => {
            cb(err);
          });
      },
      garages: [
        'allGarages',
        (cb, result) => {
          const res = result.allGarages.map(({ id, publicDisplayName, usersQuota, slug, links }) => ({
            id,
            publicDisplayName,
            usersQuota,
            slug,
            links,
          }));
          cb(null, res);
        },
      ],
      returnedGarages: [
        'garages',
        (cb, result) => {
          async.mapSeries(
            result.garages,
            (g, cb2) => {
              app.models.Garage.countReallySubscribedUsers(g.id)
                .then((count) => {
                  g.countAllSubscribedUsers = count; // eslint-disable-line no-param-reassign
                  cb2(null, g);
                })
                .catch((err2) => {
                  cb(err2);
                });
            },
            cb
          );
        },
      ],
    },
    (err, { returnedGarages, allGarages }) => {
      if (err) {
        res.status(403).send(err.toString());
        return;
      }
      res.status(200).setHeader('Content-Type', 'application/json');
      res.send(
        JSON.stringify({
          limit,
          skip,
          garages: returnedGarages,
          total: allGarages.length,
          hasMaintenanceAtLeast: allGarages.some((g) =>
            isSubscribed(g.subscriptions, GarageSubscriptionTypes.MAINTENANCE)
          ),
          hasVnAtLeast: allGarages.some((g) => isSubscribed(g.subscriptions, GarageSubscriptionTypes.NEW_VEHICLE_SALE)),
          hasVoAtLeast: allGarages.some((g) =>
            isSubscribed(g.subscriptions, GarageSubscriptionTypes.USED_VEHICLE_SALE)
          ),
          hasViAtLeast: allGarages.some((g) =>
            isSubscribed(g.subscriptions, GarageSubscriptionTypes.VEHICLE_INSPECTION)
          ),
          hasLeadAtLeast: allGarages.some((g) => isSubscribed(g.subscriptions, GarageSubscriptionTypes.LEAD)),
          hasEReputationAtLeast: allGarages.some((g) =>
            isSubscribed(g.subscriptions, GarageSubscriptionTypes.E_REPUTATION)
          ),
        })
      );
    }
  );
};

const _getGarages = (app, req, res) => {
  if (!req.params.id) {
    res.status(403).send('No id !');
    return;
  }
  try {
    app.models.User.findById(req.params.id, (err, user) => {
      if (err || !user) {
        res.status(403).send(err || 'user not found!');
        return;
      }
      __garagesGenerator(app, req, res, user);
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
};

module.exports = {
  // POST /backoffice/users/edit/:command
  edit: _edit,
  // POST /backoffice/users/anonymize/:id
  anonymize: _anonymize,
  // GET /backoffice/users
  index: _index,
  // GET /backoffice/users_list.txt
  usersList: _usersList,
  // GET /backoffice/users/list
  jsonUsersList: _jsonUsersList,
  // GET /backoffice/users/all
  allUsers: _allUsers,
  // GET /backoffice/oneuser/:id
  getOneUser: _getOneUser,
  // GET /backoffice/user/:id
  findById: _getById,
  // GET /backoffice/users/search
  searchUser: _searchUser,
  // GET /user/garages/:id
  getGarages: _getGarages,
};
