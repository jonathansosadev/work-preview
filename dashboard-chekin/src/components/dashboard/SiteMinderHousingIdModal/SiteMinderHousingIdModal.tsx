import React from 'react';
import {useTranslation} from 'react-i18next';
import propertyIcon from 'assets/property-icon.svg';
import {
  AvailabilityContainer,
  ButtonWrapper,
  Content,
  ModalButtonUnderstood,
  PropertyId,
  Text,
  Title,
} from './styled';
import {useModalControls} from '../../../utils/hooks';
import Modal from '../Modal';
import {SITEMINDER_HOUSING_ID_STORAGE_KEY} from '../AddHousingSections/AddHousingSections';
import {useComputedDetails} from '../../../context/computedDetails';
import {ActivationSiteMinderButton} from '../EditHousingSections';

function SiteMinderHousingIdModal() {
  const {t} = useTranslation();
  const {isAccountWithSiteMinderOrigin} = useComputedDetails();

  const {isOpen, closeModal, openModal} = useModalControls(false);

  const siteMinderPropertyId = localStorage.getItem(SITEMINDER_HOUSING_ID_STORAGE_KEY);

  const isNeedToShowModal = siteMinderPropertyId && isAccountWithSiteMinderOrigin;

  React.useLayoutEffect(() => {
    if (isNeedToShowModal) {
      openModal();
    }
  }, [isNeedToShowModal, openModal]);

  const removeKeyLocalStorage = () => {
    localStorage.removeItem(SITEMINDER_HOUSING_ID_STORAGE_KEY);
  };

  const handleModalClose = () => {
    removeKeyLocalStorage();
    closeModal();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleModalClose}
      iconSrc={propertyIcon}
      iconProps={{width: 110, height: 110}}
      withCloseButton
    >
      <AvailabilityContainer>
        <Title>{t('property_created')}</Title>
        <Content>
          <PropertyId>
            {t('property_id')}:
            <br />
            {siteMinderPropertyId}
          </PropertyId>
          <Text>{t('siteminder_property_id_modal_subtitle')}</Text>
        </Content>
        <ButtonWrapper>
          <ActivationSiteMinderButton callback={removeKeyLocalStorage} />
          <ModalButtonUnderstood primary label={t('done')} onClick={handleModalClose} />
        </ButtonWrapper>
      </AvailabilityContainer>
    </Modal>
  );
}

export {SiteMinderHousingIdModal};
