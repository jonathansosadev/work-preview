import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import checkIcon from '../../../../../assets/check-green.svg';
import Modal from '../../../Modal';
import ModalButton from '../../../ModalButton';
import {ContactSupportButton, FinishModalButtonWrapper} from '../styled';

function ProviderAddedModal({handleFinishModalClose, openHubspotChat}: any) {
  const {t} = useTranslation();

  return (
    <Modal
      iconSrc={checkIcon}
      iconAlt="Green checkmark"
      iconProps={{height: 84, width: 84}}
      title={t('account_added')}
      text={
        <>
          <Trans i18nKey="remote_access_account_was_successfully_added">
            The remote access account was successfully added, you can start{' '}
            <b>adding doors</b> with this account.
          </Trans>
          <p />
          {t('if_you_have_any_questions_please')}
          <ContactSupportButton type="button" onClick={openHubspotChat}>
            {t('contact_support')}
          </ContactSupportButton>
          .
        </>
      }
    >
      <FinishModalButtonWrapper>
        <ModalButton label={t('ok')} onClick={handleFinishModalClose} />
      </FinishModalButtonWrapper>
    </Modal>
  );
}

export {ProviderAddedModal};
