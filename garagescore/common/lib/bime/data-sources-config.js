'use strict';
/*
 * Data Sources defined here MUST match those defined in reference document:
 * https://docs.google.com/spreadsheets/d/11DW7UI9zfgCBmXvrBZezBwAhELCaitZnxEC5XlYhiX8/edit#gid=2088853877
 * Warning : If one or more securityDataFieldName was changed you must execute the following command :
 *  node bin/bimeTools/update_data_securities_field.js
 */
module.exports = {
  securedDataSources: [
    {
      bimeConnectionId: 703139,
      securityDataFieldName: 'publicimports_garage_id',
    },
    {
      bimeConnectionId: 758182,
      securityDataFieldName: 'publicimports_garage_id',
    },
    {
      bimeConnectionId: 712424,
      securityDataFieldName: 'garage_id',
    },
    {
      bimeConnectionId: 712361,
      securityDataFieldName: 'garage_id',
    },
    {
      bimeConnectionId: 711806,
      securityDataFieldName: 'garage_id',
    },
  ],
  publicDataSources: [],
};
