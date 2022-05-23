/** Fake api call for our tests */
var _sguid = 1;
var generateSguid = function () {
  return ++_sguid;
};
module.exports = {
  createContact: function () {
    arguments[arguments.length - 1](null, { id: generateSguid() });
  },
  updateContact: function () {
    arguments[arguments.length - 1](null, { id: arguments[0] });
  },
  createSurveyCampaign: function () {
    arguments[arguments.length - 1](null, {
      data: {
        id: generateSguid(),
        inviteid: generateSguid(),
      },
    });
  },
  updateSurveyCampaign: function () {
    arguments[arguments.length - 1](null, {
      data: {
        uri: 'fakeURI',
        SSL: 'True',
      },
    });
  },
  getEmailMessages: function () {
    arguments[arguments.length - 1](null, { data: [{ id: generateSguid() }] });
  },
  copySurvey: function () {
    arguments[arguments.length - 1](null, { data: { id: generateSguid() } });
  },
};
