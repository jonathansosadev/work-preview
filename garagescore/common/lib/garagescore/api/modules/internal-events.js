/**
Track our events from the web
**/

/* eslint-disable no-param-reassign */
const cockpitNavigationContext = require('../../monitoring/internal-events/contexts/cockpit-navigation-context');
const { routesPermissions } = require('../route-permissions');
const { UnauthorizedError } = require('../apiErrors');

module.exports = (API, app, _hasAccess) => {
  // emit event
  const addEvent = async (eventType, nEvents, keys, counters, callback) => {

    const { key1, key2, key3, key4, key5 } = keys;
    let correlatedFields = null;
    if (Object.values(cockpitNavigationContext.EVENTS).includes(eventType)) {
      correlatedFields = cockpitNavigationContext.correlatedFields;
    }
    await app.models.InternalEvent.add([key1, key2, key3, key4, key5], eventType, counters, nEvents, correlatedFields);
    callback();
  };
  API.addEvent = addEvent;
};
