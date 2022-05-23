import React from 'react';
import useSWR from 'swr';
import {useHistory, useLocation} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import {isBefore} from 'date-fns';
import {Controller, useFormContext} from 'react-hook-form';
import i18n from '../../i18n';
import api, {getURL} from '../../api';
import {useReservation} from '../../context/reservation';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {Reservation, SelectOptionType} from '../../utils/types';
import {AliceReport} from '../AliceOnboardingForm/AliceOnboardingForm';
import {useErrorModal, useIsMounted, usePrevious} from '../../utils/hooks';
import {
  getHasGuestLeader,
  getHousingCountryCode,
  getIsCaptureStatFieldsEnabled,
  getStatTypeIfStatActive,
  getHasAnyPoliceCompleteGuest,
  getIsContractEnabled,
  getHousingManagerOrigin,
} from '../../utils/reservation';
import documents, {
  checkIsDocTypeWithDuplexScan,
  getDocTypes,
  getShouldResetDocTypes,
} from '../../utils/docTypes';
import {
  COUNTRIES_WITH_PURPOSES_OF_STAY,
  COUNTRY_CODES,
  EU_MEMBERS,
  GENDERS_OPTIONS,
  GROUP_TYPES,
  ORIGINS,
  PATTERNS,
  STAT_TYPES,
  STAT_TYPES_WITH_TAX_EXEMPTIONS,
} from '../../utils/constants';
import {getFinishCheckinHistoryArgs} from '../../utils/checkin';
import {useRegisterGuest} from '../../hooks/useRegisterGuest';
import {getCurrentLocale} from '../../utils/common';
import dataIncompleteIcon from '../../assets/data-incomplete-icon.svg';
import likeIcon from '../../assets/like.svg';
import termsIcon from '../../assets/terms-icon.svg';
import userIcon from '../../assets/user.svg';
import Input from '../Input';
import Select from '../Select';
import AsyncSelect from '../AsyncSelect';
import Datepicker from '../Datepicker';
import SubmitButton from '../SubmitButton';
import Modal from '../Modal';
import Button from '../Button';
import Checkbox from '../Checkbox';
import FileInput from '../FileInput';
import TimePicker from '../TimePicker';
import PhoneInput from '../PhoneInput';
import {FormFieldWrapper} from '../../styled/common';
import {
  CheckboxWrapper,
  Form,
  IncompleteDataModalButtonIcon,
  IncompleteDataModalButtonWrapper,
  ModalButtonWrapper,
  SubmitButtonWrapper,
  TermsLink,
  Fields,
  InvalidFileTypeError,
} from './styled';

const maxNamesInputLength = 30;
const acceptableDocuments = '.jpg, .png, .pdf, .jpeg';
const validTypes = ['image/jpeg', 'application/pdf', 'image/png'];

enum LockVendors {
  salto = 's',
}

enum FieldTypes {
  text = 'TEXT',
  date = 'DATE',
  file = 'FILE',
  time = 'TIME',
  select = 'SELECT',
  phone = 'PHONE',
}

type LocationType = {
  country: {
    code: string;
    name: string;
  };
};
function getLocationsAsOptions(data: {results: Array<LocationType>}) {
  const results = data?.results;

  if (!results) {
    return [];
  }

  return results.map(l => {
    return {
      value: l?.country?.code,
      label: l?.country?.name,
    };
  });
}

type PurposeOfStayType = {
  id: string;
  name: string;
};
function getPurposesOfStayAsOptions(data: Array<PurposeOfStayType>) {
  if (!data) {
    return [];
  }
  return data.map(p => {
    return {
      value: p.id,
      label: p.name,
    };
  });
}

type DistrictType = {
  country: {
    code: string;
    name: string;
  };
  division_level_1: {
    code: string;
    name: string;
    type: string;
  };
};
function getDistrictsAsOptions(data: {results: Array<DistrictType>}) {
  const districts = data?.results;

  if (!districts) {
    return [];
  }
  return districts.map(d => {
    return {
      value: d?.division_level_1?.code,
      label: d?.division_level_1?.name,
    };
  });
}

type MunicipalityType = {
  country: {
    code: string;
    name: string;
  };
  division_level_1: {
    code: string;
    name: string;
    type: string;
  };
  division_level_2: {
    code: string;
    name: string;
    type: string;
  };
};
function getMunicipalitiesAsOptions(data: {results: Array<MunicipalityType>}) {
  const municipalities = data?.results;

  if (!municipalities) {
    return [];
  }
  return municipalities.map(m => {
    return {
      value: m?.division_level_2?.code,
      label: m?.division_level_2?.name,
    };
  });
}

type CityType = {
  country: {
    code: string;
    name: string;
  };
  division_level_1: {
    code: string;
    name: string;
    type: string;
  };
  division_level_2: {
    code: string;
    name: string;
    type: string;
  };
  division_level_3: {
    code: string;
    name: string;
    type: string;
  };
};
function getCitiesAsOptions(data: {results: Array<CityType>}) {
  const results = data?.results;

  if (!results) {
    return [];
  }
  return results.map(l => {
    return {
      value: l?.division_level_3?.code,
      label: l?.division_level_3?.name,
    };
  });
}

type TaxExemptionType = {
  name: string;
  id: string;
  stat_type: string;
};
function getTaxExemptionsAsOptions(data: Array<TaxExemptionType>) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map(t => {
    return {
      value: t.id,
      label: t.name,
    };
  });
}

type ProvincesType = {
  results: [
    {
      division_level_2: {
        code: string;
        name: string;
        type: string;
      };
    },
  ];
};
function getProvincesAsOptions(provinces: ProvincesType) {
  if (!provinces?.results) {
    return [];
  }

  return provinces?.results?.map(c => {
    return {
      label: c?.division_level_2?.name,
      value: c?.division_level_2?.code,
    };
  });
}

export const getBestMatches = (
  arr: Array<{label: string; value: string}>,
  inputValue: string,
) => {
  return arr
    .filter((x: {label: string; value: string}) =>
      x.label.toLowerCase().includes(inputValue.toLowerCase()),
    )
    .slice(0, 50)
    .sort((wo, yo) => {
      const w = wo.label.toLowerCase();
      const y = yo.label.toLowerCase();
      if (w.startsWith(inputValue) && y.startsWith(inputValue)) {
        return w > y ? 1 : -1;
      }
      if (w.startsWith(inputValue)) {
        return -1;
      }
      if (y.startsWith(inputValue)) {
        return 1;
      }
      return w > y ? 1 : -1;
    });
};

function validateDocTypes(number = '', type: string | number) {
  if (type === documents.types.drivingLicenseES) {
    if (PATTERNS.nie.test(number)) {
      return validateNIE(number);
    }
  }

  return validateDNI(number);
}

function validateDNI(number: string) {
  const DNI_STRING = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const DNI_DIVISION_NUMBER = 23;

  if (!PATTERNS.dniAndDl.test(number)) {
    return i18n.t('doc_number_dni_format_error');
  }

  const extractedNumbers = Number(number.slice(0, -1));
  const extractedChar = number.substr(number.length - 1).toUpperCase();
  const expectedChar = DNI_STRING[extractedNumbers % DNI_DIVISION_NUMBER];

  if (expectedChar !== extractedChar) {
    return i18n.t('doc_number_dni_letter_error');
  }

  return true;
}

function validateNIE(number = '') {
  const NIE_STRING = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const NIE_DIVISION_NUMBER = 23;
  const firstLetterValue: {[key: string]: string} = {
    X: '0',
    Y: '1',
    Z: '2',
  };

  if (!PATTERNS.nie.test(number)) {
    return i18n.t('doc_number_nie_format_error');
  }

  const withoutLetters = number.slice(1, -1);
  const lastSymbol = number[number.length - 1].toUpperCase();
  const firstLetter: string = number[0].toUpperCase();
  const replacedFirstLetter = firstLetterValue[firstLetter];

  if (replacedFirstLetter === undefined) {
    return i18n.t('doc_number_nie_letter_error');
  }

  const numberWithReplacedFirstLetter = Number(replacedFirstLetter + withoutLetters);
  const expectedChar = NIE_STRING[numberWithReplacedFirstLetter % NIE_DIVISION_NUMBER];

  if (lastSymbol !== expectedChar) {
    return i18n.t('doc_number_nie_letter_error');
  }

  return true;
}

function validateDocNumber(number = '', docType: SelectOptionType | null) {
  const type = docType?.value;

  if (type && documents.dniValidation.includes(String(type))) {
    return validateDocTypes(number, type);
  }

  if (type && documents.nieValidation.includes(String(type))) {
    return validateNIE(number);
  }

  return true;
}

function getIsBirthDateBeforeIssueDate(birthDate: Date, issueDate: Date) {
  if (birthDate && issueDate) {
    return isBefore(new Date(birthDate), new Date(issueDate));
  }
  return true;
}

function getIsDateBeforeToday(date: Date) {
  const today = new Date(new Date().toDateString());
  return isBefore(new Date(date), today);
}

