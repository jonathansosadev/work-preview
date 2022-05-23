const { GaragesTest } = require('../../../../frontend/utils/enumV2');
const GarageTypes = require('../../../models/garage.type');
const { routesPermissions } = require('./route-permissions');

module.exports = {
  addApp(options) {
    // Purpose of this method is to be used in the tests in order to create mock appIds
    if (!this.getApp(options.appId)) {
      this.currentApps[options.appId] = options;
    }
    return this.currentApps[options.appId];
  },
  getApp(appId) {
    return this.currentApps[appId] ? JSON.parse(JSON.stringify(this.currentApps[appId])) : null;
  },
  currentApps: {
    // GarageScore
    '6441beaf9960158586fced4bf3cf7738': {
      displayName: 'GarageScore',
      appId: '6441beaf9960158586fced4bf3cf7738',
      appSecret: '0JgsLtlGxiA95CajLIXBQZ7XYwnkLYha',
      // sourceId: dataSources.GARAGESCORE,
      fullData: true,
      allGaragesAuthorized: true,
      allReviews: true, // True: we can retreive all comments, False: we only get sharedWithPartners comments
      withheldGarageData: true, // True: get data from all garages, False: get data from launched garages only,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [
        routesPermissions.GARAGES,
        routesPermissions.LEADS,
        routesPermissions.REVIEWS,
        routesPermissions.SHARED_REVIEWS,
        routesPermissions.CUSTEED,
      ],
      authorizedGarages: [],
    },
    // Used by GarageScore when feeding external APIs with Leads
    '9b302707b214d9eba61cd2438a5b2722': {
      displayName: 'Leads exports',
      appId: '9b302707b214d9eba61cd2438a5b2722',
      appSecret: 'Vi5eY7k9AxWf66x4YVCL6odQTHBuH6bm',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [
        routesPermissions.GARAGES,
        routesPermissions.LEADS,
        routesPermissions.REVIEWS,
        routesPermissions.SHARED_REVIEWS,
      ],
      authorizedGarages: [
        // SelectUp
        '5ba4be3c19a5c60014eb90e3',
        '5acb31252995780013cf86c6',
        '58cbabafdaa35d1a0066809b',
        '590ae6a98cff1919006a3231',
        '5785f3d640e0dc1a006b24d0', // Hamon 5 new garages
        '5a4cab83502b701300c9bbdc', // Hamon 5 new garages
        '5a4cac45502b701300c9be39', // Hamon 5 new garages
        '5a4bce92f6642713003034b3', // Hamon 5 new garages
        '5a4bcf89f664271300303501', // Hamon 5 new garages
        '590ae98f8cff1919006a32c4', // Parot 19 new garages
        '59035f2e50974b1900931b25', // Parot 19 new garages
        '59035adba50f4019006c3124', // Parot 19 new garages
        '590ae72d8cff1919006a323c', // Parot 19 new garages
        '590b3f3533c3b51900b66ff8', // Parot 19 new garages
        '590ae8108cff1919006a3279', // Parot 19 new garages
        '59035be0a50f4019006c3467', // Parot 19 new garages
        '590ae8b68cff1919006a328d', // Parot 19 new garages
        '591465f78706791900e3d789', // Parot 19 new garages
        '59035d1da50f4019006c3868', // Parot 19 new garages
        '590358403235a9190089ecab', // Parot 19 new garages
        '58cbad20daa35d1a006680fa', // Parot 19 new garages
        '590aebef8cff1919006a330f', // Parot 19 new garages
        '590aecc68cff1919006a334c', // Parot 19 new garages
        '5c98a09db231590015d3423a', // Aubin 12 new garages
        '5c98a0e8b231590015d34317', // Aubin 12 new garages
        '5c8f9f707b345e0015f8b1a0', // Aubin 12 new garages
        '5c8fa1847b345e0015f8b1c9', // Aubin 12 new garages
        '5c8fa2377b345e0015f8b1ff', // Aubin 12 new garages
        '5c98a27bb231590015d34782', // Aubin 12 new garages
        '5c98a365b231590015d34a3f', // Aubin 12 new garages
        '5c98a3b4b231590015d34af5', // Aubin 12 new garages
        '5c98a303b231590015d3494c', // Aubin 12 new garages
        '5c98a1dab231590015d345c4', // Aubin 12 new garages
        '5c989f6ab231590015d34089', // Aubin 12 new garages
        '5c989fb5b231590015d34097', // Aubin 12 new garages
        '5b16badf14f61e001316b72c', // Lempereur 27 new garages
        '5cb7727e5b9d130015bc8d98', // Lempereur 27 new garages
        '586ccedfd3e89b1a00a1f3e7', // Lempereur 27 new garages
        '586ccffad3e89b1a00a1f3fe', // Lempereur 27 new garages
        '586ccdffd3e89b1a00a1f3cd', // Lempereur 27 new garages
        '586cd822d3e89b1a00a1f4dc', // Lempereur 27 new garages
        '5bcf466d47260900146b99de', // Lempereur 27 new garages
        '586cd447d3e89b1a00a1f472', // Lempereur 27 new garages
        '586cd39fd3e89b1a00a1f457', // Lempereur 27 new garages
        '586cc8cdd3e89b1a00a1f30a', // Lempereur 27 new garages
        '586cd0f3d3e89b1a00a1f418', // Lempereur 27 new garages
        '586cc9d2d3e89b1a00a1f327', // Lempereur 27 new garages
        '586ccacad3e89b1a00a1f356', // Lempereur 27 new garages
        '586cc5d4d3e89b1a00a1f25e', // Lempereur 27 new garages
        '586ccbc1d3e89b1a00a1f37a', // Lempereur 27 new garages
        '586ccccad3e89b1a00a1f3ad', // Lempereur 27 new garages
        '586cd548d3e89b1a00a1f481', // Lempereur 27 new garages
        '586cd18bd3e89b1a00a1f434', // Lempereur 27 new garages
        '586cd699d3e89b1a00a1f4b4', // Lempereur 27 new garages
        '586cd235d3e89b1a00a1f449', // Lempereur 27 new garages
        '5970bf52354bc31a00003083', // Lempereur 27 new garages
        '5b339f46ea181500137cd58c', // Lempereur 27 new garages
        '5b33a328ea181500137cd813', // Lempereur 27 new garages
        '5c0e4e573ce3a100149dead8', // Lempereur 27 new garages
        '5c0e632f3ce3a100149dfa21', // Lempereur 27 new garages
        '5c0e63ad3ce3a100149dfa2f', // Lempereur 27 new garages
        '5c0e64843ce3a100149dfa64', // Lempereur 27 new garages
        '5a0c05feeccab913004429ae', // Mozart Auto 8 new garages
        '5a0c18d6eccab91300447546', // Mozart Auto 8 new garages
        '5a1575a4a6cac81300097fc2', // Mozart Auto 8 new garages
        '5a16a9c1e3b86c1300606a7a', // Mozart Auto 8 new garages
        '5a16aab8e3b86c1300606ba5', // Mozart Auto 8 new garages
        '5b16b81d364088001333a8c1', // Mozart Auto 8 new garages
        '5e382ec6a14ef50015876fa9', // Mozart Auto 8 new garages
        '5e382f8ba14ef50015876fd8', // Mozart Auto 8 new garages
        '5acb2bd72995780013cf84fd', // Neubauer 7 new garages
        '5acb254f256499001335fe30', // Neubauer 7 new garages
        '5acb2f082995780013cf863e', // Neubauer 7 new garages
        '5acb2c902995780013cf8545', // Neubauer 7 new garages
        '5acb2a472995780013cf846b', // Neubauer 7 new garages
        '5acb2e392995780013cf85ff', // Neubauer 7 new garages
        '5acb2adc2995780013cf84a1', // Neubauer 7 new garages
        '5e59328a111c70001572a46b', // SIPA Automobiles 19 new garages
        '5e5933e5111c70001572a4b9', // SIPA Automobiles 19 new garages
        '5e5cf2f59b824b0015b079aa', // SIPA Automobiles 19 new garages
        '5e5cf3c29b824b0015b079da', // SIPA Automobiles 19 new garages
        '5e593673111c70001572a562', // SIPA Automobiles 19 new garages
        '5e5930cd111c70001572a40b', // SIPA Automobiles 19 new garages
        '5e5933c7111c70001572a4b3', // SIPA Automobiles 19 new garages
        '5e59364c111c70001572a55a', // SIPA Automobiles 19 new garages
        '5e5937e5111c70001572a5d7', // SIPA Automobiles 19 new garages
        '5e593935111c70001572a75f', // SIPA Automobiles 19 new garages
        '5e593cbc111c70001572aaa2', // SIPA Automobiles 19 new garages
        '5e5cf47b9b824b0015b07a01', // SIPA Automobiles 19 new garages
        '5e5939d9111c70001572a883', // SIPA Automobiles 19 new garages
        '5e593b3d111c70001572aa65', // SIPA Automobiles 19 new garages
        '5e593c88111c70001572aa99', // SIPA Automobiles 19 new garages
        '5e593db1111c70001572aad8', // SIPA Automobiles 19 new garages
        '5f15df16831a3c0003336f12', // SIPA Automobiles 19 new garages
        '5e593e7f111c70001572aaf4', // SIPA Automobiles 19 new garages
        '5e5cef169b824b0015b07889', // SIPA Automobiles 19 new garages
        '58da5cf87d4c761a00d239b7', // Grasser 2 new garages
        '58da5b677d4c761a00d237a9', // Grasser 2 new garages
        '580a39a3c872791900761740', // DMD 1 new garage
        '5ff739d6d038260003fbae42', // Lempereur 1 new garage
        '5c75098f021cfa00153997a9', // EMB Boscary 8 new garages
        '5c750a7c021cfa0015399af0', // EMB Boscary 8 new garages
        '5c750b10021cfa0015399cb2', // EMB Boscary 8 new garages
        '5c750c39021cfa0015399ff0', // EMB Boscary 8 new garages
        '5c750cb4021cfa001539a198', // EMB Boscary 8 new garages
        '5c750d3c021cfa001539a361', // EMB Boscary 8 new garages
        '5c750da7021cfa001539a4a5', // EMB Boscary 8 new garages
        '5c7513e3021cfa001539b795', // EMB Boscary 8 new garages
        '5ef20760d980f6003354ec1c', // DMD 21 new garages
        '5878ad63a4121b1a00bcdbcb', // DMD 21 new garages
        '580a3b3cc8727919007617ca', // DMD 21 new garages
        '5915d321d8f0041a00a8f196', // DMD 21 new garages
        '5878abb2a4121b1a00bcdbbf', // DMD 21 new garages
        '5915cf45d8f0041a00a8ee58', // DMD 21 new garages
        '5878a8b6a4121b1a00bcdbae', // DMD 21 new garages
        '5878b273a4121b1a00bcdbfb', // DMD 21 new garages
        '5878b302a4121b1a00bcdbfe', // DMD 21 new garages
        '5878b39aa4121b1a00bcdbff', // DMD 21 new garages
        '5878b031a4121b1a00bcdbf0', // DMD 21 new garages
        '5878b0e0a4121b1a00bcdbf3', // DMD 21 new garages
        '580a3ab5c8727919007617a3', // DMD 21 new garages
        '5878b17ba4121b1a00bcdbf7', // DMD 21 new garages
        '5915cfedd8f0041a00a8eeda', // DMD 21 new garages
        '5878ae44a4121b1a00bcdbda', // DMD 21 new garages
        '5878af18a4121b1a00bcdbee', // DMD 21 new garages
        '5878a558a4121b1a00bcdb7c', // DMD 21 new garages
        '5878a552a4121b1a00bcdb7b', // DMD 21 new garages
        '5e37eab1a14ef50015875a4e', // DMD 21 new garages
        '5e37e97da14ef500158759f6', // DMD 21 new garages
        '5a82b95431062400137eb590', // Jean Auto 1 garage

        // MB Paris
        '590c86a659247319008993d4',
        '590c87b959247319008995c2',
        '590c8835592473190089965b',
        '590c88cf59247319008997ac',
        '590c8a465924731900899957',
        // MBBordeaux
        '5b0436c363cf82001389179c',
        '5b0437b763cf8200138917d9',
        '5b0438b563cf820013891828',
      ],
    },
    // Figest
    ef6601b5ba298bb7b941308389233b0f: {
      displayName: 'Figest',
      appId: 'ef6601b5ba298bb7b941308389233b0f',
      appSecret: 'JztgJOal8c5OQ8Cea02GSsJA1gnUsJw8',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5a4e7d52a3274d1300d5f619',
        '5a4e7f9fa3274d1300d5f6b5',
        '5a4e808fa3274d1300d5f6f6',
        '5a4e817ca3274d1300d5f747',
        '5a82b1f931062400137e997a',
        '5a82b4fc31062400137ea82b',
        '5a82b5d931062400137ead40',
        '5a82b68731062400137eafdf',
        '5ac64c31dbbe7900132bc0a8',
      ],
    },
    // Peyrot
    a729cd8b43d958f633aeb933a164f154: {
      displayName: 'Peyrot',
      appId: 'a729cd8b43d958f633aeb933a164f154',
      appSecret: 'JB57N10hb5TlRbIPRXfeYPFSJsalRvKM',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5d1921ab80f0860015dedb7e',
        '5d19228080f0860015dedb87',
        '5d19233180f0860015dedb8b',
        '5d19245d80f0860015dedb94',
        '5d19251480f0860015dedb95',
        '5d19261980f0860015dedba5',
        '5d19271280f0860015dedbac',
        '5d1927e480f0860015dedbb5',
        '5d19288a80f0860015dedbb6',
        '5d1928e580f0860015dedbbb',
        '5d1929d480f0860015dedbc6',
        '5d192a9d80f0860015dedbd2',
        '5d192b3280f0860015dedbdd',
        '5d192ba580f0860015dedbde',
        '604637d8d50a640003b4d17f',
        '60463c8fd50a640003b4d6cf',
        '60463e03d50a640003b4d8c2',
        '60464087d50a640003b4dbd4',
        '60464140d50a640003b4dca4',
        '61436a06201b8400030bc7ff',
        '61436b68201b8400030bc8ff',
        '61436c31201b8400030bc976',
        '61436d58201b8400030bca41',
        '61436ff5201b8400030bcbd9',
        '61437158201b8400030bcc75',
        '6144901bc3b2ad0003ffc521',
        '614490a6c3b2ad0003ffc559',
        '6144a39bc3b2ad0003ffd2cb',
        '6144a469c3b2ad0003ffd38b',
      ],
    },
    // GBH
    '30fce51b352070fb38fbc7f85b9d45be': {
      displayName: 'GBH',
      appId: '30fce51b352070fb38fbc7f85b9d45be',
      appSecret: 'Vr2nrOWvVMWOZbQL4ugcEXULTPFuTRPB',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5cf626fba0e84c0013e1cdbd',
        '5d31d2fea13e7e00157af128',
        '5d31d0dfa13e7e00157af09b',
        '5cb9d4e5f8537700150abe76',
      ],
    },
    // Brest Nedelec
    e3ff6324de2216ed1fc987fd564cd38b: {
      displayName: 'Brest Nedelec',
      appId: 'e3ff6324de2216ed1fc987fd564cd38b',
      appSecret: 'dNXEYMy4ybl8iS5xSEmTysOzC1SpxkS1',
      fullData: false,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: ['5a4bcc6df66427130030342e', '5a4bcb39f6642713003033b2'],
    },
    // FTP2S3
    '2b5b6f13149506829d9e74fbb34a6c30': {
      displayName: 'FTP2S3',
      appId: '2b5b6f13149506829d9e74fbb34a6c30',
      appSecret: 'nZc7HYtUx4K30iPn1B9tqSQakXAMYdOm',
      fullData: true,
      allGaragesAuthorized: true,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.CUSTEED],
      authorizedGarages: [],
    },
    // Argus --> disable for now
    /*  '2460df813feea65dad88d673c7f39186': {
        appId: '2460df813feea65dad88d673c7f39186',
        appSecret: 'aLn9vXdjRr7cH995r0DUocl8SJ88RfaB',
        fullData: true,
        allGaragesAuthorized: true,
        authorizedGarages: []
      },*/
    // Carboat
    '45714ecf22c2d6b62ebcf6ffc5ed8ffd': {
      displayName: 'Carboat',
      appId: '45714ecf22c2d6b62ebcf6ffc5ed8ffd',
      appSecret: 'UkzjydjqRXZOBbp9CrsN9nIY39Osag0I',
      fullData: false,
      allGaragesAuthorized: true,
      permissions: [routesPermissions.GARAGES],
      garageTypesAuthorized: [
        GarageTypes.DEALERSHIP,
        GarageTypes.MOTORBIKE_DEALERSHIP,
        GarageTypes.AGENT,
        GarageTypes.CAR_REPAIRER,
        GarageTypes.CAR_RENTAL,
        GarageTypes.UTILITY_CAR_DEALERSHIP,
        GarageTypes.OTHER,
      ],
      allReviews: false,
      withheldGarageData: false,
      nonIndexedGarages: false,
    },
    // Ouest france
    '3fb98d8c3f88d4f2881f3c904bec4b75': {
      displayName: 'Ouest France',
      appId: '3fb98d8c3f88d4f2881f3c904bec4b75',
      appSecret: 'tEkCHiJupbyfa9ObBj6N7hSzO5jk7qL3',
      fullData: false,
      allGaragesAuthorized: true,
      permissions: [routesPermissions.GARAGES],
      garageTypesAuthorized: [
        GarageTypes.DEALERSHIP,
        GarageTypes.MOTORBIKE_DEALERSHIP,
        GarageTypes.AGENT,
        GarageTypes.CAR_REPAIRER,
        GarageTypes.CAR_RENTAL,
        GarageTypes.UTILITY_CAR_DEALERSHIP,
        GarageTypes.OTHER,
      ],
      allReviews: false,
      withheldGarageData: false,
      nonIndexedGarages: false,
      authorizedGarages: [],
    },
    // SGS
    '43ecc0551e04ef763505824e458c8eaf': {
      displayName: 'SGS',
      appId: '43ecc0551e04ef763505824e458c8eaf',
      appSecret: '6le48YKI67hHlQ3muYFlrAjQxpy01dQM',
      fullData: true,
      allGaragesAuthorized: true,
      garageTypesAuthorized: [GarageTypes.VEHICLE_INSPECTION],
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true,
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [],
    },
    // LiveCar
    '433fd5eec682f590a2c4eace5537bc9f': {
      displayName: 'LiveCar',
      appId: '433fd5eec682f590a2c4eace5537bc9f',
      appSecret: 'BhbGerhDyao5RwfG5buZfNWHMAWhftM3',
      fullData: false,
      allGaragesAuthorized: true,
      permissions: [routesPermissions.GARAGES],
      garageTypesAuthorized: [
        GarageTypes.DEALERSHIP,
        GarageTypes.MOTORBIKE_DEALERSHIP,
        GarageTypes.AGENT,
        GarageTypes.CAR_REPAIRER,
        GarageTypes.CAR_RENTAL,
        GarageTypes.UTILITY_CAR_DEALERSHIP,
        GarageTypes.OTHER,
      ],
      allReviews: false,
      withheldGarageData: false,
      nonIndexedGarages: false,
      authorizedGarages: [],
    },
    // Paru Vendu
    '3affad709a114fc5b0ab4cf813edea5b': {
      displayName: 'Paru Vendu',
      appId: '3affad709a114fc5b0ab4cf813edea5b',
      appSecret: 'fJ8w5uN3lwq00lVjkhEtjXmNpFjGytiF',
      fullData: false,
      allGaragesAuthorized: true,
      permissions: [routesPermissions.GARAGES],
      garageTypesAuthorized: [
        GarageTypes.DEALERSHIP,
        GarageTypes.MOTORBIKE_DEALERSHIP,
        GarageTypes.AGENT,
        GarageTypes.CAR_REPAIRER,
        GarageTypes.CAR_RENTAL,
        GarageTypes.UTILITY_CAR_DEALERSHIP,
        GarageTypes.OTHER,
      ],
      allReviews: false,
      withheldGarageData: false,
      nonIndexedGarages: false,
      authorizedGarages: [],
    },
    // for candidates
    f10dfe479c65aa989406dc2b839d46a3: {
      displayName: 'Robot recruteur',
      appId: 'f10dfe479c65aa989406dc2b839d46a3',
      appSecret: 'dy3cXBViF4QCeuWD76sDunnpTTqg0rlw',
      fullData: true,
      allGaragesAuthorized: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      withheldGarageData: true, // True: get data from all garages, False: get data from launched garages only,
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        GaragesTest.GARAGE_DUPONT, // garagescore-example
      ],
    },
    // for test
    '44d6ec4f5f600539a83ec13b3e8afc1c': {
      displayName: 'Pour les tests (modifiable)',
      appId: '44d6ec4f5f600539a83ec13b3e8afc1c',
      appSecret: 'Ky9JZMfKHpXRa3f1DTcvdyJTh0iGlXrC',
      fullData: true,
      allGaragesAuthorized: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [
        routesPermissions.GARAGES,
        routesPermissions.LEADS,
        routesPermissions.REVIEWS,
        routesPermissions.SHARED_REVIEWS,
      ],
      authorizedGarages: ['5b753a4e550942001308acc6'],
    },
    // Yellow-pages
    '78abfe479c65ad9894073a2bb64d46a3': {
      displayName: 'Page Jaunes',
      appId: '78abfe479c65ad9894073a2bb64d46a3',
      appSecret: 'a78cXBVsFaQnekMa7rPaLuioTTqg0rlw',
      fullData: true,
      allGaragesAuthorized: true,
      allReviews: false,
      withheldGarageData: false,
      nonIndexedGarages: false,
      permissions: [
        routesPermissions.LEADS,
        routesPermissions.REVIEWS,
        routesPermissions.SHARED_REVIEWS,
        routesPermissions.CUSTEED,
      ],
      authorizedGarages: [],
    },
    // Cobredia
    d4b02b1e7f1135334e1add82f1a7425a: {
      displayName: 'Cobredia',
      appId: 'd4b02b1e7f1135334e1add82f1a7425a',
      appSecret: 'RutIjkpT7b8okzfjwQoWDsTwwwuHZ0vw',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5609171770ad25190055d4fc',
        '5609173770ad25190055d4fd',
        '5609174f70ad25190055d4fe',
        '5609175e70ad25190055d4ff',
        '5609177770ad25190055d500',
        '5609178370ad25190055d501',
        '5609178c70ad25190055d502',
        '56f179f82e9e671a00162e71',
        '56f17a0b2e9e671a00162e72',
        '5745ba2ca5acd11a004cb748',
        '5745bd1da5acd11a004cb767',
        '5745bebba5acd11a004cb76c',
        '581b39779a66dd1900212dfa',
        '5824902fc15c611a00d53dd3',
        '582491d0c15c611a00d53e08',
        '583c3f585c2f5519000bba6b',
        '583c3ff05c2f5519000bba6d',
        '583c407f5c2f5519000bba73',
        '583c41115c2f5519000bba77',
        '583c41bb5c2f5519000bba7a',
        '583c42b25c2f5519000bba7b',
        '583c43315c2f5519000bba7e',
        '583c43d05c2f5519000bba80',
        '583c445d5c2f5519000bba81',
        '583c44ca5c2f5519000bba84',
        '583c452e5c2f5519000bba87',
        '583c45b35c2f5519000bba92',
        '583c46225c2f5519000bba95',
        '583c468e5c2f5519000bba9f',
        '583c48ff5c2f5519000bbab3',
        '583c717c6aa18c1900299872',
        '583c72a96aa18c1900299882',
        '583c73146aa18c1900299892',
        '583c736d6aa18c19002998a3',
        '583c73e26aa18c19002998c7',
        '595ce85fa917841a00dfd069',
        '595ce9c8a917841a00dfd2cf',
        '595ceab6a917841a00dfd48b',
        '59df8897e4654211003b42ba',
        '5a9955e46385580013839fcc',
        '5a9956be638558001383a042',
        '5a995aa9638558001383a431',
        '5a995d9f638558001383a566',
        '5afd8e0ca562d500138bda59',
        '5b97df5f5f3c630013e8e619',
        '5b97dff65f3c630013e8e671',
        '5b97e05b5f3c630013e8e6a0',
      ],
    },
    // Nomblot
    '05b7db01b25b7b054782759e8cc5a084': {
      displayName: 'Nomblot',
      appId: '05b7db01b25b7b054782759e8cc5a084',
      appSecret: 'rAryMJoWwbbEPfbwQe3S9HPsKXHEDkaV',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '591c436c0261751a00130d93',
        '591c44880261751a00130fd1',
        '591c467f0261751a001311dc',
        '591c473c0261751a00131294',
        '591c47dd0261751a00131317',
        '591c48990261751a001313b3',
        '591c49420261751a00131448',
        '591c4ace0261751a00131559',
        '591c4bb80261751a001315dd',
        '591c4c660261751a00131626',
        '591c4d110261751a0013165a',
        '591c4dbf0261751a001316a8',
        '5b75360e550942001308ab79',
        '5b753a4e550942001308acc6',
        '5b753bab550942001308ad6e',
        '5b753c80550942001308adab',
        '5bc4561418ea8700144395fd',
        '5bd9877f5e7788001459e7bf',
        '5bd988705e7788001459ebce',
      ],
    },
    // Maurel
    ac26fda999d3f3f091c2bf29db4df271: {
      displayName: 'Maurel',
      appId: 'ac26fda999d3f3f091c2bf29db4df271',
      appSecret: 'CaxSNgETcogOYqe8mbp90ILvI0zdW3gD',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '570ec7213bbdaa1a004edcc0',
        '59a55ec91cc9e91a00740e39',
        '59a82ab188b3b51a00adc3b5',
        '59a82b2888b3b51a00adc439',
        '59a926829de08e1b006eb7dc',
        '59a927389de08e1b006eb7f7',
        '59a9280f9de08e1b006eb812',
        '59a929249de08e1b006eb85f',
        '59a929ed9de08e1b006eb8d5',
        '59a92a909de08e1b006eb923',
        '59a92c429de08e1b006eba4a',
        '59a92cc09de08e1b006eba5a',
        '59a92d439de08e1b006eba70',
        '59a92df99de08e1b006ebaab',
        '59a92f529de08e1b006ebaec',
        '59a930479de08e1b006ebb2c',
        '5a82b97531062400137eb5d0',
        '5a82b77a31062400137eb1bf',
        '5a966ccf81ddf200131ae271',
        '5b92413624e6a3001376c7b4',
        '5b92401224e6a3001376c76a',
        '5bed7373077f100014b68ab8',
        '5d1387415171cb0015d6ea88',
        '5cd52af6bfafbe00157f9d2b',
      ],
    },
    // Eurauto
    a703d812c60e59407e871491068fcf5a: {
      displayName: 'Eurauto',
      appId: 'a703d812c60e59407e871491068fcf5a',
      appSecret: 'sViGAoJD7HhoZRkaQcalNR9Nps6q1m7h',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '57f3b5854566381900623c7d',
        '588a38a56f47f21a00dd5bae',
        '580f7949128b2e1900144d93',
        '57f3b7e54566381900623c91',
        '57f3b7594566381900623c8b',
        '57f3b8454566381900623c92',
        '57f3b8f04566381900623c9c',
      ],
    },
    // Alliance
    d0e6b24d538886e5a0972c0c29e8b86e: {
      displayName: 'Alliance',
      appId: 'd0e6b24d538886e5a0972c0c29e8b86e',
      appSecret: '5jHtfouLq2yuxhZGFKV9KeiDHitfPIal',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: true,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5c77b17e31b4b30015ceef92',
        '5cb6d700ee0d7000158a2213',
        '5cb6d78bee0d7000158a2223',
        '5cb6d813ee0d7000158a2227',
        '5cb6d85dee0d7000158a222a',
        '5cb6d8b4ee0d7000158a2230',
        '5cb6d914ee0d7000158a2241',
        '5cb6d973ee0d7000158a2246',
        '5cb6da49ee0d7000158a2255',
        '5cb6da98ee0d7000158a225a',
        '5cb6dadcee0d7000158a225d',
        '5cb6db63ee0d7000158a22a1',
        '5cb6dbafee0d7000158a22a9',
        '5cb6dc1aee0d7000158a22af',
        '5cb6dcaeee0d7000158a22b4',
        '5cb6dd94ee0d7000158a22b9',
        '5cb6e053ee0d7000158a22ff',
        '5cb6e094ee0d7000158a2304',
        '5cb6e0ccee0d7000158a2307',
        '5cb6e102ee0d7000158a2323',
        '5cb6e139ee0d7000158a2326',
        '5cb6e1e4ee0d7000158a2329',
        '5cb6e220ee0d7000158a232e',
        '5cb6e272ee0d7000158a2347',
        '5cb6e3fcee0d7000158a2369',
        '5cb6e45fee0d7000158a2374',
        '5cb6e4baee0d7000158a237a',
        '5cb6e4ddee0d7000158a2381',
        '5cb6e54dee0d7000158a238c',
        '5cb6e5b0ee0d7000158a2398',
        '5cb6e60fee0d7000158a239d',
        '5cb6e66aee0d7000158a239f',
        '5cb6e6ccee0d7000158a23a7',
        '5cb6e735ee0d7000158a23b9',
        '5cb6e785ee0d7000158a23c1',
        '5cb6e7deee0d7000158a23c2',
        '5cb6e832ee0d7000158a23cb',
        '5cb6e888ee0d7000158a23ce',
        '5cb6e8e3ee0d7000158a23d3',
        '5cb6e936ee0d7000158a2411',
        '5cb6eb64ee0d7000158a2544',
        '5cb6ebcaee0d7000158a254d',
        '5cb6ed80ee0d7000158a2585',
        '5cb6eddfee0d7000158a258d',
        '5cc8448532eaa9001532b36c',
        '5cc6f62a146f390015c01604',
        '5cc8683a32eaa9001532bd45',
        '5aa6b17a9da6bd001371588d',
        '5bcdc31d45aba3001411bf9b',
        '5be6b761e087640014a578a6',
        '5bead44340aeac0014bc71f4',
        '5bebfdd08f4e920014f24fca',
        '5bec04838f4e920014f25a86',
        '5bec06e08f4e920014f25b6e',
        '5bec27ab8f4e920014f2647a',
        '5bec2bab8f4e920014f26622',
        '5bec32638f4e920014f2670d',
        '5bec47624945dc00144d38ef',
        '5bec48224945dc00144d3911',
        '5bec4d104945dc00144d39b1',
        '5bec4c484945dc00144d39a4',
        '5bec4b374945dc00144d3979',
        '5bec4f854945dc00144d3a24',
        '5bec4e124945dc00144d39d7',
        '5bec53764945dc00144d3af3',
        '5bed4ff1077f100014b67e70',
        '5bec50ac4945dc00144d3a56',
        '5bed4e5f077f100014b67833',
        '5bee8a1ec1903c0014f24d10',
        '5bed529d077f100014b68110',
        '5c110aacc8988c00147d4664',
        '5bed9f08c1903c0014f23929',
        '5c126a56a009c70014c3fa3f',
        '5bec520f4945dc00144d3a84',
        '5c110aacc8988c00147d4665',
        '5c41e620cb06e80015dfa088',
        '5c335a007220ce0015c5e622',
        '5bed509d077f100014b68030',
        '5c52be19b7c2e600151780f7',
        '5bec498f4945dc00144d392f',
        '5c5995b64096ce0015230f32',
        '5c5994564096ce0015230d90',
        '5c5b0a16d0d5a50015fa2ef9',
        '5bec44924945dc00144d3849',
        '5bec35678f4e920014f26772',
        '5c5b0ac0d0d5a50015fa2f24',
        '5cb5c22cee0d70001589fd31',
        '5bebfd168f4e920014f24d0e',
        '5bec29b18f4e920014f265f4',
        '5cc6baa6146f390015bfdf1b',
        '5d0cd3851262b3001546631a',
      ],
    },
    // Parot
    a3a352830e6f77ef522c6c428763cf61: {
      displayName: 'Parot',
      appId: 'a3a352830e6f77ef522c6c428763cf61',
      appSecret: 'NcA0GA3eHlNq0uhLjk8RZjQHDzSrPlQQ',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '58cbabafdaa35d1a0066809b',
        '58cbad20daa35d1a006680fa',
        '590358403235a9190089ecab',
        '59035adba50f4019006c3124',
        '59035be0a50f4019006c3467',
        '59035d1da50f4019006c3868',
        '59035f2e50974b1900931b25',
        '590ae6a98cff1919006a3231',
        '590ae72d8cff1919006a323c',
        '590ae8108cff1919006a3279',
        '590ae8b68cff1919006a328d',
        '590ae98f8cff1919006a32c4',
        '590aebef8cff1919006a330f',
        '590aecc68cff1919006a334c',
        '590b3f3533c3b51900b66ff8',
        '591465f78706791900e3d789',
        '5e34494c49b8510015ffa7ec',
        '5f49027921be6c000365dfe2',
      ],
    },
    // One Motor
    '081534ea7ac43b6db48c8753243db4bd': {
      displayName: 'OneMotor',
      appId: '081534ea7ac43b6db48c8753243db4bd',
      appSecret: 'uVlvlGZvexk29fJQYD5qJxP70UAPPxZm',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5eda54e2bee9d80016495126',
        '5eda6068bee9d80016495468',
        '5ed907a2ccbad5001631fd98',
        '5f242742eef5b200034078dd',
        '5ed9312eccbad500163209c3',
        '5f242ba4eef5b20003407a1d',
        '5ed93236ccbad500163209e2',
        '5ed8ef16ccbad5001631f50d',
        '5ed8ff8dccbad5001631fb4a',
        '5ed9f769bee9d80016493501',
        '5ed8ed35ccbad5001631f41f',
        '5ed904e4ccbad5001631fce4',
        '5ed9fd3ebee9d800164935c8',
        '5eda5807bee9d8001649520e',
      ],
    },
    // Catsa
    '1fa7249be40c775ec0c64e258c5ba3a7': {
      displayName: 'Catsa',
      appId: '1fa7249be40c775ec0c64e258c5ba3a7',
      appSecret: 'icvlEy4oNme76b8eykLP7OsukIa0bF2S',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5e2ab96d7398b30015aa0200',
        '5e2aba877398b30015aa021a',
        '5e2abb557398b30015aa023d',
        '5e2abc617398b30015aa024f',
        '5e2abd617398b30015aa027b',
        '5e2ac0377398b30015aa02ea',
        '5e2ac0f67398b30015aa031b',
        '5e2ac20b7398b30015aa033b',
        '5e2ac3547398b30015aa0351',
        '5e2ac41c7398b30015aa035f',
        '5e2ac5f97398b30015aa03a3',
        '5e2ac6be7398b30015aa03ad',
        '5e2ac98c7398b30015aa0418',
        '5e2acb7c7398b30015aa046e',
        '5e2acc477398b30015aa04ad',
        '5e2acd607398b30015aa0511',
        '5e2ace027398b30015aa0538',
        '5e2aceaa7398b30015aa0569',
        '5e2acf797398b30015aa0599',
        '5e2acff87398b30015aa05bb',
        '5e2ad14c7398b30015aa05fd',
        '5e2ad1d47398b30015aa060d',
        '5e2ad2a37398b30015aa061c',
        '5e2ad3247398b30015aa0634',
        '5e2ad3ae7398b30015aa0643',
        '5e5f6c060e1c740015b4ffbc',
      ],
    },
    '6ac4dc931351c8f935f3b5612e66fcf4': {
      displayName: 'SN Diffusion',
      appId: '6ac4dc931351c8f935f3b5612e66fcf4',
      appSecret: 'K33TIDtVJi96JdflEQHc06F72n1CMPiO',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5f71e78815c51b0003f19920',
        '5f71e91915c51b0003f19963',
        '5f71ec2815c51b0003f199e7',
        '5f71edce15c51b0003f19a31',
        '5f71ee8115c51b0003f19a51',
        '5f71ef7a15c51b0003f19a88',
        '5f71f01c15c51b0003f19aa5',
        '5f71f12e15c51b0003f19adc',
      ],
    },
    '548c3386e77cb4e1b83ce4fa912af57e': {
      displayName: 'Touring Automobiles',
      appId: '548c3386e77cb4e1b83ce4fa912af57e',
      appSecret: 'GZn7Wym6vxCT6yJb86q3yhA6aZzBuZQ9',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5e31abc2369b0600154e874e',
        '5e31afca369b0600154e8806',
        '5cb7493f1a4e64001555282f',
        '5d92190f86442200154efd52',
        '5d9219ea86442200154efd6b',
        '5d921acc86442200154efd81',
        '600feb556cb07c0003355dc7',
        '601128a5af77f30003451b81',
      ],
    },
    '3c6de65f120397e632a2e7aa9ac57174': {
      displayName: 'Sipa-automobiles',
      appId: '3c6de65f120397e632a2e7aa9ac57174',
      appSecret: 'dUqB5ku2pvyQj2l0RFu8lB7xoYIy8haZ',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5e5930cd111c70001572a40b',
        '5e59328a111c70001572a46b',
        '5e5933c7111c70001572a4b3',
        '5e5933e5111c70001572a4b9',
        '5e59364c111c70001572a55a',
        '5e593673111c70001572a562',
        '5e5937e5111c70001572a5d7',
        '5e593935111c70001572a75f',
        '5e5939d9111c70001572a883',
        '5e593b3d111c70001572aa65',
        '5e593c88111c70001572aa99',
        '5e593cbc111c70001572aaa2',
        '5e593db1111c70001572aad8',
        '5e593e7f111c70001572aaf4',
        '5e5cef169b824b0015b07889',
        '5e5cf0c09b824b0015b07929',
        '5e5cf2329b824b0015b07980',
        '5e5cf2f59b824b0015b079aa',
        '5e5cf3c29b824b0015b079da',
        '5e5cf47b9b824b0015b07a01',
        '5e5cf5169b824b0015b07a1f',
        '5f15df16831a3c0003336f12',
      ],
    },
    '08d0e2a25a971768ea78690182194908': {
      displayName: 'bpm group',
      appId: '08d0e2a25a971768ea78690182194908',
      appSecret: 'R3fIcTLkTbuuEYE1RbfviwZtVtoM7a92',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true, // True: also get data from garages which are not indexed (bad reviews, for instance)
      permissions: [routesPermissions.LEADS, routesPermissions.REVIEWS, routesPermissions.SHARED_REVIEWS],
      authorizedGarages: [
        '5a16ac03e3b86c1300606cd4',
        '5a4bcd60f66427130030347a',
        '5ac5f8c9d8f30f00138b4d74',
        '5b30bdf2e9dca000135450db',
        '5b30bebae9dca00013545334',
        '5b30bf64e9dca000135455e3',
        '5b30c356e9dca00013546787',
        '5b30d2e2e9dca000135483bd',
        '5b30d477e9dca000135484ad',
        '5b30d605e9dca000135485b6',
        '5b30d7b4e9dca0001354878d',
        '5b30d89fe9dca00013548882',
        '5b30d929e9dca000135488d8',
        '5b30da4ee9dca0001354898e',
        '5b30e5f2e9dca0001354917f',
        '5b30e8e4e9dca00013549372',
        '5b30e994e9dca000135493b9',
        '5b30eb1fe9dca0001354948d',
        '5b30ec1ae9dca000135494e6',
        '5b30ed5ee9dca0001354958a',
        '5b30ede5e9dca000135495ac',
        '5b30f17fe9dca00013549759',
        '5b30f31ae9dca000135497ec',
        '5b30fb9ee9dca00013549c3e',
        '5b30fc9ee9dca00013549c89',
        '5b30fd35e9dca00013549cbf',
        '5b30fe33e9dca00013549d20',
        '5b30fe53e9dca00013549d2a',
        '5b30ff33e9dca00013549d9f',
        '5b310264e9dca0001354a026',
        '5b31055ee9dca0001354a11f',
        '5b6957866e72f30013446650',
        '5bb1f65ba335cd0014fd81ef',
        '5c3e0ad970550f00157cdd0c',
        '5c3e0d460cd6130015fba05c',
        '5c4b268125d9b000153bc53a',
        '5c4b296325d9b000153bc5d2',
        '5c51adfae384380015d486e3',
        '5c8f63f1c7622a001553a655',
        '5c8f64ebc7622a001553a65c',
        '5c8f6603b6645c001585b51f',
        '5c8f668db6645c001585b6cf',
        '5c8f6760b6645c001585b943',
        '5c8f6815b6645c001585bb4e',
        '5c8f68aab6645c001585bd26',
        '5c8f68f2b6645c001585bde3',
        '5c8f6944b6645c001585bea8',
        '5c8f698eb6645c001585bf6c',
        '5c8f69f0b6645c001585c0cd',
        '5c8f6b89b6645c001585c587',
        '5c8f6c33b6645c001585d05c',
        '5c8f6cf2b6645c001585d7ef',
        '5c8f6d86b6645c001585dae2',
        '5c8f6e13b6645c001585dcdf',
        '5c8f6e8db6645c001585df3c',
        '5cc7202e9bf17500158e4a88',
        '5cc720c99bf17500158e4a9f',
        '5cc722a69bf17500158e4ae1',
        '5cc7230b9bf17500158e4b14',
        '5cc728369bf17500158e4bfb',
        '5cc728a69bf17500158e4c01',
        '5cc729229bf17500158e4c06',
        '5cc7299b9bf17500158e4c1c',
        '5cdd719f3d5f8600156c0724',
        '5cf0f9f61dd5080015423dc1',
        '5cf0fb201dd5080015423dec',
        '5d84c3a32a44d900152fa198',
        '5dadb6cef4a1e400156d32ed',
        '5dadb855f4a1e400156d3338',
        '5db309dbefb6f40015724c32',
        '5e0dfc8bb63ad2001514b8ce',
        '5e343766123ff300156e3448',
        '5e343845123ff300156e347e',
        '5e3438be123ff300156e349e',
        '5e343957123ff300156e34c1',
        '5e3439fa123ff300156e34e0',
        '5e343f5649b8510015ffa5ab',
        '5e34400049b8510015ffa5dc',
        '5e3440db49b8510015ffa627',
        '5e34427349b8510015ffa690',
        '5e34431449b8510015ffa6ac',
        '5ed13e6c9a3134001618d7d0',
        '5fdcc54267afa50003e7edaa',
        '60103ecd6cb07c000335d347',
        '601041aa6cb07c000335d681',
        '601042f06cb07c000335d81b',
        '6010492f6cb07c000335e411',
        '60104d196cb07c000335e8dd',
        '601054e26cb07c000335efdc',
        '601055d86cb07c000335f0c5',
        '6013fabe270aaf0003d32cb1',
        '60ec48dc4d8c200003c72bdc',
        '60ed851f2a99e600037d9a79',
        '60ed8d222a99e600037da00c',
        '60ed8f5c2a99e600037da1c9',
        '60ed92be2a99e600037da5dd',
      ],
    },
    c31a902d23e1bca5cef007cd49435887: {
      displayName: 'Fabre',
      appId: 'c31a902d23e1bca5cef007cd49435887',
      appSecret: 'UDCcbPtP2vnvoxEOudnOmTSSfpyQybq7',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true,
      permissions: [routesPermissions.REVIEWS],
      authorizedGarages: [
        '602fe84da5cea70003b864dd',
        '602feb3fa5cea70003b8687b',
        '602fecf8a5cea70003b869e7',
        '61d704e47b77270003b03953',
        '61d70c3f7b77270003b03a13',
        '61d70fdb7b77270003b03a75',
        '61d712517b77270003b03aca',
        '61d7140c7b77270003b03af5',
        '61d716757b77270003b03b46',
        '61d71b507b77270003b03c04',
        '61d813450936350003a9997d',
        '61d813c30936350003a9998b',
        '61d8146b0936350003a99995',
        '61deff71492f2c00039df13a',
        '61df00f4492f2c00039df164',
        '61e019d2e2f6660003bfc6dc',
        '61e01d91e2f6660003bfc725',
        '61e01e39e2f6660003bfc736',
        '61e01fa2e2f6660003bfc760',
        '61e0216de2f6660003bfc795',
        '61e02443e2f6660003bfc803',
        '61e02848e2f6660003bfc8e5',
        '61e02940e2f6660003bfc8ff',
        '61e02a8ee2f6660003bfc923',
        '61e02b93e2f6660003bfc936',
        '61e02cf0e2f6660003bfc965',
        '61e02edbe2f6660003bfc98a',
      ],
    },
    '1a95de0ec2ee2fb3fbef1ff49c3d0de7': {
      displayName: 'GGP',
      appId: '1a95de0ec2ee2fb3fbef1ff49c3d0de7',
      appSecret: 'L1ntaImgAuSyqAHkSegmkwX6g5tuBW48',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true,
      permissions: [routesPermissions.REVIEWS],
      authorizedGarages: [
        '602bee774f88ea000353ac53',
        '602c0076052b9e0003765db5',
        '602bfa6b052b9e0003765641',
        '602bfc32052b9e0003765880',
        '602bf201052b9e000376466d',
        '602bf804052b9e000376522a',
        '602bfe5d052b9e0003765b56',
        '602bf6f1052b9e0003765017',
        '61c33e96f54b460003224143',
        '61c33a8cf54b4600032240f1',
        '61c33d2df54b460003224120',
      ],
    },
    b41eaa65bd40e5d36eb0e8d815fec4d7: {
      displayName: 'Laganier',
      appId: 'b41eaa65bd40e5d36eb0e8d815fec4d7',
      appSecret: 'sR6L2RZBQZLpzzWVcbDGxjpCovwt0eog',
      fullData: true,
      allGaragesAuthorized: false,
      allReviews: true,
      withheldGarageData: false,
      nonIndexedGarages: true,
      permissions: [routesPermissions.REVIEWS],
      authorizedGarages: [
        '5acb93922995780013cfd440',
        '5acb94972995780013cfd493',
        '5ccfef36dcefb60015865466',
        '5cc6ba6b146f390015bfdf14',
      ],
    },
  },
};
