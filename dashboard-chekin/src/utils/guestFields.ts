import i18n from '../i18n';
import {
  COUNTRY_CODES,
  EU_MEMBERS,
  FAMILY_GROUP_TYPE,
  STAT_TYPES,
  ORIGINS,
} from './constants';
import {Housing} from './types';
import {getChecksVerificationType, getCountryCode, getManagerOrigin} from './housing';
import {getIsCaptureStatFieldsEnabled, getStatTypeIfStatActive} from './reservations';
import {checkIsDocTypeWithDuplexScan} from './docTypes';

enum DISPLAY_FIELD_TYPES {
  optional = 'OPTIONAL',
}

enum FORM_NAMES {
  name = 'name',
  surname = 'surname',
  secondSurname = 'second_surname',
  birthDate = 'birthDate',
  sex = 'sex',
  nationality = 'nationality',
  docType = 'docType',
  docNumber = 'docNumber',
  countryOfIssue = 'countryOfIssue',
  italianCityOfIssue = 'italianCityOfIssue',
  docDateOfIssue = 'docDateOfIssue',
  birthCountry = 'birthCountry',
  italianCityOfBirth = 'italianCityOfBirth',
  residenceCountry = 'residenceCountry',
  residenceCity = 'residenceCity',
  italianResidenceCity = 'italianResidenceCity',
  residenceAddress = 'residenceAddress',
  cityOfBirth = 'cityOfBirth',
  cityOfIssue = 'cityOfIssue',
  nextDestinationCountry = 'nextDestinationCountry',
  nextDestinationCity = 'nextDestinationCity',
  nextDestinationAddress = 'nextDestinationAddress',
  nextDestinationDistrict = 'nextDestinationDistrict',
  nextDestinationMunicipality = 'nextDestinationMunicipality',
  residencePostalCode = 'residencePostalCode',
  residenceProvince = 'residenceProvince',
  citizenship = 'citizenship',
  purposeOfStay = 'purposeOfStay',
  visaNumber = 'visaNumber',
  arrivalCountry = 'arrivalCountry',
  arrivalDistrict = 'arrivalDistrict',
  arrivalMunicipality = 'arrivalMunicipality',
  terms = 'terms',
  taxExemption = 'taxExemption',
  signature = 'signature',
  frontSideScan = 'front_side_scan',
  backSideScan = 'back_side_scan',
  fiscalCode = 'fiscal_code',
  fullTouristTax = 'full_tourist_tax',
  email = 'email',
  phone = 'phone',
}

const FORM_FIELDS_LABELS: Record<
  Exclude<
    FORM_NAMES,
    | FORM_NAMES.frontSideScan
    | FORM_NAMES.backSideScan
    | FORM_NAMES.signature
    | FORM_NAMES.terms
  >,
  string
> = {
  [FORM_NAMES.sex]: i18n.t('sex'),
  [FORM_NAMES.name]: i18n.t('name'),
  [FORM_NAMES.surname]: i18n.t('surname'),
  [FORM_NAMES.secondSurname]: i18n.t('second_surname'),
  [FORM_NAMES.birthDate]: i18n.t('birth_date'),
  [FORM_NAMES.nationality]: i18n.t('nationality'),
  [FORM_NAMES.docType]: i18n.t('doc_type'),
  [FORM_NAMES.docNumber]: i18n.t('doc_number'),
  [FORM_NAMES.docDateOfIssue]: i18n.t('date_of_issue'),
  [FORM_NAMES.birthCountry]: i18n.t('country_of_birth'),
  [FORM_NAMES.residenceCountry]: i18n.t('residence_country'),
  [FORM_NAMES.residenceCity]: i18n.t('residence_city'),
  [FORM_NAMES.residenceAddress]: i18n.t('residence_address'),
  [FORM_NAMES.countryOfIssue]: i18n.t('country_of_issue'),
  [FORM_NAMES.cityOfBirth]: i18n.t('city_of_birth'),
  [FORM_NAMES.cityOfIssue]: i18n.t('city_of_issue'),
  [FORM_NAMES.nextDestinationCountry]: i18n.t('next_destination_country'),
  [FORM_NAMES.nextDestinationCity]: i18n.t('next_destination_city'),
  [FORM_NAMES.nextDestinationAddress]: i18n.t('next_destination_address'),
  [FORM_NAMES.residencePostalCode]: i18n.t('residence_postal_code'),
  [FORM_NAMES.citizenship]: i18n.t('citizenship'),
  [FORM_NAMES.purposeOfStay]: i18n.t('purpose_of_stay'),
  [FORM_NAMES.visaNumber]: i18n.t('visa_number_eu'),
  [FORM_NAMES.arrivalCountry]: i18n.t('arrived_from_country'),
  [FORM_NAMES.arrivalDistrict]: i18n.t('arrived_from_district'),
  [FORM_NAMES.arrivalMunicipality]: i18n.t('arrived_from_municipality'),
  [FORM_NAMES.nextDestinationDistrict]: i18n.t('next_destination_district'),
  [FORM_NAMES.nextDestinationMunicipality]: i18n.t('next_destination_municipality'),
  [FORM_NAMES.taxExemption]: i18n.t('tax_exemption'),
  [FORM_NAMES.residenceProvince]: i18n.t('residence_province'),
  [FORM_NAMES.email]: i18n.t('email'),
  [FORM_NAMES.phone]: i18n.t('phone_number'),
  [FORM_NAMES.fiscalCode]: i18n.t('fiscal_code'),
  [FORM_NAMES.fullTouristTax]: i18n.t('full_tourist_tax'),
  [FORM_NAMES.italianCityOfBirth]: i18n.t('city_of_birth'),
  [FORM_NAMES.italianCityOfIssue]: i18n.t('city_of_issue'),
  [FORM_NAMES.italianResidenceCity]: i18n.t('residence_city'),
};

