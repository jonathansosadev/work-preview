import {useLocation} from 'react-router-dom';
import useSWR from 'swr';
import api, {getURL} from '../api';
import {useComputedReservationDetails} from '../context/computedReservationDetails';
import {useReservation} from '../context/reservation';
import {PatchGuestPayload} from '../api/guests';

type LocationTypes = {
  isMatch: boolean;
  documentPhoto: string;
  selfiePhoto: string;
  documentPassed: boolean;
  isRetryBiomatch: boolean;
  front_side_scan?: string;
  back_side_scan?: string;
  guestId: string;
  facesComparingResult: {
    is_match: boolean;
  };
  biomatch?: {
    reservation_id: string;
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
};

function useBiomatchUpdateGuest() {
  const location = useLocation<LocationTypes>();
  const reservationDetails = useComputedReservationDetails();
  const {refreshReservation} = useReservation();
  const guestId = location?.state?.guestId;

  const {data: guest} = useSWR(guestId && getURL(api.guests.ENDPOINTS.one(guestId)));

  const getBiomatchSelfGuestPayload = () => {
    const state = location.state;
    return {
      biomatch_passed:
        state?.facesComparingResult?.is_match || state?.biomatch?.biomatch_passed,
      biomatch_doc: state?.documentPhoto || state?.biomatch?.biomatch_doc,
      biomatch_selfie: state?.selfiePhoto || state?.biomatch?.biomatch_selfie,
    };
  };

  const getDocumentGuestPayload = () => {
    const state = location.state;
    const updatingDocumentId = guest?.document.id;
    const documents = guest?.documents;
    const updatedDocuments = documents.map((singleDocument: any) => {
      if (updatingDocumentId === singleDocument?.id) {
        return {
          document_id: singleDocument.id,
          type: singleDocument.type,
          number: singleDocument.number,
          front_side_scan: state?.front_side_scan,
          back_side_scan: state?.back_side_scan,
        };
      }

      return singleDocument;
    });
    return {
      documents: updatedDocuments,
      document_passed: state?.documentPassed,
    };
  };

  const updateGuestQuery = (payload: PatchGuestPayload) => {
    const reservationId = reservationDetails.reservation.id;
    if (guestId && guest) {
      return api.guests.patch(guestId, {
        ...payload,
        reservation_id: reservationId,
      });
    }
  };

  const updateScanDocumentGuest = async () => {
    await updateGuestQuery(getDocumentGuestPayload());
    refreshReservation();
  };
  const updateBiomatchSelfieGuest = async () => {
    await updateGuestQuery(getBiomatchSelfGuestPayload());
    refreshReservation();
  };

  return {updateScanDocumentGuest, updateBiomatchSelfieGuest};
}

export {useBiomatchUpdateGuest};
