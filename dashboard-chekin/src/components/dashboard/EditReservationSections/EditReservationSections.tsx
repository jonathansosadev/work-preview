import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {useHistory, useParams} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import {Moment} from 'moment';
import {useQuery, useQueryClient} from 'react-query';
import useFetchSeason from '../../../hooks/useFetchSeason';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import {
  useErrorToast,
  useIsMounted,
  useModalControls,
  usePrevious,
  useScrollToTop,
  useStatus,
} from '../../../utils/hooks';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {clearLocationState, toastResponseError} from '../../../utils/common';
import {
  EditReservationPayments,
  useReservationPayments,
  ReservationPaymentsRefType,
} from '../ReservationPayments';
import {
  COUNTRY_CODES,
  DEFAULT_OCCUPIED_ROOMS_NUMBER,
  GUEST_PLACEHOLDER_ID,
  QUERY_CACHE_KEYS,
} from '../../../utils/constants';
import {getCountryCode, getName} from '../../../utils/housing';
import {useComputedDetails} from '../../../context/computedDetails';
import {ExtendedHousing, FORM_NAMES, FormTypes} from '../ReservationInfoSection';
import {LightReservation, UnlockLink} from '../../../utils/types';
import {
  buildReservationPayload,
  getHasBookingPayments,
  getHasSecurityDeposit,
  getHasTaxes,
} from '../../../utils/reservations';
import api, {queryFetcher} from '../../../api';
import {useHousingExemptions} from '../../../hooks/useHousingExemptions';
import {useUser} from '../../../context/user';
import {MAX_TOTAL_PAYMENT} from '../ReservationPayments/EditReservationPayments/EditReservationPayments';
import {UPSELLING_PAYMENTS_STATUSES} from '../ReservationPayments/utils';
import {useSendingSettingsRef, reducer, initialState} from '../OnlineSendingSettings';
import ReservationInfoSection, {
  EXTENDED_HOUSING_FIELD_SET,
} from '../ReservationInfoSection';
import plusIcon from '../../../assets/plus.svg';
import deleteBookingIcon from '../../../assets/icon-delete-booking.svg';
import rubbishIcon from '../../../assets/rubbish-bin.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import FormHeader from '../FormHeader';
import Button from '../Button';
import DeleteConfirmationModal from '../DeleteConfirmationModal';
import ReservationStatusSection from '../ReservationStatusSection';
import ReservationOnlineCheckInSection from '../ReservationOnlineCheckInSection';
import GuestInfoSection from '../GuestInformationSection';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import FloatingSaveButton from '../FloatingSaveButton';
import ReservationPhotosSection from '../ReservationPhotosSection';
import ReservationUpsellingSection from '../ReservationUpsellingSection';
import ReservationRemoteAccessSection from '../ReservationRemoteAccessSection';
import IncompleteFormDataModal from '../IncompleteFormDataModal';
import ModalButton from '../ModalButton';
import ReservationTaxesSection from '../ReservationTaxesSection';
import Modal from '../Modal';
import DepositChargeModals from '../DepositChargeModals';
import BookingsComunicationSections from '../BookingsComunicationSection';
import {ContentWrapper, FirstFormSectionWrapper} from '../../../styled/common';
import {
  ButtonLabelIcon,
  ButtonLabelText,
  ButtonLabelWrapper,
  DeleteButtonWrapper,
  Wrapper,
} from './styled';

function fetchReservation(key: string) {
  return queryFetcher(api.reservations.ENDPOINTS.oneLight(key));
}

function fetchUnlockLinks(reservationId: string) {
  return queryFetcher(api.locks.ENDPOINTS.unlockLinks(`reservation_id=${reservationId}`));
}

