var fs = require('fs');
var path = require('path');

// List all files in a directory recursively in a synchronous fashion
var walkSync = function walkSync(dir, filelistParam, prefix) {
  var files = fs.readdirSync(dir);
  var filelist = filelistParam || [];
  files.forEach(function (file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      filelist = walkSync(dir + '/' + file, filelist, file + '/');
    } else {
      var fname = prefix ? prefix + file : file;
      filelist.push(fname);
    }
  });
  return filelist;
};

/** find every logo available */
var staticImagesSurvey = walkSync(path.join(__dirname, '../../../../client/static/images/survey'));
var _availableEmailLogos = [];
staticImagesSurvey.forEach(function (image) {
  if (image.substr(0, 11) === 'Logo-h60px-') {
    _availableEmailLogos.push(image);
  }
});
var staticImagesCertif = walkSync(path.join(__dirname, '../../../../frontend/static/certificate/images/logos'));
var _availableDirectoryPages = [];
staticImagesCertif.forEach(function (image) {
  if (image.substr(0, 11) === 'Logo-h90px-') {
    _availableDirectoryPages.push(image);
  }
});

/** return the logo for one brand*/
var _brandLogo = function (brand) {
  var norm = brand.replace(/[\s-]/g, '').replace('ë', 'e').replace('Š', 'S');
  return '/images/survey/Logo-h90px-' + norm + '.png';
};

var _brandLogoFileOnly = function (brand, size) {
  var norm = brand.replace(/[\s-]/g, '').replace('ë', 'e').replace('Š', 'S');
  return 'Logo-h' + size + 'px-' + norm + '.png';
};

var _getLogoPath = function (logo) {
  return '/images/survey/' + logo;
};

module.exports = {
  availableEmailLogos: _availableEmailLogos,
  availableDirectoryPages: _availableDirectoryPages,
  brandLogo: _brandLogo,
  brandLogoFileOnly: _brandLogoFileOnly,
  getLogoPath: _getLogoPath,
};
