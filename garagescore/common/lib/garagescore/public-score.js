'use strict';

/**
 * @module garagescore/public-score
 */
var _ = require('underscore');
var debug = require('debug')('garagescore:common:lib:garagescore:public-score'); // eslint-disable-line max-len,no-unused-vars
var gsPublicScoreType = require('../../models/public-score.type');
var gsPublicScore = {};

gsPublicScore.getSupportedTypes = function () {
  return _.values(gsPublicScoreType);
};

gsPublicScore.isSupportedType = function (type) {
  return _.contains(gsPublicScore.getSupportedTypes(), type);
};

var _itemNamesByPublicScoreType = {};

// TODO get this from survey/configs
_itemNamesByPublicScoreType[gsPublicScoreType.MAINTENANCE] = [
  'Accueil et prise en charge',
  'Écoute et conseils',
  'Clarté et détail du devis',
  'Respect des engagements de délai et de tarif',
  'Qualité générale de la prestation',
];
_itemNamesByPublicScoreType[gsPublicScoreType.NEW_VEHICLE_SALE] = [
  "Qualité générale de l'établissement",
  'Professionnalisme des équipes',
  'Services proposés (reprise, garantie, financement)',
  'Livraison de mon véhicule',
  'Satisfaction de mon véhicule',
];
_itemNamesByPublicScoreType[gsPublicScoreType.USED_VEHICLE_SALE] = [
  'Professionnalisme des équipes',
  'Historique de mon véhicule',
  'Services proposés (reprise, garantie, financement)',
  'Livraison de mon véhicule',
  'Satisfaction de mon véhicule',
];
gsPublicScore.getItemNamesByPublicScoreType = function (publicScoreType) {
  return _itemNamesByPublicScoreType[publicScoreType];
};

gsPublicScore.isSupportedItemNameForPublicScoreType = function (itemName, publicScoreType) {
  if (typeof itemName === 'undefined') {
    throw new Error('Undefined `itemName`');
  }

  if (typeof publicScoreType === 'undefined') {
    throw new Error('Undefined `publicScoreType`');
  }
  if (
    typeof _itemNamesByPublicScoreType[publicScoreType] !== 'undefined' &&
    _.contains(_itemNamesByPublicScoreType[publicScoreType], itemName)
  ) {
    return true;
  }

  return false;
};

module.exports = gsPublicScore;
