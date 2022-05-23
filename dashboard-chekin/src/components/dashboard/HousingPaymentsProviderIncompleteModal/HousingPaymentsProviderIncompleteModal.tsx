import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import paymentIcon from 'assets/payment-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {ACCOUNT_LINKS} from '../AccountSections';

type HousingPaymentsProviderIncompleteModalProps = {
  open: boolean;
  onClose: () => void;
};

function HousingPaymentsProviderIncompleteModal({
  open,
  onClose,
}: HousingPaymentsProviderIncompleteModalProps) {
  const {t} = useTranslation();
  const history = useHistory();

  const goToPaymentSettings = () => {
    history.push(ACCOUNT_LINKS.paymentSettings);
  };

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      title={t('payment_provider_incomplete')}
      text={t('housing_payments_provider_incomplete_text')}
      iconProps={{
        src: paymentIcon,
        alt: '',
        height: 84,
        width: 84,
      }}
    >
      <ModalTwoButtonsWrapper>
        <ModalButton label={t('complete_setup')} onClick={goToPaymentSettings} />
        <ModalButton secondary label={t('close')} onClick={onClose} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

export {HousingPaymentsProviderIncompleteModal};
