const path = require('path');
const chai = require('chai');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const gsLogger = require('../../../../common/lib/garagescore/logger');
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');

gsLogger.setLevel(gsLogger.LEVELS.ERROR);

const { expect } = chai;

chai.should();
/* eslint-disable max-len */

const columns = require('./configs/generic-columns');
const vehicleMakes = require('./configs/generic-vehiclemakes');
const dataTypeFormatting = require('./configs/generic-types');

const parserConfig = {
  _reference: 'icar_generic',
  foreigns: {
    parserColumnsId: '1',
    parserVehicleMakesId: '1',
    parserTypesId: '1',
  },
  fileformat: {
    format: 'csv',
    charset: 'UTF-8',
    ignoreFirstXLines: '0',
    worksheetName: null,
    path: null,
  },
  format: {
    dataRecordCompletedAt: {
      Maintenance: 'YYYY-MM-DD',
      VehicleSale: 'YYYY-MM-DD',
      NewVehicleSale: 'YYYY-MM-DD',
      UsedVehicleSale: 'YYYY-MM-DD',
      Unknown: 'YYYY-MM-DD',
      LeadOnly: '',
      ExogenousReview: '',
      VehicleInspection: '',
      ExogenousLead: '',
      ManualLead: '',
      ManualUnsatisfied: '',
    },
    vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
  },
  defaults: {
    city: null,
    countryCode: 'FR',
    postCode: null,
    streetAddress: null,
  },
  transformers: {
    tsvToCsv: '1',
    vsvToCsv: null,
    colsizeCsv: '63',
    headerlessCsv: {
      Maintenances: {
        header:
          ';namecss;IDsociété;;providedGarageId;;;dataRecordCompletedAt;numfact;providedCustomerId;VIN;vehicleRegistrationPlate;vehicleMileage;providedFrontDeskUserName;testpresta;CargoGroupType;price1;price2;;codeClient;;gender;lastName;firstName;rue;;postCode;city;;;officePhone;mobilePhone;homePhone;fax;email;;;;;flagOptOut;;vehicleMake;vehicleModel;;;Chassis;Immatriculation;;;vehicleRegistrationFirstRegisteredAt;;;modelType;;TypeVehiculeIcar;;;;;ID_section;section;Descrip',
      },
      MixedVehicleSales: {
        header:
          'providedCustomerId;gender;firstName;lastName;postCode;city;rue;;homePhone;officePhone;mobilePhone;email;;;;;vehicleRegistrationPlate;vehicleMake;vehicleModel;rowType;;;dataRecordCompletedAt;VIN;Société;providedGarageId;providedFrontDeskUserName;;salecode;Intermediaire',
      },
      NewVehicleSales: {
        header: '',
      },
      UsedVehicleSales: {
        header: '',
      },
      Mixed: {
        header: '',
      },
      VehicleInspections: {
        header: '',
      },
    },
  },
  country: null,
  optionalCompletedAt: false,
};
/** deprecated, delete after 09/2020
 *
const { promisify } = require('util');
const TestApp = require('../../../../common/lib/test/test-app');
 * const app = new TestApp();
const confSharedImportFilters = [
      "{\"city\"} != \"CESSION\"i",
      "[\"salecode\"] != \"X\" and [\"tgVehCliente.TipoRelacion\"] != \"X\" and [\"tgVehCliente．TipoRelacion\"] != \"X\"",
      "!{\"firstName\"} inc (\"Abarth\", \"Acura\", \"Alfa\", \"Alpine\", \"Aston\", \"Bellier\", \"Bentley\", \"BMW\", \"Bugatti\", \"Buick\", \"Cadillac\", \"Caterham\", \"Chatenet\", \"Chevrolet\", \"Citroen\", \"Chrysler\", \"Dacia\", \"Daewoo\", \"Daihatsu\", \"Datsun\", \"Dodge\", \"Ferrari\", \"Fiat\", \"Ford\", \"Grasser\", \"Harley Davidson\", \"Honda\", \"Holden\", \"Hummer\", \"Hyundai\", \"Infiniti\", \"Iveco\", \"Isuzu\", \"Jaguar\", \"Jeep\", \"Kawasaki\", \"Kia \", \" Kia\", \"Lancia\", \"rover\", \"Lexus\", \"Ligier\", \"Lotus\", éLuxgen\", \"Maserati\", \"Mazda\", \"Mercedes\", \"Benz\", \"Mitsubishi\", \"Nissan\", \"Opel\", \"Peugeot\", \"Piaggio\", \"Porshe\", \"QUA2\", \"Renault\", \"SAAB\", \"Schumacher\", \"Seat\", \"Ssangyong\", \"Skoda\", \"Smart\", \"Subaru\", \"Suzuki\", \"Talbot\", \"Tesla\", \"Toyota\", \"Vauxhall\", \"Volkswagen\", \"Volvo\", \"Yama\", \"Utilitaire\")",
      "!{\"lastName\"} inc (\"Abarth\", \"Acura\", \"Alfa\", \"Alpine\", \"Aston\", \"Bellier\", \"Bentley\", \"BMW\", \"Bugatti\", \"Buick\", \"Cadillac\", \"Caterham\", \"Chatenet\", \"Chevrolet\", \"Citroen\", \"Chrysler\", \"Dacia\", \"Daewoo\", \"Daihatsu\", \"Datsun\", \"Dodge\", \"Ferrari\", \"Fiat\", \"Ford\", \"Grasser\", \"Harley Davidson\", \"Honda\", \"Holden\", \"Hummer\", \"Hyundai\", \"Infiniti\", \"Iveco\", \"Isuzu\", \"Jaguar\", \"Jeep\", \"Kawasaki\", \"Kia \", \" Kia\",  \"Lancia\", \"rover\", \"Lexus\", \"Ligier\", \"Lotus\", éLuxgen\", \"Maserati\", \"Mazda\", \"Mercedes\", \"Benz\", \"Mitsubishi\", \"Nissan\", \"Opel\", \"Peugeot\", \"Piaggio\", \"Porshe\", \"QUA2\", \"Renault\", \"SAAB\", \"Schumacher\", \"Seat\", \"Ssangyong\", \"Skoda\", \"Smart\", \"Subaru\", \"Suzuki\", \"Talbot\", \"Tesla\", \"Toyota\", \"Vauxhall\", \"Volkswagen\", \"Volvo\", \"Yama\", \"Utilitaire\")",
      "!{\"fullName\"} inc (\"Abarth\", \"Acura\", \"Alfa\", \"Alpine\", \"Aston\", \"Bellier\", \"Bentley\", \"BMW\", \"Bugatti\", \"Buick\", \"Cadillac\", \"Caterham\", \"Chatenet\", \"Chevrolet\", \"Citroen\", \"Chrysler\", \"Dacia\", \"Daewoo\", \"Daihatsu\", \"Datsun\", \"Dodge\", \"Ferrari\", \"Fiat\", \"Ford\", \"Grasser\", \"Harley Davidson\", \"Honda\", \"Holden\", \"Hummer\", \"Hyundai\", \"Infiniti\", \"Iveco\", \"Isuzu\", \"Jaguar\", \"Jeep\", \"Kawasaki\", \"Kia \", \" Kia\",  \"Lancia\", \"rover\", \"Lexus\", \"Ligier\", \"Lotus\", éLuxgen\", \"Maserati\", \"Mazda\", \"Mercedes\", \"Benz\", \"Mitsubishi\", \"Nissan\", \"Opel\", \"Peugeot\", \"Piaggio\", \"Porshe\", \"QUA2\", \"Renault\", \"SAAB\", \"Schumacher\", \"Seat\", \"Ssangyong\", \"Skoda\", \"Smart\", \"Subaru\", \"Suzuki\", \"Talbot\", \"Tesla\", \"Toyota\", \"Vauxhall\", \"Volkswagen\", \"Volvo\", \"Yama\", \"Utilitaire\")",
      "!{\"firstName\"} in (\"A3\", \"AR\", \"Alfaromeo\", \"CHRY\", \"Citroën\", \"DACI\", \"DS\", \"Harley-Davidson\", \"HARL\", \"HR\", \"HO\", \"Land-rover\", \"LR\", \"MB\", \"VW\", \"Rolls Royce\", \"Rolls-Royce\")",
      "!{\"lastName\"} in (\"A3\", \"AR\", \"Alfaromeo\", \"CHRY\", \"Citroën\", \"DACI\", \"DS\", \"Harley-Davidson\", \"HARL\", \"HR\", \"HO\", \"Land-rover\", \"LR\", \"MB\", \"VW\", \"Rolls Royce\", \"Rolls-Royce\")",
      "!{\"fullName\"} in (\"A3\", \"AR\", \"Alfaromeo\", \"CHRY\", \"Citroën\", \"DACI\", \"DS\", \"Harley-Davidson\", \"HARL\", \"HR\", \"HO\", \"Land-rover\", \"LR\", \"MB\", \"VW\", \"Rolls Royce\", \"Rolls-Royce\")",
      "!{\"firstName\"} inc (\"Banque\", \"Bank\", \"Crédit\", \"Credit\", \"Poste\", \"Société\", \"Societe\", \"Eparne\", \"Épargne\", \"Accord\", \"Barclays\", \"Paribas\", \"Cetelem\")",
      "!{\"lastName\"} inc (\"Banque\", \"Bank\", \"Crédit\", \"Credit\", \"Poste\", \"Société\", \"Societe\", \"Eparne\", \"Épargne\", \"Accord\", \"Barclays\", \"Paribas\", \"Cetelem\")",
      "!{\"gender\"} inc (\"Banque\", \"Bank\", \"Crédit\", \"Credit\", \"Poste\", \"Eparne\", \"Épargne\", \"Accord\", \"Barclays\", \"Paribas\", \"Cetelem\")",
      "!{\"fullName\"} inc (\"Banque\", \"Bank\", \"Crédit\", \"Credit\", \"Poste\", \"Société\", \"Societe\", \"Eparne\", \"Épargne\", \"Accord\", \"Barclays\", \"Paribas\", \"Cetelem\")",
      "!{\"firstName\"} in (\"BRED\", \"CIC\", \"CM\", \"CM-CIC\", \"CM CIC\", \"CM - CIC\", \"CM CIC BAIL\", \"CM-CIC BAIL\", \"CM - CIC BAIL\", \"Avis\")",
      "!{\"lastName\"} in (\"BRED\", \"CIC\", \"CM\", \"CM-CIC\", \"CM CIC\", \"CM - CIC\", \"CM CIC BAIL\", \"CM-CIC BAIL\", \"CM - CIC BAIL\", \"Avis\")",
      "!{\"fullName\"} in (\"BRED\", \"CIC\", \"CM\", \"CM-CIC\", \"CM CIC\", \"CM - CIC\", \"CM CIC BAIL\", \"CM-CIC BAIL\", \"CM - CIC BAIL\", \"Avis\")",
      "!{\"firstName\"} inc (\"credipar\", \"Atlantique\", \"Rentacar\", \"Rent a car\", \"Europcar\", \"Evobus\", \"Sami\", \"Forza\", \"Hertz\", \"Sixt\", \"Budget\", \"Thrifty\", \"National\", \"HSBC\", \"LCL\", \"CCSO\")",
      "!{\"lastName\"} inc (\"credipar\", \"Atlantique\", \"Rentacar\", \"Rent a car\", \"Europcar\", \"Evobus\", \"Sami\", \"Forza\", \"Hertz\", \"Sixt\", \"Budget\", \"Thrifty\", \"National\", \"HSBC\", \"LCL\", \"CCSO\")",
      "!{\"fullName\"} inc (\"credipar\", \"Atlantique\", \"Rentacar\", \"Rent a car\", \"Europcar\", \"Evobus\", \"Sami\", \"Forza\", \"Hertz\", \"Sixt\", \"Budget\", \"Thrifty\", \"National\", \"HSBC\", \"LCL\", \"CCSO\")",
      "!{\"firstName\"} inc (\"VN\", \"VNVO\", \"Auto \", \" Auto \", \" Auto\", \"Automobile\", \"Automobiles\", \"Automotive\", \"Garage\", \"Carrosserie, \"Mecanique\", \"Mécanique\", \"Lease\", \"Leasing\", \"Temsys\", \"Arval \", \" Arval\", \"Finance\", \"Fleet\", \"Preparation\", \"Préparation\", \"Stock\", \"Cession\", \"Livraison\", \"Remise\", \"Assurance\", \"Assurances\", \"Assistance\", \"Mutuelle\", \"Mutualiste\", \"Mutualité\", \"Mutualite\", \"Solidaire\", \"Solidarité\", \"Solidarite\", \"Maintenance\", \"Caisse\", \"Service\", \"Management\", \"Entretien\", \"Icare\", \"I'Car\", \"Icar\", \"Ericauto\", \"Datacar\", \"Datafirst\", \"SNCF\", \"Véhicule\", \"Vehicule\", \"Natixis\", \"Kerlann\", \"Exclusive\", \"Arkea\", \"Maurel\")",
      "!{\"lastName\"} inc (\"VN\", \"VNVO\", \"Auto \", \" Auto \", \" Auto\", \"Automobile\", \"Automobiles\", \"Automotive\", \"Garage\", \"Carrosserie, \"Mecanique\", \"Mécanique\", \"Lease\", \"Leasing\", \"Temsys\", \"Arval \", \" Arval\", \"Finance\", \"Fleet\", \"Preparation\", \"Préparation\", \"Stock\", \"Cession\", \"Livraison\", \"Remise\", \"Assurance\", \"Assurances\", \"Assistance\", \"Mutuelle\", \"Mutualiste\", \"Mutualité\", \"Mutualite\", \"Solidaire\", \"Solidarité\", \"Solidarite\", \"Maintenance\", \"Caisse\", \"Service\", \"Management\", \"Entretien\", \"Icare\", \"I'Car\", \"Icar\", \"Ericauto\", \"Datacar\", \"Datafirst\", \"SNCF\", \"Véhicule\", \"Vehicule\", \"Natixis\", \"Kerlann\", \"Exclusive\", \"Arkea\", \"Maurel\")",
      "!{\"fullName\"} inc (\"VN\", \"VNVO\", \"Auto \", \" Auto \", \" Auto\", \"Automobile\", \"Automobiles\", \"Automotive\", \"Garage\", \"Carrosserie, \"Mecanique\", \"Mécanique\", \"Lease\", \"Leasing\", \"Temsys\", \"Arval \", \" Arval\", \"Finance\", \"Fleet\", \"Preparation\", \"Préparation\", \"Stock\", \"Cession\", \"Livraison\", \"Remise\", \"Assurance\", \"Assurances\", \"Assistance\", \"Mutuelle\", \"Mutualiste\", \"Mutualité\", \"Mutualite\", \"Solidaire\", \"Solidarité\", \"Solidarite\", \"Maintenance\", \"Caisse\", \"Service\", \"Management\", \"Entretien\", \"Icare\", \"I'Car\", \"Icar\", \"Ericauto\", \"Datacar\", \"Datafirst\", \"SNCF\", \"Véhicule\", \"Vehicule\", \"Natixis\", \"Kerlann\", \"Exclusive\", \"Arkea\", \"Maurel\")",
      "!{\"firstName\"} in (\"VO\", \"APV\", \"VD\", \"GGE\", \"Cess\", \"Axa\", \"Eris\", \"CGC\", \"C12\", \"C46\", \"GGM\")",
      "!{\"lastName\"} in (\"VO\", \"APV\", \"VD\", \"GGE\", \"Cess\", \"Axa\", \"Eris\", \"CGC\", \"C12\", \"C46\", \"GGM\")",
      "!{\"gender\"} in (\"VO\", \"APV\", \"VD\", \"GGE\", \"Cess\", \"Axa\", \"Eris\", \"CGC\", \"C12\", \"C46\", \"GGM\")",
      "!{\"fullName\"} in (\"VO\", \"APV\", \"VD\", \"Auto\", \"GGE\", \"Cess\", \"Axa\", \"Eris\", \"CGC\", \"C12\", \"C46\", \"GGM\")",
      "!{\"firstName\"} inc (\"Groupe\", \"Transport\", \"SGAPS\", \"France \", \" France\", \"UNOFI\", \"Europe\", \"Allianz\", \"FINANCIERE\", \"COFACE\", \"AVIVA\", \"PROTEGYS\", \"COVEA\", \"MACSF\", \"SGAM\", \"AGPM\", \"ARIANEGROUP \", \"AREVA\", \"CAMUS\", \"CARREFOUR\", \"industrie\", \"industriel\", \"industrielle\", \"GALIAN\", \"Garantie\", \"Garantías\", \"OREAL\", \"POUEY\", \"VEOLIA\", \"SOLIMUT \", \"AESIO\", \"MACIF\", \"FRATERNELLE\", \"PREVOIR\", \"OPTIMUM\", \"GMF \", \"MONDIALE\", \"FINAREF\", \"PREPAR\", \"MAIF\", \"AFI-ESCA\", \"AGEAS\", \"HSBC\", \"MAAF\", \"SWISSLIFE\", \"UNOFI\", \"MATMUT\", \"NEUFLIZE\", \"AVIVA\", \"BARCLAYS\", \"ARGOVIE\", \"CARMA\", \"GENERATION\", \"SHAM\", \"SPIRICA\", \"RETRAITE\", \"EPARGNE\", \"CAPMA\", \"CAPMI\", \"SECURITE\", \"AREAS\", \"AUXILIAIRE\", \"MICILS\", \"MUTEX\", \"MCLR\", \"ENTRENOUS\", \"AGRI\", \"MALAKOFF\", \"PREVOYANCE\", \"CAPREVAL\", \"NESTLE\", \"KERIALIS\", \"OCIRP\", \"APGIS\", \"AG2R\", \"ARPEGE\", \"UNIPREVOYANCE\", \"ANIPS\", \"IPRIAC\", \"CARCEPT\", \"CARPILIG\", \"IPECA\", \"AUDIENS\", \"IRCEM\", \"KLESIA\", \"HUMANIS\", \"APICIL\", \"CCPMA\", \"A2VIP\", \"CHOLETAISE\", \"SMISO\", \"MUTLOG\", \"SNECMA\", \"NOVAMUT\", \"INTEGRANCE\", \"MARSILLARGUOISE\", \"MEUSREC\", \"MUTAG\", \"DUNLOP\", \"EIFFAGE\", \"SWISSLIFE\", \"JURIDICA\", \"FINAREF\", \"PARISIENNE\", \"PRIMA\", \"RURALE\", \"SAUVEGARDE\", \"CARDIF\", \"CFDP\", \"THEMIS\", \"AUXIA\", \"SERENIS\", \"BPCE\", \"PACIFICA\", \"FIDELIA\", \"AFI ESCA\", \"GROUPAMA\", \"PROTEXIA\", \"AVANSSUR\", \"AXERIA\", \"OPTEVEN\", \"SOGESSUR\", \"CALYPSO\", \"LYBERNET\", \"NATIO\", \"EUROMAF\", \"ALTIMA\", \"FILASSISTANCE\", \"MACIFILIA\", \"ALBINGIA\", \"FRAGONARD\", \"ASSURIMA\", \"SOLUCIA\", \"ACTA\", \"AMALINE\", \"LIBEA\", \"PANACEA\", \"MGARD\", \"PARNASSE\", \"CARDIF\", \"IMHOTEP\", \"ICARE\", \"REUNISOLIDARITE\", \"ACTE IARD\", \"HELVETIA\", \"SURAVENIR\", \"MADP\", \"THELEM\", \"AUXILIAIRE\", \"BRESSANE\", \"MUTUALIA\", \"SMACL\", \"AGPM\", \"MURACEF\", \"CGPA\", \"CARCEPT\", \"AFFINEO\", \"OPTIM\", \"MUDETAF\", \"QBE\", \"NAGICO\", \"SERAMM\", \"MILTIS\", \"REUNICA\", \"OCIANE\", \"IRCEM\", \"UNME\", \"GEODIS\", \"KSB\", \"NEUVY MOTORS\", \"ESPA\", \"MUTACITE\", \"FACOM\", \"PERNOD\", \"KEOLIS\", \"MUTAME\", \"UNELEC\", \"MUTARETRAITE\", \"MUTARIS\", \"CNP\", \"SURAVENIR\", \"PREDICA\", \"IMPERIO\", \"GRESHAM\", \"SPHERIA\", \"QUATREM\", \"ORADEA\", \"MFPREVOYANCE\", \"UNEO\", \"MFPRECAUTION\", \"S.3.R.\", \"L&J\", \"MUTRE\", \"DASSAULT\", \"SCOR GLOBAL\", \"COVEA\", \"ODYSSEY\", \"VITTAVI\", \"AMELLIS\", \"APREVA\", \"SMERRA\", \"UMEN\", \"INTERIALE\", \"APIVIA\", \"GANGEOISE\", \"INTERPROFESSIONNELLE\", \"MUTAERO\", \"PREVIFRANCE\", \"MUTAMI\", \"MTRL\", \"VIASANTE\", \"PRECOCIA\", \"IRSID\", \"ACORIS\", \"AUBEANE\", \"CCMO\", \"CITRAM\", \"SEREINA\", \"CIOTAT\", \"SOLIMUT\", \"EMOA\", \"SMPS\", \"GMC\", \"MMH\", \"CHORUM\", \"MPA\", \"MUTUALP\")",
      "!{\"lastName\"} inc (\"Groupe\", \"Transport\", \"SGAPS\", \"France \", \" France\", \"UNOFI\", \"Europe\", \"Allianz\", \"FINANCIERE\", \"COFACE\", \"AVIVA\", \"PROTEGYS\", \"COVEA\", \"MACSF\", \"SGAM\", \"AGPM\", \"ARIANEGROUP \", \"AREVA\", \"CAMUS\", \"CARREFOUR\", \"industrie\", \"industriel\", \"industrielle\", \"GALIAN\", \"Garantie\", \"Garantías\", \"OREAL\", \"POUEY\", \"VEOLIA\", \"SOLIMUT \", \"AESIO\", \"MACIF\", \"FRATERNELLE\", \"PREVOIR\", \"OPTIMUM\", \"GMF \", \"MONDIALE\", \"FINAREF\", \"PREPAR\", \"MAIF\", \"AFI-ESCA\", \"AGEAS\", \"HSBC\", \"MAAF\", \"SWISSLIFE\", \"UNOFI\", \"MATMUT\", \"NEUFLIZE\", \"AVIVA\", \"BARCLAYS\", \"ARGOVIE\", \"CARMA\", \"GENERATION\", \"SHAM\", \"SPIRICA\", \"RETRAITE\", \"EPARGNE\", \"CAPMA\", \"CAPMI\", \"SECURITE\", \"AREAS\", \"AUXILIAIRE\", \"MICILS\", \"MUTEX\", \"MCLR\", \"ENTRENOUS\", \"AGRI\", \"MALAKOFF\", \"PREVOYANCE\", \"CAPREVAL\", \"NESTLE\", \"KERIALIS\", \"OCIRP\", \"APGIS\", \"AG2R\", \"ARPEGE\", \"UNIPREVOYANCE\", \"ANIPS\", \"IPRIAC\", \"CARCEPT\", \"CARPILIG\", \"IPECA\", \"AUDIENS\", \"IRCEM\", \"KLESIA\", \"HUMANIS\", \"APICIL\", \"CCPMA\", \"A2VIP\", \"CHOLETAISE\", \"SMISO\", \"MUTLOG\", \"SNECMA\", \"NOVAMUT\", \"INTEGRANCE\", \"MARSILLARGUOISE\", \"MEUSREC\", \"MUTAG\", \"DUNLOP\", \"EIFFAGE\", \"SWISSLIFE\", \"JURIDICA\", \"FINAREF\", \"PARISIENNE\", \"PRIMA\", \"RURALE\", \"SAUVEGARDE\", \"CARDIF\", \"CFDP\", \"THEMIS\", \"AUXIA\", \"SERENIS\", \"BPCE\", \"PACIFICA\", \"FIDELIA\", \"AFI ESCA\", \"GROUPAMA\", \"PROTEXIA\", \"AVANSSUR\", \"AXERIA\", \"OPTEVEN\", \"SOGESSUR\", \"CALYPSO\", \"LYBERNET\", \"NATIO\", \"EUROMAF\", \"ALTIMA\", \"FILASSISTANCE\", \"MACIFILIA\", \"ALBINGIA\", \"FRAGONARD\", \"ASSURIMA\", \"SOLUCIA\", \"ACTA\", \"AMALINE\", \"LIBEA\", \"PANACEA\", \"MGARD\", \"PARNASSE\", \"CARDIF\", \"IMHOTEP\", \"ICARE\", \"REUNISOLIDARITE\", \"ACTE IARD\", \"HELVETIA\", \"SURAVENIR\", \"MADP\", \"THELEM\", \"AUXILIAIRE\", \"BRESSANE\", \"MUTUALIA\", \"SMACL\", \"AGPM\", \"MURACEF\", \"CGPA\", \"CARCEPT\", \"AFFINEO\", \"OPTIM\", \"MUDETAF\", \"QBE\", \"NAGICO\", \"SERAMM\", \"MILTIS\", \"REUNICA\", \"OCIANE\", \"IRCEM\", \"UNME\", \"GEODIS\", \"KSB\", \"NEUVY MOTORS\", \"ESPA\", \"MUTACITE\", \"FACOM\", \"PERNOD\", \"KEOLIS\", \"MUTAME\", \"UNELEC\", \"MUTARETRAITE\", \"MUTARIS\", \"CNP\", \"SURAVENIR\", \"PREDICA\", \"IMPERIO\", \"GRESHAM\", \"SPHERIA\", \"QUATREM\", \"ORADEA\", \"MFPREVOYANCE\", \"UNEO\", \"MFPRECAUTION\", \"S.3.R.\", \"L&J\", \"MUTRE\", \"DASSAULT\", \"SCOR GLOBAL\", \"COVEA\", \"ODYSSEY\", \"VITTAVI\", \"AMELLIS\", \"APREVA\", \"SMERRA\", \"UMEN\", \"INTERIALE\", \"APIVIA\", \"GANGEOISE\", \"INTERPROFESSIONNELLE\", \"MUTAERO\", \"PREVIFRANCE\", \"MUTAMI\", \"MTRL\", \"VIASANTE\", \"PRECOCIA\", \"IRSID\", \"ACORIS\", \"AUBEANE\", \"CCMO\", \"CITRAM\", \"SEREINA\", \"CIOTAT\", \"SOLIMUT\", \"EMOA\", \"SMPS\", \"GMC\", \"MMH\", \"CHORUM\", \"MPA\", \"MUTUALP\")",
      "!{\"fullName\"} inc (\"Groupe\", \"Transport\", \"SGAPS\", \"France \", \" France\", \"UNOFI\", \"Europe\", \"Allianz\", \"FINANCIERE\", \"COFACE\", \"AVIVA\", \"PROTEGYS\", \"COVEA\", \"MACSF\", \"SGAM\", \"AGPM\", \"ARIANEGROUP \", \"AREVA\", \"CAMUS\", \"CARREFOUR\", \"industrie\", \"industriel\", \"industrielle\", \"GALIAN\", \"Garantie\", \"Garantías\", \"OREAL\", \"POUEY\", \"VEOLIA\", \"SOLIMUT \", \"AESIO\", \"MACIF\", \"FRATERNELLE\", \"PREVOIR\", \"OPTIMUM\", \"GMF \", \"MONDIALE\", \"FINAREF\", \"PREPAR\", \"MAIF\", \"AFI-ESCA\", \"AGEAS\", \"HSBC\", \"MAAF\", \"SWISSLIFE\", \"UNOFI\", \"MATMUT\", \"NEUFLIZE\", \"AVIVA\", \"BARCLAYS\", \"ARGOVIE\", \"CARMA\", \"GENERATION\", \"SHAM\", \"SPIRICA\", \"RETRAITE\", \"EPARGNE\", \"CAPMA\", \"CAPMI\", \"SECURITE\", \"AREAS\", \"AUXILIAIRE\", \"MICILS\", \"MUTEX\", \"MCLR\", \"ENTRENOUS\", \"AGRI\", \"MALAKOFF\", \"PREVOYANCE\", \"CAPREVAL\", \"NESTLE\", \"KERIALIS\", \"OCIRP\", \"APGIS\", \"AG2R\", \"ARPEGE\", \"UNIPREVOYANCE\", \"ANIPS\", \"IPRIAC\", \"CARCEPT\", \"CARPILIG\", \"IPECA\", \"AUDIENS\", \"IRCEM\", \"KLESIA\", \"HUMANIS\", \"APICIL\", \"CCPMA\", \"A2VIP\", \"CHOLETAISE\", \"SMISO\", \"MUTLOG\", \"SNECMA\", \"NOVAMUT\", \"INTEGRANCE\", \"MARSILLARGUOISE\", \"MEUSREC\", \"MUTAG\", \"DUNLOP\", \"EIFFAGE\", \"SWISSLIFE\", \"JURIDICA\", \"FINAREF\", \"PARISIENNE\", \"PRIMA\", \"RURALE\", \"SAUVEGARDE\", \"CARDIF\", \"CFDP\", \"THEMIS\", \"AUXIA\", \"SERENIS\", \"BPCE\", \"PACIFICA\", \"FIDELIA\", \"AFI ESCA\", \"GROUPAMA\", \"PROTEXIA\", \"AVANSSUR\", \"AXERIA\", \"OPTEVEN\", \"SOGESSUR\", \"CALYPSO\", \"LYBERNET\", \"NATIO\", \"EUROMAF\", \"ALTIMA\", \"FILASSISTANCE\", \"MACIFILIA\", \"ALBINGIA\", \"FRAGONARD\", \"ASSURIMA\", \"SOLUCIA\", \"ACTA\", \"AMALINE\", \"LIBEA\", \"PANACEA\", \"MGARD\", \"PARNASSE\", \"CARDIF\", \"IMHOTEP\", \"ICARE\", \"REUNISOLIDARITE\", \"ACTE IARD\", \"HELVETIA\", \"SURAVENIR\", \"MADP\", \"THELEM\", \"AUXILIAIRE\", \"BRESSANE\", \"MUTUALIA\", \"SMACL\", \"AGPM\", \"MURACEF\", \"CGPA\", \"CARCEPT\", \"AFFINEO\", \"OPTIM\", \"MUDETAF\", \"QBE\", \"NAGICO\", \"SERAMM\", \"MILTIS\", \"REUNICA\", \"OCIANE\", \"IRCEM\", \"UNME\", \"GEODIS\", \"KSB\", \"NEUVY MOTORS\", \"ESPA\", \"MUTACITE\", \"FACOM\", \"PERNOD\", \"KEOLIS\", \"MUTAME\", \"UNELEC\", \"MUTARETRAITE\", \"MUTARIS\", \"CNP\", \"SURAVENIR\", \"PREDICA\", \"IMPERIO\", \"GRESHAM\", \"SPHERIA\", \"QUATREM\", \"ORADEA\", \"MFPREVOYANCE\", \"UNEO\", \"MFPRECAUTION\", \"S.3.R.\", \"L&J\", \"MUTRE\", \"DASSAULT\", \"SCOR GLOBAL\", \"COVEA\", \"ODYSSEY\", \"VITTAVI\", \"AMELLIS\", \"APREVA\", \"SMERRA\", \"UMEN\", \"INTERIALE\", \"APIVIA\", \"GANGEOISE\", \"INTERPROFESSIONNELLE\", \"MUTAERO\", \"PREVIFRANCE\", \"MUTAMI\", \"MTRL\", \"VIASANTE\", \"PRECOCIA\", \"IRSID\", \"ACORIS\", \"AUBEANE\", \"CCMO\", \"CITRAM\", \"SEREINA\", \"CIOTAT\", \"SOLIMUT\", \"EMOA\", \"SMPS\", \"GMC\", \"MMH\", \"CHORUM\", \"MPA\", \"MUTUALP\")",
      "!{\"firstName\"} in (\"BRUNO ROUSSET SAS\", \"VYV\", \"VYV\", \"UMG\", \"VIE\", \"MMA VIE\", \"MMA\", \"GFA\", \"GAN\", \"CNP\", \"IMA\", \"DAS\", \"AMF\", \"AWP\", \"MIRO \", \" MIRO\", \"QBE\", \"MGP\", \"MSO\", \"MNH\", \"CNP\", \"MAE\", \"UMC\", \"CCR\")",
      "!{\"lastName\"} in (\"BRUNO ROUSSET SAS\", \"VYV\", \"VYV\", \"UMG\", \"VIE\", \"MMA VIE\", \"MMA\", \"GFA\", \"GAN\", \"CNP\", \"IMA\", \"DAS\", \"AMF\", \"AWP\", \"MIRO \", \" MIRO\", \"QBE\", \"MGP\", \"MSO\", \"MNH\", \"CNP\", \"MAE\", \"UMC\", \"CCR\")",
      "!{\"fullName\"} in (\"BRUNO ROUSSET SAS\", \"VYV\", \"VYV\", \"UMG\", \"VIE\", \"MMA VIE\", \"MMA\", \"GFA\", \"GAN\", \"CNP\", \"IMA\", \"DAS\", \"AMF\", \"AWP\", \"MIRO \", \" MIRO\", \"QBE\", \"MGP\", \"MSO\", \"MNH\", \"CNP\", \"MAE\", \"UMC\", \"CCR\")",
      "!{\"firstName\"} inc (\"GGE\", \"Arval \", \" Arval\", \"Temsys\", \"Cession\", \"Prepa\", \"Prépa\", \"Ald \", \"Lease\", \"Icare\", \"Gmac\", \"Opteven\", \"Client\", \"Etranger\", \"Parot\", \"Cgl\", \"Remise\", \"Sigma\", \"Service\", \"Services\", \"Athlon\", \"Frais\", \"Overlease\", \"Diac\", \"Natixis\", Courtoise\", Vehiposte\", \"Macif\", \"Alphabet\", \"France \", \"SAS \", \" SAS\", \"Bremany\", \"Cofica\", \"Ima Gie\", \"Diac\", \"Etat\", \"Indra\", \"Cofiparc\", \"Premium\", \"Rousseau\", \"Pigeon\", \"Amplitude\")",
      "!{\"lastName\"} inc (\"GGE\", \"Arval \", \" Arval\", \"Temsys\", \"Cession\", \"Prepa\", \"Prépa\", \"Ald \", \"Lease\", \"Icare\", \"Gmac\", \"Opteven\", \"Client\", \"Etranger\", \"Parot\", \"Cgl\", \"Remise\", \"Sigma\", \"Service\", \"Services\", \"Athlon\", \"Frais\", \"Overlease\", \"Diac\", \"Natixis\", Courtoise\", Vehiposte\", \"Macif\", \"Alphabet\", \"France \", \"SAS \", \" SAS\", \"Bremany\", \"Cofica\", \"Ima Gie\", \"Diac\", \"Etat\", \"Indra\", \"Cofiparc\", \"Premium\", \"Rousseau\", \"Pigeon\", \"Amplitude\")",
      "!{\"fullName\"} inc (\"GGE\", \"Arval \", \" Arval\", \"Temsys\", \"Cession\", \"Prepa\", \"Prépa\", \"Ald \", \"Lease\", \"Icare\", \"Gmac\", \"Opteven\", \"Client\", \"Etranger\", \"Parot\", \"Cgl\", \"Remise\", \"Sigma\", \"Service\", \"Services\", \"Athlon\", \"Frais\", \"Overlease\", \"Diac\", \"Natixis\", Courtoise\", Vehiposte\", \"Macif\", \"Alphabet\", \"France \", \"SAS \", \" SAS\", \"Bremany\", \"Cofica\", \"Ima Gie\", \"Diac\", \"Etat\", \"Indra\", \"Cofiparc\", \"Premium\", \"Rousseau\", \"Pigeaon\", \"Amplitude\")",
      "!{\"firstName\"} inc (\"Sixt\", \"Mondial\", \"Fmc\", \"Fourniture\", \"Fournitures\", \"Consumer\", \"Finance\", \"Automotiv\", \"Fleet\", \"Solution\", \"Solutions\", \"Solutio\", \"Abdx\", \"Awp\", \"Champagne\", \"Brie\", \"Ttr\", \"Consommable\", \"Consommables\", \"Mécaniques\", \"Mecaniques\", \"Acm\", \"Behra\", \"Morangis\", \"Advance\", \"Orgeval\", \"Nedelec\", \"Leaseplan\", \"Lissbail\", \"Fraikin\", \"Furauto\", \"Bremany\", \"Cmptoir\", \"Alphabet\", \"Chambourcy\", \"Parcours\", \"Nowak\", \"Rueil\", \"Passage\", \"Kiloutou\", \"Forestier\", \"Proviisoire\", \"Compte\", \"Natixis\", \"Dubreuil\", \"Business\", \"Manageme\", \"Management\", \"Mutuaide\", \"Buchelay\")",
      "!{\"lastName\"} inc (\"Sixt\", \"Mondial\", \"Fmc\", \"Fourniture\", \"Fournitures\", \"Consumer\", \"Finance\", \"Automotiv\", \"Fleet\", \"Solution\", \"Solutions\", \"Solutio\", \"Abdx\", \"Awp\", \"Champagne\", \"Brie\", \"Ttr\", \"Consommable\", \"Consommables\", \"Mécaniques\", \"Mecaniques\", \"Acm\", \"Behra\", \"Morangis\", \"Advance\", \"Orgeval\", \"Nedelec\", \"Leaseplan\", \"Lissbail\", \"Fraikin\", \"Furauto\", \"Bremany\", \"Cmptoir\", \"Alphabet\", \"Chambourcy\", \"Parcours\", \"Nowak\", \"Rueil\", \"Passage\", \"Kiloutou\", \"Forestier\", \"Proviisoire\", \"Compte\", \"Natixis\", \"Dubreuil\", \"Business\", \"Manageme\", \"Management\", \"Mutuaide\", \"Buchelay\")",
      "!{\"fullName\"} inc (\"Sixt\", \"Mondial\", \"Fmc\", \"Fourniture\", \"Fournitures\", \"Consumer\", \"Finance\", \"Automotiv\", \"Fleet\", \"Solution\", \"Solutions\", \"Solutio\", \"Abdx\", \"Awp\", \"Champagne\", \"Brie\", \"Ttr\", \"Consommable\", \"Consommables\", \"Mécaniques\", \"Mecaniques\", \"Acm\", \"Behra\", \"Morangis\", \"Advance\", \"Orgeval\", \"Nedelec\", \"Leaseplan\", \"Lissbail\", \"Fraikin\", \"Furauto\", \"Bremany\", \"Cmptoir\", \"Alphabet\", \"Chambourcy\", \"Parcours\", \"Nowak\", \"Rueil\", \"Passage\", \"Kiloutou\", \"Forestier\", \"Proviisoire\", \"Compte\", \"Natixis\", \"Dubreuil\", \"Business\", \"Manageme\", \"Management\", \"Mutuaide\", \"Buchelay\")",
      "!{\"firstName\"} inc (\"Lemoine\", \"Prepfrevo\", \"Cardona\", \"Entite\", \"Entreprise\", \"Europe\", \"Easy\", \"Equipement\", \"Équipement\", \"Vdvk\", \"DBF\", \"Arcueil\", \"Malbet\", \"Losan\", \"huile\", \"Gironde\", \"Technocentre\", \"Salva \", \" Salva\", \"Albax\", \"Argent\", \"Colin\", \"Discount\", \"Europcar\", \"Eurauto\", \"Dugardin\", \"Nomblot\", \"Frere\", \"Freres\", \"Millesime\", \"Cm-Cic\", \"Defense\", \"Passage\", \"Gentilly\")",
      "!{\"lastName\"} inc (\"Lemoine\", \"Prepfrevo\", \"Cardona\", \"Entite\", \"Entreprise\", \"Europe\", \"Easy\", \"Equipement\", \"Équipement\", \"Vdvk\", \"DBF\", \"Arcueil\", \"Malbet\", \"Losan\", \"huile\", \"Gironde\", \"Technocentre\", \"Salva \", \" Salva\", \"Albax\", \"Argent\", \"Colin\", \"Discount\", \"Europcar\", \"Eurauto\", \"Dugardin\", \"Nomblot\", \"Frere\", \"Freres\", \"Millesime\", \"Cm-Cic\", \"Defense\", \"Passage\", \"Gentilly\")",
      "!{\"fullName\"} inc (\"Lemoine\", \"Prepfrevo\", \"Cardona\", \"Entite\", \"Entreprise\", \"Europe\", \"Easy\", \"Equipement\", \"Équipement\", \"Vdvk\", \"DBF\", \"Arcueil\", \"Malbet\", \"Losan\", \"huile\", \"Gironde\", \"Technocentre\", \"Salva \", \" Salva\", \"Albax\", \"Argent\", \"Colin\", \"Discount\", \"Europcar\", \"Eurauto\", \"Dugardin\", \"Nomblot\", \"Frere\", \"Freres\", \"Millesime\", \"Cm-Cic\", \"Defense\", \"Passage\", \"Gentilly\")",
      "!{\"firstName\"} inc (\"Distribution\", \"Neubauer\", \"Krystal\", \"Capital\", \"Concept\", \"Motors\", \"Autodstanding\", \"Covea\", \"Commerciaux\", \"Geste\", \"Gestes\", \"Fournis\", \"Aucune\", \"Aucun\", \"Montage\", \"Access\", \"Gratuit\", \"Sixt\", \"Encheres\", \"Enchere\", \"Hertz\")",
      "!{\"lastName\"} inc (\"Distribution\", \"Neubauer\", \"Krystal\", \"Capital\", \"Concept\", \"Motors\", \"Autodstanding\", \"Covea\", \"Commerciaux\", \"Geste\", \"Gestes\", \"Fournis\", \"Aucune\", \"Aucun\", \"Montage\", \"Access\", \"Gratuit\", \"Sixt\", \"Encheres\", \"Enchere\", \"Hertz\")",
      "!{\"fullName\"} inc (\"Distribution\", \"Neubauer\", \"Krystal\", \"Capital\", \"Concept\", \"Motors\", \"Autodstanding\", \"Covea\", \"Commerciaux\", \"Geste\", \"Gestes\", \"Fournis\", \"Aucune\", \"Aucun\", \"Montage\", \"Access\", \"Gratuit\", \"Sixt\", \"Encheres\", \"Enchere\", \"Hertz\")",
      "!{\"firstName\"} inc (\"Site\", \"Speed\", \"Opteven\", \"E-Autos\", \"Melka\", \"Nations\", \"Nation\", \"Budget\", \"Divers\", \"Autostore\", \"Sonaka\", \"IMA GIE\", \"INDRA\", \"LAXOU\", \"FIDELIA\")",
      "!{\"lastName\"} inc (\"Speed\", \"Opteven\", \"E-Autos\", \"Melka\", \"Nations\", \"Nation\", \"Budget\", \"Divers\", \"Autostore\", \"Sonaka\", \"IMA GIE\", \"INDRA\", \"LAXOU\", \"FIDELIA\")",
      "!{\"fullName\"} inc (\"Speed\", \"Opteven\", \"E-Autos\", \"Melka\", \"Nations\", \"Nation\", \"Budget\", \"Divers\", \"Autostore\", \"Sonaka\", \"IMA GIE\", \"INDRA\", \"LAXOU\", \"FIDELIA\")",
      "[\"Nom individu\"] != \"\" and [\"lastName\"] != \"\" and [\"c_nom\"] != \"\" and [\"nom_raisonsociale\"] != \"\" and [\"NOM1\"] != \"\" and [\"Nom (propriétaire)\"] != \"\" and [\"Nombre cliente\"] != \"\" and [\"Nombre personal\"] != \"\"",
      "![\"Catég.client 1ère fact.\"] in (\"ADM\", \"ASS\", \"CES\", \"CFO\", \"FIL\", \"SUC\")",
      "!{\"firstName\"} != \"MINI\"i and !{\"lastName\"} != \"MINI\"i and !{\"firstName\"} != \"AUDI\"i and !{\"lastName\"} != \"AUDI\"i ",
      "[\"c_civ\"] != \"GAR\"",
      "[\"CODE_VENTE\"] != \"C\"",
      "!{\"firstName\"} != \"Mapfre\"i and !{\"lastName\"} != \"Mapfre\"i"
  ];
   */
