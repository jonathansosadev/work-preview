const service = 'VEHICLE_INSPECTION';

function toCamelCase(string) {
  let camelCase = string[0].toUpperCase();
  let currentChar = '';

  for (let i = 1; i < string.length; i++) {
    if (string[i] === '_') {
      i++;
      currentChar = string[i].toUpperCase();
    } else currentChar = string[i].toLowerCase();
    camelCase += currentChar;
  }
  return camelCase;
}

const camelCaseService = toCamelCase(service);

/**
 * THIS IS USED ONLY FOR THE STRUCTURE, IT IS NOT THE ACTUAL THING PRINTED IN THE SURVEY !
 * DO NOT MODIFIED IT !
 **/
const unsatisfiedConfigurations = [
  {
    title: 'Un accueil plus convivial',
    shortTitle: 'Accueil',
    choices: ['Un accueil plus convivial'],
  },
  {
    title: 'Une meilleure explication du rapport de contrôle',
    shortTitle: 'Conseil',
    choices: ['Une meilleure explication du rapport de contrôle'],
  },
  {
    title: 'Une meilleure amabilité et disponibilité du contrôleur',
    shortTitle: 'Contrôleur',
    choices: ['Une meilleure amabilité et disponibilité du contrôleur'],
  },
  {
    title: 'Un centre plus propre et convivial',
    shortTitle: 'Centre',
    choices: ['Un centre plus propre et convivial'],
  },
  {
    title: "De meilleures conditions d'accès au centre",
    shortTitle: 'Accès',
    choices: ["De meilleures conditions d'accès au centre"],
  },
  {
    title: 'Un plus grand choix de disponibilités horaires',
    shortTitle: 'Disponibilités',
    choices: ['Un plus grand choix de disponibilités horaires'],
  },
];

const criteria = {};
const subCriteria = {};
const parentCriterionOf = {};
const criterionTitleOf = {};
const subCriterionChoiceOf = {};
const criterionShortTitleOf = {};
const surveyCriteriaChoices = [];

unsatisfiedConfigurations.forEach((conf, k) => {
  const criterionValue = `${camelCaseService}Criterion_${k}`;

  criteria[`${service}_CRITERION_${k}`] = criterionValue;
  criterionShortTitleOf[criterionValue] = conf.shortTitle;
  criterionTitleOf[criterionValue] = conf.title;
  surveyCriteriaChoices.push({
    value: criterionValue,
    text: conf.title,
  });
  conf.surveySubCriteriaChoices = []; // eslint-disable-line
  conf.visibleIf = `{unsatisfiedCriteria} contains '${criterionValue}'`; // eslint-disable-line
  conf.choices.forEach((choice, sk) => {
    const subCriterionValue = `${camelCaseService}SubCriterion_${k}_${sk}`;

    conf.surveySubCriteriaChoices.push({
      // eslint-disable-line
      value: subCriterionValue,
      text: choice,
    });
    subCriteria[`${service}_SUB_CRITERION_${k}_${sk}`] = subCriterionValue;
    parentCriterionOf[subCriterionValue] = criterionValue;
    subCriterionChoiceOf[subCriterionValue] = choice;
  });
});

// console.log(JSON.stringify(unsatisfiedConfigurations, null, 2)); uncomment to show what's generated =S

module.exports = {
  type: camelCaseService,
  unsatisfiedConfigurations /** ALL unsatisfiedConfigurations LIST **/,
  criteria /** The Criteria: VEHICLE_INSPECTION_CRITERION_0: 'VehicleInspectionCriterion_0 **/,
  subCriteria /** The SUB Criteria: VEHICLE_INSPECTION_SUB_CRITERION_0_0: 'VehicleInspectionSubCriterion_0_0' **/,
  parentCriterionOf /** SUB Criteria to Criteria: VehicleInspectionSubCriterion_0_0: 'VehicleInspectionCriterion_0' **/,
  criterionTitleOf /** The titles of Criteria: VehicleInspection_0: 'Accueil et prise en charge' **/,
  criterionShortTitleOf /** The SHORT title of Criteria: VehicleInspection_0: VehicleInspection0: 'Accueil', **/,
  subCriterionChoiceOf /** The choices of SUB Criteria: VehicleInspectionSubCriterion_0_0: 'Temps d’attente supérieur à 10 minutes' **/,
  surveyCriteriaChoices /** ONLY FOR THE SURVEY TO DISPLAY THE CHOICES IN FIRST PAGE**/,
};
