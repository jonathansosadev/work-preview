import Enum from '~/utils/enum.js'
import { criteria } from './vehicle-inspection-criteria.js'

export default new Enum(
  {
    MAINTENANCE_CRITERIA_1: 'Maintenance1', // 'Accueil et prise en charge',
    MAINTENANCE_CRITERIA_2: 'Maintenance2', // 'Écoute et conseils',
    MAINTENANCE_CRITERIA_3: 'Maintenance3', // 'Clarté et détail du devis',
    MAINTENANCE_CRITERIA_4: 'Maintenance4', // 'Respect des engagements de délai et de tarif',
    MAINTENANCE_CRITERIA_5: 'Maintenance5', // 'Qualité générale de la prestation',
    SALE_NEW_CRITERIA_1: 'SaleNew1', // 'Qualité générale de l\'établissement',
    SALE_NEW_CRITERIA_2: 'SaleNew2', // 'Professionnalisme des équipes',
    SALE_NEW_CRITERIA_3: 'SaleNew3', // 'Services proposés (reprise, garantie, financement)',
    SALE_NEW_CRITERIA_4: 'SaleNew4', // 'Livraison de mon véhicule',
    SALE_NEW_CRITERIA_5: 'SaleNew5', // 'Satisfaction de mon véhicule',
    SALE_USED_CRITERIA_1: 'SaleUsed1', // 'Professionnalisme des équipes',
    SALE_USED_CRITERIA_2: 'SaleUsed2', // 'traçabilité de mon véhicule',
    SALE_USED_CRITERIA_3: 'SaleUsed3', // 'Services proposés (reprise, garantie, financement)',
    SALE_USED_CRITERIA_4: 'SaleUsed4', // 'Livraison de mon véhicule',
    SALE_USED_CRITERIA_5: 'SaleUsed5', // 'Satisfaction de mon véhicule'
    SALE_USED_CRITERIA_6: 'SaleUsed6', // 'La qualité générale de l'établissement'
    ...criteria
  },
  {
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`)
      }
      if (vehicleInspection.criterionShortTitleOf[value])
        return vehicleInspection.criterionShortTitleOf[value]
      switch (value) {
        case this.MAINTENANCE_CRITERIA_1:
          return 'Accueil'
        case this.MAINTENANCE_CRITERIA_2:
          return 'Conseil'
        case this.MAINTENANCE_CRITERIA_3:
          return 'Devis'
        case this.MAINTENANCE_CRITERIA_4:
          return 'Engagements'
        case this.MAINTENANCE_CRITERIA_5:
          return 'Qualité'
        case this.SALE_NEW_CRITERIA_1:
          return 'Qualité établissement'
        case this.SALE_NEW_CRITERIA_2:
          return 'Professionnalisme'
        case this.SALE_NEW_CRITERIA_3:
          return 'Services'
        case this.SALE_NEW_CRITERIA_4:
          return 'Livraison'
        case this.SALE_NEW_CRITERIA_5:
          return 'Véhicule'
        case this.SALE_USED_CRITERIA_1:
          return 'Professionnalisme'
        case this.SALE_USED_CRITERIA_2:
          return 'Traçabilite'
        case this.SALE_USED_CRITERIA_3:
          return 'Services'
        case this.SALE_USED_CRITERIA_4:
          return 'Livraison'
        case this.SALE_USED_CRITERIA_5:
          return 'Véhicule'
        case this.SALE_USED_CRITERIA_6:
          return 'Qualité établissement'
        default:
          return value
      }
    }
  }
)
