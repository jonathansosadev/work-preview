import React from 'react';
import useSWR from 'swr';
import api, {getURL} from '../api';
import {useReservation} from './reservation';
import {
  checkHasScanDocument,
  checkHasSelfieIdentity,
  getHasGuestMembers,
  getHousingCountryCode,
  getMembers,
} from '../utils/reservation';
import {HOUSING_VERIFICATION_TYPE} from '../utils/types';
import {COUNTRY_CODES, SECURITY_DEPOSIT_STATUSES} from '../utils/constants';
import {usePaymentSettings} from '../hooks/usePaymentSettings';

type ReservationSource = {id: string; name: string};

type HousingExemption = {
  id: string;
  tax_exempt_sources_nested: ReservationSource[];
  booking_exempt_sources_nested: ReservationSource[];
  deposit_exempt_sources_nested: ReservationSource[];
  extra_service_exempt_sources_nested: ReservationSource[];
};

const INIT_EXEMPTIONS = {
  taxExemption: false,
  bookingPaymentExemption: false,
  depositExemption: false,
};

const upsellingActivatedStatus = 'ACTIVE';

function getSourceNameExemptions(sourceName = '', exemptions?: HousingExemption) {
  const result = {...INIT_EXEMPTIONS};

  if (!exemptions) {
    return result;
  }

  const findExemption = (source: ReservationSource) => {
    return source.name === sourceName;
  };

  result.taxExemption = Boolean(exemptions.tax_exempt_sources_nested.find(findExemption));
  result.bookingPaymentExemption = Boolean(
    exemptions.booking_exempt_sources_nested.find(findExemption),
  );
  result.depositExemption = Boolean(
    exemptions.deposit_exempt_sources_nested.find(findExemption),
  );

  return result;
}

function fetchOffers(housingId: string) {
  if (!housingId) {
    return null;
  }

  return getURL(api.upselling.ENDPOINTS.offers(`housing_id=${housingId}&is_active=true`));
}

function fetchCustomFormIdIfRequired(housingId: string, userId = '') {
  if (!housingId) {
    return null;
  }

  return getURL(
    api.guestForms.ENDPOINTS.customForm(
      `housing_id=${housingId}&user_id=${userId}&field_set=id`,
    ),
  );
}

export type ComputedReservationDetailsContextProps = {
  hasGuestMembers: boolean;
  isLeaderGuest: boolean;
  isDubaiReservation: boolean;
  isThailandReservation: boolean;
  isUsaReservation: boolean;
  isSelfCheckinEnabled: boolean;
  hasBiomatchForGuestLeader: boolean;
  isGreeceReservation: boolean;
  isDocScanDisabled: boolean;
  hasTaxes: boolean;
  isContractEnabled: boolean;
  hasDeposits: boolean;
  areDepositsRequired: boolean;
  hadGuestMembersBeforeRegistration: boolean;
  reservation: any;
  areGuestFieldsDisabled: boolean;
  shortCustomForm?: {
    id: string;
  };
  isAliceOnboardingEnabled: boolean;
  isSomePayments: boolean;
  hasNewPayment: boolean;
  arePaymentsOptional: boolean;
  isGuestPayingPaymentsFees: boolean;
  isGuestPayingTaxesFees: boolean;
  isBiomatchOnlyForGuestLeader: boolean;
  isBiomatchForAllGuests: boolean;
  areBookingPaymentsActivated: boolean;
  hasUpselling: boolean;
  isVerifyOnlyDocument: boolean;
  isVerifyOnlyDocumentOptional: boolean;
  isVerifyDocumentAndSelfie: boolean;
  isVerifyDocumentAndSelfieOptional: boolean;
  verificationType: boolean;
  hasBiomatch: boolean;
  isPoliceActivated: boolean;
  hasScanDocument: boolean;
  isLoadedAllReservationDetails: boolean;
};

const ComputedReservationDetailsContext = React.createContext<
  ComputedReservationDetailsContextProps