function validateBirthDate(birthDate: Date, issueDate: Date) {
  let error = '';
  const isBeforeIssueDate = getIsBirthDateBeforeIssueDate(birthDate, issueDate);
  const isBeforeToday = getIsDateBeforeToday(birthDate);

  if (!isBeforeIssueDate) {
    error = i18n.t('cant_be_equal_or_after_than_issue_date');
  }
  if (!isBeforeToday) {
    error += ` ${i18n.t('cant_be_equal_or_greater_than_today')}`;
  }

  return error || true;
}

function validateIssueDate(issueDate: Date, birthDate: Date) {
  let error = '';
  if (issueDate) {
    const isBeforeIssueDate = getIsBirthDateBeforeIssueDate(birthDate, issueDate);
    const isBeforeToday = getIsDateBeforeToday(issueDate);

    if (!isBeforeIssueDate) {
      error = i18n.t('cant_be_equal_or_smaller_than_birth_date');
    }
    if (!isBeforeToday) {
      error += ` ${i18n.t('cant_be_equal_or_greater_than_today')}`;
    }
  }

  return error || true;
}

function fetchPurposesOfStayIfRequired(reservation: Reservation) {
  const countryCode = getHousingCountryCode(reservation);
  const isAddingGuestLeader = !getHasGuestLeader(reservation);

  if (
    (countryCode === COUNTRY_CODES.czech && isAddingGuestLeader) ||
    COUNTRIES_WITH_PURPOSES_OF_STAY.includes(countryCode)
  ) {
    return getURL(api.purposesOfStay.ENDPOINTS.get(`country=${countryCode}`));
  }
  return null;
}

function fetchProvincesIfRequired(reservation: Reservation) {
  const countryCode = getHousingCountryCode(reservation);
  const isCaptureStatFieldsEnabled = getIsCaptureStatFieldsEnabled(reservation);

  if (countryCode === COUNTRY_CODES.spain && isCaptureStatFieldsEnabled) {
    return getURL(api.locations.ENDPOINTS.get(`country=${countryCode}&ordering=name`));
  }
  return null;
}

function fetchDistrictsIfRequired(reservation: Reservation) {
  const countryCode = getHousingCountryCode(reservation);

  if (countryCode === COUNTRY_CODES.colombia) {
    return getURL(
      api.locations.ENDPOINTS.get(
        `country=${countryCode}&division_level=1&ordering=name`,
      ),
    );
  }
  return null;
}

function fetchMunicipalitiesIfRequired(
  reservation: Reservation,
  district: string | number = '',
) {
  const countryCode = getHousingCountryCode(reservation);

  if (countryCode === COUNTRY_CODES.colombia) {
    return getURL(
      api.locations.ENDPOINTS.get(
        `country=${countryCode}&division_level=2&department=${district}&ordering=name`,
      ),
    );
  }
  return null;
}

function fetchCitiesIfRequired(reservation: Reservation) {
  const countryCode = getHousingCountryCode(reservation);

  if (countryCode === COUNTRY_CODES.italy) {
    return getURL(
      api.locations.ENDPOINTS.get(
        `country=${countryCode}&division_level=3&ordering=name`,
      ),
    );
  }
  return null;
}

function fetchTaxExemptionsIfRequired(reservation: Reservation) {
  const countryCode = getHousingCountryCode(reservation);
  const statType = getStatTypeIfStatActive(reservation);

  if (
    countryCode === COUNTRY_CODES.slovenia ||
    (countryCode === COUNTRY_CODES.italy &&
      STAT_TYPES_WITH_TAX_EXEMPTIONS.includes(statType))
  ) {
    return getURL(api.statTaxExemptions.ENDPOINTS.get(statType));
  }
  return null;
}

function fetchCustomFormIfRequired(customFormId: string, userId = '') {
  if (!customFormId) {
    return null;
  }

  return getURL(
    api.guestForms.ENDPOINTS.customFormById(customFormId, `user_id=${userId}`),
  );
}

function getNamePattern(countryOfPropertie?: string) {
  if (countryOfPropertie === COUNTRY_CODES.italy) {
    return PATTERNS.nameForItaly;
  }

  return PATTERNS.name;
}

function countRows(fieldsNumber?: number) {
  if (!fieldsNumber) {
    return 1;
  }

  return Math.ceil(fieldsNumber / 2);
}

type CustomField = {
  field_type: FieldTypes;
  id: string;
  is_custom: boolean;
  is_required: boolean;
  name: string;
  names: {[key: string]: string}[];
  placeholders: {[key: string]: string}[];
};

type CustomForm = {
  country: string;
  fields_set: {
    form_id: string;
    id: string;
    order: number;
    is_required: boolean;
    is_leaders_field: boolean;
    field: CustomField;
  }[];
  housings: string[];
  id: string;
  name: string;
};

function getCustomFieldData(field: CustomField) {
  const language = getCurrentLocale().toUpperCase();
  const defaultLabel = Object.values(field.names?.[0])?.[0] || '';
  const localeLabel = field.names.find(name => {
    return name[language];
  })?.[language];
  const defaultPlaceholder = field.placeholders?.length
    ? Object.values(field.placeholders?.[0])?.[0]
    : '';
  const localePlaceholder = field?.placeholders?.length
    ? field?.placeholders?.find(placeholder => {
        return placeholder[language];
      })?.[language]
    : '';

  const label = localeLabel || defaultLabel;
  const placeholder = localePlaceholder || defaultPlaceholder;
  const name = field.name;

  return {label, placeholder, name};
}

export enum FORM_NAMES {
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
  fiscalCode = 'fiscalCode',
  email = 'email',
  phone = 'phone',
}

type FormTypes = {
  [FORM_NAMES.name]: string;
  [FORM_NAMES.surname]: string;
  [FORM_NAMES.secondSurname]: string;
  [FORM_NAMES.sex]: SelectOptionType;
  [FORM_NAMES.birthDate]: Date;
  [FORM_NAMES.nationality]: SelectOptionType;
  [FORM_NAMES.docType]: SelectOptionType;
  [FORM_NAMES.docNumber]: string;
  [FORM_NAMES.docDateOfIssue]: Date;
  [FORM_NAMES.birthCountry]: SelectOptionType;
  [FORM_NAMES.residenceCountry]: SelectOptionType;
  [FORM_NAMES.residenceCity]: string;
  [FORM_NAMES.countryOfIssue]: SelectOptionType;
  [FORM_NAMES.cityOfBirth]: string;
  [FORM_NAMES.cityOfIssue]: string;
  [FORM_NAMES.residenceAddress]: string;
  [FORM_NAMES.nextDestinationCountry]: SelectOptionType;
  [FORM_NAMES.nextDestinationCity]: string;
  [FORM_NAMES.nextDestinationAddress]: string;
  [FORM_NAMES.residencePostalCode]: string;
  [FORM_NAMES.citizenship]: SelectOptionType;
  [FORM_NAMES.purposeOfStay]: SelectOptionType;
  [FORM_NAMES.visaNumber]: string;
  [FORM_NAMES.arrivalCountry]: SelectOptionType;
  [FORM_NAMES.arrivalDistrict]: SelectOptionType;
  [FORM_NAMES.arrivalMunicipality]: SelectOptionType;
  [FORM_NAMES.nextDestinationDistrict]: SelectOptionType;
  [FORM_NAMES.nextDestinationMunicipality]: SelectOptionType;
  [FORM_NAMES.taxExemption]: SelectOptionType;
  [FORM_NAMES.residenceProvince]: SelectOptionType;
  [FORM_NAMES.fiscalCode]: string;
  [FORM_NAMES.phone]: string;
  [FORM_NAMES.email]?: string;
  [FORM_NAMES.fiscalCode]: string;
  [key: string]: any;
};

type RequiredFields = {
  [key: string]: string | boolean;
};

type FormFieldsTypes = {
  [FORM_NAMES.birthCountry]: string | number;
  [FORM_NAMES.countryOfIssue]: string | number;
  [FORM_NAMES.citizenship]: string | number;
  [FORM_NAMES.arrivalCountry]: string | number;
  [FORM_NAMES.nextDestinationCountry]: string | number;
  [FORM_NAMES.docType]: string | number;
  [FORM_NAMES.residenceCountry]: string | number;
};

type FieldsDataTypes = {
  reservation: Reservation;
  isSaltoLock: boolean;
  nationalityCode?: string | number;
  residenceCountry?: string | number;
  isCustomForm: boolean;
  isPoliceActivated: boolean;
  formFields?: FormFieldsTypes;
  isVerifyOnlyDocument?: boolean;
  isBiomatchForAllGuests?: boolean;
  docType?: string | number;
};

const DefaultRequiredLabel = i18n.t('required') as string;

const INIT_REQUIRED_FIELDS: RequiredFields = {
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
  [FORM_NAMES.phone]: false,
  [FORM_NAMES.fiscalCode]: DefaultRequiredLabel,
};

