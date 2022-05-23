import {CONTRACTS_VARIABLES, CONTRACTS_VARIABLES_OPTIONS} from './constants';
import {COUNTRY_CODES, ORIGINS} from '../../../utils/constants';

// type ContractVariableOption = {label: string; value: string; optional?: boolean};
//
// const COMMON_VARIABLES_LIST = [
//   {...CONTRACTS_VARIABLES.title, optional: false},
//   {...CONTRACTS_VARIABLES.check_in_datetime, optional: false},
//   {...CONTRACTS_VARIABLES.check_in_date, optional: false},
//   {...CONTRACTS_VARIABLES.check_out_datetime, optional: false},
//   {...CONTRACTS_VARIABLES.check_out_date, optional: false},
//   {...CONTRACTS_VARIABLES.housing_name, optional: false},
//   {...CONTRACTS_VARIABLES.housing_logo, optional: false},
//   {...CONTRACTS_VARIABLES.housing_city, optional: false},
//   {...CONTRACTS_VARIABLES.housing_city, optional: false},
//   {...CONTRACTS_VARIABLES.price, optional: false},
//   {...CONTRACTS_VARIABLES.manager_name, optional: false},
//   {...CONTRACTS_VARIABLES.manager_vatin, optional: false},
//   {...CONTRACTS_VARIABLES.manager_signature, optional: false},
//   {...CONTRACTS_VARIABLES.leader_signature, optional: false},
// ];
//
// const AVAILABLE_VARIABLES_LIST_DTO: {[key in FORM_NAMES]?: any} = {
//   [FORM_NAMES.name]: CONTRACTS_VARIABLES.leader_name,
//   [FORM_NAMES.surname]: CONTRACTS_VARIABLES.leader_surname,
//   [FORM_NAMES.secondSurname]: CONTRACTS_VARIABLES.leader_second_surname,
//   [FORM_NAMES.birthDate]: CONTRACTS_VARIABLES.leader_birth_date,
//   [FORM_NAMES.sex]: CONTRACTS_VARIABLES.leader_gender,
//   [FORM_NAMES.nationality]: CONTRACTS_VARIABLES.leader_nationality,
//   [FORM_NAMES.docType]: CONTRACTS_VARIABLES.leader_doc_type,
//   [FORM_NAMES.docNumber]: CONTRACTS_VARIABLES.leader_doc_number,
//   [FORM_NAMES.countryOfIssue]: CONTRACTS_VARIABLES.leader_document_expedition_country,
//   [FORM_NAMES.italianCityOfIssue]: CONTRACTS_VARIABLES.leader_document_expedition_city,
//   [FORM_NAMES.docDateOfIssue]: CONTRACTS_VARIABLES.leader_doc_date_of_issue,
//   [FORM_NAMES.birthCountry]: CONTRACTS_VARIABLES.leader_country_of_birth,
//   [FORM_NAMES.cityOfBirth]: CONTRACTS_VARIABLES.leader_city_of_birth,
//   [FORM_NAMES.italianCityOfBirth]: CONTRACTS_VARIABLES.leader_city_of_birth,
//   [FORM_NAMES.residenceCountry]: CONTRACTS_VARIABLES.leader_residence_country,
//   [FORM_NAMES.residenceCity]: CONTRACTS_VARIABLES.leader_residence_city,
//   [FORM_NAMES.italianResidenceCity]: CONTRACTS_VARIABLES.leader_residence_city,
//   [FORM_NAMES.residenceAddress]: CONTRACTS_VARIABLES.leader_residence_address,
//   [FORM_NAMES.cityOfIssue]: CONTRACTS_VARIABLES.leader_document_expedition_city,
//   [FORM_NAMES.nextDestinationCountry]:
//     CONTRACTS_VARIABLES.leader_next_destination_country,
//   [FORM_NAMES.nextDestinationCity]: CONTRACTS_VARIABLES.leader_next_destination_city,
//   [FORM_NAMES.nextDestinationAddress]:
//     CONTRACTS_VARIABLES.leader_next_destination_address,
//   [FORM_NAMES.nextDestinationDistrict]:
//     CONTRACTS_VARIABLES.leader_next_destination_district,
//   [FORM_NAMES.nextDestinationMunicipality]:
//     CONTRACTS_VARIABLES.leader_next_destination_municipality,
//   [FORM_NAMES.residencePostalCode]: CONTRACTS_VARIABLES.leader_residence_postal_code,
//   [FORM_NAMES.residenceProvince]: CONTRACTS_VARIABLES.leader_residence_province,
//   [FORM_NAMES.citizenship]: CONTRACTS_VARIABLES.leader_citizenship,
//   [FORM_NAMES.purposeOfStay]: CONTRACTS_VARIABLES.leader_purpose_of_stay,
//   [FORM_NAMES.visaNumber]: CONTRACTS_VARIABLES.leader_visa_number,
//   [FORM_NAMES.arrivalCountry]: CONTRACTS_VARIABLES.leader_arrival_country,
//   [FORM_NAMES.arrivalDistrict]: CONTRACTS_VARIABLES.leader_arrival_district,
//   [FORM_NAMES.arrivalMunicipality]: CONTRACTS_VARIABLES.leader_arrival_municipality,
//   [FORM_NAMES.fiscalCode]: CONTRACTS_VARIABLES.leader_fiscal_code,
//   [FORM_NAMES.email]: CONTRACTS_VARIABLES.leader_email,
//   [FORM_NAMES.phone]: CONTRACTS_VARIABLES.leader_phone,
// };
//
// const getVariablesForLeaderGuest = ({
//   display,
//   required,
// }: {
//   display: Partial<Record<FORM_NAMES, boolean | DISPLAY_FIELD_TYPES>>;
//   required: Partial<Record<FORM_NAMES, boolean | string>>;
// }) => {
//   return Object.entries(display)
//     .filter(
//       ([fieldName, isVisible]) =>
//         AVAILABLE_VARIABLES_LIST_DTO[fieldName as FORM_NAMES] && isVisible,
//     )
//     .reduce<ContractVariableOption[]>((acc, [fieldName]) => {
//       acc.push({
//         ...AVAILABLE_VARIABLES_LIST_DTO[fieldName as FORM_NAMES],
//         optional: !Boolean(required[fieldName as FORM_NAMES]),
//       });
//
//       return acc;
//     }, []);
// };
//
// function getDisplayVariables(country?: string) {
//   if (!country) return [];
//
//   const fields = getFields({
//     housingCountry: country,
//     isGuestLeader: true,
//     isHousingContractEnabled: true,
//   });
//
//   const leaderSpecificVariables = getVariablesForLeaderGuest(fields);
//
//   let commonVariables = COMMON_VARIABLES_LIST;
//   let extraOptionalVariables: string[] = [];
//
//   switch (country) {
//     case COUNTRY_CODES.spain:
//       commonVariables = [
//         ...commonVariables,
//         {...CONTRACTS_VARIABLES.housing_trn, optional: false},
//         {...CONTRACTS_VARIABLES.manager_phone, optional: false},
//       ];
//
//       extraOptionalVariables = [
//         CONTRACTS_VARIABLES.leader_residence_city.value,
//         CONTRACTS_VARIABLES.leader_residence_country.value,
//         CONTRACTS_VARIABLES.leader_residence_province.value,
//       ];
//       break;
//
//     case COUNTRY_CODES.uae:
//       commonVariables = [
//         ...commonVariables,
//         {...CONTRACTS_VARIABLES.manager_phone, optional: false},
//         {...CONTRACTS_VARIABLES.housing_address, optional: false},
//       ];
//       break;
//
//     case COUNTRY_CODES.italy:
//       commonVariables = [
//         ...commonVariables,
//         {...CONTRACTS_VARIABLES.housing_trn, optional: false},
//         {...CONTRACTS_VARIABLES.manager_phone, optional: false},
//         {...CONTRACTS_VARIABLES.housing_address, optional: false},
//         {...CONTRACTS_VARIABLES.manager_birth_date, optional: false},
//         {...CONTRACTS_VARIABLES.manager_birth_place, optional: false},
//         {...CONTRACTS_VARIABLES.manager_residence_address, optional: false},
//         {...CONTRACTS_VARIABLES.manager_birth_date_and_place, optional: false},
//       ];
//
//       extraOptionalVariables = [
//         CONTRACTS_VARIABLES.leader_fiscal_code.value,
//         CONTRACTS_VARIABLES.leader_city_of_birth.value,
//         CONTRACTS_VARIABLES.leader_document_expedition_city.value,
//       ];
//       break;
//
//     case COUNTRY_CODES.uk:
//       extraOptionalVariables = [
//         CONTRACTS_VARIABLES.leader_document_expedition_country.value,
//         CONTRACTS_VARIABLES.leader_next_destination_city.value,
//         CONTRACTS_VARIABLES.leader_next_destination_address.value,
//         CONTRACTS_VARIABLES.leader_next_destination_country.value,
//       ];
//       break;
//
//     case COUNTRY_CODES.czech:
//       extraOptionalVariables = [CONTRACTS_VARIABLES.leader_visa_number.value];
//       break;
//
//     case COUNTRY_CODES.colombia:
//       extraOptionalVariables = [
//         CONTRACTS_VARIABLES.leader_arrival_district.value,
//         CONTRACTS_VARIABLES.leader_arrival_municipality.value,
//         CONTRACTS_VARIABLES.leader_next_destination_district.value,
//         CONTRACTS_VARIABLES.leader_next_destination_municipality.value,
//       ];
//   }
//
//   return [...commonVariables, ...leaderSpecificVariables].map((singleVariable) => {
//     if (extraOptionalVariables.includes(singleVariable.value)) {
//       return {...singleVariable, optional: true};
//     }
//     return singleVariable;
//   });
// }