>({
  hasGuestMembers: false,
  hasBiomatch: false,
  isPoliceActivated: false,
  hasScanDocument: false,
  isLeaderGuest: false,
  isDubaiReservation: false,
  isThailandReservation: false,
  isUsaReservation: false,
  isSelfCheckinEnabled: false,
  hasBiomatchForGuestLeader: false,
  isGreeceReservation: false,
  isDocScanDisabled: false,
  hasTaxes: false,
  isContractEnabled: false,
  hasDeposits: false,
  hadGuestMembersBeforeRegistration: false,
  areDepositsRequired: false,
  areGuestFieldsDisabled: false,
  shortCustomForm: {
    id: '',
  },
  isAliceOnboardingEnabled: false,
  reservation: {},
  isSomePayments: false,
  hasNewPayment: false,
  arePaymentsOptional: false,
  isGuestPayingPaymentsFees: false,
  isGuestPayingTaxesFees: false,
  isBiomatchOnlyForGuestLeader: false,
  isBiomatchForAllGuests: false,
  areBookingPaymentsActivated: false,
  hasUpselling: false,
  isVerifyOnlyDocument: false,
  isVerifyOnlyDocumentOptional: false,
  isVerifyDocumentAndSelfie: false,
  isVerifyDocumentAndSelfieOptional: false,
  verificationType: false,
  isLoadedAllReservationDetails: false,
});

