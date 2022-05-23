const app = require('../../../../server/server');
const async = require('async');
const moment = require('moment');
const debug = require('debug')('garagescore:common:lib:garagescore:campaign:campaign-creation-schema'); // eslint-disable-line max-len,no-unused-vars
const gsDataFileUtil = require('../data-file/util');
const gsCampaignUtil = require('../campaign/util');

const customersFilter = require('./filtering/customers-filter');
const util = require('util');

const Enum = require('../../../lib/util/enum.js');

const dataRejectionReasons = new Enum({
  NO_CONTACT_CHANNEL: 'no contact channel',
  UNDEFINED_COMPLETED_AT: 'undefined completedAt',
  DROPPED_WITH_NO_ALTERNATIVE: 'Dropped with no alternative',
});

//
// CAMPAIGN CREATION SCHEMA
//

/**
 * Creates campaigns from a DataFile. Returns campaigncreated and campaignitem ignored
 * @param campaignScenario
 * @param singleDataFile
 * @param callback
 */
var _generateCampaignFromDatas = function (scenario, singleDataFile, callback) {
  const dataFileId = new app.models.DataFile(singleDataFile).getId();
  const includes = { include: ['garage'] };

  app.models.DataFile.findById(dataFileId, includes, (errDataFile, foundDataFile) => {
    if (errDataFile) {
      callback(errDataFile);
    } else if (!foundDataFile) {
      callback(new Error('No DataFile found'));
    } else if (typeof foundDataFile.garageId === 'undefined') {
      callback(new Error('Undefined DataFile.garageId'));
    } else if (typeof foundDataFile.garage === 'undefined') {
      callback(new Error('Undefined DataFile.garage'));
    } else if (typeof foundDataFile.garage() === 'undefined') {
      callback(new Error('Undefined DataFile.garage()'));
    } else {
      _ensureValidForCampaignCreation(foundDataFile, scenario, callback);
    }
  });
};

function _ensureValidForCampaignCreation(foundDataFile, scenario, callback) {
  const dataFile = foundDataFile.toObject();

  gsDataFileUtil.ensureValidForCampaignCreation(dataFile, (errValid) => {
    if (errValid) {
      callback(errValid);
    } else {
      _extractDataFromDataFile(foundDataFile, dataFile, scenario, callback);
    }
  });
}

function _extractDataFromDataFile(dataFileInstance, dataFileObject, scenario, callback) {
  dataFileInstance.datas((errExtract, datas) => {
    if (errExtract) {
      callback(errExtract);
    } else if (datas.length === 0) {
      callback(new Error('No Data created from datafile'), [], []);
    } else {
      // since September 2018 we can re import data files, so we need here to remove data with already a campaign
      let hasAutomationData = false;
      let countAutomation = 0;
      const newDatas = datas.filter((data) => {
        // Its bad and it's ugly but...
        if (data.get('campaign.automationOnly')) {
          hasAutomationData = true;
          countAutomation++;
        }
        return !data.get('campaign.campaignId') && !data.get('campaign.automationOnly');
      });
      dataFileInstance.updateAttributes(
        {
          hasAutomationData: hasAutomationData,
          nbDatasCreated: datas.length,
          nbDatasAutomation: countAutomation,
          datasCreatedIds: datas.map((d) => d.getId()),
          datasAutomationIds: datas.filter((d) => d.get('campaign.automationOnly')).map((d) => d.getId()),
        },
        () => {
          if (newDatas.length === 0) {
            callback(null, [], []);
            return;
          }
          _getCustomerFilters(dataFileObject, scenario, newDatas, callback);
        }
      );
    }
  });
}

function _getCustomerFilters(dataFileObject, scenario, datas, callback) {
  customersFilter.getFilter(dataFileObject.garage.id.toString(), (errFilter, filter) => {
    if (errFilter) {
      callback(new Error('Error customersFilter: ' + errFilter.message));
    } else {
      _processDataAndCreateCampaigns(dataFileObject, scenario, datas, filter, callback);
    }
  });
}

function _processDataAndCreateCampaigns(dataFileObject, scenario, datas, filter, callback) {
  const ignored = [];
  const ignoredIds = [];
  const garage = dataFileObject.garage;
  const campaigns = [];
  const campaignsByType = {};

  datas.forEach((data) =>
    _processData(data, dataFileObject, garage, campaigns, campaignsByType, ignored, ignoredIds, filter)
  );
  if (campaigns.length === 0) {
    console.error(
      `_processDataAndCreateCampaigns No campaign created for datafile ${
        dataFileObject.id && dataFileObject.id.toString()
      }`
    );
    callback(null, [], ignored);
  } else {
    _processCampaigns(campaigns, datas, ignored, ignoredIds, garage, scenario, filter, callback);
  }
}

function _processData(data, dataFile, garage, campaigns, campaignsByType, ignored, ignoredIds, filter) {
  const previouslyDroppedEmail = filter.previouslyDroppedEmail(data.get('customer.contact.email.value'));
  const previouslyDroppedPhone = filter.previouslyDroppedPhone(data.get('customer.contact.mobilePhone.value'));
  const email = data.get('customer.contact.email.value');
  const phone = data.get('customer.contact.mobilePhone.value');
  const providedAt = data.get('service.providedAt');
  const campaignType = data.campaign_campaignType();
  let newCampaign = null;
  if (!email && !phone) {
    ignored.push([dataRejectionReasons.NO_CONTACT_CHANNEL, data]);
    ignoredIds.push(data.getId().toString());
  } else if (!providedAt) {
    ignored.push([dataRejectionReasons.UNDEFINED_COMPLETED_AT, data]);
    ignoredIds.push(data.getId().toString());
  } else if (
    (!phone && previouslyDroppedEmail) ||
    (!email && previouslyDroppedPhone) ||
    (previouslyDroppedEmail && previouslyDroppedPhone)
  ) {
    ignored.push([dataRejectionReasons.DROPPED_WITH_NO_ALTERNATIVE, data]);
    ignoredIds.push(data.getId().toString());
  } else if (campaignType && !campaignsByType[campaignType]) {
    newCampaign = _fillCampaignInfo(campaignType, garage, dataFile);
    campaignsByType[campaignType] = newCampaign;
    campaigns.push(newCampaign);
  }
}

