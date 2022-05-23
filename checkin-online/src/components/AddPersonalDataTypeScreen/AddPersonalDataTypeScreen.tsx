import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {useTranslation, Trans} from 'react-i18next';
import {getHousingCountryCode} from '../../utils/reservation';
import {useModalControls} from '../../utils/hooks';
import {COUNTRY_CODES_WITHOUT_SIGNATURE} from '../../utils/constants';
import {
  ComputedReservationDetailsContextProps,
  useComputedReservationDetails,
} from '../../context/computedReservationDetails';
import cameraIcon from '../../assets/cam_icn.svg';
import eyeIcon from '../../assets/eye.svg';
import contractIcon from '../../assets/contract.svg';
import Header from '../Header';
import Button from '../Button';
import WhatDocumentsShouldIUseModal from '../WhatDocumentsShouldIUseModal';
import {
  Content,
  Title,
  CameraIcon,
  ModalTrigger,
  EyeIconContainer,
  ContractIcon,
  OrText,
} from './styled';

function getHeaderProps({
  hasGuestMembers = false,
  reservation = {},
  hasBiomatchForGuestLeader,
  isThailandReservation,
  isGreeceReservation,
  isContractEnabled,
  isDubaiReservation,
  hasScanDocument,
  isBiomatchForAllGuests,
}: ComputedReservationDetailsContextProps) {
  const countryCode = getHousingCountryCode(reservation);

  if (hasGuestMembers && isBiomatchForAllGuests) {
    if (isGreeceReservation) {
      if (hasScanDocument) {
        return {
          steps: 3,
          activeStep: 2,
        };
      }

      return {
        steps: 2,
        activeStep: 2,
      };
    }

    if (COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) && !isThailandReservation) {
      if (hasScanDocument) {
        return {
          steps: 3,
          activeStep: 2,
        };
      }

      return {
        steps: 2,
        activeStep: 2,
      };
    }

    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (isContractEnabled) {
        return {
          steps: 4,
          activeStep: 2,
        };
      }

      return {
        steps: 3,
        activeStep: 2,
      };
    }

    if (hasScanDocument) {
      return {
        steps: 4,
        activeStep: 2,
      };
    }

    return {
      steps: 3,
      activeStep: 2,
    };
  }

  if (hasGuestMembers) {
    if (isGreeceReservation) {
      if (hasScanDocument) {
        return {
          steps: 2,
          activeStep: 1,
          hideBackButton: true,
        };
      }

      return {
        steps: 1,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    if (COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) && !isThailandReservation) {
      if (hasScanDocument) {
        return {
          steps: 2,
          activeStep: 1,
          hideBackButton: true,
        };
      }

      return {
        steps: 1,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (isContractEnabled) {
        return {
          steps: 3,
          activeStep: 1,
          hideBackButton: true,
        };
      }

      return {
        steps: 2,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    if (hasScanDocument) {
      return {
        steps: 3,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    return {
      steps: 2,
      activeStep: 1,
      hideBackButton: true,
    };
  }

  if (isContractEnabled) {
    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (hasBiomatchForGuestLeader) {
        return {
          steps: 5,
          activeStep: 3,
        };
      }

      return {
        steps: 4,
        activeStep: 2,
      };
    }
  }

  if (
    !isContractEnabled &&
    COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) &&
    !isThailandReservation
  ) {
    if (hasBiomatchForGuestLeader) {
      if (hasScanDocument) {
        return {
          steps: 4,
          activeStep: 2,
        };
      }

      return {
        steps: 3,
        activeStep: 2,
      };
    }

    if (hasScanDocument) {
      return {
        steps: 3,
        activeStep: 3,
      };
    }

    return {
      steps: 2,
      activeStep: 2,
    };
  }

  if (hasBiomatchForGuestLeader) {
    if (hasScanDocument) {
      return {
        steps: 5,
        activeStep: 2,
      };
    }

    return {
      steps: 4,
      activeStep: 2,
    };
  }

  if (hasScanDocument) {
    return {
      steps: 4,
      activeStep: 3,
    };
  }

  return {
    steps: 3,
    activeStep: 2,
  };
}

function AddPersonalDataTypeScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const details = useComputedReservationDetails();
  const {closeModal, isOpen, openModal} = useModalControls();

  const getPersistedState = () => {
    return location?.state;
  };

  const goBack = () => {
    const persistedState = getPersistedState();
    const hasReservationBiomatch = details.hasBiomatch;

    if (hasReservationBiomatch) {
      if (details.isAliceOnboardingEnabled) {
        history.push('/onboarding/form', persistedState);
      } else {
        history.push('/verification/result', persistedState);
      }

      return;
    }
    history.push('/', persistedState);
  };

  const handleScanClick = () => {
    history.push('/form/scan', getPersistedState());
  };

  const handleAddManuallyClick = () => {
    history.push('/form/add', getPersistedState());
  };

  return (
    <>
      <Header
        title={t('add_personal_data')}
        onBack={goBack}
        {...getHeaderProps(details)}
      />
      <Content>
        <Title>
          <Trans i18nKey="you_have_two_ways_to_add_data">
            You have <b>two ways</b> to add your personal data as it is required by law.
          </Trans>
        </Title>
        <Button
          label={t('scan_id_passport')}
          onClick={handleScanClick}
          icon={<CameraIcon src={cameraIcon} alt="Camera" />}
        />
        <ModalTrigger onClick={openModal}>
          <EyeIconContainer>
            <img src={eyeIcon} alt="Eye" />
          </EyeIconContainer>
          {t('what_document_type')}
        </ModalTrigger>
        <OrText>{t('or')}:</OrText>
        <Button
          label={t('add_data_manually')}
          onClick={handleAddManuallyClick}
          icon={<ContractIcon src={contractIcon} alt="Contract" />}
        />
      </Content>
      <WhatDocumentsShouldIUseModal open={isOpen} onClose={closeModal} />
    </>
  );
}

export {AddPersonalDataTypeScreen, getHeaderProps};
