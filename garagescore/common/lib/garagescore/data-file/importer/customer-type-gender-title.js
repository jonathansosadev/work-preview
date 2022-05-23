const _ = require('underscore');
const debug = require('debug')('garagescore:common:lib:garagescore:data-file:importer:customer-type-gender-title'); // eslint-disable-line max-len,no-unused-vars
const gsCustomerUtil = require('../../customer/util');
// var gsLogger = require('../../logger');
const s = require('underscore.string');
const parseUtils = require('./parse-utils');

module.exports = function importCustomerTypeGenderTitle(dataRecord, rowIndex, rowCells, options, callback) {
  if (typeof options.cellLabel === 'undefined') {
    callback && callback('cellLabel option is undefined');
    return;
  }

  const cellLabel = options.cellLabel;

  // -> dataRecord.customer.type
  // -> dataRecord.customer.gender
  // -> dataRecord.customer.title
  // -> dataRecord.customer.abbreviatedTitle

  if (typeof dataRecord.importStats.dataPresence.customer === 'undefined') {
    dataRecord.importStats.dataPresence.customer = {};
  }

  if (typeof dataRecord.importStats.dataValidity.customer === 'undefined') {
    dataRecord.importStats.dataValidity.customer = {};
  }

  const cellValue = parseUtils.getCellValue(rowCells, cellLabel);

  if (!s.isBlank(cellValue)) {
    dataRecord.importStats.dataPresence.customer.type = true;

    const supportedValues = {
      /* eslint-disable comma-dangle,quote-props */
      Assoc: { customerType: gsCustomerUtil.CustomerType.NonProfit },
      Association: { customerType: gsCustomerUtil.CustomerType.NonProfit },
      Cie: { customerType: gsCustomerUtil.CustomerType.Company },
      Compagnie: { customerType: gsCustomerUtil.CustomerType.Company },
      DOCTEUR: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Doctor },
      Docteur: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Doctor },
      Dr: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Doctor },
      EARL: { customerType: gsCustomerUtil.CustomerType.Company },
      Ent: { customerType: gsCustomerUtil.CustomerType.Company },
      Entreprise: { customerType: gsCustomerUtil.CustomerType.Company },
      ETS: { customerType: gsCustomerUtil.CustomerType.Company },
      Ets: { customerType: gsCustomerUtil.CustomerType.Company },
      Etablissement: { customerType: gsCustomerUtil.CustomerType.Company },
      GARAGE: { customerType: gsCustomerUtil.CustomerType.Company },
      MADAME: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Missus },
      MME: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Missus },
      Madame: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Missus },
      MADEMOISELLE: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Miss },
      Mademoiselle: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Miss },
      Me: { customerType: gsCustomerUtil.CustomerType.Individual },
      Maître: { customerType: gsCustomerUtil.CustomerType.Individual },
      'Monsieur et Madame': { customerType: gsCustomerUtil.CustomerType.Joint },
      'Monsieur ou Madame': { customerType: gsCustomerUtil.CustomerType.Joint },
      'Monsieur Madame': { customerType: gsCustomerUtil.CustomerType.Joint },
      'M&Me': { customerType: gsCustomerUtil.CustomerType.Joint },
      'Mr & Mme': { customerType: gsCustomerUtil.CustomerType.Joint },
      'M.MR': { customerType: gsCustomerUtil.CustomerType.Joint },
      'M.': { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      M: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      MR: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      MONSIEUR: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      Mme: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Missus },
      Mlle: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Miss },
      Monsieur: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      'Mr ou Mme': { customerType: gsCustomerUtil.CustomerType.Joint },
      'MONSIEUR, MADAME': { customerType: gsCustomerUtil.CustomerType.Joint },
      'Mr&Mme': { customerType: gsCustomerUtil.CustomerType.Joint },
      Mr: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      Pr: { customerType: gsCustomerUtil.CustomerType.Individual },
      Professeur: { customerType: gsCustomerUtil.CustomerType.Individual },
      'S.A.R.L.': { customerType: gsCustomerUtil.CustomerType.Company },
      SARL: { customerType: gsCustomerUtil.CustomerType.Company },
      'S.A.S.': { customerType: gsCustomerUtil.CustomerType.Company },
      Societe: { customerType: gsCustomerUtil.CustomerType.Company },
      SOCIETE: { customerType: gsCustomerUtil.CustomerType.Company },
      Ste: { customerType: gsCustomerUtil.CustomerType.Company },
      Sté: { customerType: gsCustomerUtil.CustomerType.Company },
      STE: { customerType: gsCustomerUtil.CustomerType.Company },
      Société: { customerType: gsCustomerUtil.CustomerType.Company },
      '1': { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Mister },
      '2': { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Missus },
      '3': { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Miss },
      '4': { customerType: gsCustomerUtil.CustomerType.Joint },
      '5': { customerType: gsCustomerUtil.CustomerType.Company },
      MrMe: { customerType: gsCustomerUtil.CustomerType.Joint },
      Ass: { customerType: gsCustomerUtil.CustomerType.NonProfit },
      Mle: { customerType: gsCustomerUtil.CustomerType.Individual, title: gsCustomerUtil.CustomerTitle.Miss },
      'S A S': { customerType: gsCustomerUtil.CustomerType.Company },
      SA: { customerType: gsCustomerUtil.CustomerType.Company },
      Adm: { customerType: gsCustomerUtil.CustomerType.Company },
      // Ugly but was in our documentation once
      /* eslint-enable comma-dangle,quote-props */
    };

    if (_.contains(_.keys(supportedValues), cellValue)) {
      dataRecord.importStats.dataValidity.customer.type = true;

      if (typeof dataRecord.customer === 'undefined') {
        dataRecord.customer = {};
      }

      dataRecord.customer.type = supportedValues[cellValue].customerType;

      if (
        gsCustomerUtil.isCustomerTypeIndividual(dataRecord.customer.type) &&
        !_.isUndefined(supportedValues[cellValue].title)
      ) {
        dataRecord.importStats.dataPresence.customer.title = true;
        dataRecord.importStats.dataValidity.customer.title = true;

        dataRecord.customer.title = gsCustomerUtil.CustomerTitleProperties[supportedValues[cellValue].title].title;

        dataRecord.importStats.dataPresence.customer.abbreviatedTitle = true;
        dataRecord.importStats.dataValidity.customer.abbreviatedTitle = true;

        dataRecord.customer.abbreviatedTitle =
          gsCustomerUtil.CustomerTitleProperties[supportedValues[cellValue].title].abbreviatedTitle;

        if (!_.isUndefined(gsCustomerUtil.CustomerTitleProperties[supportedValues[cellValue].title].gender)) {
          dataRecord.importStats.dataPresence.customer.gender = true;
          dataRecord.importStats.dataValidity.customer.gender = true;

          dataRecord.customer.gender = gsCustomerUtil.CustomerTitleProperties[supportedValues[cellValue].title].gender;
        } else {
          dataRecord.importStats.dataPresence.customer.gender = false;
        }
      } else {
        dataRecord.importStats.dataPresence.customer.gender = false;
        dataRecord.importStats.dataPresence.customer.title = false;
        dataRecord.importStats.dataPresence.customer.abbreviatedTitle = false;
      }
    } else {
      // gsLogger.warn('Row %d, Column "%s": Unsupported value "%s"', rowIndex, cellLabel, cellValue);
      dataRecord.importStats.dataValidity.customer.type = false;
    }
  } else {
    // gsLogger.warn('Row %d, Column "%s": Empty value', rowIndex, cellLabel);
    dataRecord.importStats.dataPresence.customer.type = false;
    dataRecord.importStats.dataPresence.customer.gender = false;
    dataRecord.importStats.dataPresence.customer.title = false;
    dataRecord.importStats.dataPresence.customer.abbreviatedTitle = false;
  }
  callback && callback(null, dataRecord);
};
