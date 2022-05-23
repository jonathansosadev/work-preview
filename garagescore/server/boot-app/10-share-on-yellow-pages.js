'use strict';

var decrypt = require('../../common/lib/util/public-link-encrypted-id').decrypt;
var gsClient = require('../../common/lib/garagescore/client');
var async = require('async');

var yellowPageUrl = gsClient.url.getUrlNamespace('YELLOW_PAGE');

module.exports = function shareYellowPage(app) {
  app.get(yellowPageUrl.BASE, function (req, res) {
    res.status(400).send('');
  });

  app.get(yellowPageUrl.SHARE, function (req, res) {
    var decryptedId = decrypt(req.params.id);
    var Data = app.models.Data;
    var Garage = app.models.Garage;
    var garage;

    var sendVoidTemplate = function () {
      res.render('yellow-pages/share/index.nunjucks', {
        garageName: '',
        error: true,
        garageUrl: '',
        garageSlug: '',
      });
    };

    try {
      if (decryptedId) {
        async.auto(
          {
            getReview: function (next) {
              Data.findById(decryptedId, function (err, _Data) {
                if (err) {
                  console.error(err);
                  sendVoidTemplate();
                } else if (!_Data) {
                  console.error(new Error('No data found ' + decryptedId));
                  sendVoidTemplate();
                } else {
                  Data = _Data;
                  next();
                }
              });
            },

            getGarage: [
              'getReview',
              function (next) {
                Garage.findById(Data.garageId, function (err, _garage) {
                  if (err) {
                    console.error(err);
                    sendVoidTemplate();
                  } else {
                    garage = _garage;
                    next();
                  }
                });
              },
            ],

            saveReview: [
              'getGarage',
              function (next) {
                Data.set('review.shareWithPartners', true);
                Data.set('review.sharedWithPartnersAt', Date.now());
                Data.save(function (error) {
                  if (error) {
                    console.error(error);
                    sendVoidTemplate();
                    next(error);
                  } else {
                    res.render('yellow-pages/share/index.nunjucks', {
                      garageName: garage.publicDisplayName,
                      error: false,
                      garageUrl: '/garage/' + garage.slug + '?nocache=true',
                      garageSlug: garage.slug,
                    });
                    next();
                  }
                });
              },
            ],
          },
          function (err) {
            if (err) {
              console.error(err);
            }
          }
        );
      } else {
        sendVoidTemplate();
      }
    } catch (err) {
      console.error(err);
      sendVoidTemplate();
    }
  });
};
