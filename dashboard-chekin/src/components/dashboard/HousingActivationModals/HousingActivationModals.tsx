import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useQuery, useQueryClient} from 'react-query';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
  useSuccessModal,
} from '../../../utils/hooks';
import {useSubscription} from '../../../context/subscription';
import api from '../../../api';
import disabledPropertyIcon from '../../../assets/icon-property-disabled.svg';
import propertyIcon from '../../../assets/icon-property.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {Plan} from '../../../utils/types';
import {
  SUBSCRIPTION_INTERVALS,
  SUBSCRIPTION_PRODUCT_TYPES,
} from '../../../utils/constants';
import {useComputedDetails} from '../../../context/computedDetails';
import {ModalButtonsWrapper, ModalThreeButtonsWrapper} from './styled';
import {useUser} from '../../../context/user';

type DeactivatePropertyModalProps = {
  onClose: () => void;
  open: boolean;
  housingId: string;
  isHousingDeactivated: boolean;
  setIsHousingDeactivated: React.Dispatch<React.SetStateAction<boolean>>;
};

function HousingActivationModals({
  onClose,
  open,
  isHousingDeactivated,
  setIsHousingDeactivated,
  housingId,
}: DeactivatePropertyModalProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const {isLoading, setStatus} = useStatus();
  const {ErrorModal, displayError} = useErrorModal();
  const {isHotelSubscription} = useSubscription();
  const {displaySuccess, SuccessModal, closeSuccessModal} = useSuccessModal();
  const {currency, currencyLabel} = useComputedDetails();

  const user = useUser();
  const {
    isOpen: isPreActivationModalOpen,
    openModal: openPreActivationModal,
    closeModal: closePreActivationModal,
  } = useModalControls();
  const {
    isOpen: isPreDeActivationModalOpen,
    openModal: openPreDeactivationModal,
    closeModal: closePreDeactivationModal,
  } = useModalControls();

  const subscriptionType = user?.subscription_type;
  const {data: documentStoragePlan, status: documentStoragePlanStatus, error} = useQuery<
    Plan,
    any
  >(
    SUBSCRIPTION_PRODUCT_TYPES.documentStore,
    () => {
      const params = `interval=${SUBSCRIPTION_INTERVALS.month}&type=${subscriptionType}&currency=${currency}&product=${SUBSCRIPTION_PRODUCT_TYPES.documentStore}`;

      return api.payments.fetchPlan(params);
    },
    {
      enabled: Boolean(subscriptionType),
    },
  );
  useErrorToast(error);

  React.useLayoutEffect(() => {
    if (isHousingDeactivated && !open) {
      openPreActivationModal();
    }
  }, [isHousingDeactivated, open, openPreActivationModal]);

  const toggleHousingActivation = async ({saveInDB = false}) => {
    const nextStatus = !isHousingDeactivated;
    const payload = {
      with_save: saveInDB,
    };
    let eventToSend = nextStatus ? 'deactivate' : 'activate';
    setStatus('loading');
    const {data, error} = await api.housings.toggleActiveStateById(
      housingId,
      eventToSend,
      payload,
    );

    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('idle');
      displayError(error);
    }

    if (data) {
      await queryClient.refetchQueries('housings');
      setIsHousingDeactivated(nextStatus);
      closePreDeactivationModal();
      setStatus('idle');

      const isHousingDeactivated = nextStatus === true;
      displaySuccess(
        t(`your_property_has_been_${isHousingDeactivated ? 'deactivated' : 'activated'}`),
      );
    }
  };

  const handleActivation = () => {
    if (!isHousingDeactivated) {
      openPreDeactivationModal();
      return;
    }

    toggleHousingActivation({saveInDB: false});
  };

  const handleSuccessModalClose = () => {
    onClose();
    closeSuccessModal();
  };

  if (!open) {
    return null;
  }

  const getDocumentsStoragePrice = () => {
    if (documentStoragePlanStatus === 'loading') {
      return 'loading...';
    }

    const price = documentStoragePlan
      ? (documentStoragePlan.amount_with_tax / 100).toFixed(2)
      : 'ERROR';
    const priceWithLabel = `${price} ${currencyLabel}`;

    if (isHotelSubscription) {
      return t('price_month_per_room', {price: priceWithLabel});
    }

    return t('price_per_month', {price: priceWithLabel});
  };

  return (
    <>
      <Modal
        open={!isPreDeActivationModalOpen && !isPreActivationModalOpen && open}
        title={
          isHousingDeactivated
            ? t('confirm_activation')
            : t('deactivate_property_question')
        }
        text={
          isHousingDeactivated ? (
            <Trans i18nKey="activate_property_description">
              Activating the property will update your subscription and create an invoice
              for the proportional part for the current billing period.
              <p />
              Continue with the activation?
            </Trans>
          ) : (
            <Trans i18nKey="deactivate_property_description">
              Deactivating the property will make the reservations and its features
              inaccessible, including sending data to authorities for pending
              registrations. s<p /> Are you sure you want to deactivate it?
            </Trans>
          )
        }
        iconSrc={isHousingDeactivated ? propertyIcon : disabledPropertyIcon}
        iconAlt=""
        iconProps={
          isHousingDeactivated
            ? {
                width: 84,
                height: 84,
              }
            : {
                width: 97,
                height: 88,
              }
        }
      >
        <ModalButtonsWrapper>
          <ModalButton
            disabled={isLoading}
            label={isHousingDeactivated ? t('yes_activate') : t('yes_deactivate')}
            onClick={handleActivation}
          />
          <ModalButton
            secondary
            disabled={isLoading}
            label={isHousingDeactivated ? t('no') : t('cancel')}
            onClick={onClose}
          />
        </ModalButtonsWrapper>
      </Modal>
      <Modal
        open={isPreActivationModalOpen}
        title={t('property_deactivated')}
        text={
          <Trans i18nKey="preactivate_property_description">
            You can’t access to its data and features. Additionally, no more information
            is sent to the police including pending registrations. <p /> Would you like to
            reactivate it?
          </Trans>
        }
        iconSrc={disabledPropertyIcon}
        iconAlt=""
        iconProps={{
          width: 97,
          height: 88,
        }}
      >
        <ModalButtonsWrapper>
          <ModalButton
            disabled={isLoading}
            label={t('yes_activate')}
            onClick={closePreActivationModal}
          />
          <ModalButton secondary disabled={isLoading} label={t('no')} onClick={onClose} />
        </ModalButtonsWrapper>
      </Modal>
      <Modal
        open={isPreDeActivationModalOpen}
        title={t('keep_documents_in_storage_title')}
        text={
          <Trans
            i18nKey="keep_documents_in_storage_description"
            values={{price: getDocumentsStoragePrice()}}
          >
            This will allow you to keep your documents for this property at the cost of{' '}
            <b>{{price: getDocumentsStoragePrice()}}</b>. Otherwise, documents will be
            deleted from your account.
          </Trans>
        }
        iconSrc={propertyIcon}
        iconAlt=""
        iconProps={{
          width: 84,
          height: 84,
        }}
      >
        <ModalThreeButtonsWrapper>
          <ModalButton
            disabled={isLoading}
            label={t('yes_keep_documents')}
            onClick={() => toggleHousingActivation({saveInDB: true})}
          />
          <ModalButton
            danger
            disabled={isLoading}
            label={t('no_delete_documents')}
            onClick={() => toggleHousingActivation({saveInDB: false})}
          />
          <ModalButton
            secondary
            disabled={isLoading}
            label={t('back')}
            onClick={closePreDeactivationModal}
          />
        </ModalThreeButtonsWrapper>
      </Modal>
      <ErrorModal />
      <SuccessModal onClose={handleSuccessModalClose} />
    </>
  );
}

export {HousingActivationModals};
