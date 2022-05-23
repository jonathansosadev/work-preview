import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import { ModalTwoButtonsWrapper } from '../../../styled/common';
import propertyIcon from 'assets/property-icon.svg';
import { contentStyle, ModalContent, SupegHogModalButton, ValidationText } from './styled';
import api, { queryFetcher } from 'api';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { toastResponseError } from 'utils/common';

type SuperHogCompleteModalProps = {
  open: boolean;
  onClose: () => void;
  closeMapModal: () => void;
  higher: string;
  newSuperHogHousings: string[],
  superHogHousingsCount:number
}

function getSuperHog() {
  return queryFetcher(api.propertiesProtections.ENDPOINTS.propertiesProtectionsUsers());
}


function SuperHogCompleteModal({ onClose, open, higher, newSuperHogHousings, closeMapModal, superHogHousingsCount }: SuperHogCompleteModalProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const [coreId, setCoreId] = React.useState<string | null>(null);
  
  const { data, status } = useQuery(
    'superHog',
    getSuperHog,
    {
      refetchOnWindowFocus: false,
    },
  );

  React.useEffect(() => {
    if (status === 'success' && data.length > 0) {
      setCoreId(data[0].core_id);
    }
  }, [status, data])

  React.useEffect(() => {
   console.log(newSuperHogHousings);
  }, [newSuperHogHousings]);

  // const goToSuperHogLogin = () => {
  //   history.push(`/marketplace/property-protection/`);
  // };
  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      title={t('connected')}
      contentStyle={contentStyle}
      iconProps={{
        src: propertyIcon,
        height: 84,
        width: 84,
      }}

    >
      <ModalContent>
        <ValidationText>
          {higher === 'SH' && (
            <Trans i18nKey="superhog_properties_higher" values={{superHogHousingsCount: superHogHousingsCount, checkinHousingsCount: newSuperHogHousings.length}}>
              <p>
                We have detected that you have <strong> more properties on Superhog ({{superHogHousingsCount: superHogHousingsCount}})</strong> than in Chekin ({{checkinHousingsCount:newSuperHogHousings.length}}). those properties won't be linked until you create them.
              </p>
              <p>Go to properties and create the missing properties you want to link to Superhog.</p>
              <p>
                After you create the properties, return to the Superhog connection and click on "Edit mapping"
              </p>
            </Trans>
          )}

          {higher === 'chekin' && (
            <Trans i18nKey="chekin_properties_higher" values={{superHogHousingsCount: superHogHousingsCount, checkinHousingsCount: newSuperHogHousings.length}}>
              <p>
                We have detected that you have <strong> more properties on Chekin (x)</strong> than in Chekin (y). We can automatically create and link those properties on Superhog. Would you like to proceed?
              </p>
            </Trans>
          )}

        </ValidationText>
      </ModalContent>
      <ModalTwoButtonsWrapper>
        {higher === 'SH' && (
          <SupegHogModalButton
            label={t('go_to_properties')}
            onClick={() => {
              history.push('properties');
            }}
          />)}
        {higher === 'chekin' && (
          <SupegHogModalButton
            label={t('create_properties')}
            disabled={!coreId}
            onClick={async () => {
              if (coreId){
                let totalNewSuperHogHousings: string[] = [];
                const totalNewSuperHogHousingsCount = newSuperHogHousings.length - superHogHousingsCount;
                if (totalNewSuperHogHousingsCount > 0) {
                  totalNewSuperHogHousings = newSuperHogHousings.slice(0, totalNewSuperHogHousingsCount)
                } else if(totalNewSuperHogHousingsCount === 0) {
                  totalNewSuperHogHousings = newSuperHogHousings;
                };

                const { data, error } = await api.propertiesProtections.getlistings(coreId, {housings: totalNewSuperHogHousings})

                if (data || data === ""){
                  toast.success(t('created_superhog_housings_success'));
                  onClose();
                  closeMapModal();
                } 
                if(error) {
                  toastResponseError(error);
                  onClose();
                  closeMapModal();
                }
              }
            }}
          />)}
        <ModalButton secondary label={t('not_now')} onClick={() => {
          onClose();
          closeMapModal();
          
          history.push('/marketplace/property-protection');
        }} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

export { SuperHogCompleteModal };
