import React from 'react';
import {useHistory} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import {FormProvider, useForm} from 'react-hook-form';
import {format, isValid} from 'date-fns';
import {useQueryClient} from 'react-query';
import {useUser} from '../../../context/user';
import api from '../../../api';
import {Housing, Room, SelectOption, TempLock} from '../../../utils/types';
import {
  COUNTRIES_WITH_STAT,
  POLICE_TYPES,
  SECURITY_DEPOSIT_STATUSES,
  LOCK_ACCESS_TYPES,
  UPSELLING_PAYMENTS_STATUS,
  COUNTRY_CODES,
  HOUSING_VERIFICATION_TYPE,
} from '../../../utils/constants';
import {
  scrollToTop,
  getIsBookingPaymentsShown,
  parseBooleanFromString,
} from '../../../utils/common';
import {
  buildExternalSourcesPayload,
  buildHousingPayload,
  buildPolicePayload,
  buildStatPayload,
} from '../../../utils/housing';
import {useComputedDetails} from '../../../context/computedDetails';
import {
  useErrorModal,
  useIsMounted,
  useScrollToTop,
  useStatus,
  useModalControls,
} from '../../../utils/hooks';
import {HOUSING_FORM_NAMES} from 'utils/formNames';
import {UpsellingSectionRefType} from '../HousingUpsellingSection/HousingUpsellingSection';
import {useConfirmLeaveModal} from '../../../context/openModals';
import propertyIcon from '../../../assets/icon-property.svg';
import floppyDiskIcon from '../../../assets/floppy-disk.svg';
import {
  FORM_NAMES as ICALS_FORM_NAMES,
} from '../HousingICalsSection';
import FormHeader from '../FormHeader';
import Button from '../Button';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import HousingRemoteAccessSection from '../HousingRemoteAccessSection';
import {
  BOOKING_FORM_FEES_NAMES,
} from '../HousingBookingPaymentsSection';
import {RESERVATION_PAYMENT_STATUSES} from '../ReservationPayments';
import {
  FORM_NAMES as TAXES_FORM_NAMES,
} from '../HousingTaxesSection';
import SelfCheckinDisabledModal from '../SelfCheckinDisabledModal';
import {
  ModalTwoButtonsWrapper,
  ContentWrapper,
  FirstFormSectionWrapper,
} from '../../../styled/common';
import {FEES_OPTIONS_PAYLOAD} from '../FeesOptions';
import {
  useSendingSettingsRef,
  reducer,
  initialState,
  ACTION_TYPES,
} from '../OnlineSendingSettings';
import IncompleteFormDataModal from '../IncompleteFormDataModal';
import {
  BottomButtonWrapper,
  ButtonLabelIcon,
  ButtonLabelText,
  ButtonLabelWrapper,
  PropertyName,
} from './styled';

const IS_UNDER_MAINTENANCE = process.env.REACT_APP_MAINTENANCE_MODE;
export const SITEMINDER_HOUSING_ID_STORAGE_KEY = 'siteminderHousingIdStorageKey';

export type FormTypes = {
  [HOUSING_FORM_NAMES.name]: string;
  [HOUSING_FORM_NAMES.country]: SelectOption;
  [HOUSING_FORM_NAMES.province]: SelectOption;
  [HOUSING_FORM_NAMES.address]: string;
  [HOUSING_FORM_NAMES.city]: string;
  [HOUSING_FORM_NAMES.vatin]: string;
  [HOUSING_FORM_NAMES.contract_type]: SelectOption;
  [HOUSING_FORM_NAMES.tourism_registration_number]: string;
  [HOUSING_FORM_NAMES.manager_name]: string;
  [HOUSING_FORM_NAMES.verification_type]: HOUSING_VERIFICATION_TYPE;
  [HOUSING_FORM_NAMES.manager_phone]: string;
  [HOUSING_FORM_NAMES.manager_birth_date]: Date;
  [HOUSING_FORM_NAMES.rooms_quantity]: number;
  [HOUSING_FORM_NAMES.depositAmount]: string;
  [HOUSING_FORM_NAMES.security_deposit_status]: SECURITY_DEPOSIT_STATUSES;
  [HOUSING_FORM_NAMES.booking_exempt_sources]?: SelectOption[];
  [HOUSING_FORM_NAMES.tax_exempt_sources]?: SelectOption[];
  [HOUSING_FORM_NAMES.deposit_exempt_sources]?: SelectOption[];
  [HOUSING_FORM_NAMES.is_biometric_match_for_all_enabled]?: boolean;
  [HOUSING_FORM_NAMES.email_language]:
    | {
        value: string;
        label: string;
        iso2: string;
      }
    | undefined;
  reservation_payments_status?: RESERVATION_PAYMENT_STATUSES;
  [BOOKING_FORM_FEES_NAMES.charge_fees_to_guest]?: FEES_OPTIONS_PAYLOAD;
  [HOUSING_FORM_NAMES.commission_responsibility_for_tourist_tax]?: FEES_OPTIONS_PAYLOAD;
};

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
};

