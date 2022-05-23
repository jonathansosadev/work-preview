/** helper to parse advanced configs*/

/**
Parse a query string and returns a function keep(row)
returns true if we need to keep the row, false otherwise
returns null if the query is not valid

Filter examples
 ["Nom Affaire"] = "GIDAATH" or ["Nom Affaire"] = "VNVOATH"
 ["TypeActeRealise"] = "Facture - Atelier" and ["Etablissement"] = 96
*/

// remove duplicate spaces except between quotes
const cleanSpacesExceptBetweenQuotes = (s) => {
  let pattern = /".*?"/g;
  const originalQuotes = [];
  let current = pattern.exec(s);
  while (current) {
    originalQuotes.push(current[0]);
    current = pattern.exec(s);
  }
  const mod = s.replace(/\s+/g, ' ');
  let final = mod;
  pattern = /".*?"/g;
  current = pattern.exec(mod);
  let q = 0;
  while (current) {
    if (originalQuotes.length > q) {
      final = final.replace(current[0], originalQuotes[q]);
      q++;
    }
    current = pattern.exec(mod);
  }
  return final;
};
/** This function is used to convert a high level logic language into a real test low level (string formatted)
 *  Examples :
 *
 *  > ["Etablissement"] != "96"
 *  < (row["Etablissement"] === undefined || row["Etablissement"] !== "96")
 *
 *  > ["lastName"] inc {"ARVAL ", "BANK", "LA POSTE", "PRa ."}
 *  < (row["lastName"] !== undefined && row["lastName"].toLowerCase().match(/(arval |bank|la poste|pra \.)/))
 *
 *  > ["lastName"] in {"ARVAL d", "BANK", "LA POSTE"}
 *  < (row["lastName"] !== undefined && ["arval d", "bank", "la poste"].includes(row["lastName"].toLowerCase()))
 *
 *  Possibilities :
 *  - Convert to numbers + < > operations :
 *  > ["Etablissement"]*1 > 95
 *  - Conditional statements :
 *  > || or and && !
 *  - Operational statements :
 *  > = != "INSENSIBLE A LA CASSE"i "SENSIBLE A LA CASSE" .include("...") .include("...")i in inc
 **/
const convertRowsFilter = function convertRowsFilter(filter) {
  let f = filter.trim();
  f = cleanSpacesExceptBetweenQuotes(f);
  f = f
    .replace(/]([=!])/g, '] $1') // Separate operator without space (after)
    .replace(/([=<>])("|[0-9])/g, '$1 $2') // Separate operator without space (before)
    .replace(/\s+and\s+/g, ' && ') // Change "and" to "&&"
    .replace(/\s+!=\s+/g, ' !== ') // Change "!=" to "!=="
    .replace(/\s+or\s+/g, ' || ') // Change "or" to "||"
    .replace(/\bnot\[?/g, ' !') // Change "not" to "!"
    .replace(/\s+=\s+/g, ' === ') // Change "=" to "==="
    .replace(/\s+([<>])\s+/g, ' $1 ') // Remove extra spaces around < and >
    .replace(/([!=]==|<|>) [0-9]+/g, '$&)') // Add ) after numbers
    .replace(/(!|)(\[[^\]]+])/g, '(row$2 === undefined || $1row$2')
    .replace(/=== undefined \|\| (row\[[^\]]+](\*1|)( ===| <| >|.includes| in))/g, '!== undefined && $1') // Change test for negations
    .replace(/ ([!=])== ("[^"]+")i/g, (match, $1, $2) => `.toLowerCase() ${$1}== ${$2.toLowerCase()}`) // Add case insensible on === and !==
    .replace(/[!=]== "([^"]+|)"/g, '$&)') // Add ) after === operator and !==
    .replace(/.includes(\("[^"]+"\))i/g, (match, $1) => `.toLowerCase().includes${$1.toLowerCase()}`) //  Add case insensible to includes
    .replace(/.includes\("[^"]+"\)/g, '$&)') //  Add ) after includes
    .replace(
      /(row\[[^\]]+]) in \(([^)]+)\)/g,
      (match, $1, $2) => `[${$2.toLowerCase()}].includes(${$1}.toLowerCase()))`
    ) // in operator case insensible
    .replace(
      /(row\[[^\]]+]) inc \(([^)]+)\)/g,
      (match, $1, $2) =>
        `${$1}.toLowerCase().match(/(${$2
          .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line no-useless-escape
          .replace(/"(\s+|),(\s+|)"/g, '|')
          .replace(/"/g, '')
          .toLowerCase()})/))`
    ); // inc operator case insensible (escape specials)
  return f;
};

