const debug = require('debug')('garagescore:server:routes:backoffice:published-reviews'); // eslint-disable-line max-len,no-unused-vars
const async = require('async');
const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;
const gsApprovableRejectedReason = require('../../../common/models/data/type/rejected-reasons');
const rejectedReasons = require('../../../common/models/data/type/moderation-status');
const reviewValidator = require('../../../common/lib/garagescore/data-review/review-validator');
const checkSurveyUdpates = require('../../../common/lib/garagescore/data-campaign/run-schema/check-survey-updates');

/** Reviews TAB */
var _buildRejectedReasonsOptions = function () {
  var reasons = gsApprovableRejectedReason.toJSON();
  var status = rejectedReasons.toJSON();
  var rArray = [];

  var keys = Object.keys(status);
  keys.forEach(function (value) {
    rArray.push({
      text: value,
      value: status[value],
    });
  });

  keys = Object.keys(reasons);
  keys.forEach(function (value) {
    rArray.push({
      text: value,
      value: 'Rejected|' + reasons[value],
    });
  });

  rArray.push({
    text: "::::::::::::SUPPRIMER L'AVIS::::::::::::",
    value: 'DELETE',
  });
  return JSON.stringify(rArray);
};

var _buildStatusOptions = function (status) {
  var reasons = gsApprovableRejectedReason.toJSON();

  var options = '';
  var keys = Object.keys(reasons);
  keys.forEach(function (value) {
    var selected = '';

    if (value === status) {
      selected = 'selected';
    }
    options += '<option ' + selected + ' value="' + value + '">' + value + '</option>';
  });
  return options;
};

var _buildWhere = function (dataId, modelType, garageId, maxScore, shareWithPartners, reviewType, report, status) {
  var where = { 'review.rating.value': { gte: 0 } };
  if (dataId) {
    where._id = new ObjectID(dataId);
    return where;
  }
  if (status) {
    var statusStr = rejectedReasons[status];

    if (statusStr) {
      where['review.comment.status'] = statusStr.toString();
    } else if (statusStr === undefined) {
      statusStr = gsApprovableRejectedReason[status];
      if (statusStr) {
        where['review.comment.rejectedReason'] = statusStr.toString();
      }
    }
  }
  if (report === '1') {
    where['review.comment.isReported'] = true;
  }
  if (maxScore) {
    where['review.rating.value'] = {
      lte: maxScore,
    };
  }
  if (garageId !== null) {
    where.garageId = garageId;
  }
  if (shareWithPartners) {
    where['review.shareWithPartners'] = true;
  }
  if (reviewType !== null) {
    where.type = reviewType;
  }

  if (modelType) {
    if (modelType === 'ExistingPublicComment') {
      where.or = [{ 'review.reply.status': 'Approved' }, { 'review.reply.status': 'Rejected' }];
    }
    if (modelType === 'PendingPublicComment') {
      where['review.reply.status'] = 'Pending';
    }
  }
  return where;
};

// reviews count, returns the count with the filter and only with the garage filter (or without anything if no garage filter)
var _count = function (
  app,
  garages,
  reviewId,
  modelType,
  garageId,
  maxScore,
  shareWithPartners,
  reviewType,
  report,
  status,
  callback
) {
  var query = _buildWhere(reviewId, modelType, garageId, maxScore, shareWithPartners, reviewType, report, status);
  var model = 'Data';
  app.models[model].count(query, function (err1, filteredCount) {
    if (err1) {
      callback(err1);
      return;
    }
    query = { 'review.rating.value': { gte: 0 } };
    if (garageId !== null) {
      query.garageId = garageId;
    }
    app.models[model].count(query, function (err2, totalCount) {
      if (err2) {
        callback(err2);
        return;
      }
      callback(null, totalCount, filteredCount);
    });
  });
};

