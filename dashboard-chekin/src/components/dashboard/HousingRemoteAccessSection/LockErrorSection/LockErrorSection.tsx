import React from 'react';
import {UseMutationResult} from 'react-query';
import {useTranslation} from 'react-i18next';
import {LockUser} from '../../../../utils/types';
import {useStatus} from '../../../../utils/hooks';
import {useModalControls, useSuccessModal} from '../../../../utils/hooks';
import ConfirmDeletionModal from '../../ConfirmDeletionModal';
import RemoteAccessEditProvider from '../../RemoteAccessEditProvider';
import {
  LockErrorContainer,
  Content,
  Text,
  ButtonsWrapper,
  CustomModalButton,
} from './styled';

type LockErrorSectionProps = {
  account: any;
  deleteLockUserMutation?: UseMutationResult<LockUser, Error, string>;
};

function LockErrorSection({account, deleteLockUserMutation}: LockErrorSectionProps) {
  const {t} = useTranslation();
  const {isLoading, setStatus} = useStatus();
  const {isSuccessModalOpen, openSuccessModal, SuccessModal} = useSuccessModal();
  const {
    isOpen: isConfirmDeletionModalOpen,
    closeModal: closeConfirmDeletionModal,
    openModal: openConfirmDeletionModal,
  } = useModalControls();
  const {
    isOpen: isEditProviderModalOpen,
    openModal: openEditProviderModal,
    closeModal: closeEditProviderModal,
  } = useModalControls();

  const editLockAccount = () => {
    openEditProviderModal();
  };

  const onEditLockClose = () => {
    closeEditProviderModal();
  };

  const onDeleteConfirm = async () => {
    setStatus('loading');

    deleteLockUserMutation?.mutate(account.data.id, {
      onSuccess: () => {
        openSuccessModal();
        closeConfirmDeletionModal();
        setStatus('success');
      },
      onError: () => {
        setStatus('error');
      },
    });
  };

  return (
    <LockErrorContainer>
      <Content>
        <Text>{t('lock_account_error')}</Text>
        <ButtonsWrapper>
          <CustomModalButton
            label={'Edit account'}
            onClick={editLockAccount}
            disabled={isLoading}
          />
          <CustomModalButton
            label={'Delete account'}
            onClick={openConfirmDeletionModal}
            disabled={isLoading}
          />
        </ButtonsWrapper>
      </Content>
      <ConfirmDeletionModal
        title={t('delete_account')}
        isConfirmDeletionModalOpen={isConfirmDeletionModalOpen}
        onDelete={onDeleteConfirm}
        onCancel={closeConfirmDeletionModal}
        isLoading={isLoading}
      />
      <SuccessModal open={isSuccessModalOpen} />
      <RemoteAccessEditProvider
        open={isEditProviderModalOpen && !!account?.data}
        onClose={onEditLockClose}
        account={account}
        openSuccessModal={openSuccessModal}
      />
    </LockErrorContainer>
  );
}

export {LockErrorSection};
