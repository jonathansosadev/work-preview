const _ = require('underscore');
const debug = require('debug')('garagescore:common:models:public-score'); // eslint-disable-line max-len,no-unused-vars
const gsPublicScore = require('../lib/garagescore/public-score');
const gsPublicScoreType = require('./public-score.type');
const util = require('util');
const dataTypes = require('./data/type/data-types');
const sizeof = require('object-sizeof');

module.exports = function PublicScoreDefinition(PublicScore) {
  // eslint-disable-line no-unused-vars
  /*
   * Static Methods
   */
  PublicScore.synthesizeFromDatas = function synthesizeFromDatas(publicScoreType, datas) {
    // eslint-disable-line no-param-reassign
    if (datas.length === 0) {
      return null;
    }
    debug(
      `[synthesizeFromDatas] ## Size: ${Math.round((sizeof(datas) / (1024 * 1024)) * 10) / 10} MB for ${
        datas.length
      } datas`
    );
    /*
     * Synthesize Public Score of given type based on given datas.
     * datas is expected to embed a single, consistent garageId.
     */

    // Initialize Public Score to be returned

    const publicScore = {
      type: publicScoreType,
      synthesizedAt: undefined,

      payload: {
        rating: {
          global: {},
          perValue: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 },
          byItem: {},
          byVehicleMake: {},
          byCategories: {},
        },
      },
    };
    let garageId;
    const makes = [];
    const items = [];
    const categories = [];
    let dataProcessed = 0; // we may have data with only one reco, we ignore them, if every data has no review, we dont have a public score
    _.each(datas, (data) => {
      const dataGarageId = data.get('garageId');
      if (!garageId) {
        garageId = dataGarageId;
      } else if (dataGarageId !== garageId) {
        const err = new Error(util.format('`garageId` Type Error'));
        err.status = 403;
        err.statusCode = 403;
        console.error('INCONSISTENT_GARAGE_ID');
        err.code = 'INCONSISTENT_GARAGE_ID';
        throw err;
      }
      // rating
      const rating = data.get('review.rating.value');
      if (typeof rating !== 'undefined' && rating !== null) {
        dataProcessed++;
        if (typeof publicScore.payload.rating.global.respondentsCount === 'undefined') {
          publicScore.payload.rating.global.respondentsCount = 0;
        }
        publicScore.payload.rating.global.respondentsCount++;
        if (typeof publicScore.payload.rating.global.value === 'undefined') {
          publicScore.payload.rating.global.value = 0;
        }
        publicScore.payload.rating.global.value += rating;
        publicScore.payload.rating.perValue[Math.round(rating)]++;
        // rating by make
        const make = data.get('vehicle.make.value');
        if (make) {
          if (!publicScore.payload.rating.byVehicleMake[make]) {
            makes.push(make);
            publicScore.payload.rating.byVehicleMake[make] = { respondentsCount: 0, value: 0 };
          }
          publicScore.payload.rating.byVehicleMake[make].respondentsCount++;
          publicScore.payload.rating.byVehicleMake[make].value += rating;
        }
        // rating by items
        const subRatings = data.get('review.subRatings') || [];
        subRatings.forEach((subRating) => {
          const item = subRating.label;
          const itemValue = subRating.value;
          if (!publicScore.payload.rating.byItem[item]) {
            items.push(item);
            publicScore.payload.rating.byItem[item] = { respondentsCount: 0, value: 0 };
          }
          publicScore.payload.rating.byItem[item].respondentsCount++;
          publicScore.payload.rating.byItem[item].value += itemValue;
        });
        // rating by categories (type of maintenances)
        let serviceCategories = data.get('service.categories') || [];
        if (!Array.isArray(serviceCategories)) {
          serviceCategories = serviceCategories.split(','); // hacky but loopback seems to give us a string instead of an array
        }
        serviceCategories.forEach((category) => {
          if (!publicScore.payload.rating.byCategories[category]) {
            categories.push(category);
            publicScore.payload.rating.byCategories[category] = { respondentsCount: 0, value: 0 };
          }
          publicScore.payload.rating.byCategories[category].respondentsCount++;
          publicScore.payload.rating.byCategories[category].value += rating;
        });
      }
    });
    if (dataProcessed === 0) {
      return null;
    }
    // rating: replace total value by mean
    if (typeof publicScore.payload.rating.global.respondentsCount !== 'undefined') {
      publicScore.payload.rating.global.value = parseFloat(
        publicScore.payload.rating.global.value / publicScore.payload.rating.global.respondentsCount,
        10
      );
    }
    // makes: replace total value by mean
    makes.forEach((make) => {
      publicScore.payload.rating.byVehicleMake[make].value = parseFloat(
        publicScore.payload.rating.byVehicleMake[make].value /
          publicScore.payload.rating.byVehicleMake[make].respondentsCount,
        10
      );
    });
    // items: replace total value by mean
    items.forEach((item) => {
      publicScore.payload.rating.byItem[item].value = parseFloat(
        publicScore.payload.rating.byItem[item].value / publicScore.payload.rating.byItem[item].respondentsCount,
        10
      );
    });
    // byCategories: replace total value by mean
    categories.forEach((category) => {
      publicScore.payload.rating.byCategories[category].value = parseFloat(
        publicScore.payload.rating.byCategories[category].value /
          publicScore.payload.rating.byCategories[category].respondentsCount,
        10
      );
    });

    publicScore.synthesizedAt = new Date();

    if (typeof garageId !== 'undefined') {
      publicScore.garageId = garageId;
    }

    // All Done!

    return publicScore;
  };

  PublicScore.createForGarage = function createForGarage(publicScoreType, dataType, garageId, callback) {
    // eslint-disable-line no-param-reassign, max-len
    /*
     * Synthesize Public Score of a given type for a given Garage
     */

    if (!gsPublicScore.isSupportedType(publicScoreType)) {
      const unsupportedPublicScoreTypeError = new Error(
        util.format('Unsupported `publicScoreType` "%s"', publicScoreType)
      );
      unsupportedPublicScoreTypeError.status = 403;
      unsupportedPublicScoreTypeError.statusCode = 403;
      unsupportedPublicScoreTypeError.code = 'UNSUPPORTED_PUBLIC_SCORE_TYPE';
      console.error(unsupportedPublicScoreTypeError);
      callback(unsupportedPublicScoreTypeError);
      return;
    }

    PublicScore.app.models.Garage.findById(garageId, (getGarageByIdErr, garage) => {
      if (getGarageByIdErr) {
        console.error(getGarageByIdErr);
        callback(getGarageByIdErr);
        return;
      }

      PublicScore.app.models.Data.getDatasForScore(garageId, dataType, (errFind, datas) => {
        if (errFind) {
          console.error(errFind);
          callback(errFind);
          return;
        }
        debug('Found %d datas with scores for garageId:%s', datas.length, garageId);

        /*
         * Persist synthesized Public Score to database
         */
        let synt = null;
        try {
          synt = PublicScore.synthesizeFromDatas(publicScoreType, datas);
        } catch (errSynt) {
          console.error(errSynt);
          callback(errSynt);
          return;
        }
        if (!synt) {
          console.error(`Impossible to create a publicScore for ${garageId} ${publicScoreType}`);
          callback();
          return;
        }
        const publicScore = new PublicScore(synt);
        PublicScore.create(publicScore, (createErr, createdPublicScore) => {
          if (createErr) {
            console.error(createErr);
            callback(createErr);
            return;
          }

          debug('Persisted synthesized score: %j', createdPublicScore);

          PublicScore.emitEvent(
            createdPublicScore,
            'create',
            {
              garageId,
              publicScoreId: createdPublicScore.getId().toString(),
              publicScoreType: createdPublicScore.type.toString(),
            },
            (emitEventErr, emittedEvent) => {
              if (emitEventErr) {
                console.error(emitEventErr);
                callback(emitEventErr);
                return;
              }

              debug('Emitted PublicScore event "%s": %j', 'create', emittedEvent);

              callback(null, createdPublicScore);
            }
          );
        });
      });
    });
  };
  /*
   * Synthesize Public Score after a survey update
   */
  PublicScore.updateScore = function updateScore(garageId, dataType, callback) {
    // eslint-disable-line no-param-reassign
    const publicScoreType = dataType; // publicScoreType is the same as dataType

    if (!publicScoreType || !gsPublicScoreType.hasValue(publicScoreType)) {
      // We check if the corresponded one does have the same value
      callback(`Cannot update score, incorrect dataType ${dataType}`);
      return;
    }
    // actually if the survey has been modified, is 'vo' now and was 'vn' before,
    // we just update the score (createForGarage) for 'vn' AND 'vo' both
    // i don't think it is gonna happen often, so we live with it for now
    PublicScore.createForGarage(publicScoreType, dataType, garageId, (createForGarageErr, publicScore) => {
      if (createForGarageErr) {
        callback(createForGarageErr);
        return;
      }
      if (publicScore) {
        debug(
          util.format(
            'Successfully created publicScore.id:%s for garage.id:%s',
            publicScore.getId().toString(),
            garageId
          )
        );
        debug(publicScore);
      }
      callback(null, typeof publicScore !== 'undefined' && publicScore !== null);
    });
  };
};