function EditReservationSections() {
  useScrollToTop();
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const history = useHistory();
  const {id: reservationId} = useParams<{id: string}>();
  const user = useUser();
  const {isNeedToAskForSubscription} = useComputedDetails();
  const formMethods = useForm<FormTypes>({
    defaultValues: {
      [FORM_NAMES.occupied_rooms]: String(DEFAULT_OCCUPIED_ROOMS_NUMBER),
    },
    shouldUnregister: true,
  });
  const {
    openModal: openDepositChargeModals,
    closeModal: closeDepositChargeModals,
    isOpen: isDepositChargeModalsOpen,
  } = useModalControls();
  const {formState} = formMethods;
  const prevFormState = usePrevious<typeof formState>(formState);
  const [isInfoSectionTouched, setIsInfoSectionTouched] = React.useState(false);
  const [isTaxesSectionTouched, setIsTaxesSectionTouched] = React.useState(false);
  const [isReservationMarkedAsPaid, setIsReservationMarkedAsPaid] = React.useState(false);
  const [isPaymentsSectionTouched, setIsPaymentsSectionTouched] = React.useState(false);
  const [extendedSelectedHousing, setExtendedSelectedHousing] = React.useState<
    ExtendedHousing
  >();

  const [sendingSettingsState, sendingSettingsDispatch] = React.useReducer(
    reducer,
    initialState,
  );
  const {
    isTouched: isOnlineCheckinTouched,
    isDisabled: isOnlineCheckinDisabled,
  } = sendingSettingsState;
  const sendingSettingsRef = useSendingSettingsRef();

  const isAnySectionTouched =
    isInfoSectionTouched ||
    isOnlineCheckinTouched ||
    isTaxesSectionTouched ||
    isPaymentsSectionTouched;

  const resetTouchedSections = () => {
    setIsInfoSectionTouched(false);
    setIsPaymentsSectionTouched(false);
    resetTaxesSection();
  };

  const reservationPaymentsRef = React.useRef<ReservationPaymentsRefType>();

  const {isLoading, setStatus, status, isIdle} = useStatus({
    autoReset: true,
  });
  const {
    isLoading: isDeleting,
    setStatus: setDeleteStatus,
    isSuccess: isDeleted,
    isIdle: isNotDeleting,
    isError: isDeleteError,
  } = useStatus();
  const {
    openModal: openReservationDeleteModalOpen,
    closeModal: closeReservationDeleteModal,
    isOpen: isReservationDeleteModalOpen,
  } = useModalControls();
  const {
    openModal: openDataIncompleteModal,
    closeModal: closeDataIncompleteModal,
    isOpen: isDataIncompleteModalOpen,
  } = useModalControls();
  const {
    closeModal: closeTotalAmountModal,
    isOpen: isTotalAmountModalOpen,
    openModal: openTotalAmountModal,
  } = useModalControls();

  const {data: reservation, refetch: refetchReservation} = useQuery<LightReservation>(
    reservationId,
    () => fetchReservation(reservationId),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  const {data: reservationPayments} = useReservationPayments(reservation?.id);

  const hasReservationBeenPaid = reservationPayments?.some(
    (payment) => payment.status === 'PAID',
  );
  const isDeleteBookingButtonShown =
    !!user?.show_buttons_add_edit_delete_reservations && hasReservationBeenPaid === false;

  const {
    data: unlockLinks,
    status: unlocksLinksStatus,
    error: unlocksLinksError,
  } = useQuery<UnlockLink[], [string, string]>(
    ['unlockLinks', reservationId],
    () => fetchUnlockLinks(reservationId),
    {
      enabled: Boolean(reservationId),
    },
  );
  useErrorToast(unlocksLinksError, {
    notFoundMessage: 'Requested unlocks could not be found. Please contact support',
  });

  const reservationHousingId = reservation?.housing_id;
  const {
    data: reservationExtendedHousing,
    status: reservationExtendedHousingStatus,
  } = useQuery<ExtendedHousing>(
    ['extendedHousing', reservationHousingId!, EXTENDED_HOUSING_FIELD_SET],
    () => api.housings.fetchOne(reservationHousingId!, EXTENDED_HOUSING_FIELD_SET),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setExtendedSelectedHousing(data);
      },
      enabled: Boolean(reservationHousingId),
    },
  );

  const {watch} = formMethods;
  const sourceName = watch(FORM_NAMES.source_name)?.value;

  const housingId = extendedSelectedHousing?.id;
  const {exemptions} = useHousingExemptions(sourceName, housingId);
  const isReservationPaymentsStatusActive = getHasBookingPayments({
    housing: extendedSelectedHousing,
    exemptions,
  });
  const isContractsEnabled = extendedSelectedHousing?.is_contract_enabled;
  const isDepositEnabled = getHasSecurityDeposit({
    housing: extendedSelectedHousing,
    exemptions,
  });

  const hasTaxes = getHasTaxes({
    housing: extendedSelectedHousing,
    exemptions,
  });

  const isFranceHousing =
    getCountryCode(extendedSelectedHousing) === COUNTRY_CODES.france;
  const highSeasonId = extendedSelectedHousing?.seasons?.[0];
  const {highSeasonSuccess, highSeason} = useFetchSeason(
    highSeasonId,
    Boolean(isFranceHousing && hasTaxes),
  );

  const isReservationPaymentsActive = Boolean(
    extendedSelectedHousing &&
      (isReservationPaymentsStatusActive || isContractsEnabled || isDepositEnabled || Boolean(isFranceHousing && hasTaxes && highSeasonSuccess && !highSeason?.is_classified)),
  );

  const isUpsellingPaymentsActive =
    reservation &&
    extendedSelectedHousing?.upselling_payments_status ===
      UPSELLING_PAYMENTS_STATUSES.active;

  const guestGroupId = reservation?.guest_group_id;
  const {data: guestGroup} = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
    refetchOnWindowFocus: false,
  });

  const [wasDataIncompleteModalOpened, setWasDataIncompleteModalOpened] = React.useState(
    false,
  );

  const isDisabled =
    isLoading ||
    !reservation ||
    reservationExtendedHousingStatus === 'loading' ||
    unlocksLinksStatus === 'loading';

  const openIncompleteModal = React.useCallback(() => {
    if (!wasDataIncompleteModalOpened) {
      openDataIncompleteModal();
      setWasDataIncompleteModalOpened(true);
    }
  }, [openDataIncompleteModal, wasDataIncompleteModalOpened]);

  React.useEffect(
    function redirect() {
      if (isNeedToAskForSubscription) {
        history.push('/bookings');
      }
    },
    [history, isNeedToAskForSubscription],
  );

  React.useLayoutEffect(
    function showIncompleteModalOneTime() {
      const shouldOpenModal =
        formState.isSubmitted &&
        !formState.isSubmitSuccessful &&
        !prevFormState?.isValid &&
        !formState.isValid;

      if (shouldOpenModal) {
        openIncompleteModal();
      }
    },
    [formState, prevFormState, wasDataIncompleteModalOpened, openIncompleteModal],
  );

  React.useEffect(() => {
    window.addEventListener('beforeunload', clearLocationState);
    return () => {
      window.removeEventListener('beforeunload', clearLocationState);
    };
  }, []);

  const markReservationAsPaid = () => {
    setIsReservationMarkedAsPaid(true);
    setIsTaxesSectionTouched(true);
  };

  const resetTaxesSection = () => {
    setIsTaxesSectionTouched(false);
    setIsReservationMarkedAsPaid(false);
  };

  const goToReservations = () => {
    history.push('/bookings');
  };

  const handleResponseError = (error?: any) => {
    setStatus('error');
    toastResponseError(error);
  };

  const deleteReservation = async () => {
    setDeleteStatus('loading');
    const {data, error} = await api.reservations.deleteOne(reservation!.id);

    if (!isMounted.current) {
      return;
    }

    if (data) {
      await queryClient.refetchQueries('reservations');
      toast.success(t('booking_deleted'));
      goToReservations();
    }

    if (error) {
      setDeleteStatus('error');
      toastResponseError(error);
    }
  };

  const updateGuestGroup = async (reservation?: LightReservation) => {
    const guestGroupId = reservation?.guest_group_id;
    if (guestGroupId) {
      await queryClient.refetchQueries([QUERY_CACHE_KEYS.guestGroup, guestGroupId]);
    }
  };

  const getReservationPayload = (formData: FormTypes) => {
    return {
      ...buildReservationPayload(formData),
      ...(Boolean(hasTaxes && !isReservationPaymentsActive) && {
        have_taxes_been_paid: isReservationMarkedAsPaid || undefined,
      }),
      reservation_payments: reservationPaymentsRef.current?.getReservationPaymentsPayload(),
      ...reservationPaymentsRef.current?.getReservationDepositPayload(),
    };
  };

  const updateReservationAndGuestGroup = async (formData: FormTypes) => {
    const payload = getReservationPayload(formData);

    await sendingSettingsRef.current?.submitOnlineCheckin({
      reservation: reservationId,
    });

    const {error, data} = await api.reservations.put(reservation!.id, payload);

    if (data) {
      await updateGuestGroup(data);

      // TODO: uncomment when TB-2502 will be ready
      // queryClient.setQueryData<LightReservation>(reservationId, () => {
      //   return {
      //     ...data,
      //     guest_group_id: data?.guest_group?.id,
      //     housing_id: data?.housing?.id,
      //   };
      // });

      // TODO: remove when TB-2502 will be ready
      const {data: updatedReservation} = await refetchReservation();
      if (updatedReservation) {
        queryClient.setQueryData<LightReservation>(reservationId, updatedReservation);
      }

      reservationPaymentsRef.current?.onReservationPaymentsSuccess();
    }

    if (isMounted.current && error) {
      handleResponseError(error);
    }
    return error;
  };

  const {
    linkToGo,
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
  } = useConfirmLeaveModal(isAnySectionTouched);

  const getPersistedState = () => {
    const formData = {
      ...formMethods.getValues(),
      [FORM_NAMES.check_out_date]: (formMethods.getValues()[
        FORM_NAMES.check_out_date
      ] as Moment)?.toDate(),
      [FORM_NAMES.check_in_date]: (formMethods.getValues()[
        FORM_NAMES.check_in_date
      ] as Moment)?.toDate(),
    };

    return {
      formData,
    };
  };

  const goToGuest = (guestId = GUEST_PLACEHOLDER_ID) => {
    history.push(`/bookings/${reservation!.id}/guest/${guestId}`, getPersistedState());
  };

  const onSubmit = async (formData: FormTypes) => {
    if (isReservationPaymentsActive) {
      if (reservationPaymentsRef.current) {
        if (reservationPaymentsRef.current?.totalAmount > MAX_TOTAL_PAYMENT) {
          openTotalAmountModal();
          return;
        }
      }

      const isPaymentsValid = await reservationPaymentsRef.current?.triggerPaymentsValidation();

      if (!isPaymentsValid) {
        openIncompleteModal();
        return;
      }
    }
    setStatus('loading');

    const reservationError = await updateReservationAndGuestGroup(formData);
    if (!isMounted.current || reservationError) {
      return;
    }

    await queryClient.refetchQueries('reservations');
    await queryClient.refetchQueries('reservationSources');
    setStatus('success');
    resetTouchedSections();

    if (linkToGo) {
      history.push(linkToGo);
    }
  };

  return (
    <>
      <ContentWrapper>
        <FormProvider {...formMethods}>
          <Wrapper>
            <FormHeader
              clickToBack={() => goThroughConfirm('/bookings')}
              title={getName(extendedSelectedHousing)}
              action={
                <Button
                  disabled={isLoading}
                  onClick={() => goToGuest()}
                  label={
                    <ButtonLabelWrapper>
                      <ButtonLabelIcon src={plusIcon} alt="Plus" />
                      <ButtonLabelText>{t('register_guest')}</ButtonLabelText>
                    </ButtonLabelWrapper>
                  }
                />
              }
            />
            <div>
              <FirstFormSectionWrapper>
                <ReservationStatusSection
                  goToGuest={goToGuest}
                  reservation={reservation}
                  exemptions={exemptions}
                />
              </FirstFormSectionWrapper>
              <div>
                <GuestInfoSection
                  isEditing
                  goToGuestEdit={goToGuest}
                  disabled={isDisabled}
                  reservation={reservation}
                />
              </div>
              <ReservationPhotosSection guestGroup={guestGroup} />
              {Boolean(unlockLinks?.length) && (
                <ReservationRemoteAccessSection
                  reservation={reservation}
                  disabled={isDisabled}
                  isEditing
                  unlockLinks={unlockLinks!}
                />
              )}
              <ReservationOnlineCheckInSection
                ref={sendingSettingsRef}
                isEditing
                reservation={reservation}
                disabled={isDisabled}
                dispatch={sendingSettingsDispatch}
                state={sendingSettingsState}
              />
              <BookingsComunicationSections
                ref={sendingSettingsRef}
                isEditing
                reservation={reservation}
              />
              {hasTaxes &&
                !isReservationPaymentsActive &&
                reservation &&
                extendedSelectedHousing && (
                  <ReservationTaxesSection
                    hasTaxExemption={exemptions.taxExemption}
                    isMarkedAsPaid={isReservationMarkedAsPaid}
                    onMarkAsPaid={markReservationAsPaid}
                    housing={extendedSelectedHousing}
                    reservation={reservation}
                    guestGroup={guestGroup}
                  />
                )}
              {isReservationPaymentsActive && reservation && extendedSelectedHousing && (
                <EditReservationPayments
                  openDepositChargeModals={openDepositChargeModals}
                  exemptions={exemptions}
                  ref={reservationPaymentsRef}
                  setIsSectionTouched={setIsPaymentsSectionTouched}
                  reservation={reservation}
                  housing={extendedSelectedHousing}
                  refetchReservation={refetchReservation}
                  openTotalAmountModal={openTotalAmountModal}
                  disabled={isDisabled}
                />
              )}
              {isUpsellingPaymentsActive && (
                <ReservationUpsellingSection reservation={reservation!} />
              )}
              <ReservationInfoSection
                isEditing
                setIsSectionTouched={setIsInfoSectionTouched}
                reservation={reservation}
                disabled={isDisabled}
                onExtendedSelectedHousingChange={setExtendedSelectedHousing}
                reservationExtendedHousing={reservationExtendedHousing}
              />
            </div>
            {!isReservationDeleteModalOpen &&
              !isOnlineCheckinDisabled &&
              (isAnySectionTouched || !isIdle) && (
                <FloatingSaveButton
                  status={status}
                  onClick={formMethods.handleSubmit(onSubmit)}
                />
              )}
          </Wrapper>
        </FormProvider>
        {isDeleteBookingButtonShown && (
          <DeleteButtonWrapper>
            <Button
              danger
              onClick={openReservationDeleteModalOpen}
              disabled={isLoading}
              icon={<img src={rubbishIcon} alt="" height={16} width={10} />}
              label={t('delete_booking')}
            />
          </DeleteButtonWrapper>
        )}
      </ContentWrapper>
      <IncompleteFormDataModal
        open={isDataIncompleteModalOpen}
        onClose={closeDataIncompleteModal}
        text={t('you_cant_add_this_booking_until')}
      />
      <DeleteConfirmationModal
        title={isDeleted ? t('success') : isDeleting ? t('deleting') : t('are_you_sure')}
        text={
          isDeleted ? (
            t('successfully_deleted')
          ) : isDeleting ? (
            `${t('it_takes_seconds')}...`
          ) : (
            <Trans
              i18nKey="all_booking_info_will_be_deleted"
              values={{booking: getName(extendedSelectedHousing)}}
            >
              All the information associated to <b>Booking</b> will be deleted.
            </Trans>
          )
        }
        deleteButtonLabel={t('delete_booking')}
        onClose={closeReservationDeleteModal}
        onDelete={deleteReservation}
        isOpen={isReservationDeleteModalOpen}
        icon={deleteBookingIcon}
        areButtonsShown={isNotDeleting || isDeleteError}
      />
      {isDoYouWantToSaveModalOpen && (
        <YouHaveMadeChangesModal
          handleModalSave={() => handleModalSave(formMethods.handleSubmit(onSubmit))}
          handleModalDontSave={handleModalDontSave}
          handleModalCancel={handleModalCancel}
        />
      )}
      <Modal
        open={isTotalAmountModalOpen}
        onClose={closeTotalAmountModal}
        title={t('maximum_amount_exceeded')}
        text={t('total_amount_cant_be_more', {number: MAX_TOTAL_PAYMENT})}
        iconSrc={warningIcon}
        iconAlt="warning"
        iconProps={{
          height: 84,
          width: 84,
        }}
      >
        <ModalButton onClick={closeTotalAmountModal} label={t('confirm')} />
      </Modal>
      {isDepositChargeModalsOpen && (
        <DepositChargeModals
          open
          onClose={closeDepositChargeModals}
          reservation={reservation}
        />
      )}
    </>
  );
}

export {EditReservationSections};
