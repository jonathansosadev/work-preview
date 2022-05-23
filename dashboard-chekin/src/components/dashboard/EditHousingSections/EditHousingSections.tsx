import React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {FormProvider, useForm} from 'react-hook-form';
import {toast} from 'react-toastify';
import {useQuery, useQueryClient} from 'react-query';
import {format, isValid} from 'date-fns';
import api, {queryFetcher, ResolverTypes} from '../../../api';
import {useAuth} from '../../../context/auth';
import {
  getIsBookingPaymentsShown,
  scrollToTop,
  toastResponseError,
  ErrorType,
  parseBooleanFromString,
} from '../../../utils/common';
import {
  CustomForm,
  Housing,
  Room,
  Season,
  SelectOption,
  TempLock,
} from '../../../utils/types';
import {
  buildExternalSourcesPayload,
  buildHousingPayload,
  buildPolicePayload,
  buildStatPayload,
} from '../../../utils/housing';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  usePrevious,
  useScrollToTop,
  useStatus,
} from '../../../utils/hooks';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';
import {useComputedDetails} from '../../../context/computedDetails';
import {useSubscription} from '../../../context/subscription';
import {
  COUNTRIES_WITH_STAT,
  COUNTRY_CODES,
  POLICE_TYPES,
  SECURITY_DEPOSIT_STATUSES,
  SITEMINDER_ORIGINS,
  SUBSCRIPTION_TYPES,
  UPSELLING_PAYMENTS_STATUS,
  ORIGINS,
  HOUSING_VERIFICATION_TYPE,
  QUERY_CACHE_KEYS,
} from '../../../utils/constants';
import deletePropertyIcon from '../../../assets/delete-property.svg';
import rubbishIcon from 'assets/rubbish-bin.svg';
import Button from '../Button';
import FormHeader from '../FormHeader';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import HousingActivationModals from '../HousingActivationModals';
import IncompleteFormDataModal from '../IncompleteFormDataModal';
import HousingOnlineCheckInSection from '../HousingOnlineCheckInSection';
import HousingUniversalLink from '../HousingUniversalLink';
import HousingBookingPaymentsSection from '../HousingBookingPaymentsSection';
import HousingInfoSection from '../HousingInfoSection';
import HousingContractsSection from '../HousingContractsSection';
import HousingRemoteAccessSection from '../HousingRemoteAccessSection';
import HousingIdentityVerificationSection from '../HousingIdentityVerificationSection';
import HousingPoliceConnectionSection from '../HousingPoliceConnectionSection';
import HousingSpacesSection from '../HousingSpacesSection';
import MissingPaymentSettingsModal from '../MissingPaymentSettingsModal';
import HousingTaxesSection, {
  FORM_NAMES as TAXES_FORM_NAMES,
} from '../HousingTaxesSection';
import SelfCheckinDisabledModal from '../SelfCheckinDisabledModal';
import HousingICalsSection, {
  FORM_NAMES as ICALS_FORM_NAMES,
} from '../HousingICalsSection';
import HousingStatConnectionSection, {
  FORM_NAMES as STAT_FORM_NAMES,
} from '../HousingStatConnectionSection';
import Loader from '../../common/Loader';
import FloatingSaveButton from '../FloatingSaveButton';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import HousingSecurityDepositSection from '../HousingSecurityDepositSection';
import {RESERVATION_PAYMENT_STATUSES} from '../ReservationPayments';
import {FormTypes} from '../AddHousingSections';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {UpsellingSectionRefType} from '../HousingUpsellingSection/HousingUpsellingSection';
import HousingPaymentsProviderIncompleteModal from '../HousingPaymentsProviderIncompleteModal';
import HousingUpsellingSection from '../HousingUpsellingSection';
import {
  ACTION_TYPES,
  initialState,
  reducer,
  useSendingSettingsRef,
} from '../OnlineSendingSettings';
import {ContentWrapper, FirstFormSectionWrapper} from '../../../styled/common';
import {ActivationSiteMinderButton} from './ActivationSiteMinderButton/ActivationSiteMinderButton';
import {
  DeactivateHousingButton,
  FormHeaderSubtitle,
  LoaderWrapper,
  Wrapper,
} from './styled';
import {SubmitOnlineCheckinProps} from '../OnlineSendingSettings/OnlineSendingSettings';

type SpacesSectionRefType = {
  active: boolean;
};

type ContractsSectionRefType = {
  active: boolean;
  extraClauses: [];
  signature: string;
};

type PoliceConnectionSectionRefType = {
  active: boolean;
  submit: () => boolean;
  reset: () => void;
  getValues: () => {
    [key: string]: string | SelectOption;
  };
};

type StatConnectionSectionRefType = {
  active: boolean;
  submit: () => boolean;
  getValues: () => {
    [key: string]: string | SelectOption;
  };
};

type RemoteAccessSectionRefType = {
  active: boolean;
  tempLocks: TempLock[];
  lockUser: SelectOption | null;
  instructions: string;
  clearTempLocks: () => void;
  sendingHour: number | null;
};

type TaxesSectionRefType = {
  getHighSeasonPayload: () => any;
  getLowSeasonPayload: () => any;
  resetTaxesDetails: () => void;
  resetSections: () => void;
  active: boolean;
};

