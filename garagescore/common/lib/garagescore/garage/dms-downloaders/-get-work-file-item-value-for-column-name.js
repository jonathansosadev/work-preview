const _ = require('lodash');
const util = require('util');

/** used by mecaplanning to get a cell value */

const getWorkFileItemValueForColumnName = function (workFileItem, columnName) {
  // The $value of example columnName 'Vehicle.VehVIN' will be stored in { Vehicle: { VehVIN: $value } }
  const columnNameParts = columnName.split('.');
  const currentNodeColumnName = columnNameParts[0];
  if (columnNameParts.length === 1) {
    // Last node: store value
    if (!workFileItem[currentNodeColumnName]) {
      return workFileItem[currentNodeColumnName]; // returns undefined ...
    }
    return workFileItem[currentNodeColumnName].$value;
  }

  let workFileItemNode;
  let workFileItemNodeValue;

  if (
    _.has(workFileItem, 'attributes') &&
    _.has(workFileItem.attributes, 'xsi:type') &&
    workFileItem.attributes['xsi:type'] === 'SOAP-ENC:Array' &&
    _.has(workFileItem, 'item')
  ) {
    // Node is a list, and MUST be addressed using with bracket-named index.
    if (currentNodeColumnName[0] !== '[' || currentNodeColumnName[currentNodeColumnName.length - 1] !== ']') {
      throw new Error(
        util.format('workFileItem is an array, but column name "%s" is not bracket-named', currentNodeColumnName)
      );
    }

    let currentNodeColumnNameAsIndex = currentNodeColumnName.substr(1, currentNodeColumnName.length - 2); // "[1]" → "1"

    // Special value: [last]
    if (currentNodeColumnNameAsIndex === 'last') {
      if (_.isArray(workFileItem.item)) {
        workFileItemNode = workFileItem.item[workFileItem.item.length - 1];
      } else {
        workFileItemNode = workFileItem.item;
      }
    } else if (currentNodeColumnNameAsIndex === 'RdvState=2') {
      // Special value: [RdvState=2] — Okay, maybe this is a hack. Just maybe.
      const subNodeName = 'RdvState';
      const subNodeValue = 2;
      if (_.isArray(workFileItem.item)) {
        workFileItemNode = _.find(workFileItem.item, (item) => {
          return item[subNodeName].$value === subNodeValue;
        });
        if (!workFileItemNode) {
          workFileItemNodeValue = '';
        }
      } else if (workFileItem.item[subNodeName].$value === subNodeValue) {
        workFileItemNode = workFileItem.item;
      } else {
        workFileItemNodeValue = '';
      }
    } else if (_.isArray(workFileItem.item)) {
      workFileItemNode = workFileItem.item[currentNodeColumnNameAsIndex];
    } else {
      // TODO: Should error on index > 0
      workFileItemNode = workFileItem.item;
    }
  } else {
    workFileItemNode = workFileItem[currentNodeColumnName];
  }

  if (!_.isUndefined(workFileItemNodeValue)) {
    return workFileItemNodeValue;
  }
  return getWorkFileItemValueForColumnName(
    workFileItemNode,
    columnNameParts.slice(1).join('.') // "Current.Next.NextOfNext" → "Next.NextOfNext"
  );
};

module.exports = getWorkFileItemValueForColumnName;
