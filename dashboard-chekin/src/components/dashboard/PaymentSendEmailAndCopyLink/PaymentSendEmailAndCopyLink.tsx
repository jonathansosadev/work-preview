import React from 'react';
import {useTranslation} from 'react-i18next';
import {useMutation} from 'react-query';
import api from '../../../api';
import {useIsMounted, useModalControls} from '../../../utils/hooks';
import {ExtendedHousing} from '../ReservationInfoSection';
import {LightReservation} from '../../../utils/types';
import {toastResponseError} from '../../../utils/common';
import {getHasSecurityDepositInProcess} from '../../../utils/reservations';
import {SECURITY_DEPOSIT_STATUSES} from '../../../utils/constants';
import warningIcon from '../../../assets/warning-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {CopyLinkBtn, PaymentLinkTitle, PaymentSubtitle, SendEmailBtn} from './styled';

type PaymentSendEmailAndCopyLinkProps = {
  hasTaxExemption: boolean;
  housing: ExtendedHousing;
  reservation: LightReservation;
  disabled?: boolean;
};

const PaymentSendEmailAndCopyLink = ({
  housing,
  disabled,
  reservation,
  hasTaxExemption,
}: PaymentSendEmailAndCopyLinkProps) => {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {
    closeModal: closeEmailMissingModal,
    isOpen: isEmailMissingModalOpen,
    openModal: openEmailMissingModal,
  } = useModalControls();

  const hasTaxes = Boolean(!hasTaxExemption && housing?.seasons?.length);
  const hasSecurityDeposit =
    housing.security_deposit_status !== SECURITY_DEPOSIT_STATUSES.inactive;
  const hasSecurityDepositInProcess = getHasSecurityDepositInProcess(reservation);

  const isOnlineCheckinEmail = Boolean(reservation?.default_invite_email);

  const sendPaymentsEmailMutation = useMutation(
    () => api.reservations.sendPaymentsRequestEmail(reservation.id),
    {
      onError: (error) => {
        if (error && isMounted.current) {
          toastResponseError(error);
        }
      },
    },
  );

  const handleEmailMissingModal = () => {
    if (!isOnlineCheckinEmail) {
      openEmailMissingModal();
      return;
    }
    if (reservation) {
      sendPaymentsEmailMutation.mutate();
    }
  };

  const amountDueFromBackend = reservation.due_amount_to_pay;
  const isLinkOrEmailBtnDisabled = !(
    Boolean(parseFloat(amountDueFromBackend.toString())) ||
    (hasTaxes && !reservation?.have_taxes_been_paid) ||
    (hasSecurityDeposit && !hasSecurityDepositInProcess)
  );

  const isDisabled = disabled || isLinkOrEmailBtnDisabled;

  return (
    <div>
      <PaymentLinkTitle>{t('payment_link')}:</PaymentLinkTitle>
      <PaymentSubtitle>{t('payment_link_description')}</PaymentSubtitle>
      <CopyLinkBtn link={reservation?.payment_link} isDisabled={isDisabled} />
      <SendEmailBtn
        sendEmail={handleEmailMissingModal}
        status={sendPaymentsEmailMutation.status}
        label={t('send_payment_email')}
        disabled={isDisabled}
      />
      <Modal
        open={isEmailMissingModalOpen}
        onClose={closeEmailMissingModal}
        title={t('email_missing')}
        text={t('email_missing_popup_text')}
        iconSrc={warningIcon}
        iconAlt="warning"
        iconProps={{
          height: 84,
          width: 84,
        }}
      >
        <ModalButton onClick={closeEmailMissingModal} label={t('confirm')} />
      </Modal>
    </div>
  );
};

export {PaymentSendEmailAndCopyLink};