const USER_ORIGINS_WITHOUT_CHECKIN_LINK_SECTION = [
  ORIGINS.dashboard_pms,
  ORIGINS.api,
  ORIGINS.dashboard_m,
  ORIGINS.ei,
  ORIGINS.airbnb_calendar,
  ORIGINS.booking_calendar,
  ORIGINS.avantio_calendar,
  ORIGINS.generic_calendar,
  ORIGINS.cb,
  ORIGINS.channex,
  ORIGINS.cloudbeds,
  ORIGINS.smoobu,
  ORIGINS.guesty,
  ORIGINS.booking,
  ORIGINS.bookingsync,
  ORIGINS.lodgify,
  ORIGINS.mews,
  ORIGINS.vreasy,
  ORIGINS.octorate,
  ORIGINS.rentals_united,
  ORIGINS.beds24,
  ORIGINS.planyo,
  ORIGINS.hostaway,
  ORIGINS.sonder,
  ORIGINS.ciaobooking,
  ORIGINS.ruralgest,
  ORIGINS.easyhotelia,
  ORIGINS.casamitger,
  ORIGINS.fnsrooms,
  ORIGINS.ofi,
  ORIGINS.komodore,
  ORIGINS.lobby_pms,
  ORIGINS.mijas_villas,
  ORIGINS.villas_365,
  ORIGINS.kamooni,
  ORIGINS.roomcloud,
  ORIGINS.amenitiz,
  ORIGINS.avaibook,
  ORIGINS.gomera,
  ORIGINS.sextaplanta,
  ORIGINS.whoyourguest,
  ORIGINS.wifreezone,
  ORIGINS.turismoverycheap,
  ORIGINS.vacasa,
  ORIGINS.staymyway,
  ORIGINS.rentlio,
  ORIGINS.ezeetechnosys,
  ORIGINS.fantasticstay,
  ORIGINS.eviivo,
  ORIGINS.apaleo,
  ORIGINS.masteryield,
  ORIGINS.bookingautomation,
  ORIGINS.higuests,
  ORIGINS.hoteliga,
  ORIGINS.cosi_group,
  ORIGINS.myvr,
  ORIGINS.ownerrez,
  ORIGINS.datahotel,
  ORIGINS.hostify,
];

const loaderProps = {
  height: 45,
  width: 45,
};

function fetchHousing(id = '') {
  return queryFetcher(api.housings.ENDPOINTS.one(id));
}

function fetchCustomForm(housingId: string, userId = '') {
  return queryFetcher(
    api.guestCustomForm.ENDPOINTS.customForm(`housing_id=${housingId}&user_id=${userId}`),
  );
}

function fetchSeason(id: string) {
  return queryFetcher(api.seasons.ENDPOINTS.one(id));
}

function hasHousingPoliceActivated(housing?: Housing) {
  return housing?.is_auto_police_registration_enabled;
}