const INIT_OPTIONAL_VARIABLES = {
  ...Object.values(CONTRACTS_VARIABLES).reduce((acc, variableName) => {
    acc[variableName] = false;
    return acc;
  }, {} as Record<CONTRACTS_VARIABLES, boolean>),
  [CONTRACTS_VARIABLES.leaderEmail]: true,
  [CONTRACTS_VARIABLES.leaderPhone]: true,
  [CONTRACTS_VARIABLES.leaderSecondSurname]: true,
};

const INIT_DISPLAY_VARIABLES = {
  ...Object.values(CONTRACTS_VARIABLES).reduce((acc, variableName) => {
    acc[variableName] = false;
    return acc;
  }, {} as Record<CONTRACTS_VARIABLES, boolean>),
  [CONTRACTS_VARIABLES.title]: true,
  [CONTRACTS_VARIABLES.checkInDatetime]: true,
  [CONTRACTS_VARIABLES.checkInDate]: true,
  [CONTRACTS_VARIABLES.checkOutDate]: true,
  [CONTRACTS_VARIABLES.checkOutDatetime]: true,
  [CONTRACTS_VARIABLES.housingName]: true,
  [CONTRACTS_VARIABLES.housingLogo]: true,
  [CONTRACTS_VARIABLES.housingCity]: true,
  [CONTRACTS_VARIABLES.housingAddress]: true,
  [CONTRACTS_VARIABLES.price]: true,
  [CONTRACTS_VARIABLES.managerName]: true,
  [CONTRACTS_VARIABLES.managerSignature]: true,
  [CONTRACTS_VARIABLES.leaderSignature]: true,
  [CONTRACTS_VARIABLES.leaderName]: true,
  [CONTRACTS_VARIABLES.leaderGender]: true,
  [CONTRACTS_VARIABLES.leaderBirthDate]: true,
  [CONTRACTS_VARIABLES.leaderNationality]: true,
  [CONTRACTS_VARIABLES.leaderSurname]: true,
  [CONTRACTS_VARIABLES.leaderDocType]: true,
  [CONTRACTS_VARIABLES.leaderDocNumber]: true,
  [CONTRACTS_VARIABLES.leaderResidenceCountry]: true,
  [CONTRACTS_VARIABLES.leaderEmail]: true,
  [CONTRACTS_VARIABLES.leaderPhone]: true,
};

