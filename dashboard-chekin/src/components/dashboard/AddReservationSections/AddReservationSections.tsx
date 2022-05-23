import React from 'react';
import {FormProvider, useForm} from 'react-hook-form';
import {Trans, useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useQueryClient} from 'react-query';
import api from '../../../api';
import {
  useIsMounted,
  useModalControls,
  usePrevious,
  useStatus,
} from '../../../utils/hooks';
import {toastResponseError} from '../../../utils/common';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {
  buildReservationPayload,
  getHasBookingPayments,
  getHasSecurityDeposit,
  getHasTaxes,
} from '../../../utils/reservations';
import {useComputedDetails} from '../../../context/computedDetails';
import {DEFAULT_OCCUPIED_ROOMS_NUMBER} from '../../../utils/constants';
import warningIcon from '../../../assets/warning-icon.svg';
import {
  ExtendedHousing,
  FORM_NAMES as INFO_FORM_NAMES,
  FormTypes,
} from '../ReservationInfoSection/ReservationInfoSection';
import {useHousingExemptions} from '../../../hooks/useHousingExemptions';
import floppyDiskIcon from '../../../assets/floppy-disk.svg';
import addBookingIcon from '../../../assets/add-booking-icon.svg';
import FormHeader from '../FormHeader';
import ReservationOnlineCheckInSection from '../ReservationOnlineCheckInSection';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import Button from '../Button';
import ReservationInfoSection from '../ReservationInfoSection';
import IncompleteFormDataModal from '../IncompleteFormDataModal';
import {
  AddReservationPayments,
  AddReservationPaymentsRefType,
} from '../ReservationPayments';
import ModalButton from '../ModalButton';
import Modal from '../Modal';
import {
  ModalTwoButtonsWrapper,
  ContentWrapper,
  FirstFormSectionWrapper,
} from '../../../styled/common';
import {useSendingSettingsRef, reducer, initialState} from '../OnlineSendingSettings';
import {MAX_TOTAL_PAYMENT} from '../ReservationPayments/EditReservationPayments/EditReservationPayments';
import {
  BottomButtonWrapper,
  ButtonLabelIcon,
  ButtonLabelText,
  ButtonLabelWrapper,
  PropertyName,
} from './styled';

