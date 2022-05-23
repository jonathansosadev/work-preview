'use strict';

/** Normalize model name */
var normalizeModelName = function (rawModel) {
  var cleaned = rawModel.replace(/"/g, '');
  if (cleaned === '<à compléter>' || cleaned === 'AUTRES MODÈLES' || cleaned === 'NON CODIFIE') {
    return null;
  }
  return cleaned;
};

module.exports = {
  normalizeModelName: normalizeModelName,
};
