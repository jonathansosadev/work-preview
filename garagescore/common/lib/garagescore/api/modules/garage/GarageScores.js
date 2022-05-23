const GsApiInterface = require('./GsApiInterface');
const { ServiceCategories } = require('../../../../../../frontend/utils/enumV2');
const subratingLabels = require('../../../../../models/data/type/subrating-labels');
const gsPublicScoreType = require('../../../../../models/public-score.type');
const moderationStatus = require('../../../../../models/data/type/moderation-status');

module.exports = class GarageScores extends GsApiInterface {
  static async getGarageScores(app, garageId) {
    const reviewsCount = await this._fetchReviewsCount(app, garageId.toString());
    const publicScores = await this._fetchGaragePublicScores(app, garageId.toString());
    return (
      !publicScores || (publicScores.length <= 0 ? null : this._prepareScoresForPublic(reviewsCount, publicScores))
    );
  }

  /** ******************************************* **/
  /**            -- PRIVATE METHODS --            **/
  /** ******************************************* **/

  static _fetchReviewsCount(app, garageId, type = null) {
    return new Promise((resolve, reject) => {
      const where = {
        garageId,
        'review.comment.status': moderationStatus.APPROVED,
        shouldSurfaceInStatistics: true,
      };
      if (type) {
        where.type = type;
        app.models.Data.count(where, (e, d) => (e ? reject(e) : resolve(d)));
        return;
      }
      app.models.Data.review_countApprovedReviewByType(where, (e, d) =>
        e ? reject(e) : resolve(this._treatReviewsCount(d))
      );
    });
  }

  static _treatReviewsCount(groups) {
    const result = {};

    if (groups) {
      groups.forEach((g) => (result[g._id.type] = g.total));
    }
    return result;
  }

  static _fetchGaragePublicScores(app, garageId) {
    return new Promise((resolve, reject) => {
      app.models.Garage.findPublicScores(garageId, null, null, null, true, (e, p) => {
        if (e) reject(e);
        else resolve(p);
      });
    });
  }

  static _prepareScoresForPublic(reviewsCount, publicScores) {
    let res = {
      reviewsCount: reviewsCount,
      scores: {
        sectionCount: 0,
        respondentsCount: 0,
        formattedGlobalRating: {
          label: 'GarageScore',
          abbreviatedLabel: 'GarageScore',
        },
      },
    };

    [
      {
        scoreType: gsPublicScoreType.MAINTENANCE,
        itemRatings: [
          {
            label: subratingLabels.MAINTENANCE_LAB_1,
            abbreviatedLabel: subratingLabels.MAINTENANCE_LAB_1,
            code: 'crit1',
          },
          {
            label: subratingLabels.MAINTENANCE_LAB_2,
            abbreviatedLabel: subratingLabels.MAINTENANCE_LAB_2,
            code: 'crit2',
          },
          {
            label: subratingLabels.MAINTENANCE_LAB_3,
            abbreviatedLabel: subratingLabels.MAINTENANCE_LAB_3,
            code: 'crit3',
          },
          {
            label: subratingLabels.MAINTENANCE_LAB_4,
            abbreviatedLabel: subratingLabels.MAINTENANCE_LAB_4,
            code: 'crit4',
          },
          {
            label: subratingLabels.MAINTENANCE_LAB_5,
            abbreviatedLabel: subratingLabels.MAINTENANCE_LAB_5,
            code: 'crit5',
          },
        ],
      },
      {
        scoreType: gsPublicScoreType.NEW_VEHICLE_SALE,
        itemRatings: [
          { label: subratingLabels.SALE_NEW_LAB_1, abbreviatedLabel: subratingLabels.SALE_NEW_LAB_1, code: 'crit1' },
          { label: subratingLabels.SALE_NEW_LAB_2, abbreviatedLabel: subratingLabels.SALE_NEW_LAB_2, code: 'crit2' },
          { label: subratingLabels.SALE_NEW_LAB_3, abbreviatedLabel: subratingLabels.SALE_NEW_LAB_3, code: 'crit3' },
          { label: subratingLabels.SALE_NEW_LAB_4, abbreviatedLabel: subratingLabels.SALE_NEW_LAB_4, code: 'crit4' },
          { label: subratingLabels.SALE_NEW_LAB_5, abbreviatedLabel: subratingLabels.SALE_NEW_LAB_5, code: 'crit5' },
        ],
      },
      {
        scoreType: gsPublicScoreType.USED_VEHICLE_SALE,
        itemRatings: [
          { label: subratingLabels.SALE_USED_LAB_1, abbreviatedLabel: subratingLabels.SALE_USED_LAB_1, code: 'crit1' },
          { label: subratingLabels.SALE_USED_LAB_2, abbreviatedLabel: subratingLabels.SALE_USED_LAB_2, code: 'crit2' },
          { label: subratingLabels.SALE_USED_LAB_3, abbreviatedLabel: subratingLabels.SALE_USED_LAB_3, code: 'crit3' },
          { label: subratingLabels.SALE_USED_LAB_4, abbreviatedLabel: subratingLabels.SALE_USED_LAB_4, code: 'crit4' },
          { label: subratingLabels.SALE_USED_LAB_5, abbreviatedLabel: subratingLabels.SALE_USED_LAB_5, code: 'crit5' },
        ],
      },
      {
        scoreType: gsPublicScoreType.VEHICLE_INSPECTION,
      },
    ].forEach((scoreTypeParam) => {
      let dataRecord = this.__findWhere(publicScores, { type: scoreTypeParam.scoreType });
      res.scores[scoreTypeParam.scoreType] = dataRecord ? {} : null;
      this.__updateGlobalRespondentsCount(res, dataRecord);
      this.__updateSpecificRespondentsCount(res, scoreTypeParam.scoreType, dataRecord);
      this.__distrib(res, dataRecord, scoreTypeParam.scoreType);
      if (dataRecord) {
        if (Array.isArray(scoreTypeParam.itemRatings)) {
          scoreTypeParam.itemRatings.forEach(({ label, abbreviatedLabel, code }) => {
            this.__itemRating(label, abbreviatedLabel, code, dataRecord);
          });
        }
        res.scores[scoreTypeParam.scoreType].byVehicleMake = this.__sortVehicleMakes(dataRecord);
        if (scoreTypeParam.scoreType === gsPublicScoreType.MAINTENANCE) {
          res.scores.Maintenance.byAbbreviatedCategoryLabel = this.__sortSubCategories(dataRecord, 'byCategories'); // here
        }
      }
      if (res.scores[scoreTypeParam.scoreType]) {
        res.scores.sectionCount++;
      }
    });

    return res;
  }

  static __findWhere(content, query) {
    let found = false;

    for (const elem of content) {
      for (const key of Object.keys(query)) {
        if (elem[key] === query[key]) {
          found = true;
        } else {
          found = false;
          break;
        }
      }
      if (found) {
        return elem;
      }
    }
    return null;
  }

  static __updateGlobalRespondentsCount(res, elem) {
    if (elem && typeof elem.payload.rating.global.respondentsCount !== 'undefined') {
      res.scores.respondentsCount += elem.payload.rating.global.respondentsCount;
    }
  }

  static __updateSpecificRespondentsCount(res, field, elem) {
    if (res.scores[field]) {
      res.scores[field].respondentsCount = elem.payload.rating.global.respondentsCount;
    }
  }

  static __toObj(label, code, abbreviatedLabel, respondentsCount, value, valueType) {
    return { label, code, abbreviatedLabel, respondentsCount, value, valueType };
  }

  static __distrib(res, dataRecords, field) {
    if (dataRecords && dataRecords.payload && dataRecords.payload.rating && dataRecords.payload.rating.perValue) {
      const d = res.scores[field];
      const pv = dataRecords.payload.rating.perValue;
      const totalPv =
        pv['10'] + pv['9'] + pv['8'] + pv['7'] + pv['6'] + pv['5'] + pv['4'] + pv['3'] + pv['2'] + pv['1'] + pv['0'];

      d.byValue = [
        this.__toObj(
          'Très satisfait',
          '',
          'Très satisfait',
          pv['10'] + pv['9'],
          100 * ((pv['10'] + pv['9']) / totalPv),
          'pct'
        ),
        this.__toObj('Satisfait', '', 'Satisfait', pv['8'] + pv['7'], 100 * ((pv['8'] + pv['7']) / totalPv), 'pct'),
        this.__toObj('Passable', '', 'Passable', pv['6'] + pv['5'], 100 * ((pv['6'] + pv['5']) / totalPv), 'pct'),
        this.__toObj('Mécontent', '', 'Mécontent', pv['4'] + pv['3'], 100 * ((pv['4'] + pv['3']) / totalPv), 'pct'),
        this.__toObj(
          'Très mécontent',
          '',
          'Très mécontent',
          pv['2'] + pv['1'] + pv['0'],
          100 * ((pv['2'] + pv['1'] + pv['0']) / totalPv),
          'pct'
        ),
      ];
      this.__largestRemainder(
        d.byValue,
        (o) => o.value,
        (i, v, a) => {
          a[i].value = v;
        },
        100
      );
    }
  }

  static __largestRemainder(array, fctGetValue, fctSetValue, target) {
    array.forEach((o, i) => {
      fctSetValue(i, Math.floor(fctGetValue(o)), array);
    });
    const computeSum = () => {
      let sum = 0;
      array.forEach((o) => {
        sum += fctGetValue(o);
      });
      return sum;
    };
    let sum = computeSum();
    if (sum < target) {
      const values = [];
      array.forEach((o, i) => {
        values.push([fctGetValue(o), i]);
      });
      const sortedValues = values.sort((o) => o[0]);
      sortedValues.reverse();
      const sortedIndex = sortedValues.map((o) => o[1]);
      let i = 0;
      while (sum !== target) {
        const index = sortedIndex[i];
        const el = array[index];
        i = (i + 1) % sortedIndex.length;
        const v = fctGetValue(el);
        if (v !== 0) {
          fctSetValue(index, 1 + v, array);
          sum = computeSum();
        }
      }
    }
  }

  static __getRespondentsCount(dataRecords, label) {
    return (
      (dataRecords &&
        dataRecords.payload &&
        dataRecords.payload.rating &&
        dataRecords.payload.rating.byItem &&
        dataRecords.payload.rating.byItem[label] &&
        dataRecords.payload.rating.byItem[label].respondentsCount) ||
      0
    );
  }

  static __getValue(dataRecords, label) {
    return (
      (dataRecords &&
        dataRecords.payload &&
        dataRecords.payload.rating &&
        dataRecords.payload.rating.byItem &&
        dataRecords.payload.rating.byItem[label] &&
        parseFloat(dataRecords.payload.rating.byItem[label].value, 10)) ||
      0
    );
  }

  static __itemRating(label, abbreviatedLabel, code, scoresO) {
    return {
      label,
      abbreviatedLabel,
      code,
      respondentsCount: this.__getRespondentsCount(scoresO, label),
      value: this.__getValue(scoresO, label),
      valueType: 'gradestr',
    };
  }

  static __sortRatings(ratings, sorted) {
    const clone = Object.assign({}, ratings);
    const tmp = [];

    for (const key of Object.keys(clone)) {
      const formattedRating = {};
      clone[key].label = key;
      formattedRating.abbreviatedLabel =
        ServiceCategories.getPropertyFromValue(clone[key].label, 'shortName') || clone[key].label;
      formattedRating.respondentsCount = clone[key].respondentsCount;
      formattedRating.value = parseFloat(clone[key].value);
      tmp.push(formattedRating);
    }
    tmp.sort((a, b) => {
      if (b.respondentsCount === a.respondentsCount) {
        return a.abbreviatedLabel.localeCompare(b.abbreviatedLabel);
      }
      return b.respondentsCount - a.respondentsCount;
    });
    sorted.push(...tmp);
  }

  static __sortSubCategories(dataRecords, field) {
    const sorted = [];

    if (dataRecords) {
      const ratings = Object.assign({}, dataRecords.payload.rating[field]);
      this.__sortRatings(ratings, sorted);
    }
    return sorted;
  }

  static __sortVehicleMakes(dataRecords) {
    const sorted = [];

    if (dataRecords) {
      const ratings = Object.assign({}, dataRecords.payload.rating.byVehicleMake);
      this.__sortRatings(ratings, sorted);
    }
    return sorted;
  }
};
