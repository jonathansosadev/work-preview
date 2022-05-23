import Enum from '../../../enum'
import dataTypes from './data-types'
import ReviewDetailedCriteria from './review-detailed-criterias'
import * as vehicleInspection from './vehicle-inspection-criteria.js'

export default new Enum(
  {
    // 'Accueil et prise en charge',
    MAINTENANCE_SUB_CRITERIA_1: 'Maintenance1',
    MAINTENANCE_SUB_CRITERIA_2: 'Maintenance2',
    MAINTENANCE_SUB_CRITERIA_3: 'Maintenance3',
    MAINTENANCE_SUB_CRITERIA_4: 'Maintenance4',
    MAINTENANCE_SUB_CRITERIA_5: 'Maintenance5',
    MAINTENANCE_SUB_CRITERIA_6: 'Maintenance6',
    MAINTENANCE_SUB_CRITERIA_7: 'Maintenance7',
    MAINTENANCE_SUB_CRITERIA_8: 'Maintenance8',
    MAINTENANCE_SUB_CRITERIA_10: 'Maintenance10',
    MAINTENANCE_SUB_CRITERIA_11: 'Maintenance11',
    MAINTENANCE_SUB_CRITERIA_12: 'Maintenance12',
    MAINTENANCE_SUB_CRITERIA_13: 'Maintenance13',
    MAINTENANCE_SUB_CRITERIA_15: 'Maintenance15',
    MAINTENANCE_SUB_CRITERIA_16: 'Maintenance16',
    MAINTENANCE_SUB_CRITERIA_17: 'Maintenance17',
    MAINTENANCE_SUB_CRITERIA_18: 'Maintenance18',
    MAINTENANCE_SUB_CRITERIA_20: 'Maintenance20',
    MAINTENANCE_SUB_CRITERIA_21: 'Maintenance21',
    MAINTENANCE_SUB_CRITERIA_22: 'Maintenance22',
    MAINTENANCE_SUB_CRITERIA_23: 'Maintenance23',
    MAINTENANCE_SUB_CRITERIA_24: 'Maintenance24',
    SALE_NEW_SUB_CRITERIA_1: 'SaleNew1',
    SALE_NEW_SUB_CRITERIA_2: 'SaleNew2',
    SALE_NEW_SUB_CRITERIA_3: 'SaleNew3',
    SALE_NEW_SUB_CRITERIA_4: 'SaleNew4',
    SALE_NEW_SUB_CRITERIA_5: 'SaleNew5',
    SALE_NEW_SUB_CRITERIA_6: 'SaleNew6',
    SALE_NEW_SUB_CRITERIA_7: 'SaleNew7',
    SALE_NEW_SUB_CRITERIA_8: 'SaleNew8',
    SALE_NEW_SUB_CRITERIA_10: 'SaleNew10',
    SALE_NEW_SUB_CRITERIA_11: 'SaleNew11',
    SALE_NEW_SUB_CRITERIA_12: 'SaleNew12',
    SALE_NEW_SUB_CRITERIA_13: 'SaleNew13',
    SALE_NEW_SUB_CRITERIA_15: 'SaleNew15',
    SALE_NEW_SUB_CRITERIA_16: 'SaleNew16',
    SALE_NEW_SUB_CRITERIA_17: 'SaleNew17',
    SALE_NEW_SUB_CRITERIA_18: 'SaleNew18',
    SALE_NEW_SUB_CRITERIA_20: 'SaleNew20',
    SALE_NEW_SUB_CRITERIA_21: 'SaleNew21',
    SALE_NEW_SUB_CRITERIA_22: 'SaleNew22',
    SALE_NEW_SUB_CRITERIA_23: 'SaleNew23',
    SALE_USED_SUB_CRITERIA_1: 'SaleUsed1',
    SALE_USED_SUB_CRITERIA_2: 'SaleUsed2',
    SALE_USED_SUB_CRITERIA_3: 'SaleUsed3',
    SALE_USED_SUB_CRITERIA_4: 'SaleUsed4',
    SALE_USED_SUB_CRITERIA_5: 'SaleUsed5',
    SALE_USED_SUB_CRITERIA_6: 'SaleUsed6',
    SALE_USED_SUB_CRITERIA_7: 'SaleUsed7',
    SALE_USED_SUB_CRITERIA_8: 'SaleUsed8',
    SALE_USED_SUB_CRITERIA_10: 'SaleUsed10',
    SALE_USED_SUB_CRITERIA_11: 'SaleUsed11',
    SALE_USED_SUB_CRITERIA_12: 'SaleUsed12',
    SALE_USED_SUB_CRITERIA_13: 'SaleUsed13',
    SALE_USED_SUB_CRITERIA_15: 'SaleUsed15',
    SALE_USED_SUB_CRITERIA_16: 'SaleUsed16',
    SALE_USED_SUB_CRITERIA_17: 'SaleUsed17',
    SALE_USED_SUB_CRITERIA_18: 'SaleUsed18',
    SALE_USED_SUB_CRITERIA_20: 'SaleUsed20',
    SALE_USED_SUB_CRITERIA_21: 'SaleUsed21',
    SALE_USED_SUB_CRITERIA_22: 'SaleUsed22',
    SALE_USED_SUB_CRITERIA_23: 'SaleUsed23',
    SALE_USED_SUB_CRITERIA_25: 'SaleUsed25',
    SALE_USED_SUB_CRITERIA_26: 'SaleUsed26',
    SALE_USED_SUB_CRITERIA_27: 'SaleUsed27',
    SALE_USED_SUB_CRITERIA_28: 'SaleUsed28',
    ...vehicleInspection.subCriteria
  },
  {
    getParentCriteria(value) {
      if (vehicleInspection.parentCriterionOf[value])
        return vehicleInspection.parentCriterionOf[value]
      switch (value) {
        case this.MAINTENANCE_SUB_CRITERIA_1:
        case this.MAINTENANCE_SUB_CRITERIA_2:
        case this.MAINTENANCE_SUB_CRITERIA_3:
        case this.MAINTENANCE_SUB_CRITERIA_4:
        case this.MAINTENANCE_SUB_CRITERIA_24:
          return ReviewDetailedCriteria.MAINTENANCE_CRITERIA_1
        case this.MAINTENANCE_SUB_CRITERIA_5:
        case this.MAINTENANCE_SUB_CRITERIA_6:
        case this.MAINTENANCE_SUB_CRITERIA_7:
        case this.MAINTENANCE_SUB_CRITERIA_8:
          return ReviewDetailedCriteria.MAINTENANCE_CRITERIA_2
        case this.MAINTENANCE_SUB_CRITERIA_10:
        case this.MAINTENANCE_SUB_CRITERIA_11:
        case this.MAINTENANCE_SUB_CRITERIA_12:
        case this.MAINTENANCE_SUB_CRITERIA_13:
          return ReviewDetailedCriteria.MAINTENANCE_CRITERIA_3
        case this.MAINTENANCE_SUB_CRITERIA_15:
        case this.MAINTENANCE_SUB_CRITERIA_16:
        case this.MAINTENANCE_SUB_CRITERIA_17:
        case this.MAINTENANCE_SUB_CRITERIA_18:
          return ReviewDetailedCriteria.MAINTENANCE_CRITERIA_4
        case this.MAINTENANCE_SUB_CRITERIA_20:
        case this.MAINTENANCE_SUB_CRITERIA_21:
        case this.MAINTENANCE_SUB_CRITERIA_22:
        case this.MAINTENANCE_SUB_CRITERIA_23:
          return ReviewDetailedCriteria.MAINTENANCE_CRITERIA_5
        case this.SALE_NEW_SUB_CRITERIA_1:
        case this.SALE_NEW_SUB_CRITERIA_2:
        case this.SALE_NEW_SUB_CRITERIA_3:
        case this.SALE_NEW_SUB_CRITERIA_4:
          return ReviewDetailedCriteria.SALE_NEW_CRITERIA_1
        case this.SALE_NEW_SUB_CRITERIA_5:
        case this.SALE_NEW_SUB_CRITERIA_6:
        case this.SALE_NEW_SUB_CRITERIA_7:
        case this.SALE_NEW_SUB_CRITERIA_8:
          return ReviewDetailedCriteria.SALE_NEW_CRITERIA_2
        case this.SALE_NEW_SUB_CRITERIA_10:
        case this.SALE_NEW_SUB_CRITERIA_11:
        case this.SALE_NEW_SUB_CRITERIA_12:
        case this.SALE_NEW_SUB_CRITERIA_13:
          return ReviewDetailedCriteria.SALE_NEW_CRITERIA_3
        case this.SALE_NEW_SUB_CRITERIA_15:
        case this.SALE_NEW_SUB_CRITERIA_16:
        case this.SALE_NEW_SUB_CRITERIA_17:
        case this.SALE_NEW_SUB_CRITERIA_18:
          return ReviewDetailedCriteria.SALE_NEW_CRITERIA_4
        case this.SALE_NEW_SUB_CRITERIA_20:
        case this.SALE_NEW_SUB_CRITERIA_21:
        case this.SALE_NEW_SUB_CRITERIA_22:
        case this.SALE_NEW_SUB_CRITERIA_23:
          return ReviewDetailedCriteria.SALE_NEW_CRITERIA_5
        case this.SALE_USED_SUB_CRITERIA_1:
        case this.SALE_USED_SUB_CRITERIA_2:
        case this.SALE_USED_SUB_CRITERIA_3:
        case this.SALE_USED_SUB_CRITERIA_4:
          return ReviewDetailedCriteria.SALE_USED_CRITERIA_1
        case this.SALE_USED_SUB_CRITERIA_5:
        case this.SALE_USED_SUB_CRITERIA_6:
        case this.SALE_USED_SUB_CRITERIA_7:
        case this.SALE_USED_SUB_CRITERIA_8:
          return ReviewDetailedCriteria.SALE_USED_CRITERIA_2
        case this.SALE_USED_SUB_CRITERIA_10:
        case this.SALE_USED_SUB_CRITERIA_11:
        case this.SALE_USED_SUB_CRITERIA_12:
        case this.SALE_USED_SUB_CRITERIA_13:
          return ReviewDetailedCriteria.SALE_USED_CRITERIA_3
        case this.SALE_USED_SUB_CRITERIA_15:
        case this.SALE_USED_SUB_CRITERIA_16:
        case this.SALE_USED_SUB_CRITERIA_17:
        case this.SALE_USED_SUB_CRITERIA_18:
          return ReviewDetailedCriteria.SALE_USED_CRITERIA_4
        case this.SALE_USED_SUB_CRITERIA_20:
        case this.SALE_USED_SUB_CRITERIA_21:
        case this.SALE_USED_SUB_CRITERIA_22:
        case this.SALE_USED_SUB_CRITERIA_23:
          return ReviewDetailedCriteria.SALE_USED_CRITERIA_5
        case this.SALE_USED_SUB_CRITERIA_25:
        case this.SALE_USED_SUB_CRITERIA_26:
        case this.SALE_USED_SUB_CRITERIA_27:
        case this.SALE_USED_SUB_CRITERIA_28:
          return ReviewDetailedCriteria.SALE_USED_CRITERIA_6
        default:
          return value
      }
    },
    displayName(value, language = 'fr') {
      if (language !== 'fr') {
        throw new Error(`Language ${language} is not supported`)
      }
      if (vehicleInspection.subCriterionChoiceOf[value])
        return vehicleInspection.subCriterionChoiceOf[value]
      switch (value) {
        case this.MAINTENANCE_SUB_CRITERIA_1:
          return 'Temps d’attente supérieur à 10 minutes' // 42
        case this.MAINTENANCE_SUB_CRITERIA_2:
          return 'Salle d’attente sale et peu accueillante' // 43
        case this.MAINTENANCE_SUB_CRITERIA_3:
          return 'Barème tarifaire difficilement accessible' // 44
        case this.MAINTENANCE_SUB_CRITERIA_4:
          return 'Véhicule de prêt et paiement x fois non-proposés' // 45
        case this.MAINTENANCE_SUB_CRITERIA_5:
          return 'Examen du véhicule effectué sans ma présence' // 49
        case this.MAINTENANCE_SUB_CRITERIA_6:
          return 'Diagnostic flou et non-argumenté' // 50
        case this.MAINTENANCE_SUB_CRITERIA_7:
          return 'Délai d’intervention non-communiqué' // 51
        case this.MAINTENANCE_SUB_CRITERIA_8:
          return 'Professionnel peu rassurant' // 122
        case this.MAINTENANCE_SUB_CRITERIA_10:
          return 'Devis non-remis avant l’intervention' // 54
        case this.MAINTENANCE_SUB_CRITERIA_11:
          return 'Devis sans détail des travaux à effectuer' // 55
        case this.MAINTENANCE_SUB_CRITERIA_12:
          return 'Prestations additionnelles non-nécessaires' // 123
        case this.MAINTENANCE_SUB_CRITERIA_13:
          return 'Intervention réalisée sans mon accord' // 57
        case this.MAINTENANCE_SUB_CRITERIA_15:
          return 'Durée d’immobilisation non-respectée' // 60
        case this.MAINTENANCE_SUB_CRITERIA_16:
          return 'Horaire de restitution non-respecté (+/- 10 minutes)' // 61
        case this.MAINTENANCE_SUB_CRITERIA_17:
          return 'Montant de la facture non-conforme au devis (+/- 5%)' // 62
        case this.MAINTENANCE_SUB_CRITERIA_18:
          return 'Tarif incorrect par rapport aux concurrents' // 63
        case this.MAINTENANCE_SUB_CRITERIA_20:
          return 'Intervention du professionnel insatisfaisante' // 66
        case this.MAINTENANCE_SUB_CRITERIA_21:
          return 'Intervention ayant nécessité plusieurs visites' // 67
        case this.MAINTENANCE_SUB_CRITERIA_22:
          return 'Véhicule restitué sale ou pas dans son état d’origine' // 68
        case this.MAINTENANCE_SUB_CRITERIA_23:
          return 'Mises à niveau non-réalisées (gonflage, huile, lave glace…)' // 69
        case this.MAINTENANCE_SUB_CRITERIA_24:
          return "Difficulté à joindre l'établissement par téléphone" // 70
        case this.SALE_NEW_SUB_CRITERIA_1:
          return 'Locaux peu accueillants' // 129
        case this.SALE_NEW_SUB_CRITERIA_2:
          return 'Véhicules mal mis en valeur' // 130
        case this.SALE_NEW_SUB_CRITERIA_3:
          return 'Faible choix de modèles exposés' // 131
        case this.SALE_NEW_SUB_CRITERIA_4:
          return 'Mauvaise visibilité des offres promotionnelles' // 132
        case this.SALE_NEW_SUB_CRITERIA_5:
          return 'Vendeur indisponible' // 134
        case this.SALE_NEW_SUB_CRITERIA_6:
          return 'Mauvaise prise en compte de mes besoins' // 135
        case this.SALE_NEW_SUB_CRITERIA_7:
          return 'Faible expertise et peu de conseils du vendeur' // 136
        case this.SALE_NEW_SUB_CRITERIA_8:
          return 'Mauvais suivi de mon dossier' // 137
        case this.SALE_NEW_SUB_CRITERIA_10:
          return 'Aucune offre de reprise de mon ancien véhicule' // 139
        case this.SALE_NEW_SUB_CRITERIA_11:
          return 'Aucun service de financement adapté' // 140
        case this.SALE_NEW_SUB_CRITERIA_12:
          return "Aucune présentation des garanties et contrat d'entretien" // 141
        case this.SALE_NEW_SUB_CRITERIA_13:
          return 'Pas de facilité administrative (gestion de la carte grise …)' // 142
        case this.SALE_NEW_SUB_CRITERIA_15:
          return 'Délai de livraison non-respecté' // 147
        case this.SALE_NEW_SUB_CRITERIA_16:
          return 'Accueil impersonnel et inefficace' // 144
        case this.SALE_NEW_SUB_CRITERIA_17:
          return 'Mauvaise préparation de mon véhicule' // 146
        case this.SALE_NEW_SUB_CRITERIA_18:
          return 'Aucune aide à la prise en main de mon véhicule' // 145
        case this.SALE_NEW_SUB_CRITERIA_20:
          return "Aucun essai possible de mon véhicule avant l'achat" // 149
        case this.SALE_NEW_SUB_CRITERIA_21:
          return 'Véhicule non-conforme au devis (options, tarifs, carrosserie)' // 151
        case this.SALE_NEW_SUB_CRITERIA_22:
          return "Mauvais fonctionnement du véhicule à l'usage (bruits anormaux…)" // 150
        case this.SALE_NEW_SUB_CRITERIA_23:
          return 'Véhicule pas à la hauteur de mes espérances' // 152
        case this.SALE_USED_SUB_CRITERIA_1:
          return 'Vendeur indisponible' // 134
        case this.SALE_USED_SUB_CRITERIA_2:
          return 'Mauvaise prise en compte de mes besoins' // 135
        case this.SALE_USED_SUB_CRITERIA_3:
          return 'Faible expertise et peu de conseils du vendeur' // 136
        case this.SALE_USED_SUB_CRITERIA_4:
          return 'Mauvais suivi de mon dossier' // 137
        case this.SALE_USED_SUB_CRITERIA_5:
          return 'Origine du véhicule non-précisé' // 198
        case this.SALE_USED_SUB_CRITERIA_6:
          return "Pas de remise des factures d'interventions" // 199
        case this.SALE_USED_SUB_CRITERIA_7:
          return "Carnet d'entretien non-renseigné" // 200
        case this.SALE_USED_SUB_CRITERIA_8:
          return 'Aucune visiblité sur les entretiens et réparations à prévoir' // 201
        case this.SALE_USED_SUB_CRITERIA_10:
          return 'Aucune offre de reprise de mon ancien véhicule' // 139
        case this.SALE_USED_SUB_CRITERIA_11:
          return 'Aucun services de financement adaptés' // 140
        case this.SALE_USED_SUB_CRITERIA_12:
          return "Aucune présentation des garanties et contrat d'entretien" // 141
        case this.SALE_USED_SUB_CRITERIA_13:
          return 'Pas de facilité administrative (gestion de la carte grise …)' // 142
        case this.SALE_USED_SUB_CRITERIA_15:
          return 'Délai de livraison non-respecté' // 147
        case this.SALE_USED_SUB_CRITERIA_16:
          return 'Accueil impersonnel et inefficace' // 144
        case this.SALE_USED_SUB_CRITERIA_17:
          return 'Mauvaise préparation de mon véhicule' // 146
        case this.SALE_USED_SUB_CRITERIA_18:
          return 'Aucune aide à la prise main de mon véhicule' // 145
        case this.SALE_USED_SUB_CRITERIA_20:
          return "Aucun Essai possible de mon véhicule avant l'achat" // 149
        case this.SALE_USED_SUB_CRITERIA_21:
          return 'Véhicule non-conforme au devis (options, tarifs, carrosserie)' // 151
        case this.SALE_USED_SUB_CRITERIA_22:
          return "Mauvais fonctionnement du véhicule à l'usage (bruits anormaux…)" // 150
        case this.SALE_USED_SUB_CRITERIA_23:
          return 'Véhicule pas à la hauteur de mes espérances' // 152
        case this.SALE_USED_SUB_CRITERIA_25:
          return 'Locaux peu accueillants'
        case this.SALE_USED_SUB_CRITERIA_26:
          return 'Véhicules mal mis en valeur'
        case this.SALE_USED_SUB_CRITERIA_27:
          return 'Faible choix de modèles exposés'
        case this.SALE_USED_SUB_CRITERIA_28:
          return 'Mauvaise visibilité des offres promotionnelles'
        default:
          return value
      }
    },
    distinctSaleTypeSubCriteria(label, dataType) {
      switch (label) {
        case 'Sale1':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_25
            : this.SALE_NEW_SUB_CRITERIA_1
        case 'Sale2':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_26
            : this.SALE_NEW_SUB_CRITERIA_2
        case 'Sale3':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_27
            : this.SALE_NEW_SUB_CRITERIA_3
        case 'Sale4':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_28
            : this.SALE_NEW_SUB_CRITERIA_4
        case 'Sale5':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_1
            : this.SALE_NEW_SUB_CRITERIA_5
        case 'Sale6':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_2
            : this.SALE_NEW_SUB_CRITERIA_6
        case 'Sale7':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_3
            : this.SALE_NEW_SUB_CRITERIA_7
        case 'Sale8':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_4
            : this.SALE_NEW_SUB_CRITERIA_8
        case 'Sale9':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_5
            : null
        case 'Sale10':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_6
            : null
        case 'Sale11':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_7
            : null
        case 'Sale12':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_8
            : null
        case 'Sale13':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_10
            : this.SALE_NEW_SUB_CRITERIA_10
        case 'Sale14':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_11
            : this.SALE_NEW_SUB_CRITERIA_11
        case 'Sale15':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_12
            : this.SALE_NEW_SUB_CRITERIA_12
        case 'Sale16':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_13
            : this.SALE_NEW_SUB_CRITERIA_13
        case 'Sale17':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_15
            : this.SALE_NEW_SUB_CRITERIA_15
        case 'Sale18':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_16
            : this.SALE_NEW_SUB_CRITERIA_16
        case 'Sale19':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_17
            : this.SALE_NEW_SUB_CRITERIA_17
        case 'Sale20':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_18
            : this.SALE_NEW_SUB_CRITERIA_18
        case 'Sale21':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_20
            : this.SALE_NEW_SUB_CRITERIA_20
        case 'Sale22':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_21
            : this.SALE_NEW_SUB_CRITERIA_21
        case 'Sale23':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_22
            : this.SALE_NEW_SUB_CRITERIA_22
        case 'Sale24':
          return dataTypes.USED_VEHICLE_SALE === dataType
            ? this.SALE_USED_SUB_CRITERIA_23
            : this.SALE_NEW_SUB_CRITERIA_23
        default:
          return null
      }
    }
  }
)
