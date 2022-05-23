'use strict';

var _ = require('underscore');
var debug = require('debug')('garagescore:common:lib:dropbox:util'); // eslint-disable-line max-len,no-unused-vars

/*
 * Note: '/' is excluded from this list because it is actually used as
 * path separator in exported file names
 */
var unauthorizedDropboxFilenameChars = ['\\', ':', '?', '*', '"', '|'];

var painfulFilenameChars = ['\u00a0'];

function sanitizeDropboxFilename(dropboxFilename) {
  var sanitizedDropboxFilename = dropboxFilename;
  /*
   * Remove unauthorized and painful characters from file name
   */
  _.each(unauthorizedDropboxFilenameChars, function (unauthorizedDropboxFilenameChar) {
    sanitizedDropboxFilename = sanitizedDropboxFilename.replace(unauthorizedDropboxFilenameChar, '');
  });
  _.each(painfulFilenameChars, function (painfulFilenameChar) {
    sanitizedDropboxFilename = sanitizedDropboxFilename.replace(painfulFilenameChar, '');
  });

  return sanitizedDropboxFilename;
}

module.exports = {
  sanitizeDropboxFilename: sanitizeDropboxFilename,
};
