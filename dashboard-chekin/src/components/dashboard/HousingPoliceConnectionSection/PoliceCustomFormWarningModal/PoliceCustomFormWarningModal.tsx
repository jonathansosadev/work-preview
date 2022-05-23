import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import warningIcon from '../../../../assets/warning-icon.svg';
import Modal from 'components/dashboard/Modal';
import ModalButton from '../../ModalButton';
import {ButtonsWrapper, Text} from './styled';

type PoliceCustomFormWarningModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
};

function PoliceCustomFormWarningModal({
  open,
  onClose,
  onComplete,
}: PoliceCustomFormWarningModalProps) {
  const {t} = useTranslation();

  const handleCancel = () => {
    onComplete();
    onClose();
  };

  return (
    <Modal
      closeOnEscape
      open={open}
      onClose={onClose}
      iconSrc={warningIcon}
      iconProps={{width: 84, height: 84}}
      iconAlt="Warning"
      title={t('warning')}
    >
      <Text>
        <Trans i18nKey="warning_message_delete_housing_from_custom_form_if_enable_police">
          <p>
            Activating the police requires mandatory information that's not included in
            your custom form.
          </p>
          <p>
            To avoid changing and deleting the required fields for the police, this
            property will be removed from the custom forms that doesn't met the police
            requirements and return to the default form.
          </p>
          <p>
            If you want to add a custom form to this property, you would need to create a
            new custom form that includes the mandatory fields required by the police.
          </p>
        </Trans>
      </Text>
      <ButtonsWrapper>
        <ModalButton label={t('complete')} onClick={onClose} />
        <ModalButton secondary label={t('cancel')} onClick={handleCancel} />
      </ButtonsWrapper>
    </Modal>
  );
}

export {PoliceCustomFormWarningModal};
