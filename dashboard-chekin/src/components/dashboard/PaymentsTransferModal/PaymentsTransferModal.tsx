import React from 'react';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';
import api from '../../../api';
import {useIsMounted, useModalControls, useStatus} from '../../../utils/hooks';
import {PaymentsSettings, User} from '../../../utils/types';
import {toastResponseError} from '../../../utils/common';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import xIcon from '../../../assets/x_blue.svg';
import checkIcon from '../../../assets/check-filled.svg';
import transferIcon2x from '../../../assets/bank-transfer-icon@2x.png';
import transferIcon from '../../../assets/bank-transfer-icon.png';
import Modal from '../Modal';
import Button from '../Button';
import Loader from '../../common/Loader';
import ModalButton from '../ModalButton';
import {InputController} from '../Input';
import {
  Content,
  Subtitle,
  Title,
  ButtonsWrapper,
  CloseButton,
  Balance,
  BalanceLabel,
  Currency,
  Main,
  SuccessText,
  TransferIcon,
  SuccessTitle,
  LoaderWrapper,
} from './styled';
import {useQueryClient} from 'react-query';
import {useUser} from '../../../context/user';
import {usePaymentSettings} from '../../../hooks/usePaymentSettings';

const MIN_AMOUNT = 0.01;
const DEFAULT_BALANCE = 0;

enum FORM_NAMES {
  amount = 'amount',
}

type FormTypes = {
  [FORM_NAMES.amount]: string;
};

function getBalance(user?: User | null) {
  return user?.balance || DEFAULT_BALANCE;
}

type PaymentsTransferModalProps = {
  onClose: () => void;
  paymentSettings: PaymentsSettings;
  open?: boolean;
};

const defaultProps: Partial<PaymentsTransferModalProps> = {
  open: false,
};

function PaymentsTransferModal({
  open,
  onClose,
  paymentSettings,
}: PaymentsTransferModalProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const user = useUser();
  const isMounted = useIsMounted();
  const ws = useWebsocket();
  const {isLoading, setStatus} = useStatus();
  const {
    handleSubmit,
    register,
    control,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const [transferredAmount, setTransferredAmount] = React.useState(String(MIN_AMOUNT));
  const {
    isOpen: isSuccessTransferModalOpen,
    openModal: openSuccessTransferModal,
    closeModal: closeSuccessTransferModal,
  } = useModalControls();
  const {paymentSettingsCurrencyLabel} = usePaymentSettings();

  const balance = getBalance(user);

  React.useEffect(() => {
    if (ws?.message.event_type === WS_EVENT_TYPES.writeOffCompleted) {
      setStatus('idle');
      openSuccessTransferModal();
      queryClient.refetchQueries('paymentsMovementsPreview');
      queryClient.refetchQueries('paymentsFullMovements');
    }

    if (ws?.message.event_type === WS_EVENT_TYPES.writeOffFailed) {
      toastResponseError(ws?.message?.status_details);
      setStatus('idle');
    }

    return ws.clearMessage;
  }, [openSuccessTransferModal, setStatus, ws, queryClient]);

  const handleClose = () => {
    setTransferredAmount(String(MIN_AMOUNT));
    if (isSuccessTransferModalOpen) {
      closeSuccessTransferModal();
    }

    onClose();
  };

  const getWriteOffPayload = (amount: string) => {
    return {
      amount,
      payments_settings_id: paymentSettings?.id,
    };
  };

  const writeOffAmount = async (amount: string) => {
    setStatus('loading');

    const payload = getWriteOffPayload(amount);
    const result = await api.writeOffs.post(payload);

    if (!isMounted.current) {
      return;
    }

    if (result.error) {
      toastResponseError(result.error);
      setStatus('idle');
      return;
    }

    // Waiting for WS event...
  };

  const onSubmit = async (formData: FormTypes) => {
    const transferAmount = formData[FORM_NAMES.amount];
    setTransferredAmount(transferAmount);

    await writeOffAmount(transferAmount);
  };

  if (open && isSuccessTransferModalOpen) {
    return (
      <SuccessTransferModal
        open
        transferredAmount={transferredAmount}
        onClose={handleClose}
      />
    );
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Content>
        <CloseButton type="button" onClick={handleClose}>
          <img src={xIcon} alt="Cross" />
        </CloseButton>
        <Title>{t('transfer_to_your_bank')}</Title>
        <Subtitle>{t('enter_the_amount_to_transfer')}</Subtitle>
        <Main>
          <BalanceLabel>{t('your_balance')}</BalanceLabel>
          <Balance>
            {balance.toFixed(2)} <Currency>{paymentSettingsCurrencyLabel}</Currency>
          </Balance>
          <InputController
            {...register(FORM_NAMES.amount, {
              required: t('required') as string,
              min: {
                value: MIN_AMOUNT,
                message: t('min_number_is', {number: MIN_AMOUNT}),
              },
              max: {
                value: balance || MIN_AMOUNT,
                message: t('max_number_is', {
                  number: balance || MIN_AMOUNT,
                }),
              },
            })}
            control={control}
            disabled={isLoading}
            placeholder={t('enter_amount')}
            error={errors[FORM_NAMES.amount]?.message}
            label={t('amount_to_transfer')}
            inputMode="decimal"
            type="number"
          />
        </Main>
        {isLoading ? (
          <LoaderWrapper>
            <Loader height={35} width={35} label={t('loading')} />
          </LoaderWrapper>
        ) : (
          <ButtonsWrapper>
            <Button
              label={t('confirm_transfer').toUpperCase()}
              onClick={handleSubmit(onSubmit)}
            />
            <ModalButton secondary label={t('back').toUpperCase()} onClick={onClose} />
          </ButtonsWrapper>
        )}
      </Content>
    </Modal>
  );
}

type SuccessTransferModalProps = {
  onClose: () => void;
  open?: boolean;
  transferredAmount?: string;
};

const transferModalDefaultProps: Partial<SuccessTransferModalProps> = {
  open: false,
  transferredAmount: '0.00',
};

function SuccessTransferModal({
  onClose,
  open,
  transferredAmount,
}: SuccessTransferModalProps) {
  const {t} = useTranslation();
  return (
    <Modal open={open} onClose={onClose}>
      <Content>
        <TransferIcon
          src={transferIcon2x}
          srcSet={`${transferIcon} 1x, ${transferIcon2x} 2x`}
        />
        <SuccessTitle>
          <img src={checkIcon} alt="Check" /> {t('your_transfer_has_been_made')}
        </SuccessTitle>
        <SuccessText>
          {t('amount_has_been_transferred', {amount: transferredAmount})}
        </SuccessText>
        <ButtonsWrapper>
          <Button label={t('ok').toUpperCase()} onClick={onClose} />
        </ButtonsWrapper>
      </Content>
    </Modal>
  );
}

SuccessTransferModal.defaultProps = transferModalDefaultProps;
PaymentsTransferModal.defaultProps = defaultProps;
export {PaymentsTransferModal};