const FORM_FIELDS_PLACEHOLDERS: Record<
  Exclude<
    FORM_NAMES,
    | FORM_NAMES.frontSideScan
    | FORM_NAMES.backSideScan
    | FORM_NAMES.signature
    | FORM_NAMES.terms
  >,
  string
> = {
  [FORM_NAMES.sex]: '- -',
  [FORM_NAMES.name]: i18n.t('enter_name'),
  [FORM_NAMES.surname]: i18n.t('enter_surname'),
  [FORM_NAMES.secondSurname]: i18n.t('enter_second_surname'),
  [FORM_NAMES.birthDate]: '',
  [FORM_NAMES.nationality]: '- -',
  [FORM_NAMES.docType]: '- -',
  [FORM_NAMES.docNumber]: i18n.t('enter_number'),
  [FORM_NAMES.docDateOfIssue]: '',
  [FORM_NAMES.birthCountry]: '- -',
  [FORM_NAMES.residenceCountry]: '- -',
  [FORM_NAMES.residenceCity]: i18n.t('enter_city'),
  [FORM_NAMES.residenceAddress]: i18n.t('enter_address'),
  [FORM_NAMES.countryOfIssue]: '- -',
  [FORM_NAMES.cityOfBirth]: i18n.t('enter_city'),
  [FORM_NAMES.cityOfIssue]: i18n.t('enter_city'),
  [FORM_NAMES.nextDestinationCountry]: '- -',
  [FORM_NAMES.nextDestinationCity]: i18n.t('enter_city'),
  [FORM_NAMES.nextDestinationAddress]: i18n.t('enter_address'),
  [FORM_NAMES.residencePostalCode]: i18n.t('enter_code'),
  [FORM_NAMES.citizenship]: '- -',
  [FORM_NAMES.purposeOfStay]: '- -',
  [FORM_NAMES.visaNumber]: i18n.t('enter_number'),
  [FORM_NAMES.arrivalCountry]: '- -',
  [FORM_NAMES.arrivalDistrict]: '- -',
  [FORM_NAMES.arrivalMunicipality]: '- -',
  [FORM_NAMES.nextDestinationDistrict]: '- -',
  [FORM_NAMES.nextDestinationMunicipality]: '- -',
  [FORM_NAMES.taxExemption]: '- -',
  [FORM_NAMES.residenceProvince]: '- -',
  [FORM_NAMES.email]: i18n.t('enter_email'),
  [FORM_NAMES.phone]: i18n.t('enter_your_phone_number'),
  [FORM_NAMES.fiscalCode]: i18n.t('enter_code'),
  [FORM_NAMES.fullTouristTax]: i18n.t('full_tourist_tax'),
  [FORM_NAMES.italianCityOfBirth]: '- -',
  [FORM_NAMES.italianCityOfIssue]: '- -',
  [FORM_NAMES.italianResidenceCity]: '- -',
};

enum FIELD_TYPES {
  text = 'TEXT',
  date = 'DATE',
  file = 'FILE',
  time = 'TIME',
  select = 'SELECT',
  phone = 'PHONE',
}

const FORM_FIELDS_TYPES: Record<
  Exclude<
    FORM_NAMES,
    | FORM_NAMES.frontSideScan
    | FORM_NAMES.backSideScan
    | FORM_NAMES.signature
    | FORM_NAMES.terms
  >,
  FIELD_TYPES
