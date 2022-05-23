const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const config = require('config');

const typePrefix = 'dataGetHomeB2C';

module.exports.typeDef = `
  extend type Query {
    ${queries.dataGetHomeB2C.type}: ${typePrefix}Infos
  }

  type ${typePrefix}Infos {
    reviewsCount: Int,
    captchaSiteKey: String,
    reviews: [${typePrefix}Review]
  }

  type ${typePrefix}Review {
    customerName: String,
    customerCity: String,
    transaction: [String],
    model: String,
    rating: String,
    garage: String,
    comment: String,
    date: Date,
  }
`;

// get last reviews
const lastReviews = async () => {
  // getting review is slow (collscan)
  return [
    {
      customerCity: 'Sivry Sur Meuse',
      customerName: 'Marlene G.',
      transaction: ['Maintenance1'],
      model: 'Nouvelle 308',
      rating: 9,
      comment: 'Accueil au top , personnel très sympathique ',
      garage: 'Peugeot Belleville sur Meuse',
      date: new Date(Date.now() - 1100000000),
    },
    {
      customerCity: 'Queven',
      customerName: 'B. P.',
      transaction: ['Maintenance1'],
      model: 'Q2 1,5 L4110 DSG',
      rating: 10,
      comment: 'Excellent accueil',
      garage: 'Espace Premium (Audi Lorient)',
      date: new Date(Date.now() - 7800000000),
    },
    {
      customerCity: 'Pelasque',
      customerName: 'Sandie O.',
      transaction: [],
      model: 'YARIS',
      rating: 10,
      comment: 'Très bon accueil ! Excellente prise en charge. Merci.',
      garage: 'TOYOTA Nice (Novellipse)',
      date: new Date(Date.now() - 180000000),
    },
    {
      customerCity: 'Marseille',
      customerName: 'Ake M.',
      transaction: ['Maintenance1', 'Maintenance5'],
      model: 'PANDA PANDA TWIN AIR',
      rating: 7,
      comment: "longes attend à l'accueil",
      garage: 'Fiat professional Marseille',
      date: new Date(Date.now() - 600000000),
    },
    {
      customerCity: 'Warlus',
      customerName: 'Sebastien B.',
      transaction: ['Maintenance1'],
      model: 'INSIGNIA',
      rating: 10,
      comment: 'Très bonne concession et une équipe à l’écoute ',
      garage: 'Espace MOTORS (Opel Arras)',
      date: new Date(Date.now() - 300000000),
    },
    {
      customerCity: 'SURJOUX-LHOPITAL',
      customerName: 'L. F.',
      transaction: ['Maintenance2', 'Maintenance1', 'Maintenance4'],
      model: 'GLC',
      rating: 10,
      comment: "Satisfaite par  l'accueil et la prise en charge rapide de mon véhicule, et le prêt de véhicule.",
      garage: 'Mercedes Sillingy',
      date: new Date(Date.now() - 600000000),
    },
    {
      customerCity: 'Ecques',
      customerName: 'Helene B.',
      transaction: [],
      model: 'JUKE',
      rating: 10,
      comment:
        'Très belle et somptueuse voiture \nAgréable et loyale en conduite \nEsthétiquement sublime \nGrand merci pour tout et pour Mr Gobleville \nMerci beaucoup ',
      garage: 'Autostanding (Nissan Bruay-la-Buissière)',
      date: new Date(Date.now() - 2800000000),
    },
    {
      customerCity: 'Merckeghem',
      customerName: 'Sebastien S.',
      transaction: ['Maintenance1'],
      model: 'VIVARO COMBI',
      rating: 10,
      comment:
        "La prise du rendez vous avec ma disponibilité fut impeccable\nL'accueil et le professionnalisme des personnes me met en confiance \nMerci a toute l'équipe et de bonnes fêtes de fin d'année.\n",
      garage: 'Opel Dunkerque',
      date: new Date(Date.now() - 800000000),
    },
    {
      customerCity: 'Ezanville',
      customerName: 'Delphine V.',
      transaction: [],
      model: 'CLIO',
      rating: 9,
      comment: 'Tout s est bien passé ! \nRéception sans problème. ',
      garage: 'Renault Argenteuil',
      date: new Date(Date.now() - 1200000000),
    },
    {
      customerCity: 'Acheres',
      customerName: 'Patrice M.',
      transaction: [],
      model: 'CLIO',
      rating: 10,
      comment: "Vendeur disponible et à l'écoute.",
      garage: 'Alliance ESDB Renault Saint-Germain-en-Laye',
      date: new Date(Date.now() - 1800000000),
    },
  ];
};
// count reviews approximation
const reviewsCount = async () => {
  const reviewsOnJanuary2021 = 2500000;
  const reviewsByDay = 10;
  const from = new Date(2021, 0, 1);
  const to = new Date();
  const days = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(reviewsOnJanuary2021 + days * reviewsByDay);
};
module.exports.resolvers = {
  Query: {
    async dataGetHomeB2C(obj, args, context) {
      const { app } = context;
      return {
        captchaSiteKey:
          (config.has('google.captchaSiteKey') && config.get('google.captchaSiteKey')) || 'captchaSiteKey undefined',
        reviewsCount: await reviewsCount(app),
        reviews: await lastReviews(app),
      };
    },
  },
};