const parseRowsFilter = function parseRowsFilter(rawFilter, columns, throwOnError, throwOnFilterError) {
  try {
    if (!rawFilter) {
      return null;
    }
    let filters = [rawFilter];
    if (columns && rawFilter.indexOf('{') >= 0 && rawFilter.indexOf('}') >= 0) {
      const raw = rawFilter.replace(/{'/g, '{"').replace(/}'/g, '}"'); // {'xx'} => {"xx"}
      // lets say we map email with 'mel', 'courrier'
      // we need to replace {'email'} = "x" with ['mel'] = "x" and ['courrier] = "x"
      let notFound = true;
      Object.keys(columns).forEach((c) => {
        if (Object.prototype.hasOwnProperty.call(columns, c)) {
          const token = `{"${c}"}`;
          if (raw.indexOf(token) >= 0 && columns[c]) {
            const values = columns[c];
            const newArray = [];
            const re = new RegExp(token, 'g');
            for (let v = 0; v < values.length; v++) {
              for (let ff = 0; ff < filters.length; ff++) {
                newArray.push(filters[ff].replace(re, `["${values[v]}"]`));
              }
            }
            filters = newArray;
            notFound = false;
          }
        }
      });
      if (notFound) {
        return null;
      }
    }
    const res = [];
    filters.forEach((filter) => {
      /* In August 2018, a filter mistake made us ignore every rows with either firstName or lastName empty
      since we coulnt create a filter like '{firstName} = ""' we added a special filter */
      let f = '';
      // prénom === "" || PRENOM === "" || firstNom === " etc.
      if (filter === 'FIXAOUT2018') {
        const oneFirstNameEmpty =
          (columns['firstName'] && columns['firstName'].map((field) => `row["${field}"] === ""`).join(' || ')) || true;
        const oneLastNameEmpty =
          (columns['lastName'] && columns['lastName'].map((field) => `row["${field}"] === ""`).join(' || ')) || true;
        const atLeastFirstName =
          (columns['firstName'] &&
            columns['firstName'].map((field) => `typeof(row["${field}"]) !== 'undefined'`).join(' || ')) ||
          true;
        const atLeastLastName =
          (columns['lastName'] &&
            columns['lastName'].map((field) => `typeof(row["${field}"]) !== 'undefined'`).join(' || ')) ||
          true;
        f = `(${atLeastFirstName}) && (${atLeastLastName}) &&  (( (${oneFirstNameEmpty}) && !(${oneLastNameEmpty}) ) || ( !(${oneFirstNameEmpty}) && (${oneLastNameEmpty}) ) )`;
      } else {
        f = convertRowsFilter(filter);
      }
      let code = 'for (const r in row) if (typeof(row[r]) === "string") { row[r] = row[r].trim(); }';
      code += ` try { return ${f} } catch(e) { throw e; }`; // eslint-disable-line max-len
      try {
        const fct = Function('row', code); // eslint-disable-line
        const customFunction = (row) => {
          // the !! here is to transform undefined to false
          try {
            return !!fct(row);
          } catch (e) {
            if (throwOnError) {
              throw e;
            } else {
              console.error(e);
              console.error(`Filter error1 : ${filter} => ${e.message}`);
            }
            return true;
          }
        };
        res.push(customFunction);
      } catch (e) {
        if (throwOnFilterError) throw e;
        else {
          console.error(new Error(`${e.message} ${filter}`));
          res.push(() => true);
        }
      }
    });
    return res;
  } catch (e) {
    if (throwOnError) {
      throw e;
    } else {
      console.error(e);
    }
    return null;
  }
};
module.exports = {
  cleanSpacesExceptBetweenQuotes,
  convertRowsFilter,
  parseRowsFilter,
};