> = {
  [FORM_NAMES.sex]: FIELD_TYPES.select,
  [FORM_NAMES.name]: FIELD_TYPES.text,
  [FORM_NAMES.surname]: FIELD_TYPES.text,
  [FORM_NAMES.secondSurname]: FIELD_TYPES.text,
  [FORM_NAMES.birthDate]: FIELD_TYPES.date,
  [FORM_NAMES.nationality]: FIELD_TYPES.select,
  [FORM_NAMES.docType]: FIELD_TYPES.select,
  [FORM_NAMES.docNumber]: FIELD_TYPES.text,
  [FORM_NAMES.docDateOfIssue]: FIELD_TYPES.date,
  [FORM_NAMES.birthCountry]: FIELD_TYPES.select,
  [FORM_NAMES.residenceCountry]: FIELD_TYPES.select,
  [FORM_NAMES.residenceCity]: FIELD_TYPES.text,
  [FORM_NAMES.residenceAddress]: FIELD_TYPES.text,
  [FORM_NAMES.countryOfIssue]: FIELD_TYPES.select,
  [FORM_NAMES.cityOfBirth]: FIELD_TYPES.text,
  [FORM_NAMES.cityOfIssue]: FIELD_TYPES.select,
  [FORM_NAMES.nextDestinationCountry]: FIELD_TYPES.select,
  [FORM_NAMES.nextDestinationCity]: FIELD_TYPES.text,
  [FORM_NAMES.nextDestinationAddress]: FIELD_TYPES.text,
  [FORM_NAMES.residencePostalCode]: FIELD_TYPES.text,
  [FORM_NAMES.citizenship]: FIELD_TYPES.select,
  [FORM_NAMES.purposeOfStay]: FIELD_TYPES.select,
  [FORM_NAMES.visaNumber]: FIELD_TYPES.text,
  [FORM_NAMES.arrivalCountry]: FIELD_TYPES.select,
  [FORM_NAMES.arrivalDistrict]: FIELD_TYPES.select,
  [FORM_NAMES.arrivalMunicipality]: FIELD_TYPES.select,
  [FORM_NAMES.nextDestinationDistrict]: FIELD_TYPES.select,
  [FORM_NAMES.nextDestinationMunicipality]: FIELD_TYPES.select,
  [FORM_NAMES.taxExemption]: FIELD_TYPES.select,
  [FORM_NAMES.residenceProvince]: FIELD_TYPES.select,
  [FORM_NAMES.email]: FIELD_TYPES.text,
  [FORM_NAMES.phone]: FIELD_TYPES.phone,
  [FORM_NAMES.fiscalCode]: FIELD_TYPES.text,
  [FORM_NAMES.fullTouristTax]: FIELD_TYPES.text,
  [FORM_NAMES.italianCityOfBirth]: FIELD_TYPES.select,
  [FORM_NAMES.italianCityOfIssue]: FIELD_TYPES.select,
  [FORM_NAMES.italianResidenceCity]: FIELD_TYPES.select,
};

const DefaultRequiredLabel = i18n.t('required') as string;

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.name]: DefaultRequiredLabel,
  [FORM_NAMES.surname]: DefaultRequiredLabel,
  [FORM_NAMES.secondSurname]: false,
  [FORM_NAMES.sex]: DefaultRequiredLabel,
  [FORM_NAMES.birthDate]: DefaultRequiredLabel,
  [FORM_NAMES.nationality]: DefaultRequiredLabel,
  [FORM_NAMES.docType]: DefaultRequiredLabel,
  [FORM_NAMES.docNumber]: DefaultRequiredLabel,
  [FORM_NAMES.docDateOfIssue]: DefaultRequiredLabel,
  [FORM_NAMES.birthCountry]: DefaultRequiredLabel,
  [FORM_NAMES.residenceCountry]: DefaultRequiredLabel,
  [FORM_NAMES.residenceCity]: DefaultRequiredLabel,
  [FORM_NAMES.countryOfIssue]: DefaultRequiredLabel,
  [FORM_NAMES.cityOfBirth]: DefaultRequiredLabel,
  [FORM_NAMES.cityOfIssue]: DefaultRequiredLabel,
  [FORM_NAMES.residenceAddress]: DefaultRequiredLabel,
  [FORM_NAMES.nextDestinationCountry]: DefaultRequiredLabel,
  [FORM_NAMES.nextDestinationCity]: DefaultRequiredLabel,
  [FORM_NAMES.nextDestinationAddress]: DefaultRequiredLabel,
  [FORM_NAMES.residencePostalCode]: DefaultRequiredLabel,
  [FORM_NAMES.citizenship]: DefaultRequiredLabel,
  [FORM_NAMES.purposeOfStay]: DefaultRequiredLabel,
  [FORM_NAMES.visaNumber]: DefaultRequiredLabel,
  [FORM_NAMES.arrivalCountry]: DefaultRequiredLabel,
  [FORM_NAMES.arrivalDistrict]: DefaultRequiredLabel,
  [FORM_NAMES.arrivalMunicipality]: DefaultRequiredLabel,
  [FORM_NAMES.nextDestinationDistrict]: DefaultRequiredLabel,
  [FORM_NAMES.nextDestinationMunicipality]: DefaultRequiredLabel,
  [FORM_NAMES.taxExemption]: DefaultRequiredLabel,
  [FORM_NAMES.residenceProvince]: DefaultRequiredLabel,
  [FORM_NAMES.signature]: DefaultRequiredLabel,
  [FORM_NAMES.frontSideScan]: DefaultRequiredLabel,
  [FORM_NAMES.backSideScan]: DefaultRequiredLabel,
  [FORM_NAMES.phone]: false,
  [FORM_NAMES.fiscalCode]: DefaultRequiredLabel,
  [FORM_NAMES.fullTouristTax]: DefaultRequiredLabel,
  [FORM_NAMES.italianCityOfBirth]: DefaultRequiredLabel,
  [FORM_NAMES.italianCityOfIssue]: DefaultRequiredLabel,
  [FORM_NAMES.italianResidenceCity]: DefaultRequiredLabel,
  [FORM_NAMES.terms]: false,
  [FORM_NAMES.email]: false,
};

