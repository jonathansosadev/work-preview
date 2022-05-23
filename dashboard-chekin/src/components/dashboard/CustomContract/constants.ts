import i18n from '../../../i18n';

const ErrorDuplicateUsingHousing = 'One or more properties';

enum FORM_NAMES {
  name = 'name',
  title = 'title',
  country = 'country',
  text_format = 'text_format',
  html_format = 'html_format',
  extra_fields = 'extra_fields',
  force_save = 'force_save',
}

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.name]: i18n.t('required'),
  [FORM_NAMES.title]: i18n.t('required'),
  [FORM_NAMES.country]: i18n.t('required'),
  [FORM_NAMES.text_format]: i18n.t('required'),
};

enum CONTRACTS_VARIABLES {
  title = 'title',
  checkInDatetime = 'check_in_datetime',
  checkInDate = 'check_in_date',
  checkOutDatetime = 'check_out_datetime',
  checkOutDate = 'check_out_date',
  housingTrn = 'housing_trn',
  housingName = 'housing_name',
  housingLogo = 'housing_logo',
  housingAddress = 'housing_address',
  housingCity = 'housing_city',
  leaderDocNumber = 'leader_doc_number',
  leaderDocType = 'leader_doc_type',
  leaderName = 'leader_name',
  leaderSurname = 'leader_surname',
  leaderSecondSurname = 'leader_second_surname',
  leaderBirthDate = 'leader_birth_date',
  leaderGender = 'leader_gender',
  leaderCountryOfIssue = 'leader_country_of_issue',
  leaderDocDateOfIssue = 'leader_doc_date_of_issue',
  leaderCountryOfBirth = 'leader_country_of_birth',
  leaderCityOfBirth = 'leader_city_of_birth',
  leaderResidenceCountry = 'leader_residence_country',
  leaderResidenceCity = 'leader_residence_city',
  leaderResidenceAddress = 'leader_residence_address',
  leaderCityOfIssue = 'leader_city_of_issue',
  leaderNextDestinationCountry = 'leader_next_destination_country',
  leaderNextDestinationCity = 'leader_next_destination_city',
  leaderNextDestinationAddress = 'leader_next_destination_address',
  leaderNextDestinationDistrict = 'leader_next_destination_district',
  leaderNextDestinationMunicipality = 'leader_next_destination_municipality',
  leaderResidencePostalCode = 'leader_residence_postal_code',
  leaderResidenceProvince = 'leader_residence_province',
  leaderCitizenship = 'leader_citizenship',
  leaderPurposeOfStay = 'leader_purpose_of_stay',
  leaderVisaNumber = 'leader_visa_number',
  leaderArrivalCountry = 'leader_arrival_country',
  leaderArrivalDistrict = 'leader_arrival_district',
  leaderArrivalMunicipality = 'leader_arrival_municipality',
  leaderSignature = 'leader_signature',
  leaderEmail = 'leader_email',
  leaderPhone = 'leader_phone',
  leaderNationality = 'leader_nationality',
  leaderFiscalCode = 'leader_fiscal_code',
  price = 'price',
  managerName = 'manager_name',
  managerVatin = 'manager_vatin',
  managerPhone = 'manager_phone',
  managerBirthDate = 'manager_birth_date',
  managerBirthPlace = 'manager_birth_place',
  managerResidenceAddress = 'manager_residence_address',
  managerSignature = 'manager_signature',
  managerBirthDateAndPlace = 'manager_birth_date_and_place',
}