// list of reviews
var _reviewsList = function (
  app,
  garages,
  reviewId,
  modelType,
  garageId,
  maxScore,
  shareWithPartners,
  reviewType,
  report,
  status,
  skip,
  callback
) {
  var query = {};
  query.where = _buildWhere(reviewId, modelType, garageId, maxScore, shareWithPartners, reviewType, report, status);
  query.limit = 25;
  query.order = 'review.createdAt DESC';
  query.skip = skip;
  debug(query);
  var model = 'Data';
  app.models[model].find(query, function (findErr, datas) {
    if (findErr) {
      callback(findErr);
      return;
    }
    var cleanedReviews = [];
    var computeCompositeStatus = function (rstatus, rejectedReason) {
      var compositeStatus = rstatus;
      if (rejectedReason) {
        compositeStatus += '|' + rejectedReason;
      }
      return compositeStatus;
    };
    async.forEachOfSeries(
      datas,
      function (data, i, next) {
        var publicName = data.get('customer.fullName');

        var r = {};
        r.type = data.type;
        r.id = data.id;
        r.authorPublicDisplayName = publicName;
        r.author = publicName;
        r.createdAt = moment(data.get('review.createdAt')).calendar();

        if (data.get('review.sharedWithPartnersAt')) {
          r.sharedWithPartnersAt = moment(data.get('review.sharedWithPartnersAt')).calendar();
        }

        r.comment = data.get('review.comment.text');
        if (!r.comment) {
          r.isEmptyComment = true;
        }
        r.status = data.get('review.comment.status');
        r.compositeStatus = computeCompositeStatus(
          data.get('review.comment.status') || 'Rejected',
          data.get('review.comment.status') ? data.get('review.comment.rejectedReason') : 'tooShort'
        );
        r.score = data.get('review.rating.value');
        r.shareWithPartners = data.get('review.shareWithPartners') || false;

        r.moderation = data.get('review.comment.moderated');
        r.garage = garages[data.garageId];

        var reply = data.get('review.reply.text');
        if (reply) {
          r.reply = reply;
          r.replyCompositeStatus = computeCompositeStatus(
            data.get('review.reply.status'),
            data.get('review.reply.rejectedReason')
          );
        }

        r.suggestedStatus = {
          approvableStatus: data.get('review.comment.status'),
        };
        r.ip = data.get('survey.lastRespondentIP');
        r.fingerPrint = data.get('survey.lastRespondentFingerPrint');
        cleanedReviews.push(r);
        next();
        return;
      },
      function (forEachOfSeriesErr) {
        callback(forEachOfSeriesErr, cleanedReviews);
      }
    );
  });
};

var index = function (app, req, res) {
  try {
    app.models.Garage.find({ fields: { id: true, publicDisplayName: true } }, function (err, garageModelInstances) {
      var garages = {};
      garageModelInstances.map(function (garage) {
        garages[garage.id] = garage.publicDisplayName;
        return null;
      });
      var dataId = typeof req.query.dataId !== 'undefined' ? req.query.dataId : null;
      var garageId = typeof req.query.garageId !== 'undefined' ? req.query.garageId : null;
      var maxScore =
        typeof req.query.maxScore !== 'undefined' && !isNaN(req.query.maxScore)
          ? parseInt(req.query.maxScore, 10)
          : null;
      var shareWithPartners = typeof req.query.shareWithPartners !== 'undefined' ? req.query.shareWithPartners : null;
      var reviewType = typeof req.query.reviewType !== 'undefined' ? req.query.reviewType : null;
      var report = typeof req.query.report !== 'undefined' ? req.query.report : null;
      var status = typeof req.query.status !== 'undefined' ? req.query.status : null;
      var modelType = typeof req.query.modelType !== 'undefined' ? req.query.modelType : null;
      var skip = typeof req.query.skip !== 'undefined' ? req.query.skip : 0;

      _count(
        app,
        garages,
        dataId,
        modelType,
        garageId,
        maxScore,
        shareWithPartners,
        reviewType,
        report,
        status,
        function (errCount, totalCount, filteredCount) {
          // eslint-disable-line max-len
          if (errCount) {
            console.error(errCount);
            res.status(500).send('Error');
            return;
          }
          _reviewsList(
            app,
            garages,
            dataId,
            modelType,
            garageId,
            maxScore,
            shareWithPartners,
            reviewType,
            report,
            status,
            skip,
            function (errReviews, reviews) {
              // eslint-disable-line max-len
              if (errReviews) {
                console.error(errReviews);
                res.status(500).send('Error');
                return;
              }
              var urlWithoutSkip = req.originalUrl.replace(/(\?.*)&?skip=[0-9]+/, '$1');
              if (urlWithoutSkip.indexOf('?') < 0) urlWithoutSkip += '?';
              res.render('darkbo/darkbo-reviews/public-reviews', {
                current_tab: 'public-reviews',
                reviews: JSON.stringify(reviews),
                garages: garages,
                garageId: garageId,
                reviewType: reviewType,
                modelType: modelType,
                maxScore: maxScore,
                report: report,
                status: status,
                skip: parseInt(skip, 10),
                totalCount: totalCount,
                filteredCount: filteredCount,
                shareWithPartners: shareWithPartners,
                reviewsPerPage: 25,
                gsApprovableStatus: JSON.stringify(rejectedReasons),
                gsApprovableRejectedReason: JSON.stringify(gsApprovableRejectedReason),
                gsApprovableStatusO: rejectedReasons,
                gsApprovableRejectedReasonO: gsApprovableRejectedReason,
                rejectedReasonsFilter: _buildRejectedReasonsOptions(),
                filterStatusOptions: _buildStatusOptions(status),
                pathPrev: urlWithoutSkip + '&skip=' + (parseInt(skip, 10) - 25),
                pathNext: urlWithoutSkip + '&skip=' + (parseInt(skip, 10) + 25),
              });
            }
          );
        }
      );
    });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
    return;
  }
};
var moderate = function (app, req, res) {
  var cb = function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('{ "status": "ko" }');
      return;
    }
    res.send('{ "status": "ok" }');
  };
  if (req.body.reviewId && req.body.moderation) {
    app.models.Data.findById(req.body.reviewId, function (err, data) {
      if (err) {
        cb(err);
        return;
      }
      if (!data) {
        cb(new Error('Unknown DataId ' + req.body.reviewId));
        return;
      }

      if (data.get('review.sharedWithPartnersAt')) {
        data.set('review.sharedWithPartnersAt', new Date());
      }

      if (!data.get('review.comment')) data.review.comment = {};
      data.review.comment.moderated = req.body.moderation; // eslint-disable-line
      data.save(cb);
    });
  } else {
    cb(new Error('Not enough parameters to moderate'));
  }
};

