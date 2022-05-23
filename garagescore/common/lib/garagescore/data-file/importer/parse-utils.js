var s = require('underscore.string');

/** return the cellvalue of a cellLabel or, if  cellLabel is an Array, the first non empty value*/
var getCellValue = function (rowCells, cellLabel) {
  if (Array.isArray(cellLabel)) {
    for (var i = 0; i < cellLabel.length; i++) {
      if (rowCells[cellLabel[i]]) {
        return s.clean(rowCells[cellLabel[i]]);
      }
    }
    return undefined;
  }
  return s.clean(rowCells[cellLabel]);
};

module.exports = {
  getCellValue: getCellValue,
};
