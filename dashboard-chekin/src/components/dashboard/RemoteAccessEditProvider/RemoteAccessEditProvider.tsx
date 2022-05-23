import React from 'react';
import {useTranslation} from 'react-i18next';
import propertyIcon from '../../../assets/icon-property-key.svg';
import RemoteAccessProviderDetails from '../RemoteAccessProviderDetails';
import Modal from '../Modal';
import {contentStyle} from '../RemoteAccessSelectProviderModal/styled';

type RemoteAccessEditProviderProps = {
  open: boolean;
  onClose: () => void;
  account: any;
  openSuccessModal: any;
};

function RemoteAccessEditProvider({
  open,
  onClose,
  account,
  openSuccessModal,
}: RemoteAccessEditProviderProps) {
  const {t} = useTranslation();
  const onFinish = () => {
    openSuccessModal();
    onClose();
  };

  return (
    <Modal
      iconSrc={propertyIcon}
      iconAlt="Property with a key"
      iconProps={{height: 84, width: 84}}
      title={t('edit_an_account')}
      open={open}
      onClose={onClose}
      contentStyle={contentStyle}
      closeOnDocumentClick
      closeOnEscape
    >
      <RemoteAccessProviderDetails
        selectedProvider={account.data.vendor}
        onFinish={onFinish}
        goBackFromProviderDetails={onClose}
        isEdit
        lockAccountId={account.data.id}
      />
    </Modal>
  );
}

export {RemoteAccessEditProvider};
