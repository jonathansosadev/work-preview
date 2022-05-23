import React from 'react';
import {useLocation} from 'react-router-dom';
import {useReservation} from '../context/reservation';
import {useComputedReservationDetails} from '../context/computedReservationDetails';
import {AliceReport} from '../components/AliceOnboardingForm/AliceOnboardingForm';
import {Guest, Reservation} from '../utils/types';
import {
  AdditionalGuestDataTypes,
  buildCustomFields,
  buildGuest,
  getHasSomeCustomFields,
  setStoredGuestId,
} from '../utils/guests';
import api from '../api';

async function createGuest(formData: any, guestData: AdditionalGuestDataTypes) {
  const payload = await buildGuest(formData, guestData);
  return api.guests.post(payload);
}

type UpdateFaceComparing = {
  guestData: Guest;
  reservation: Reservation;
  locationState: LocationTypes;
};
async function updateBiomatchData({
  guestData,
  reservation,
  locationState,
}: UpdateFaceComparing) {
  const id = locationState?.facesComparingResult?.id;
  const payload = {
    guest_name: guestData.full_name,
    reservation_creation_date: reservation.created_at,
  };
  return api.ocr.updateFacesComparing(id, payload);
}

async function saveCustomFields(formId: string, guestId: string, formData: any) {
  const customFieldsPayload = await buildCustomFields(formData);
  const payload = {
    data: customFieldsPayload,
    guest_id: guestId,
    form_id: formId,
  };

  return api.guestForms.createFields(payload);
}

type LocationTypes = {
  formData?: any;
  front_side_scan?: string;
  back_side_scan?: string;
  number_of_guests?: number;
  children?: number;
  ocrWasUsed?: boolean;
  customFormId?: string;
  signature?: string;
  aliceReport?: AliceReport;
  documentPassed: boolean;
  facesComparingResult: {id: string};
  biomatch?: {
    biomatch_passed: boolean;
    biomatch_doc: string;
    biomatch_selfie: string;
  };
};

function useRegisterGuest() {
  const location = useLocation<LocationTypes>();
  const {shortCustomForm, isVerifyDocumentAndSelfie} = useComputedReservationDetails();
  const {data: reservation} = useReservation();

  const getResultFormData = React.useCallback(
    (formData: any) => {
      return {
        ...location.state?.formData,
        ...formData,
      };
    },
    [location.state],
  );

  const getResultGuestData = React.useCallback(
    (guestData: AdditionalGuestDataTypes): AdditionalGuestDataTypes => {
      return {
        reservation,
        front_side_scan: location.state?.front_side_scan,
        back_side_scan: location.state?.back_side_scan,
        ocr_was_used: location.state?.ocrWasUsed,
        customFormId: location.state?.customFormId,
        signature: location.state?.signature,
        aliceReport: location.state?.aliceReport,
        document_passed: location.state?.documentPassed,
        ...location.state?.biomatch,
        ...guestData,
      };
    },
    [location.state, reservation],
  );

  const registerGuest = React.useCallback(
    async ({
      formData = {},
      guestData = {},
    }: {
      formData?: any;
      guestData?: AdditionalGuestDataTypes;
    }) => {
      const resultFormData = getResultFormData(formData);
      const resultGuestData = getResultGuestData(guestData);
      const formId = shortCustomForm?.id || '';
      const hasCustomFields = getHasSomeCustomFields(resultFormData) && formId;

      const guestResult = await createGuest(resultFormData, resultGuestData);

      if (!guestResult.error) {
        setStoredGuestId(guestResult.data?.id);
      }

      if (guestResult.data && isVerifyDocumentAndSelfie) {
        await updateBiomatchData({
          locationState: location.state,
          guestData: guestResult?.data,
          reservation,
        });
      }

      if (guestResult.error || !hasCustomFields) {
        return guestResult;
      }

      if (formId) {
        const guestId = guestResult.data?.id;
        const customFieldsResult = await saveCustomFields(
          formId,
          guestId,
          resultFormData,
        );

        if (customFieldsResult.error) {
          return customFieldsResult;
        }
      }

      return guestResult;
    },
    [
      getResultFormData,
      getResultGuestData,
      isVerifyDocumentAndSelfie,
      location.state,
      reservation,
      shortCustomForm,
    ],
  );

  return registerGuest;
}

export {useRegisterGuest};