const CONTRACTS_VARIABLES_OPTIONS = {
  [CONTRACTS_VARIABLES.title]: {
    label: i18n.t('title'),
    value: `{${CONTRACTS_VARIABLES.title}}`,
  },
  [CONTRACTS_VARIABLES.checkInDatetime]: {
    label: i18n.t('check_in_datetime'),
    value: `{${CONTRACTS_VARIABLES.checkInDatetime}}`,
  },
  [CONTRACTS_VARIABLES.checkInDate]: {
    label: i18n.t('check_in_date'),
    value: `{${CONTRACTS_VARIABLES.checkInDate}}`,
  },
  [CONTRACTS_VARIABLES.checkOutDatetime]: {
    label: i18n.t('check_out_datetime'),
    value: `{${CONTRACTS_VARIABLES.checkOutDatetime}}`,
  },
  [CONTRACTS_VARIABLES.checkOutDate]: {
    label: i18n.t('check_out_date'),
    value: `{${CONTRACTS_VARIABLES.checkOutDate}}`,
  },
  [CONTRACTS_VARIABLES.housingTrn]: {
    label: i18n.t('tourism_registration_number'),
    value: `{${CONTRACTS_VARIABLES.housingTrn}}`,
  },
  [CONTRACTS_VARIABLES.housingName]: {
    label: i18n.t('property_name'),
    value: `{${CONTRACTS_VARIABLES.housingName}}`,
  },
  [CONTRACTS_VARIABLES.housingLogo]: {label: i18n.t('logo'), value: '{housing_logo}'},
  [CONTRACTS_VARIABLES.housingAddress]: {
    label: i18n.t('property_address'),
    value: `{${CONTRACTS_VARIABLES.housingAddress}}`,
  },
  [CONTRACTS_VARIABLES.housingCity]: {
    label: i18n.t('property_city'),
    value: `{${CONTRACTS_VARIABLES.housingCity}}`,
  },
  [CONTRACTS_VARIABLES.leaderDocNumber]: {
    label: i18n.t('leader_document_number'),
    value: `{${CONTRACTS_VARIABLES.leaderDocNumber}}`,
  },
  [CONTRACTS_VARIABLES.leaderDocType]: {
    label: i18n.t('leader_document_type'),
    value: `{${CONTRACTS_VARIABLES.leaderDocType}}`,
  },
  [CONTRACTS_VARIABLES.leaderName]: {
    label: i18n.t('leader_name'),
    value: `{${CONTRACTS_VARIABLES.leaderName}}`,
  },
  [CONTRACTS_VARIABLES.leaderSurname]: {
    label: i18n.t('leader_surname'),
    value: `{${CONTRACTS_VARIABLES.leaderSurname}}`,
  },
  [CONTRACTS_VARIABLES.leaderSecondSurname]: {
    label: i18n.t('leader_second_surname'),
    value: `{${CONTRACTS_VARIABLES.leaderSecondSurname}}`,
  },
  [CONTRACTS_VARIABLES.leaderBirthDate]: {
    label: i18n.t('leader_birth_date'),
    value: `{${CONTRACTS_VARIABLES.leaderBirthDate}}`,
  },
  [CONTRACTS_VARIABLES.leaderGender]: {
    label: i18n.t('leader_gender'),
    value: `{${CONTRACTS_VARIABLES.leaderGender}}`,
  },
  [CONTRACTS_VARIABLES.leaderCountryOfIssue]: {
    label: i18n.t('leader_document_expedition_country'),
    value: `{${CONTRACTS_VARIABLES.leaderCountryOfIssue}}`,
  },
  [CONTRACTS_VARIABLES.leaderDocDateOfIssue]: {
    label: i18n.t('leader_doc_date_of_issue'),
    value: `{${CONTRACTS_VARIABLES.leaderDocDateOfIssue}}`,
  },
  [CONTRACTS_VARIABLES.leaderCountryOfBirth]: {
    label: i18n.t('leader_country_of_birth'),
    value: `{${CONTRACTS_VARIABLES.leaderCountryOfBirth}}`,
  },
  [CONTRACTS_VARIABLES.leaderCityOfBirth]: {
    label: i18n.t('leader_city_of_birth'),
    value: `{${CONTRACTS_VARIABLES.leaderCityOfBirth}}`,
  },
  [CONTRACTS_VARIABLES.leaderResidenceCountry]: {
    label: i18n.t('leader_residence_country'),
    value: `{${CONTRACTS_VARIABLES.leaderResidenceCountry}}`,
  },
  [CONTRACTS_VARIABLES.leaderResidenceCity]: {
    label: i18n.t('leader_residence_city'),
    value: `{${CONTRACTS_VARIABLES.leaderResidenceCity}}`,
  },
  [CONTRACTS_VARIABLES.leaderResidenceAddress]: {
    label: i18n.t('leader_residence_address'),
    value: `{${CONTRACTS_VARIABLES.leaderResidenceAddress}}`,
  },
  [CONTRACTS_VARIABLES.leaderCityOfIssue]: {
    label: i18n.t('leader_document_expedition_city'),
    value: `{${CONTRACTS_VARIABLES.leaderCityOfIssue}}`,
  },
  [CONTRACTS_VARIABLES.leaderNextDestinationCountry]: {
    label: i18n.t('leader_next_destination_country'),
    value: `{${CONTRACTS_VARIABLES.leaderNextDestinationCountry}}`,
  },
  [CONTRACTS_VARIABLES.leaderNextDestinationCity]: {
    label: i18n.t('leader_next_destination_city'),
    value: `{${CONTRACTS_VARIABLES.leaderNextDestinationCity}}`,
  },
  [CONTRACTS_VARIABLES.leaderNextDestinationAddress]: {
    label: i18n.t('leader_next_destination_address'),
    value: `{${CONTRACTS_VARIABLES.leaderNextDestinationAddress}}`,
  },
  [CONTRACTS_VARIABLES.leaderNextDestinationDistrict]: {
    label: i18n.t('leader_next_destination_district'),
    value: `{${CONTRACTS_VARIABLES.leaderNextDestinationDistrict}}`,
  },
  [CONTRACTS_VARIABLES.leaderNextDestinationMunicipality]: {
    label: i18n.t('leader_next_destination_municipality'),
    value: `{${CONTRACTS_VARIABLES.leaderNextDestinationMunicipality}}`,
  },
  [CONTRACTS_VARIABLES.leaderResidencePostalCode]: {
    label: i18n.t('leader_residence_postal_code'),
    value: `{${CONTRACTS_VARIABLES.leaderResidencePostalCode}}`,
  },
  [CONTRACTS_VARIABLES.leaderResidenceProvince]: {
    label: i18n.t('leader_residence_province'),
    value: `{${CONTRACTS_VARIABLES.leaderResidenceProvince}}`,
  },
  [CONTRACTS_VARIABLES.leaderCitizenship]: {
    label: i18n.t('leader_citizenship'),
    value: `{${CONTRACTS_VARIABLES.leaderCitizenship}}`,
  },
  [CONTRACTS_VARIABLES.leaderPurposeOfStay]: {
    label: i18n.t('leader_purpose_of_stay'),
    value: `{${CONTRACTS_VARIABLES.leaderPurposeOfStay}}`,
  },
  [CONTRACTS_VARIABLES.leaderVisaNumber]: {
    label: i18n.t('leader_visa_number'),
    value: `{${CONTRACTS_VARIABLES.leaderVisaNumber}}`,
  },
  [CONTRACTS_VARIABLES.leaderArrivalCountry]: {
    label: i18n.t('leader_arrival_country'),
    value: `{${CONTRACTS_VARIABLES.leaderArrivalCountry}}`,
  },
  [CONTRACTS_VARIABLES.leaderArrivalDistrict]: {
    label: i18n.t('leader_arrival_district'),
    value: `{${CONTRACTS_VARIABLES.leaderArrivalDistrict}}`,
  },
  [CONTRACTS_VARIABLES.leaderArrivalMunicipality]: {
    label: i18n.t('leader_arrival_municipality'),
    value: `{${CONTRACTS_VARIABLES.leaderArrivalMunicipality}}`,
  },
  [CONTRACTS_VARIABLES.leaderSignature]: {
    label: i18n.t('leader_signature'),
    value: `{${CONTRACTS_VARIABLES.leaderSignature}}`,
  },
  [CONTRACTS_VARIABLES.leaderEmail]: {
    label: i18n.t('leader_email'),
    value: `{${CONTRACTS_VARIABLES.leaderEmail}}`,
  },
  [CONTRACTS_VARIABLES.leaderPhone]: {
    label: i18n.t('leader_phone'),
    value: `{${CONTRACTS_VARIABLES.leaderPhone}}`,
  },
  [CONTRACTS_VARIABLES.leaderNationality]: {
    label: i18n.t('leader_nationality'),
    value: `{${CONTRACTS_VARIABLES.leaderNationality}}`,
  },
  [CONTRACTS_VARIABLES.leaderFiscalCode]: {
    label: i18n.t('leader_fiscal_code'),
    value: `{${CONTRACTS_VARIABLES.leaderFiscalCode}}`,
  },
  [CONTRACTS_VARIABLES.price]: {
    label: i18n.t('price'),
    value: `{${CONTRACTS_VARIABLES.price}}`,
  },
  [CONTRACTS_VARIABLES.managerName]: {
    label: i18n.t('manager_name'),
    value: `{${CONTRACTS_VARIABLES.managerName}}`,
  },
  [CONTRACTS_VARIABLES.managerVatin]: {
    label: i18n.t('manager_vatin'),
    value: `{${CONTRACTS_VARIABLES.managerVatin}}`,
  },
  [CONTRACTS_VARIABLES.managerPhone]: {
    label: i18n.t('manager_phone'),
    value: `{${CONTRACTS_VARIABLES.managerPhone}}`,
  },
  [CONTRACTS_VARIABLES.managerBirthDate]: {
    label: i18n.t('manager_birth_date'),
    value: `{${CONTRACTS_VARIABLES.managerBirthDate}}`,
  },
  [CONTRACTS_VARIABLES.managerBirthPlace]: {
    label: i18n.t('manager_birth_place'),
    value: `{${CONTRACTS_VARIABLES.managerBirthPlace}}`,
  },
  [CONTRACTS_VARIABLES.managerResidenceAddress]: {
    label: i18n.t('manager_residence_address'),
    value: `{${CONTRACTS_VARIABLES.managerResidenceAddress}}`,
  },
  [CONTRACTS_VARIABLES.managerSignature]: {
    label: i18n.t('manager_signature'),
    value: `{${CONTRACTS_VARIABLES.managerSignature}}`,
  },
  [CONTRACTS_VARIABLES.managerBirthDateAndPlace]: {
    label: i18n.t('manager_birth_date_and_place'),
    value: `{${CONTRACTS_VARIABLES.managerBirthDateAndPlace}}`,
  },
};

export {
  FORM_NAMES,
  INIT_REQUIRED_FIELDS,
  CONTRACTS_VARIABLES,
  CONTRACTS_VARIABLES_OPTIONS,
  ErrorDuplicateUsingHousing,
};
