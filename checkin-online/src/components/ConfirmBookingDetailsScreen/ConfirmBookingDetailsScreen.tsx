import React from 'react';
import {useTranslation} from 'react-i18next';
import {
  ComputedReservationDetailsContextProps,
  useComputedReservationDetails,
} from '../../context/computedReservationDetails';
import {useReservation} from '../../context/reservation';
import {
  getHousingCountryCode,
  getHousingName,
  getHousingPicture,
} from '../../utils/reservation';
import {COUNTRY_CODES_WITHOUT_SIGNATURE} from '../../utils/constants';
import Header from '../Header';
import ConfirmBookingDetailsForm from '../ConfirmBookingDetailsForm';
import HousingPicture from '../HousingPicture';
import {DimensionsWrapper} from '../../styled/common';
import {LogoPlaceholder} from './styled';

function getHeaderProps({
  reservation = {},
  hasBiomatchForGuestLeader,
  isThailandReservation,
  isContractEnabled,
  isDubaiReservation,
  hasGuestMembers,
  isBiomatchForAllGuests,
  hasScanDocument,
  isGreeceReservation,
}: ComputedReservationDetailsContextProps) {
  const countryCode = getHousingCountryCode(reservation);

  if (hasGuestMembers && isBiomatchForAllGuests) {
    if (isGreeceReservation) {
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

    if (COUNTRY_CODES_WITHOUT_SIGNATURE.includes(countryCode) && !isThailandReservation) {
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

    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (isContractEnabled) {
        return {
          steps: 4,
          activeStep: 1,
          hideBackButton: true,
        };
      }

      return {
        steps: 3,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    if (hasScanDocument) {
      return {
        steps: 4,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    return {
      steps: 3,
      activeStep: 1,
      hideBackButton: true,
    };
  }

  if (isContractEnabled) {
    if (isThailandReservation || isDubaiReservation || hasScanDocument) {
      if (hasBiomatchForGuestLeader) {
        return {
          steps: 5,
          activeStep: 1,
          hideBackButton: true,
        };
      }

      return {
        steps: 4,
        activeStep: 1,
        hideBackButton: true,
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
          activeStep: 1,
          hideBackButton: true,
        };
      }

      return {
        steps: 3,
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

  if (hasBiomatchForGuestLeader) {
    if (hasScanDocument) {
      return {
        steps: 5,
        activeStep: 1,
        hideBackButton: true,
      };
    }

    return {
      steps: 4,
      activeStep: 1,
      hideBackButton: true,
    };
  }

  if (hasScanDocument) {
    return {
      steps: 4,
      activeStep: 1,
      hideBackButton: true,
    };
  }

  return {
    steps: 3,
    activeStep: 1,
    hideBackButton: true,
  };
}

function ConfirmBookingDetailsScreen() {
  const {t} = useTranslation();
  const {data} = useReservation();
  const details = useComputedReservationDetails();
  const housingPicture = getHousingPicture(data);

  return (
    <>
      <Header
        {...getHeaderProps(details)}
        hideBackButton
        title={t('confirm_booking_details')}
        subtitle={getHousingName(data)}
      />
      {housingPicture ? <HousingPicture /> : <LogoPlaceholder />}
      <DimensionsWrapper>
        <ConfirmBookingDetailsForm />
      </DimensionsWrapper>
    </>
  );
}

export {ConfirmBookingDetailsScreen, getHeaderProps};
