import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

type IdentityVerificationRequiredModalProps = {
  open: boolean;
  onClose: () => void;
};

function IdentityVerificationRequiredModal({onClose, open}: IdentityVerificationRequiredModalProps) {
  const {t} = useTranslation();
  const history = useHistory();

  const goToSuperHogLogin = () => {
    history.push(`/marketplace/property-protection/superhog`);
  };

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      title={t('identity_verification_required')}
      text={t('identity_verification_required_text')}
    >
      <ModalTwoButtonsWrapper>
        <ModalButton
          label={t('ok')}
          onClick={goToSuperHogLogin}
        />
        <ModalButton secondary label={t('go_back')} onClick={onClose} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

export {IdentityVerificationRequiredModal};
