import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {getFinishCheckinHistoryArgs} from '../utils/checkin';
import {getHousingCountryCode} from '../utils/reservation';
import {
  COUNTRY_CODES_WITHOUT_SIGNATURE,
  TIMEOUT_BEFORE_REDIRECT_MS,
} from '../utils/constants';
import {AliceReport} from '../components/AliceOnboardingForm/AliceOnboardingForm';
import {useComputedReservationDetails} from '../context/computedReservationDetails';
import {useReservation} from '../context/reservation';
import {useErrorModal, useIsMounted, useModalControls} from '../utils/hooks';
import {useRegisterGuest} from './useRegisterGuest';
import {useBiomatchUpdateGuest} from './useBiomatchUpdateGuest';

export type LocationTypes = {
  formData: any;
  number_of_guests?: number;
  children?: number;
  ocrWasUsed?: boolean;
  aliceReport?: AliceReport;
  documentPassed: boolean;
  isRetryBiomatch: boolean;
  front_side_scan?: string;
  back_side_scan?: string;
  guestId?: string;
  biomatch?: {
    reservation_id: string;
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
};

type useReservationPayloadProps = {
  side: 'front_side_scan' | 'back_side_scan';
  timeoutRef: React.MutableRefObject<any>;
  startLoading: () => void;
  stopLoading: () => void;
};

function useReservationPayload({
  side,
  timeoutRef,
  startLoading,
  stopLoading,
}: useReservationPayloadProps) {
  const location = useLocation<LocationTypes>();
  const history = useHistory();
  const isMounted = useIsMounted();
  const registerGuest = useRegisterGuest();
  const {updateScanDocumentGuest} = useBiomatchUpdateGuest();
  const {
    hasGuestMembers,
    isVerifyOnlyDocumentOptional,
    ...reservationDetails
  } = useComputedReservationDetails();
  const {patchReservation, refreshReservation} = useReservation();
  const {ErrorModal, displayError, closeErrorModal} = useErrorModal();
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModalControls();

  const setToLocationState = (value: Partial<LocationTypes>) => {
    location.state = {...location.state, ...value};
  };

  const getReservationPayload = () => {
    if (hasGuestMembers) {
      return null;
    }

    if (location.state?.children) {
      const computedNumberOfGuests =
        Number(location.state?.number_of_guests) + Number(location.state.children);
      return {
        guest_group: {
          number_of_guests: computedNumberOfGuests > 0 ? computedNumberOfGuests : 0,
        },
      };
    }

    return {
      guest_group: {
        number_of_guests: location.state.number_of_guests,
      },
    };
  };

  const updateReservation = () => {
    const payload = getReservationPayload();
    if (payload) {
      return patchReservation(payload);
    }
    return {
      error: null,
      data: null,
    };
  };

  const finishCheckin = (registeredGuestName: string) => {
    const {url, state} = getFinishCheckinHistoryArgs({
      reservationDetails: {
        hasGuestMembers,
        isVerifyOnlyDocumentOptional,
        ...reservationDetails,
      },
      locationState: {
        registeredGuestName,
      },
    });
    history.push(url, state);
  };

  const registerGuestAndUpdateReservation = async (image = '') => {
    closeErrorModal();
    startLoading();

    const {error: reservationError} = await updateReservation();
    if (!isMounted.current) {
      return;
    }

    if (!reservationError) {
      const {error: guestError, data: guest} = await registerGuest({
        guestData: {
          [side]: image,
        },
      });
      if (!isMounted.current) {
        return;
      }

      if (!guestError) {
        const {error: refreshError} = await refreshReservation();
        if (!isMounted.current) {
          return;
        }

        if (!refreshError) {
          stopLoading();
          finishCheckin(guest.full_name);
        } else {
          displayError(refreshError);
        }
      } else {
        displayError(guestError);
      }
    } else {
      displayError(reservationError);
    }

    stopLoading();
  };

  const getIsSignatureRequired = () => {
    const housingCountry = getHousingCountryCode(reservationDetails.reservation);

    if (COUNTRY_CODES_WITHOUT_SIGNATURE.includes(housingCountry)) {
      return false;
    }

    return reservationDetails.isDubaiReservation ||
      reservationDetails.isThailandReservation
      ? reservationDetails.isContractEnabled && !hasGuestMembers
      : true;
  };

  const goNextOrRegisterGuest = async (image: string) => {
    const isSignatureRequired = getIsSignatureRequired();
    if (location.state.isRetryBiomatch) {
      await updateScanDocumentGuest();
      return history.push('/biomatch-results', location.state);
    }
    closeSuccessModal();
    if (isSignatureRequired) {
      history.push('/sign', location.state);
    } else {
      registerGuestAndUpdateReservation(image);
    }
  };

  const goSkip = () => {
    if (!isVerifyOnlyDocumentOptional) return;
    const isSignatureRequired = getIsSignatureRequired();
    if (isSignatureRequired) {
      history.push('/sign', {
        ...location.state,
      });
    } else {
      registerGuestAndUpdateReservation();
    }
  };

  const submitAfterTimeout = (image = '', isPassedDocument: boolean) => {
    openSuccessModal();
    let scanSide = side === 'front_side_scan' ? 'front_side_scan' : 'back_side_scan';
    setToLocationState({documentPassed: isPassedDocument, [scanSide]: image});
    timeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        goNextOrRegisterGuest(image);
      }
    }, TIMEOUT_BEFORE_REDIRECT_MS);
  };

  return {
    goSkip,
    submitAfterTimeout,
    isSuccessModalOpen,
    openSuccessModal,
    closeSuccessModal,
    ReservationPayloadErrorModal: ErrorModal,
    timeoutRef,
  };
}

export {useReservationPayload};
