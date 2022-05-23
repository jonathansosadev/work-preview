import React from 'react';
import {useTranslation} from 'react-i18next';
import warningIcon from '../../../assets/warning-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
  text: string | React.ReactElement;
  icon?: string;
  deleteButtonLabel?: string | React.ReactElement;
  areButtonsShown?: boolean;
};

function DeleteConfirmationModal({
  isOpen,
  icon,
  onClose,
  title,
  text,
  onDelete,
  deleteButtonLabel,
  areButtonsShown,
}: DeleteConfirmationModalProps) {
  const {t} = useTranslation();

  const modalActions = (
    <ModalTwoButtonsWrapper>
      <ModalButton danger onClick={onDelete} label={deleteButtonLabel || t('delete')} />
      <ModalButton secondary label={t('cancel')} onClick={onClose} />
    </ModalTwoButtonsWrapper>
  );

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={isOpen}
      onClose={onClose}
      title={title}
      text={text}
      iconSrc={icon || warningIcon}
      iconProps={{width: 84, height: 84}}
      iconAlt=""
    >
      {areButtonsShown !== undefined ? areButtonsShown && modalActions : modalActions}
    </Modal>
  );
}

export {DeleteConfirmationModal};
