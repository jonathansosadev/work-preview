// remove duplicates from imported rows
const debug = require('debug')('garagescore:common:lib:garagescore:data-file:remove-duplicates'); // eslint-disable-line max-len,no-unused-consts
const async = require('async');

// remove duplicate rows, helper functions
const compareDuplicatesFuncNoEmpty = function compareDuplicatesFuncNoEmpty(rowInfo1, rowInfo2, field) {
  return rowInfo1[field] && rowInfo2[field]; // eslint-disable-line
};
const compareDuplicatesFuncEmpty = function compareDuplicatesFuncEmpty(rowInfo1, rowInfo2, field) {
  return !rowInfo1[field] && !rowInfo2[field]; // eslint-disable-line
};
const compareDuplicatesFuncSame = function compareDuplicatesFuncSame(rowInfo1, rowInfo2, field) {
  return rowInfo1[field] === rowInfo2[field];
};
const compareDuplicatesFuncOneEmpty = function compareDuplicatesFuncOneEmpty(rowInfo1, rowInfo2, field) {
  return (rowInfo1[field] && !rowInfo2[field]) || (!rowInfo1[field] && rowInfo2[field]); // eslint-disable-line
};
const compareDuplicatesFuncDifferent = function compareDuplicatesFuncDifferent(rowInfo1, rowInfo2, field) {
  return rowInfo1[field] !== rowInfo2[field];
};

/** compares two rowInfos,
 * if they are not duplicate, returns 0
 * if they are duplicates and rowInfo1 is to be kept, return -1
 * if they are duplicates and rowInfo2 is to be kept, return 1
 */
const compareDuplicates = function compareDuplicates(rowInfo1, rowInfo2) {
  // for performances reason, we init the consts only before the conditions needing them
  const noEmptyEmail = compareDuplicatesFuncNoEmpty(rowInfo1, rowInfo2, 'email');
  const noEmptyMobilePhone = compareDuplicatesFuncNoEmpty(rowInfo1, rowInfo2, 'mobilePhone');
  const sameEmail = compareDuplicatesFuncSame(rowInfo1, rowInfo2, 'email');
  const sameMobilePhone = compareDuplicatesFuncSame(rowInfo1, rowInfo2, 'mobilePhone');
  // Si email & mobilePhone sont identiques (hors 2x vides) : prendre la date d'inter la plus récente
  if (noEmptyEmail && noEmptyMobilePhone && sameEmail && sameMobilePhone) {
    // dedup completedAt
    const r1 = { reason: 'same email and mobilePhone' };
    r1.value = rowInfo1.completedAt < rowInfo2.completedAt ? 1 : -1;
    return r1;
  }

  const emptyEmail = compareDuplicatesFuncEmpty(rowInfo1, rowInfo2, 'email');
  const emptyMobilePhone = compareDuplicatesFuncEmpty(rowInfo1, rowInfo2, 'mobilePhone');
  const sameFullName = compareDuplicatesFuncSame(rowInfo1, rowInfo2, 'fullName');
  // Si email & mobilePhone sont vides : **dedup sur les FullName**
  if (emptyEmail && emptyMobilePhone && sameFullName) {
    // dedup completedAt
    const r2 = { reason: 'no email, no mobilePhone, same fullName' };
    r2.value = rowInfo1.completedAt < rowInfo2.completedAt ? 1 : -1;
    return r2;
  }

  const sameCompletedAt = compareDuplicatesFuncSame(rowInfo1, rowInfo2, 'completedAt');
  // si email & mobilePhone & date d'inter sont identiques (y compris 1 des 2 vide) : prendre la première ligne par défaut
  if (noEmptyEmail && sameEmail && emptyMobilePhone && sameCompletedAt) {
    // dedup premiere ligne
    const r3 = { reason: 'same email, empty mobilePhone, same completedAt' };
    r3.value = -1;
    return r3;
  }
  if (noEmptyMobilePhone && sameMobilePhone && emptyEmail && sameCompletedAt) {
    // dedup premiere ligne
    const r4 = { reason: 'same mobilePhone, empty email , same completedAt' };
    r4.value = -1;
    return r4;
  }
  const differentMobilePhone = compareDuplicatesFuncDifferent(rowInfo1, rowInfo2, 'mobilePhone');
  // Si email identiques & mobilePhone vides , prendre la date d'inter la plus récente
  if (noEmptyEmail && sameEmail && emptyMobilePhone) {
    // dedup completedAt
    const r5 = { reason: 'same email, no mobilePhone' };
    r5.value = rowInfo1.completedAt < rowInfo2.completedAt ? 1 : -1;
    return r5;
  }
  // Si mobilePhone identiques & emails vides , prendre la date d'inter la plus récente
  if (noEmptyMobilePhone && sameMobilePhone && emptyEmail) {
    // dedup completedAt
    const r5 = { reason: 'same mobilePhone, no email' };
    r5.value = rowInfo1.completedAt < rowInfo2.completedAt ? 1 : -1;
    return r5;
  }
  // Si email identiques & mobilePhone ≠ (hors vides), prendre la date d'inter la plus récente
  if (noEmptyEmail && sameEmail && differentMobilePhone) {
    // dedup completedAt
    const r6 = { reason: 'same email, different mobilePhone' };
    r6.value = rowInfo1.completedAt < rowInfo2.completedAt ? 1 : -1;
    return r6;
  }
  const oneEmptyMobilePhone = compareDuplicatesFuncOneEmpty(rowInfo1, rowInfo2, 'mobilePhone');
  // Si email identiques & mobilePhone ≠ (dont 1 mobilePhone vide), ou l'inverse, garder la ligne qui contient les 2 infos pleines
  if (noEmptyEmail && sameEmail && differentMobilePhone && oneEmptyMobilePhone) {
    const r7 = { reason: 'same email, one empty mobilePhone' };
    r7.value = rowInfo1.mobilePhone ? -1 : 1;
    return r7;
  }
  const differentEmail = compareDuplicatesFuncDifferent(rowInfo1, rowInfo2, 'email');
  const oneEmptyEmail = compareDuplicatesFuncOneEmpty(rowInfo1, rowInfo2, 'email');
  if (noEmptyMobilePhone && sameMobilePhone && differentEmail && oneEmptyEmail) {
    // garder la ligne qui contient les 2 infos pleines
    const r8 = { reason: 'same mobilePhone, one empty email' };
    r8.value = rowInfo1.email ? -1 : 1;
    return r8;
  }
  return { value: 0 };
};
const isMobilePhoneValid = (row) =>
  row &&
  row.importStats &&
  row.importStats.dataValidity &&
  row.importStats.dataValidity.customer &&
  row.importStats.dataValidity.customer.contactChannel &&
  row.importStats.dataValidity.customer.contactChannel.mobilePhone;

