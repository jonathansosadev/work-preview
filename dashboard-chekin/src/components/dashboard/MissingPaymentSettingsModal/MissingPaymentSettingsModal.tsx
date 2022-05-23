import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import depositIcon from 'assets/deposit-icon.svg';
import {ACCOUNT_PAGE_VISITED_LOCAL_STORAGE_KEY} from '../AccountPayments';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

type MissingPaymentSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

function MissingPaymentSettingsModal({onClose, open}: MissingPaymentSettingsModalProps) {
  const {t} = useTranslation();
  const history = useHistory();

  const goToPaymentSettingsAndOpenSetupModal = () => {
    localStorage.removeItem(ACCOUNT_PAGE_VISITED_LOCAL_STORAGE_KEY);
    history.push('/account/payment-settings');
  };

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      title={t('setup_required')}
      text={t('you_have_to_set_up_payments')}
      iconProps={{
        src: depositIcon,
        height: 84,
        width: 84,
      }}
    >
      <ModalTwoButtonsWrapper>
        <ModalButton
          label={t('setup_payments')}
          onClick={goToPaymentSettingsAndOpenSetupModal}
        />
        <ModalButton secondary label={t('cancel')} onClick={onClose} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

export {MissingPaymentSettingsModal};
