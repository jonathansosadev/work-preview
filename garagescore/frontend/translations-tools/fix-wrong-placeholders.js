/**
 * Machine translation can translate the {variables}
 * Get the variables from french and compare them with the other languages
 * */

const fs = require('fs')
const reg = /\{([^)]+)\}/;
const placeholders = (s) => {
  const m = s && s.match(reg);
  return m && m[1];
}
async function main(lang) {
  const fr = require("../translations/fr.json");
  const transl = require(`../translations/${lang}.json`);
  const replaces = [];
  Object.keys(fr).forEach(p => {
    Object.keys(fr[p]).forEach(k => {
      try {
        if (typeof fr[p][k] === 'string' && transl[p] && fr[p][k].indexOf('{') >= 0) {
          const a = placeholders(fr[p][k]);
          const b = placeholders(transl[p][k]);
          if (a !== b && a.indexOf("{") < 0) {
            replaces.push([`{${b}}`, `{${a}}`])
          //process.exit();
          
        }
      }
      } catch (e) {
        console.error({ p, k, e });
        process.exit()
      }
    })
  });
  let text = await fs.readFileSync(`frontend/translations/${lang}.json`, 'utf8');
  replaces.forEach(([b, a]) => {
    if (!a && !b) {
      console.log("CANNOT replaceAll", b, "by", a);
    } else {
    try {
      console.log("replaceAll", b, "by", a);
      text = text.replace(new RegExp(b, "g"), a);
    } catch (e) {
        console.error({ a, b, e });
        process.exit()
      }

    }
  })

  await fs.writeFileSync(`frontend/translations/${lang}.json`, text, 'utf8');

  
}


main("nl")