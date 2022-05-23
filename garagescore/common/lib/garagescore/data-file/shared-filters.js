const objectHash = require('object-hash');
const lruCache = require('lru-cache');
const AhoCorasick = require('../nlp/ahocorasick');
const garageProcessingContext = require('../monitoring/internal-events/contexts/garage-processing-context');

async function setConfig() {
  // TODO when the darkbo will be able to edit the config
}

async function getConfig() {
  // TODO get the conf from  configuration.get('sharedImportFilters', (errGF, sharedImportFilters) => {})
  // also use some cache that can expire, we dont want to call that for EVERY rows!

  const commonNot = [
    ' MIRO',
    'A3',
    'AMF',
    'APV',
    'AR',
    'AWP',
    'Alfaromeo',
    'Auto',
    'Avis',
    'Axa',
    'BRED',
    'BRUNO ROUSSET SAS',
    'C12',
    'C46',
    'CCR',
    'CGC',
    'CHRY',
    'CIC',
    'CM',
    'CM - CIC',
    'CM - CIC BAIL',
    'CM CIC',
    'CM CIC BAIL',
    'CM-CIC',
    'CM-CIC BAIL',
    'CNP',
    'Cess',
    'Citroën',
    'DACI',
    'DAS',
    'DS',
    'Eris',
    'GAN',
    'GFA',
    'GGE',
    'GGM',
    'HARL',
    'HO',
    'HR',
    'Harley-Davidson',
    'IMA',
    'LR',
    'Land-rover',
    'MAE',
    'MB',
    'MGP',
    'MINI',
    'MIRO ',
    'MMA',
    'MMA VIE',
    'MNH',
    'MSO',
    'Mapfre',
    'QBE',
    'Rolls Royce',
    'Rolls-Royce',
    'UMC',
    'UMG',
    'VD',
    'VIE',
    'VO',
    'VW',
    'VYV',
  ];
  const commonNotInclude = [
    ' Arval',
    ' Auto',
    ' Auto ',
    ' Kia',
    ' Salva',
    'A2VIP',
    'ACORIS',
    'ACTA',
    'ACTE IARD',
    'AESIO',
    'AFFINEO',
    'AFI ESCA',
    'AFI-ESCA',
    'AG2R',
    'AGEAS',
    'AGPM',
    'ALBINGIA',
    'ALTIMA',
    'AMALINE',
    'AMELLIS',
    'ANIPS',
    'APGIS',
    'APICIL',
    'APIVIA',
    'APREVA',
    'AREAS',
    'AREVA',
    'ARGOVIE',
    'ARIANEGROUP ',
    'ARPEGE',
    'ASSURIMA',
    'AUBEANE',
    'AUDIENS',
    'AUXIA',
    'AUXILIAIRE',
    'AVANSSUR',
    'AVIVA',
    'AXERIA',
    'Abarth',
    'Abdx',
    'Access',
    'Accord',
    'Acura',
    'Advance',
    'Albax',
    'Ald ',
    'Alfa',
    'Allianz',
    'Alphabet',
    'Alpine',
    'Amplitude',
    'Arcueil',
    'Arkea',
    'Arval ',
    'Assistance',
    'Assurance',
    'Assurances',
    'Aston',
    'Athlon',
    'Aucun',
    'Aucune',
    'Auto ',
    'Autodstanding',
    'Automobile',
    'Automobiles',
    'Automotiv',
    'Automotive',
    'Autostore',
    'Awp',
    'BARCLAYS',
    'BMW',
    'BPCE',
    'BRESSANE',
    'Bank',
    'Banque',
    'Barclays',
    'Behra',
    'Bellier',
    'Bentley',
    'Benz',
    'Bremany',
    'Brie ',
    ' Brie',
    'Buchelay',
    'Budget',
    'Bugatti',
    'Buick',
    'Business',
    'CALYPSO',
    'CAMUS ',
    ' CAMUS',
    'CAPMA',
    'CAPMI',
    'CAPREVAL',
    'CARCEPT',
    'CARDIF',
    'CARMA',
    'CARPILIG',
    'CCMO',
    'CCPMA',
    'CCSO',
    'CFDP',
    'CGPA',
    'CHOLETAISE',
    'CHORUM',
    'CIOTAT',
    'CITRAM',
    'CNP',
    'COFACE',
    'COVEA',
    'Cadillac',
    'Caisse',
    'Capital',
    'Carrosserie',
    'Caterham',
    'Cession',
    'Cetelem',
    'Chambourcy',
    'Champagne',
    'Chatenet',
    'Chevrolet',
    'Chrysler',
    'Citroen',
    'Client',
    'Cm-Cic',
    'Cmptoir',
    'Cofica',
    'Cofiparc',
    'Commerciaux',
    'Compte',
    'Consommable',
    'Consommables',
    'Consumer',
    'Courtoise',
    'Covea',
    'Credit',
    'Crédit',
    'DBF',
    'DUNLOP',
    'Dacia',
    'Daewoo',
    'Daihatsu',
    'Datacar',
    'Datafirst',
    'Datsun',
    'Defense',
    'Divers',
    'Dodge',
    'E-Autos',
    'EMOA',
    'ENTRENOUS',
    'EPARGNE',
    'EUROMAF',
    'Enchere',
    'Encheres',
    'Entite',
    'Entretien',
    'Eparne',
    'Ericauto',
    'Etranger',
    'Eurauto',
    'Europcar',
    'Europe',
    'Evobus',
    'Exclusive',
    'FACOM',
    'FIDELIA',
    'FILASSISTANCE',
    'FINANCIERE',
    'FINAREF',
    'FRAGONARD',
    'FRATERNELLE',
    'Ferrari',
    'Fiat',
    'Finance',
    'Fleet',
    'Fmc',
    'Ford',
    'Forestier',
    'Forza',
    'Fournis',
    'Fourniture',
    'Fournitures',
    'Fraikin',
    'Frais',
    'Furauto',
    'GALIAN',
    'GANGEOISE',
    'GENERATION',
    'GEODIS',
    'GGE',
    'GMC',
    'GMF ',
    'GRESHAM',
    'GROUPAMA',
    'Garage',
    'Garantie',
    'Garantías',
    'Gentilly',
    'Geste',
    'Gestes',
    'Gironde',
    'Gmac',
    'Grasser',
    'Gratuit',
    'HELVETIA',
    'HSBC',
    'HUMANIS',
    'Harley Davidson',
    'Hertz',
    'Holden',
    'Honda',
    'Hummer',
    'Hyundai',
    "I'Car",
    'ICARE',
    'IMA GIE',
    'IMHOTEP',
    'IMPERIO',
    'INDRA',
    'INTEGRANCE',
    'INTERIALE',
    'INTERPROFESSIONNELLE',
    'IPECA',
    'IPRIAC',
    'IRCEM',
    'IRSID',
    'Icar',
    'Icare',
    'Ima Gie',
    'Indra',
    'Infiniti',
    'Isuzu',
    'Iveco',
    'JURIDICA',
    'Jaguar',
    'Jeep',
    'KEOLIS',
    'KERIALIS',
    'KLESIA',
    'KSB',
    'Kawasaki',
    'Kerlann',
    'Kia ',
    'Kiloutou',
    'Krystal',
    'L&J',
    'LAXOU',
    'LCL',
    'LIBEA',
    'LYBERNET',
    'Lancia',
    'Lease',
    'Leaseplan',
    'Leasing',
    'Lexus',
    'Ligier',
    'Lissbail',
    'Livraison',
    'Losan',
    'Lotus',
    'Luxgen',
    'MAAF',
    'MACIF',
    'MACIFILIA',
    'MACSF',
    'MADP',
    'MAIF',
    'MALAKOFF',
    'MARSILLARGUOISE',
    'MATMUT',
    'MCLR',
    'MEUSREC',
    'MFPRECAUTION',
    'MFPREVOYANCE',
    'MGARD',
    'MICILS',
    'MILTIS',
    'MMH',
    'MONDIALE',
    'MTRL',
    'MUDETAF',
    'MURACEF',
    'MUTACITE',
    'MUTAERO',
    'MUTAG',
    'MUTAME',
    'MUTAMI',
    'MUTARETRAITE',
    'MUTARIS',
    'MUTEX',
    'MUTLOG',
    'MUTRE',
    'MUTUALIA',
    'MUTUALP',
    'Macif',
    'Manageme',
    'Management',
    'Maserati',
    'Mazda',
    'Mecanique',
    'Mecaniques',
    'Melka',
    'Mercedes',
    'Millesime',
    'Mitsubishi',
    'Mondial',
    'Montage',
    'Morangis',
    'Motors',
    'Mutuaide',
    'Mutualiste',
    'Mutualite',
    'Mutualité',
    'Mutuelle',
    'Mécanique',
    'Mécaniques',
    'NAGICO',
    'NATIO',
    'NESTLE',
    'NEUFLIZE',
    'NEUVY MOTORS',
    'NOVAMUT',
    'Nation',
    'National',
    'Nations',
    'Natixis',
    'Neubauer',
    'Nissan',
    'Nowak',
    'OCIANE',
    'OCIRP',
    'ODYSSEY',
    'OPTIM',
    'OPTIMUM',
    'ORADEA',
    'OREAL',
    'Opel',
    'Opteven',
    'Orgeval',
    'Overlease',
    'PACIFICA',
    'PANACEA',
    'PARISIENNE',
    'PARNASSE',
    'PERNOD',
    'POUEY',
    'PRECOCIA',
    'PREDICA',
    'PREPAR',
    'PREVIFRANCE',
    'PREVOIR',
    'PREVOYANCE',
    'PRIMA',
    'PROTEGYS',
    'PROTEXIA',
    'Paribas',
    'Passage',
    'Peugeot',
    'Piaggio',
    'Pigeaon',
    'Porshe',
    'Poste',
    'Premium',
    'Prepa',
    'Preparation',
    'Prepfrevo',
    'Proviisoire',
    'Prépa',
    'Préparation',
    'QBE',
    'QUA2',
    'QUATREM',
    'RETRAITE',
    'REUNICA',
    'REUNISOLIDARITE',
    'RURALE',
    'Renault',
    'Rent a car',
    'Rentacar',
    'Rueil',
    'S.3.R.',
    'SAAB',
    'SAUVEGARDE',
    'SCOR GLOBAL',
    'SERAMM',
    'SEREINA',
    'SERENIS',
    'SGAM',
    'SGAPS',
    'SHAM',
    'SMACL',
    'SMERRA',
    'SMISO',
    'SMPS',
    'SNCF',
    'SNECMA',
    'SOGESSUR',
    'SOLIMUT',
    'SOLIMUT ',
    'SOLUCIA',
    'SPHERIA',
    'SPIRICA',
    'SURAVENIR',
    'SWISSLIFE',
    'Salva ',
    'Schumacher',
    'Seat',
    'Sigma',
    'Sixt',
    'Skoda',
    'Smart',
    'Solidaire',
    'Solidarite',
    'Solidarité',
    'Solutio',
    'Solution',
    'Solutions',
    'Sonaka',
    'Speed',
    'Ssangyong',
    'Subaru',
    'Suzuki',
    'THELEM',
    'THEMIS',
    'Talbot',
    'Technocentre',
    'Temsys',
    'Tesla',
    'Thrifty',
    'Toyota',
    'Ttr',
    'UMEN',
    'UNELEC',
    'UNEO',
    'UNIPREVOYANCE',
    'UNME',
    'UNOFI',
    'Utilitaire',
    'VEOLIA',
    'VIASANTE',
    'VITTAVI',
    'VN',
    'VNVO',
    'Vauxhall',
    'Vdvk',
    'Vehicule',
    'Vehiposte',
    'Volkswagen',
    'Volvo',
    'Véhicule',
    'Yama',
    'huile',
    'industriel',
    'industrielle',
    'rover',
    'Épargne',
    'Équipement',
    'ARVAL',
    'FLEET',
    'COFIPARC',
    'FRAIKIN',
    'SOVAYE',
    'ICARELEASEPLAN',
    'LEASYS',
    'LOCAFLEET',
    'OPTEVEN',
    'PARCOURS',
    'SECB',
    'LEADER REN',
    'CHRONOFEU',
    'Db77',
  ];

  const customerNameFields = ["Nom", "Nom client", "Nom du client", "Nom individu", "Prénom", "Prénom client", "ttOTCab.Apellido1", "ttOTCab.Apellido2", "tcVehFactur.CteApellido1", "tcVehFactur.CteNombre"];

  return [
    {
      field: 'salecode',
      genericColumn: false,
      filters: {
        not: [
          'X',
          'Banque',
          'Bank',
          'Crédit',
          'Credit',
          'Poste',
          'Eparne',
          'Épargne',
          'Accord',
          'Barclays',
          'Paribas',
          'Cetelem',
        ],
        notInclude: ['VO', 'APV', 'VD', 'GGE', 'Cess', 'Axa', 'Eris', 'CGC', 'C12', 'C46', 'GGM'],
      },
    },
    {
      field: 'tgVehCliente.TipoRelacion',
      genericColumn: false,
      filters: {
        not: ['X'],
      },
    },
    {
      field: 'tgVehCliente．TipoRelacion',
      genericColumn: false,
      filters: {
        not: ['X'],
      },
    },
    {
      field: 'Catég.client 1ère fact.',
      genericColumn: false,
      filters: {
        not: ['ADM', 'ASS', 'CES', 'CFO', 'FIL', 'SUC'],
      },
    },
    {
      field: 'CODE_VENTE',
      genericColumn: false,
      filters: {
        not: ['C'],
      },
    },
    {
      field: 'city',
      genericColumn: true,
      filters: {
        not: ['CESSION'],
      },
    },
    {
      field: 'c_civ',
      genericColumn: false,
      filters: {
        not: ['GAR'],
      },
    },
    {
      field: 'gender',
      genericColumn: false,
      filters: {
        not: ['VO', 'APV', 'VD', 'GGE', 'Cess', 'Axa', 'Eris', 'CGC', 'C12', 'C46', 'GGM'],
        notInclude: [
          'Banque',
          'Bank',
          'Crédit',
          'Credit',
          'Poste',
          'Eparne',
          'Épargne',
          'Accord',
          'Barclays',
          'Paribas',
          'Cetelem',
        ],
      },
    },
    {
      field: 'firstName',
      genericColumn: true,
      filters: {
        not: commonNot,
        notInclude: commonNotInclude,
      },
    },
    {
      field: 'lastName',
      genericColumn: true,
      filters: {
        not: commonNot,
        notInclude: commonNotInclude,
      },
    },
    {
      field: 'fullName',
      genericColumn: true,
      filters: {
        not: commonNot,
        notInclude: commonNotInclude,
      },
    }
  ].concat(customerNameFields.map(field => ({
    field,
    genericColumn: false,
    filters: {
      not: commonNot,
      notInclude: commonNotInclude,
    }
  })));
}
let _cache = null;
async function _init() {
  const config = await module.exports.getConfig(); // its strange to call it like that but its for sinon
  const h = objectHash(config);
  if (_cache && _cache.hash === h) {
    return _cache.value;
  }
  const value = config.map((f) => {
    const c = { filters: {}, field: f.field, genericColumn: f.genericColumn };
    if (f.filters && f.filters.not) {
      c.filters.not = {
        has: (s) => {
          const ii = f.filters.not.indexOf(s);
          if (ii >= 0) {
            return f.filters.not[ii];
          }
          return false;
        },
      }; // new AhoCorasick(f.filters.not.map((s) => `[${s}]`));
    }
    if (f.filters && f.filters.notInclude) {
      c.filters.notInclude = new AhoCorasick(f.filters.notInclude.map((s) => s.toLowerCase()));
    }
    return c;
  });
  _cache = {
    hash: h,
    value,
  };
  return value;
}
const fieldsCache = lruCache({
  max: 1000,
  maxAge: 1000 * 60,
});
// if its a genericColumn (like email, city...), get the first non null value from columns
function _getValue(row, field, genericColumn, columns, importId) {
  if (!genericColumn) {
    return row[field];
  }
  const fields = columns && columns[field];
  if (!fields) {
    return null;
  }
  // Sometimes the fields is only 1 value, not in an array
  // I wonder why we didn't notice the bug...
  // Also cache is useless in such case
  if (!Array.isArray(fields)) {
    return row[fields] || null;
  }

  // We got an array
  // instead of looping through every value we use a cache
  const key = `${importId}${field}`;
  const cached = fieldsCache.get(key);
  if (cached && row[cached]) {
    return row[cached];
  }
  // nothing was returned through the cache, so we'll loop on the possible fields
  for (let i = 0; i < fields.length; i += 1) {
    if (row[fields[i]]) {
      fieldsCache.set(key, fields[i]);
      return row[fields[i]];
    }
  }
  return null;
}
/** Does the row contains some column with values indicating we should ignore the row? */
// dev sympa: on met tout en async pour le prochain dev même si pas besoin maintenant
async function ignoreRow(row, columns, importId, eventsEmitter) {
  const confs = await _init();
  for (let f = 0; f < confs.length; f += 1) {
    const { field, genericColumn, filters: { not, notInclude } = {} } = confs[f];
    const value = _getValue(row, field, genericColumn, columns, importId);
    if (value) {
      if (not) {
        const search = not.has(value);
        if (search) {
          eventsEmitter.accumulatorAdd(garageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW, {
            [`sharedFilters.${search.replace(/ /g, '_')}`]: 1,
          });
          return true;
        }
      }
      if (notInclude) {
        const search = notInclude.has(value.toLowerCase());
        if (search) {
          eventsEmitter.accumulatorAdd(garageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW, {
            [`sharedFilters.${search.replace(/ /g, '_')}`]: 1,
          });
          return true;
        }
      }
    }
  }
  // some dms give empty name, we ignore that
  const names = ['firstName', 'lastName', 'fullName'].map((name) => _getValue(row, name, true, columns, importId));
  if (!names.some((n) => n)) {
    eventsEmitter.accumulatorAdd(garageProcessingContext.EVENTS.EVENT_IMPORT_IGNORE_ROW, { [`emptyName.total`]: 1 });
    return true;
  }
  return false;
}

module.exports = { setConfig, getConfig, ignoreRow };