function getRequiredFieldsByCountry({
  isPoliceActivated,
  residenceCountry,
  nationalityCode,
  reservation,
  isSaltoLock,
  docType,
}: FieldsDataTypes) {
  const countryCode = getHousingCountryCode(reservation);
  const isContractEnabled = reservation?.housing?.is_contract_enabled;
  const guestGroupType = reservation?.guest_group?.type;
  const isAddingGuestLeader = !getHasGuestLeader(reservation);

  switch (countryCode) {
    case COUNTRY_CODES.uk: {
      let fields: RequiredFields = {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.nextDestinationAddress]: false,
        [FORM_NAMES.phone]: Boolean(isSaltoLock) ? DefaultRequiredLabel : false,
      };

      if (nationalityCode === COUNTRY_CODES.uk) {
        fields = {
          ...fields,
          [FORM_NAMES.docNumber]: false,
          [FORM_NAMES.docType]: false,
        };
      }
      return fields;
    }
    case COUNTRY_CODES.belgium: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.residenceAddress]: false,
        [FORM_NAMES.residenceCity]: false,
      };
    }
    case COUNTRY_CODES.france: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.cityOfBirth]: false,
      };
    }
    case COUNTRY_CODES.germany: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.phone]: Boolean(isSaltoLock) ? DefaultRequiredLabel : false,
      };
    }
    case COUNTRY_CODES.portugal: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.birthCountry]: false,
      };
    }
    case COUNTRY_CODES.colombia: {
      return {
        ...INIT_REQUIRED_FIELDS,
      };
    }
    case COUNTRY_CODES.spain: {
      if (isPoliceActivated && nationalityCode === COUNTRY_CODES.spain) {
        return {
          ...INIT_REQUIRED_FIELDS,
          [FORM_NAMES.secondSurname]: DefaultRequiredLabel,
        };
      }
      return INIT_REQUIRED_FIELDS;
    }
    case COUNTRY_CODES.italy: {
      if (isContractEnabled) {
        return {
          ...INIT_REQUIRED_FIELDS,
          [FORM_NAMES.phone]: Boolean(isSaltoLock) ? DefaultRequiredLabel : false,
        };
      }
      return INIT_REQUIRED_FIELDS;
    }
    case COUNTRY_CODES.greece: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.cityOfIssue]: false,
        [FORM_NAMES.email]: DefaultRequiredLabel,
        [FORM_NAMES.phone]: DefaultRequiredLabel,
      };
    }
    case COUNTRY_CODES.thailand: {
      if (isAddingGuestLeader) {
        return {
          ...INIT_REQUIRED_FIELDS,
          [FORM_NAMES.email]: DefaultRequiredLabel,
          [FORM_NAMES.phone]: DefaultRequiredLabel,
        };
      }

      return {
        ...INIT_REQUIRED_FIELDS,
      };
    }

    case COUNTRY_CODES.austria: {
      let fields = {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.email]: false,
        [FORM_NAMES.phone]: Boolean(isSaltoLock) ? DefaultRequiredLabel : false,
        [FORM_NAMES.docType]:
          residenceCountry === COUNTRY_CODES.austria ? false : DefaultRequiredLabel,
        [FORM_NAMES.docNumber]:
          residenceCountry === COUNTRY_CODES.austria && !docType
            ? false
            : DefaultRequiredLabel,
        [FORM_NAMES.docDateOfIssue]:
          residenceCountry === COUNTRY_CODES.austria ? false : DefaultRequiredLabel,
        [FORM_NAMES.countryOfIssue]:
          residenceCountry === COUNTRY_CODES.austria ? false : DefaultRequiredLabel,
        [FORM_NAMES.residencePostalCode]: [
          COUNTRY_CODES.austria,
          COUNTRY_CODES.germany,
        ].includes(residenceCountry as string)
          ? DefaultRequiredLabel
          : false,
      };

      if (guestGroupType === GROUP_TYPES.family) {
        if (!isAddingGuestLeader) {
          return {
            ...fields,
            [FORM_NAMES.docType]: false,
            [FORM_NAMES.docNumber]: docType ? DefaultRequiredLabel : false,
            [FORM_NAMES.residenceCity]: false,
            [FORM_NAMES.residenceAddress]: false,
          };
        } else {
          return {
            ...fields,
            [FORM_NAMES.docType]:
              residenceCountry === COUNTRY_CODES.austria ? false : DefaultRequiredLabel,
            [FORM_NAMES.docNumber]:
              residenceCountry === COUNTRY_CODES.austria && !docType
                ? false
                : DefaultRequiredLabel,
            [FORM_NAMES.docDateOfIssue]:
              residenceCountry === COUNTRY_CODES.austria ? false : DefaultRequiredLabel,
            [FORM_NAMES.countryOfIssue]:
              residenceCountry === COUNTRY_CODES.austria ? false : DefaultRequiredLabel,
          };
        }
      }

      return fields;
    }
    case COUNTRY_CODES.croatia: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.residenceAddress]: false,
        [FORM_NAMES.cityOfBirth]: false,
      };
    }
    default: {
      return INIT_REQUIRED_FIELDS;
    }
  }
}

function getRequiredFieldsByOrigin(reservation: Reservation): RequiredFields {
  const origin = getHousingManagerOrigin(reservation);
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

function getRequiredFields(reservationAndFieldsData: FieldsDataTypes) {
  const requiredFieldsByCountry = getRequiredFieldsByCountry(reservationAndFieldsData);
  const requiredFieldsByHousingOrigin = getRequiredFieldsByOrigin(
    reservationAndFieldsData.reservation,
  );
  return {...requiredFieldsByCountry, ...requiredFieldsByHousingOrigin};
}

const INIT_DISPLAY_FIELDS = {
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
  [FORM_NAMES.email]: true,
  [FORM_NAMES.docDateOfIssue]: false,
  [FORM_NAMES.secondSurname]: false,
  [FORM_NAMES.birthCountry]: false,
  [FORM_NAMES.residenceCity]: false,
  [FORM_NAMES.residenceAddress]: false,
  [FORM_NAMES.countryOfIssue]: false,
  [FORM_NAMES.cityOfBirth]: false,
  [FORM_NAMES.cityOfIssue]: false,
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
  [FORM_NAMES.phone]: true,
  [FORM_NAMES.fiscalCode]: false,
};

function getDisplayFields({
  nationalityCode,
  reservation,
  formFields,
  isVerifyOnlyDocument,
  isBiomatchForAllGuests,
  isCustomForm = false,
}: FieldsDataTypes) {
  const housingCountryCode = getHousingCountryCode(reservation);
  const isAddingGuestLeader = !getHasGuestLeader(reservation);
  const hasAnyPoliceCompleteGuest = getHasAnyPoliceCompleteGuest(reservation);
  const guestGroupType = reservation?.guest_group?.type;
  const isContractEnabled = getIsContractEnabled(reservation);

  let fields = {
    ...INIT_DISPLAY_FIELDS,
  };
  let extraFields: Partial<Record<FORM_NAMES, boolean>> = {};

  if (isVerifyOnlyDocument && isBiomatchForAllGuests) {
    extraFields = {
      ...extraFields,
      [FORM_NAMES.docType]: true,
    };
  }

  switch (housingCountryCode) {
    case COUNTRY_CODES.spain: {
      const isCaptureStatFieldsEnabled = getIsCaptureStatFieldsEnabled(reservation);
      fields = {
        ...fields,
        [FORM_NAMES.secondSurname]: true,
        [FORM_NAMES.residenceCountry]: false,
        [FORM_NAMES.docDateOfIssue]: true,
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
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.countryOfIssue]: true,
        [FORM_NAMES.sex]: false,
      };

      break;
    }
    case COUNTRY_CODES.italy: {
      const statType = getStatTypeIfStatActive(reservation);
      fields = {
        ...fields,
        [FORM_NAMES.terms]: true,
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.residenceCountry]: false,
        [FORM_NAMES.docType]: false,
        [FORM_NAMES.docNumber]: false,
        [FORM_NAMES.countryOfIssue]: false,
      };

      if (isContractEnabled && isAddingGuestLeader) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.residenceCountry]: true,
          [FORM_NAMES.residenceCity]: true,
          [FORM_NAMES.residenceAddress]: true,
          [FORM_NAMES.residencePostalCode]: true,
          [FORM_NAMES.terms]: false,
        };

        if (nationalityCode === COUNTRY_CODES.italy) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.fiscalCode]: true,
          };
        }
      }

      if (statType) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.residenceCountry]: true,
        };

        if (formFields?.residenceCountry === COUNTRY_CODES.italy) {
          extraFields = {
            ...extraFields,
            [FORM_NAMES.italianResidenceCity]: true,
            [FORM_NAMES.residenceCity]: false,
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

      if (isAddingGuestLeader || hasAnyPoliceCompleteGuest) {
        if (isAddingGuestLeader) {
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

      break;
    }
    case COUNTRY_CODES.uae: {
      if (isContractEnabled && isAddingGuestLeader) {
        fields = {
          ...fields,
          [FORM_NAMES.terms]: false,
          [FORM_NAMES.sex]: false,
          [FORM_NAMES.residenceCountry]: false,
        };

        break;
      }

      fields = {
        ...fields,
        [FORM_NAMES.terms]: true,
        [FORM_NAMES.sex]: false,
        [FORM_NAMES.residenceCountry]: false,
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
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.residencePostalCode]: true,
        [FORM_NAMES.countryOfIssue]: true,
        [FORM_NAMES.docDateOfIssue]: true,
        [FORM_NAMES.email]: true,
      };

      if (guestGroupType === GROUP_TYPES.family && !isAddingGuestLeader) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.sex]: false,
          [FORM_NAMES.nationality]: false,
          [FORM_NAMES.docDateOfIssue]: false,
          [FORM_NAMES.countryOfIssue]: false,
          [FORM_NAMES.residenceAddress]: false,
          [FORM_NAMES.terms]: true,
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

      if (isAddingGuestLeader) {
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
        [FORM_NAMES.secondSurname]: true,
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
          [FORM_NAMES.arrivalDistrict]: true,
          [FORM_NAMES.arrivalMunicipality]: true,
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

      if (isAddingGuestLeader) {
        fields = {
          ...fields,
        };
      }

      if (isContractEnabled && isAddingGuestLeader) {
        fields = {
          ...fields,
          [FORM_NAMES.terms]: false,
        };
      }

      break;
    }
    case COUNTRY_CODES.greece: {
      fields = {
        ...fields,
        [FORM_NAMES.countryOfIssue]: true,
        [FORM_NAMES.docDateOfIssue]: true,
        [FORM_NAMES.residencePostalCode]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.residenceCity]: true,
      };

      if (!isAddingGuestLeader) {
        fields = {
          ...fields,
          [FORM_NAMES.terms]: true,
        };
      }

      if (formFields?.countryOfIssue === COUNTRY_CODES.greece) {
        extraFields = {
          ...extraFields,
          [FORM_NAMES.cityOfIssue]: true,
        };
      }

      break;
    }
    case COUNTRY_CODES.croatia: {
      fields = {
        ...fields,
        [FORM_NAMES.residenceCity]: true,
        [FORM_NAMES.residenceAddress]: true,
        [FORM_NAMES.birthCountry]: true,
        [FORM_NAMES.cityOfBirth]: true,
        [FORM_NAMES.citizenship]: true,
        [FORM_NAMES.terms]: true,
        [FORM_NAMES.nationality]: false,
        [FORM_NAMES.email]: false,
      };

      if (isContractEnabled && isAddingGuestLeader) {
        fields = {
          ...fields,
          [FORM_NAMES.terms]: false,
        };
      }

      break;
    }
    default: {
    }
  }

  if (isCustomForm) {
    return extraFields;
  }

  return {...fields, ...extraFields};
}