const INIT_DISPLAY_FIELDS: {[key: string]: boolean | DISPLAY_FIELD_TYPES} = {
  [FORM_NAMES.italianCityOfBirth]: false,
  [FORM_NAMES.italianCityOfIssue]: false,
  [FORM_NAMES.italianResidenceCity]: false,
  [FORM_NAMES.name]: true,
  [FORM_NAMES.sex]: true,
  [FORM_NAMES.birthDate]: true,
  [FORM_NAMES.nationality]: true,
  [FORM_NAMES.surname]: true,
  [FORM_NAMES.docType]: true,
  [FORM_NAMES.docNumber]: true,
  [FORM_NAMES.residenceCountry]: true,
  [FORM_NAMES.signature]: true,
  [FORM_NAMES.email]: true,
  [FORM_NAMES.docDateOfIssue]: false,
  [FORM_NAMES.secondSurname]: false,
  [FORM_NAMES.birthCountry]: false,
  [FORM_NAMES.residenceCity]: false,
  [FORM_NAMES.residenceAddress]: false,
  [FORM_NAMES.countryOfIssue]: false,
  [FORM_NAMES.cityOfIssue]: false,
  [FORM_NAMES.cityOfBirth]: false,
  [FORM_NAMES.nextDestinationCountry]: false,
  [FORM_NAMES.nextDestinationCity]: false,
  [FORM_NAMES.nextDestinationAddress]: false,
  [FORM_NAMES.residencePostalCode]: false,
  [FORM_NAMES.citizenship]: false,
  [FORM_NAMES.purposeOfStay]: false,
  [FORM_NAMES.visaNumber]: false,
  [FORM_NAMES.arrivalCountry]: false,
  [FORM_NAMES.arrivalDistrict]: false,
  [FORM_NAMES.arrivalMunicipality]: false,
  [FORM_NAMES.nextDestinationDistrict]: false,
  [FORM_NAMES.nextDestinationMunicipality]: false,
  [FORM_NAMES.terms]: false,
  [FORM_NAMES.taxExemption]: false,
  [FORM_NAMES.residenceProvince]: false,
  [FORM_NAMES.frontSideScan]: false,
  [FORM_NAMES.backSideScan]: false,
  [FORM_NAMES.phone]: true,
  [FORM_NAMES.fiscalCode]: false,
  [FORM_NAMES.fullTouristTax]: false,
};

type FormFieldsTypes = {
  [FORM_NAMES.birthCountry]: string;
  [FORM_NAMES.countryOfIssue]: string;
  [FORM_NAMES.citizenship]: string;
  [FORM_NAMES.arrivalCountry]: string;
  [FORM_NAMES.nextDestinationCountry]: string;
  [FORM_NAMES.residenceCountry]: string;
  [FORM_NAMES.docType]: string;
  [FORM_NAMES.email]: string;
  [FORM_NAMES.phone]: string;
};

type FieldsDataTypes = {
  housing?: Housing;
  housingCountry?: string;
  nationalityCode?: string;
  isGuestLeader?: boolean;
  isGuestWithDoc?: boolean;
  isEditingGuest?: boolean;
  hasAnyCompletePoliceGuest?: boolean;
  guestGroupType?: string | null;
  formFields?: Partial<FormFieldsTypes>;
  requireIdOrPassport?: boolean;
  isPoliceActivated?: boolean;
  isSaltoLock?: boolean;
  isCustomForm?: boolean;
  isHousingContractEnabled?: boolean;
};

/**
 * These functions below are to prevent caching at the <Controller/>s rules.
 * Create such function for an each <Controller /> if it has any dynamic rule
 */

function getIsDocTypeRequired({housingCountry, nationalityCode}: FieldsDataTypes) {
  switch (housingCountry) {
    case COUNTRY_CODES.uk: {
      if (nationalityCode === COUNTRY_CODES.uk) {
        return false;
      }

      return INIT_REQUIRED_FIELDS[FORM_NAMES.docType];
    }
    default: {
      return INIT_REQUIRED_FIELDS[FORM_NAMES.docType];
    }
  }
}

