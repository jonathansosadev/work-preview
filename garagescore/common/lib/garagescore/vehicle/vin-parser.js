/* Parse VIN Number
Use definitions files to parse make and model
For every parse, every def.file will be tryied


*/
const mercedesSpainMay2019 = require('./vin/mercedes-spain-may2019');
const mercedesSpain2May2019 = require('./vin/mercedes-spain2-may2019');
const smartSpainMay2019 = require('./vin/smart-spain-may2019');
const smartSpain2May2019 = require('./vin/smart-spain2-may2019');

// https://www.w3resource.com/javascript-exercises/javascript-array-exercise-28.php
// perf not tested
function longestCommonPrefix(arr1) {
  const arr = arr1.concat().sort();
  const a1 = arr[0];
  const a2 = arr[arr.length - 1];
  const L = a1.length;
  let i = 0;
  while (i < L && a1.charAt(i) === a2.charAt(i)) {
    i++;
  }
  return a1.substring(0, i);
}
const definitions = [];
const addDefinition = (d) => {
  // add fuzzy models, find keys with common prefix and create a def [common_key_prefix] => model
  /* eg.

      90673113: 'SPRINTER COMBI COMPACTO 313 CD',
      90673313: 'SPRINTER COMBI MEDIO 313 CDI',
      90673513: 'SPRINTER COMBI LARGO T.E. 313',
      =>
      '90673': 'SPRINTER COMBI',
  */
  const fuzzyModels = {};
  Object.keys(d.models).forEach((m) => {
    if (m.length > 5) {
      const k4 = m.substr(0, 4);
      const k5 = m.substr(0, 5);
      if (!fuzzyModels[k4]) {
        fuzzyModels[k4] = [];
      }
      if (!fuzzyModels[k5]) {
        fuzzyModels[k5] = [];
      }
      fuzzyModels[k4].push(d.models[m]);
      fuzzyModels[k5].push(d.models[m]);
    }
  });
  // console.log(fuzzyModels);
  Object.keys(fuzzyModels).forEach((k) => {
    fuzzyModels[k] = fuzzyModels[k].length === 1 ? fuzzyModels[k][0] : longestCommonPrefix(fuzzyModels[k]).trim();
  });
  // remove models too short
  Object.keys(fuzzyModels).forEach((f) => {
    if (!fuzzyModels[f] || fuzzyModels[f].lenth < 3) {
      delete fuzzyModels[f];
    }
  });
  // console.log(fuzzyModels);
  definitions.push({
    makes: d.makes,
    models: d.models,
    fuzzyModels,
  });
};

addDefinition(mercedesSpainMay2019);
addDefinition(smartSpainMay2019);
addDefinition(mercedesSpain2May2019);
addDefinition(smartSpain2May2019);

/** Parse a VIN, return a object with two fields make and model (if found)
 * fuzzy: enable fuzzy search
 */
const parse = (number, fuzzy = false) => {
  const res = {};
  const makes = [number.substr(0, 2), number.substr(0, 3)];
  const models = [
    number.substr(3, 10),
    number.substr(3, 9),
    number.substr(3, 8),
    number.substr(3, 7),
    number.substr(3, 6),
    number.substr(3, 5),
    number.substr(3, 4),
    number.substr(3, 3),
    number.substr(3, 2),
    number.substr(3, 1),
  ];
  for (const def of definitions) {
    const make = def.makes[makes[0]] || def.makes[makes[1]];
    if (make) {
      res.make = make;
      // find exact matched
      for (const dm of models) {
        if (def.models[dm]) {
          res.model = def.models[dm];
          break;
        }
      }
      // try with fuzzy search
      if (!res.model && fuzzy) {
        for (const dm of models) {
          if (def.fuzzyModels[dm]) {
            res.model = def.fuzzyModels[dm];
            break;
          }
        }
      }
    }
    if (res.make && res.model) {
      break;
    }
  }
  return res;
};
// parse an array of vin and return of many of them we could parse
const successRate = (vins, failFct = () => {}) => {
  let ok = 0;
  for (const vin of vins) {
    const res = parse(vin);
    if (res.make && res.model) {
      ok++;
    } else {
      failFct(vin);
    }
  }
  return ok / vins.length;
};
module.exports = { parse, successRate };
