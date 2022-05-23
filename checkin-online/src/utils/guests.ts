import {format} from 'date-fns';
import {CARD_BRANDS} from './constants';
import {FORM_NAMES} from '../components/AddPersonalDataForm/AddPersonalDataForm';
import {AliceReport} from '../components/AliceOnboardingForm/AliceOnboardingForm';

const ALICE_BIOMATCH_DOC_VALID_DISTANCE = 0.5;
const ALICE_BIOMATCH_SELFIE_LIVENESS_SCORE = 0.5;

function getIsAliceBiomatchPassed(selfieScore = 0, documentScore = 0) {
  return (
    selfieScore >= ALICE_BIOMATCH_SELFIE_LIVENESS_SCORE &&
    documentScore >= ALICE_BIOMATCH_DOC_VALID_DISTANCE
  );
}

const DOC_TYPE_WITHOUT_REQUIREMENTS = 'SD';

export type AdditionalGuestDataTypes = {
  reservation?: any;
  signature?: string;
  front_side_scan?: string;
  back_side_scan?: string;
  ocr_was_used?: boolean;
  customFormId?: string;
  isIdOrPassportRequired?: boolean;
  biomatch_passed?: boolean;
  biomatch_doc?: string;
  biomatch_selfie?: string;
  document_passed?: boolean;
  aliceReport?: AliceReport;
};

async function buildGuest(
  data: any,
  {
    reservation,
    signature,
    front_side_scan,
    back_side_scan,
    ocr_was_used,
    document_passed,
    isIdOrPassportRequired,
    aliceReport,
    biomatch_passed,
    biomatch_doc,
    biomatch_selfie,
  }: AdditionalGuestDataTypes,
) {
  const reservationId = reservation?.id;
  if (!data || !reservationId) {
    return null;
  }
  const aliceDocument = aliceReport?.documents?.[aliceReport.documents?.length - 1 || 0];

  const biomatchDoc = biomatch_doc || aliceDocument?.front || aliceDocument?.back;
  const biomatchSelfie = biomatch_selfie || aliceReport?.selfie?.selfie;

  const aliceSelfieLiveness = aliceReport?.selfie?.liveness;
  const aliceDocumentFaceValidationScore = aliceDocument?.face_validation;
  const biomatchPassed =
    biomatch_passed ||
    getIsAliceBiomatchPassed(aliceSelfieLiveness, aliceDocumentFaceValidationScore);

  const hasDocIssuePlace =
    data.countryOfIssue || data.cityOfIssue?.value || data.cityOfIssue;
  const hasBirthPlace = data.birthCountry || data.cityOfBirth;
  const hasDocument =
    data.docType ||
    data.docNumber ||
    data.visaNumber ||
    front_side_scan ||
    back_side_scan;
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
  const issue_date = data.docDateOfIssue
    ? format(new Date(data.docDateOfIssue), 'yyyy-MM-dd')
    : undefined;
  let documents: any = hasDocument
    ? [
        {
          issue_date,
          front_side_scan,
          back_side_scan,
          type:
            data.docType?.value ||
            (isIdOrPassportRequired ? DOC_TYPE_WITHOUT_REQUIREMENTS : undefined),
          number: data.docNumber,
          issue_place: hasDocIssuePlace
            ? {
                country: data.countryOfIssue?.value,
                city: data.cityOfIssue?.value ? undefined : data.cityOfIssue,
                division_level_3: data.cityOfIssue?.value,
              }
            : undefined,
        },
      ]
    : undefined;
  const visaDoc = data.visaNumber
    ? {
        type: CARD_BRANDS.visa,
        number: data.visaNumber,
      }
    : undefined;

  if (visaDoc) {
    if (documents) {
      documents.push(visaDoc);
    } else {
      documents = [visaDoc];
    }
  }

  return {
    signature,
    birth_date,
    documents,
    document_passed,
    biomatch_passed: biomatchPassed,
    biomatch_doc: biomatchDoc,
    biomatch_selfie: biomatchSelfie,
    ocr_was_used,
    origin: 'CH_ONLINE',
    reservation_id: reservation.id,
    name: data.name,
    surname: data.surname,
    second_surname: data.second_surname,
    nationality: data.nationality?.value,
    citizenship: data.citizenship?.value,
    purpose_of_stay: data.purposeOfStay?.value,
    sex: data.sex?.value,
    tax_exemption: data.taxExemption?.value,
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
    email: data?.email || undefined,
    phone: data?.phone,
    fiscal_code: data?.fiscalCode,
  };
}

function getBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject('File is missing');
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
  });
}

function getHasSomeCustomFields(formData: any) {
  const formNames = Object.values(FORM_NAMES);
  const formDataNames = Object.keys(formData);

  return formDataNames
    .filter((name: any) => {
      return !formNames.includes(name);
    })
    .some(name => {
      return Boolean(formData[name]);
    });
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

    if (value) {
      payload[formName] = value;
    }
  }

  return payload;
}

const storedGuestIdStorageName = 'guestId';
function getStoredGuestId() {
  return localStorage.getItem(storedGuestIdStorageName) || '';
}

function setStoredGuestId(id: string) {
  return localStorage.setItem(storedGuestIdStorageName, id);
}

export {
  buildGuest,
  buildCustomFields,
  getHasSomeCustomFields,
  getIsAliceBiomatchPassed,
  getStoredGuestId,
  setStoredGuestId,
};
