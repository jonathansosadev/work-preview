/* eslint-disable */

module.exports = {
  label: 'B2CSiteIndex',
  before: async () => {},
  queryApollo: `query garageGetB2CSiteIndex($locale: String!) {
    garageGetB2CSiteIndex(locale: $locale) {
      garages {
          slug
          publicDisplayName
          type
          locale
      }
    }
  }`,
  variablesApollo: {
    locale: 'es_ES',
  },
  legacyQuery: `{ 
    B2CSiteIndex(locale: "es_ES") {
        garages {
          slug
          publicDisplayName
          type
          locale
      }
    }
  }`,
  getLegacyResults: (data) => {
    return JSON.stringify(data.B2CSiteIndex, null, 2);
  },
  getResults: (data) => {
    return JSON.stringify(data.garageGetB2CSiteIndex, null, 2);
  },
  expected: `{
  "garages": [
    {
      "slug": "mercedes-benz-sevilla",
      "publicDisplayName": "Mercedes Benz Puente de Triana - Concesur",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-motorad-taco",
      "publicDisplayName": "BMW Motorrad - Canaauto - Taco La Laguna",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-unknowncity",
      "publicDisplayName": "BMW Canaauto  - Las Chafiras",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-taco",
      "publicDisplayName": "MINI Canaauto  - Taco La Laguna",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-taco",
      "publicDisplayName": "BMW Canaauto - Taco La Laguna",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-sagunto",
      "publicDisplayName": "Talleres Salvador Opel Sagunto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-xativa",
      "publicDisplayName": "Autointer (Peugeot Xàtiva)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-xativa",
      "publicDisplayName": "GP Automoción (Opel Xàtiva)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-alcoi",
      "publicDisplayName": "GP Automoción (Opel Alcoy)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "citroen-alzira",
      "publicDisplayName": "Autointer (Citroen Alzira)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-alzira",
      "publicDisplayName": "Autointer (Peugeot Alzira)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-alzira",
      "publicDisplayName": "GP Automoción (Opel Alzira)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "hyundai-avila",
      "publicDisplayName": "Hyundai Cerverauto Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "jeep-avila",
      "publicDisplayName": "Jeep Cervera Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "fiat-avila",
      "publicDisplayName": "Fiat Cervera Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "alfa-romeo-avila",
      "publicDisplayName": "Alfa Romeo Cervera Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-avila",
      "publicDisplayName": "Mazda Cervera Drive Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "kia-avila",
      "publicDisplayName": "Kia Cervera Motor Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-avila",
      "publicDisplayName": "Opel Cervera Sport Avila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-castilleja-de-la-cuesta",
      "publicDisplayName": "Opel Movil 5 Castilleja",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-valencia",
      "publicDisplayName": "Opel Vara de Quart Valencia",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "suzuki-zaratan",
      "publicDisplayName": "Suvisa Suzuki Valladolid",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-zaratan",
      "publicDisplayName": "Autofor Ford Valladolid",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "kia-zaratan",
      "publicDisplayName": "Autoconsa Kia Valladolid",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-valladolid",
      "publicDisplayName": "Beycar Peugeot Valladolid",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-zaratan",
      "publicDisplayName": "Vepisa Opel Valladolid",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-cadiz",
      "publicDisplayName": "Mazda Cádiz - Tempul Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-jerez-de-la-frontera",
      "publicDisplayName": "Ford Jerez Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "skoda-algeciras",
      "publicDisplayName": "Skoda Algeciras - Grazalema Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-el-puerto-de-santa-maria",
      "publicDisplayName": "VW El Puerto de Santa Maria  - Solera Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "audi-jerez-de-la-frontera",
      "publicDisplayName": "Audi Jerez - Solera Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-madrid-5cebaf94c34dae001598ca8e",
      "publicDisplayName": "ITARSA Servicios Mercedes",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-avila",
      "publicDisplayName": "ITRA Itarsa Avila - Mercedes Smart",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-segovia",
      "publicDisplayName": "ITRA Itarsa Segovia - Mercedes Smart",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-madrid-5ce81b6b105c320015767c71",
      "publicDisplayName": "ITRA Pradillo Mercedes",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-valls",
      "publicDisplayName": "FORD VALLS - TARRACO CENTER",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-tarragona-5e2b25117398b30015aa11a2",
      "publicDisplayName": "FORD CENTRE TRANSIT - TARRACO CENTER",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-reus",
      "publicDisplayName": "FORD REUS CAR - TARRACO CENTER",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-tarragona",
      "publicDisplayName": "FORD STORE TARRAGONA - TARRACO CENTER",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-los-barrios",
      "publicDisplayName": "VW LOS BARRIOS  - BAHIA MOVIL - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-chiclana-de-la-frontera",
      "publicDisplayName": "VW CHICLANA - BAHIA MOVIL - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-cadiz",
      "publicDisplayName": "VW CADIZ - BAHIA MOVIL - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "kia-algeciras",
      "publicDisplayName": "KIA ALGECIRAS - MIRAMAR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "kia-cadiz",
      "publicDisplayName": "KIA CADIZ - MIRAMAR- GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "kia-jerez-de-la-frontera",
      "publicDisplayName": "KIA JEREZ - TRASUR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-ubeda",
      "publicDisplayName": "BMW UBEDA - MOTRIMOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-jaen",
      "publicDisplayName": "MINI JAEN - MOTRIMOTOR  - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-jaen",
      "publicDisplayName": "BMW JAEN - MOTRIMOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-granada-5e2ac6be7398b30015aa03ad",
      "publicDisplayName": "BMW MOTRIL - ILBIRA MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-motorad-granada",
      "publicDisplayName": "BMW MOTORRAD GRANADA - ILBIRA MOTOR - GRUPO CATSA",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-granada",
      "publicDisplayName": "MINI GRANADA - ILBIRA MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-granada",
      "publicDisplayName": "BMW GRANADA - ILBIRA MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-lucena",
      "publicDisplayName": "BMW LUCENA - SAN RAFAEL MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-cordoba",
      "publicDisplayName": "BMW CORDOBA - SAN RAFAEL MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-algeciras",
      "publicDisplayName": "BMW LOS BARRIOS - CARTEYA MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-tomares",
      "publicDisplayName": "MINI SEVILLA - ALJARAFE MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-tomares",
      "publicDisplayName": "BMW SEVILLA - ALJARAFE MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-sevilla",
      "publicDisplayName": "MINI SEVILLA - SAN PABLO MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-sevilla",
      "publicDisplayName": "BMW SEVILLA - SAN PABLO MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-madrid-5e0ddecc4521cc0015fd05b2",
      "publicDisplayName": "JARMAUTO Vara del Rey",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "audi-madrid-5e0dddfc4521cc0015fd059f",
      "publicDisplayName": "JARMAUTO Canarias",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-segovia",
      "publicDisplayName": "Ford Segovia Autoinsa",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-leon",
      "publicDisplayName": "Ford León Auto Palacios",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-santiago-de-compostela",
      "publicDisplayName": "Gonzacar Ford Santiago de Compostela",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-elexalde",
      "publicDisplayName": "Mintegui Ford Leioa",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-velez-malaga",
      "publicDisplayName": "Garum Motor Ford Velez Malaga",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-camas",
      "publicDisplayName": "FERRI MOVIL Ford Camas",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-granollers",
      "publicDisplayName": "Ford Granollers - Comercial Vila Vila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-sabadell",
      "publicDisplayName": "Ford Sabadell - Comercial Vila Vila",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "toyota-sevilla",
      "publicDisplayName": "NIMO GORDILLO AUTOMOVILES",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-lleida",
      "publicDisplayName": "Opel Lleida - Lleidamòbil",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "hyundai-olias-del-rey",
      "publicDisplayName": "Gidecar Hyundai Toledo",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "abarth-malaga",
      "publicDisplayName": "Grupo Nieto Fimálaga Grupo Fiat Málaga",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "abarth-huercal-de-almeria",
      "publicDisplayName": "Nieto Adame Grupo Fiat Almeria",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "land-rover-huercal-de-almeria",
      "publicDisplayName": "Nieto Adame Land Rover Jaguar Almeria",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-denia",
      "publicDisplayName": "Ford Auto Christian Denia",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-cordoba",
      "publicDisplayName": "MINI CORDOBA - SAN RAFAEL MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-terrassa",
      "publicDisplayName": "COVESA - FORD TERRASSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-mollet-del-valles",
      "publicDisplayName": "COVESA - FORD MOLLET",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-mataro",
      "publicDisplayName": "COVESA - FORD MATARO",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-badalona",
      "publicDisplayName": "COVESA - FORD BADALONA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-colindres",
      "publicDisplayName": "Motor Colindres",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-madrid",
      "publicDisplayName": "Ford Conde Peñalver Deysa",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-cocentaina",
      "publicDisplayName": "Serpis Automoción (Peugeot Alcoy)",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-algeciras",
      "publicDisplayName": "MINI ALGECIRAS - CARTEYA MOTOR - GRUPO CATSA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-motorad-jaen",
      "publicDisplayName": "BMW MOTORRAD  JAEN - MOTRIMOTOR - GRUPO CATSA",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    },
    {
      "slug": "piaggio-almeria",
      "publicDisplayName": "EASA PIAGGIO CENTER",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    },
    {
      "slug": "autre-almeria-5efca6c97c9ee80003a883a4",
      "publicDisplayName": "HIPERCAR  Roquetas de Mar",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "autre-almeria",
      "publicDisplayName": "HIPERCAR  Huércal de Almería",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-el",
      "publicDisplayName": "INDACENTRO MAZDA Roquetas de Mar",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volvo-almeria",
      "publicDisplayName": "INDACAR VOLVO Huércal de Almería",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-almeria",
      "publicDisplayName": "INDACENTRO MAZDA  Huércal de Almería",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "seat-unknowncity",
      "publicDisplayName": "Seat Talleres Menorca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "audi-palma",
      "publicDisplayName": "Audi Center Palma",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-malaga",
      "publicDisplayName": "Mazda Koni Motor Malaga",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-palma",
      "publicDisplayName": "Ford Motor Mallorca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "jaguar-palma",
      "publicDisplayName": "Jaguar/Land Rover Motor Mallorca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-inca",
      "publicDisplayName": "Volkswagen Inca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-inca",
      "publicDisplayName": "Ford Motor Inca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "seat-inca",
      "publicDisplayName": "Seat Motor Inca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-marbella",
      "publicDisplayName": "Ford Autovisa Marbella",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-malaga",
      "publicDisplayName": "Ford Autovisa Málaga",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-palma",
      "publicDisplayName": "Mazda Japonesa Balear Palma",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "seat-poligono-industrial-de-son-castello",
      "publicDisplayName": "Seat Palma",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-mao",
      "publicDisplayName": "Volkswagen Medea Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "audi-mao",
      "publicDisplayName": "Audi Medea Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-manzanares",
      "publicDisplayName": "Opel Manzanares Futurcar",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-quintanar-de-la-orden",
      "publicDisplayName": "Opel Quintanar Talleres Benavent",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-talavera-de-la-reina",
      "publicDisplayName": "Opel Talavera Benmóvil",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-olias-del-rey-5efc75d52a28cc0033c8168c",
      "publicDisplayName": "Opel Toledo Benmóvil",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "skoda-cadiz",
      "publicDisplayName": "VW Comerciales Algeciras - Grazalema Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-jerez-de-la-frontera",
      "publicDisplayName": "Mazda Jerez - Tempul Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-utilitaires-el-puerto-de-santa-maria",
      "publicDisplayName": "VW Comerciales el Puerto de Santa Maria - Solera Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-jerez-de-la-frontera",
      "publicDisplayName": "VW Jerez - Solera Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-utilitaires-jerez-de-la-frontera",
      "publicDisplayName": "VW Comerciales Jerez - Solera Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "skoda-jerez-de-la-frontera",
      "publicDisplayName": "Skoda Jerez - Solera  Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "skoda-el-puerto-de-santa-maria",
      "publicDisplayName": "Skoda El Puerto de Santa María - Solera Motor",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-las-palmas-de-gran-canaria",
      "publicDisplayName": "MINI Las Palmas  - Marmotor Canarias",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-motorad-las-palmas-de-gran-canaria",
      "publicDisplayName": "BMW Motorrad Las Palmas  - Marmotor Canarias",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-las-palmas-de-gran-canaria",
      "publicDisplayName": "BMW Las Palmas - Marmotor Canarias",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-san-juan-de-alicante",
      "publicDisplayName": "Ford San Juan Movilsa",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "land-rover-las-palmas-de-gran-canaria",
      "publicDisplayName": "Jaguar Land Rover - Pelican - Las Palmas",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-malaga-5f7ddc3ff5d1a200032ce01f",
      "publicDisplayName": "Garum Motor Ford Malaga",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-cadiz",
      "publicDisplayName": "MOVICADIZ BMW",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mini-jerez-de-la-frontera",
      "publicDisplayName": "Movijerez Jerez MINI",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "bmw-jerez-de-la-frontera",
      "publicDisplayName": "Movijerez Jerez BMW",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "autre-tarragona-5f2d5a86808cbb0003a05ade",
      "publicDisplayName": "AUTOKOLECCIO FORD STORE TARRAGONA",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-ciudad-real",
      "publicDisplayName": "Peugeot Ciudad Real Ciudauto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-santa-marta-de-tormes",
      "publicDisplayName": "Peugeot Martamovil Salamanca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-santa-marta-de-tormes",
      "publicDisplayName": "Opel Martamovil Salamanca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "kia-santa-marta-de-tormes",
      "publicDisplayName": "Kia Martamotor Salamanca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-albacete",
      "publicDisplayName": "Mercedes Autoprima Albacete",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-sant-boi-de-llobregat",
      "publicDisplayName": "Mazda Sant Boi - Linkcar Automoció",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "honda-girona",
      "publicDisplayName": "Honda Girona - Lluis Blanch",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-guadalajara",
      "publicDisplayName": "Opel ACAI Guadalajara",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-granada",
      "publicDisplayName": "Opel/ Suzuki Autiberia G Nieto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-malaga",
      "publicDisplayName": "Opel Autopremier Malaga G Nieto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-marbella",
      "publicDisplayName": "Opel Autopremier costa Marbella G Nieto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-mijas",
      "publicDisplayName": "Opel Autopremier costa Mijas G nieto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-motilla-del-palancar",
      "publicDisplayName": "Mercedes Autoprima Motilla",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "dacia-fuenlabrada-5cfe82d8b459210015813bc4",
      "publicDisplayName": "Dacia Fuenlabrada Fuenlamóvil",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mazda-alcala-de-henares",
      "publicDisplayName": "Gil Automoción Mazda Alcalá de Henares",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-mollet-del-valles",
      "publicDisplayName": "Opel Mollet - Molletauto",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-carballo",
      "publicDisplayName": "Dimolk Peugeot Carballo",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "honda-moto-gandia",
      "publicDisplayName": "Honda Moto Gandiauto",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-colmenar-viejo",
      "publicDisplayName": "Mercedes MERBAUTO Colmenar",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "renault-fuenlabrada",
      "publicDisplayName": "Renault Fuenlabrada Fuenlamóvil",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "peugeot-santiago-de-compostela",
      "publicDisplayName": "Dimonorte Peugeot Santiago",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "ford-cambrils",
      "publicDisplayName": "FORD CAMBRILS CENTER - TARRACO CENTER",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "citroen-mollet-del-valles",
      "publicDisplayName": "Citroen Mollet - Motor Mollet",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "opel-alcala-de-henares",
      "publicDisplayName": "Agrogil Opel Alcala de Henares",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "volkswagen-madrid",
      "publicDisplayName": "JARMAUTO Rivas Volkswagen",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "jarmauto-madrid-audi",
      "publicDisplayName": "JARMAUTO Rivas Audi",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-pio-xii-madrid",
      "publicDisplayName": "ITRA Pio XII Mercedes Smart",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-rivas-vaciamadrid",
      "publicDisplayName": "Mercedes MERBAUTO Rivas",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "mercedes-benz-cuenca",
      "publicDisplayName": "Mercedes Autoprima Cuenca",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "smart-pradillo-madrid",
      "publicDisplayName": "ITRA Pradillo Smart",
      "type": "Dealership",
      "locale": "es_ES"
    },
    {
      "slug": "honda-moto-valencia",
      "publicDisplayName": "Honda Moto Valencia",
      "type": "MotorbikeDealership",
      "locale": "es_ES"
    }
  ]
}`,
};
