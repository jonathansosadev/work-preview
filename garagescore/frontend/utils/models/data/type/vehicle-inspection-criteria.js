const service = 'VEHICLE_INSPECTION'

function toCamelCase(string) {
  let camelCase = string[0].toUpperCase()
  let currentChar = ''

  for (let i = 1; i < string.length; i++) {
    if (string[i] === '_') {
      i++
      currentChar = string[i].toUpperCase()
    } else currentChar = string[i].toLowerCase()
    camelCase += currentChar
  }
  return camelCase
}

const camelCaseService = toCamelCase(service)

/**
 * THIS IS USED ONLY FOR THE STRUCTURE, IT IS NOT THE ACTUAL THING PRINTED IN THE SURVEY !
 * DO NOT MODIFIED IT !
 **/
const unsatisfiedConfigurations = [
  {
    title: 'Accueil et prise en charge',
    shortTitle: 'Accueil',
    choices: [
      'Temps d’attente supérieur à 10 minutes',
      'Accueil peu chaleureux'
    ]
  },
  {
    title: 'Écoute et explications du contrôleur',
    shortTitle: 'Conseil',
    choices: [
      "Manque d'explication du procès verbal",
      'Explications peu claires et/ou peu pertinentes'
    ]
  },
  {
    title: 'Respect des engagements de délais et tarif',
    shortTitle: 'Engagements',
    choices: [
      'Durée du contrôle non-respectée',
      'Horaire de restitution non respectée (+/- 10min)',
      'Montant de la facture non conforme au prix annoncé'
    ]
  },
  {
    title: 'Accès au centre',
    shortTitle: 'Accès',
    choices: [
      'Difficulté à trouver le centre',
      'Parking trop petit ou inexistant',
      'Accès peu pratique'
    ]
  },
  {
    title: "Salle d'attente",
    shortTitle: 'Confort',
    choices: [
      "Salle d'attente sale et peu accueillante",
      'Manque de confort (sièges, chauffage, ...)',
      'Manque de service (wifi, boissons, magazines, ...)',
      'Toilettes mal entretenues ou inexistantes'
    ]
  }
]

const criteria = {}
const subCriteria = {}
const parentCriterionOf = {}
const criterionTitleOf = {}
const subCriterionChoiceOf = {}
const criterionShortTitleOf = {}
const surveyCriteriaChoices = []

unsatisfiedConfigurations.forEach((conf, k) => {
  const criterionValue = `${camelCaseService}Criterion_${k}`

  criteria[`${service}_CRITERION_${k}`] = criterionValue
  criterionShortTitleOf[criterionValue] = conf.shortTitle
  criterionTitleOf[criterionValue] = conf.title
  surveyCriteriaChoices.push({
    value: criterionValue,
    text: conf.title
  })
  conf.surveySubCriteriaChoices = []; // eslint-disable-line
  conf.visibleIf = `{unsatisfiedCriteria} contains '${criterionValue}'`; // eslint-disable-line
  conf.choices.forEach((choice, sk) => {
    const subCriterionValue = `${camelCaseService}SubCriterion_${k}_${sk}`

    conf.surveySubCriteriaChoices.push({ // eslint-disable-line
      value: subCriterionValue,
      text: choice
    })
    subCriteria[`${service}_SUB_CRITERION_${k}_${sk}`] = subCriterionValue
    parentCriterionOf[subCriterionValue] = criterionValue
    subCriterionChoiceOf[subCriterionValue] = choice
  })
})

// console.log(JSON.stringify(unsatisfiedConfigurations, null, 2)); uncomment to show what's generated =S

export const type = camelCaseService
export { unsatisfiedConfigurations } /** ALL unsatisfiedConfigurations LIST **/
export { criteria } /** The Criteria: VEHICLE_INSPECTION_CRITERION_0: 'VehicleInspectionCriterion_0 **/
export { subCriteria } /** The SUB Criteria: VEHICLE_INSPECTION_SUB_CRITERION_0_0: 'VehicleInspectionSubCriterion_0_0' **/
export { parentCriterionOf } /** SUB Criteria to Criteria: VehicleInspectionSubCriterion_0_0: 'VehicleInspectionCriterion_0' **/
export { criterionTitleOf } /** The titles of Criteria: VehicleInspection_0: 'Accueil et prise en charge' **/
export { criterionShortTitleOf } /** The SHORT title of Criteria: VehicleInspection_0: VehicleInspection0: 'Accueil', **/
export { subCriterionChoiceOf } /** The choices of SUB Criteria: VehicleInspectionSubCriterion_0_0: 'Temps d’attente supérieur à 10 minutes' **/
export { surveyCriteriaChoices } /** ONLY FOR THE SURVEY TO DISPLAY THE CHOICES IN FIRST PAGE**/
