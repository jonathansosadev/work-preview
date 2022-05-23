const debug = require('debug')('garagescore:common:lib:garagescore:customer:util'); // eslint-disable-line max-len,no-unused-vars
const xRegExp = require('xregexp');

/*
 * Customer Title
 */

const CustomerTitle = {};
CustomerTitle.Mister = 'Mister';
CustomerTitle.Missus = 'Missus';
CustomerTitle.Miss = 'Miss';
CustomerTitle.Doctor = 'Doctor';

const CustomerTitleProperties = {};
CustomerTitleProperties[CustomerTitle.Mister] = { title: 'Monsieur', abbreviatedTitle: 'M.', gender: 'M' };
CustomerTitleProperties[CustomerTitle.Missus] = { title: 'Madame', abbreviatedTitle: 'Mme', gender: 'F' };
CustomerTitleProperties[CustomerTitle.Miss] = { title: 'Mademoiselle', abbreviatedTitle: 'Mlle', gender: 'F' };
CustomerTitleProperties[CustomerTitle.Doctor] = { title: 'Docteur', abbreviatedTitle: 'Dr' };

function _isValidCustomerGenericName(genericName) {
  return xRegExp('^[\\p{Latin}\\p{Common}]+$').test(genericName);
}

function isValidCustomerFirstName(firstName) {
  return _isValidCustomerGenericName(firstName);
}

function isValidCustomerLastName(lastName) {
  return _isValidCustomerGenericName(lastName);
}

function isValidCustomerFullName(fullName) {
  return _isValidCustomerGenericName(fullName);
}

/*
 * Customer Type
 */

const CustomerType = {};
CustomerType.Company = 'Company';
CustomerType.Individual = 'Individual';
CustomerType.Joint = 'Joint';
CustomerType.NonProfit = 'NonProfit';

function isCustomerTypeCompany(customerType) {
  return customerType === CustomerType.Company;
}

function isCustomerTypeIndividual(customerType) {
  return customerType === CustomerType.Individual;
}

function isCustomerTypeJoint(customerType) {
  return customerType === CustomerType.Joint;
}

module.exports = {
  CustomerTitle,
  CustomerTitleProperties,
  isValidCustomerFirstName,
  isValidCustomerLastName,
  isValidCustomerFullName,
  CustomerType,
  isCustomerTypeCompany,
  isCustomerTypeIndividual,
  isCustomerTypeJoint,
};
