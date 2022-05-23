'use strict';

var chalk = require('chalk');
var debug = require('debug')('garagescore:common:lib:garagescore:logger'); // eslint-disable-line max-len,no-unused-vars
var util = require('util');

function chalkDebug() {
  if (this.level > this.LEVELS.DEBUG) return;
  var args = Array.prototype.slice.call(arguments);
  args[0] = chalk.white('★') + ' ' + args[0];
  console.log.apply(this, args);
}

function chalkError() {
  if (this.level > this.LEVELS.ERROR) return;
  var args = Array.prototype.slice.call(arguments);
  args[0] = chalk.red('!') + ' ' + args[0];
  console.error.apply(this, args);
}

function chalkInfo() {
  if (this.level > this.LEVELS.INFO) return;
  var args = Array.prototype.slice.call(arguments);
  args[0] = chalk.cyan('•') + ' ' + args[0];
  console.info.apply(this, args);
}

function chalkLog() {
  if (this.level > this.LEVELS.LOG) return;
  var args = Array.prototype.slice.call(arguments);
  args[0] = chalk.green('→') + ' ' + args[0];
  console.log.apply(this, args);
}

function chalkWarn() {
  if (this.level > this.LEVELS.WARN) return;
  var args = Array.prototype.slice.call(arguments);
  args[0] = chalk.yellow('!') + ' ' + args[0];
  console.warn.apply(this, args);
}

var utilInspectOptions = {
  depth: null,
  colors: true,
};

function inspect(object) {
  return util.inspect(object, utilInspectOptions);
}

function setLevel(level) {
  this.level = level;
}

module.exports = {
  level: 0 /** todo make the default a local config*/,
  setLevel: setLevel,
  LEVELS: { DEBUG: 0, INFO: 1, LOG: 2, WARN: 3, ERROR: 4 },
  debug: chalkDebug,
  error: chalkError,
  info: chalkInfo,
  log: chalkLog,
  inspect: inspect,
  warn: chalkWarn,
};
