const debug = require('debug')('garagescore:common:lib:garagescore:data-file:import-schemas'); // eslint-disable-line max-len,no-unused-vars
const fs = require('fs');
const path = require('path');

// List all files in a directory recursively in a synchronous fashion
const walkSync = function walkSync(dir, filelistParam, prefix) {
  const files = fs.readdirSync(dir);
  let filelist = filelistParam || [];
  files.forEach((file) => {
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      filelist = walkSync(`${dir}/${file}`, filelist, `${file}/`);
    } else {
      const fname = prefix ? prefix + file : file;
      filelist.push(fname);
    }
  });
  return filelist;
};

/** list of schemas files path*/
let _availablePaths = [];
/** list of dms ids*/
const _availableDMS = [];

const __removeFromPaths = (value) => {
  const i = _availablePaths.indexOf(value);
  if (i >= 0) {
    _availablePaths.splice(i, 1);
  }
};

const init = () => {
  // init _availablePaths
  _availablePaths = walkSync(path.join(__dirname, './import-schema'));
  __removeFromPaths('vehicle-make.js');
  __removeFromPaths('ERIC/maurel-global-xml.js');
  __removeFromPaths('ERIC/eric-global-xml.js');
  __removeFromPaths('DCS/dcsnet-global.js');
  __removeFromPaths('Generic/base.js');
  __removeFromPaths('Carbase/sofida-shared.js');

  // init _availableDMS
  for (let i = 0; i < _availablePaths.length; i++) {
    const importer = require(// eslint-disable-line global-require
    path.resolve(path.join(__dirname, 'import-schema/', _availablePaths[i])));
    if (importer.ID) {
      _availableDMS.push(importer.ID);
    }
  }
};
init();

module.exports = {
  availablePaths: _availablePaths,
  availableDMS: _availableDMS,
};
