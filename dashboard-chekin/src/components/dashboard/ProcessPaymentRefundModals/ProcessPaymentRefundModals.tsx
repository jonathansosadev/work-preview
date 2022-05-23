import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useForm} from 'react-hook-form';
import {useQueryClient} from 'react-query';
import {FieldWrapper, ModalTwoButtonsWrapper} from '../../../styled/common';
import {LightReservation} from '../../../utils/types';
import {useStatus, useSuccessModal} from '../../../utils/hooks';
import {toastResponseError} from '../../../utils/common';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import api from '../../../api';
import depositIcon from '../../../assets/deposit-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {InputController} from '../Input';
import {Form} from './styled';

const MIN_AMOUNT = 0;

enum FORM_NAMES {
  requested_amount = 'requested_amount',
}

type FormTypes = {
  [FORM_NAMES.requested_amount]: string;
};

type ProcessPaymentRefundModalProps = {
  open: boolean;
  onClose: () => void;
  reservation?: LightReservation;
};

function ProcessPaymentRefundModals({
  open,
  onClose,
  reservation,
}: ProcessPaymentRefundModalProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {register,control, handleSubmit, formState: {errors}} = useForm<FormTypes>();
  const {isLoading, setStatus} = useStatus();
  const {
    SuccessModal,
    closeSuccessModal,
    isSuccessModalOpen,
    openSuccessModal,
  } = useSuccessModal();
  const ws = useWebsocket();
  const [chargedAmount, setChargedAmount] = React.useState('');

  React.useEffect(() => {
    function handlePaymentError(error: any) {
      setStatus('idle');
      toastResponseError(error);
    }

    if (
      ws.message?.event_type === WS_EVENT_TYPES.paymentRefundCompleted ||
      ws.message?.event_type === WS_EVENT_TYPES.paymentRefundPartially
    ) {
      setStatus('idle');
      openSuccessModal();
      queryClient.refetchQueries(reservation?.id!);
    }

    if (ws.message?.event_type === WS_EVENT_TYPES.paymentRefundRejected) {
      handlePaymentError(ws.message?.status_details);
    }

    return ws.clearMessage;
  }, [onClose, openSuccessModal, queryClient, reservation, setStatus, ws]);

  const closeAllModals = () => {
    setChargedAmount('');
    closeSuccessModal();
    onClose();
  };

  const getChargePayload = (formData: FormTypes) => {
    return {
      ...formData,
      reservation_id: reservation?.id,
    };
  };

  const onSubmit = async (formData: FormTypes) => {
    setStatus('loading');

    const payload = getChargePayload(formData);
    const {error} = await api.paymentRefunds.post(payload);

    if (error) {
      setStatus('idle');
      toastResponseError(error);
      return;
    }

    setChargedAmount(formData[FORM_NAMES.requested_amount]);
    // Waiting for WS event...
  };

  if (isSuccessModalOpen) {
    return (
      <SuccessModal
        title={t('money_refunded')}
        message={
          <Trans i18nKey="amount_has_been_refunded" values={{amount: chargedAmount}}>
            The amount of <b>0€</b> has been successfully refunded. Please check your
            payments settings to see all the transactions.
          </Trans>
        }
        onClose={closeAllModals}
      />
    );
  }

  return (
    <Modal
      closeOnDocumentClick={!isLoading}
      closeOnEscape={!isLoading}
      open={open}
      onClose={onClose}
      title={t('payment_refund')}
      iconSrc={depositIcon}
      iconAlt="Card holder"
      iconProps={{width: 84, height: 84}}
    >
      <Form>
        <FieldWrapper>
          <InputController
            {...register(FORM_NAMES.requested_amount, {
              required: t('required') as string,
              min: {
                value: MIN_AMOUNT,
                message: t('min_number_is', {number: MIN_AMOUNT}),
              },
            })}
            control={control}
            label={t('enter_amount_to_be_refunded')}
            placeholder={t('enter_amount')}
            error={errors[FORM_NAMES.requested_amount]?.message}
            disabled={isLoading}
            type="number"
            inputMode="decimal"
            step="0.01"
          />
        </FieldWrapper>
        <ModalTwoButtonsWrapper>
          <ModalButton
            type="submit"
            label={t('proceed')}
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
          />
          <ModalButton
            disabled={isLoading}
            secondary
            label={t('cancel')}
            onClick={onClose}
          />
        </ModalTwoButtonsWrapper>
      </Form>
    </Modal>
  );
}

export {ProcessPaymentRefundModals};
