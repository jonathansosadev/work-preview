import React from 'react';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {useTranslation} from 'react-i18next';
import floppyRoundIcon from '../../../assets/floppy-round.svg';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

type YouHaveMadeChangesModalProps = {
  handleModalSave: () => void;
  handleModalDontSave: () => void;
  handleModalCancel: () => void;
};

const defaultProps: YouHaveMadeChangesModalProps = {
  handleModalSave: () => {},
  handleModalDontSave: () => {},
  handleModalCancel: () => {},
};

function YouHaveMadeChangesModal({
  handleModalSave,
  handleModalDontSave,
  handleModalCancel,
}: YouHaveMadeChangesModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      open
      withCloseButton
      closeOnDocumentClick
      closeOnEscape
      onClose={handleModalCancel}
      iconProps={{
        width: 84,
        height: 84,
        src: floppyRoundIcon,
        alt: '',
      }}
      title={t('you_have_made_changes')}
      text={t('would_you_like_to_save_them')}
    >
      <ModalTwoButtonsWrapper>
        <ModalButton onClick={handleModalSave} label={t('save')} />
        <ModalButton secondary onClick={handleModalDontSave} label={t('dont_save')} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

YouHaveMadeChangesModal.defaultProps = defaultProps;
export {YouHaveMadeChangesModal};
