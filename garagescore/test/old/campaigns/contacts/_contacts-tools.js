const timeHelper = require('../../../../common/lib/util/time-helper');
const callerId = require('caller-id'); // eslint-disable-line
const assert = require('assert');

function notEqual(actual, expected) {
  if (actual === expected) {
    const e = { actual, expected };
    throw e;
  }
}
function equal(actual, expected, value) {
  if (actual !== expected) {
    const e = { actual, expected, value };
    throw e;
  }
}
function hasToBeTested(field, acceptNull) {
  return field || (acceptNull && typeof field !== 'undefined'); // In case we wanna test "foo === null"
}
/* eslint-disable max-len */
module.exports = (app) => {
  // checks
  async function checksCreatedContacts(expected) {
    if (!expected) {
      return;
    }
    const contacts = await app.contacts();
    notEqual(contacts, null);
    equal(contacts.length, expected.length, 'contacts.length');
    for (let c = 0; c < contacts.length; c++) {
      equal(contacts[c].type, expected[c].type, 'type');
      equal(contacts[c].recipient, expected[c].recipient, 'recipient');
      equal(contacts[c].status, expected[c].status, 'status');
      equal(contacts[c].type, expected[c].type, 'type');
      equal(contacts[c].payload.key, expected[c].payload.key, 'payload.key');
    }
  }
  async function checksCreatedDatas(expected, acceptNull) {
    if (!expected) {
      return;
    }
    const datas = await app.datas();
    const n = acceptNull;
    equal(datas.length, expected.length, 'datas.length');
    for (let c = 0; c < datas.length; c++) {
      if (hasToBeTested(expected[c].garageId, n)) {
        equal(datas[c].garageId, expected[c].garageId, 'garageId');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.firstName, n)) {
        equal(datas[c].customer.firstName.value, expected[c].customer.firstName, 'firstName');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.lastName, n)) {
        equal(datas[c].customer.lastName.value, expected[c].customer.lastName, 'lastName');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.fullName, n)) {
        equal(datas[c].customer.fullName.value, expected[c].customer.fullName, 'fullName');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.email, n)) {
        equal(datas[c].customer.contact.email.value, expected[c].customer.email, 'email');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.street, n)) {
        equal(datas[c].customer.street.value, expected[c].customer.street, 'streetAddress');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.postalCode, n)) {
        equal(datas[c].customer.postalCode.value, expected[c].customer.postalCode, 'postalCode');
      }
      if (expected[c].customer && hasToBeTested(expected[c].customer.city, n)) {
        equal(datas[c].customer.city.value, expected[c].customer.city, 'city');
      }
      if (hasToBeTested(expected[c].nextCampaignContact, n)) {
        equal(
          datas[c].campaign.contactScenario.nextCampaignContact,
          expected[c].nextCampaignContact,
          'nextCampaignContact'
        );
      }
      if (hasToBeTested(expected[c].nextCampaignContactDay, n)) {
        equal(
          datas[c].campaign.contactScenario.nextCampaignContactDay,
          expected[c].nextCampaignContactDay,
          'nextCampaignContactDay'
        );
      }
      if (hasToBeTested(expected[c].lastCampaignContactSent, n)) {
        equal(
          datas[c].campaign.contactScenario.lastCampaignContactSent,
          expected[c].lastCampaignContactSent,
          'lastCampaignContactSent'
        );
      } // eslint-disable-line max-len
      if (hasToBeTested(expected[c].hasBeenContactedByEmail, n)) {
        equal(
          datas[c].campaign.contactStatus.hasBeenContactedByEmail,
          expected[c].hasBeenContactedByEmail,
          'hasBeenContactedByEmail'
        );
      }
      if (hasToBeTested(expected[c].hasBeenContactedByPhone, n)) {
        equal(
          datas[c].campaign.contactStatus.hasBeenContactedByPhone,
          expected[c].hasBeenContactedByPhone,
          'hasBeenContactedByPhone'
        );
      }
      if (hasToBeTested(expected[c].firstContactByEmailDay, n)) {
        equal(
          datas[c].campaign.contactScenario.firstContactByEmailDay,
          expected[c].firstContactByEmailDay,
          'firstContactByEmailDay'
        );
      }
      if (hasToBeTested(expected[c].recontactedAt, n)) {
        equal(
          timeHelper.dayNumber(datas[c].campaign.contactScenario.recontactedAt),
          timeHelper.dayNumber(expected[c].recontactedAt),
          'recontactedAt'
        );
      }
      if (hasToBeTested(expected[c].type, n)) {
        equal(datas[c].type, expected[c].type, 'dataType');
      }
    }
  }

  async function checks(expected, acceptNull = false) {
    const caller = callerId.getData();
    try {
      await checksCreatedDatas(expected.datas, acceptNull);
      await checksCreatedContacts(expected.contacts);
    } catch (e) {
      console.error(e);
      assert.fail(
        `Error at ${caller.filePath}:${caller.lineNumber}\n ${e.value} => actual: ${e.actual}, expected: ${e.expected}`
      );
    }
  }

  const customer = (person) => ({
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: person.fullName,
    email: person.email,
    street: person.streetAddress,
    postalCode: person.postalCode,
    city: person.city,
  });

  return { checks, customer };
};