var update = function (app, req, res) {
  var cb = function (err) {
    if (err) {
      console.error(err);
      res.status(500).send('{ "status": "ko" }');
      return;
    }
    res.send('{ "status": "ok" }');
  };

  var reviewId = req.body.reviewId;

  var action = req.body.action;

  if (action && reviewId) {
    app.models.Data.findById(reviewId, function (err, result) {
      var actions = {};

      actions.updateShareWithPartner = function (params) {
        var data = params.data;
        data.set('review.sharedWithPartnersAt', new Date());
        data.set('review.shareWithPartners', params.shareWithPartners);
        data.save(cb);
      };
      actions.updateScore = function (params) {
        var data = params.data;
        data.review.rating.value = params.score;
        data.save(function (e) {
          if (e) {
            cb(e);
            return;
          }
          app.models.PublicScore.updateScore(data.garageId, data.type, () => {
            checkSurveyUdpates(data, cb);
          });
        });
      };
      actions.updateStatus = function (params) {
        if (params.compositeStatus) {
          var compositeStatus = params.compositeStatus.split('|');
          var data = params.data;
          var status = compositeStatus[0];
          var reason = compositeStatus[1];

          if (status !== rejectedReasons.APPROVED) {
            data.set('review.shareWithPartners', false);
          }

          data.set('review.comment.status', status);
          data.set('review.comment.rejectedReason', reason);
          data.save(cb);
        } else {
          cb(new Error('Not enough parameters to update'));
        }
      };
      actions.updateReplyStatus = function (params) {
        if (params.compositeStatus) {
          var compositeStatus = params.compositeStatus.split('|');
          var data = params.data;

          var status = compositeStatus[0];
          var reason = compositeStatus[1];

          data.set('review.reply.status', status);
          data.set('review.reply.rejectedReason', reason);
          data.save(cb);
        } else {
          cb(new Error('Not enough parameters to update'));
        }
      };

      var params = {};
      params = req.body;
      params.data = result;

      if (params.data.get('review.sharedWithPartnersAt')) {
        params.data.set('review.sharedWithPartnersAt', new Date());
      }

      if (actions[action] && result && !err) {
        actions[action](params);
      } else {
        cb(new Error('Action unhandled.'));
      }
    });
  } else {
    cb(new Error('Not enough parameters to update'));
  }
};
var testModeration = function (app, req, res) {
  res.render('darkbo/darkbo-reviews/test-moderation', {
    current_tab: 'public-reviews',
  });
};
var testModerationSendTest = function (app, req, res) {
  var review = req.body.review;
  reviewValidator
    .shouldApprove(review)
    .then(function (json) {
      res.status(200).send(json);
    })
    .catch(function (err) {
      res.status(500).send(err.message);
    });
};

var censoredWords = function (app, req, res) {
  app.models.CensoredWords.getAllCachedCensoredWords(function (err, dictionaries) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.json(dictionaries);
  });
};

var updateCensoredWords = function (app, req, res) {
  var censoredWordsId = req.params.censoredWordsId;
  var words = req.body.words;
  if (!censoredWordsId || !words) {
    res.send(500, 'No censoredWordsId or words given');
    return;
  }
  app.models.CensoredWords.findByIdAndUpdateAttributes(censoredWordsId, { words: words }, function (err) {
    if (err) {
      res.send(500, err);
      return;
    }
    app.models.CensoredWords.updateAllCachedCensoredWords(function (errCached) {
      if (errCached) {
        res.send(500, errCached);
        return;
      }
      res.json({ status: 'ok', message: 'CensoredWords list has been updated' });
    });
  });
};

module.exports = {
  // /backoffice/public-reviews
  index: index,
  // /backoffice/public-reviews/update
  update: update,
  // /backoffice/public-reviews/moderate
  moderate: moderate,
  testModeration: testModeration,
  testModerationSendTest: testModerationSendTest,
  censoredWords: censoredWords,
  updateCensoredWords: updateCensoredWords,
};
