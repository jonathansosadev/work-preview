/**
 * User Access history lib
 */
const { getSection, getSectionFromName } = require('../../../models/userSection.type');
const tracking = require('../../../../common/lib/garagescore/tracking');

/**
 * Takes a request and generate a new user access from it
 * @param req The request to generate access from
 * @param section Set this to force a specific section
 */
const create = function create(req, section = null) {
  if (!section) section = getSection(req.url); // eslint-disable-line
  if (!section) return null; // the req.url isn't in the sniffed sections
  return {
    userAgent: req.headers['user-agent'],
    section,
    ip: tracking.ip(req),
    fingerPrint: tracking.fingerPrint(req),
    createdAt: new Date(),
  };
};

const createFromName = function createFromPath(req, name, section = null) {
  if (!section) section = getSectionFromName(name); // eslint-disable-line
  if (!section) return null; // the req.url isn't in the sniffed sections
  return {
    userAgent: req.headers['user-agent'],
    section,
    ip: tracking.ip(req),
    fingerPrint: tracking.fingerPrint(req),
    createdAt: new Date(),
  };
};

module.exports = {
  create,
  createFromName,
};
