const deepSearch = require('../../../../lib/util/object.js');

const getValueFromForeignResponses = function (query, foreignResponses) {
  let value = null;
  for (let i = 0; i < foreignResponses.length; i++) {
    if (foreignResponses[i].payload && deepSearch.getDeepFieldValue(foreignResponses[i].payload, query)) {
      value = deepSearch.getDeepFieldValue(foreignResponses[i].payload, query);
    }
  }
  return value;
};

//contrary to getValueFromForeignResponses, it can return false
const getValueFromForeignBooleanResponses = function (query, foreignResponses) {
  let value = null;

  for (let i = 0; i < foreignResponses.length; i++) {
    const res = deepSearch.getDeepFieldValue(foreignResponses[i].payload, query);
    if (foreignResponses[i].payload && res !== undefined && res != null) {
      value = res;
    }
  }
  return value;
};

const getHighestIntFromForeignResponses = function (query, foreignResponses) {
  let value = null;
  for (let i = 0; i < foreignResponses.length; i++) {
    if (foreignResponses[i].payload && deepSearch.getDeepFieldValue(foreignResponses[i].payload, query)) {
      const tempValue = parseInt(deepSearch.getDeepFieldValue(foreignResponses[i].payload, query), 10);
      if (tempValue && (!value || tempValue > value)) {
        value = tempValue;
      }
    }
  }
  return value;
};
const updateReviewRatingIntern = function (foreignResponses, updates) {
  updates.rating = getValueFromForeignResponses('rating', foreignResponses); // eslint-disable-line no-param-reassign
};
const updateSharedOnGoogleClicked = function (foreignResponses, updates) {
  updates.sharedOnGoogleClicked = getValueFromForeignResponses('sharedOnGoogleClicked', foreignResponses); // eslint-disable-line no-param-reassign
};
const updateShareWithPartners = function (foreignResponses, updates) {
  if (!getValueFromForeignResponses('shareWithPartners', foreignResponses)) {
    return;
  }
  updates.shareWithPartners = getValueFromForeignResponses('shareWithPartners', foreignResponses) === 'Oui'; // eslint-disable-line no-param-reassign
};
const updateReviewCommentIntern = function (foreignResponses, updates) {
  updates.comment = getValueFromForeignResponses('comment', foreignResponses); // eslint-disable-line no-param-reassign
};
const updateSurveyProgressIntern = function (foreignResponses, updates) {
  const isComplete = getValueFromForeignResponses('isComplete', foreignResponses);
  const pageNumber = getHighestIntFromForeignResponses('pageNumber', foreignResponses);
  const pageCount = getHighestIntFromForeignResponses('pageCount', foreignResponses);
  updates.updateProgress(pageNumber, pageCount, isComplete);
};
const updateReviewRevisedDataIntern = function (foreignResponses, updates) {
  updates.revisedTitle = getValueFromForeignResponses('title', foreignResponses); // eslint-disable-line no-param-reassign
  updates.revisedFullName = getValueFromForeignResponses('fullName', foreignResponses); // eslint-disable-line no-param-reassign
  updates.revisedStreet = getValueFromForeignResponses('streetAddress', foreignResponses); // eslint-disable-line no-param-reassign
  updates.revisedPostalCode = getValueFromForeignResponses('postalCode', foreignResponses); // eslint-disable-line no-param-reassign
  updates.revisedCity = getValueFromForeignResponses('city', foreignResponses); // eslint-disable-line no-param-reassign
  updates.revisedEmail = getValueFromForeignResponses('email', foreignResponses); // eslint-disable-line no-param-reassign
  updates.customerShareWithGarage = // eslint-disable-line no-param-reassign
    getValueFromForeignResponses('customerShareWithGarage', foreignResponses) &&
    getValueFromForeignResponses('customerShareWithGarage', foreignResponses).length;
  updates.revisedMobilePhone = getValueFromForeignResponses(
    // eslint-disable-line no-param-reassign
    'mobilePhone',
    foreignResponses
  );
};

const updateMiddleMan = function (foreignResponses, updates) {
  const middleMans = getValueFromForeignResponses('serviceMiddleMans', foreignResponses);
  const middleManOther = getValueFromForeignResponses('serviceMiddleManOther', foreignResponses);
  if (middleManOther) {
    middleMans[middleMans.indexOf('autre')] = `autre:${middleManOther}`;
  }
  updates.updateMiddleMan(middleMans);
};

function getCarModelsFromSurveyVI(foreignResponses) {
  const carModels = [];
  for (let i = 1; i <= 5; i++) {
    const brand = getValueFromForeignResponses(`leadModels_${i}`, foreignResponses);
    if (brand) {
      const model = getValueFromForeignResponses(`leadModels_particular_model_${i}`, foreignResponses);
      const carModel = {
        brand,
        model,
      };
      carModels.push(carModel);
    }
  }
  return carModels;
}

function getCarModels(foreignResponses) {
  const leadModels = getValueFromForeignResponses('leadModels', foreignResponses);
  if (leadModels && Object.values(leadModels).length) {
    const carModelsArray = [];
    Object.values(leadModels).forEach((model) => {
      if (model && model.model) {
        carModelsArray.push({
          brand: model.model,
        });
      }
    });
    return carModelsArray;
  }
  return null;
}

module.exports = {
  getValueFromForeignResponses,
  getValueFromForeignBooleanResponses,
  updateSurveyProgressIntern,
  updateReviewRatingIntern,
  updateReviewCommentIntern,
  updateReviewRevisedDataIntern,
  updateSharedOnGoogleClicked,
  updateShareWithPartners,
  updateMiddleMan,
  getCarModels,
  getCarModelsFromSurveyVI,
};
