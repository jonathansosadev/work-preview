import {format} from 'date-fns';
import {CARD_BRANDS, HOUSING_VERIFICATION_TYPE} from './constants';
import {Guest} from './types';
import {FORM_NAMES} from './guestFields';
import {getBase64} from './common';
import {getIsIdentityVerificationEnabled, getChecksVerificationType} from './housing';

type AdditionalGuestDataTypes = {
  reservation?: any;
  housing?: any;
  ocrWasUsed?: boolean;
  documentPhotosId?: string;
  isDeletePhotos?: boolean;
  isIdentityVerificationEnabled?: boolean;
  verificationType?: HOUSING_VERIFICATION_TYPE;
};

function buildDocumentsGuest(data: any, documentId?: string, isDeletePhotos?: boolean) {
  const hasDocIssuePlace = data.countryOfIssue || data.cityOfIssue?.value;
  const issue_date = data.docDateOfIssue
    ? format(new Date(data.docDateOfIssue), 'yyyy-MM-dd')
    : undefined;
  const hasDocument =
    data.docType ||
    data.docNumber ||
    data.visaNumber ||
    data.back_side_scan ||
    data.front_side_scan;

  if (!hasDocument) return undefined;

  let builtData: any = {
    issue_date,
    type: data.docType?.value,
    number: data.docNumber,
    document_id: documentId,
    issue_place: hasDocIssuePlace
      ? {
          country: data.countryOfIssue?.value,
          city: data.cityOfIssue?.value || data.cityOfIssue || undefined,
          division_level_3: data.cityOfIssue?.value,
        }
      : undefined,
  };

  const frontSideScan =
    data?.front_side_scan && !data?.front_side_scan?.startsWith('https')
      ? data.front_side_scan
      : undefined;
  const backSideScan =
    data?.back_side_scan && !data?.back_side_scan?.startsWith('https')
      ? data.back_side_scan
      : undefined;

  builtData.front_side_scan = !isDeletePhotos ? frontSideScan : '';
  builtData.back_side_scan = !isDeletePhotos ? backSideScan : '';

  return [builtData];
}

function buildGuest(
  data: any,
  {
    reservation,
    housing,
    ocrWasUsed,
    documentPhotosId,
    isDeletePhotos,
  }: AdditionalGuestDataTypes = {},
) {
  if (!data) {
    return null;
  }
  const hasBirthPlace = data.birthCountry || data.cityOfBirth;

  const hasResidence =
    data.residenceAddress ||
    data.residenceCity ||
    data.residenceCountry ||
    data.residencePostalCode ||
    data.residenceProvince;
  const hasNextDestination =
    data.nextDestinationAddress ||
    data.nextDestinationCity ||
    data.nextDestinationCountry ||
    data.nextDestinationDistrict;
  const hasArrival =
    data.arrivalCountry || data.arrivalMunicipality || data.arrivalDistrict;
  const birth_date = data.birthDate
    ? format(new Date(data.birthDate), 'yyyy-MM-dd')
    : undefined;

  let documents: any = buildDocumentsGuest(data, documentPhotosId, isDeletePhotos);

  const visaDoc = data.visaNumber
    ? {
        type: CARD_BRANDS.visa,
        number: data.visaNumber,
      }
    : undefined;

  if (visaDoc) {
    if (documents) {
      documents.unshift(visaDoc);
    } else {
      documents = [visaDoc];
    }
  }
  const hasIdentityVerification =
    getIsIdentityVerificationEnabled(housing) && data?.front_side_scan;
  const {isOnlyOfficialDocument, isDocumentAndSelfie} = getChecksVerificationType(
    housing,
  );
  const isDocumentPassed =
    hasIdentityVerification && isOnlyOfficialDocument
      ? isOnlyOfficialDocument
      : undefined;
  const isBiomatchPassed =
    hasIdentityVerification && isDocumentAndSelfie ? isDocumentAndSelfie : undefined;

  return {
    birth_date,
    documents,
    document_passed: isDocumentPassed,
    biomatch_passed: isBiomatchPassed,
    email: data.email || undefined,
    phone: data.phone || undefined,
    fiscal_code: data.fiscal_code || undefined,
    origin: 'DASHBOARD',
    ocr_was_used: ocrWasUsed,
    reservation_id: reservation?.id,
    name: data.name,
    surname: data.surname,
    second_surname: data.second_surname,
    nationality: data.nationality?.value,
    citizenship: data.citizenship?.value,
    purpose_of_stay: data.purposeOfStay?.value,
    sex: data.sex?.value,
    tax_exemption: data.taxExemption?.value,
    full_tourist_tax: data.full_tourist_tax || undefined,
    birth_place: hasBirthPlace
      ? {
          country: data.birthCountry?.value,
          city: data.cityOfBirth?.value ? undefined : data.cityOfBirth,
          division_level_3: data.cityOfBirth?.value,
        }
      : undefined,
    residence: hasResidence
      ? {
          address: data.residenceAddress,
          city: data.residenceCity?.value ? undefined : data.residenceCity,
          country: data.residenceCountry?.value,
          postal_code: data.residencePostalCode,
          division_level_2: data.residenceProvince?.value,
          division_level_3: data.residenceCity?.value,
        }
      : undefined,
    arrived_from: hasArrival
      ? {
          country: data.arrivalCountry?.value,
          division_lvl_1: data.arrivalDistrict?.value,
          division_lvl_2: data.arrivalMunicipality?.value,
        }
      : undefined,
    next_destination: hasNextDestination
      ? {
          address: data.nextDestinationAddress,
          city: data.nextDestinationCity,
          country: data.nextDestinationCountry?.value,
          division_level_1: data.nextDestinationDistrict?.value,
          division_level_2: data.nextDestinationMunicipality?.value,
        }
      : undefined,
    signature: !data.signature?.startsWith('https') ? data.signature : undefined,
  };
}

async function buildCustomFields(formData: any) {
  const formNames = Object.values(FORM_NAMES);
  const formDataNames = Object.keys(formData);
  const customFormNames = formDataNames.filter((name: any) => {
    return !formNames.includes(name);
  });

  const payload: {[key: string]: string} = {};

  for await (let formName of customFormNames) {
    const value = formData[formName]?.value || formData[formName];

    if (value instanceof File) {
      payload[formName] = await getBase64(value as File);
      continue;
    }

    if (value instanceof Date) {
      payload[formName] = format(new Date(value), 'yyyy-MM-dd');
      continue;
    }

    if (value?.startsWith('https://')) {
      continue;
    }

    if (value || value === '') {
      payload[formName] = value;
    }
  }

  return payload;
}

function getGuestPoliceStatusInCode(guest?: Guest) {
  return guest?.statuses?.police?.in?.code || '';
}

function getGuestStatStatusInCode(guest?: Guest) {
  return guest?.statuses?.statistics?.in?.code || '';
}

function getDocumentPhotos(guest?: Guest) {
  if (!guest?.document?.front_side_scan) return null;
  return {
    frontSide: {
      src: guest?.document?.front_side_scan,
      srcDownload: guest?.document?.front_side_scan_download,
    },
    backSide: {
      src: guest?.document?.back_side_scan,
      srcDownload: guest?.document?.back_side_scan_download,
    },
  };
}

export {
  buildGuest,
  getGuestPoliceStatusInCode,
  getGuestStatStatusInCode,
  buildCustomFields,
  getDocumentPhotos,
};