function ComputedReservationDetailsProvider(props: any) {
  const {data} = useReservation();
  const {arePaymentSettingsValid} = usePaymentSettings();

  const hasGuestMembers = getHasGuestMembers(data);
  const isLeaderGuest = !hasGuestMembers;
  const isDubaiReservation = getHousingCountryCode(data) === COUNTRY_CODES.uae;
  const isThailandReservation = getHousingCountryCode(data) === COUNTRY_CODES.thailand;
  const isGreeceReservation = getHousingCountryCode(data) === COUNTRY_CODES.greece;
  const isUsaReservation = getHousingCountryCode(data) === COUNTRY_CODES.usa;
  const isPoliceActivated = data?.housing?.is_auto_police_registration_enabled;
  const isSelfCheckinEnabled = Boolean(data?.housing?.is_self_online_check_in_enabled);
  const verificationType = data?.housing?.verification_type as
    | HOUSING_VERIFICATION_TYPE
    | undefined;
  const isDocScanDisabled = !Boolean(data?.housing?.is_checkin_online_doc_scan_enabled);
  const hasBiomatchForGuestLeader = isLeaderGuest && isSelfCheckinEnabled;

  const isBiomatchOnlyForGuestLeader = Boolean(
    isSelfCheckinEnabled && !data?.housing?.is_biometric_match_for_all_enabled,
  );
  const isBiomatchForAllGuests = Boolean(
    isSelfCheckinEnabled && data?.housing?.is_biometric_match_for_all_enabled,
  );

  const isVerifyOnlyDocument =
    isSelfCheckinEnabled &&
    (verificationType === HOUSING_VERIFICATION_TYPE.mandatoryDocumentOnly ||
      verificationType === HOUSING_VERIFICATION_TYPE.optionalDocumentOnly);
  const isVerifyOnlyDocumentOptional =
    isSelfCheckinEnabled &&
    verificationType === HOUSING_VERIFICATION_TYPE.optionalDocumentOnly;

  const isVerifyDocumentAndSelfie =
    isSelfCheckinEnabled &&
    (verificationType === HOUSING_VERIFICATION_TYPE.mandatoryDocumentAndSelfie ||
      verificationType === HOUSING_VERIFICATION_TYPE.optionalDocumentAndSelfie);
  const isVerifyDocumentAndSelfieOptional =
    isSelfCheckinEnabled &&
    verificationType === HOUSING_VERIFICATION_TYPE.optionalDocumentAndSelfie;

  const hasBiomatch = checkHasSelfieIdentity({
    isLeaderGuest,
    isVerifyDocumentAndSelfie,
    isBiomatchForAllGuests,
  });

  const hasScanDocument = checkHasScanDocument({
    isLeaderGuest,
    isVerifyOnlyDocument,
    isBiomatchForAllGuests,
  });

  const isContractEnabled = Boolean(data?.housing?.is_contract_enabled);
  const hadGuestMembersBeforeRegistration = getMembers(data).length > 1;
  const areGuestFieldsDisabled = Boolean(data?.housing?.are_guest_fields_disabled);

  const housingId = data?.housing?.id;
  const {data: housingExemptions} = useSWR<HousingExemption>(
    housingId && getURL(api.housingExemptions.ENDPOINTS.byId(housingId)),
  );

  const exemptions = React.useMemo(() => {
    const sourceName = data?.source_name;
    return getSourceNameExemptions(sourceName, housingExemptions);
  }, [data, housingExemptions]);

  const isLoadedAllReservationDetails = Boolean(
    data?.id && housingId && housingExemptions,
  );

  const hasDeposits = Boolean(
    arePaymentSettingsValid &&
      !exemptions.depositExemption &&
      data?.housing?.security_deposit_status &&
      data?.housing?.security_deposit_status !== SECURITY_DEPOSIT_STATUSES.inactive &&
      data?.security_deposit?.status !== 'CONFIRMED' &&
      data?.security_deposit?.status !== 'RELEASED' &&
      data?.security_deposit_amount !== '0.00',
  );
  const areDepositsRequired =
    arePaymentSettingsValid &&
    !exemptions.depositExemption &&
    data?.housing?.security_deposit_status === SECURITY_DEPOSIT_STATUSES.mandatory;
  const hasTaxes = Boolean(
    arePaymentSettingsValid &&
      housingExemptions &&
      !exemptions.taxExemption &&
      data?.tax_activated &&
      data?.housing?.seasons?.length &&
      !data?.have_taxes_been_paid,
  );
  const isAliceOnboardingEnabled = Boolean(data?.housing?.is_alice_onboarding_enabled);
  const isSomePayments = Boolean(
    !exemptions.bookingPaymentExemption && parseFloat(data?.total_amount_to_pay),
  );
  const isSomeGuestAdded = Boolean(data?.guest_group?.members?.length);
  const hasNewPayment = isSomePayments && isSomeGuestAdded;
  const arePaymentsOptional = data?.housing?.reservation_payments_status === 'OPTIONAL';
  const isGuestPayingPaymentsFees =
    data?.housing?.commission_responsibility_for_booking === 'GUEST';
  const isGuestPayingTaxesFees =
    data?.housing?.commission_responsibility_for_tourist_tax === 'GUEST';

  const {data: shortCustomForms} = useSWR(
    fetchCustomFormIdIfRequired(housingId, data.housing?.manager_id),
  );

  const {data: offers} = useSWR(fetchOffers(housingId));

  const shortCustomForm = shortCustomForms?.[0];
  const areBookingPaymentsActivated =
    data?.housing?.reservation_payments_status !== 'INACTIVE';
  const hasUpselling = Boolean(
    offers?.length > 0 &&
      data.housing?.upselling_payments_status === upsellingActivatedStatus,
  );

  return (
    <ComputedReservationDetailsContext.Provider
      {...props}
      value={{
        verificationType,
        isPoliceActivated,
        isVerifyDocumentAndSelfie,
        isVerifyDocumentAndSelfieOptional,
        isVerifyOnlyDocument,
        isVerifyOnlyDocumentOptional,
        hasBiomatch,
        hasScanDocument,
        areGuestFieldsDisabled,
        hasTaxes,
        isLeaderGuest,
        hasGuestMembers,
        isDubaiReservation,
        isThailandReservation,
        isSelfCheckinEnabled,
        hasBiomatchForGuestLeader,
        isGreeceReservation,
        isUsaReservation,
        isDocScanDisabled,
        isContractEnabled,
        hasDeposits,
        hadGuestMembersBeforeRegistration,
        areDepositsRequired,
        shortCustomForm,
        isAliceOnboardingEnabled,
        reservation: data,
        isSomePayments,
        hasNewPayment,
        arePaymentsOptional,
        isGuestPayingPaymentsFees,
        isGuestPayingTaxesFees,
        isBiomatchOnlyForGuestLeader,
        isBiomatchForAllGuests,
        areBookingPaymentsActivated,
        hasUpselling,
        isLoadedAllReservationDetails,
      }}
    />
  );
}

function useComputedReservationDetails() {
  const context = React.useContext(ComputedReservationDetailsContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}

export {
  ComputedReservationDetailsContext,
  ComputedReservationDetailsProvider,
  useComputedReservationDetails,
};
