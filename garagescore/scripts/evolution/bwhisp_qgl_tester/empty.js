/* eslint-disable */

module.exports = {
  label: 'LABEL',
  before: async () => {},
  queryApollo: `(query|mutation) queryName($var1: String!) {
    queryName(arg1: $var1) {
      field1
      field2
    }
  }`,
  variablesApollo: {
    var1: 'value',
  },
  legacyQuery: `{ 
    queryName(arg1: value) {
      field1
      field2
    }
  }`,
  getLegacyResults: (data) => {
    return JSON.stringify(data.queryName, null, 2);
  },
  getResults: (data) => {
    return JSON.stringify(data.queryName, null, 2);
  },
  expected: `Schweppes, what did you expect ?`,
};