type TaxesSectionRefType = {
  getHighSeasonPayload: () => any;
  getLowSeasonPayload: () => any;
  active: boolean;
};

function AddRemoteAccessSection() {
  useScrollToTop();
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useUser();
  const history = useHistory();
  const isMounted = useIsMounted();
  const formMethods = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {ErrorModal, displayError} = useErrorModal();

  const {isLoading, setStatus, resetStatus} = useStatus();
  const {
    isAccountCollaborator,
    isNeedToAskForSubscription,
    isAccountWithSiteMinderOrigin,
  } = useComputedDetails();
  const policeViewRef = React.useRef<HTMLDivElement>(null);
  const statViewRef = React.useRef<HTMLDivElement>(null);
  // const [
  //   isBookingPaymentsSectionActive,
  //   setBookingPaymentsSectionActive,
  // ] = React.useState(false);
  const isBookingPaymentsSectionActive = false
  // const [
  //   isSecurityDepositSectionActive,
  //   setSecurityDepositSectionActive,
  // ] = React.useState(false);
  const isSecurityDepositSectionActive = false;
  const [isHousingModalOpen, setIsHousingModalOpen] = React.useState(false);
  const [wasDataIncompleteModalOpened, setWasDataIncompleteModalOpened] = React.useState(
    false,
  );
  const [isDataIncompleteModalOpen, setIsDataIncompleteModalOpen] = React.useState(false);
  const [isCreatingLocks, setIsCreatingLocks] = React.useState(false);
  const [createdHousingId, setCreatedHousingId] = React.useState('');
  // const [rooms, setRooms] = React.useState<Room[]>([]);
  const rooms:Room[] = []
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
  // const [isUpsellingSectionTouched, setIsUpsellingSectionTouched] = React.useState(false);
  const isUpsellingSectionTouched = false;

  const isAnySectionTouched =
    isSectionsTouched || isOnlineCheckinTouched || isUpsellingSectionTouched;

  const resetTouchedSections = () => {
    setIsSectionsTouched(false);
    sendingSettingsDispatch({type: ACTION_TYPES.touched, payload: false});
  };

  const housingName = formMethods.watch(HOUSING_FORM_NAMES.name) || t('new_property');
  const country = formMethods.watch(HOUSING_FORM_NAMES.country)?.value || '';
  const isSelectedCountryDubai = country === COUNTRY_CODES.uae;

  const isBookingPaymentsShown = getIsBookingPaymentsShown(user?.origin);

  const spacesSectionRef = React.useRef<SpacesSectionRefType>({
    active: false,
  });
  const contractsSectionRef = React.useRef<ContractsSectionRefType>({
    active: false,
    extraClauses: [],
    signature: '',
  });
  const policeConnectionSectionRef = React.useRef<PoliceConnectionSectionRefType>({
    active: false,
    submit: () => false,
    getValues: () => ({}),
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
  });
  const taxesSectionRef = React.useRef<TaxesSectionRefType>({
    getHighSeasonPayload: () => {},
    getLowSeasonPayload: () => {},
    active: false,
  });
  const upsellingSectionRef = React.useRef<UpsellingSectionRefType>({
    active: false,
  });

  const openIncompleteModal = React.useCallback(() => {
    if (!wasDataIncompleteModalOpened) {
      setIsDataIncompleteModalOpen(true);
      setWasDataIncompleteModalOpened(true);
    }
  }, [wasDataIncompleteModalOpened]);

  React.useEffect(() => {
    if (IS_UNDER_MAINTENANCE) {
      history.push('/properties');
    }
  }, [history]);

  const onError = () => {
    openIncompleteModal();
  };

  React.useEffect(
    function redirect() {
      const isAccessDenied = isNeedToAskForSubscription || isAccountCollaborator;
      if (isAccessDenied) {
        history.push('/bookings');
      }
    },
    [history, isAccountCollaborator, isNeedToAskForSubscription],
  );

  const goToHousings = () => {
    history.push('/properties');
  };

  const goToCreatedHousing = () => {
    history.push(`/properties/${createdHousingId}`);
  };

  const openHousingModal = () => {
    setIsHousingModalOpen(true);
  };

  const closeHousingModal = () => {
    setIsHousingModalOpen(false);
  };

  const getPolicePayload = () => {
    const data = policeConnectionSectionRef.current?.getValues();
    const isActive = POLICE_TYPES[country] && policeConnectionSectionRef.current?.active;

    if (!isActive) {
      return {};
    }
    return buildPolicePayload(data);
  };

  const getStatPayload = () => {
    const data = statConnectionSectionRef.current?.getValues();
    const isActive =
      COUNTRIES_WITH_STAT.includes(country) && statConnectionSectionRef.current?.active;

    if (!isActive) {
      return {};
    }
    return buildStatPayload(data);
  };

  const getContractsPayload = (data: FormTypes) => {
    const isActive = contractsSectionRef.current?.active;

    if (!isActive) {
      return {};
    }

    return {
      is_contract_enabled: true,
      manager_signature: contractsSectionRef.current?.signature || undefined,
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
        data[HOUSING_FORM_NAMES.manager_name] || undefined,
    };
  };

  //copypaste

  const getICalsPayload = (data: any) => {
    const isActive =
      data[ICALS_FORM_NAMES.booking] ||
      data[ICALS_FORM_NAMES.airbnb] ||
      data[ICALS_FORM_NAMES.other];

    if (!isActive) {
      return {};
    }
    return buildExternalSourcesPayload(data);
  };

  const getHousingPayload = (data: FormTypes) => {
    const payload = buildHousingPayload(data, country);
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
      is_smart_lock_enabled: isRemoteAccessSectionActive,
      is_self_online_check_in_enabled: isIdentityVerificationSectionActive,
      self_check_in_instructions: remoteAccessSectionRef.current?.instructions,
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

  const handleResponseError = (error: any) => {
    if (!isMounted.current) {
      return;
    }

    closeHousingModal();
    setStatus('error');
    displayError(error);
  };

  const createLocks = async (
    tempLocks: TempLock[],
    housingId: string,
    housingRooms: Room[] = [],
  ) => {
    let hasError: any = null;

    for await (let lock of tempLocks) {
      if (!hasError && isMounted.current) {
        const isLockAssignedToAJustCreatedRoom =
          lock.access_type === LOCK_ACCESS_TYPES.private && !lock?.room_id;
        const payload = {
          ...lock,
          housing: housingId,
        };

        if (isLockAssignedToAJustCreatedRoom) {
          const lockRoom = housingRooms.find((room) => {
            return room?.number === lock?.room_number;
          });

          if (!lockRoom?.id) {
            return;
          }

          payload.room_id = lockRoom?.id;
        }

        const {error} = await api.locks.createLock(payload);
        hasError = error;
      }
    }
    return hasError;
  };

  const submitTempLocks = async (housingId: string, housingRooms: Room[] = []) => {
    const active = remoteAccessSectionRef.current?.active;
    const lockUser = remoteAccessSectionRef.current?.lockUser;
    const tempLocks = remoteAccessSectionRef.current?.tempLocks;

    if (!active || !tempLocks?.length || !lockUser) {
      return;
    }

    setIsCreatingLocks(true);

    const error = await createLocks(tempLocks, housingId, housingRooms);
    if (error) {
      return error;
    }

    setIsCreatingLocks(false);
  };

  const createHousing = async (housingData: FormTypes) => {
    const payload = getPayload(housingData);

    openHousingModal();
    const {error, data} = await api.housings.post(payload);

    if (!isMounted.current) {
      return null;
    }

    if (error) {
      handleResponseError(error);
      return null;
    }

    if (data) {
      const createdId = data?.id || '';

      await onlineCheckInSectionRef.current?.submitOnlineCheckin({
        housing: createdId,
      });

      setCreatedHousingId(createdId);
      queryClient.setQueryData([`housing`, data.id], data);

      const housingRooms = data?.rooms;
      const locksError = await submitTempLocks(data.id, housingRooms);
      if (locksError) {
        handleResponseError(locksError);
        return;
      }

      if (isAccountWithSiteMinderOrigin) {
        localStorage.setItem(SITEMINDER_HOUSING_ID_STORAGE_KEY, data.id);
      }

      await queryClient.refetchQueries('housings');
      await queryClient.refetchQueries('upcomingInvoices');
    }

    return data;
  };

  const validatePoliceAndGetResult = async () => {
    policeViewRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    const isValid = await policeConnectionSectionRef.current.submit();

    if (!isValid) {
      setStatus('error');
    }
    return isValid;
  };

  const validateStatAndGetResult = async () => {
    statViewRef.current?.scrollIntoView({behavior: 'smooth'});
    const isValid = await statConnectionSectionRef.current.submit();

    if (!isValid) {
      setStatus('error');
    }
    return isValid;
  };

  const {
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
  } = useConfirmLeaveModal(isAnySectionTouched);

  const createSeason = async (payload: any) => {
    const result = await api.seasons.post(payload);

    if (result.error && isMounted.current) {
      displayError(result.error);
    }
    return result;
  };

  const createHighSeason = async (housingId: string) => {
    const payload = taxesSectionRef?.current?.getHighSeasonPayload();
    const result = await createSeason({...payload, housing_id: housingId});

    if (result.data?.id) {
      queryClient.setQueryData(['highSeason', result.data?.id], result.data);
    }
    return result;
  };

  const createLowSeason = async (housingId: string) => {
    const payload = taxesSectionRef?.current?.getLowSeasonPayload();
    if (!payload) {
      return {
        error: null,
        data: null,
      };
    }

    const result = await createSeason({...payload, housing_id: housingId});

    if (result.data?.id) {
      queryClient.setQueryData(['lowSeason', result.data.id], result.data);
    }
    return result;
  };

  const createSeasons = async (housingId: string) => {
    const highSeasonResult = await createHighSeason(housingId);
    if (highSeasonResult.error) {
      return highSeasonResult.error;
    }

    const lowSeasonResult = await createLowSeason(housingId);
    if (lowSeasonResult.error) {
      return lowSeasonResult.error;
    }

    // =>>>>> ts questions ANY
    queryClient.setQueryData(['housing', housingId], (prevData?: any) => {
      if (!prevData) {
        return prevData;
      }

      const seasons = [];
      const highSeasonId = highSeasonResult?.data?.id;
      const lowSeasonId = lowSeasonResult?.data?.id;

      if (highSeasonId) {
        seasons.push(highSeasonId);
      }
      if (lowSeasonId) {
        seasons.push(lowSeasonId);
      }

      return {
        ...prevData,
        seasons,
      };
    });

    return null;
  };

  const saveSeasons = async (housingId: string) => {
    if (!taxesSectionRef?.current?.active) {
      setStatus('success');
      return;
    }

    const creationError = await createSeasons(housingId);
    if (creationError) {
      setStatus('idle');
      return;
    }

    setStatus('success');
  };

  const onSubmit = async (data: FormTypes) => {
    if (isSelfCheckinDisabled) {
      openSelfCheckinDisabledModal();
      return;
    }

    const isPoliceSectionActive =
      POLICE_TYPES[country] && policeConnectionSectionRef.current?.active;
    const isStatSectionActive =
      COUNTRIES_WITH_STAT.includes(country) && statConnectionSectionRef.current?.active;
    let isPoliceAccountValid = false;
    let isStatAccountValid = false;

    scrollToTop();
    setStatus('loading');

    if (isPoliceSectionActive) {
      isPoliceAccountValid = await validatePoliceAndGetResult();

      if (!isPoliceAccountValid) {
        resetStatus();
        return;
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
    const housingData = await createHousing(data);

    const housingId = housingData?.id || '';
    await saveSeasons(housingId);
    resetTouchedSections();
  };

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
          <div>
            <FormHeader
              title={housingName}
              clickToBack={() => goThroughConfirm('/properties')}
              action={
                <Button
                  onClick={formMethods.handleSubmit(onSubmit, onError)}
                  disabled={isLoading || isOnlineCheckinDisabled}
                  label={
                    <ButtonLabelWrapper>
                      <ButtonLabelIcon src={floppyDiskIcon} alt="Plus" />
                      <ButtonLabelText>{t('save_property')}</ButtonLabelText>
                    </ButtonLabelWrapper>
                  }
                />
              }
            />
            <FirstFormSectionWrapper>
            <HousingRemoteAccessSection
              ref={remoteAccessSectionRef}
              setIsSectionTouched={setIsSectionsTouched}
              rooms={getRoomsPayload().rooms}
              disabled={isLoading}
              setIsSubmitDisabled={setIsSelfCheckinDisabled}
              identityVerificationSettings={identityVerificationSettings}
              isTaxesSectionActive={taxesSectionRef.current.active}
              isSecurityDepositSectionActive={isSecurityDepositSectionActive}
              isBookingPaymentsSectionActive={isBookingPaymentsSectionActive}
            />
            </FirstFormSectionWrapper>
            <BottomButtonWrapper>
              <Button
                onClick={formMethods.handleSubmit(onSubmit, onError)}
                disabled={isLoading || isOnlineCheckinDisabled}
                label={
                  <ButtonLabelWrapper>
                    <ButtonLabelIcon src={floppyDiskIcon} alt="Plus" />
                    <ButtonLabelText>{t('save_property')}</ButtonLabelText>
                  </ButtonLabelWrapper>
                }
              />
            </BottomButtonWrapper>
          </div>
        </FormProvider>
      </ContentWrapper>
      <IncompleteFormDataModal
        open={isDataIncompleteModalOpen}
        text={t('you_cant_add_this_property_until')}
        onClose={() => setIsDataIncompleteModalOpen(false)}
      />
      {isDoYouWantToSaveModalOpen && (
        <YouHaveMadeChangesModal
          handleModalSave={() =>
            handleModalSave(formMethods.handleSubmit(onSubmit, onError))
          }
          handleModalDontSave={handleModalDontSave}
          handleModalCancel={handleModalCancel}
        />
      )}
      {isHousingModalOpen && (
        <Modal
          open
          iconSrc={propertyIcon}
          iconAlt="Property"
          iconProps={{
            height: 84,
            width: 84,
          }}
          title={isLoading ? t('creating_property') : t('property_added')}
          text={
            isCreatingLocks ? (
              `${t('creating_locks')}...`
            ) : isLoading ? (
              `${t('it_takes_seconds')}...`
            ) : (
              <Trans values={{name: housingName}} i18nKey="your_property_name_added">
                Your property <PropertyName>123</PropertyName> has been added
                successfully!
              </Trans>
            )
          }
        >
          {!isLoading && (
            <ModalTwoButtonsWrapper>
              {createdHousingId && (
                <ModalButton label={t('view_my_property')} onClick={goToCreatedHousing} />
              )}
              <ModalButton
                secondary
                label={t('go_to_properties')}
                onClick={goToHousings}
              />
            </ModalTwoButtonsWrapper>
          )}
        </Modal>
      )}
      <ErrorModal />
      <SelfCheckinDisabledModal
        isSelfCheckinDisabledModalOpen={isSelfCheckinDisabledModalOpen}
        closeSelfCheckinDisabledModal={closeSelfCheckinDisabledModal}
      />
    </>
  );
}

export {AddRemoteAccessSection};