function getIsDocDateOfIssueRequired({housingCountry}: FieldsDataTypes) {
  switch (housingCountry) {
    default: {
      return INIT_REQUIRED_FIELDS[FORM_NAMES.docType];
    }
  }
}

function getIsCountryOfIssueRequired({
  housingCountry,
  guestGroupType,
  isGuestLeader,
  formFields,
}: FieldsDataTypes) {
  switch (housingCountry) {
    case COUNTRY_CODES.austria: {
      if (guestGroupType === FAMILY_GROUP_TYPE) {
        if (isGuestLeader) {
          return formFields?.residenceCountry === COUNTRY_CODES.austria
            ? false
            : DefaultRequiredLabel;
        }
      }

      return formFields?.residenceCountry === COUNTRY_CODES.austria
        ? false
        : DefaultRequiredLabel;
    }
    default: {
      return INIT_REQUIRED_FIELDS[FORM_NAMES.docType];
    }
  }
}

function getDocTypeRequiredFields(housing?: Housing) {
  const {isOnlyOfficialDocumentMandatory} = getChecksVerificationType(housing);
  const isDocFieldsRequired = isOnlyOfficialDocumentMandatory
    ? i18n.t('required')
    : false;

  return {
    [FORM_NAMES.frontSideScan]: isDocFieldsRequired,
    [FORM_NAMES.backSideScan]: isDocFieldsRequired,
  };
}

function getRequiredFieldsByCountry({
  housing,
  nationalityCode,
  formFields,
  housingCountry,
  guestGroupType,
  isGuestLeader = false,
  isPoliceActivated,
  isSaltoLock,
}: FieldsDataTypes) {
  const isContractEnabled = housing?.is_contract_enabled;
  let fields: Record<FORM_NAMES, string | boolean> = {
    ...INIT_REQUIRED_FIELDS,
    [FORM_NAMES.docType]: getIsDocTypeRequired({
      formFields,
      guestGroupType,
      nationalityCode,
      isGuestLeader,
      housingCountry,
    }),
    [FORM_NAMES.docDateOfIssue]: getIsDocDateOfIssueRequired({
      formFields,
      guestGroupType,
      nationalityCode,
      isGuestLeader,
      housingCountry,
    }),
    [FORM_NAMES.countryOfIssue]: getIsCountryOfIssueRequired({
      formFields,
      guestGroupType,
      nationalityCode,
      isGuestLeader,
      housingCountry,
    }),
    ...getDocTypeRequiredFields(housing),
  };

  switch (housingCountry) {
    case COUNTRY_CODES.uk: {
      fields = {
        ...fields,
        [FORM_NAMES.nextDestinationAddress]: false,
        [FORM_NAMES.phone]: Boolean(isSaltoLock) ? (i18n.t('required') as string) : false,
      };

      if (nationalityCode === COUNTRY_CODES.uk) {
        fields = {
          ...fields,
          [FORM_NAMES.docNumber]: false,
        };
      }
      return fields;
    }
    case COUNTRY_CODES.belgium: {
      return {
        ...fields,
        [FORM_NAMES.residenceAddress]: false,
        [FORM_NAMES.residenceCity]: false,
      };
    }
    case COUNTRY_CODES.france: {
      return {
        ...fields,
        [FORM_NAMES.cityOfBirth]: false,
      };
    }
    case COUNTRY_CODES.germany: {
      return {
        ...fields,
        [FORM_NAMES.phone]: Boolean(isSaltoLock) ? (i18n.t('required') as string) : false,
      };
    }
    case COUNTRY_CODES.portugal: {
      return {
        ...fields,
        [FORM_NAMES.birthCountry]: false,
        [FORM_NAMES.residenceCity]: false,
      };
    }
    case COUNTRY_CODES.spain: {
      if (isPoliceActivated && nationalityCode === COUNTRY_CODES.spain) {
        return {
          ...fields,
          [FORM_NAMES.secondSurname]: DefaultRequiredLabel,
        };
      }
      return fields;
    }
    case COUNTRY_CODES.italy: {
      if (isContractEnabled) {
        return {
          ...fields,
          [FORM_NAMES.phone]: Boolean(isSaltoLock)
            ? (i18n.t('required') as string)
            : false,
        };
      }
      return fields;
    }
    case COUNTRY_CODES.greece: {
      fields = {
        ...fields,
        [FORM_NAMES.cityOfIssue]: false,
        [FORM_NAMES.email]: DefaultRequiredLabel,
        [FORM_NAMES.phone]: DefaultRequiredLabel,
      };

      if (!isGuestLeader) {
        return {
          ...fields,
          [FORM_NAMES.signature]: false,
        };
      }
      return fields;
    }
    case COUNTRY_CODES.austria: {
      const isResidencePostalCode = [
        COUNTRY_CODES.austria,
        COUNTRY_CODES.germany,
      ].includes(formFields?.residenceCountry || '')
        ? DefaultRequiredLabel
        : false;

      const isDocTypeRequired =
        formFields?.residenceCountry === COUNTRY_CODES.austria
          ? false
          : DefaultRequiredLabel;
      const isDocNumberRequired =
        formFields?.residenceCountry === COUNTRY_CODES.austria && !formFields.docType
          ? false
          : DefaultRequiredLabel;
      const isDocDateOfIssueRequired =
        formFields?.residenceCountry === COUNTRY_CODES.austria
          ? false
          : DefaultRequiredLabel;
      const isCountryOfIssueRequired =
        formFields?.residenceCountry === COUNTRY_CODES.austria
          ? false
          : DefaultRequiredLabel;

      fields = {
        ...fields,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceAddress]: false,
        [FORM_NAMES.nationality]: false,
        [FORM_NAMES.residenceCity]: false,
        [FORM_NAMES.phone]: Boolean(isSaltoLock) ? DefaultRequiredLabel : false,
        [FORM_NAMES.residencePostalCode]: formFields ? isResidencePostalCode : false,
        [FORM_NAMES.docType]: formFields ? isDocTypeRequired : false,
        [FORM_NAMES.docNumber]: formFields ? isDocNumberRequired : false,
        [FORM_NAMES.docDateOfIssue]: formFields ? isDocDateOfIssueRequired : false,
        [FORM_NAMES.countryOfIssue]: formFields ? isCountryOfIssueRequired : false,
      };

      if (guestGroupType === FAMILY_GROUP_TYPE) {
        if (!isGuestLeader) {
          return {
            ...fields,
            [FORM_NAMES.residenceCity]: false,
            [FORM_NAMES.residenceAddress]: false,
          };
        }
      }

      return fields;
    }
    case COUNTRY_CODES.slovenia: {
      return {
        ...fields,
        [FORM_NAMES.taxExemption]: false,
      };
    }
    case COUNTRY_CODES.croatia: {
      return {
        ...fields,
        [FORM_NAMES.residenceAddress]: false,
        [FORM_NAMES.cityOfBirth]: false,
      };
    }
    case COUNTRY_CODES.thailand: {
      if (isGuestLeader) {
        return {
          ...fields,
          [FORM_NAMES.email]: DefaultRequiredLabel,
          [FORM_NAMES.phone]: DefaultRequiredLabel,
        };
      }

      return {
        ...fields,
      };
    }
    case COUNTRY_CODES.czech: {
      return {...fields, [FORM_NAMES.nationality]: false};
    }
    default: {
      return fields;
    }
  }
}