function test(cb) {
  const importF = path.join(__dirname, 'data/1000lines.txt');
  const promise = importer.loadFileFromFileStore(importF, 'filesystem');
  promise.then((loadFileResult) => {
    importer.validateImportFileBufferFromJSONParser(
      importF,
      loadFileResult.fileBuffer,
      parserConfig,
      columns,
      vehicleMakes,
      dataTypeFormatting,
      {},
      gsDataFileDataType.VEHICLE_SALES,
      '577a30d774616c1a0056c263',
      cb
    );
  });
}

/*
 * Test imports schemas
 */
describe('DataFile Importer:', () => {
  before(async function before() {
    /* deprecated, delete after 09/2020 await app.waitAppBoot();
    const set = promisify(app._models().Configuration.setSharedImportFilters);
    await set(confSharedImportFilters);
    */
  });
  var logExpected = function (importResult) {
    // eslint-disable-line
    console.log(`expect(importResult.isValid).equal(${importResult.isValid});`);
    if (importResult.isValid) {
      console.log(
        `expect(importResult.validationDetails.withEmails).equal(${importResult.validationDetails.withEmails});`
      );
      console.log(
        `expect(importResult.validationDetails.withMobile).equal(${importResult.validationDetails.withMobile});`
      );
      console.log(
        `expect(importResult.validationDetails.withContactChannel).equal(${importResult.validationDetails.withContactChannel});`
      );
      console.log(`expect(importResult.validationDetails.withName).equal(${importResult.validationDetails.withName});`);
      console.log(`expect(importResult.validationDetails.withCity).equal(${importResult.validationDetails.withCity});`);
      console.log(
        `expect(importResult.validationDetails.withVehicleMake).equal(${importResult.validationDetails.withVehicleMake});`
      );
      console.log(
        `expect(importResult.validationDetails.withVehicleModel).equal(${importResult.validationDetails.withVehicleModel});`
      );
      console.log(
        `expect(importResult.validationDetails.withServiceProvidedAt).equal(${importResult.validationDetails.withServiceProvidedAt});`
      );
      console.log(
        `expect(importResult.validationDetails.minServiceProvidedAt).equal('${importResult.validationDetails.minServiceProvidedAt}');`
      );
      console.log(
        `expect(importResult.validationDetails.maxServiceProvidedAt).equal('${importResult.validationDetails.maxServiceProvidedAt}');`
      );
      console.log(`expect(importResult.validationDetails.rows).equal(${importResult.validationDetails.rows});`);
      console.log(
        `expect(importResult.validationDetails.nbDuplicates).equal(${importResult.validationDetails.nbDuplicates});`
      );
      for (const t in importResult.validationDetails.perType) {
        // eslint-disable-line
        if ({}.hasOwnProperty.call(importResult.validationDetails.perType, t)) {
          console.log(
            `expect(importResult.validationDetails.perType.${t}).equal(${importResult.validationDetails.perType[t]});`
          );
        }
      }
    }
  };

  it('big file', function (done) {
    const start = Date.now();
    test((err, importResult) => {
      // eslint-disable-line max-len
      if (err) {
        done(err);
      }
      const end = Date.now();
      const time = end - start;
      expect(importResult.isValid).equal(true);
      expect(time).to.be.below(15000);
      done();
    });
  });
});
