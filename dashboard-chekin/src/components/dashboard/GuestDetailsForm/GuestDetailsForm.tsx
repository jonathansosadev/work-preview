import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useQuery, useQueryClient} from 'react-query';
import {useParams, useHistory, useLocation} from 'react-router-dom';
import {useDropzone} from 'react-dropzone';
import {isBefore, subYears} from 'date-fns';
import {Controller, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import {useUser} from '../../../context/user';
import type {
  City,
  Country,
  CustomField,
  CustomForm,
  DatepickerDate,
  District,
  Guest,
  GuestGroup,
  LightReservation,
  Province,
  PurposeOfStay,
  SelectOption,
  TaxExemption,
  Lock,
  Housing,
} from '../../../utils/types';
import type {WebcamRefTypes} from '../Webcam/Webcam';
import {
  FIELD_TYPES,
  FORM_FIELDS_LABELS,
  FORM_NAMES,
  getFields,
  getIsCountryOfIssueRequired,
  getIsDocDateOfIssueRequired,
  getIsDocTypeRequired,
} from '../../../utils/guestFields';
import {
  getGroupMembersNumber,
  getGuestLeader,
  hasAnyCompletedGuest,
} from '../../../utils/guestGroup';
import {
  CARD_BRANDS,
  COUNTRIES_WITH_PURPOSES_OF_STAY,
  COUNTRY_CODES,
  GENDERS_OPTIONS,
  MIN_MEMBERS_NUMBER,
  PATTERNS,
  QUERY_CACHE_KEYS,
  STAT_TYPES_WITH_TAX_EXEMPTIONS,
  LOCK_VENDORS,
} from '../../../utils/constants';
import {
  addSupportEmailToMessage,
  getBase64,
  getCurrentLocale,
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import {getCountryCode} from '../../../utils/housing';
import {
  getIsCaptureStatFieldsEnabled,
  getStatTypeIfStatActive,
} from '../../../utils/reservations';
import documents, {
  getDocTypes,
  getRemappedDocType,
  getShouldResetDocTypes,
} from '../../../utils/docTypes';
import {useCountriesOptions} from '../../../hooks/useCountriesOptions';
import {
  useAbortController,
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  usePrevious,
  useScrollToTop,
  useStatus,
} from '../../../utils/hooks';
import {useComputedDetails} from '../../../context/computedDetails';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {
  buildCustomFields,
  buildGuest,
  getGuestPoliceStatusInCode,
} from '../../../utils/guest';
import viewIconBlue from '../../../assets/view-icon-blue.svg';
import plusIcon from '../../../assets/plus.svg';
import plusBlueIcon from '../../../assets/plus-blue.svg';
import cameraIcon from '../../../assets/cam_icn.svg';
import blueCloseIcon from '../../../assets/close-blue.svg';
import scanningIcon from '../../../assets/scanning_icn.svg';
import successIcon from '../../../assets/icon_success.svg';
import guestIcon from '../../../assets/guest-icon.svg';
import ReactSignatureCanvas from 'react-signature-canvas';
import missingDataIcon from '../../../assets/icon-data-missing.svg';
import deleteGuestIcon from '../../../assets/icon-delete-guest.svg';
import floppyIcon from '../../../assets/floppy-disk.svg';
import Select from '../Select';
import Datepicker from '../Datepicker';
import AsyncSelect from '../AsyncSelect';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import Modal from '../Modal';
import Loader from '../../common/Loader';
import SignatureCanvas from '../SignatureCanvas';
import Button from '../Button';
import PhoneInput from '../../dashboard/PhoneInput';
import FormHeader from '../FormHeader';
import RubbishIconFilling from '../RubbishIconFilling';
import ModalButton from '../ModalButton';
import Tooltip from '../Tooltip';
import TimePicker, {TIME_OPTIONS} from '../TimePicker';
import ConfirmDeletionModal from '../ConfirmDeletionModal';
import FormFileInput from '../FormFileInput';
import {InputController} from '../Input';
import {ModalTwoButtonsWrapper, ContentWrapper} from '../../../styled/common';
import {
  BottomButton,
  BottomButtonError,
  BottomButtonText,
  ButtonLabelIcon,
  ButtonLabelText,
  ButtonLabelWrapper,
  DetectionWebcam,
  ModalCloseButton,
  ModalContent,
  ModalTitle,
  PlusImage,
  SaveGuestText,
  ScanModalButtonsWrapper,
  scanModalContentStyle,
  ScanModalHint,
  ScanModalTriggerButtonWrapper,
  SelectAnotherFileButton,
  SignatureImg,
  SignatureModalButtonsWrapper,
  SignatureModalContent,
  UploadedImageWrapper,
  UploadedPDFWrapper,
  UploadModalButtonsWrapper,
  ViewDocumentLink,
  SignaturePlaceholder,
  SelectFileDragZoneContainer,
  ScanModalOrText,
  DeleteDocumentButtonWrapper,
  CenteredWrapper,
  BottomSection,
  BottomButtonWrapper,
  FieldsContainer,
  AbortRequestButtonWrapper,
  AddDataManuallyText,
  BlueBottomButtonText,
  DocumentInfo,
  DocumentPhoto,
  DocumentPhotosWrapper,
  DocumentsPhotosContent,
  DragZoneText,
  ErrorText,
  FileDragZone,
  FileTypes,
  Form,
  FormContent,
  MissingNameTitle,
  ModalButtonWrapper,
  viewDocumentsModalContentStyle,
} from './styled';

const CACHE_TIME = 60;
const STALE_TIME = 30;
const DETECTING_REQUESTS_GAP_S = 1;
const SUCCESS_MODAL_TIMEOUT_S = 1.5;
const MAX_NAMES_INPUT_LENGTH = 30;
const MIN_TAX = 0;
const MAX_TAX = 5;

const PDF_UPLOADING_ALLOWED_COUNTRIES = [COUNTRY_CODES.uae];
const ACCEPTABLE_DOCUMENTS = 'image/*, application/pdf';

enum DETECTING_STATUSES {
  completed = 'COM',
  error = 'ERR',
  processing = 'PRO',
  new = 'NEW',
}

function getCustomFieldData(field: CustomField) {
  const language = getCurrentLocale().toUpperCase();
  const defaultLabel = Object.values(field.names?.[0])?.[0] || '';
  const localeLabel = field.names.find((name) => {
    return name[language];
  })?.[language];
  const defaultPlaceholder = field.placeholders?.length
    ? Object.values(field.placeholders?.[0])?.[0]
    : '';
  const localePlaceholder = field?.placeholders?.length
    ? field?.placeholders?.find((placeholder) => {
        return placeholder[language];
      })?.[language]
    : '';

  const label = localeLabel || defaultLabel;
  const placeholder = localePlaceholder || defaultPlaceholder;
  const name = field.name;

  return {label, placeholder, name};
}

export const getBestMatches = (
  arr: Array<{label: string; value: string}>,
  inputValue: any,
) => {
  return arr
    .filter((x: any) => x.label.toLowerCase().includes(inputValue.toLowerCase()))
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

function fetchReservation(key: string) {
  return queryFetcher(api.reservations.ENDPOINTS.oneLight(key));
}

function fetchLocations(params = 'ordering=name') {
  return queryFetcher(api.locations.ENDPOINTS.all(params));
}

function fetchPurposesOfStay(params = '') {
  return queryFetcher(api.purposesOfStay.ENDPOINTS.all(params));
}

function fetchTaxExemptions(params = '') {
  return queryFetcher(api.statTaxExemptions.ENDPOINTS.all(params));
}

function getIsNeedToFetchDistricts(countryCode = '') {
  return countryCode === COUNTRY_CODES.colombia;
}

function getIsNeedToFetchProvinces(countryCode = '', isCaptureStatFieldsEnabled = false) {
  return countryCode === COUNTRY_CODES.spain && isCaptureStatFieldsEnabled;
}

function getIsNeedToFetchCities(countryCode = '') {
  return countryCode === COUNTRY_CODES.italy;
}

function getIsNeedToFetchMunicipalities(countryCode = '') {
  return countryCode === COUNTRY_CODES.colombia;
}

function getIsNeedToFetchPurposesOfStay(countryCode = '', isGuestLeader = false) {
  return (
    (countryCode === COUNTRY_CODES.czech && isGuestLeader) ||
    COUNTRIES_WITH_PURPOSES_OF_STAY.includes(countryCode)
  );
}

function getStatTypeExemptionTypeParams(countryCode = '') {
  return countryCode === COUNTRY_CODES.slovenia
    ? 'stat_type=AJP'
    : countryCode === COUNTRY_CODES.italy
    ? 'stat_type=ITVA'
    : '';
}

function getIsNeedToFetchTaxExemptions(countryCode = '', housing?: Housing) {
  const statType = getStatTypeIfStatActive(housing);
  return (
    countryCode === COUNTRY_CODES.slovenia ||
    (countryCode === COUNTRY_CODES.italy &&
      STAT_TYPES_WITH_TAX_EXEMPTIONS.includes(statType))
  );
}

type Provinces = {
  results: Province[];
};
function getProvincesAsOptions(provinces: Provinces) {
  if (!provinces?.results) {
    return [];
  }

  return provinces?.results?.map((c) => {
    return {
      label: c?.division_level_2?.name,
      value: c?.division_level_2?.code,
    };
  });
}

function getLocationsAsOptions(locations: {results: {country: Country}[]}) {
  if (!locations?.results) {
    return [];
  }

  return locations?.results?.map((c: any) => {
    return {
      label: c?.country?.name,
      value: c?.country?.code,
    };
  });
}

function getDistrictsAsOptions(data: {results: District[]}) {
  const districts = data?.results;

  if (!districts) {
    return [];
  }
  return districts.map((d) => {
    return {
      value: d?.division_level_1?.code,
      label: d?.division_level_1?.name,
    };
  });
}

function getCitiesAsOptions(data: {results: City[]}) {
  const results = data?.results;

  if (!results) {
    return [];
  }
  return results.map((l) => {
    return {
      value: l?.division_level_3?.code,
      label: l?.division_level_3?.name,
    };
  });
}

function getPurposesOfStayAsOptions(data: PurposeOfStay[]) {
  if (!data) {
    return [];
  }
  return data.map((p) => {
    return {
      value: p.id,
      label: p.name,
    };
  });
}

function getTaxExemptionsAsOptions(data: TaxExemption[]) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((t) => {
    return {
      value: t.id,
      label: t.name,
    };
  });
}

function getNamePattern(country?: string) {
  if (country === COUNTRY_CODES.italy) {
    return PATTERNS.nameWithoutAccents;
  }

  return PATTERNS.name;
}

function validateDNI(number = '', type: string | number = '') {
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

function validateDocNumber(number = '', docType: SelectOption | null) {
  const type = docType?.value;

  if (type === documents.types.drivingLicenseES) {
    if (PATTERNS.nie.test(number)) {
      return validateNIE(number);
    }

    return validateDNI(number);
  }

  if (type && documents.dniValidation.includes(String(type))) {
    return validateDNI(number, type);
  }

  if (type && documents.nieValidation.includes(String(type))) {
    return validateNIE(number);
  }

  return true;
}

function getIsBirthDateBeforeIssueDate(birthDate: DatepickerDate, issueDate: Date) {
  if (birthDate && issueDate) {
    return isBefore(new Date(birthDate), new Date(issueDate));
  }
  return true;
}

function getIsDateBeforeToday(date: DatepickerDate) {
  if (!date) {
    return false;
  }
  const today = new Date(new Date().toDateString());
  return isBefore(new Date(date), today);
}

function validateBirthDate(birthDate: DatepickerDate, issueDate: Date) {
  if (!birthDate) {
    return true;
  }

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
  if (!issueDate) {
    return true;
  }

  let error = '';
  const isBeforeIssueDate = getIsBirthDateBeforeIssueDate(birthDate, issueDate);
  const isBeforeToday = getIsDateBeforeToday(issueDate);

  if (!isBeforeIssueDate) {
    error = i18n.t('cant_be_equal_or_smaller_than_birth_date');
  }
  if (!isBeforeToday) {
    error += ` ${i18n.t('cant_be_equal_or_greater_than_today')}`;
  }

  return error || true;
}

function getValidName(name?: string) {
  if (!name) {
    return undefined;
  }
  return PATTERNS.name.test(name) ? name : undefined;
}

function getAllowedFileTypes(countryCode: string) {
  if (PDF_UPLOADING_ALLOWED_COUNTRIES.includes(countryCode)) {
    return 'image/*, application/pdf';
  }

  return 'image/*';
}

type GuestDetailsTypes = {
  guestId: string;
  guestGroup?: GuestGroup;
};

function getGuestDetails({guestGroup, guestId}: GuestDetailsTypes) {
  if (!guestGroup || !guestId) {
    return {
      data: null,
      isLeader: false,
    };
  }

  const groupMembers = guestGroup?.members || [];
  const guest = groupMembers.find((m) => {
    return m.id === guestId;
  });

  const leaderId = guestGroup?.leader_id || '';
  const isLeader = guest?.id === leaderId || !groupMembers.length;

  return {
    isLeader,
    data: guest || null,
  };
}

type FormTypes = Partial<{
  [FORM_NAMES.name]: string | null;
  [FORM_NAMES.surname]: string | null;
  [FORM_NAMES.secondSurname]: string;
  [FORM_NAMES.sex]: SelectOption | null;
  [FORM_NAMES.birthDate]: DatepickerDate;
  [FORM_NAMES.nationality]: SelectOption | null;
  [FORM_NAMES.docType]: SelectOption | null;
  [FORM_NAMES.docNumber]: string;
  [FORM_NAMES.docDateOfIssue]: DatepickerDate;
  [FORM_NAMES.birthCountry]: SelectOption | null;
  [FORM_NAMES.residenceCountry]: SelectOption | null;
  [FORM_NAMES.residenceCity]: string | SelectOption | null;
  [FORM_NAMES.countryOfIssue]: SelectOption | null;
  [FORM_NAMES.cityOfBirth]: string | SelectOption | null;
  [FORM_NAMES.cityOfIssue]: string | SelectOption | null;
  [FORM_NAMES.residenceAddress]: string;
  [FORM_NAMES.nextDestinationCountry]: SelectOption | null;
  [FORM_NAMES.nextDestinationCity]: string;
  [FORM_NAMES.nextDestinationAddress]: string;
  [FORM_NAMES.residencePostalCode]: string;
  [FORM_NAMES.citizenship]: SelectOption | null;
  [FORM_NAMES.purposeOfStay]: SelectOption | null;
  [FORM_NAMES.visaNumber]: string;
  [FORM_NAMES.arrivalCountry]: SelectOption | null;
  [FORM_NAMES.arrivalDistrict]: SelectOption | null;
  [FORM_NAMES.arrivalMunicipality]: SelectOption | null;
  [FORM_NAMES.nextDestinationDistrict]: SelectOption | null;
  [FORM_NAMES.nextDestinationMunicipality]: SelectOption | null;
  [FORM_NAMES.taxExemption]: SelectOption | null;
  [FORM_NAMES.residenceProvince]: SelectOption | null;
  [FORM_NAMES.signature]: string | null;
  [FORM_NAMES.frontSideScan]: string | null;
  [FORM_NAMES.backSideScan]: string | null;
  [FORM_NAMES.email]: string;
  [FORM_NAMES.phone]: string | null | number;
  [FORM_NAMES.fiscalCode]: string | null;
  [FORM_NAMES.fullTouristTax]: number | null;
  [key: string]: any;
}>;

type FormFieldTypes = Exclude<
  FORM_NAMES,
  | FORM_NAMES.terms
  | FORM_NAMES.frontSideScan
  | FORM_NAMES.backSideScan
  | FORM_NAMES.signature
>;

type GuestDetailsFormProps = {
  disabled?: boolean;
  initGuestData?: Guest;
};

const defaultProps: Partial<GuestDetailsFormProps> = {
  disabled: false,
  initGuestData: undefined,
};

type LocationState = {
  formData?: any;
  locks?: Lock[];
};

function fetchHousing(id = '') {
  return queryFetcher(api.housings.ENDPOINTS.one(id));
}

function fetchCustomForm(housingId: string, userId = '') {
  return queryFetcher(
    api.guestCustomForm.ENDPOINTS.customForm(`housing_id=${housingId}&user_id=${userId}`),
  );
}

function fetchCustomFields(guestId: string, userId = '') {
  return queryFetcher(
    api.guestCustomForm.ENDPOINTS.customValuesById(guestId, `user_id=${userId}`),
  );
}

function getIsItalianLeaderWithMembers(
  housingCountry?: string,
  guestGroup?: GuestGroup,
  guestId?: string,
) {
  if (!housingCountry || !guestGroup || !guestId) {
    return false;
  }

  const guestLeader = getGuestLeader(guestGroup);
  return (
    guestLeader?.id === guestId &&
    getGroupMembersNumber(guestGroup) > MIN_MEMBERS_NUMBER &&
    housingCountry === COUNTRY_CODES.italy
  );
}

const RESERVATION_ID_UPDATE_FIELDS = [
  'arrived_from',
  'tax_exemption',
  'purpose_of_stay',
  'next_destination',
];

type CustomFieldData = {
  created_at: string;
  custom_data: {[key: string]: string};
  guest_id: string;
  id: string;
  updated_at: string;
};

type Params = {
  id: string;
  guestId: string;
};

function GuestDetailsForm({disabled}: GuestDetailsFormProps) {
  useScrollToTop();
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {isNeedToAskForSubscription} = useComputedDetails();
  const user = useUser();
  const {id: reservationId, guestId} = useParams<Params>();

  React.useLayoutEffect(
    function redirect() {
      const isAccessDenied = isNeedToAskForSubscription || !reservationId;
      if (isAccessDenied) {
        history.push('/bookings');
      }
    },
    [history, isNeedToAskForSubscription, reservationId],
  );

  const {
    formState,
    control,
    watch,
    register,
    getValues,
    trigger,
    setValue,
    reset,
    handleSubmit,
  } = useForm<FormTypes>();

  const {errors} = formState;

  const prevFormState = usePrevious<typeof formState>(formState);
  const isMounted = useIsMounted();
  const {ErrorModal, displayError, closeErrorModal} = useErrorModal();
  const {
    ErrorModal: SavingTryAgainErrorModal,
    displayError: displayTryAgainSavingError,
    closeErrorModal: closeSavingTryAgainErrorModal,
  } = useErrorModal();
  const {
    ErrorModal: SavingErrorModal,
    displayError: displaySavingError,
  } = useErrorModal();
  const {setupAbortController, abortController} = useAbortController();

  const {
    openModal: openDataIncompleteModal,
    closeModal: closeDataIncompleteModal,
    isOpen: isDataIncompleteModalOpen,
  } = useModalControls();
  const {
    isOpen: isScanDocumentsModalOpen,
    closeModal: closeScanDocumentsModal,
    openModal: openScanDocumentsModal,
  } = useModalControls();
  const {
    isOpen: isUploadDocumentsModalOpen,
    closeModal: closeUploadDocumentsModal,
    openModal: openUploadDocumentsModal,
  } = useModalControls();
  const {
    isOpen: isScanModalOpen,
    closeModal: closeScanModal,
    openModal: openScanModal,
  } = useModalControls();
  const {
    isOpen: isScanProcessingModalOpen,
    closeModal: closeScanProcessingModal,
    openModal: openScanProcessingModal,
  } = useModalControls();
  const {
    isOpen: isScanSuccessModalOpen,
    closeModal: closeScanSuccessModal,
    openModal: openScanSuccessModal,
  } = useModalControls();
  const {
    isOpen: isSignatureModalOpen,
    closeModal: closeSignatureModal,
    openModal: openSignatureModal,
  } = useModalControls();
  const {
    openModal: openDeleteGuestModal,
    closeModal: closeDeleteGuestModal,
    isOpen: isDeleteGuestModalOpen,
  } = useModalControls();
  const {
    openModal: openSavingGuestModal,
    closeModal: closeSavingGuestModal,
    isOpen: isSavingGuestModalOpen,
  } = useModalControls();
  const {
    setStatus: setDeleteGuestStatus,
    isLoading: isDeletingGuest,
    isSuccess: isGuestDeleted,
    isIdle: isGuestDeletionIdle,
  } = useStatus();
  const {
    setStatus: setSavingGuestStatus,
    isLoading: isSavingGuest,
    isSuccess: isGuestSaved,
  } = useStatus();

  const {
    openModal: openViewDocumentsModal,
    closeModal: closeViewDocumentsModal,
    isOpen: isViewDocumentsModalOpen,
  } = useModalControls();
  const {
    openModal: openConfirmDocumentDeletionModal,
    closeModal: closeConfirmDocumentDeletionModal,
    isOpen: isConfirmDocumentDeletionModalOpen,
  } = useModalControls();

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const signatureRef = React.useRef<ReactSignatureCanvas>(null);
  const webcamRef = React.useRef<WebcamRefTypes>(null);

  const [isValidGuestId, setIsValidGuestId] = React.useState(true);
  const [isSignatureEnabled, setIsSignatureEnabled] = React.useState(false);
  const [initGuestData, setInitGuestData] = React.useState<Guest | null>(null);
  const [isGuestWithDoc, setIsGuestWithDoc] = React.useState(false);
  const [isGuestLeader, setIsGuestLeader] = React.useState(false);
  const [hasAnyCompletePoliceGuest, setHasAnyCompletePoliceGuest] = React.useState(false);
  const [areFieldsLoaded, setAreFieldsLoaded] = React.useState(false);
  const [isNationalityPreloaded, setIsNationalityPreloaded] = React.useState(false);
  const [isWebcamReady, setIsWebcamReady] = React.useState(false);
  const [wasDataIncompleteModalOpened, setWasDataIncompleteModalOpened] = React.useState(
    false,
  );
  const [documentSaveStep, setDocumentSaveStep] = React.useState(0);
  const [isLocationDataPreloaded, setIsLocationDataPreloaded] = React.useState(false);
  const [ocrWasUsed, setOcrWasUsed] = React.useState(false);

  const docType = watch(FORM_NAMES.docType)?.value;
  const nationality = watch(FORM_NAMES.nationality)?.value;
  const arrivalDistrict = watch(FORM_NAMES.arrivalDistrict)?.value || '';
  const arrivalMunicipality = watch(FORM_NAMES.arrivalMunicipality)?.value;
  const nextDestinationDistrict = watch(FORM_NAMES.nextDestinationDistrict)?.value || '';
  const nextDestinationMunicipality = watch(FORM_NAMES.nextDestinationMunicipality)
    ?.value;
  const guestName = watch(FORM_NAMES.name);
  const signature = watch(FORM_NAMES.signature);
  const backSideScan = watch(FORM_NAMES.backSideScan);
  const frontSideScan = watch(FORM_NAMES.frontSideScan);
  const citizenship = watch(FORM_NAMES.citizenship)?.value;
  const birthCountry = watch(FORM_NAMES.birthCountry)?.value;
  const countryOfIssue = watch(FORM_NAMES.countryOfIssue)?.value;
  const arrivalCountry = watch(FORM_NAMES.arrivalCountry)?.value;
  const residenceCountry = watch(FORM_NAMES.residenceCountry)?.value;
  const nextDestinationCountry = watch(FORM_NAMES.nextDestinationCountry)?.value;

  const isEditingGuest = Boolean(guestId && isValidGuestId);

  const {
    status: reservationStatus,
    data: reservation,
    error: reservationError,
    refetch: refetchReservation,
  } = useQuery<LightReservation>(reservationId, () => fetchReservation(reservationId), {
    refetchOnWindowFocus: false,
  });
  useErrorToast(reservationError, {
    notFoundMessage: 'Requested booking could not be found. Please contact support.',
  });

  const guestGroupId = reservation?.guest_group_id;
  const {
    data: guestGroup,
    refetch: refetchGuestGroup,
    status: guestGroupStatus,
  } = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
    refetchOnWindowFocus: false,
  });

  const housingId = reservation?.housing_id;
  const {data: queryHousing, status: housingStatus, error: housingError} = useQuery<
    Housing,
    [string, string]
  >(['housing', housingId], () => fetchHousing(housingId), {
    refetchOnWindowFocus: false,
    enabled: Boolean(housingId),
  });
  useErrorToast(housingError, {
    notFoundMessage: 'Requested housing could not be found. Please contact support.',
  });

  const managerId = user?.manager || '';
  const {
    data: housingCustomForms,
    status: housingCustomFormsStatus,
    error: housingCustomFormsError,
  } = useQuery<CustomForm[]>(
    ['customFormByHousing', housingId!],
    () => fetchCustomForm(housingId!, managerId),
    {
      enabled: Boolean(housingId),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(housingCustomFormsError, {
    notFoundMessage:
      'Requested housing custom forms could not be found. Please contact support.',
  });
  const customForm = housingCustomForms?.length ? housingCustomForms[0] : null;
  const hasCustomForm = Boolean(customForm);
  const hasSomeCustomField = React.useMemo(() => {
    return customForm?.fields_set?.some(({field}) => {
      return field.is_custom;
    });
  }, [customForm]);

  const {
    data: customFields,
    status: customFieldsStatus,
    error: customFieldsError,
  } = useQuery<CustomFieldData>(
    ['guestCustomFields', guestId],
    () => fetchCustomFields(guestId, managerId),
    {
      enabled: Boolean(
        hasSomeCustomField && isEditingGuest && guestId && guestId !== 'new',
      ),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(customFieldsError, {
    notFoundMessage:
      'Requested custom fields data could not be found. Please contact support.',
  });

  const isHousingPoliceActivated = queryHousing?.is_auto_police_registration_enabled;
  const housingCountry =
    location.state?.formData?.housing_id?.country || getCountryCode(queryHousing);
  const housing = location.state?.formData?.housing_id?.data || queryHousing || null;
  const guestGroupType = guestGroup?.type;
  const hasItalianLeaderWithGuestMembers = getIsItalianLeaderWithMembers(
    housingCountry,
    guestGroup,
    guestId,
  );

  const {countries: locations, status: locationsStatus} = useCountriesOptions({});

  const {data: provinces, error: provincesError, status: provincesStatus} = useQuery(
    ['provinces', `country=${housingCountry}&ordering=name`],
    (context) => fetchLocations(context.queryKey[1]),
    {
      enabled: getIsNeedToFetchProvinces(
        housingCountry,
        getIsCaptureStatFieldsEnabled(housing),
      ),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  useErrorToast(provincesError, {
    notFoundMessage: 'Requested provinces could not be found. Please contact support.',
  });
  const {data: districts, error: districtsError, status: districtsStatus} = useQuery(
    ['districts', `country=${housingCountry}&ordering=name&division_level=1`],
    (context) => fetchLocations(context.queryKey[1]),
    {
      enabled: getIsNeedToFetchDistricts(housingCountry),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  useErrorToast(districtsError, {
    notFoundMessage: 'Requested districts could not be found. Please contact support.',
  });
  const {data: cities, error: citiesError, status: citiesStatus} = useQuery(
    ['cities', `country=${housingCountry}&ordering=name&division_level=3`],
    (context) => fetchLocations(context.queryKey[1]),
    {
      enabled: getIsNeedToFetchCities(housingCountry),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  useErrorToast(citiesError, {
    notFoundMessage: 'Requested cities could not be found. Please contact support.',
  });
  const {
    data: purposesOfStay,
    error: purposesOfStayError,
    status: purposesOfStayStatus,
  } = useQuery(
    ['purposesOfStay', `country=${housingCountry}`],
    () => fetchPurposesOfStay(`country=${housingCountry}`),
    {
      enabled: getIsNeedToFetchPurposesOfStay(housingCountry, isGuestLeader),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  useErrorToast(purposesOfStayError, {
    notFoundMessage:
      'Requested purposes of stay could not be found. Please contact support.',
  });
  const {
    data: taxExemptions,
    error: taxExemptionsError,
    status: taxExemptionsStatus,
  } = useQuery(
    ['taxExemptions', getStatTypeExemptionTypeParams(housingCountry)],
    () => fetchTaxExemptions(getStatTypeExemptionTypeParams(housingCountry)),
    {
      enabled: getIsNeedToFetchTaxExemptions(housingCountry, housing),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  useErrorToast(taxExemptionsError, {
    notFoundMessage:
      'Requested tax exemptions could not be found. Please contact support.',
  });
  const {
    data: arrivalMunicipalities,
    error: arrivalMunicipalitiesError,
    status: arrivalMunicipalitiesStatus,
  } = useQuery(
    [
      'arrivalMunicipalities',
      `country=${housingCountry}&ordering=name&division_level=2&department=${arrivalDistrict}`,
    ],
    (context) => fetchLocations(context.queryKey[1]),
    {
      enabled: getIsNeedToFetchMunicipalities(housingCountry),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  const prevArrivalMunicipalities = usePrevious(arrivalMunicipalities);
  useErrorToast(arrivalMunicipalitiesError, {
    notFoundMessage:
      'Requested municipalities could not be found. Please contact support.',
  });
  const {
    data: nextDestinationMunicipalities,
    error: nextDestinationMunicipalitiesError,
    status: nextDestinationMunicipalitieseStatus,
  } = useQuery(
    [
      'nextDestinationMunicipalities',
      `country=${housingCountry}&ordering=name&division_level=2&department=${nextDestinationDistrict}`,
    ],
    (context) => fetchLocations(context.queryKey[1]),
    {
      enabled: getIsNeedToFetchMunicipalities(housingCountry),
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * CACHE_TIME,
      staleTime: 1000 * 60 * STALE_TIME,
    },
  );
  const prevNextDestinationMunicipalities = usePrevious(nextDestinationMunicipalities);
  useErrorToast(nextDestinationMunicipalitiesError, {
    notFoundMessage:
      'Requested municipalities could not be found. Please contact support.',
  });

  const isLoading =
    reservationStatus === 'loading' ||
    citiesStatus === 'loading' ||
    housingStatus === 'loading' ||
    guestGroupStatus === 'loading' ||
    locationsStatus === 'loading' ||
    housingCustomFormsStatus === 'loading' ||
    customFieldsStatus === 'loading' ||
    provincesStatus === 'loading' ||
    districtsStatus === 'loading' ||
    purposesOfStayStatus === 'loading' ||
    taxExemptionsStatus === 'loading' ||
    arrivalMunicipalitiesStatus === 'loading' ||
    nextDestinationMunicipalitieseStatus === 'loading';

  const locationsAsOptions = React.useMemo(() => {
    return getLocationsAsOptions(locations);
  }, [locations]);
  const provincesAsOptions = React.useMemo(() => {
    return getProvincesAsOptions(provinces);
  }, [provinces]);
  const districtsAsOptions = React.useMemo(() => {
    return getDistrictsAsOptions(districts);
  }, [districts]);
  const citiesAsOptions = React.useMemo(() => {
    return getCitiesAsOptions(cities);
  }, [cities]);
  const arrivalMunicipalitiesAsOptions = React.useMemo(() => {
    return getProvincesAsOptions(arrivalMunicipalities);
  }, [arrivalMunicipalities]);
  const nextDestinationMunicipalitiesAsOptions = React.useMemo(() => {
    return getProvincesAsOptions(nextDestinationMunicipalities);
  }, [nextDestinationMunicipalities]);
  const purposesOfStayAsOptions = React.useMemo(() => {
    return getPurposesOfStayAsOptions(purposesOfStay);
  }, [purposesOfStay]);
  const taxExemptionsAsOptions = React.useMemo(() => {
    return getTaxExemptionsAsOptions(taxExemptions);
  }, [taxExemptions]);

  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const handleDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (PDF_UPLOADING_ALLOWED_COUNTRIES.includes(housingCountry)) {
        const idDubai = housingCountry === COUNTRY_CODES.uae;

        if (idDubai && !/(\.jpg|\.jpeg|\.pdf)/i.test(file?.name)) {
          toast.error(
            addSupportEmailToMessage(t('incorrect_file_type_only_jpg_and_pdf_allowed')),
          );
          return;
        }

        if (!/(\.jpg|\.jpeg|\.png|\.pdf)/i.test(file?.name)) {
          toast.error(
            addSupportEmailToMessage(
              t('incorrect_file_type_only_pdf_and_file_types_allowed'),
            ),
          );
          return;
        }
        setUploadedFile(file);
        return;
      }

      if (!/(\.jpg|\.jpeg|\.png)/i.test(file?.name)) {
        toast.error(
          addSupportEmailToMessage(t('incorrect_file_type_only_file_types_allowed')),
        );
        return;
      }

      setUploadedFile(file);
    },
    [t, housingCountry],
  );

  const {
    getInputProps: getDropZoneInputProps,
    getRootProps: getDropZoneRootProps,
    isDragActive: isDropZoneDragActive,
  } = useDropzone({
    onDrop: handleDrop,
  });
  const {getInputProps, getRootProps, isDragActive} = useDropzone({
    onDrop: handleDrop,
  });

  const isSaltoLock = Boolean(
    location.state.locks?.some((lock) => lock.vendor === LOCK_VENDORS.salto),
  );

  const [fields, setFields] = React.useState(() => {
    return getFields({
      isSaltoLock,
      housing,
      isGuestLeader,
      hasAnyCompletePoliceGuest,
      housingCountry,
      nationalityCode: nationality,
      guestGroupType,
      isGuestWithDoc,
      isEditingGuest,
      isPoliceActivated: isHousingPoliceActivated,
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
    return getDocTypes(housingCountry, nationality, residenceCountry);
  });

  React.useLayoutEffect(
    function updateFields() {
      if (!reservation || isLoading) {
        return;
      }

      const nextFields = getFields({
        isSaltoLock,
        isGuestLeader,
        hasAnyCompletePoliceGuest,
        housing,
        housingCountry,
        guestGroupType,
        nationalityCode: nationality,
        isGuestWithDoc,
        isEditingGuest,
        isCustomForm: hasCustomForm,
        isPoliceActivated: isHousingPoliceActivated,
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
      setAreFieldsLoaded(true);
    },
    [
      hasCustomForm,
      housingCountry,
      birthCountry,
      countryOfIssue,
      citizenship,
      arrivalCountry,
      nextDestinationCountry,
      residenceCountry,
      housing,
      nationality,
      isGuestLeader,
      hasAnyCompletePoliceGuest,
      areFieldsLoaded,
      reservation,
      guestGroupType,
      docType,
      isGuestWithDoc,
      isEditingGuest,
      isSaltoLock,
      isLoading,
      isHousingPoliceActivated,
    ],
  );

  React.useEffect(
    function preloadInitGuestData() {
      if (!guestId || !guestGroup || isLoading) {
        return;
      }

      const {isLeader, data} = getGuestDetails({guestGroup, guestId});
      setIsGuestLeader(isLeader);

      const hasAnyComplete = hasAnyCompletedGuest(getGuestPoliceStatusInCode, guestGroup);
      setHasAnyCompletePoliceGuest(hasAnyComplete);

      if (!data) {
        setIsValidGuestId(false);
        return;
      }

      setInitGuestData(data);
    },
    [guestGroup, guestId, isLoading],
  );

  React.useEffect(
    function revalidateFormOnFieldsChange() {
      if (formState.isSubmitted) {
        trigger();
      }
    },
    [trigger, fields, formState.isSubmitted],
  );

  React.useEffect(
    function preloadGuestData() {
      if (!initGuestData || !areFieldsLoaded) {
        return;
      }

      const visa = initGuestData?.documents?.find((d) => {
        return d.type === CARD_BRANDS.visa;
      });

      setIsGuestWithDoc(Boolean(initGuestData?.document));

      reset({
        ...getValues(),
        [FORM_NAMES.sex]: GENDERS_OPTIONS.find((o) => o.value === initGuestData?.gender),
        [FORM_NAMES.name]: initGuestData?.name,
        [FORM_NAMES.surname]: initGuestData?.surname,
        [FORM_NAMES.secondSurname]: initGuestData?.second_surname,
        [FORM_NAMES.birthDate]: initGuestData?.birth_date
          ? new Date(initGuestData?.birth_date)
          : undefined,
        [FORM_NAMES.docDateOfIssue]: initGuestData?.document?.issue_date
          ? new Date(initGuestData?.document?.issue_date)
          : undefined,
        [FORM_NAMES.docNumber]: initGuestData?.document?.number,
        [FORM_NAMES.residenceCity]: initGuestData?.residence?.city,
        [FORM_NAMES.cityOfBirth]: initGuestData?.birth_place?.city,
        [FORM_NAMES.residenceAddress]: initGuestData?.residence?.address,
        [FORM_NAMES.nextDestinationAddress]: initGuestData?.next_destination?.address,
        [FORM_NAMES.nextDestinationCity]: initGuestData?.next_destination?.city,
        [FORM_NAMES.residencePostalCode]: initGuestData?.residence?.postal_code,
        [FORM_NAMES.visaNumber]: visa?.number,
        [FORM_NAMES.cityOfIssue]: initGuestData?.document?.issue_place?.city,
        [FORM_NAMES.email]: initGuestData?.email,
        [FORM_NAMES.phone]: initGuestData?.phone,
        [FORM_NAMES.fiscalCode]: initGuestData?.fiscal_code,
        [FORM_NAMES.fullTouristTax]: initGuestData?.full_tourist_tax,
      });
    },
    [initGuestData, setValue, areFieldsLoaded, reset, getValues],
  );

  React.useEffect(
    function preloadNationality() {
      if (!locationsAsOptions?.length || !areFieldsLoaded) {
        return;
      }

      const nationality = locationsAsOptions.find(
        (l) => l.value === initGuestData?.nationality?.code,
      );
      reset({
        ...getValues(),
        [FORM_NAMES.nationality]: nationality,
      });

      setIsNationalityPreloaded(true);
    },
    [locationsAsOptions, initGuestData, setValue, areFieldsLoaded, reset, getValues],
  );

  React.useEffect(
    function updateDifferDocType() {
      const docType = getValues()[FORM_NAMES.docType] as SelectOption;

      if (citizenship && !docType) {
        const newDocType = docTypes.find(
          (singleDocType) => singleDocType?.value === initGuestData?.document?.type,
        );
        setValue(FORM_NAMES.docType, newDocType);
      }
    },
    [docTypes, citizenship, initGuestData?.document?.type, getValues, setValue],
  );

  React.useEffect(
    function preloadLocationData() {
      if (!initGuestData || !isNationalityPreloaded || isLocationDataPreloaded) {
        return;
      }

      const birthCountry = locationsAsOptions.find(
        (l) => l.value === initGuestData?.birth_place?.country?.code,
      );

      const docType = docTypes.find((t) => t?.value === initGuestData?.document?.type);

      const residenceCountry = locationsAsOptions.find(
        (l) => l.value === initGuestData?.residence?.country?.code,
      );
      const countryOfIssue = locationsAsOptions.find(
        (l) => l.value === initGuestData?.document?.issue_place?.country?.code,
      );
      const nextDestinationCountry = locationsAsOptions.find(
        (l) => l.value === initGuestData?.next_destination?.country?.code,
      );
      const citizenship = locationsAsOptions.find(
        (l) => l.value === initGuestData?.citizenship?.code,
      );

      const arrivalCountry = locationsAsOptions.find(
        (l) => l.value === initGuestData?.arrived_from?.country?.code,
      );

      reset({
        ...getValues(),
        [FORM_NAMES.birthCountry]: birthCountry,
        [FORM_NAMES.docType]: docType,
        [FORM_NAMES.residenceCountry]: residenceCountry,
        [FORM_NAMES.countryOfIssue]: countryOfIssue,
        [FORM_NAMES.nextDestinationCountry]: nextDestinationCountry,
        [FORM_NAMES.citizenship]: citizenship,
        [FORM_NAMES.arrivalCountry]: arrivalCountry,
      });
      setIsLocationDataPreloaded(true);
    },
    [
      docTypes,
      getValues,
      isLocationDataPreloaded,
      initGuestData,
      isNationalityPreloaded,
      locationsAsOptions,
      reset,
      setValue,
    ],
  );

  React.useEffect(
    function preloadCitiesData() {
      if (
        !citiesAsOptions?.length ||
        !isNationalityPreloaded ||
        !initGuestData ||
        !isLocationDataPreloaded
      ) {
        return;
      }

      const cityOfBirth = citiesAsOptions.find(
        (c) => c.value === initGuestData?.birth_place?.division_level_3,
      );
      if (cityOfBirth) {
        reset({
          ...getValues(),
          [FORM_NAMES.cityOfBirth]: cityOfBirth,
        });
      }

      const residenceCity = citiesAsOptions.find(
        (c) => c.value === initGuestData?.residence?.division_level_3,
      );
      if (residenceCity) {
        reset({
          ...getValues(),
          [FORM_NAMES.residenceCity]: residenceCity,
        });
      }

      const cityOfIssue = citiesAsOptions.find(
        (c) => c.value === initGuestData?.document?.issue_place?.division_level_3,
      );
      if (cityOfIssue) {
        reset({
          ...getValues(),
          [FORM_NAMES.cityOfIssue]: cityOfIssue,
        });
      }
    },
    [
      citiesAsOptions,
      getValues,
      initGuestData,
      isNationalityPreloaded,
      reset,
      setValue,
      isLocationDataPreloaded,
      citiesStatus,
    ],
  );

  React.useEffect(
    function preloadDistrictsData() {
      if (!districtsAsOptions?.length || !isNationalityPreloaded) {
        return;
      }

      const arrivalDistrict = districtsAsOptions.find(
        (d) => d.value === initGuestData?.arrived_from?.division_lvl_1?.code,
      );
      if (arrivalDistrict) {
        reset({
          ...getValues(),
          [FORM_NAMES.arrivalDistrict]: arrivalDistrict,
        });
      }

      const nextDestinationDistrict = districtsAsOptions.find(
        (d) => d.value === initGuestData?.next_destination?.divistion_level_1?.code,
      );
      if (nextDestinationDistrict) {
        reset({
          ...getValues(),
          [FORM_NAMES.nextDestinationDistrict]: nextDestinationDistrict,
        });
      }
    },
    [
      districtsAsOptions,
      getValues,
      initGuestData,
      isNationalityPreloaded,
      reset,
      setValue,
    ],
  );

  React.useEffect(
    function preloadProvincesData() {
      if (!provincesAsOptions?.length || !isNationalityPreloaded) {
        return;
      }

      const residenceProvince = provincesAsOptions.find(
        (p) => p?.value === initGuestData?.residence?.division_level_2,
      );
      if (residenceProvince) {
        reset({
          ...getValues(),
          [FORM_NAMES.residenceProvince]: residenceProvince,
        });
      }
    },
    [
      getValues,
      initGuestData,
      isNationalityPreloaded,
      provincesAsOptions,
      reset,
      setValue,
    ],
  );

  React.useEffect(
    function preloadPurposeOfStay() {
      if (!purposesOfStayAsOptions?.length || !isNationalityPreloaded) {
        return;
      }
      const purposeOfStay = purposesOfStayAsOptions.find(
        (p) => p?.value === initGuestData?.purpose_of_stay,
      );
      if (purposeOfStay) {
        reset({
          ...getValues(),
          [FORM_NAMES.purposeOfStay]: purposeOfStay,
        });
      }
    },
    [initGuestData, isNationalityPreloaded, purposesOfStayAsOptions, reset, getValues],
  );

  React.useEffect(
    function preloadTaxExemptions() {
      if (!taxExemptionsAsOptions?.length || !isNationalityPreloaded) {
        return;
      }
      const taxExemption = taxExemptionsAsOptions.find(
        (t) => t?.value === initGuestData?.tax_exemption,
      );
      if (taxExemption) {
        reset({
          ...getValues(),
          [FORM_NAMES.taxExemption]: taxExemption,
        });
      }
    },
    [taxExemptionsAsOptions, isNationalityPreloaded, initGuestData, reset, getValues],
  );

  React.useEffect(
    function preloadSignature() {
      if (!initGuestData?.signature) {
        return;
      }

      reset({
        ...getValues(),
        [FORM_NAMES.signature]: initGuestData.signature,
      });
    },
    [initGuestData, getValues, reset],
  );

  React.useEffect(
    function preloadDocuments() {
      if (
        !initGuestData?.document?.front_side_scan &&
        !initGuestData?.document?.back_side_scan
      ) {
        return;
      }

      reset({
        ...getValues(),
        [FORM_NAMES.frontSideScan]: initGuestData?.document?.front_side_scan,
        [FORM_NAMES.backSideScan]: initGuestData?.document?.back_side_scan,
      });
    },
    [initGuestData, setValue, getValues, reset],
  );

  const isFrontSideScanVisible = fields.display[FORM_NAMES.frontSideScan];
  const isFrontSideScanRequired = fields.required[FORM_NAMES.frontSideScan];
  const isBackSideScanVisible = fields.display[FORM_NAMES.backSideScan];
  const isBackSideScanRequired = fields.required[FORM_NAMES.backSideScan];
  const isSignatureVisible = fields.display[FORM_NAMES.signature];
  const isSignatureRequired = fields.required[FORM_NAMES.signature];

  const registerUncontrolledFields = () => {
    if (isFrontSideScanVisible) {
      register(FORM_NAMES.frontSideScan, {
        required: isFrontSideScanRequired,
      });
    }
    if (isBackSideScanVisible) {
      register(FORM_NAMES.backSideScan, {
        required: isBackSideScanRequired,
      });
    }
    if (isSignatureVisible) {
      register(FORM_NAMES.signature, {
        required: isSignatureRequired,
      });
    }
  };
  registerUncontrolledFields();

  React.useEffect(
    function revalidateSignatureOnChange() {
      if (formState.isSubmitted) {
        trigger(FORM_NAMES.signature);
      }
    },
    [formState.isSubmitted, trigger, signature],
  );

  React.useEffect(
    function setDocTypesOnNationalityOrReservationChange() {
      const nextDocTypes = getDocTypes(
        housingCountry,
        nationality,
        residenceCountry,
        citizenship,
      );

      const shouldResetDocType = getShouldResetDocTypes(
        nextDocTypes,
        getValues()[FORM_NAMES.docType] as SelectOption,
      );
      if (shouldResetDocType) {
        setValue(FORM_NAMES.docType, undefined);
      }
      setDocTypes(nextDocTypes);
    },
    [citizenship, nationality, setValue, getValues, housingCountry, residenceCountry],
  );

  React.useEffect(
    function revalidateDocNumberOnDocTypeChange() {
      if (formState.isSubmitted) {
        trigger(FORM_NAMES.docNumber);
      }
    },
    [docType, formState.isSubmitted, trigger],
  );

  React.useEffect(
    function revalidateDocumentPhotosOnChange() {
      if (formState.isSubmitted) {
        trigger([FORM_NAMES.frontSideScan, FORM_NAMES.backSideScan]);
      }
    },
    [frontSideScan, backSideScan, formState.isSubmitted, trigger],
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

      const hasOption = arrivalMunicipalitiesAsOptions.some((m) => {
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

      const hasOption = nextDestinationMunicipalitiesAsOptions.some((m) => {
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

  React.useLayoutEffect(
    function showIncompleteModalOneTime() {
      const shouldOpenModal =
        formState.isSubmitted && !prevFormState?.isValid && !formState.isValid;

      if (shouldOpenModal && !wasDataIncompleteModalOpened) {
        openDataIncompleteModal();
        setWasDataIncompleteModalOpened(true);
      }
    },
    [
      formState.isSubmitted,
      formState.isValid,
      prevFormState,
      wasDataIncompleteModalOpened,
      openDataIncompleteModal,
    ],
  );

  const buildFormDataFromCustomFields = React.useCallback(
    ({custom_data}: CustomFieldData) => {
      const formData: {[key: string]: SelectOption | string | undefined} = {};

      if (!custom_data) {
        return {};
      }

      Object.keys(custom_data).forEach((key) => {
        const value = custom_data[key];

        if (PATTERNS.time.test(value)) {
          formData[key] = TIME_OPTIONS.find((option) => {
            return option.value === value;
          });
          return;
        }

        formData[key] = value;
      });

      return formData;
    },
    [],
  );

  React.useEffect(
    function loadCustomFields() {
      if (!customFields?.id) {
        return;
      }

      const formData = buildFormDataFromCustomFields(customFields);
      reset({...getValues(), ...formData});
    },
    [customFields, getValues, reset, buildFormDataFromCustomFields],
  );

  const goBack = () => {
    history.push(`/bookings/${reservationId}`, location.state);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement> | string) => {
    if (typeof event === 'string') {
      return '';
    }

    const files = event?.target?.files;

    if (files?.length) {
      return files[0];
    }
    return '';
  };

  const renderScanView = (document: string) => {
    if (document.startsWith('data:application/pdf;')) {
      return <SaveGuestText>{t('save_guest_to_open_doc')}</SaveGuestText>;
    }

    if (/\.pdf/.test(document)) {
      return (
        <ViewDocumentLink href={document} target="_blank">
          {t('open_document')}
        </ViewDocumentLink>
      );
    }
    return <DocumentPhoto src={document} alt="Document" />;
  };

  const renderUploadedFile = () => {
    if (!uploadedFile) {
      return null;
    }

    if (/\.pdf/.test(uploadedFile?.name)) {
      return <UploadedPDFWrapper>{uploadedFile.name}</UploadedPDFWrapper>;
    }

    const url = URL.createObjectURL(uploadedFile);
    return (
      <UploadedImageWrapper>
        <img src={url} alt="Document" />
      </UploadedImageWrapper>
    );
  };

  const saveDocumentFile = async () => {
    if (!uploadedFile) {
      displayError('Uploaded file is missing. Please contact support.');
      return;
    }

    getBase64(uploadedFile).then(
      (file) => {
        if (documentSaveStep === 0) {
          setUploadedFile(null);
          setValue(FORM_NAMES.frontSideScan, file, {shouldTouch: true});

          if (fields.display[FORM_NAMES.backSideScan]) {
            setDocumentSaveStep(1);
            return;
          }
        }

        if (fields.display[FORM_NAMES.backSideScan] && documentSaveStep === 1) {
          setUploadedFile(null);
          setValue(FORM_NAMES.backSideScan, file, {shouldTouch: true});
        }

        closeUploadDocumentsModal();
      },
      (error) => {
        displayError(error);
      },
    );
  };

  const handleWebcamReady = () => {
    setIsWebcamReady(true);
  };

  const closeSaveDocumentsModalAndResetDocumentStep = () => {
    setDocumentSaveStep(0);
    closeScanDocumentsModal();
  };

  const openSaveDocumentModalAndResetActiveStep = () => {
    setDocumentSaveStep(0);
    openScanDocumentsModal();
  };

  const saveDocumentPhoto = () => {
    const photo = webcamRef?.current?.getScreenshot();

    if (documentSaveStep === 0) {
      setValue(FORM_NAMES.frontSideScan, photo, {shouldTouch: true});

      if (fields.display[FORM_NAMES.backSideScan]) {
        setDocumentSaveStep(1);
        return;
      }
    }

    if (fields.display[FORM_NAMES.backSideScan] && documentSaveStep === 1) {
      setValue(FORM_NAMES.backSideScan, photo, {shouldTouch: true});
    }

    closeSaveDocumentsModalAndResetDocumentStep();
  };

  const clearDocumentPhotosAndCloseDeleteConfirmationModal = () => {
    setValue(FORM_NAMES.frontSideScan, null, {shouldTouch: true});
    setValue(FORM_NAMES.backSideScan, null, {shouldTouch: true});
    closeConfirmDocumentDeletionModal();
  };

  const abortRequestAndOpenScanModal = () => {
    abortController.abort();
    openScanModal();
  };

  const closeErrorModalAndReopenScanModal = () => {
    closeErrorModal();
    openScanModal();
  };

  const handleSignatureEnable = () => {
    setIsSignatureEnabled(true);
  };

  const saveSignature = () => {
    const canvasSignature = signatureRef.current?.getCanvas()?.toDataURL();
    setValue(FORM_NAMES.signature, canvasSignature);
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setValue(FORM_NAMES.signature, null);
  };

  const onSignatureModalClose = () => {
    clearSignature();

    closeSignatureModal();
    setIsSignatureEnabled(false);
  };

  const onSignatureSubmit = () => {
    closeSignatureModal();
    setIsSignatureEnabled(false);
  };

  const handleDetectionError = (error: any = null, aborted = false) => {
    closeScanProcessingModal();
    if (!aborted) {
      displayError(error);
    }
  };

  const buildFormData = (detectedData: any) => {
    if (!detectedData) {
      displayError({
        message: 'Data is missing',
      });
      return [];
    }

    const birthDate =
      detectedData?.valid_date_of_birth && detectedData?.date_of_birth
        ? new Date(detectedData.date_of_birth)
        : undefined;
    const docDateOfIssue =
      detectedData?.valid_expiration_date && detectedData?.expiration_date
        ? subYears(new Date(detectedData.expiration_date), 10)
        : undefined;

    const sex = GENDERS_OPTIONS.find((g) => g.value === detectedData?.sex);
    const nationality = locationsAsOptions.find((l) => {
      return l?.value === detectedData?.nationality;
    });

    const remappedDocType = getRemappedDocType({
      docType: detectedData?.type_doc,
      countryCode: housingCountry,
    });

    const docType = getDocTypes(
      housingCountry,
      detectedData?.nationality,
      detectedData?.residence,
    ).find((o) => {
      return o?.value === remappedDocType;
    });

    return [
      {name: FORM_NAMES.sex, value: sex},
      {name: FORM_NAMES.docDateOfIssue, value: docDateOfIssue},
      {name: FORM_NAMES.birthDate, value: birthDate},
      {name: FORM_NAMES.nationality, value: nationality},
      {name: FORM_NAMES.docType, value: docType},
      {name: FORM_NAMES.residenceCountry, value: nationality},
      {name: FORM_NAMES.docNumber, value: detectedData?.number},
      {name: FORM_NAMES.name, value: getValidName(detectedData?.names)},
      {name: FORM_NAMES.surname, value: getValidName(detectedData?.first_surname)},
      {name: FORM_NAMES.secondSurname, value: getValidName(detectedData?.second_surname)},
    ];
  };

  const handleDetectionSuccess = (data: any) => {
    const formData = buildFormData(data);
    formData.forEach(({value, name}) => {
      setValue(name, value);
    });
    closeScanProcessingModal();
    openScanSuccessModal();
    setOcrWasUsed(true);

    timeoutRef.current = setTimeout(() => {
      closeScanSuccessModal();
    }, 1000 * SUCCESS_MODAL_TIMEOUT_S);
  };

  const checkMRZDetection = async (id: string) => {
    if (!id) {
      handleDetectionError({
        message: 'MRZ Check Id is missing.',
      });
      return;
    }

    const {data, error, aborted} = await api.ocr.checkImageMRZDetection(id, {
      signal: setupAbortController(),
    });

    if (!isMounted.current) {
      return;
    }

    if (error) {
      handleDetectionError(error, aborted);
      return;
    }

    if (data?.status === DETECTING_STATUSES.completed) {
      if (data?.mrz_detected && data?.valid_composite) {
        handleDetectionSuccess(data);
      } else {
        handleDetectionError({
          message: t('could_not_detect'),
        });
      }

      return;
    }

    if (data?.status === DETECTING_STATUSES.error) {
      handleDetectionError({
        message: t('could_not_detect'),
      });
      return;
    }

    return new Promise((resolve) => {
      timeoutRef.current = setTimeout(() => {
        resolve(checkMRZDetection(id));
      }, 1000 * DETECTING_REQUESTS_GAP_S);
    });
  };

  const startMRZDetection = async (image = '') => {
    openScanProcessingModal();
    closeScanModal();
    const {data, error, aborted} = await api.ocr.sendImageForMRZDetection(image, {
      signal: setupAbortController(),
    });

    if (!isMounted.current) {
      return;
    }

    if (error) {
      handleDetectionError(error, aborted);
      return;
    }

    if (data?.status === DETECTING_STATUSES.completed) {
      if (data?.mrz_detected && data?.valid_composite) {
        handleDetectionSuccess(data);
      } else {
        handleDetectionError({
          message: t('could_not_detect'),
        });
      }

      return;
    }

    if (data?.status === DETECTING_STATUSES.error) {
      handleDetectionError({
        message: t('could_not_detect'),
      });
      return;
    }

    await checkMRZDetection(data?.id);
  };

  const captureAndStartValidation = async () => {
    try {
      const image = webcamRef?.current?.getScreenshot();
      await startMRZDetection(image);
    } catch (err) {
      displayError(err);
    }
  };

  const resetCustomFields = () => {
    if (customForm) {
      customForm.fields_set?.forEach(({field}) => {
        reset({...getValues(), [field.name]: null});
      });
    }
    // if (customForm) {
    //   Object.keys(.custom_data).forEach((key) => {
    //     reset({...getValues(), [key]: null});
    //   });
    // }
  };

  const resetFormData = () => {
    reset({
      ...getValues(),
      [FORM_NAMES.name]: null,
      [FORM_NAMES.surname]: null,
      [FORM_NAMES.secondSurname]: '',
      [FORM_NAMES.sex]: null,
      [FORM_NAMES.birthDate]: null,
      [FORM_NAMES.nationality]: null,
      [FORM_NAMES.docType]: null,
      [FORM_NAMES.docNumber]: '',
      [FORM_NAMES.docDateOfIssue]: null,
      [FORM_NAMES.birthCountry]: null,
      [FORM_NAMES.residenceCountry]: null,
      [FORM_NAMES.cityOfBirth]: null,
      [FORM_NAMES.cityOfIssue]: null,
      [FORM_NAMES.residenceAddress]: '',
      [FORM_NAMES.nextDestinationCountry]: null,
      [FORM_NAMES.nextDestinationCity]: '',
      [FORM_NAMES.nextDestinationAddress]: '',
      [FORM_NAMES.residencePostalCode]: '',
      [FORM_NAMES.citizenship]: null,
      [FORM_NAMES.purposeOfStay]: null,
      [FORM_NAMES.visaNumber]: '',
      [FORM_NAMES.arrivalCountry]: null,
      [FORM_NAMES.arrivalDistrict]: null,
      [FORM_NAMES.arrivalMunicipality]: null,
      [FORM_NAMES.nextDestinationDistrict]: null,
      [FORM_NAMES.nextDestinationMunicipality]: null,
      [FORM_NAMES.taxExemption]: null,
      [FORM_NAMES.residenceProvince]: null,
      [FORM_NAMES.signature]: null,
      [FORM_NAMES.frontSideScan]: null,
      [FORM_NAMES.backSideScan]: null,
      [FORM_NAMES.email]: '',
      [FORM_NAMES.phone]: null,
      [FORM_NAMES.fiscalCode]: null,
    });

    resetCustomFields();
    setIsValidGuestId(false);
  };

  const removeDeletedGuestFromReservation = async () => {
    const {data: guestGroup} = await refetchGuestGroup();

    if (guestGroup) {
      queryClient.setQueryData<GuestGroup>(
        [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
        guestGroup,
      );
    } else {
      queryClient.setQueryData<GuestGroup | undefined>(
        [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          if (guestGroup) {
            return {
              ...oldData,
              guest_group: guestGroup,
            };
          }

          const newMembers = oldData?.members?.filter((m: any) => {
            return m.id !== guestId;
          });

          return {
            ...oldData,
            members: newMembers,
          };
        },
      );
    }
  };

  const deleteGuest = async () => {
    setDeleteGuestStatus('loading');
    const {error} = await api.guests.deleteById(guestId);

    if (error) {
      toastResponseError(error);
      displayError(error);
      setDeleteGuestStatus('idle');
      return;
    }

    resetFormData();
    await removeDeletedGuestFromReservation();
    setDeleteGuestStatus('success');
  };

  const checkFieldsToUpdate = (payload: any) => {
    if (!payload) {
      return false;
    }
    return Object.keys(payload).some((key) => {
      return payload[key] ? RESERVATION_ID_UPDATE_FIELDS.includes(key) : false;
    });
  };

  const getGuestPayload = (data: FormTypes) => {
    const isDeletePhotos = !getValues(FORM_NAMES.frontSideScan);
    const payload = buildGuest(data, {
      reservation,
      ocrWasUsed,
      isDeletePhotos,
      housing: queryHousing,
      documentPhotosId: initGuestData?.document?.id,
    });

    const shouldUseReservationId = checkFieldsToUpdate(payload);

    if (isValidGuestId && !shouldUseReservationId) {
      return {
        ...payload,
        reservation_id: undefined,
      };
    }
    return payload;
  };

  const updateGuestGroup = async (updatedGuest: Guest) => {
    reset(getValues());
    const {data: guestGroup} = await refetchGuestGroup();

    if (guestGroup) {
      queryClient.setQueryData<GuestGroup>(
        [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
        guestGroup,
      );
    } else {
      queryClient.setQueryData<GuestGroup | undefined>(
        [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
        (oldData) => {
          if (!oldData) {
            return oldData;
          }

          if (guestGroup) {
            return {
              ...oldData,
              guest_group: guestGroup,
            };
          }

          const guestId = updatedGuest?.id;
          const nextMembers = oldData?.members?.filter((g: any) => {
            return g?.id !== guestId;
          });

          return {
            ...oldData,
            members: nextMembers,
          };
        },
      );
    }
  };

  const getHasSomeCustomFields = (formData: FormTypes) => {
    const formNames = Object.values(FORM_NAMES);
    const formDataNames = Object.keys(formData);

    return formDataNames
      .filter((name: any) => {
        return !formNames.includes(name);
      })
      .some((name) => {
        return Boolean(formData[name]) || formData[name] === '';
      });
  };

  const createCustomFields = async ({
    formData,
    customFormId,
    guestId,
  }: {
    formData: FormTypes;
    customFormId: string;
    guestId: string;
  }) => {
    const customFieldsPayload = await buildCustomFields(formData);
    const payload = {
      data: customFieldsPayload,
      form_id: customFormId,
      guest_id: guestId,
    };

    return api.guestCustomForm.createFields(
      customFormId,
      payload,
      `user_id=${managerId}`,
    );
  };

  const patchCustomFields = async ({
    formData,
    guestId,
  }: {
    formData: FormTypes;
    guestId: string;
  }) => {
    const customFieldsPayload = await buildCustomFields(formData);
    const payload = {
      data: customFieldsPayload,
    };

    return api.guestCustomForm.patchFields(guestId, payload, `user_id=${managerId}`);
  };

  const updateCustomFields = async ({
    formData,
    customFormId,
    guestId,
  }: {
    formData: FormTypes;
    customFormId: string;
    guestId: string;
  }) => {
    const areCustomFieldsCreated = customFields?.id;

    let result;
    if (areCustomFieldsCreated) {
      result = await patchCustomFields({guestId, formData});
    } else {
      result = await createCustomFields({guestId, customFormId, formData});
    }

    if (!isMounted.current) {
      return;
    }

    if (result.data) {
      queryClient.setQueryData(['guestCustomFields', guestId], [result.data]);
    }

    return result;
  };

  const saveGuest = async (data: FormTypes) => {
    const payload = getGuestPayload(data);
    let savingError: any;
    let updatedGuest: Guest;

    closeSavingTryAgainErrorModal();
    openSavingGuestModal();

    setSavingGuestStatus('loading');
    if (isValidGuestId) {
      const {error, data} = await api.guests.patchById(guestId, payload);
      savingError = error;
      updatedGuest = data;
    } else {
      const {error, data} = await api.guests.post(payload);
      savingError = error;
      updatedGuest = data;
    }

    const isPhoneSavingError =
      savingError?.errors.length && savingError.errors[0]?.field === FORM_NAMES.phone;
    if (isPhoneSavingError) {
      displaySavingError(savingError);
      closeSavingGuestModal();
      return;
    }

    if (savingError) {
      displayTryAgainSavingError(savingError);
      closeSavingGuestModal();
      return;
    }

    if (updatedGuest) {
      await updateGuestGroup(updatedGuest);
    }

    const hasCustomFields = getHasSomeCustomFields(data);
    const customFormId = customForm?.id;

    if (updatedGuest && hasCustomFields && customFormId && guestId) {
      const customFieldsResult = await updateCustomFields({
        customFormId,
        formData: data,
        guestId: updatedGuest.id,
      });

      if (customFieldsResult?.error) {
        displaySavingError(customFieldsResult?.error);
        closeSavingGuestModal();
        return;
      }
    }

    setSavingGuestStatus('success');
  };

  const {
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
  } = useConfirmLeaveModal(formState.isDirty);

  const getAllowedDocTypes = () => {
    if (PDF_UPLOADING_ALLOWED_COUNTRIES.includes(housingCountry)) {
      const isDubai = housingCountry === COUNTRY_CODES.uae;
      if (isDubai) return t('only_jpg_and_pdf_types');
      return t('only_pdf_and_doc_file_types');
    } else {
      return t('only_doc_file_types');
    }
  };

  const onSubmit = async (data: FormTypes) => {
    await saveGuest(data);
  };

  const formFields = React.useMemo(
    () => ({
      [FORM_NAMES.name]: (required = fields.required[FORM_NAMES.name]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.name],
              required,
            )}
            placeholder={t('enter_name')}
            {...register(FORM_NAMES.name, {
              required,
              pattern: {
                value: getNamePattern(housingCountry),
                message: t('cant_contain_number_and_symbols'),
              },
              maxLength: {
                value: MAX_NAMES_INPUT_LENGTH,
                message: t('max_length', {length: MAX_NAMES_INPUT_LENGTH}),
              },
            })}
            control={control}
            error={errors[FORM_NAMES.name]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.surname]: (required = fields.required[FORM_NAMES.surname]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.surname],
              required,
            )}
            placeholder={t('enter_surname')}
            {...register(FORM_NAMES.surname, {
              required,
              pattern: {
                value: getNamePattern(housingCountry),
                message: t('cant_contain_number_and_symbols'),
              },
              maxLength: {
                value: MAX_NAMES_INPUT_LENGTH,
                message: t('max_length', {length: MAX_NAMES_INPUT_LENGTH}),
              },
            })}
            control={control}
            error={errors[FORM_NAMES.surname]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.secondSurname]: (
        required = fields.required[FORM_NAMES.secondSurname],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.secondSurname],
              required,
            )}
            placeholder={t('enter_second_surname')}
            {...register(FORM_NAMES.secondSurname, {
              required,
              pattern: {
                value: getNamePattern(housingCountry),
                message: t('cant_contain_number_and_symbols'),
              },
              maxLength: {
                value: MAX_NAMES_INPUT_LENGTH,
                message: t('max_length', {length: MAX_NAMES_INPUT_LENGTH}),
              },
            })}
            control={control}
            error={errors[FORM_NAMES.secondSurname]?.message}
            disabled={disabled}
          />
        );
      },

      [FORM_NAMES.sex]: (required = fields.required[FORM_NAMES.sex]) => {
        return (
          <Controller
            name={FORM_NAMES.sex}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.sex],
                    required,
                  )}
                  options={GENDERS_OPTIONS}
                  error={(errors[FORM_NAMES.sex] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.nationality]: (required = fields.required[FORM_NAMES.nationality]) => {
        return (
          <Controller
            name={FORM_NAMES.nationality}
            rules={{required}}
            control={control}
            render={({field}) => {
              const isEmpty = !field.value;
              return (
                <Select
                  isEmpty={isEmpty}
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.nationality],
                    required,
                  )}
                  options={locationsAsOptions}
                  disabled={disabled}
                  error={(errors[FORM_NAMES.nationality] as any)?.message}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.citizenship]: (required = fields.required[FORM_NAMES.citizenship]) => {
        return (
          <Controller
            name={FORM_NAMES.citizenship}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.citizenship],
                    required,
                  )}
                  options={locationsAsOptions}
                  disabled={disabled}
                  error={(errors[FORM_NAMES.citizenship] as any)?.message}
                  {...field}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.birthDate]: (required = fields.required[FORM_NAMES.birthDate]) => {
        return (
          <Controller
            name={FORM_NAMES.birthDate}
            rules={{
              required,
              validate: (value) =>
                validateBirthDate(value, getValues()[FORM_NAMES.docDateOfIssue] as Date),
            }}
            control={control}
            render={({field}) => {
              return (
                <Datepicker
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.birthDate],
                    required,
                  )}
                  error={errors[FORM_NAMES.birthDate]?.message}
                  disabled={disabled}
                  {...field}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.birthCountry]: (
        required = fields.required[FORM_NAMES.birthCountry],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.birthCountry}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.birthCountry],
                    required,
                  )}
                  options={locationsAsOptions}
                  error={(errors[FORM_NAMES.birthCountry] as any)?.message}
                  disabled={disabled}
                  {...field}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.cityOfBirth]: (required = fields.required[FORM_NAMES.cityOfBirth]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.cityOfBirth],
              required,
            )}
            placeholder={t('enter_city_of_birth')}
            {...register(FORM_NAMES.cityOfBirth, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.cityOfBirth as any]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.residenceCountry]: (
        required = fields.required[FORM_NAMES.residenceCountry],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.residenceCountry}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.residenceCountry],
                    required,
                  )}
                  options={locationsAsOptions}
                  error={(errors[FORM_NAMES.residenceCountry] as any)?.message}
                  disabled={disabled}
                  {...field}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.residenceProvince]: (
        required = fields.required[FORM_NAMES.residenceProvince],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.residenceProvince}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.residenceProvince],
                    required,
                  )}
                  options={provincesAsOptions}
                  error={(errors[FORM_NAMES.residenceProvince] as any)?.message}
                  disabled={disabled}
                  {...field}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.residenceCity]: (
        required = fields.required[FORM_NAMES.residenceCity],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.residenceCity],
              required,
            )}
            placeholder={t('enter_residence_city')}
            {...register(FORM_NAMES.residenceCity, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.residenceCity as any]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.residenceAddress]: (
        required = fields.required[FORM_NAMES.residenceAddress],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.residenceAddress],
              required,
            )}
            placeholder={t('enter_residence_address')}
            {...register(FORM_NAMES.residenceAddress, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.residenceAddress]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.residencePostalCode]: (
        required = fields.required[FORM_NAMES.residencePostalCode],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.residencePostalCode],
              required,
            )}
            placeholder={t('enter_residence_postal_code')}
            {...register(FORM_NAMES.residencePostalCode, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.residencePostalCode]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.docType]: () => {
        return (
          <Controller
            name={FORM_NAMES.docType}
            rules={{
              validate: (value) => {
                const residenceCountry = (getValues()[
                  FORM_NAMES.residenceCountry
                ] as SelectOption)?.value;
                const nationalityCode = (getValues()[
                  FORM_NAMES.nationality
                ] as SelectOption)?.value;

                const required = getIsDocTypeRequired({
                  housingCountry,
                  nationalityCode,
                  isGuestLeader,
                  guestGroupType,
                  formFields: {
                    residenceCountry,
                  },
                });

                return (!value && required) || true;
              },
            }}
            control={control}
            render={({field}) => {
              return (
                <Select
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.docType],
                    fields.required[FORM_NAMES.docType],
                  )}
                  options={docTypes}
                  error={(errors[FORM_NAMES.docType] as any)?.message}
                  disabled={disabled}
                  {...field}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.docNumber]: (required = fields.required[FORM_NAMES.docNumber]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.docNumber],
              required,
            )}
            placeholder={t('enter_doc_number')}
            {...register(FORM_NAMES.docNumber, {
              required,
              pattern: {
                value: PATTERNS.docNumber,
                message: t('only_basic_letters_are_allowed') as string,
              },
              validate: (value) =>
                validateDocNumber(value, getValues()[FORM_NAMES.docType] as SelectOption),
            })}
            control={control}
            error={errors[FORM_NAMES.docNumber]?.message}
            disabled={disabled}
          />
        );
      },

      [FORM_NAMES.docDateOfIssue]: () => {
        return (
          <Controller
            name={FORM_NAMES.docDateOfIssue}
            rules={{
              validate: (value) => {
                if (!value) {
                  return true;
                }

                const residenceCountry = (getValues()[
                  FORM_NAMES.residenceCountry
                ] as SelectOption)?.value;

                const required = getIsDocDateOfIssueRequired({
                  housingCountry,
                  isGuestLeader,
                  guestGroupType,
                  formFields: {
                    residenceCountry,
                  },
                });

                const error = validateIssueDate(
                  value as Date,
                  getValues()[FORM_NAMES.birthDate] as Date,
                );

                return (!value && required) || error || true;
              },
            }}
            control={control}
            render={({field}) => {
              return (
                <Datepicker
                  {...field}
                  tooltipContent={
                    <Trans i18nKey="date_when_the_doc_created">
                      Date when the document was created. (It is <b>not</b> the expiration
                      date)
                    </Trans>
                  }
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.docDateOfIssue],
                    fields.required[FORM_NAMES.docDateOfIssue],
                  )}
                  error={errors[FORM_NAMES.docDateOfIssue]?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.countryOfIssue]: () => {
        return (
          <Controller
            name={FORM_NAMES.countryOfIssue}
            rules={{
              validate: (value) => {
                const residenceCountry = (getValues()[
                  FORM_NAMES.residenceCountry
                ] as SelectOption)?.value;

                const required = getIsCountryOfIssueRequired({
                  housingCountry,
                  isGuestLeader,
                  guestGroupType,
                  formFields: {
                    residenceCountry,
                  },
                });
                return (!value && required) || true;
              },
            }}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.countryOfIssue],
                    fields.required[FORM_NAMES.countryOfIssue],
                  )}
                  options={locationsAsOptions}
                  error={(errors[FORM_NAMES.countryOfIssue] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.cityOfIssue]: (required = fields.required[FORM_NAMES.cityOfIssue]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.cityOfIssue],
              required,
            )}
            placeholder={t('enter_city')}
            {...register(FORM_NAMES.cityOfIssue, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.cityOfIssue as any]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.arrivalCountry]: (
        required = fields.required[FORM_NAMES.arrivalCountry],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.arrivalCountry}
            rules={{required}}
            control={control}
            render={({field}) => (
              <Select
                {...field}
                label={getRequiredOrOptionalFieldLabel(
                  FORM_FIELDS_LABELS[FORM_NAMES.arrivalCountry],
                  required,
                )}
                options={locationsAsOptions}
                error={(errors[FORM_NAMES.arrivalCountry] as any)?.message}
                disabled={disabled}
              />
            )}
          />
        );
      },
      [FORM_NAMES.arrivalDistrict]: (
        required = fields.required[FORM_NAMES.arrivalDistrict],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.arrivalDistrict}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.arrivalDistrict],
                    required,
                  )}
                  options={districtsAsOptions}
                  error={(errors[FORM_NAMES.arrivalDistrict] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.arrivalMunicipality]: (
        required = fields.required[FORM_NAMES.arrivalMunicipality],
      ) => {
        return (
          <Controller
            rules={{required}}
            name={FORM_NAMES.arrivalMunicipality}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.arrivalMunicipality],
                    required,
                  )}
                  options={arrivalMunicipalitiesAsOptions}
                  error={(errors[FORM_NAMES.arrivalMunicipality] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.nextDestinationCountry]: (
        required = fields.required[FORM_NAMES.nextDestinationCountry],
      ) => {
        return (
          <Controller
            control={control}
            name={FORM_NAMES.nextDestinationCountry}
            rules={{
              required,
            }}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.nextDestinationCountry],
                    required,
                  )}
                  options={locationsAsOptions}
                  error={(errors[FORM_NAMES.nextDestinationCountry] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.nextDestinationCity]: (
        required = fields.required[FORM_NAMES.nextDestinationCity],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.nextDestinationCity],
              required,
            )}
            placeholder={t('enter_next_destination_city')}
            {...register(FORM_NAMES.nextDestinationCity, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.nextDestinationCity]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.nextDestinationAddress]: (
        required = fields.required[FORM_NAMES.nextDestinationAddress],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.nextDestinationAddress],
              required,
            )}
            placeholder={t('enter_next_destination_address')}
            {...register(FORM_NAMES.nextDestinationAddress, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.nextDestinationAddress]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.nextDestinationDistrict]: (
        required = fields.required[FORM_NAMES.nextDestinationDistrict],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.nextDestinationDistrict}
            rules={{
              required,
            }}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.nextDestinationDistrict],
                    required,
                  )}
                  options={districtsAsOptions}
                  error={(errors[FORM_NAMES.nextDestinationDistrict] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.nextDestinationMunicipality]: (
        required = fields.required[FORM_NAMES.nextDestinationMunicipality],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.nextDestinationMunicipality}
            rules={{
              required,
            }}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.nextDestinationMunicipality],
                    required,
                  )}
                  options={nextDestinationMunicipalitiesAsOptions}
                  error={(errors[FORM_NAMES.nextDestinationMunicipality] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.purposeOfStay]: (
        required = fields.required[FORM_NAMES.purposeOfStay],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.purposeOfStay}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.purposeOfStay],
                    required,
                  )}
                  options={purposesOfStayAsOptions}
                  error={(errors[FORM_NAMES.purposeOfStay] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.visaNumber]: (required = fields.required[FORM_NAMES.visaNumber]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.visaNumber],
              required,
            )}
            placeholder={t('enter_visa_number')}
            {...register(FORM_NAMES.visaNumber, {
              required,
            })}
            control={control}
            error={errors[FORM_NAMES.visaNumber]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.taxExemption]: (
        required = fields.required[FORM_NAMES.taxExemption],
      ) => {
        return (
          <Controller
            control={control}
            rules={{required}}
            name={FORM_NAMES.taxExemption}
            render={({field}) => {
              return (
                <Select
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.taxExemption],
                    required,
                  )}
                  options={taxExemptionsAsOptions}
                  error={(errors[FORM_NAMES.taxExemption] as any)?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.fullTouristTax]: (
        required = fields.required[FORM_NAMES.fullTouristTax],
      ) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.fullTouristTax],
              required,
            )}
            placeholder={t('full_tourist_tax')}
            {...register(FORM_NAMES.fullTouristTax, {
              required,
              min: {
                value: MIN_TAX,
                message: t('min_number_is', {number: MIN_TAX}),
              },
              max: {
                value: MAX_TAX,
                message: t('max_number_is', {number: MAX_TAX}),
              },
            })}
            control={control}
            step="0.01"
            error={errors[FORM_NAMES.fullTouristTax]?.message}
            disabled={disabled}
            type="number"
          />
        );
      },
      [FORM_NAMES.email]: (required = fields.required[FORM_NAMES.email]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.email],
              required,
            )}
            placeholder={t('enter_email')}
            {...register(FORM_NAMES.email, {
              required,
              pattern: {
                value: PATTERNS.email,
                message: t('invalid_email'),
              },
            })}
            control={control}
            error={errors[FORM_NAMES.email]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.phone]: (required = fields.required[FORM_NAMES.phone]) => {
        return (
          <Controller
            name={FORM_NAMES.phone}
            rules={{
              required,
            }}
            control={control}
            render={({field}) => {
              return (
                <PhoneInput
                  {...field}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.phone],
                    required,
                  )}
                  placeholder={t('enter_your_phone_number')}
                  defaultCode={initGuestData?.phone_details?.code}
                  defaultInputValue={initGuestData?.phone_details?.number}
                  error={errors[FORM_NAMES.phone]?.message}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.fiscalCode]: (required = fields.required[FORM_NAMES.fiscalCode]) => {
        return (
          <InputController
            label={getRequiredOrOptionalFieldLabel(
              FORM_FIELDS_LABELS[FORM_NAMES.fiscalCode],
              required,
            )}
            control={control}
            placeholder={t('enter_fiscal_code')}
            {...register(FORM_NAMES.fiscalCode, {
              required,
              pattern: {
                value: PATTERNS.fiscalCode,
                message: t('invalid_fiscal_code'),
              },
            })}
            error={errors[FORM_NAMES.fiscalCode]?.message}
            disabled={disabled}
          />
        );
      },
      [FORM_NAMES.italianCityOfBirth]: (
        required = fields.required[FORM_NAMES.italianCityOfBirth],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.cityOfBirth}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <AsyncSelect
                  {...field}
                  value={field.value as SelectOption}
                  loadOptions={(inputValue, callback) => {
                    callback(getBestMatches(citiesAsOptions, inputValue));
                  }}
                  cacheOptions
                  defaultValues
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.cityOfBirth],
                    required,
                  )}
                  error={errors[FORM_NAMES.cityOfBirth as any]?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },

      [FORM_NAMES.italianResidenceCity]: (
        required = fields.required[FORM_NAMES.italianResidenceCity],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.residenceCity}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <AsyncSelect
                  {...field}
                  value={field.value as SelectOption}
                  cacheOptions
                  defaultValues
                  loadOptions={(inputValue, callback) => {
                    callback(getBestMatches(citiesAsOptions, inputValue));
                  }}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.residenceCity],
                    required,
                  )}
                  error={errors[FORM_NAMES.residenceCity as any]?.message}
                  disabled={disabled}
                />
              );
            }}
          />
        );
      },
      [FORM_NAMES.italianCityOfIssue]: (
        required = fields.required[FORM_NAMES.italianCityOfIssue],
      ) => {
        return (
          <Controller
            name={FORM_NAMES.cityOfIssue}
            rules={{required}}
            control={control}
            render={({field}) => {
              return (
                <AsyncSelect
                  {...field}
                  value={field.value as SelectOption}
                  label={getRequiredOrOptionalFieldLabel(
                    FORM_FIELDS_LABELS[FORM_NAMES.cityOfIssue],
                    required,
                  )}
                  error={errors[FORM_NAMES.cityOfIssue as any]?.message}
                  disabled={disabled}
                  defaultValues
                  cacheOptions
                  loadOptions={(inputValue, callback) => {
                    callback(getBestMatches(citiesAsOptions, inputValue));
                  }}
                />
              );
            }}
          />
        );
      },
    }),
    [
      arrivalMunicipalitiesAsOptions,
      citiesAsOptions,
      control,
      disabled,
      districtsAsOptions,
      docTypes,
      errors,
      fields.required,
      getValues,
      guestGroupType,
      housingCountry,
      initGuestData,
      isGuestLeader,
      locationsAsOptions,
      nextDestinationMunicipalitiesAsOptions,
      provincesAsOptions,
      purposesOfStayAsOptions,
      register,
      t,
      taxExemptionsAsOptions,
    ],
  );

  const getCustomField = React.useCallback(
    (field: CustomField, required: boolean | string) => {
      const {name, placeholder, label} = getCustomFieldData(field);

      switch (field.field_type) {
        case FIELD_TYPES.date:
          return (
            <Controller
              name={name}
              rules={{required}}
              control={control}
              render={({field}) => {
                return (
                  <Datepicker
                    label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                    error={(errors[name] as any)?.message}
                    {...field}
                  />
                );
              }}
            />
          );
        case FIELD_TYPES.time:
          return (
            <Controller
              name={name}
              rules={{required}}
              control={control}
              render={({field}) => {
                return (
                  <TimePicker
                    {...field}
                    placeholder={placeholder}
                    label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                    error={errors[name]?.message}
                  />
                );
              }}
            />
          );
        case FIELD_TYPES.file:
          return (
            <Controller
              name={name}
              rules={{required}}
              control={control}
              render={({field: {onChange, ...field}}) => {
                return (
                  <FormFileInput
                    placeholder={placeholder}
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
                    error={errors[name]?.message}
                    accept={ACCEPTABLE_DOCUMENTS}
                    {...field}
                  />
                );
              }}
            />
          );
        default:
          return (
            <InputController
              label={getRequiredOrOptionalFieldLabel(label, Boolean(required))}
              placeholder={placeholder}
              {...register(name, {
                required,
              })}
              control={control}
              error={errors[name]?.message}
            />
          );
      }
    },
    [control, errors, register],
  );

  const filterCustomFormNames = React.useCallback(
    (formNames: FORM_NAMES[]) => {
      const customFormNames = customForm!.fields_set.map(({field, is_leaders_field}) => {
        if (!isGuestLeader && is_leaders_field) {
          return '';
        }

        return field.name;
      });

      return formNames.filter((formName) => {
        return !customFormNames.includes(formName);
      });
    },
    [customForm, isGuestLeader],
  );

  const displayingFormNames = React.useMemo(() => {
    const excludedFormNames = [
      FORM_NAMES.terms,
      FORM_NAMES.frontSideScan,
      FORM_NAMES.backSideScan,
      FORM_NAMES.signature,
    ];

    let formNames = Object.values(FORM_NAMES).filter((formName) => {
      if (excludedFormNames.includes(formName)) {
        return false;
      }

      return fields.display[formName];
    });

    if (hasCustomForm) {
      formNames = filterCustomFormNames(formNames);
    }

    return formNames;
  }, [fields.display, hasCustomForm, filterCustomFormNames]);

  const renderFormFields = () => {
    return displayingFormNames.map((formName) => {
      return (
        <React.Fragment key={formName}>
          {formFields[formName as FormFieldTypes]?.()}
        </React.Fragment>
      );
    });
  };

  const renderCustomFormFields = () => {
    if (!customForm) {
      return null;
    }

    const fieldsSet = renderFormFields();

    const customFieldsSet = customForm.fields_set.map(
      ({field, is_required, is_leaders_field}) => {
        const required =
          (is_required || fields.required[field.name as FormFieldTypes]) &&
          (t('required') as string);
        const hidden = fields.display[field.name as FormFieldTypes] === false;

        if (hidden || (!isGuestLeader && is_leaders_field)) {
          return null;
        }

        if (!field.is_custom) {
          const formField = formFields[field.name as FormFieldTypes];
          return <React.Fragment key={field.id}>{formField?.(required)}</React.Fragment>;
        }

        const customField = getCustomField(field, required);
        return <React.Fragment key={field.id}>{customField}</React.Fragment>;
      },
    );

    return [...customFieldsSet, ...fieldsSet];
  };

  if (reservationStatus === 'error') {
    return (
      <CenteredWrapper>
        <ErrorText>Oops! Error</ErrorText>
        <ModalButton
          secondary
          onClick={() => refetchReservation()}
          label={t('try_again')}
        />
      </CenteredWrapper>
    );
  }

  if (isLoading || (guestId && isValidGuestId && !initGuestData)) {
    return (
      <CenteredWrapper>
        <Loader label={t('loading')} height={45} width={45} />
      </CenteredWrapper>
    );
  }

  return (
    <>
      <ContentWrapper>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormContent>
            <FormHeader
              clickToBack={() => goThroughConfirm(`/bookings/${reservationId}`)}
              title={
                guestName ? (
                  guestName
                ) : (
                  <MissingNameTitle>[{t('name_missing')}]</MissingNameTitle>
                )
              }
              action={
                isValidGuestId && initGuestData && !formState.isDirty ? (
                  <Tooltip
                    isMouseOver={hasItalianLeaderWithGuestMembers}
                    content={
                      hasItalianLeaderWithGuestMembers &&
                      t('why_i_cant_delete_guest_leader')
                    }
                    trigger={
                      <Button
                        disabled={hasItalianLeaderWithGuestMembers}
                        secondary
                        type="button"
                        onClick={openDeleteGuestModal}
                        label={<RubbishIconFilling label={t('delete_guest')} />}
                      />
                    }
                  />
                ) : (
                  <Button
                    onClick={handleSubmit(onSubmit)}
                    label={
                      <ButtonLabelWrapper>
                        <ButtonLabelIcon
                          src={isValidGuestId ? floppyIcon : plusIcon}
                          alt="Plus"
                        />
                        <ButtonLabelText>
                          {isValidGuestId ? t('save_changes') : t('register_guest')}
                        </ButtonLabelText>
                      </ButtonLabelWrapper>
                    }
                  />
                )
              }
            />
            <>
              {!isValidGuestId && (
                <>
                  <ScanModalTriggerButtonWrapper>
                    <Button
                      secondary
                      type="button"
                      onClick={openScanModal}
                      label={
                        <>
                          <img src={cameraIcon} alt="Camera" />
                          {t('scan_id_doc')}
                        </>
                      }
                    />
                  </ScanModalTriggerButtonWrapper>
                  <AddDataManuallyText>
                    {t('or_you_can_add_data_manually')}:
                  </AddDataManuallyText>
                  {isScanModalOpen && (
                    <Modal open>
                      <ModalCloseButton type="button" onClick={closeScanModal}>
                        <img src={blueCloseIcon} alt="Cross" />
                      </ModalCloseButton>
                      <ModalContent>
                        <ModalTitle>
                          <Trans i18nKey="scan_your_doc_where_the_mrz">
                            Scan guest ID or passport by the side where the
                            <b>MRZ code</b> is.
                          </Trans>
                        </ModalTitle>
                        <ScanModalHint>{t('keep_your_doc_inside_the_box')}</ScanModalHint>
                        <DetectionWebcam
                          isMobile={false}
                          mirrored={false}
                          ref={webcamRef}
                          onUserMedia={handleWebcamReady}
                        />
                        <ScanModalButtonsWrapper>
                          <ModalButton
                            onClick={captureAndStartValidation}
                            disabled={!isWebcamReady}
                            label={t('capture')}
                          />
                          <ModalButton
                            secondary
                            label={t('add_data_manually')}
                            onClick={closeScanModal}
                          />
                        </ScanModalButtonsWrapper>
                      </ModalContent>
                    </Modal>
                  )}
                  {isScanProcessingModalOpen && (
                    <Modal
                      open
                      contentStyle={scanModalContentStyle}
                      iconAlt="Document scanning"
                      iconSrc={scanningIcon}
                      iconProps={{
                        height: 84,
                        width: 84,
                      }}
                      title={`${t('scanning')}...`}
                      text={t('it_takes_seconds')}
                    >
                      <AbortRequestButtonWrapper>
                        <ModalButton
                          secondary
                          onClick={abortRequestAndOpenScanModal}
                          label={t('cancel')}
                        />
                      </AbortRequestButtonWrapper>
                    </Modal>
                  )}
                  {isScanSuccessModalOpen && (
                    <Modal
                      open
                      contentStyle={scanModalContentStyle}
                      iconAlt="Check mark"
                      iconSrc={successIcon}
                      iconProps={{
                        height: 84,
                        width: 84,
                      }}
                      title={t('success_exclamation')}
                    />
                  )}
                </>
              )}
            </>
            <FieldsContainer>
              {hasCustomForm ? renderCustomFormFields() : renderFormFields()}
            </FieldsContainer>
            <BottomSection>
              <div>
                {(isFrontSideScanVisible || isBackSideScanVisible) && (
                  <>
                    {(!isBackSideScanVisible && frontSideScan) ||
                    (backSideScan && frontSideScan) ? (
                      <>
                        <BottomButton onClick={openViewDocumentsModal} type="button">
                          <PlusImage src={viewIconBlue} alt="Plus" />
                          <BlueBottomButtonText>
                            ({t('view_identity_doc')})
                          </BlueBottomButtonText>
                        </BottomButton>
                        <DocumentInfo>{t('is_the_doc_wrong')}</DocumentInfo>
                        <DeleteDocumentButtonWrapper>
                          <Button
                            secondary
                            type="button"
                            onClick={openConfirmDocumentDeletionModal}
                            label={<RubbishIconFilling label={t('delete_document')} />}
                          />
                        </DeleteDocumentButtonWrapper>
                      </>
                    ) : (
                      <>
                        <BottomButton
                          onClick={openSaveDocumentModalAndResetActiveStep}
                          type="button"
                        >
                          <PlusImage src={plusBlueIcon} alt="Plus" />
                          <BottomButtonText>{t('add_document')}</BottomButtonText>
                        </BottomButton>
                        <BottomButtonError>
                          {errors[FORM_NAMES.frontSideScan]?.message ||
                            errors[FORM_NAMES.backSideScan]?.message}
                        </BottomButtonError>
                      </>
                    )}
                  </>
                )}
              </div>
              <div>
                {fields.display[FORM_NAMES.signature] && (
                  <>
                    <BottomButton onClick={openSignatureModal} type="button">
                      <PlusImage src={plusBlueIcon} alt="Plus" />
                      <BottomButtonText>
                        {signature ? t('repeat_signature') : t('add_signature')}
                      </BottomButtonText>
                    </BottomButton>
                    <BottomButtonError>
                      {errors[FORM_NAMES.signature]?.message}
                    </BottomButtonError>
                    {signature ? (
                      <SignatureImg src={signature} alt="Signature" />
                    ) : (
                      <SignaturePlaceholder />
                    )}
                  </>
                )}
              </div>
            </BottomSection>
            {isUploadDocumentsModalOpen && (
              <Modal>
                <ModalCloseButton type="button" onClick={closeUploadDocumentsModal}>
                  <img src={blueCloseIcon} alt="Cross" />
                </ModalCloseButton>
                <ModalContent>
                  <ModalTitle>
                    {fields.display[FORM_NAMES.backSideScan] ? (
                      <>{documentSaveStep === 0 ? t('frontside') : t('backside')}</>
                    ) : (
                      t('single_page_that_contains_data')
                    )}
                    <br />
                    {documentSaveStep === 0
                      ? t('where_the_photo_is')
                      : t('where_the_mrz_is')}
                  </ModalTitle>
                  {uploadedFile ? (
                    renderUploadedFile()
                  ) : (
                    <FileDragZone {...getDropZoneRootProps()}>
                      <SelectFileDragZoneContainer>
                        <img src={plusBlueIcon} alt="Plus" />
                        {!isDropZoneDragActive && t('select_file')}
                      </SelectFileDragZoneContainer>
                      <DragZoneText>
                        {isDropZoneDragActive
                          ? t('drag_file_here')
                          : t('or_drag_and_drop_the_photo_here')}
                      </DragZoneText>
                      <input
                        {...getDropZoneInputProps({
                          multiple: false,
                          accept: getAllowedFileTypes(housingCountry),
                        })}
                      />
                    </FileDragZone>
                  )}
                  <FileTypes>{getAllowedDocTypes()}</FileTypes>
                  <UploadModalButtonsWrapper>
                    <SelectAnotherFileButton
                      {...getRootProps()}
                      visible={Boolean(uploadedFile)}
                      type="button"
                    >
                      <img src={plusBlueIcon} alt="Plus" />
                      {isDragActive ? t('drag_file_here') : t('select_another_file')}
                      <input
                        {...getInputProps({
                          multiple: false,
                          accept: getAllowedFileTypes(housingCountry),
                        })}
                      />
                    </SelectAnotherFileButton>
                    <ModalButton
                      onClick={saveDocumentFile}
                      disabled={!uploadedFile}
                      label={t('upload')}
                    />
                  </UploadModalButtonsWrapper>
                </ModalContent>
              </Modal>
            )}
            {isScanDocumentsModalOpen && (
              <Modal open>
                <ModalCloseButton
                  type="button"
                  onClick={closeSaveDocumentsModalAndResetDocumentStep}
                >
                  <img src={blueCloseIcon} alt="Cross" />
                </ModalCloseButton>
                <ModalContent>
                  <ModalTitle>
                    {fields.display[FORM_NAMES.backSideScan] ? (
                      <>{documentSaveStep === 0 ? t('frontside') : t('backside')}</>
                    ) : (
                      t('single_page_that_contains_data')
                    )}
                    <br />
                    {documentSaveStep === 0
                      ? t('where_the_photo_is')
                      : t('where_the_mrz_is')}
                  </ModalTitle>
                  <ScanModalHint>{t('keep_your_doc_inside_the_box')}</ScanModalHint>
                  <DetectionWebcam
                    isMobile={false}
                    mirrored={false}
                    ref={webcamRef}
                    onUserMedia={handleWebcamReady}
                  />
                  <ScanModalButtonsWrapper>
                    <ModalButton
                      onClick={saveDocumentPhoto}
                      disabled={!isWebcamReady}
                      label={t('capture')}
                    />
                    <ScanModalOrText>{t('or')}</ScanModalOrText>
                    <ModalButton
                      secondary
                      label={t('upload_manually')}
                      onClick={() => {
                        openUploadDocumentsModal();
                        closeScanDocumentsModal();
                      }}
                    />
                  </ScanModalButtonsWrapper>
                </ModalContent>
              </Modal>
            )}
            <ConfirmDeletionModal
              title={t('delete_document_question')}
              isConfirmDeletionModalOpen={isConfirmDocumentDeletionModalOpen}
              onDelete={clearDocumentPhotosAndCloseDeleteConfirmationModal}
              onCancel={closeConfirmDocumentDeletionModal}
            />
            {isViewDocumentsModalOpen && (
              <Modal
                closeOnEscape
                closeOnDocumentClick
                contentStyle={viewDocumentsModalContentStyle}
                title={t('document')}
                onClose={closeViewDocumentsModal}
              >
                <DocumentsPhotosContent>
                  <DocumentPhotosWrapper>
                    {frontSideScan && renderScanView(frontSideScan)}
                    {backSideScan &&
                      fields.display[FORM_NAMES.backSideScan] &&
                      renderScanView(backSideScan)}
                  </DocumentPhotosWrapper>
                  <ModalButtonWrapper>
                    <ModalButton label={t('ok')} onClick={closeViewDocumentsModal} />
                  </ModalButtonWrapper>
                </DocumentsPhotosContent>
              </Modal>
            )}
            {isSignatureModalOpen && (
              <Modal open onClose={onSignatureModalClose}>
                <SignatureModalContent>
                  <SignatureCanvas
                    ref={signatureRef}
                    onClear={clearSignature}
                    onEnable={handleSignatureEnable}
                    enabled={isSignatureEnabled}
                    hasSignature={Boolean(signature)}
                    onEnd={saveSignature}
                  />
                  <SignatureModalButtonsWrapper>
                    <ModalButton onClick={onSignatureSubmit} label={t('done')} />
                    <ModalButton
                      secondary
                      onClick={onSignatureModalClose}
                      label={t('cancel')}
                    />
                  </SignatureModalButtonsWrapper>
                </SignatureModalContent>
              </Modal>
            )}
          </FormContent>
          <BottomButtonWrapper>
            {isValidGuestId && initGuestData && !formState.isDirty ? (
              <Button
                secondary
                type="button"
                onClick={openDeleteGuestModal}
                label={<RubbishIconFilling label={t('delete_guest')} />}
              />
            ) : (
              <Button
                onClick={handleSubmit(onSubmit)}
                label={
                  <ButtonLabelWrapper>
                    <ButtonLabelIcon
                      src={isValidGuestId ? floppyIcon : plusIcon}
                      alt="Plus"
                    />
                    <ButtonLabelText>
                      {isValidGuestId ? t('save_changes') : t('register_guest')}
                    </ButtonLabelText>
                  </ButtonLabelWrapper>
                }
              />
            )}
          </BottomButtonWrapper>
        </Form>
      </ContentWrapper>
      {isDataIncompleteModalOpen && (
        <Modal
          open
          iconSrc={missingDataIcon}
          iconAlt="Form with red fields"
          iconProps={{
            height: 84,
            width: 84,
          }}
          title={t('data_missing')}
          text={
            <>
              {t('you_cant_add_this_booking_until')}
              <p />
              {t('we_have_outlined_fields')}
            </>
          }
        >
          <ModalButtonWrapper>
            <ModalButton label={t('ok')} onClick={closeDataIncompleteModal} />
          </ModalButtonWrapper>
        </Modal>
      )}
      {isDeleteGuestModalOpen && (
        <Modal
          open
          iconSrc={deleteGuestIcon}
          iconAlt="Guest in trash"
          iconProps={{
            height: 95,
            width: 84,
          }}
          title={isGuestDeleted ? t('success_exclamation') : t('are_you_sure')}
          text={
            isDeletingGuest ? (
              <div>
                {t('deleting_guest')}...
                <p />
                <div>{t('it_takes_seconds')}</div>
              </div>
            ) : isGuestDeleted ? (
              t('successfully_deleted')
            ) : (
              t('all_info_associated_will_be_deleted')
            )
          }
        >
          {isGuestDeleted && (
            <ModalTwoButtonsWrapper>
              <ModalButton label={t('back_to_booking')} onClick={goBack} />
              <ModalButton
                secondary
                onClick={() => {
                  setSavingGuestStatus('idle');
                  closeDeleteGuestModal();
                }}
                label={t('add_guest')}
              />
            </ModalTwoButtonsWrapper>
          )}
          {isGuestDeletionIdle && (
            <ModalTwoButtonsWrapper>
              <ModalButton onClick={deleteGuest} label={t('delete_guest')} />
              <ModalButton
                secondary
                onClick={closeDeleteGuestModal}
                label={t('cancel')}
              />
            </ModalTwoButtonsWrapper>
          )}
        </Modal>
      )}
      {isSavingGuestModalOpen && (
        <Modal
          open
          iconSrc={guestIcon}
          iconAlt="A guest"
          iconProps={{
            height: 84,
            width: 84,
          }}
          title={isGuestSaved ? t('success_exclamation') : t('saving_guest')}
          text={isSavingGuest ? `${t('it_takes_seconds')}...` : t('guest_saved')}
        >
          {isGuestSaved && (
            <ModalTwoButtonsWrapper>
              <ModalButton label={t('back_to_booking')} onClick={goBack} />
              <ModalButton
                secondary
                onClick={() => {
                  resetFormData();
                  setSavingGuestStatus('idle');
                  closeSavingGuestModal();
                  setOcrWasUsed(false);
                }}
                label={t('add_another_guest')}
              />
            </ModalTwoButtonsWrapper>
          )}
        </Modal>
      )}
      <ErrorModal onClose={closeErrorModalAndReopenScanModal} />
      <SavingErrorModal />
      <SavingTryAgainErrorModal>
        <ModalTwoButtonsWrapper>
          <ModalButton onClick={() => saveGuest(getValues())} label={t('try_again')} />
          <ModalButton
            secondary
            onClick={closeSavingTryAgainErrorModal}
            label={t('cancel')}
          />
        </ModalTwoButtonsWrapper>
      </SavingTryAgainErrorModal>
      {isDoYouWantToSaveModalOpen && (
        <YouHaveMadeChangesModal
          handleModalSave={() => handleModalSave(handleSubmit(onSubmit))}
          handleModalDontSave={handleModalDontSave}
          handleModalCancel={handleModalCancel}
        />
      )}
    </>
  );
}

GuestDetailsForm.defaultProps = defaultProps;
export {GuestDetailsForm};
