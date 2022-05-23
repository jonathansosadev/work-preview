import Enum from '~/utils/enum.js'

export default new Enum({
  MAINTENANCE_LAB_1: 'Maintenance1', // 'Accueil et prise en charge',
  MAINTENANCE_LAB_2: 'Maintenance2', // 'Écoute et conseils',
  MAINTENANCE_LAB_3: 'Maintenance3', // 'Clarté et détail du devis',
  MAINTENANCE_LAB_4: 'Maintenance4', // 'Respect des engagements de délai et de tarif',
  MAINTENANCE_LAB_5: 'Maintenance5', // 'Qualité générale de la prestation',
  SALE_NEW_LAB_1: 'SaleNew1', // 'Qualité générale de l\'établissement',
  SALE_NEW_LAB_2: 'SaleNew2', // 'Professionnalisme des équipes',
  SALE_NEW_LAB_3: 'SaleNew3', // 'Services proposés (reprise, garantie, financement)',
  SALE_NEW_LAB_4: 'SaleNew4', // 'Livraison de mon véhicule',
  SALE_NEW_LAB_5: 'SaleNew5', // 'Satisfaction de mon véhicule',
  SALE_USED_LAB_1: 'SaleUsed1', // 'Professionnalisme des équipes',
  SALE_USED_LAB_2: 'SaleUsed2', // 'Historique de mon véhicule',
  SALE_USED_LAB_3: 'SaleUsed3', // 'Services proposés (reprise, garantie, financement)',
  SALE_USED_LAB_4: 'SaleUsed4', // 'Livraison de mon véhicule',
  SALE_USED_LAB_5: 'SaleUsed5', // 'Satisfaction de mon véhicule'
}, {
  displayName(value, language = 'fr') {
    if (language !== 'fr') {
      throw new Error(`Language ${language} is not supported`);
    }
    switch (value) {
      case this.MAINTENANCE_LAB_1: return 'Accueil et prise en charge';
      case this.MAINTENANCE_LAB_2: return 'Écoute et conseils';
      case this.MAINTENANCE_LAB_3: return 'Clarté et détail du devis';
      case this.MAINTENANCE_LAB_4: return 'Respect des engagements de délai et de tarif';
      case this.MAINTENANCE_LAB_5: return 'Qualité générale de la prestation';
      case this.SALE_NEW_LAB_1: return 'Qualité générale de l\'établissement';
      case this.SALE_NEW_LAB_2: return 'Professionnalisme des équipes';
      case this.SALE_NEW_LAB_3: return 'Services proposés (reprise, garantie, financement)';
      case this.SALE_NEW_LAB_4: return 'Livraison de mon véhicule';
      case this.SALE_NEW_LAB_5: return 'Satisfaction de mon véhicule';
      case this.SALE_USED_LAB_1: return 'Professionnalisme des équipes';
      case this.SALE_USED_LAB_2: return 'Historique de mon véhicule';
      case this.SALE_USED_LAB_3: return 'Services proposés (reprise, garantie, financement)';
      case this.SALE_USED_LAB_4: return 'Livraison de mon véhicule';
      case this.SALE_USED_LAB_5: return 'Satisfaction de mon véhicule';
      default: return value;
    }
  },
  displayAbbreviatedName(value, language = 'fr') {
    if (language !== 'fr') {
      throw new Error(`Language ${language} is not supported`);
    }
    switch (value) {
      case this.MAINTENANCE_LAB_1: return 'Accueil';
      case this.MAINTENANCE_LAB_2: return 'Conseil';
      case this.MAINTENANCE_LAB_3: return 'Devis';
      case this.MAINTENANCE_LAB_4: return 'Engagement';
      case this.MAINTENANCE_LAB_5: return 'Qualité';
      case this.SALE_NEW_LAB_1: return 'Qualité';
      case this.SALE_NEW_LAB_2: return 'Profess.';
      case this.SALE_NEW_LAB_3: return 'Services';
      case this.SALE_NEW_LAB_4: return 'Livraison';
      case this.SALE_NEW_LAB_5: return 'Véhicule';
      case this.SALE_USED_LAB_1: return 'Profess.';
      case this.SALE_USED_LAB_2: return 'Traçabilite';
      case this.SALE_USED_LAB_3: return 'Services';
      case this.SALE_USED_LAB_4: return 'Livraison';
      case this.SALE_USED_LAB_5: return 'Véhicule';
      default: return value;
    }
  }
});

