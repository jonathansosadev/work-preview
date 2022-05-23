/* Fix broken emails (as 'izabelle,x@gmail,com', 'cat.ricard@orange .fr','mlefebvre@xi-consulting.fr (gérant)' ... ) */
const { tldExists } = require('tldjs');
const levenshtein = require('./levenshtein');

// check if a string is a valid email address
const isEmail = (s) =>
  /^(([^<>()\[\]\\.,;:–\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    s
  ) && tldExists(s); // eslint-disable-line
// check if a string contains a valid email address
const extractEmailFromString = (s) => {
  const m = s.match(
    /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/
  ); // eslint-disable-line
  if (m) {
    let result = m[0];
    m.forEach((x) => {
      if (x && x.length > result.length) {
        result = x;
      }
    });
    return result;
  }
  return null;
};

// check if a string contains patterns as nc@/pasdemail@
const isNCString = (s) => {
  const t = s.toLowerCase().replace(/\s/g, '');
  if (t.length <= 5) {
    return true;
  }
  if (!t.indexOf('pasdemail')) {
    return true;
  }
  if (!t.indexOf('notiene')) {
    return true;
  }
  if (!t.indexOf('@')) {
    return false;
  }
  return t.indexOf('sans@') >= 0 || /\bnc@/.test(t) || false;
};

const _tldsFix = {
  fe: 'fr',
  cfr: 'fr', // eslint-disable-line
  ite: 'it', // eslint-disable-line
  nt: 'net',
  vnet: 'net',
  ney: 'net',
  nat: 'net',
  nrt: 'net', // eslint-disable-line
  cim: 'com',
  ccom: 'com',
  cum: 'com', // eslint-disable-line
  'finances-gouv-fr': 'finances-gouv.fr',
  renaultfr: 'renault.fr', // eslint-disable-line
};
// auto correct domains
const _fixDomain = (s) => {
  let t = s;
  // add forgotten @ 'sabrina.samir41gmail.com'
  if (t.indexOf('@') < 0) {
    ['gmail.', 'hotmail.', 'hotmail.', 'outlook.', 'wanadoo.', 'sfr.', 'free.', 'club-internet.', 'orange.'] // eslint-disable-line max-len
      .forEach((domain) => {
        t = t.replace(new RegExp(/([0-9a-z])/.source + domain), `$1@${domain}`);
      }); // eslint-disable-line max-len
  }
  // add forgotten TLD 'corinne.vautrin@sfr'
  [
    ['@.*gmail.*$', '@gmail.com'],
    ['@.*wanadoo.*$', '@wanadoo.fr'],
    ['@.*sfr.*$', '@sfr.fr'],
    ['@free.*$', '@free.fr'],
    ['@.*orange.*$', '@orange.fr'],
    ['@club-internet.*$', '@club-internet.fr'],
    ['@alice.adsl.*$', '@aliceadsl.fr'],
  ] // eslint-disable-line max-len
    .forEach((domain) => {
      t = t.replace(new RegExp(domain[0]), domain[1]);
    }); // eslint-disable-line max-len
  // fix tld
  if (t.indexOf('@') > 0) {
    // fix tld syntax errors 'titoph@cgtel.nt'
    const tld = t.substr(1 + t.lastIndexOf('.'));
    if (_tldsFix[tld]) {
      t = t.replace(new RegExp(tld + '$'), _tldsFix[tld]); // eslint-disable-line
    }
    // remove additional chars at the end 'laurent@lesbavarez.frf'
    t = t.replace(/(@.*)\.co.+$/, '$1.com');
    t = t.replace(/(@.*)\.f.+$/, '$1.fr');
    t = t.replace(/(@.*)\.net.+$/, '$1.net');
    t = t.replace(/(@.*)\.org.+$/, '$1.org');

    // find similar domain  'ftimbert@glail.com' 'nelly.noel13@wanad00.fr' 'justine.lec22@hutlook.fr'
    const domain = t.substr(1 + t.lastIndexOf('@'));
    const domains = ['gmail.com', 'wanadoo.fr', 'hotlook.fr', 'hotlook.com', 'aol.com'];
    for (let d = 0; d < domains.length; d++) {
      const dom = domains[d];
      if (dom === domain) {
        break;
      }
      const distance = levenshtein.distance(dom, domain);
      if (distance < 3) {
        t = t.replace(new RegExp(domain + '$'), dom); // eslint-disable-line
        break;
      }
    }
  }
  return t;
};
// try to autocorrect a malformed email address
const autoCorrect = (s) => {
  let t = s.toLowerCase();
  const t2 = extractEmailFromString(t);
  if (t2 !== t && isEmail(t2)) {
    return t2;
  }
  // replace , and remove space 'izabelle,x@gmail,com' 'cat.ricard@orange .fr'
  t = t.replace(/[,;:]/g, '.').replace(/\s/g, '');
  if (isNCString(t)) {
    return null;
  }
  if (isEmail(t)) {
    return t;
  }
  t = _fixDomain(t);
  if (isEmail(t)) {
    return t;
  }
  // replace - by . at the end 'daniel-p.vidale@dgfip.finances-gouv-fr'
  t = t.replace(/-fr$/, '.fr').replace(/-com$/, '.com').replace(/-net$/, '.net');
  if (isEmail(t)) {
    return t;
  }
  // clean carac at specific positions '.mariecotron@hotmail.fr' 'GREGORY.SAUVAGE.@WANADOO.FR'
  t = t
    .replace(/^[^a-z0-9]/, '')
    .replace(/[^a-z0-9]$/, '')
    .replace(/[^a-z0-9]@/, '@')
    .replace(/@[^a-z0-9]/, '@');
  if (isEmail(t)) {
    return t;
  }
  // get email in substr 'Pharmacie Principale Maurepas <contact@pharmaciemaurepas.fr>'	'mlefebvre@xi-consulting.fr (gérant)'
  const et = extractEmailFromString(t) || '';
  if (isEmail(et)) {
    return et;
  }
  return null;
};
// check if a string could be a malforme email
// eslint-disable-next-line
const probableSyntaxError = (s) =>
  s.indexOf('@') > 0 && s.indexOf('@') < s.length - 3 && s.length > 6 && !isNCString(s); // this '6' is totally random...

module.exports = { isEmail, extractEmailFromString, autoCorrect, probableSyntaxError, isNCString };