function _fillCampaignInfo(campaignType, garage, dataFile) {
  return {
    type: campaignType,
    name: util.format(
      '%s %s - %s (%s)',
      garage.securedDisplayName,
      dataFile.id,
      campaignType,
      moment().format('YYYY-MM-DD')
    ),
    dataFileId: dataFile.id,
    description: gsCampaignUtil.getStandardDescription({ dataFile, campaignType, campaignCreationSchema: 'standard' }),
    garageId: dataFile.garageId,
  };
}

function _processCampaigns(campaigns, datas, ignored, ignoreIds, garage, scenario, filter, callback) {
  const campaignsSaved = [];

  async.eachSeries(
    campaigns,
    (campaign, next) => {
      app.models.Campaign.create(campaign, (errSaveCampaign, savedCampaign) => {
        campaignsSaved.push(savedCampaign);
        next(errSaveCampaign);
      });
    },
    (errSaveCampaigns) =>
      _reInitCampaigns(errSaveCampaigns, campaignsSaved, datas, ignored, ignoreIds, garage, scenario, filter, callback)
  );
}

function _reInitCampaigns(
  errSaveCampaigns,
  campaignsSaved,
  datas,
  ignored,
  ignoreIds,
  garage,
  scenario,
  filter,
  callback
) {
  const campaignsByType = {};

  if (errSaveCampaigns) {
    callback(errSaveCampaigns);
  } else {
    campaignsSaved.forEach((campaign) => (campaignsByType[campaign.type] = campaign));
    datas.forEach((data) => _reInitData(data, garage, ignored, ignoreIds, campaignsByType, scenario, filter));
    async.eachSeries(
      datas,
      (data, next) => {
        data.save(next);
      },
      (errSaveData) => callback(errSaveData, campaignsSaved, ignored)
    );
  }
}

function _reInitData(data, garage, ignored, ignoredIds, campaignsByType, scenario, filter) {
  const type = data.get('type');
  const campaignType = data.campaign_campaignType();
  const contact = {
    previouslyContactedByPhone: filter.previouslyContactedByPhone(data.get('customer.contact.mobilePhone.value'), type),
    previouslyContactedByEmail: filter.previouslyContactedByEmail(data.get('customer.contact.email.value'), type),
    previouslyDroppedEmail: filter.previouslyDroppedEmail(data.get('customer.contact.email.value')),
    previouslyDroppedPhone: filter.previouslyDroppedPhone(data.get('customer.contact.mobilePhone.value')),
    previouslyUnsubscribedByEmail: filter.previouslyUnsubscribedByEmail(data.get('customer.contact.email.value')),
    previouslyUnsubscribedByPhone: filter.previouslyUnsubscribedByPhone(data.get('customer.contact.mobilePhone.value')),
    previouslyComplainedByEmail: filter.previouslyComplainedByEmail(data.get('customer.contact.email.value')),
  };
  let ignoredReason = null;

  if ((ignoredReason = _needToBeIgnored(contact, campaignType))) {
    ignored.push([ignoredReason, data]);
    ignoredIds.push(data.getId().toString());
  }
  _addCampaignToData(campaignsByType, ignoredIds, scenario, contact, campaignType, data, garage);
}

function _needToBeIgnored(contact, campaignType) {
  if (
    contact.previouslyContactedByPhone ||
    contact.previouslyContactedByEmail ||
    contact.previouslyUnsubscribedByEmail ||
    contact.previouslyUnsubscribedByPhone ||
    contact.previouslyComplainedByEmail
  ) {
    return 'Blocked';
  } else if (!campaignType) {
    return 'No campaign type or data type unknown';
  }
  return false;
}

function _addCampaignToData(campaignsByType, ignoredIds, campaignScenario, contact, campaignType, data, garage) {
  const campaign = campaignType && campaignsByType[campaignType];
  const campaignId = campaign && campaign.getId().toString();
  const dataType = data.get('type');
  let firstContactByEmailDay = null;
  let firstContactByPhoneDay = null;
  let blockedCampaign = true;

  if (ignoredIds.indexOf(data.getId().toString()) < 0) {
    const garageDelta = app.models.Garage.getFirstContactDelay(garage, dataType);
    firstContactByEmailDay = contact.previouslyDroppedEmail
      ? null
      : campaignScenario.firstContactByEmailDay(dataType, new Date(), garageDelta);
    firstContactByPhoneDay = contact.previouslyDroppedPhone
      ? null
      : campaignScenario.firstContactByPhoneDay(dataType, new Date(), garageDelta);
    blockedCampaign = false;
  }
  data.addCampaign(
    campaignId || null,
    contact.previouslyContactedByEmail,
    contact.previouslyContactedByPhone,
    contact.previouslyDroppedEmail,
    contact.previouslyDroppedPhone,
    contact.previouslyUnsubscribedByEmail,
    contact.previouslyUnsubscribedByPhone,
    contact.previouslyComplainedByEmail,
    firstContactByEmailDay,
    firstContactByPhoneDay,
    blockedCampaign,
    !campaignType
  );
}

module.exports = function (campaignScenario) {
  return {
    generateCampaignFromDatas: _generateCampaignFromDatas.bind(null, campaignScenario),
    dataRejectionReasons,
  };
};
