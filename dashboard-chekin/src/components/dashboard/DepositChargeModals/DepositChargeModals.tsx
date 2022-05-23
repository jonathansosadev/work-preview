import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useForm} from 'react-hook-form';
import {useQueryClient} from 'react-query';
import {FieldWrapper, ModalTwoButtonsWrapper} from '../../../styled/common';
import {LightReservation} from '../../../utils/types';
import {useErrorToast, useStatus, useSuccessModal} from '../../../utils/hooks';
import {toastResponseError} from '../../../utils/common';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import api from '../../../api';
import depositIcon from '../../../assets/deposit-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {InputController} from '../Input';
import {Form, Amount} from './styled';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';

const MIN_AMOUNT = 0;
const RESERVATION_SECURITY_DEPOSIT = 'RESERVATION_SECURITY_DEPOSIT';

enum FORM_NAMES {
  amount = 'amount',
  concept = 'description',
}

type FormTypes = {
  [FORM_NAMES.amount]: string;
  [FORM_NAMES.concept]: string;
};

type DepositChargeModalProps = {
  open: boolean;
  onClose: () => void;
  reservation?: LightReservation;
};

function DepositChargeModals({open, onClose, reservation}: DepositChargeModalProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {isLoading, setStatus} = useStatus();
  const {
    SuccessModal,
    closeSuccessModal,
    isSuccessModalOpen,
    openSuccessModal,
  } = useSuccessModal();
  const ws = useWebsocket();
  const [chargedAmount, setChargedAmount] = React.useState('');
  const depositAmount = Number(reservation?.security_deposit?.amount || MIN_AMOUNT);

  const {
    data: paymentsSettings,
    error: paymentsSettingsError,
    status: paymentsSettingsStatus,
    paymentSettingsCurrencyLabel,
  } = usePaymentSettings();
  useErrorToast(paymentsSettingsError, {notFoundMessage: 'Payments settings not found.'});

  React.useEffect(() => {
    function handlePaymentError(error: any) {
      setStatus('idle');
      toastResponseError(error);
    }

    if (ws.message?.event_type === WS_EVENT_TYPES.guestPaymentCompleted) {
      setStatus('idle');
      openSuccessModal();
      queryClient.refetchQueries(reservation?.id!);
    }

    if (ws.message?.event_type === WS_EVENT_TYPES.guestPaymentFailed) {
      handlePaymentError(ws.message?.status_details);
    }

    return ws.clearMessage;
  }, [onClose, openSuccessModal, reservation, setStatus, ws, queryClient]);

  const closeAllModals = () => {
    setChargedAmount('');
    closeSuccessModal();
    onClose();
  };

  const getChargePayload = (formData: FormTypes) => {
    return {
      ...formData,
      type: RESERVATION_SECURITY_DEPOSIT,
      reservation_id: reservation?.id,
      security_deposit_id: reservation?.security_deposit?.id,
      payments_settings_id: paymentsSettings?.id,
    };
  };

  const onSubmit = async (formData: FormTypes) => {
    setStatus('loading');

    const payload = getChargePayload(formData);
    const {error} = await api.guestPayments.post(payload);

    if (error) {
      setStatus('idle');
      toastResponseError(error);
      return;
    }

    setChargedAmount(formData[FORM_NAMES.amount]);
    // Waiting for WS event...
  };

  if (isSuccessModalOpen) {
    return (
      <SuccessModal
        title={t('deposit_charged')}
        message={
          <Trans
            i18nKey="amount_has_been_charged"
            values={{amount: `${chargedAmount} ${paymentSettingsCurrencyLabel}`}}
          >
            The amount of <b>0 {{paymentSettingsCurrencyLabel}}</b> has been successfully
            charged. Please check your payments settings to see all the transactions.
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
      title={t('deposit_charge')}
      iconSrc={depositIcon}
      iconAlt="Card holder"
      iconProps={{width: 84, height: 84}}
    >
      <Form>
        <Amount>
          {t('total')}:{' '}
          <b>
            {depositAmount.toFixed(2)} {paymentSettingsCurrencyLabel}
          </b>
        </Amount>
        <FieldWrapper>
          <InputController
            {...register(FORM_NAMES.amount, {
              required: t('required') as string,
              min: {
                value: MIN_AMOUNT,
                message: t('min_number_is', {number: MIN_AMOUNT}),
              },
              max: {
                value: depositAmount,
                message: t('max_number_is', {number: depositAmount}),
              },
            })}
            control={control}
            label={t('amount_to_be_charged')}
            placeholder={t('enter_amount')}
            error={errors[FORM_NAMES.amount]?.message}
            disabled={isLoading}
            type="number"
            inputMode="decimal"
            step="0.01"
          />
        </FieldWrapper>
        <FieldWrapper>
          <InputController
            {...register(FORM_NAMES.concept, {
              required: t('required') as string,
            })}
            control={control}
            label={t('concept')}
            error={errors[FORM_NAMES.concept]?.message}
            disabled={isLoading}
            placeholder={t('enter_concept')}
          />
        </FieldWrapper>
        <ModalTwoButtonsWrapper>
          <ModalButton
            type="submit"
            label={t('proceed')}
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || paymentsSettingsStatus === 'loading'}
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

export {DepositChargeModals};
