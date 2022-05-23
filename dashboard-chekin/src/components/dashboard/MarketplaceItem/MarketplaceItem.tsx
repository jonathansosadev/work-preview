import React from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../../api';
import { toastResponseError } from '../../../utils/common';
import checkIcon from '../../../assets/check-filled.svg';
import {
  Wrapper,
  HeaderWrapper,
  Name,
  ComingSoonText,
  DisconnectWrapper,
  ConnectedWrapper,
  ConnectedImg,
  ConnectedText,
  DisconnectButton,
  DescriptionText,
  MarketplaceButton,
  InfoWrapper,
  MarketplaceLogo,
  MarketplaceLogoWrapper,
  DescriptionTextPropertyConnection,
  EditMappingButton,
  DisconnectTexxt,
} from './styled';
import { MARKETPLACE_STATUSES, MARKETPLACE_TYPES } from '../../../utils/constants';
import { useHistory, useLocation } from 'react-router-dom';
import { useModalControls } from 'utils/hooks';
import IdentityVerificationRequiredModal from '../IdentityVerificationRequiredModal';
import SuperHogMappingModal from '../SuperHogMappingModal';
import { SuperHogHousing } from 'utils/types';

type MarketplaceItemProps = {
  type: string;
  logoSrc?: string;
  descriptionText?: string;
  status: string;
  name: string;
  id?: string;
  superHogHousings?: SuperHogHousing[]
  superHogChekinHousings?: any[]
  
};

type SuperHogModalState = {
  origin: string;
  success: boolean;
  higher: string;
  superHogHousings: SuperHogHousing[]
}

const defaultProps = {
  type: MARKETPLACE_TYPES.access_provider,
  logoSrc: null,
  descriptionText: '',
  status: MARKETPLACE_STATUSES.unconnected,
  name: 'unnamed',
  id: null,
  superHogHousings:[],
  superHogChekinHousings:[]
};

function MarketplaceItem({
  type,
  logoSrc,
  descriptionText,
  status,
  name,
  id,
  superHogHousings,
  superHogChekinHousings
}: MarketplaceItemProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const location = useLocation<SuperHogModalState>();
  const [currentStatus, setCurrentStatus] = React.useState(status);
  const [isEditingSuperHogMappgin, setIsEditingSuperHogMappgin] = React.useState<boolean>(false)

  React.useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const {
    isOpen: isSuperHogMappingModalOpen,
    closeModal: closeSuperHogMappingModal,
    openModal: openSuperHogMappingModal,
  } = useModalControls();

  const deleteMarkeplaceConnection = async () => {
    if (id) {
      setIsDeleting(true);
      const { error } = await api.locks.deleteLockUser(id);
      if (!error) {
        setCurrentStatus(MARKETPLACE_STATUSES.unconnected);
      } else {
        toastResponseError(error);
      }
      setIsDeleting(false);
    }
  };

  React.useEffect(() => {

    if (location?.state?.origin === 'superhog' && location?.state?.success) {
      openSuperHogMappingModal();
    }

  
  }, [location, openSuperHogMappingModal])

  const goConnectPage = () => {
    if (type === MARKETPLACE_TYPES.access_provider) {
      history.push(`/marketplace/access-providers/${name}`);
    } else {
      // history.push(`/marketplace/property-protection/${name}`);
      openIdentityVerificationModalModal();
    }
    // switch (type) {
    //   case MARKETPLACE_TYPES.access_provider:
    //     marketPlateUrl = 'access-providers'
    //     break;
    //   case MARKETPLACE_TYPES.property_protection:
        
    //     marketPlateUrl = 'property-protection'
    //     break;
    //   default:
    //     marketPlateUrl = 'access-providers'
    //     break;
    // }
    // history.push(`/marketplace/${marketPlateUrl}/${name}`);
  };

  const {
    isOpen: isIdentityVerificationModalOpen,
    closeModal: closeIdentityVerificationModalModal,
    openModal: openIdentityVerificationModalModal,
  } = useModalControls();



  return (
    <Wrapper>
      <HeaderWrapper>
        <Name status={currentStatus}>{name}</Name>
        {currentStatus === MARKETPLACE_STATUSES.coming && (
          <ComingSoonText>{t('coming_soon')}</ComingSoonText>
        )}
        {currentStatus === MARKETPLACE_STATUSES.unconnected && type === MARKETPLACE_TYPES.access_provider && ( //{currentStatus === MARKETPLACE_STATUSES.connected && (
          <ConnectedWrapper>
            <ConnectedImg src={checkIcon} />
            <ConnectedText>{t('connected')}</ConnectedText>
          </ConnectedWrapper>
        )}
      </HeaderWrapper>
      <InfoWrapper status={currentStatus}>
        <MarketplaceLogoWrapper>
          <MarketplaceLogo src={logoSrc} />
        </MarketplaceLogoWrapper>
        {type === MARKETPLACE_TYPES.property_protection && (
          <DescriptionTextPropertyConnection>{descriptionText}</DescriptionTextPropertyConnection>
        )}

        {type === MARKETPLACE_TYPES.access_provider && (
          <DescriptionText>{descriptionText}</DescriptionText>
        )}

        {currentStatus === MARKETPLACE_STATUSES.unconnected && ( //{currentStatus === MARKETPLACE_STATUSES.unconnected && (
          <MarketplaceButton secondary onClick={goConnectPage} label={t('connect')} />
        )}
        {currentStatus === MARKETPLACE_STATUSES.connected && // {currentStatus === MARKETPLACE_STATUSES.connected &&
          type === MARKETPLACE_TYPES.access_provider && (
            <DisconnectWrapper>
              <ConnectedWrapper>
                <ConnectedImg src={checkIcon} />
                <ConnectedText>{t('connected')}</ConnectedText>
              </ConnectedWrapper>
              <DisconnectButton
                secondary
                disabled={isDeleting}
                onClick={deleteMarkeplaceConnection}
                label={`(${t('disconnect')})`}
              />
            </DisconnectWrapper>
          )}

        {currentStatus === MARKETPLACE_STATUSES.connected && // {currentStatus === MARKETPLACE_STATUSES.connected &&
          type === MARKETPLACE_TYPES.property_protection && (
            <>
              <EditMappingButton
                onClick={()=>{
                  setIsEditingSuperHogMappgin(true)
                  openSuperHogMappingModal();
                }}
                label={t('edit_mapping')}
              /> 
              <DisconnectTexxt>
                <ConnectedImg src={checkIcon} />
                <strong>{t('connected')}  </strong>  
                {/* <a href="#" onClick={deleteMarkeplaceConnection}>{t('disconnect')}</a> */}
              </DisconnectTexxt>
            </>

          )}
      </InfoWrapper>
      {/* <MarketplaceType>{type}</MarketplaceType> */}
      <IdentityVerificationRequiredModal
        open={isIdentityVerificationModalOpen}
        onClose={closeIdentityVerificationModalModal}
      />
      <SuperHogMappingModal
        open={isSuperHogMappingModalOpen}
        onClose={closeSuperHogMappingModal}
        superHogHousings={location.state?.superHogHousings || superHogHousings}
        higher={location.state?.higher}
        isEditing={isEditingSuperHogMappgin}
      />


    </Wrapper>
  );
}

MarketplaceItem.defaultProps = defaultProps;
export { MarketplaceItem };