function getRequiredFieldsByOrigin(housing?: Housing) {
  const origin = getManagerOrigin(housing);

  switch (origin) {
    case ORIGINS.eviivo: {
      return {
        [FORM_NAMES.surname]: DefaultRequiredLabel,
        [FORM_NAMES.email]: DefaultRequiredLabel,
      };
    }

    default: {
      return {};
    }
  }
}

function getRequiredFields(housingAndFieldsData: FieldsDataTypes) {
  const requiredFieldsByCountry = getRequiredFieldsByCountry(housingAndFieldsData);
  const requiredFieldsByHousingOrigin = getRequiredFieldsByOrigin(
    housingAndFieldsData.housing,
  );
  return {...requiredFieldsByCountry, ...requiredFieldsByHousingOrigin};
}

function getDisplayFields({
  housing,
  nationalityCode,
  formFields,
  isGuestLeader,
  hasAnyCompletePoliceGuest,
  guestGroupType,
  housingCountry,
  isGuestWithDoc,
  isEditingGuest,
  requireIdOrPassport,
  isHousingContractEnabled,
  isSaltoLock,
  isCustomForm,
}: FieldsDataTypes) {
  const housingCountryCode = housingCountry || getCountryCode(housing);
  const isContractEnabled =
    Boolean(housing?.is_contract_enabled) || isHousingContractEnabled;
  const {isOnlyOfficialDocument} = getChecksVerificationType(housing);
  const isBiomatchForAllGuests = Boolean(housing?.is_biometric_match_for_all_enabled);
  const isBackSideScanVisible = checkIsDocTypeWithDuplexScan({
    docType: formFields?.docType,
    nationality: nationalityCode,
  });

  const isSignatureVisible = Boolean(isGuestLeader || isContractEnabled);

  let fields = {
    ...INIT_DISPLAY_FIELDS,
  };
  let extraFields: Partial<Record<FORM_NAMES, boolean | DISPLAY_FIELD_TYPES>> = {
    [FORM_NAMES.signature]: isSignatureVisible,
  };

  if (isOnlyOfficialDocument) {
    if (!(!isBiomatchForAllGuests && !isGuestLeader)) {
      extraFields = {
        ...extraFields,
        [FORM_NAMES.frontSideScan]: true,
        [FORM_NAMES.backSideScan]: isBackSideScanVisible,
        [FORM_NAMES.docType]: true,
      };
    }
  }

  switch (housingCountryCode) {
    case COUNTRY_CODES.spain: {
      const isCaptureStatFieldsEnabled = getIsCaptureStatFieldsEnabled(housing);
      fields = {
        ...fields,
        [FORM_NAMES.secondSurname]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.residenceCountry]: false,
        [FORM_NAMES.docDateOfIssue]: true,
      };

      extraFields = {
        ...extraFields,
        [FORM_NAMES.signature]: true,
      };

      if (isCaptureStatFieldsEnabled) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.residenceCountry]: true,
        };

        if (formFields?.residenceCountry === COUNTRY_CODES.spain) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.residenceCity]: true,
            [FORM_NAMES.residenceProvince]: true,
          };
        }
      }

      break;
    }
    case COUNTRY_CODES.portugal: {
      fields = {
        ...fields,
        [FORM_NAMES.birthCountry]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.residenceCity]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.countryOfIssue]: true,
        [FORM_NAMES.sex]: false,
      };

      extraFields = {
        ...extraFields,
        [FORM_NAMES.signature]: true,
      };

      break;
    }
    case COUNTRY_CODES.italy: {
      const statType = getStatTypeIfStatActive(housing);

      fields = {
        ...fields,
        [FORM_NAMES.terms]: true,
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.docType]: false,
        [FORM_NAMES.docNumber]: false,
        [FORM_NAMES.residenceCountry]: false,
      };

      if (statType) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.residenceCountry]: true,
        };

        if (formFields?.residenceCountry === COUNTRY_CODES.italy) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.italianResidenceCity]: true,
          };
        }

        if (statType === STAT_TYPES.valtellinaAbit) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.taxExemption]: true,
          };
        }
      }

      if (formFields?.birthCountry === COUNTRY_CODES.italy) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.italianCityOfBirth]: true,
        };
      }

      const shouldShowDocFieldsWhileAddingNewGuest =
        hasAnyCompletePoliceGuest && !isEditingGuest;
      const shouldShowDocFields =
        isGuestLeader || isGuestWithDoc || shouldShowDocFieldsWhileAddingNewGuest;

      if (shouldShowDocFields) {
        if (isGuestLeader) {
          fields = {
            ...fields,
            [FORM_NAMES.docType]: true,
            [FORM_NAMES.docNumber]: true,
            [FORM_NAMES.countryOfIssue]: true,
          };
        } else {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.docType]: true,
            [FORM_NAMES.docNumber]: true,
            [FORM_NAMES.countryOfIssue]: true,
          };
        }

        if (formFields?.countryOfIssue === COUNTRY_CODES.italy) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.italianCityOfIssue]: true,
          };
        }

        if (isContractEnabled && isGuestLeader) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.signature]: true,
            [FORM_NAMES.residenceCountry]: true,
            [FORM_NAMES.residenceCity]: true,
            [FORM_NAMES.residenceAddress]: true,
            [FORM_NAMES.residencePostalCode]: true,
          };

          if (nationalityCode === COUNTRY_CODES.italy) {
            extraFields = {
              ...extraFields,
              [FORM_NAMES.fiscalCode]: true,
            };
          }

          if (formFields?.residenceCountry === COUNTRY_CODES.italy) {
            extraFields = {
              ...extraFields,
              [FORM_NAMES.italianResidenceCity]: true,
              [FORM_NAMES.residenceCity]: false,
            };
          }
        } else {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.signature]: false,
          };
        }
      }

      break;
    }
    case COUNTRY_CODES.germany: {
      fields = {
        ...fields,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.purposeOfStay]: true,
      };

      extraFields = {
        ...extraFields,
        [FORM_NAMES.signature]: true,
      };

      break;
    }
    case COUNTRY_CODES.uae: {
      fields = {
        ...fields,
        [FORM_NAMES.terms]: true,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceCountry]: false,
      };
      extraFields = {
        ...extraFields,
        [FORM_NAMES.signature]: false,
      };

      break;
    }
    case COUNTRY_CODES.netherlands: {
      fields = {
        ...fields,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
      };

      break;
    }
    case COUNTRY_CODES.belgium: {
      fields = {
        ...fields,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
      };

      break;
    }
    case COUNTRY_CODES.france: {
      fields = {
        ...fields,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.cityOfBirth]: true,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.docType]: false,
        [FORM_NAMES.docNumber]: false,
      };

      break;
    }
    case COUNTRY_CODES.uk: {
      fields = {
        ...fields,
        [FORM_NAMES.countryOfIssue]: true,
        [FORM_NAMES.nextDestinationCountry]: true,
        [FORM_NAMES.nextDestinationAddress]: true,
        [FORM_NAMES.nextDestinationCity]: true,
        [FORM_NAMES.residenceCountry]: false,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.birthDate]: false,
      };

      if (nationalityCode === COUNTRY_CODES.uk) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.countryOfIssue]: false,
          [FORM_NAMES.nextDestinationCountry]: false,
          [FORM_NAMES.nextDestinationCity]: false,
          [FORM_NAMES.nextDestinationAddress]: false,
        };
      }

      break;
    }
    case COUNTRY_CODES.austria: {
      fields = {
        ...fields,
        [FORM_NAMES.residenceCity]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.residenceAddress]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.residencePostalCode]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.docType]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.docNumber]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.docDateOfIssue]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.countryOfIssue]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.email]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.phone]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.sex]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.nationality]: DISPLAY_FIELD_TYPES.optional,
      };

      if (guestGroupType === FAMILY_GROUP_TYPE && !isGuestLeader) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.sex]: false,
          [FORM_NAMES.nationality]: false,
          [FORM_NAMES.signature]: false,
          [FORM_NAMES.docDateOfIssue]: false,
          [FORM_NAMES.countryOfIssue]: false,
          [FORM_NAMES.residenceAddress]: false,
        };
      }

      break;
    }
    case COUNTRY_CODES.czech: {
      fields = {
        ...fields,
        [FORM_NAMES.citizenship]: true,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.sex]: false,
      };

      if (isGuestLeader) {
        fields = {
          ...fields,
          [FORM_NAMES.purposeOfStay]: true,
        };
      }

      if (
        formFields?.citizenship &&
        !EU_MEMBERS.includes(String(formFields.citizenship))
      ) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.visaNumber]: true,
        };
      }

      break;
    }
    case COUNTRY_CODES.colombia: {
      fields = {
        ...fields,
        [FORM_NAMES.secondSurname]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.arrivalCountry]: true,
        [FORM_NAMES.nextDestinationCountry]: true,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceCountry]: false,
      };

      if (formFields?.arrivalCountry === COUNTRY_CODES.colombia) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.arrivalDistrict]: true,
          [FORM_NAMES.arrivalMunicipality]: true,
        };
      }

      if (formFields?.nextDestinationCountry === COUNTRY_CODES.colombia) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.nextDestinationDistrict]: true,
          [FORM_NAMES.nextDestinationMunicipality]: true,
        };
      }

      break;
    }
    case COUNTRY_CODES.romania: {
      fields = {
        ...fields,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.cityOfBirth]: true,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.purposeOfStay]: true,
      };

      break;
    }
    case COUNTRY_CODES.thailand: {
      fields = {
        ...fields,
        [FORM_NAMES.terms]: true,
        [FORM_NAMES.residenceCountry]: false,
      };

      if (isGuestLeader) {
        fields = {
          ...fields,
          [FORM_NAMES.email]: true,
          [FORM_NAMES.phone]: true,
        };
      }
      fields = {
        ...fields,
        [FORM_NAMES.email]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.phone]: DISPLAY_FIELD_TYPES.optional,
      };

      break;
    }
    case COUNTRY_CODES.greece: {
      fields = {
        ...fields,
        [FORM_NAMES.countryOfIssue]: true,
        [FORM_NAMES.email]: true,
        [FORM_NAMES.docDateOfIssue]: true,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.residencePostalCode]: true,
        [FORM_NAMES.cityOfIssue]: formFields?.countryOfIssue === COUNTRY_CODES.greece,
      };

      break;
    }
    case COUNTRY_CODES.slovenia: {
      fields = {
        ...fields,
        [FORM_NAMES.residenceCountry]: false,
        [FORM_NAMES.taxExemption]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.fullTouristTax]: true,
      };

      break;
    }
    case COUNTRY_CODES.croatia: {
      fields = {
        ...fields,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.cityOfBirth]: DISPLAY_FIELD_TYPES.optional,
        [FORM_NAMES.citizenship]: true,
        [FORM_NAMES.nationality]: false,
        [FORM_NAMES.email]: false,
      };

      break;
    }
    default: {
    }
  }

  if (isCustomForm) {
    if (requireIdOrPassport) {
      extraFields = {
        ...extraFields,
        [FORM_NAMES.docType]: true,
        [FORM_NAMES.docNumber]: true,
      };
    }

    return extraFields;
  }

  return {...fields, ...extraFields};
}

function getFields(data: FieldsDataTypes = {}) {
  const display = getDisplayFields(data);
  const required = getRequiredFields(data);

  return {display, required};
}

export {
  DISPLAY_FIELD_TYPES,
  FORM_NAMES,
  getFields,
  getIsCountryOfIssueRequired,
  getIsDocDateOfIssueRequired,
  getIsDocTypeRequired,
  FORM_FIELDS_LABELS,
  FIELD_TYPES,
  FORM_FIELDS_TYPES,
  FORM_FIELDS_PLACEHOLDERS,
};
