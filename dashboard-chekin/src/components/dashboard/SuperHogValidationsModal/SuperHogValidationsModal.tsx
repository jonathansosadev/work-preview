import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import { ModalTwoButtonsWrapper } from '../../../styled/common';
import propertyIcon from 'assets/property-icon.svg';
import { contentStyle, FirstText, ModalContent, SupegHogModalButton, ValidationText } from './styled';
import { ShortHousing, SuperHogHousing } from 'utils/types';
import { useHistory } from 'react-router-dom';
import api from 'api';
import { toast } from 'react-toastify';
import { toastResponseError } from 'utils/common';

type SuperHogValidationsModalProps = {
  open: boolean;
  onClose: () => void;
  superHogHousings: SuperHogHousing[];
  housings: ShortHousing[],
  coreId:string
};

function SuperHogValidationsModal({ onClose, open, superHogHousings, housings, coreId }: SuperHogValidationsModalProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const [modalTitle, setModalTitle] = React.useState<string>(t('no_data_superhog'))
  const [newSuperHogHousings, setNewSuperHogHousings] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    if (open && housings?.length === 0 && superHogHousings?.length > 0) {
      setModalTitle(t('no_data_chekin'))
    }

    if (open && housings?.length === 0 && superHogHousings?.length === 0) {
      setModalTitle(t('no_property_data'));
    }

    if (housings.length > 0) {
      const housingIds = housings.map(h => h.id);
      setNewSuperHogHousings(housingIds);
    }
  }, [superHogHousings, open, housings, t])


  const showValidationTemplateBody = React.useCallback(() => {
    if (open && superHogHousings?.length === 0 && housings?.length === 0) {
      return (
        <>
          <ValidationText>
            {t('chekin_superhog_no_properties')}
          </ValidationText>
          <ValidationText>
            {t('chekin_superhog_no_properties_advance')}
          </ValidationText>
        </>

      )
    }
    if (open && superHogHousings?.length === 0 && housings?.length > 0) {
      return (
        <>
          <ValidationText>
            <Trans i18nKey="no_superhog_housing">
              <p>
                We have detected that <strong> you don't have any properties created in Superhog,</strong> would you like to export the property data in Chekin to create the properties in your Superhog account?
              </p>
              <p><strong>Note</strong> the properties created in Superhog will be automatically linked to Chekin.</p>
            </Trans>
          </ValidationText>
        </>

      )
    }
    if (open && housings?.length === 0 && superHogHousings?.length > 0) {

      return (
        <>
          <ValidationText>
            {t('no_housings')}
          </ValidationText>
          <ValidationText>
            {t('no_housings_advance')}
          </ValidationText>
        </>

      )
    }

  }, [superHogHousings, open, housings, t])
  const goToProperties = React.useCallback(() => {
    history.push('/properties');
  },[history])

  const  createSuperHogHousings = React.useCallback(async() => {

    const { data, error } = await api.propertiesProtections.getlistings(coreId, {housings: newSuperHogHousings})
    if (data || data === ""){
      toast.success(t('created_superhog_housings_success'));
      onClose()
      history.push('/marketplace/property-protection/');
    } 
    if(error) {
      toastResponseError(error);
      history.push('/marketplace/property-protection/');
    }
  }, [history, coreId, newSuperHogHousings, t, onClose])

  const closeModal = React.useCallback(() => {
    history.push('/marketplace/property-protection/');
    onClose();
  },[history, onClose])

  const showValidationTemplateButtoms = React.useCallback(() => {
    return (
      <>
        {open && superHogHousings?.length === 0 && housings.length > 0 && (
          <SupegHogModalButton
            label={ t('create_properties')}
            onClick={()=>{createSuperHogHousings()}}
          />
        )}

        {open && (superHogHousings?.length > 0 || superHogHousings?.length === 0) && housings.length
        === 0 && (
          <SupegHogModalButton
            label={t('go_to_properties')}
            onClick={goToProperties}
          />
        )}

        <ModalButton secondary label={t('not_now')} onClick={closeModal} />
      </>
    )

  }, [superHogHousings, open, t, closeModal, createSuperHogHousings, goToProperties, housings])

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      title={modalTitle}
      contentStyle={contentStyle}
      iconProps={{
        src: propertyIcon,
        height: 84,
        width: 84,
      }}

    >

      <FirstText>
        {t('super_hog_modal_main_text_validation')}
      </FirstText>
      <ModalContent>
        {
          showValidationTemplateBody()
        }
      </ModalContent>
      <ModalTwoButtonsWrapper>
        {
          showValidationTemplateButtoms()
        }
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

export { SuperHogValidationsModal };
