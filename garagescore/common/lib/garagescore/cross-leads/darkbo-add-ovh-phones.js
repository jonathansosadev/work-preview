/**
 * Add phone number from the DarkBO
 */
module.exports = {
  crossLeadsAdd: async (app, req, res) => {
    const json = { added: [], errors: [] };
    let phoneNumbers = req.body.phoneNumber.replace(/ /g, '');
    if (!phoneNumbers.includes('-')) phoneNumbers = phoneNumbers.split(',');
    else {
      // ex: 0033285522890-99 OR 0033183629502-11
      try {
        let [fixPart, start, end] = phoneNumbers.match(/(.*)([0-9]{2})-([0-9]{2})$/).slice(1, 4);
        start = parseInt(start);
        end = parseInt(end);
        if (end < start) {
          json.errors.push(`The start (${start}) is superior to the end (${end}) ! It shouldn't be the case.`);
        } else if (!fixPart.match(/^00/)) {
          json.errors.push(`The fix part should start with 00: ${phoneNumbers}`);
        } else if (fixPart.length !== 11) {
          json.errors.push(`The fix part should contain 11 digits: ${phoneNumbers}`);
        }
        phoneNumbers = [];
        for (let i = start; i <= end; i++) phoneNumbers.push(fixPart + `0${i}`.slice(-2));
        if (phoneNumbers.length < 10) {
          json.errors.push(`Seems like the number of phones are lower than expected ${phoneNumbers}`);
        }
      } catch (e) {
        json.errors.push(e.message);
      }
    }
    if (!json.errors.length) {
      for (const phoneNumber of phoneNumbers) {
        try {
          json.added.push(await app.models.PhoneBucket.add(phoneNumber));
        } catch (e) {
          json.errors.push(e.message);
        }
      }
    }
    if (res) res.json(json);
    return json;
  },
};
