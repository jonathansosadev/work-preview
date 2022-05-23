const { DataTypes } = require('../../../../frontend/utils/enumV2');

module.exports = {
  // Basics
  setBasicFilterForEreputationList() {
    this.filters = {
      type: DataTypes.EXOGENOUS_REVIEW,
      'review.createdAt': { $gt: new Date(0) },
      shouldSurfaceInStatistics: true,
    };
    return this;
  },
};