function getFields(data: FieldsDataTypes) {
  const display = getDisplayFields(data);
  const required: RequiredFields = getRequiredFields(data);

  return {display, required};
}

type LocationState = {
  number_of_guests: number;
  formData?: any;
  children?: number;
  areTermsAccepted?: boolean;
  highlightFormFields?: boolean;
  ocrWasUsed?: boolean;
  aliceReport?: AliceReport;
  biomatch?: {
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
};

type AddPersonalDataFormProps = {
  setIsBackButtonHidden: (isHidden: boolean) => void;
  setAreTermsAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  areTermsAccepted: boolean;
};

function AddPersonalDataForm({
  setIsBackButtonHidden,
  setAreTermsAccepted,
  areTermsAccepted,
}: AddPersonalDataFormProps) {
  const {t, i18n} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const isMounted = useIsMounted();
  const registerGuest = useRegisterGuest();
  const {ErrorModal, displayError, closeErrorModal} = useErrorModal();
  const {
    isDubaiReservation,
    isThailandReservation,
    hasGuestMembers,
    shortCustomForm,
    hasScanDocument,
    isVerifyDocumentAndSelfie,
    isVerifyOnlyDocument,
    isBiomatchForAllGuests,
    isPoliceActivated,
    ...reservationDetails
  } = useComputedReservationDetails();
  const {data: reservation, patchReservation, refreshReservation} = useReservation();
  const {
    handleSubmit,
    register,
    triggerValidation,
    setValue,
    formState,
    errors,
    watch,
    getValues,
    setError,
    control,
    reset,
  } = useFormContext<FormTypes>();
  const prevFormState = usePrevious<{isSubmitted: boolean; isValid: boolean}>(formState);
  const [phoneInvalidAsyncError, setPhoneAsyncError] = React.useState('');
  const sex = watch(FORM_NAMES.sex)?.value as string;
  const docType = watch(FORM_NAMES.docType)?.value as string;
  const birthDate = watch(FORM_NAMES.birthDate);
  const docDateOfIssue = watch(FORM_NAMES.docDateOfIssue);
  const birthCountry = watch(FORM_NAMES.birthCountry)?.value as string;
  const countryOfIssue = watch(FORM_NAMES.countryOfIssue)?.value as string;
  const nationality = watch(FORM_NAMES.nationality)?.value as string;
  const citizenship = watch(FORM_NAMES.citizenship)?.value as string;
  const arrivalCountry = watch(FORM_NAMES.arrivalCountry)?.value as string;
  const nextDestinationCountry = watch(FORM_NAMES.nextDestinationCountry)
    ?.value as string;
  const arrivalMunicipality = watch(FORM_NAMES.arrivalMunicipality)?.value;
  const arrivalDistrict = watch(FORM_NAMES.arrivalDistrict)?.value;
  const nextDestinationMunicipality = watch(FORM_NAMES.nextDestinationMunicipality)
    ?.value;
  const residenceCountry = watch(FORM_NAMES.residenceCountry)?.value as string;

  const hasReservationId = Boolean(reservation.id);
  const {data: locks} = useSWR(
    hasReservationId
      ? getURL(api.locks.ENDPOINTS.get(`unlock_links__reservation_id=${reservation.id}`))
      : null,
  );
  const isSaltoLock = Boolean(
    locks?.some((lock: any) => lock.vendor === LockVendors.salto),
  );

  const [isInvalidFileType, setIsInvalidFileType] = React.useState(false);

  const [fields, setFields] = React.useState(() => {
    return getFields({
      reservation,
      isSaltoLock,
      docType,
      residenceCountry,
      isPoliceActivated,
      isVerifyOnlyDocument,
      isBiomatchForAllGuests,
      nationalityCode: nationality,
      isCustomForm: false,
      formFields: {
        [FORM_NAMES.birthCountry]: birthCountry,
        [FORM_NAMES.countryOfIssue]: countryOfIssue,
        [FORM_NAMES.citizenship]: citizenship,
        [FORM_NAMES.arrivalCountry]: arrivalCountry,
        [FORM_NAMES.nextDestinationCountry]: nextDestinationCountry,
        [FORM_NAMES.residenceCountry]: residenceCountry,
        [FORM_NAMES.docType]: docType,
      },
    });
  });
  const [docTypes, setDocTypes] = React.useState(() => {
    return getDocTypes(reservation, nationality, {residenceCountry});
  });

  const {data: locations, mutate: revalidateLocations} = useSWR(
    getURL(api.locations.ENDPOINTS.get('ordering=name')),
  );
  const locationsAsOptions = React.useMemo(() => {
    return getLocationsAsOptions(locations);
  }, [locations]);
  const {data: districts} = useSWR(fetchDistrictsIfRequired(reservation));
  const {data: arrivalMunicipalities} = useSWR(
    fetchMunicipalitiesIfRequired(reservation, arrivalDistrict),
  );
  const {data: taxExemptions} = useSWR(fetchTaxExemptionsIfRequired(reservation));
  const {data: provinces} = useSWR(fetchProvincesIfRequired(reservation));
  const provincesAsOptions = React.useMemo(() => {
    return getProvincesAsOptions(provinces);
  }, [provinces]);
  const taxExemptionsAsOptions = React.useMemo(() => {
    return getTaxExemptionsAsOptions(taxExemptions);
  }, [taxExemptions]);
  const prevArrivalMunicipalities = usePrevious(arrivalMunicipalities);
  const arrivalMunicipalitiesAsOptions = React.useMemo(() => {
    return getMunicipalitiesAsOptions(arrivalMunicipalities);
  }, [arrivalMunicipalities]);
  const nextDestinationDistrict = watch(FORM_NAMES.nextDestinationDistrict)?.value;
  const {data: nextDestinationMunicipalities} = useSWR(
    fetchMunicipalitiesIfRequired(reservation, nextDestinationDistrict),
  );
  const prevNextDestinationMunicipalities = usePrevious(nextDestinationMunicipalities);
  const nextDestinationMunicipalitiesAsOptions = React.useMemo(() => {
    return getMunicipalitiesAsOptions(nextDestinationMunicipalities);
  }, [nextDestinationMunicipalities]);
  const {data: cities} = useSWR(fetchCitiesIfRequired(reservation));
  const {data: purposesOfStay, mutate: revalidatePurposesOfStay} = useSWR(
    fetchPurposesOfStayIfRequired(reservation),
  );
  const citiesAsOptions = React.useMemo(() => {
    return getCitiesAsOptions(cities);
  }, [cities]);
  const [isDataIncompleteModalOpen, setIsDataIncompleteModalOpen] = React.useState(false);
  const [wasDataIncompleteModalOpened, setWasDataIncompleteModalOpened] = React.useState(
    false,
  );
  const [isTermsModalOpen, setIsTermsModalOpen] = React.useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = React.useState(false);

  const isGuestLeader = !getHasGuestLeader(reservation);
  const customFormId = shortCustomForm?.id || '';
  const {data: customForm, isValidating: isValidatingCustomForm} = useSWR<CustomForm>(
    fetchCustomFormIfRequired(customFormId, reservation.housing?.manager_id),
  );
  const isLoadingCustomForm = !customForm && isValidatingCustomForm;
  const hasCustomForm = Boolean(customForm?.id);

  React.useEffect(
    function handleGenderOptionsLanguage() {
      const nextGenderOption = GENDERS_OPTIONS().find(option => option.value === sex);

      setValue(FORM_NAMES.sex, nextGenderOption);
    },
    [i18n.language, sex, setValue],
  );

  React.useEffect(
    function handleLanguageChange() {
      revalidateLocations();
      revalidatePurposesOfStay();
    },
    [i18n.language, revalidateLocations, revalidatePurposesOfStay],
  );

  React.useEffect(
    function updateLanguageOfFormValues() {
      const findCountry = (fieldName: string, countryCode: string) => {
        const {country} = locations.results.find(
          ({country}: {country: {code: string}}) => {
            return country.code === countryCode;
          },
        );

        if (country) {
          const {code, name} = country;

          setValue(fieldName, {value: code, label: name});
        }
      };

      if (!locations) return;

      if (residenceCountry) {
        findCountry(FORM_NAMES.residenceCountry, residenceCountry);
      }

      if (nationality) {
        findCountry(FORM_NAMES.nationality, nationality);
      }

      if (citizenship) {
        findCountry(FORM_NAMES.citizenship, citizenship);
      }

      if (birthCountry) {
        findCountry(FORM_NAMES.birthCountry, birthCountry);
      }

      if (countryOfIssue) {
        findCountry(FORM_NAMES.countryOfIssue, countryOfIssue);
      }

      if (arrivalCountry) {
        findCountry(FORM_NAMES.arrivalCountry, arrivalCountry);
      }

      if (nextDestinationCountry) {
        findCountry(FORM_NAMES.nextDestinationCountry, nextDestinationCountry);
      }
    },
    [
      locations,
      residenceCountry,
      nationality,
      citizenship,
      birthCountry,
      countryOfIssue,
      arrivalCountry,
      nextDestinationCountry,
      setValue,
    ],
  );

  React.useEffect(
    function setDisplayFieldsOnChange() {
      const nextFields = getFields({
        reservation,
        isSaltoLock,
        docType,
        residenceCountry,
        isPoliceActivated,
        isVerifyOnlyDocument,
        isBiomatchForAllGuests,
        nationalityCode: nationality,
        isCustomForm: hasCustomForm,
        formFields: {
          [FORM_NAMES.birthCountry]: birthCountry,
          [FORM_NAMES.countryOfIssue]: countryOfIssue,
          [FORM_NAMES.citizenship]: citizenship,
          [FORM_NAMES.arrivalCountry]: arrivalCountry,
          [FORM_NAMES.nextDestinationCountry]: nextDestinationCountry,
          [FORM_NAMES.residenceCountry]: residenceCountry,
          [FORM_NAMES.docType]: docType,
        },
      });
      setFields(nextFields);

      if (formState.isSubmitted) {
        triggerValidation();
      }
    },
    [
      reservation,
      nationality,
      formState.isSubmitted,
      triggerValidation,
      birthCountry,
      countryOfIssue,
      citizenship,
      arrivalCountry,
      nextDestinationCountry,
      residenceCountry,
      docType,
      hasCustomForm,
      isSaltoLock,
      isPoliceActivated,
      isBiomatchForAllGuests,
      isVerifyOnlyDocument,
    ],
  );

  React.useEffect(
    function revalidateFormOnDisplayFieldsChange() {
      if (formState.isSubmitted) {
        triggerValidation();
      }
    },
    [triggerValidation, fields, formState.isSubmitted],
  );

  React.useEffect(
    function preloadPersistedLocationFormData() {
      const persistedState = location.state?.formData;
      if (location.state?.formData) {
        reset(persistedState);
      }
    },
    [location.state, reset],
  );

  React.useEffect(
    function highlightFieldsManually() {
      const shouldHighlight = location.state?.highlightFormFields;
      if (shouldHighlight) {
        handleSubmit(() => {})();
      }
    },
    [location.state, handleSubmit],
  );

  React.useEffect(
    function setDocTypesOnNationalityOrReservationChange() {
      const nextDocTypes = getDocTypes(reservation, nationality, {
        residenceCountry,
        citizenship,
      });
      const shouldResetDocType = getShouldResetDocTypes(
        nextDocTypes,
        getValues()[FORM_NAMES.docType],
      );

      if (shouldResetDocType) {
        setValue(FORM_NAMES.docType, undefined);
      }
      setDocTypes(nextDocTypes);
    },
    [citizenship, reservation, nationality, setValue, getValues, residenceCountry],
  );

  React.useEffect(
    function revalidateDocNumberOnDocTypeChange() {
      if (formState.isSubmitted) {
        triggerValidation(FORM_NAMES.docNumber);
      }
    },
    [docType, formState.isSubmitted, triggerValidation],
  );

  React.useEffect(
    function getDocTypesOnLanguageChange() {
      const nextDocTypes = getDocTypes(reservation, nationality, {
        residenceCountry,
        citizenship,
      });

      const nextDocValue = nextDocTypes.find(doc => doc.value === docType);

      setDocTypes(nextDocTypes);
      if (nextDocValue) {
        setValue(FORM_NAMES.docType, nextDocValue);
      }
    },
    [
      i18n.language,
      citizenship,
      residenceCountry,
      nationality,
      reservation,
      setValue,
      docType,
    ],
  );

  React.useLayoutEffect(
    function showIncompleteModalOneTime() {
      const shouldOpenModal =
        !location.state?.highlightFormFields &&
        !wasDataIncompleteModalOpened &&
        formState.isSubmitted &&
        !prevFormState?.isValid &&
        !formState.isValid;

      if (shouldOpenModal) {
        setIsDataIncompleteModalOpen(true);
        setWasDataIncompleteModalOpened(true);
      }
    },
    [
      formState.isSubmitted,
      formState.isValid,
      location.state,
      prevFormState,
      wasDataIncompleteModalOpened,
    ],
  );

  React.useEffect(
    function resetArrivalMunicipalityIfNotFoundInNewOptions() {
      const isLoadingMunicipalities =
        arrivalMunicipality &&
        prevArrivalMunicipalities &&
        !arrivalMunicipalitiesAsOptions.length;

      if (isLoadingMunicipalities) {
        return;
      }

      const hasOption = arrivalMunicipalitiesAsOptions.some(m => {
        return m.value === arrivalMunicipality;
      });

      if (!hasOption) {
        setValue(FORM_NAMES.arrivalMunicipality, undefined);
      }
    },
    [
      setValue,
      arrivalMunicipalitiesAsOptions,
      arrivalMunicipality,
      prevArrivalMunicipalities,
    ],
  );

  React.useEffect(
    function resetNextDestinationMunicipalityIfNotFoundInNewOptions() {
      const isLoadingMunicipalities =
        nextDestinationMunicipality &&
        prevNextDestinationMunicipalities &&
        !nextDestinationMunicipalitiesAsOptions.length;

      if (isLoadingMunicipalities) {
        return;
      }

      const hasOption = nextDestinationMunicipalitiesAsOptions.some(m => {
        return m.value === nextDestinationMunicipality;
      });

      if (!hasOption) {
        setValue(FORM_NAMES.nextDestinationMunicipality, undefined);
      }
    },
    [
      setValue,
      nextDestinationMunicipalitiesAsOptions,
      nextDestinationMunicipality,
      prevNextDestinationMunicipalities,
    ],
  );

  React.useEffect(
    function revalidateDateFieldsOnChange() {
      if (formState.isSubmitted) {
        triggerValidation([FORM_NAMES.birthDate, FORM_NAMES.docDateOfIssue]);
      }
    },
    [triggerValidation, formState.isSubmitted, birthDate, docDateOfIssue],
  );

  const handleFileChange = ([event]: any) => {
    if (!event) {
      return event;
    }

    const {target} = event;
    if (target?.files.length) {
      if (!validTypes.includes(target?.files[0].type)) {
        setIsInvalidFileType(true);
        return;
      }
      setIsInvalidFileType(false);
      return target.files[0];
    }
  };

  const toggleTermsCheckbox = React.useCallback(() => {
    setAreTermsAccepted(prevState => !prevState);
  }, [setAreTermsAccepted]);

  const acceptTermsAndCloseTermsModal = () => {
    setAreTermsAccepted(true);
    setIsTermsModalOpen(false);
  };

  const closeDataIncompleteModal = () => {
    setIsDataIncompleteModalOpen(false);
  };

  const getRequiredOrOptionalFieldLabel = React.useCallback(
    (label: string, required: string | boolean) => {
      if (required) {
        return label;
      }

      return `${label} (${t('optional')})`;
    },
    [t],
  );

  const getPersistedState = (data: FormTypes) => {
    return {
      ...location.state,
      customFormId,
      formData: data,
      areTermsAccepted: true,
      highlightFormFields: false,
    };
  };

  const getReservationPayload = () => {
    if (hasGuestMembers) {
      return null;
    }

    if (location.state?.children) {
      const computedNumberOfGuests =
        Number(location.state?.number_of_guests) + Number(location.state.children);
      return {
        guest_group: {
          number_of_guests: computedNumberOfGuests > 0 ? computedNumberOfGuests : 0,
        },
      };
    }

    return {
      guest_group: {
        number_of_guests: location.state?.number_of_guests,
      },
    };
  };

  const updateReservation = () => {
    const payload = getReservationPayload();
    if (payload) {
      return patchReservation(payload);
    }

    return {
      error: null,
      data: null,
    };
  };

  const finishCheckin = (registeredGuestName: string) => {
    const {url, state} = getFinishCheckinHistoryArgs({
      reservationDetails: {
        isDubaiReservation,
        isThailandReservation,
        hasGuestMembers,
        hasScanDocument,
        shortCustomForm,
        isVerifyDocumentAndSelfie,
        isPoliceActivated,
        isVerifyOnlyDocument,
        isBiomatchForAllGuests,
        ...reservationDetails,
      },
      locationState: {
        registeredGuestName,
      },
    });
    history.push(url, state);
  };

  const registerGuestAndUpdateReservation = async (data: FormTypes) => {
    closeErrorModal();
    setIsLoadingModalOpen(true);
    setIsBackButtonHidden(true);

    const {error: reservationError} = await updateReservation();
    if (!reservationError && isMounted.current) {
      const {error: guestError, data: guest} = await registerGuest({
        formData: data,
      });

      if (!guestError && isMounted.current) {
        const {error: refreshError} = await refreshReservation(() => {
          if (isMounted.current) {
            setIsLoadingModalOpen(false);
            setIsBackButtonHidden(false);
            finishCheckin(guest.full_name);
          }
        });

        if (refreshError) {
          displayError(refreshError);
        }
      } else {
        displayError(guestError);
      }
    } else {
      displayError(reservationError);
    }

    if (isMounted.current) {
      setIsLoadingModalOpen(false);
      setIsBackButtonHidden(false);
    }
  };

  async function asyncValidatePhone() {
    const number = getValues()[FORM_NAMES.phone];
    if (!number) return null;
    const phone = number.trim();

    if (!phone) return null;
    const {error} = await api.validators.validatePhoneNumber({phone});
    if (error) {
      setPhoneAsyncError(error.message);
      setError(FORM_NAMES.phone, 'manual', error.message);
      return error;
    }
  }

  const onSubmit = async (data: FormTypes) => {
    const hasErrorValidatePhone = await asyncValidatePhone();
    if (hasErrorValidatePhone) return;

    if (fields.display[FORM_NAMES.terms] && !areTermsAccepted) {
      setIsTermsModalOpen(true);
      return;
    }

    const persistedState = getPersistedState(data);
    if (hasScanDocument) {
      if (checkIsDocTypeWithDuplexScan({docType, nationality})) {
        history.push('/scan/front-side', persistedState);
      } else {
        history.push('/scan/passport', persistedState);
      }

      return;
    } else if (isThailandReservation) {
      history.push('/scan/doc', persistedState);

      return;
    }

    if (fields.display[FORM_NAMES.terms]) {
      await registerGuestAndUpdateReservation(data);
      return;
    }

    history.push('/sign', persistedState);
  };

  const formFields = React.useMemo(
    () => ({
      [FORM_NAMES.name]: (required = fields.required[FORM_NAMES.name]) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('name'), required)}
            placeholder={t('enter_name')}
            ref={register({
              required,
              pattern: {
                value: getNamePattern(getHousingCountryCode(reservation)),
                message: t('cant_contain_number_and_symbols'),
              },
              maxLength: {
                value: maxNamesInputLength,
                message: t('max_length', {length: maxNamesInputLength}),
              },
            })}
            name={FORM_NAMES.name}
            error={errors[FORM_NAMES.name]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.surname]: (required = fields.required[FORM_NAMES.surname]) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('surname'), required)}
            placeholder={t('enter_surname')}
            ref={register({
              required,
              pattern: {
                value: getNamePattern(getHousingCountryCode(reservation)),
                message: t('cant_contain_number_and_symbols'),
              },
              maxLength: {
                value: maxNamesInputLength,
                message: t('max_length', {length: maxNamesInputLength}),
              },
            })}
            name={FORM_NAMES.surname}
            error={errors[FORM_NAMES.surname]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.secondSurname]: (
        required = fields.required[FORM_NAMES.secondSurname],
      ) => {
        return (
          <FormFieldWrapper>
            <Input
              label={getRequiredOrOptionalFieldLabel(t('second_surname'), required)}
              placeholder={t('enter_second_surname')}
              ref={register({
                required,
                pattern: {
                  value: getNamePattern(getHousingCountryCode(reservation)),
                  message: t('cant_contain_number_and_symbols'),
                },
                maxLength: {
                  value: maxNamesInputLength,
                  message: t('max_length', {length: maxNamesInputLength}),
                },
              })}
              name={FORM_NAMES.secondSurname}
              error={errors[FORM_NAMES.secondSurname]?.message}
              disabled={isLoadingCustomForm}
            />
          </FormFieldWrapper>
        );
      },

      [FORM_NAMES.sex]: (required = fields.required[FORM_NAMES.sex]) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            label={getRequiredOrOptionalFieldLabel(t('sex'), required)}
            options={GENDERS_OPTIONS()}
            rules={{required}}
            name={FORM_NAMES.sex}
            error={(errors[FORM_NAMES.sex] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.nationality]: (required = fields.required[FORM_NAMES.nationality]) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            label={getRequiredOrOptionalFieldLabel(t('nationality'), required)}
            rules={{required}}
            options={locationsAsOptions}
            name={FORM_NAMES.nationality}
            error={(errors[FORM_NAMES.nationality] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.citizenship]: (required = fields.required[FORM_NAMES.citizenship]) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('citizenship'), required)}
            options={locationsAsOptions}
            name={FORM_NAMES.citizenship}
            error={(errors[FORM_NAMES.citizenship] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.birthDate]: (required = fields.required[FORM_NAMES.birthDate]) => (
        <FormFieldWrapper>
          <Controller
            control={control}
            as={
              <Datepicker
                disabled={isLoadingCustomForm}
                error={errors[FORM_NAMES.birthDate]?.message}
                label={getRequiredOrOptionalFieldLabel(t('birth_date'), required)}
              />
            }
            name={FORM_NAMES.birthDate}
            onChange={([value]) => {
              return value?.toString();
            }}
            rules={{
              required,
              validate: value => {
                if (!value) {
                  return true;
                }
                const docDateOfIssue = getValues()[FORM_NAMES.docDateOfIssue];
                return validateBirthDate(value, docDateOfIssue);
              },
            }}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.birthCountry]: (
        required = fields.required[FORM_NAMES.birthCountry],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('country_of_birth'), required)}
            options={locationsAsOptions}
            name={FORM_NAMES.birthCountry}
            error={(errors[FORM_NAMES.birthCountry] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.cityOfBirth]: (required = fields.required[FORM_NAMES.cityOfBirth]) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('city_of_birth'), required)}
            placeholder={t('enter_city_of_birth')}
            ref={register({
              required,
            })}
            name={FORM_NAMES.cityOfBirth}
            error={errors[FORM_NAMES.cityOfBirth]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.residenceCountry]: (
        required = fields.required[FORM_NAMES.residenceCountry],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            label={getRequiredOrOptionalFieldLabel(t('residence_country'), required)}
            options={locationsAsOptions}
            rules={{required}}
            name={FORM_NAMES.residenceCountry}
            error={(errors[FORM_NAMES.residenceCountry] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.residenceProvince]: (
        required = fields.required[FORM_NAMES.residenceProvince],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            label={getRequiredOrOptionalFieldLabel(t('residence_province'), required)}
            options={provincesAsOptions}
            rules={{required}}
            name={FORM_NAMES.residenceProvince}
            error={(errors[FORM_NAMES.residenceProvince] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.residenceCity]: (
        required = fields.required[FORM_NAMES.residenceCity],
      ) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('residence_city'), required)}
            placeholder={t('enter_residence_city')}
            ref={register({
              required,
            })}
            name={FORM_NAMES.residenceCity}
            error={errors[FORM_NAMES.residenceCity]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.residenceAddress]: (
        required = fields.required[FORM_NAMES.residenceAddress],
      ) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('residence_address'), required)}
            placeholder={t('enter_residence_address')}
            ref={register({
              required,
            })}
            name={FORM_NAMES.residenceAddress}
            error={errors[FORM_NAMES.residenceAddress]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.residencePostalCode]: (
        required = fields.required[FORM_NAMES.residencePostalCode],
      ) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('residence_postal_code'), required)}
            placeholder={t('enter_residence_postal_code')}
            ref={register({
              required,
            })}
            name={FORM_NAMES.residencePostalCode}
            error={errors[FORM_NAMES.residencePostalCode]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.docType]: (required = fields.required[FORM_NAMES.docType]) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            label={getRequiredOrOptionalFieldLabel(t('doc_type'), required)}
            options={docTypes}
            rules={{required}}
            name={FORM_NAMES.docType}
            error={(errors[FORM_NAMES.docType] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.docNumber]: (required = fields.required[FORM_NAMES.docNumber]) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('doc_number'), required)}
            placeholder={t('enter_doc_number')}
            onChange={e =>
              (e.target.value = e.target.value.replace(PATTERNS.allSpaces, ''))
            }
            ref={register({
              required,
              validate: value =>
                validateDocNumber(value, getValues()[FORM_NAMES.docType]),
              pattern: {
                value: PATTERNS.docNumber,
                message: t('only_basic_letters_are_allowed') as string,
              },
            })}
            name={FORM_NAMES.docNumber}
            error={errors[FORM_NAMES.docNumber]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.docDateOfIssue]: (
        required = fields.required[FORM_NAMES.docDateOfIssue],
      ) => (
        <FormFieldWrapper>
          <Controller
            control={control}
            as={
              <Datepicker
                withTooltip
                tooltipContentKey={
                  <Trans i18nKey="date_when_the_doc_created">
                    Date when the document was created. (It is <b>not</b> the expiration
                    date)
                  </Trans>
                }
                error={errors[FORM_NAMES.docDateOfIssue]?.message}
                disabled={isLoadingCustomForm}
                label={getRequiredOrOptionalFieldLabel(t('date_of_issue'), required)}
              />
            }
            name={FORM_NAMES.docDateOfIssue}
            onChange={([value]) => {
              return value?.toString();
            }}
            rules={{
              required,
              validate: value => {
                if (!value) {
                  return true;
                }

                const birthDate = getValues()[FORM_NAMES.birthDate];
                return validateIssueDate(value, birthDate);
              },
            }}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.countryOfIssue]: (
        required = fields.required[FORM_NAMES.countryOfIssue],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('country_of_issue'), required)}
            options={locationsAsOptions}
            name={FORM_NAMES.countryOfIssue}
            error={(errors[FORM_NAMES.countryOfIssue] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.cityOfIssue]: (required = fields.required[FORM_NAMES.cityOfIssue]) => (
        <FormFieldWrapper>
          <Input
            ref={register({
              required,
            })}
            label={getRequiredOrOptionalFieldLabel(t('city_of_issue'), required)}
            placeholder={t('enter_issue_city')}
            name={FORM_NAMES.cityOfIssue}
            error={errors[FORM_NAMES.cityOfIssue]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.arrivalCountry]: (
        required = fields.required[FORM_NAMES.arrivalCountry],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('arrived_from_country'), required)}
            options={locationsAsOptions}
            name={FORM_NAMES.arrivalCountry}
            error={(errors[FORM_NAMES.arrivalCountry] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.arrivalDistrict]: (
        required = fields.required[FORM_NAMES.arrivalDistrict],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('arrived_from_district'), required)}
            options={getDistrictsAsOptions(districts)}
            name={FORM_NAMES.arrivalDistrict}
            error={(errors[FORM_NAMES.arrivalDistrict] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.arrivalMunicipality]: (
        required = fields.required[FORM_NAMES.arrivalMunicipality],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{
              required,
            }}
            label={getRequiredOrOptionalFieldLabel(
              t('arrived_from_municipality'),
              required,
            )}
            options={arrivalMunicipalitiesAsOptions}
            name={FORM_NAMES.arrivalMunicipality}
            error={(errors[FORM_NAMES.arrivalMunicipality] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.nextDestinationCountry]: (
        required = fields.required[FORM_NAMES.nextDestinationCountry],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{
              required,
            }}
            label={getRequiredOrOptionalFieldLabel(
              t('next_destination_country'),
              required,
            )}
            options={locationsAsOptions}
            name={FORM_NAMES.nextDestinationCountry}
            error={(errors[FORM_NAMES.nextDestinationCountry] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.nextDestinationCity]: (
        required = fields.required[FORM_NAMES.nextDestinationCity],
      ) => (
        <FormFieldWrapper>
          <Input
            ref={register({
              required,
            })}
            label={getRequiredOrOptionalFieldLabel(t('next_destination_city'), required)}
            placeholder={t('enter_next_destination_city')}
            name={FORM_NAMES.nextDestinationCity}
            error={errors[FORM_NAMES.nextDestinationCity]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.nextDestinationAddress]: (
        required = fields.required[FORM_NAMES.nextDestinationAddress],
      ) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(
              t('next_destination_address'),
              required,
            )}
            placeholder={t('enter_next_destination_address')}
            ref={register({
              required,
            })}
            name={FORM_NAMES.nextDestinationAddress}
            error={errors[FORM_NAMES.nextDestinationAddress]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.nextDestinationDistrict]: (
        required = fields.required[FORM_NAMES.nextDestinationDistrict],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{
              required,
            }}
            label={getRequiredOrOptionalFieldLabel(
              t('next_destination_district'),
              required,
            )}
            options={getDistrictsAsOptions(districts)}
            name={FORM_NAMES.nextDestinationDistrict}
            error={(errors[FORM_NAMES.nextDestinationDistrict] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.nextDestinationMunicipality]: (
        required = fields.required[FORM_NAMES.nextDestinationMunicipality],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{
              required,
            }}
            label={getRequiredOrOptionalFieldLabel(
              t('next_destination_municipality'),
              required,
            )}
            options={nextDestinationMunicipalitiesAsOptions}
            name={FORM_NAMES.nextDestinationMunicipality}
            error={(errors[FORM_NAMES.nextDestinationMunicipality] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.purposeOfStay]: (
        required = fields.required[FORM_NAMES.purposeOfStay],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('purpose_of_stay'), required)}
            options={getPurposesOfStayAsOptions(purposesOfStay)}
            name={FORM_NAMES.purposeOfStay}
            error={(errors[FORM_NAMES.purposeOfStay] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.visaNumber]: (required = fields.required[FORM_NAMES.visaNumber]) => (
        <FormFieldWrapper>
          <Input
            ref={register({
              required,
            })}
            label={getRequiredOrOptionalFieldLabel(t('visa_number_eu'), required)}
            placeholder={t('enter_visa_number')}
            name={FORM_NAMES.visaNumber}
            error={errors[FORM_NAMES.visaNumber]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.taxExemption]: (
        required = fields.required[FORM_NAMES.taxExemption],
      ) => (
        <FormFieldWrapper>
          <Controller
            as={<Select />}
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('tax_exemption'), required)}
            options={taxExemptionsAsOptions}
            name={FORM_NAMES.taxExemption}
            error={(errors[FORM_NAMES.taxExemption] as Error)?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.email]: (required = fields.required[FORM_NAMES.email]) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('email'), required)}
            placeholder={t('email')}
            ref={register({
              required,
              pattern: {
                value: PATTERNS.email,
                message: t('invalid_email'),
              },
            })}
            name={FORM_NAMES.email}
            error={errors[FORM_NAMES.email]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.phone]: (required = fields.required[FORM_NAMES.phone]) => (
        <FormFieldWrapper>
          <Controller
            control={control}
            as={<PhoneInput />}
            label={getRequiredOrOptionalFieldLabel(t('phone_number'), required)}
            placeholder={t('enter_your_phone_number')}
            name={FORM_NAMES.phone}
            rules={{
              required,
            }}
            error={errors[FORM_NAMES.phone]?.message || phoneInvalidAsyncError}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.fiscalCode]: (required = fields.required[FORM_NAMES.fiscalCode]) => (
        <FormFieldWrapper>
          <Input
            label={getRequiredOrOptionalFieldLabel(t('fiscal_code'), required)}
            placeholder={t('fiscal_code')}
            ref={register({
              required,
              pattern: {
                value: PATTERNS.fiscalCode,
                message: t('invalid_fiscal_code'),
              },
            })}
            name={FORM_NAMES.fiscalCode}
            error={errors[FORM_NAMES.fiscalCode]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.italianCityOfBirth]: (
        required = fields.required[FORM_NAMES.cityOfBirth],
      ) => (
        <FormFieldWrapper>
          <Controller
            cacheOptions
            defaultValues
            as={
              <AsyncSelect
                loadOptions={(inputValue, callback) => {
                  callback(getBestMatches(citiesAsOptions, inputValue));
                }}
              />
            }
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('city_of_birth'), required)}
            name={FORM_NAMES.cityOfBirth}
            error={errors[FORM_NAMES.cityOfBirth]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.italianResidenceCity]: (
        required = fields.required[FORM_NAMES.residenceCity],
      ) => (
        <FormFieldWrapper>
          <Controller
            cacheOptions
            defaultValues
            as={
              <AsyncSelect
                loadOptions={(inputValue, callback) => {
                  callback(getBestMatches(citiesAsOptions, inputValue));
                }}
              />
            }
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('residence_city'), required)}
            name={FORM_NAMES.residenceCity}
            error={errors[FORM_NAMES.residenceCity]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
      [FORM_NAMES.italianCityOfIssue]: (
        required = fields.required[FORM_NAMES.cityOfIssue],
      ) => (
        <FormFieldWrapper>
          <Controller
            cacheOptions
            defaultValues
            as={
              <AsyncSelect
                loadOptions={(inputValue, callback) => {
                  callback(getBestMatches(citiesAsOptions, inputValue));
                }}
              />
            }
            control={control}
            rules={{required}}
            label={getRequiredOrOptionalFieldLabel(t('city_of_issue'), required)}
            name={FORM_NAMES.cityOfIssue}
            error={errors[FORM_NAMES.cityOfIssue]?.message}
            disabled={isLoadingCustomForm}
          />
        </FormFieldWrapper>
      ),
    }),
    [
      arrivalMunicipalitiesAsOptions,
      citiesAsOptions,
      control,
      districts,
      docTypes,
      errors,
      fields.required,
      getRequiredOrOptionalFieldLabel,
      getValues,
      isLoadingCustomForm,
      locationsAsOptions,
      nextDestinationMunicipalitiesAsOptions,
      phoneInvalidAsyncError,
      provincesAsOptions,
      purposesOfStay,
      register,
      reservation,
      t,
      taxExemptionsAsOptions,
    ],
  );

  const getCustomField = React.useCallback(
    (field: CustomField, required: boolean | string) => {
      const {name, placeholder, label} = getCustomFieldData(field);

      switch (field.field_type) {
        case FieldTypes.date:
          return (
            <FormFieldWrapper>
              <Controller
                control={control}
                as={<Datepicker />}
                label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                rules={{required}}
                name={name}
                error={(errors[name] as Error)?.message}
              />
            </FormFieldWrapper>
          );
        case FieldTypes.time:
          return (
            <FormFieldWrapper>
              <Controller
                control={control}
                as={<TimePicker />}
                name={name}
                placeholder={placeholder}
                rules={{required}}
                label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                error={errors[name]?.message}
              />
            </FormFieldWrapper>
          );
        case FieldTypes.file:
          return (
            <FormFieldWrapper>
              <Controller
                control={control}
                as={<FileInput />}
                name={name}
                placeholder={placeholder}
                onChange={handleFileChange}
                rules={{required}}
                label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                error={errors[name]?.message}
                invalid={isInvalidFileType}
                accept={acceptableDocuments}
              />
              {isInvalidFileType && (
                <InvalidFileTypeError>{t('only_doc_file_types')}</InvalidFileTypeError>
              )}
            </FormFieldWrapper>
          );
        default:
          return (
            <FormFieldWrapper>
              <Input
                label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                placeholder={placeholder}
                ref={register({
                  required,
                })}
                name={name}
                error={errors[name]?.message}
              />
            </FormFieldWrapper>
          );
      }
    },
    [control, errors, getRequiredOrOptionalFieldLabel, register, isInvalidFileType, t],
  );

  const filterCustomFormNames = React.useCallback(
    (formNames: FORM_NAMES[]) => {
      const customFormNames = customForm!.fields_set.map(({field, is_leaders_field}) => {
        if (!isGuestLeader && is_leaders_field) {
          return '';
        }

        return field.name;
      });

      return formNames.filter(formName => {
        return !customFormNames.includes(formName);
      });
    },
    [customForm, isGuestLeader],
  );

  const displayingFormNames = React.useMemo(() => {
    let formNames = Object.values(FORM_NAMES).filter(formName => {
      if (formName === FORM_NAMES.terms) {
        return false;
      }

      return fields.display[formName];
    });

    if (hasCustomForm) {
      formNames = filterCustomFormNames(formNames);
    }

    return formNames;
  }, [fields.display, filterCustomFormNames, hasCustomForm]);

  const renderFormFields = () => {
    return displayingFormNames.map(formName => {
      return (
        <React.Fragment key={formName}>
          {formFields[formName as Exclude<FORM_NAMES, FORM_NAMES.terms>]?.()}
        </React.Fragment>
      );
    });
  };

  const renderCustomFormFields = () => {
    const isAddingGuestLeader = !getHasGuestLeader(reservation);

    if (!customForm) {
      return null;
    }

    const fieldsSet = renderFormFields();

    const customFieldsSet = customForm.fields_set.map(
      ({field, is_required, is_leaders_field}) => {
        const required =
          (is_required || fields.required[field.name as FORM_NAMES]) &&
          (t('required') as string);
        const hidden = fields.display[field.name as FORM_NAMES] === false;

        if (hidden || (!isAddingGuestLeader && is_leaders_field)) {
          return null;
        }

        if (!field.is_custom) {
          const formField =
            formFields[field.name as Exclude<FORM_NAMES, FORM_NAMES.terms>];

          return <React.Fragment key={field.id}>{formField?.(required)}</React.Fragment>;
        }

        const customField = getCustomField(field, required);
        return <React.Fragment key={field.id}>{customField}</React.Fragment>;
      },
    );

    return [...customFieldsSet, ...fieldsSet];
  };

  const getRowsCount = () => {
    const fieldsNumber = displayingFormNames.length;
    const customFieldsNumber = customForm?.fields_set?.length || 0;

    return hasCustomForm
      ? countRows(customFieldsNumber + fieldsNumber)
      : countRows(fieldsNumber);
  };

  const rowsCount = getRowsCount();

  return (
    <>
      <ErrorModal />
      <Modal
        open={isLoadingModalOpen}
        title={t('sending_your_data')}
        text={t('it_could_take_seconds')}
        iconSrc={userIcon}
        iconAlt="Person"
      />
      <Modal
        iconSrc={termsIcon}
        iconAlt="Privacy Policy"
        open={isTermsModalOpen}
        onClose={acceptTermsAndCloseTermsModal}
        title={t('please_accept_the_privacy_policy')}
        text={
          <Trans i18nKey="authorities_mark_mandatory_to_accept">
            Authorities marks as mandatory to accept the
            <b>Privacy Policy</b>
          </Trans>
        }
      >
        <ModalButtonWrapper>
          <Button
            label={t('accept_the_privacy_policy')}
            onClick={acceptTermsAndCloseTermsModal}
            icon={<img src={likeIcon} alt="Like" />}
          />
        </ModalButtonWrapper>
      </Modal>
      <Modal
        closeOnDocumentClick
        closeOnEscape
        open={isDataIncompleteModalOpen}
        iconSrc={dataIncompleteIcon}
        iconAlt="Form with a red field"
        title={t('incomplete_personal_data')}
        text={t('at_least_one_field_is_missing')}
        onClose={closeDataIncompleteModal}
      >
        <IncompleteDataModalButtonWrapper>
          <Button
            label={t('ok')}
            onClick={closeDataIncompleteModal}
            icon={<IncompleteDataModalButtonIcon src={likeIcon} alt="Like" />}
          />
        </IncompleteDataModalButtonWrapper>
      </Modal>
      <Form autoComplete="nope" data-testid="guest-form">
        <Fields data-testid="fields" rowsCount={rowsCount}>
          {hasCustomForm ? renderCustomFormFields() : renderFormFields()}
        </Fields>
        {fields.display[FORM_NAMES.terms] && (
          <CheckboxWrapper>
            <Checkbox
              onChange={toggleTermsCheckbox}
              name={FORM_NAMES.terms}
              checked={areTermsAccepted}
              label={
                <span>
                  {t('i_accept')}
                  {` `}
                  <TermsLink target="blank" href={t('terms_and_conditions_link')}>
                    {t('terms_and_conditions')}
                  </TermsLink>
                </span>
              }
            />
          </CheckboxWrapper>
        )}
        <SubmitButtonWrapper>
          <SubmitButton
            type="button"
            onClick={handleSubmit(onSubmit)}
            label={t('next')}
          />
        </SubmitButtonWrapper>
      </Form>
    </>
  );
}

export {AddPersonalDataForm};
