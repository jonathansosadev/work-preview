import React from 'react';
import {useTranslation} from 'react-i18next';
import missingDataIcon from '../../../assets/icon-data-missing.svg';
import {ModalButtonWrapper} from '../../../styled/common';
import ModalButton from '../ModalButton';
import Modal from '../Modal';

type SelfCheckinDisabledModalProps = {
  isSelfCheckinDisabledModalOpen: boolean;
  closeSelfCheckinDisabledModal: () => void;
};

function SelfCheckinDisabledModal({
  isSelfCheckinDisabledModalOpen,
  closeSelfCheckinDisabledModal,
}: SelfCheckinDisabledModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      open={isSelfCheckinDisabledModalOpen}
      iconSrc={missingDataIcon}
      iconAlt="Form with red fields"
      iconProps={{
        height: 84,
        width: 84,
      }}
      title={t('data_missing')}
      text={t('self_checkin_is_disabled')}
    >
      <ModalButtonWrapper>
        <ModalButton label={t('ok')} onClick={closeSelfCheckinDisabledModal} />
      </ModalButtonWrapper>
    </Modal>
  );
}

export {SelfCheckinDisabledModal};