function getDisplayVariables(country?: string) {
  if (!country) return [];

  let optionalVariables = INIT_OPTIONAL_VARIABLES;
  let displayVariables = INIT_DISPLAY_VARIABLES;

  switch (country) {
    case COUNTRY_CODES.spain:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.housingTrn]: true,
        [CONTRACTS_VARIABLES.managerPhone]: true,
        [CONTRACTS_VARIABLES.leaderSecondSurname]: true,
        [CONTRACTS_VARIABLES.leaderDocDateOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceProvince]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceProvince]: true,
      };
      break;

    case COUNTRY_CODES.italy:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.housingTrn]: true,
        [CONTRACTS_VARIABLES.managerPhone]: true,
        [CONTRACTS_VARIABLES.housingAddress]: true,
        [CONTRACTS_VARIABLES.managerBirthDate]: true,
        [CONTRACTS_VARIABLES.managerBirthPlace]: true,
        [CONTRACTS_VARIABLES.managerResidenceAddress]: true,
        [CONTRACTS_VARIABLES.managerBirthDateAndPlace]: true,
        [CONTRACTS_VARIABLES.managerVatin]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderCityOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderDocType]: true,
        [CONTRACTS_VARIABLES.leaderDocNumber]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderResidencePostalCode]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderCityOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderFiscalCode]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceProvince]: true,
        [CONTRACTS_VARIABLES.leaderCityOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderCityOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderFiscalCode]: true,
      };
      break;

    case COUNTRY_CODES.germany:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderPurposeOfStay]: true,
      };
      break;

    case COUNTRY_CODES.uae:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.managerPhone]: true,
        [CONTRACTS_VARIABLES.housingAddress]: true,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: false,
      };
      break;

    case COUNTRY_CODES.netherlands:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
      };
      break;

    case COUNTRY_CODES.uk:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationCountry]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationAddress]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: false,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderBirthDate]: false,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderNextDestinationAddress]: true,
        [CONTRACTS_VARIABLES.leaderDocNumber]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationCountry]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationCity]: true,
      };
      break;

    case COUNTRY_CODES.belgium:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
      };
      break;

    case COUNTRY_CODES.france:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderCountryOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderCityOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderDocType]: false,
        [CONTRACTS_VARIABLES.leaderDocNumber]: false,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderCityOfBirth]: true,
      };
      break;

    case COUNTRY_CODES.portugal:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderCountryOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderGender]: false,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderCountryOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
      };
      break;

    case COUNTRY_CODES.greece:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderEmail]: true,
        [CONTRACTS_VARIABLES.leaderDocDateOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderResidencePostalCode]: true,
        [CONTRACTS_VARIABLES.leaderCityOfIssue]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderCityOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderEmail]: false,
        [CONTRACTS_VARIABLES.leaderPhone]: false,
      };
      break;

    case COUNTRY_CODES.austria:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderResidencePostalCode]: true,
        [CONTRACTS_VARIABLES.leaderDocDateOfIssue]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidencePostalCode]: true,
        [CONTRACTS_VARIABLES.leaderDocType]: true,
        [CONTRACTS_VARIABLES.leaderDocNumber]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfIssue]: true,
      };
      break;

    case COUNTRY_CODES.croatia:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderCountryOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderCityOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderCitizenship]: true,
        [CONTRACTS_VARIABLES.leaderNationality]: false,
        [CONTRACTS_VARIABLES.leaderEmail]: false,
      };
      break;

    case COUNTRY_CODES.thailand:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderEmail]: true,
        [CONTRACTS_VARIABLES.leaderPhone]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: false,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderEmail]: false,
        [CONTRACTS_VARIABLES.leaderPhone]: false,
      };
      break;

    case COUNTRY_CODES.czech:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderCitizenship]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderPurposeOfStay]: true,
        [CONTRACTS_VARIABLES.leaderVisaNumber]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderNationality]: true,
        [CONTRACTS_VARIABLES.leaderVisaNumber]: true,
      };
      break;

    case COUNTRY_CODES.slovenia:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: false,
      };
      break;

    case COUNTRY_CODES.colombia:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderSecondSurname]: true,
        [CONTRACTS_VARIABLES.leaderArrivalCountry]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationCountry]: true,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderResidenceCountry]: false,
        [CONTRACTS_VARIABLES.leaderArrivalDistrict]: true,
        [CONTRACTS_VARIABLES.leaderArrivalMunicipality]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationDistrict]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationMunicipality]: true,
      };

      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderArrivalDistrict]: true,
        [CONTRACTS_VARIABLES.leaderArrivalMunicipality]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationDistrict]: true,
        [CONTRACTS_VARIABLES.leaderNextDestinationMunicipality]: true,
      };
      break;

    case COUNTRY_CODES.romania:
      displayVariables = {
        ...displayVariables,
        [CONTRACTS_VARIABLES.leaderGender]: false,
        [CONTRACTS_VARIABLES.leaderCountryOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderCityOfBirth]: true,
        [CONTRACTS_VARIABLES.leaderResidenceCity]: true,
        [CONTRACTS_VARIABLES.leaderResidenceAddress]: true,
        [CONTRACTS_VARIABLES.leaderPurposeOfStay]: true,
      };
      break;
  }

  switch (origin) {
    case ORIGINS.eviivo: {
      optionalVariables = {
        ...optionalVariables,
        [CONTRACTS_VARIABLES.leaderSurname]: true,
        [CONTRACTS_VARIABLES.leaderEmail]: true,
      };
      break;
    }
  }

  return Object.entries(displayVariables)
    .filter(([, isVisible]) => isVisible)
    .map(([variableName]) => ({
      ...CONTRACTS_VARIABLES_OPTIONS[variableName as CONTRACTS_VARIABLES],
      optional: optionalVariables[variableName as CONTRACTS_VARIABLES],
    }));
}

export {getDisplayVariables};
