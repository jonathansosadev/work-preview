import React from 'react';
import {useTranslation} from 'react-i18next';
import warningIcon from '../../../assets/warning-icon.svg';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import Modal from '../../dashboard/Modal';
import Loader from '../../common/Loader';

type ConfirmDeletionModalProps = {
  title: string;
  isConfirmDeletionModalOpen: boolean;
  onDelete: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

function ConfirmDeletionModal({
  title,
  isConfirmDeletionModalOpen,
  onDelete,
  onCancel,
  isLoading,
}: ConfirmDeletionModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      closeOnEscape
      closeOnDocumentClick
      onClose={onCancel}
      open={isConfirmDeletionModalOpen}
      iconSrc={warningIcon}
      iconAlt="Warning"
      iconProps={{
        height: 84,
        width: 84,
      }}
      title={title}
      text={t('this_cannot_be_reverted')}
    >
      {isLoading ? (
        <Loader height={37} width={37} />
      ) : (
        <ModalTwoButtonsWrapper>
          <ModalButton onClick={onDelete} label={t('delete')} />
          <ModalButton secondary onClick={onCancel} label={t('cancel')} />
        </ModalTwoButtonsWrapper>
      )}
    </Modal>
  );
}

export {ConfirmDeletionModal};