function AddReservationSections() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const isMounted = useIsMounted();
  const {isNeedToAskForSubscription} = useComputedDetails();
  const formMethods = useForm<FormTypes>({
    defaultValues: {
      [INFO_FORM_NAMES.occupied_rooms]: String(DEFAULT_OCCUPIED_ROOMS_NUMBER),
    },
    shouldUnregister: true,
  });
  const formState = formMethods.formState;
  const prevFormState = usePrevious<typeof formState>(formState);
  const {
    openModal: openDataIncompleteModal,
    closeModal: closeDataIncompleteModal,
    isOpen: isDataIncompleteModalOpen,
  } = useModalControls();
  const {
    openModal: openLoadingModal,
    closeModal: closeLoadingModal,
    isOpen: isLoadingModalOpen,
  } = useModalControls();
  const {
    closeModal: closeTotalAmountModal,
    isOpen: isTotalAmountModalOpen,
    openModal: openTotalAmountModal,
  } = useModalControls();
  const {isLoading, setStatus, isSuccess} = useStatus();
  const [loadingDetails, setLoadingDetails] = React.useState('');
  const [createdReservationId, setCreatedReservationId] = React.useState('');
  const [wasDataIncompleteModalOpened, setWasDataIncompleteModalOpened] = React.useState(
    false,
  );
  const [isInfoSectionTouched, setIsInfoSectionTouched] = React.useState(false);
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

  const isAnySectionTouched = isInfoSectionTouched || isOnlineCheckinTouched;

  const resetTouchedSections = () => {
    setIsInfoSectionTouched(false);
  };

  const handleInfoSectionTouched = React.useCallback((isTouched: boolean) => {
    setIsInfoSectionTouched(isTouched);
  }, []);

  const reservationName = extendedSelectedHousing?.name;
  const reservationLanguage = extendedSelectedHousing?.default_email_language;
  const sourceName = formMethods.watch(INFO_FORM_NAMES.source_name)?.value;

  const housingId = extendedSelectedHousing?.id;
  const {exemptions} = useHousingExemptions(sourceName, housingId);

  const isReservationPaymentsStatusActive = getHasBookingPayments({
    housing: extendedSelectedHousing,
    exemptions,
  });
  const hasTaxes = getHasTaxes({
    housing: extendedSelectedHousing,
    exemptions,
  });

  const isReservationContractsEnabled =
    extendedSelectedHousing && extendedSelectedHousing.is_contract_enabled;

  const isDepositEnabled = getHasSecurityDeposit({
    housing: extendedSelectedHousing,
    exemptions,
  });

  const isReservationPaymentsActive = Boolean(
    extendedSelectedHousing &&
      (isReservationPaymentsStatusActive ||
        hasTaxes ||
        isReservationContractsEnabled ||
        isDepositEnabled),
  );

  const reservationPaymentsRef = React.useRef<AddReservationPaymentsRefType>();

  const openIncompleteModal = React.useCallback(() => {
    if (!wasDataIncompleteModalOpened) {
      openDataIncompleteModal();
      setWasDataIncompleteModalOpened(true);
    }
  }, [openDataIncompleteModal, wasDataIncompleteModalOpened]);

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

  React.useEffect(
    function redirect() {
      if (isNeedToAskForSubscription) {
        history.push('/bookings');
      }
    },
    [history, isNeedToAskForSubscription],
  );

  const goToReservations = () => {
    history.push('/bookings');
  };

  const goToCreatedReservation = () => {
    history.push(`/bookings/${createdReservationId}`);
  };

  const handleResponseError = (error?: any) => {
    setLoadingDetails('');
    setStatus('error');
    toastResponseError(error);
    closeLoadingModal();
  };

  const createReservation = async (formData: FormTypes) => {
    const payload = {
      ...buildReservationPayload(formData),
      reservation_payments: reservationPaymentsRef.current?.getReservationPaymentsPayload(),
      ...reservationPaymentsRef.current?.getReservationDepositPayload(),
    };

    const {error, data} = await api.reservations.create(payload);

    if (data?.id) {
      setCreatedReservationId(data.id);
      await sendingSettingsRef.current?.submitOnlineCheckin({
        reservation: data.id,
      });
      // TODO: uncomment when TB-2502 will be ready
      // queryClient.setQueryData<LightReservation>(data.id, () => {
      //   return {
      //     ...data,
      //     guest_group_id: data?.guest_group?.id,
      //     housing_id: data?.housing?.id,
      //   };
      // });
    }

    if (isMounted.current && error) {
      handleResponseError(error);
    }
    return error;
  };

  const {
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
  } = useConfirmLeaveModal(isAnySectionTouched);

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

    openLoadingModal();

    setLoadingDetails(`${t('updating_property')}...`);

    setLoadingDetails(`${t('creating')}...`);

    const reservationError = await createReservation(formData);

    if (!isMounted.current || reservationError) {
      return;
    }

    await queryClient.refetchQueries('reservations');
    setStatus('success');
    resetTouchedSections();
  };

  return (
    <>
      <ContentWrapper>
        <FormHeader
          clickToBack={() => goThroughConfirm('/bookings')}
          title={reservationName || t('new_booking')}
          action={
            <Button
              onClick={formMethods.handleSubmit(onSubmit)}
              disabled={isOnlineCheckinDisabled}
              label={
                <ButtonLabelWrapper>
                  <ButtonLabelIcon src={floppyDiskIcon} alt="Plus" />
                  <ButtonLabelText>{t('save_booking')}</ButtonLabelText>
                </ButtonLabelWrapper>
              }
            />
          }
        />
        <FormProvider {...formMethods}>
          <FirstFormSectionWrapper>
            <ReservationInfoSection
              disabled={isLoading}
              setIsSectionTouched={handleInfoSectionTouched}
              onExtendedSelectedHousingChange={setExtendedSelectedHousing}
            />
          </FirstFormSectionWrapper>
          {extendedSelectedHousing && (
            <ReservationOnlineCheckInSection
              ref={sendingSettingsRef}
              disabled={isLoading}
              defaultLanguage={reservationLanguage}
              extendedSelectedHousing={extendedSelectedHousing}
              dispatch={sendingSettingsDispatch}
              state={sendingSettingsState}
            />
          )}
        </FormProvider>

        {isReservationPaymentsActive && extendedSelectedHousing && (
          <AddReservationPayments
            ref={reservationPaymentsRef}
            exemptions={exemptions}
            housing={extendedSelectedHousing}
            disabled={isLoading}
          />
        )}
        <BottomButtonWrapper>
          <Button
            onClick={formMethods.handleSubmit(onSubmit)}
            disabled={isOnlineCheckinDisabled}
            label={
              <ButtonLabelWrapper>
                <ButtonLabelIcon src={floppyDiskIcon} alt="Plus" />
                <ButtonLabelText>{t('save_booking')}</ButtonLabelText>
              </ButtonLabelWrapper>
            }
          />
        </BottomButtonWrapper>
      </ContentWrapper>
      <IncompleteFormDataModal
        open={isDataIncompleteModalOpen}
        onClose={closeDataIncompleteModal}
        text={t('you_cant_add_this_booking_until')}
      />
      {isLoadingModalOpen && (
        <Modal
          open
          iconSrc={addBookingIcon}
          iconAlt="Guest group"
          iconProps={{
            height: 86,
            width: 89,
          }}
          title={isLoading ? t('creating_booking') : t('booking_created')}
          text={
            isLoading ? (
              <div>{loadingDetails}</div>
            ) : (
              <Trans values={{name: reservationName}} i18nKey="your_booking_name_added">
                Your booking <PropertyName>Name</PropertyName> has been added
                successfully!
              </Trans>
            )
          }
        >
          {isSuccess && (
            <ModalTwoButtonsWrapper>
              <ModalButton
                label={t('view_my_booking')}
                onClick={goToCreatedReservation}
              />
              <ModalButton
                secondary
                label={t('go_to_bookings')}
                onClick={goToReservations}
              />
            </ModalTwoButtonsWrapper>
          )}
        </Modal>
      )}
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
    </>
  );
}

export {AddReservationSections};
