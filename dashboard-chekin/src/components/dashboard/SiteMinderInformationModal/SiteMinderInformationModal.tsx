import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useModalControls} from '../../../utils/hooks';
import {useUser} from '../../../context/user';
import {getSearchParamFromUrl} from '../../../utils/common';
import {SITEMINDER_ORIGINS} from '../../../utils/constants';
import siteminderInfoModalLogo from 'assets/siteminder-info-modal-logo.svg';
import Modal from '../Modal';
import {
  AvailabilityContainer,
  ButtonWrapper,
  Content,
  ModalButtonStyled,
  Subtitle,
  TitleImage,
} from './styled';

function SiteMinderInformationModal() {
  const {t} = useTranslation();
  const user = useUser();
  const {isOpen, closeModal, openModal} = useModalControls(false);

  const flagModalFromUrl = Boolean(getSearchParamFromUrl('siteminder-modal'));
  const isOriginSiteMinder =
    user?.origin && Object.values(SITEMINDER_ORIGINS).includes(user?.origin);
  const isNeedToShowModal = flagModalFromUrl && isOriginSiteMinder;

  React.useLayoutEffect(() => {
    if (isNeedToShowModal) {
      openModal();
    }
  }, [isNeedToShowModal, openModal]);

  const handleModalClose = () => {
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleModalClose}
      title={t('welcome_to_chekin')}
      withCloseButton
    >
      <AvailabilityContainer>
        <TitleImage src={siteminderInfoModalLogo} />
        <Subtitle>{t('siteminder_first_info_modal_message_subtitle')}</Subtitle>
        <Content>
          <Trans i18nKey="siteminder_first_info_modal_message">
            To connect your properties with SiteMinder, you need to complete an activation
            request from SiteMinder with your publisher information and the Property ID
            from Chekin.
            <p>Here's a quick guide: </p>
            <p>
              1. Go to properties and click add property.
              <br />
              2. Complete all required information and click Save.
              <br />
              3. You will see a message with the Property ID and a link to SiteMinder
              activation request page.
              <br />
              4. Click the link and complete the SiteMinder activation request form.
              <p>
                If successful, your reservations will start to import automatically. You
                can visit our help center to review this information again.
              </p>
            </p>
          </Trans>
        </Content>
        <ButtonWrapper>
          <ModalButtonStyled primary label={t('understood')} onClick={handleModalClose} />
        </ButtonWrapper>
      </AvailabilityContainer>
    </Modal>
  );
}

export {SiteMinderInformationModal};
