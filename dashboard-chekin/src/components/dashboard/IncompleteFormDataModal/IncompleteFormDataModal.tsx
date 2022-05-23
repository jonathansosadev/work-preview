import React from 'react';
import {useTranslation} from 'react-i18next';
import missingDataIcon from '../../../assets/icon-data-missing.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {ModalButtonWrapper} from './styled';

type IncompleteFormDataModalProps = {
  open: boolean;
  onClose: () => void;
  text: string;
};

function IncompleteFormDataModal({open, onClose, text}: IncompleteFormDataModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      closeOnEscape
      closeOnDocumentClick
      open={open}
      onClose={onClose}
      iconSrc={missingDataIcon}
      iconProps={{
        height: 84,
        width: 84,
        src: missingDataIcon,
        alt: '',
      }}
      title={t('data_missing')}
      text={
        <>
          {text}
          <p />
          {t('we_have_outlined_fields')}
        </>
      }
    >
      <ModalButtonWrapper>
        <ModalButton label={t('ok')} onClick={onClose} />
      </ModalButtonWrapper>
    </Modal>
  );
}

export {IncompleteFormDataModal};
