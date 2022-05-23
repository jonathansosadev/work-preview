const removeDuplicates = require('../../../../common/lib/garagescore/data-file/remove-duplicates');

/* eslint-disable max-len */

const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('Detect and ignore duplicates rows:', () => {
  const row = (type, email, mobilePhone, fullName, completedAt, keep) => {
    if (typeof keep === 'undefined') throw new Error('row definition error, count your columns');
    const r = { customer: { contactChannel: { mobilePhone: {}, email: {} } } };
    r.importStats = { dataValidity: { customer: { contactChannel: { email: false, mobilePhone: false } } } };
    if (type) {
      r.type = type;
    }
    if (email) {
      r.customer.contactChannel.email.address = email;
      r.importStats.dataValidity.customer.contactChannel.email = true;
    }
    if (mobilePhone) {
      r.customer.contactChannel.mobilePhone.number = mobilePhone;
      r.importStats.dataValidity.customer.contactChannel.mobilePhone = true;
    }
    if (fullName) {
      r.customer.fullName = fullName;
    }
    if (completedAt) {
      r.completedAt = new Date(completedAt);
    }
    if (keep) {
      r.keep = keep;
    }
    return r;
  };

  const debugRows = function (rows) {
    // eslint-disable-line
    rows.forEach((d) => {
      let s = 'row(';
      s += d.type ? `'${d.type}', ` : 'null, ';
      s += d.customer.contactChannel.email.address ? `'${d.customer.contactChannel.email.address}', ` : 'null, ';
      s += d.customer.contactChannel.mobilePhone.number
        ? `'${d.customer.contactChannel.mobilePhone.number}', `
        : 'null, ';
      s += d.customer.fullName ? `'${d.customer.fullName}', ` : 'null, ';
      s += `${d.completedAt.getTime()}, `;
      s += d.keep ? ' true)' : ' false)';
      console.log(s);
    });
  };

  it('test duplicate', (done) => {
    const rows = [
      row('Maintenance', 'donou.bernard@wanadoo.fr', '0651853237', 'CHRISTINE', 1, false),
      row('Maintenance', 'donou.bernard@wanadoo.fr', '0651853237', 'CHRISTINE', 2, true),
      row('Maintenance', 'donou.bernard2@wanadoo.fr', '0601853237', 'CHRISTINE', 1, true),
      row('Maintenance', 'donou.bernard2@wanadoo.fr', '0601853237', 'CHRISTINE', 1, false),
      row('Maintenance', 'tanguy-abgrall@orange.fr', '0682387071', 'CHRISTIANE', 1, true),
      row('Maintenance', null, '0682387071', 'CHRISTIANE', 2, false),
      row('Maintenance', '2tanguy-abgrall@orange.fr', '0680387071', 'CHRISTIANE', 1, true),
      row('Maintenance', null, '0680387071', 'JP', 2, false),
      row('Maintenance', '3tanguy-abgrall@orange.fr', null, 'PASCAL', 1, false),
      row('Maintenance', '3tanguy-abgrall@orange.fr', '0620245894', 'PASCAL', 2, true),
      row('Maintenance', '4tanguy-abgrall@orange.fr', '0621245894', 'PASCAL', 1, false),
      row('Maintenance', '4tanguy-abgrall@orange.fr', '0622245894', 'PASCAL', 2, true),
      row('Maintenance', null, null, 'REMI sans coordonnees 1', 1, true),
      row('Maintenance', null, null, 'REMI sans coordonnees 2', 2, false),
      row('Maintenance', null, null, 'REMI sans coordonnees 2', 3, true),
      row('Maintenance', null, null, 'REMI sans coordonnees 2', 3, false),
      row('Maintenance', 'toto1@gs.com', '0610101010', 'REMI bizarre', 5, true),
      row('Maintenance', 'toto2@gs.com', '0610101010', 'REMI bizarre', 5, true),
      row('Maintenance', null, '0610101067', 'REMI bizarre', 5, false),
      row('Maintenance', null, '0610101067', 'REMI bizarre', 9, true),
    ];
    const expected = rows.reduce((reduced, r) => {
      if (r.keep) reduced.push(r);
      return reduced;
    }, []);

    const dedup = rows.slice(0);
    removeDuplicates(dedup, ['Maintenance'], () => {
      // dedup.forEach(d => console.log(`${d.customer.contactChannel.mobilePhone.number} ${d.customer.contactChannel.email.address}`));
      expect(dedup.length).equals(expected.length);
      expect(dedup).to.eql(expected);
      done();
    });
  });
});
