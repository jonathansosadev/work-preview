'use strict';

var _ = require('underscore');
var debug = require('debug')('garagescore:common:lib:garagescore:public-review'); // eslint-disable-line max-len,no-unused-vars
var gsPublicReviewType = require('../../models/public-review.type');

var gsPublicReview = {};

gsPublicReview.getSupportedTypes = function () {
  return _.values(gsPublicReviewType);
};

gsPublicReview.isSupportedType = function (type) {
  return _.contains(gsPublicReview.getSupportedTypes(), type);
};

module.exports = gsPublicReview;
