/**
Encrypt/Decrypt id in public url
*/
const _codepoint = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15,
};
// luhn mod 16
const _luhnChecksum = (id) => {
  let sum = 0;
  let factor = 2;
  for (let c = id.length - 1; c >= 0; c--) {
    let f = factor * _codepoint[id[c]];
    if (f > 16) {
      f = Math.floor(f / 16) + (f % 16);
    }
    sum += f;
    factor = factor === 2 ? 1 : 2;
  }
  const r = (16 - (sum % 16)) % 16;
  return r.toString(16);
};
// XOR for hex string
function _getPaddedArray(str, length) {
  const arr = str.split('');
  if (arr.length < length) {
    return Array(length + 1 - arr.length)
      .join(0)
      .split('')
      .concat(arr);
  }
  return arr;
}
function _xor(num1, num2) {
  const arr1 = _getPaddedArray(num1, num2.length);
  const arr2 = _getPaddedArray(num2, num1.length);
  const res = arr1.map((bit1, i) => {
    const bbit1 = parseInt(bit1, 16);
    const bit2 = parseInt(arr2[i], 16);
    return (bbit1 ^ bit2).toString(16);
  });
  return res.join('');
}

const cipher = '1908d4150d9d27a5792f348a';
module.exports = {
  _xor,
  // decrypt a number (return null if the format or the checksum are wrong)
  decrypt: (id) => {
    if (id.length < cipher.length - 1) {
      return null;
    }
    const last = id[id.length - 1];
    const sub = id.substr(0, id.length - 1);
    const checksum = _luhnChecksum(sub);
    if (last !== checksum) {
      return null;
    }
    const xor = _xor(sub, cipher);
    return xor;
  },
  // generate a number from a public review id
  encrypt: (id) => {
    if (typeof id !== 'string') {
      id = id.toString(); // eslint-disable-line
    }
    const xor = _xor(id, cipher);
    const checksum = _luhnChecksum(xor);
    const n = xor + checksum;
    return n;
  },
};
