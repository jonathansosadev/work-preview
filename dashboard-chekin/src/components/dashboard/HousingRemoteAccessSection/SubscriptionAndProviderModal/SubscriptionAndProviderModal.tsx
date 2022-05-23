import React from 'react';
import {useQuery} from 'react-query';
import api, {queryFetcher} from '../../../../api';
import {useSubscription} from '../../../../context/subscription';
import {openHubspotChat} from '../../../../analytics/hubspot';
import {SubscriptionModalProps} from '../../SubscriptionModal/SubscriptionModal';
import {SUBSCRIPTION_PRODUCT_TYPES} from '../../../../utils/constants';
import {LockUser} from '../../../../utils/types';
import {useErrorToast, useModalControls} from '../../../../utils/hooks';
import SubscriptionModal from '../../SubscriptionModal';
import RemoteAccessSelectProviderModal from '../../RemoteAccessSelectProviderModal';
import {ProviderAddedModal} from './ProviderAddedModal/ProviderAddedModal';

type SubscriptionAndProviderModalProps = SubscriptionModalProps & {
  isSectionActive: boolean;
};

function fetchLockUsers() {
  return queryFetcher(api.locks.ENDPOINTS.lockUsers());
}

function SubscriptionAndProviderModal({
  open,
  onClose,
  setIsSectionActive,
  setSectionTouched,
  isSectionActive,
  subscriptionProductType,
  ...props
}: SubscriptionAndProviderModalProps) {
  const {
    isOpen: isProviderModalOpen,
    closeModal: closeProviderModal,
    openModal: openProviderModal,
  } = useModalControls();
  const {
    isOpen: isFinishModalOpen,
    closeModal: closeFinishModal,
    openModal: openFinishModal,
  } = useModalControls();

  const {isTrialMode, checkIsProductActive} = useSubscription();

  const isRemoteAccessActive = checkIsProductActive(subscriptionProductType);

  React.useLayoutEffect(() => {
    const shouldOpenProviderModal =
      (open && isRemoteAccessActive) || isSectionActive || isTrialMode;

    if (shouldOpenProviderModal) {
      openProviderModal();
    } else {
      closeProviderModal();
    }
  }, [
    open,
    isTrialMode,
    isSectionActive,
    openProviderModal,
    closeProviderModal,
    isRemoteAccessActive,
  ]);

  const {data: lockUsers, error: lockUsersError, status: lockUsersStatus} = useQuery<
    LockUser[],
    string
  >('lockUsers', fetchLockUsers);
  useErrorToast(lockUsersError, {
    notFoundMessage: 'Lock users not found. Please contact support',
  });

  const handleFinish = async () => {
    closeProviderModal();
    openFinishModal();
  };

  const handleProviderModalClose = () => {
    if (isRemoteAccessActive || isTrialMode || lockUsers?.length) {
      closeProviderModal();
      onClose();
    } else {
      closeProviderModal();
    }
  };

  const handleFinishModalClose = () => {
    closeFinishModal();
    closeProviderModal();
    onClose();
  };

  const handleSubmit = async () => {
    if (!lockUsers?.length) {
      openProviderModal();
      return;
    }

    handleFinish();
  };

  if (!open) {
    return null;
  }

  if (isFinishModalOpen) {
    return (
      <ProviderAddedModal
        handleFinishModalClose={handleFinishModalClose}
        openHubspotChat={openHubspotChat}
      />
    );
  }

  if (isProviderModalOpen) {
    return (
      <RemoteAccessSelectProviderModal
        open={isProviderModalOpen}
        onClose={handleProviderModalClose}
        onFinish={handleFinish}
      />
    );
  }
  return (
    <SubscriptionModal
      {...props}
      setIsSectionActive={setIsSectionActive}
      setSectionTouched={setSectionTouched}
      subscriptionProductType={SUBSCRIPTION_PRODUCT_TYPES.remoteAccess}
      open={open}
      onClose={onClose}
      disabled={lockUsersStatus === 'loading'}
      onUpgradeToPremium={handleSubmit}
    />
  );
}

export {SubscriptionAndProviderModal};