const isEmailValid = (row) =>
  row &&
  row.importStats &&
  row.importStats.dataValidity &&
  row.importStats.dataValidity.customer &&
  row.importStats.dataValidity.customer.contactChannel &&
  row.importStats.dataValidity.customer.contactChannel.email;

const removeDuplicatesPerType = function removeDuplicatesPerType(rows, type, callback) {
  if (!rows) {
    callback();
    return;
  }

  // return mobile, email and completedAt (in ms) of a row
  const rowInfo = (row) => {
    let mobilePhone = null;
    let email = null;
    if (row.customer && row.customer.contactChannel) {
      const contact = row.customer.contactChannel;
      if (
        contact.mobilePhone &&
        contact.mobilePhone.number &&
        contact.mobilePhone.number.length > 0 &&
        isMobilePhoneValid(row)
      ) {
        mobilePhone = contact.mobilePhone.number;
      }
      if (contact.email && contact.email.address && contact.email.address.length > 0 && isEmailValid(row)) {
        email = contact.email.address;
      }
    }

    const completedAt = row.completedAt ? row.completedAt.getTime() : 0;
    const fullName = row.customer && row.customer.fullName;
    return {
      type: row.type,
      mobilePhone,
      email,
      fullName,
      completedAt,
    };
  };

  // we will use a summary instead of the real rows
  const rowInfos = rows.map(rowInfo);

  // we search duplicate mobile/emails
  const mobilePhonesFound = {};
  const duplicateMobilePhonesFound = {};
  const emailsFound = {};
  const duplicateEmailsFound = {};
  rowInfos.forEach((ri) => {
    if (type && ri.type !== type) return;
    if (ri.mobilePhone) {
      if (mobilePhonesFound[ri.mobilePhone]) {
        duplicateMobilePhonesFound[ri.mobilePhone] = true;
      } else {
        mobilePhonesFound[ri.mobilePhone] = true;
      }
    }
    if (ri.email) {
      if (emailsFound[ri.email]) {
        duplicateEmailsFound[ri.email] = true;
      } else {
        emailsFound[ri.email] = true;
      }
    }
  });
  const notAPotentialDuplicate = (r) => {
    if (!r.email && !r.mobilePhone) {
      return false;
    }
    if (r.email && duplicateEmailsFound[r.email]) {
      return false;
    }
    if (r.mobilePhone && duplicateMobilePhonesFound[r.mobilePhone]) {
      return false;
    }
    return true;
  };
  // row by row, we check the duplicates with the others
  // if row.keep === false, it's to be removed
  async.forEachOfSeries(
    rowInfos,
    (ri, i, next) => {
      /* eslint-disable no-param-reassign*/
      if (ri.keep === false) {
        next();
        return;
      } // already processed
      if (type && ri.type !== type) {
        ri.keep = true;
        next();
        return;
      } // ignored
      ri.keep = true;
      if (notAPotentialDuplicate(ri)) {
        next();
        return;
      }
      for (let j = i + 1; j < rowInfos.length; j++) {
        const ri2 = rowInfos[j];
        if (!notAPotentialDuplicate(ri2) && ri2.keep !== false) {
          const c = compareDuplicates(ri, ri2);
          if (c.value === 1) {
            debug(`Remove row ${rowInfos.length - i}, duplicate of row ${rowInfos.length - j} : ${c.reason}`);
            ri.keep = false;
            break;
          } else if (c.value === -1) {
            debug(`Remove row ${rowInfos.length - j}, duplicate of row ${rowInfos.length - i} : ${c.reason}`);
            ri2.keep = false;
          }
        }
      }
      next();
      /* eslint-enable no-param-reassign*/
    },
    () => {
      // console.log(rowInfos);
      const indexesToRemove = rowInfos.reduce((toRemove, ri, i) => {
        if (ri.keep === false) toRemove.push(i);
        return toRemove;
      }, []);

      for (let i = indexesToRemove.length - 1; i >= 0; i--) {
        rows.splice(indexesToRemove[i], 1); // eslint-disable-line no-param-reassign
      }
      callback();
    }
  );
};

module.exports = function removeDuplicates(rows, types, callback) {
  if (!types) {
    removeDuplicatesPerType(rows, null, callback);
    return;
  }
  async.forEachOfSeries(
    types,
    (type, t, next) => {
      removeDuplicatesPerType(rows, type, next);
    },
    callback
  );
};