function EditHousingSections() {
  useScrollToTop();
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const isMounted = useIsMounted();
  const {isAccountCollaborator} = useComputedDetails();
  const {
    openModal: openExportTaxesModal,
    closeModal: closeExportTaxesModal,
    isOpen: isExportTaxesModalOpen,
  } = useModalControls();
  const {
    openModal: openHousingActivationModal,
    closeModal: closeHousingActivationModal,
    isOpen: isHousingActivationModalOpen,
  } = useModalControls();
  const {
    isOpen: isMissingPaymentSettingsModalOpen,
    closeModal: closeMissingPaymentSettingsModal,
    openModal: openMissingPaymentSettingsModal,
  } = useModalControls();
  const {
    isOpen: isPaymentSettingsInProgressModalOpen,
    closeModal: closePaymentSettingsInProgressModal,
    openModal: openPaymentSettingsInProgressModal,
  } = useModalControls();

  const {isHotelSubscription} = useSubscription();
  const {accountDetails: user} = useAuth();
  const isOriginSiteMinder =
    user?.origin && Object.values(SITEMINDER_ORIGINS).includes(user?.origin);
  const managerId = user?.manager || '';
  const subscriptionType = user?.subscription_type;
  const {id: housingId} = useParams<{id: string}>();
  const formMethods = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const formState = formMethods.formState;
  const prevFormState = usePrevious<typeof formState>(formState);
  const policeViewRef = React.useRef<HTMLDivElement>(null);
  const statViewRef = React.useRef<HTMLDivElement>(null);
  const {ErrorModal, displayError} = useErrorModal();
  const {setStatus, isLoading, resetStatus, status, isIdle} = useStatus({
    autoReset: true,
  });
  const [isRemoveHousingModalOpen, setIsRemoveHousingModalOpen] = React.useState(false);
  const [isContractsSectionActive, setIsContractsSectionActive] = React.useState(false);
  const [isPoliceSectionActive, setIsPoliceSectionActive] = React.useState(false);
  const [
    isBookingPaymentsSectionActive,
    setBookingPaymentsSectionActive,
  ] = React.useState(false);
  const [
    isSecurityDepositSectionActive,
    setSecurityDepositSectionActive,
  ] = React.useState(false);

  const [wasDataIncompleteModalOpened, setWasDataIncompleteModalOpened] = React.useState(
    false,
  );
  const [isDataIncompleteModalOpen, setIsDataIncompleteModalOpen] = React.useState(false);

  const [isHousingDeleted, setIsHousingDeleted] = React.useState(false);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [highSeasonId, setHighSeasonId] = React.useState('');
  const [lowSeasonId, setLowSeasonId] = React.useState('');
  const {
    isOpen: isSelfCheckinDisabledModalOpen,
    openModal: openSelfCheckinDisabledModal,
    closeModal: closeSelfCheckinDisabledModal,
  } = useModalControls();

  const [isSelfCheckinDisabled, setIsSelfCheckinDisabled] = React.useState(false);

  const [sendingSettingsState, sendingSettingsDispatch] = React.useReducer(
    reducer,
    initialState,
  );
  const {
    isTouched: isOnlineCheckinTouched,
    isDisabled: isOnlineCheckinDisabled,
  } = sendingSettingsState;
  const onlineCheckInSectionRef = useSendingSettingsRef();

  const [isSectionsTouched, setIsSectionsTouched] = React.useState(false);
  const [isUpsellingSectionTouched, setIsUpsellingSectionTouched] = React.useState(false);

  const isAnySectionTouched =
    isSectionsTouched || isOnlineCheckinTouched || isUpsellingSectionTouched;

  const resetTouchedSections = () => {
    setIsUpsellingSectionTouched(false);
    setIsSectionsTouched(false);
    sendingSettingsDispatch({type: ACTION_TYPES.touched, payload: false});
    policeConnectionSectionRef.current.reset();
  };

  const policeConnectionSectionRef = React.useRef<PoliceConnectionSectionRefType>({
    active: false,
    submit: () => false,
    reset: () => {},
    getValues: () => ({}),
  });
  const spacesSectionRef = React.useRef<SpacesSectionRefType>({
    active: false,
  });
  const contractsSectionRef = React.useRef<ContractsSectionRefType>({
    active: false,
    extraClauses: [],
    signature: '',
  });
  const statConnectionSectionRef = React.useRef<StatConnectionSectionRefType>({
    active: false,
    submit: () => false,
    getValues: () => ({}),
  });
  const identityVerificationSectionRef = React.useRef<{active: boolean}>({
    active: false,
  });
  const remoteAccessSectionRef = React.useRef<RemoteAccessSectionRefType>({
    active: false,
    tempLocks: [],
    lockUser: null,
    instructions: '',
    clearTempLocks: () => {},
    sendingHour: null,
  });
  const taxesSectionRef = React.useRef<TaxesSectionRefType>({
    getHighSeasonPayload: () => {},
    getLowSeasonPayload: () => {},
    resetTaxesDetails: () => {},
    resetSections: () => {},
    active: false,
  });
  const upsellingSectionRef = React.useRef<UpsellingSectionRefType>({
    active: false,
  });

  const isBookingPaymentsShown = getIsBookingPaymentsShown(user?.origin);

  const country = formMethods.watch(HOUSING_FORM_NAMES.country)?.value;
  const province = formMethods.watch(HOUSING_FORM_NAMES.province)?.value;
  const isSelectedCountryDubai = country === COUNTRY_CODES.uae;
  const housingName = formMethods.watch(HOUSING_FORM_NAMES.name);
  const numberOfSpaces = formMethods.watch(HOUSING_FORM_NAMES.number_of_spaces) || 0;

  const {data: housing, status: housingStatus} = useQuery<Housing, [string, string]>(
    ['housing', housingId],
    () => fetchHousing(housingId),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(housingId && !isHousingDeleted),
    },
  );

  const {data: housingCustomForms} = useQuery<CustomForm[]>(
    ['customForm', housingId, managerId],
    () => fetchCustomForm(housingId, managerId),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(housingId && !isHousingDeleted),
    },
  );
  const customForm = housingCustomForms?.length ? housingCustomForms[0] : null;

  const {data: highSeason, error: highSeasonError, status: highSeasonStatus} = useQuery<
    Season,
    [string, string]
  >([QUERY_CACHE_KEYS.highSeason, highSeasonId], () => fetchSeason(highSeasonId), {
    refetchOnWindowFocus: false,
    enabled: Boolean(highSeasonId && !isLoading),
  });
  useErrorToast(highSeasonError, {
    notFoundMessage: t('season_not_found'),
  });
  const {data: lowSeason, error: lowSeasonError, status: lowSeasonStatus} = useQuery<
    Season,
    [string, string]
  >(['lowSeason', lowSeasonId], () => fetchSeason(lowSeasonId), {
    refetchOnWindowFocus: false,
    enabled: Boolean(lowSeasonId && !isLoading),
  });
  useErrorToast(lowSeasonError, {
    notFoundMessage: t('season_not_found'),
  });
  const isHousingInitiallyDeactivated = Boolean(housing?.is_deactivated);
  const [isHousingDeactivated, setIsHousingDeactivated] = React.useState(
    isHousingInitiallyDeactivated,
  );
  const {
    isLoadingPaymentSettings,
    hasPaymentSettings,
    isStripeProviderInvalid,
  } = usePaymentSettings();

  const areSeasonsLoading =
    highSeasonStatus === 'loading' || lowSeasonStatus === 'loading';
  const areSectionsDisabled = isLoading || housingStatus === 'loading';
  const arePaymentSectionsDisabled = areSectionsDisabled || isLoadingPaymentSettings;

  const openIncompleteModal = React.useCallback(() => {
    if (!wasDataIncompleteModalOpened) {
      setIsDataIncompleteModalOpen(true);
      setWasDataIncompleteModalOpened(true);
    }
  }, [wasDataIncompleteModalOpened]);

  React.useEffect(
    function redirect() {
      if (isAccountCollaborator) {
        history.push('/bookings');
      }
    },
    [history, isAccountCollaborator],
  );

  React.useLayoutEffect(
    function showIncompleteModalOneTime() {
      const shouldOpenModal =
        formState.isSubmitted && !prevFormState?.isValid && !formState.isValid;

      if (shouldOpenModal) {
        openIncompleteModal();
      }
    },
    [
      formState.isSubmitted,
      formState.isValid,
      prevFormState,
      wasDataIncompleteModalOpened,
      openIncompleteModal,
    ],
  );

  React.useEffect(() => {
    if (!housing?.seasons?.length) {
      return;
    }

    const highSeasonId = housing.seasons[0];
    const lowSeasonId = housing.seasons[1] || '';
    setHighSeasonId(highSeasonId);
    setLowSeasonId(lowSeasonId);
  }, [housing]);

  React.useEffect(() => {
    setIsHousingDeactivated(isHousingInitiallyDeactivated);
  }, [isHousingInitiallyDeactivated]);

  const openRemoveHousingModal = () => {
    setIsRemoveHousingModalOpen(true);
  };

  const closeRemoveHousingModal = () => {
    setIsRemoveHousingModalOpen(false);
  };

  const goToHousings = () => {
    history.push('/properties');
  };

  const handlePaymentSectionToggle = (isSectionActive: boolean) => {
    if (!hasPaymentSettings && !isSectionActive) {
      openMissingPaymentSettingsModal();
      return false;
    }

    if (isStripeProviderInvalid && !isSectionActive) {
      openPaymentSettingsInProgressModal();
      return false;
    }

    return true;
  };

  const deleteHousing = async () => {
    setStatus('loading');

    const seasonsError = await deleteAllSeasons();
    if (!isMounted.current) {
      return;
    }

    if (seasonsError) {
      toastResponseError(seasonsError);
      return;
    }

    const {error} = await api.housings.deleteById(housingId);
    if (!isMounted.current) {
      return;
    }

    if (error) {
      toastResponseError(error);
      setStatus('error');
    } else {
      setIsHousingDeleted(true);
    }

    queryClient.removeQueries([`housing`, housingId]);
    await queryClient.refetchQueries('housings');
    toast.success(t('property_deleted'));
    goToHousings();
  };

  const getInitICals = () => {
    return housing?.external_sources;
  };

  const getPolicePayload = () => {
    const data = policeConnectionSectionRef.current?.getValues();
    const isActive = POLICE_TYPES[country] && policeConnectionSectionRef.current?.active;

    if (!isActive) {
      return {
        is_auto_police_registration_enabled: false,
      };
    }
    return buildPolicePayload(data);
  };

  const getStatPayload = () => {
    const data = statConnectionSectionRef.current?.getValues();
    const isActive =
      COUNTRIES_WITH_STAT.includes(country) && statConnectionSectionRef.current?.active;

    if (!isActive) {
      return {
        is_stat_registration_enabled: false,
      };
    }
    return buildStatPayload(data);
  };

  const getContractsPayload = (data: FormTypes) => {
    const isActive = contractsSectionRef.current?.active;

    if (!isActive) {
      return {
        is_contract_enabled: false,
        manager_birth_date: undefined,
      };
    }

    const signature = contractsSectionRef.current?.signature || undefined;

    return {
      is_contract_enabled: true,
      manager_signature: signature?.startsWith('https') ? undefined : signature,
      extra_clauses: contractsSectionRef.current?.extraClauses,
      [HOUSING_FORM_NAMES.manager_birth_date]: isValid(
        data[HOUSING_FORM_NAMES.manager_birth_date],
      )
        ? format(data[HOUSING_FORM_NAMES.manager_birth_date], 'yyyy-MM-dd')
        : undefined,
      [HOUSING_FORM_NAMES.contract_type]: (data[
        HOUSING_FORM_NAMES.contract_type
      ] as SelectOption)?.value,
      [HOUSING_FORM_NAMES.manager_name]:
        data[HOUSING_FORM_NAMES.manager_name] ?? undefined,
    };
  };

  const getICalsPayload = (data: any) => {
    const isActive =
      data[ICALS_FORM_NAMES.booking] ||
      data[ICALS_FORM_NAMES.airbnb] ||
      data[ICALS_FORM_NAMES.other];

    if (!isActive) {
      return {
        external_sources: [],
      };
    }
    return buildExternalSourcesPayload(data);
  };

  const getHousingPayload = (data: FormTypes) => {
    const statsData = statConnectionSectionRef.current?.getValues();
    const payload = buildHousingPayload(
      {
        ...data,
        [STAT_FORM_NAMES.available_rooms]: statsData?.[STAT_FORM_NAMES.available_rooms],
        [STAT_FORM_NAMES.external_housing]:
          typeof statsData?.[STAT_FORM_NAMES.external_housing] === 'string'
            ? statsData?.[STAT_FORM_NAMES.external_housing]
            : (statsData[STAT_FORM_NAMES.external_housing] as SelectOption)?.value,
      },
      country,
    );

    const isIdentityVerificationSectionActive =
      identityVerificationSectionRef.current?.active;

    const isRemoteAccessSectionActive = remoteAccessSectionRef.current?.active;
    if (!isIdentityVerificationSectionActive) {
      payload.is_biometric_match_for_all_enabled = false;
      if (isSelectedCountryDubai) {
        payload.verification_type = HOUSING_VERIFICATION_TYPE.optionalDocumentOnly;
      } else {
        payload.verification_type = HOUSING_VERIFICATION_TYPE.optionalDocumentAndSelfie;
      }
    }

    return {
      ...payload,
      is_self_online_check_in_enabled: isIdentityVerificationSectionActive,
      is_smart_lock_enabled: isRemoteAccessSectionActive,
      self_check_in_instructions: remoteAccessSectionRef.current?.instructions,
      hour_of_sending_keys: remoteAccessSectionRef.current?.sendingHour,
    };
  };

  const getRoomsPayload = () => {
    const isActive = spacesSectionRef.current?.active;
    if (!isActive) {
      return {
        rooms: [],
      };
    }

    const roomsWithDefaultNumbers = rooms.map((room: Room, i) => {
      if (!room.number) {
        return {
          ...room,
          number: `Space ${i + 1}`,
        };
      }

      return room;
    });

    return {rooms: roomsWithDefaultNumbers};
  };

  const getTaxesPayload = (data: FormTypes) => {
    const isActive = taxesSectionRef?.current?.active;
    const result: {[key: string]: undefined} = {};
    const {commission_responsibility_for_tourist_tax} = data;

    if (!isActive) {
      return {};
    }

    Object.keys(TAXES_FORM_NAMES).forEach((key) => {
      result[key] = undefined;
    });

    return {
      ...result,
      commission_responsibility_for_tourist_tax,
    };
  };

  const getDepositsPayload = (data: FormTypes) => {
    const {security_deposit_status} = data;

    if (!security_deposit_status) {
      return {
        security_deposit_status: SECURITY_DEPOSIT_STATUSES.inactive,
      };
    }

    return {
      security_deposit_status,
      [HOUSING_FORM_NAMES.depositAmount]: data[HOUSING_FORM_NAMES.depositAmount],
    };
  };

  const getBookingPaymentsPayload = (data: FormTypes) => {
    if (isBookingPaymentsShown) {
      const {reservation_payments_status, commission_responsibility_for_booking} = data;

      return {
        reservation_payments_status: reservation_payments_status
          ? reservation_payments_status
          : RESERVATION_PAYMENT_STATUSES.inactive,
        commission_responsibility_for_booking,
        commission_responsibility_for_extra_service: commission_responsibility_for_booking,
      };
    }

    return {};
  };

  const getUpsellingPayload = (): Pick<Housing, 'upselling_payments_status'> => {
    const paymentState = upsellingSectionRef.current.active
      ? UPSELLING_PAYMENTS_STATUS.active
      : UPSELLING_PAYMENTS_STATUS.inactive;

    return {
      upselling_payments_status: paymentState,
    };
  };

  const getPayload = (data: FormTypes) => {
    return {
      ...getHousingPayload(data),
      ...getICalsPayload(data),
      ...getPolicePayload(),
      ...getStatPayload(),
      ...getContractsPayload(data),
      ...getRoomsPayload(),
      ...getTaxesPayload(data),
      ...getDepositsPayload(data),
      ...getBookingPaymentsPayload(data),
      ...getUpsellingPayload(),
    };
  };

  const deleteOddRooms = async () => {
    let error = null;
    let rooms = getRoomsPayload()?.rooms;
    const isSpacesSectionActive = spacesSectionRef.current?.active;

    if (!rooms || !isSpacesSectionActive) {
      rooms = [];
    }

    if (housing && rooms.length < housing.rooms?.length) {
      const oddRooms = housing.rooms.slice(rooms.length);

      for await (let room of oddRooms) {
        if (error || !isMounted.current) {
          return;
        }

        const {error: roomError} = await api.rooms.deleteOne(room.id!);
        error = roomError;
      }
    }

    return error;
  };

  const handleResponseError = (error: ErrorType) => {
    if (!isMounted.current) {
      return;
    }

    setStatus('error');
    displayError(error);
  };

  const validatePoliceAndGetResult = async () => {
    policeViewRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    return policeConnectionSectionRef.current.submit();
  };

  const deleteHousingFromCustomForm = async () => {
    const housings = customForm?.housings?.filter(
      (singleHousing) => singleHousing !== housingId,
    );

    await api.guestCustomForm.patchCustomForm(
      customForm!.id,
      {housings},
      `user_id=${managerId}`,
    );
  };

  const validateStatAndGetResult = async () => {
    statViewRef.current?.scrollIntoView({behavior: 'smooth'});
    return statConnectionSectionRef.current.submit();
  };

  const getSeasonsIds = () => {
    const ids: string[] = [];

    if (highSeasonId) {
      ids.push(highSeasonId);
    }
    if (lowSeasonId) {
      ids.push(lowSeasonId);
    }

    return ids;
  };

  const deleteAllSeasons = async () => {
    let error: ErrorType | null = null;
    const ids = getSeasonsIds();

    for await (const id of ids) {
      const result = await api.seasons.deleteOne(id);

      if (!isMounted.current) {
        break;
      }
      if (result.error) {
        error = result.error;
        break;
      }

      if (id === highSeasonId) {
        setHighSeasonId('');
        queryClient.removeQueries([QUERY_CACHE_KEYS.highSeason, id]);
      }
      if (id === lowSeasonId) {
        setLowSeasonId('');
        queryClient.removeQueries(['lowSeason', id]);
      }
    }

    return error;
  };

  const deleteSeasonsAndResetData = async () => {
    const deleteError = await deleteAllSeasons();

    if (deleteError) {
      handleResponseError(deleteError);
    } else {
      taxesSectionRef?.current?.resetTaxesDetails();
    }

    return deleteError;
  };

  const refreshOneSeason = async (id: string) => {
    const payload = {
      rules: [],
      exemptions: [],
    };

    const result = await api.seasons.patch(id, payload);

    if (result?.error) {
      return result.error;
    }

    return null;
  };

  const refreshSeasons = async (highSeasonId: string, lowSeasonId: string) => {
    if (highSeasonId) {
      const error = await refreshOneSeason(highSeasonId);
      if (error) {
        return error;
      }
    }

    const isGoingToDeleteLowSeason = !taxesSectionRef?.current?.getLowSeasonPayload();
    if (lowSeasonId && !isGoingToDeleteLowSeason) {
      const error = await refreshOneSeason(lowSeasonId);
      if (error) {
        return error;
      }
    }

    return null;
  };

  const deleteSeason = async (id: string) => {
    const result = await api.seasons.deleteOne(id);

    if (result.error && isMounted.current) {
      displayError(result.error);
    }
    return result;
  };

  const saveSeason = async (id: string, payload: any) => {
    let result: ResolverTypes;

    if (id) {
      result = await api.seasons.patch(id, payload);
    } else {
      result = await api.seasons.post(payload);
    }

    if (result.error && isMounted.current) {
      displayError(result.error);
    }
    return result;
  };

  const saveHighSeason = async (id: string) => {
    const payload = taxesSectionRef?.current?.getHighSeasonPayload();
    const result = await saveSeason(id, payload);

    if (result.data?.id) {
      queryClient.setQueryData(
        [QUERY_CACHE_KEYS.highSeason, result.data?.id],
        result.data,
      );
    }
    return result;
  };

  const saveOrDeleteLowSeason = async (id: string) => {
    const payload = taxesSectionRef?.current?.getLowSeasonPayload();

    if (!payload) {
      if (id) {
        const result = await deleteSeason(id);
        if (!result.error) {
          queryClient.removeQueries(['lowSeason', id]);
        }
      }

      return;
    }

    const result = await saveSeason(id, payload);
    if (result.data?.id) {
      queryClient.setQueryData(['lowSeason', result.data.id], result.data);
    }
    return result;
  };

  const updateSeasons = async () => {
    const refreshResult = await refreshSeasons(highSeasonId, lowSeasonId);
    if (refreshResult?.error) {
      return refreshResult.error;
    }

    const highSeasonResult = await saveHighSeason(highSeasonId);
    if (highSeasonResult?.error) {
      return highSeasonResult.error;
    }

    const lowSeasonResult = await saveOrDeleteLowSeason(lowSeasonId);
    if (lowSeasonResult?.error) {
      return lowSeasonResult.error;
    }

    return null;
  };

  const saveSeasons = async () => {
    if (!taxesSectionRef?.current?.active) {
      return null;
    }

    const seasonsUpdateError = await updateSeasons();
    if (seasonsUpdateError) {
      handleResponseError(seasonsUpdateError);
      return seasonsUpdateError;
    }
    taxesSectionRef.current.resetSections();
    return null;
  };

  const deleteOrSaveSeasons = async () => {
    if (housing?.seasons?.length && !taxesSectionRef?.current?.active) {
      return deleteSeasonsAndResetData();
    }

    return saveSeasons();
  };

  const taxSources = async (sources: SelectOption[]) => {
    let newSources = sources.filter((tax) => tax.value === tax.label);
    let oldSources = sources.filter((tax) => tax.value !== tax.label);

    if (newSources.length > 0) {
      for await (let newSource of newSources) {
        const {data, error} = await api.reservationSources.post({name: newSource.value});
        if (error) {
          handleResponseError(error);
          return error;
        }
        oldSources.push({value: data?.id, label: data?.name});
      }
    }

    return oldSources;
  };

  const submitOnlineCheckin = async (extraFields: SubmitOnlineCheckinProps) => {
    try {
      await onlineCheckInSectionRef.current?.submitOnlineCheckin(extraFields);
    } catch (e) {
      resetStatus();
      throw e;
    }
  };

  const updateHousing = async (housingData: FormTypes) => {
    if (housingData?.tax_exempt_sources) {
      housingData.tax_exempt_sources = await taxSources(housingData.tax_exempt_sources);
    }
    if (housingData?.booking_exempt_sources) {
      housingData.booking_exempt_sources = await taxSources(
        housingData.booking_exempt_sources,
      );
    }

    const payload = getPayload(housingData);

    if (subscriptionType === SUBSCRIPTION_TYPES.hotel) {
      const roomsError = await deleteOddRooms();
      if (roomsError) {
        handleResponseError(roomsError);
        return roomsError;
      }
    }

    const {data, error} = await api.housings.patchById(housing!.id, payload);
    if (error) {
      handleResponseError(error);
      return error;
    }
    if (data) {
      queryClient.setQueryData([`housing`, housingId], data);
      await queryClient.refetchQueries('housings');
      await queryClient.refetchQueries('upcomingInvoices');
      if (isMounted.current) {
        resetTouchedSections();
      }
    }

    return null;
  };

  const {
    linkToGo,
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
    linkToGoState,
    cleanupSavingModalDetails,
  } = useConfirmLeaveModal(isAnySectionTouched);

  const onSubmit = async (data: FormTypes) => {
    if (isSelfCheckinDisabled) {
      openSelfCheckinDisabledModal();
      return;
    }
    scrollToTop();
    setStatus('loading');
    await submitOnlineCheckin({
      housing: housingId,
    });

    const isPoliceSectionActive =
      POLICE_TYPES[country] && policeConnectionSectionRef.current?.active;
    const isStatSectionActive =
      COUNTRIES_WITH_STAT.includes(country) && statConnectionSectionRef.current?.active;
    let isPoliceAccountValid = false;
    let isStatAccountValid = false;

    if (isPoliceSectionActive) {
      isPoliceAccountValid = await validatePoliceAndGetResult();
      const isNeedDeleteHousingFromCustomForm =
        housingId && !hasHousingPoliceActivated(housing) && customForm?.id;

      if (!isPoliceAccountValid) {
        resetStatus();
        return;
      }

      if (isNeedDeleteHousingFromCustomForm) {
        await deleteHousingFromCustomForm();
      }
    }

    const canValidateStat = isPoliceSectionActive
      ? isPoliceAccountValid && isStatSectionActive
      : isStatSectionActive;
    if (canValidateStat) {
      isStatAccountValid = await validateStatAndGetResult();

      if (!isStatAccountValid) {
        resetStatus();
        return;
      }
    }

    const seasonsError = await deleteOrSaveSeasons();
    if (seasonsError) {
      return;
    }

    const housingUpdateError = await updateHousing(data);
    if (housingUpdateError) {
      return;
    }

    setStatus('success');

    if (!housingUpdateError && linkToGo) {
      history.push(linkToGo, linkToGoState);
      cleanupSavingModalDetails();
    }
  };

  const isHousingUniversalLinkComponentVisible = !USER_ORIGINS_WITHOUT_CHECKIN_LINK_SECTION.includes(
    user?.origin || '',
  );

  const identityVerificationSettings = {
    isActive: identityVerificationSectionRef?.current?.active,
    allGuests: parseBooleanFromString(
      formMethods.getValues(HOUSING_FORM_NAMES.is_biometric_match_for_all_enabled),
    ),
  };

  return (
    <>
      <ErrorModal />
      <ContentWrapper>
        <FormProvider {...formMethods}>
          <Wrapper>
            <FormHeader
              clickToBack={() => goThroughConfirm('/properties')}
              title={housingName}
              subtitle={
                isOriginSiteMinder ? (
                  <FormHeaderSubtitle>
                    {t('property_id')}: {housing?.id}
                    <ActivationSiteMinderButton />
                  </FormHeaderSubtitle>
                ) : (
                  ''
                )
              }
              action={
                <>
                  <DeactivateHousingButton
                    disabled={!housing || isLoading}
                    onClick={openHousingActivationModal}
                  >
                    {isHousingDeactivated
                      ? t('activate_property')
                      : t('deactivate_property')}
                  </DeactivateHousingButton>
                  {user?.show_buttons_add_delete_import_housings && (
                    <Button
                      danger
                      type="button"
                      disabled={!housing || isLoading}
                      onClick={openRemoveHousingModal}
                      icon={<img src={rubbishIcon} alt="" height={16} width={10} />}
                      label={t('delete_property')}
                    />
                  )}
                </>
              }
            />
            {!housing && (
              <LoaderWrapper>
                <Loader {...loaderProps} />
              </LoaderWrapper>
            )}
            {housing && (
              <>
                <FirstFormSectionWrapper>
                  <HousingInfoSection
                    setIsSectionTouched={setIsSectionsTouched}
                    disabled={areSectionsDisabled}
                    isContractsSectionActive={isContractsSectionActive}
                    housing={housing}
                    spacesCount={numberOfSpaces}
                  />
                </FirstFormSectionWrapper>
                <div ref={policeViewRef}>
                  <HousingPoliceConnectionSection
                    setIsSectionTouched={setIsSectionsTouched}
                    setIsPoliceSectionActive={setIsPoliceSectionActive}
                    disabled={areSectionsDisabled}
                    country={country}
                    ref={policeConnectionSectionRef}
                    housing={housing}
                    hasCustomForm={!!customForm?.id}
                    openIncompleteModal={openIncompleteModal}
                  />
                </div>
                <div ref={statViewRef}>
                  <HousingStatConnectionSection
                    setIsSectionTouched={setIsSectionsTouched}
                    disabled={areSectionsDisabled}
                    country={country}
                    ref={statConnectionSectionRef}
                    housing={housing}
                    openIncompleteModal={openIncompleteModal}
                  />
                </div>
                <HousingOnlineCheckInSection
                  ref={onlineCheckInSectionRef}
                  disabled={areSectionsDisabled}
                  housing={housing}
                  state={sendingSettingsState}
                  dispatch={sendingSettingsDispatch}
                />
                {!isHousingDeactivated && isHousingUniversalLinkComponentVisible && (
                  <HousingUniversalLink link={housing.checkin_online_link} />
                )}
                {isHotelSubscription && (
                  <HousingSpacesSection
                    setIsSectionTouched={setIsSectionsTouched}
                    ref={spacesSectionRef}
                    disabled={areSectionsDisabled}
                    initSpaces={housing?.rooms}
                    setRooms={setRooms}
                    rooms={rooms}
                  />
                )}
                <HousingIdentityVerificationSection
                  setIsSectionTouched={setIsSectionsTouched}
                  disabled={areSectionsDisabled}
                  housing={housing}
                  ref={identityVerificationSectionRef}
                  isPoliceConnectionActive={isPoliceSectionActive}
                  setIsSubmitDisabled={setIsSelfCheckinDisabled}
                />
                <HousingRemoteAccessSection
                  ref={remoteAccessSectionRef}
                  setIsSectionTouched={setIsSectionsTouched}
                  disabled={areSectionsDisabled}
                  housing={housing}
                  rooms={getRoomsPayload().rooms}
                  setIsSubmitDisabled={setIsSelfCheckinDisabled}
                  identityVerificationSettings={identityVerificationSettings}
                  isTaxesSectionActive={taxesSectionRef.current.active}
                  isBookingPaymentsSectionActive={isBookingPaymentsSectionActive}
                  isSecurityDepositSectionActive={isSecurityDepositSectionActive}
                />
                <HousingUpsellingSection
                  setIsSectionTouched={setIsUpsellingSectionTouched}
                  handlePaymentSectionToggle={handlePaymentSectionToggle}
                  ref={upsellingSectionRef}
                  disabled={areSectionsDisabled}
                  housing={housing}
                  country={country}
                />
                <HousingContractsSection
                  setIsSectionTouched={setIsSectionsTouched}
                  ref={contractsSectionRef}
                  disabled={areSectionsDisabled}
                  setIsContractsSectionActive={setIsContractsSectionActive}
                  housing={housing}
                  country={country}
                />
                <HousingTaxesSection
                  openExportTaxesModal={openExportTaxesModal}
                  closeExportTaxesModal={closeExportTaxesModal}
                  isExportTaxesModalOpen={isExportTaxesModalOpen}
                  setIsSectionTouched={setIsSectionsTouched}
                  ref={taxesSectionRef}
                  disabled={arePaymentSectionsDisabled}
                  areSeasonsLoading={areSeasonsLoading}
                  highSeason={highSeason}
                  lowSeason={lowSeason}
                  housing={housing}
                  country={country}
                  province={province}
                  handlePaymentSectionToggle={handlePaymentSectionToggle}
                />
                {isBookingPaymentsShown && (
                  <HousingBookingPaymentsSection
                    housing={housing}
                    disabled={arePaymentSectionsDisabled}
                    setIsSectionTouched={setIsSectionsTouched}
                    handlePaymentSectionToggle={handlePaymentSectionToggle}
                    setBookingPaymentsSectionActive={setBookingPaymentsSectionActive}
                  />
                )}
                <HousingSecurityDepositSection
                  disabled={arePaymentSectionsDisabled}
                  setIsSectionTouched={setIsSectionsTouched}
                  housing={housing}
                  handlePaymentSectionToggle={handlePaymentSectionToggle}
                  setSecurityDepositSectionActive={setSecurityDepositSectionActive}
                />
                {user?.is_icals_allowed && (
                  <HousingICalsSection
                    setIsSectionTouched={setIsSectionsTouched}
                    disabled={areSectionsDisabled}
                    initICals={getInitICals()}
                  />
                )}
              </>
            )}
            {housing &&
              !isRemoveHousingModalOpen &&
              !isOnlineCheckinDisabled &&
              (isAnySectionTouched || !isIdle) && (
                <FloatingSaveButton
                  status={status}
                  onClick={formMethods.handleSubmit(onSubmit)}
                />
              )}
          </Wrapper>
        </FormProvider>
      </ContentWrapper>
      <IncompleteFormDataModal
        open={isDataIncompleteModalOpen}
        onClose={() => setIsDataIncompleteModalOpen(false)}
        text={t('you_cant_add_this_property_until')}
      />
      <DeleteConfirmationModal
        title={isLoading ? t('deleting') : t('are_you_sure')}
        text={
          isLoading
            ? `${t('it_takes_seconds')}...`
            : t('you_have_to_know_that_all_information')
        }
        deleteButtonLabel={t('delete_property')}
        onClose={closeRemoveHousingModal}
        onDelete={deleteHousing}
        isOpen={isRemoveHousingModalOpen}
        icon={deletePropertyIcon}
        areButtonsShown={isIdle}
      />
      {isDoYouWantToSaveModalOpen && (
        <YouHaveMadeChangesModal
          handleModalSave={() => handleModalSave(formMethods.handleSubmit(onSubmit))}
          handleModalDontSave={handleModalDontSave}
          handleModalCancel={handleModalCancel}
        />
      )}
      <SelfCheckinDisabledModal
        isSelfCheckinDisabledModalOpen={isSelfCheckinDisabledModalOpen}
        closeSelfCheckinDisabledModal={closeSelfCheckinDisabledModal}
      />
      <HousingActivationModals
        housingId={housingId}
        isHousingDeactivated={isHousingDeactivated}
        setIsHousingDeactivated={setIsHousingDeactivated}
        open={isHousingActivationModalOpen}
        onClose={closeHousingActivationModal}
      />
      <MissingPaymentSettingsModal
        open={isMissingPaymentSettingsModalOpen}
        onClose={closeMissingPaymentSettingsModal}
      />
      <HousingPaymentsProviderIncompleteModal
        open={isPaymentSettingsInProgressModalOpen}
        onClose={closePaymentSettingsInProgressModal}
      />
    </>
  );
}

export {EditHousingSections};
