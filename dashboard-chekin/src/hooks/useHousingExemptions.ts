import React from 'react';
import {useQuery} from 'react-query';
import api from '../api';
import {useErrorToast} from '../utils/hooks';
import {HousingExemption, ReservationSource} from '../utils/types';

const INIT_EXEMPTIONS = {
  taxExemption: false,
  bookingPaymentExemption: false,
  depositExemption: false,
};

export type Exemptions = {
  taxExemption: boolean;
  bookingPaymentExemption: boolean;
  depositExemption: boolean;
};

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

function useHousingExemptions(
  sourceName: string | undefined,
  housingId: string | undefined,
) {
  const {
    status: housingExemptionsStatus,
    data: housingExemptions,
    error: housingExemptionsError,
  } = useQuery<HousingExemption>(
    ['housingExemptions', housingId!],
    () => api.housingExemptions.fetchHousingExemptions(housingId!),
    {
      enabled: Boolean(housingId),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(housingExemptionsError, {
    notFoundMessage:
      'Requested housing exemptions could not be found. Please contact support.',
  });

  const exemptions = React.useMemo(() => {
    if (housingExemptionsStatus === 'loading') {
      return {
        taxExemption: true,
        bookingPaymentExemption: true,
        depositExemption: true,
      };
    }

    return getSourceNameExemptions(sourceName, housingExemptions);
  }, [housingExemptions, housingExemptionsStatus, sourceName]);

  return {
    exemptions,
    housingExemptionsStatus,
  };
}

export {useHousingExemptions};
