import React from 'react';
import useSWR from 'swr';
import api, {getURL} from '../api';
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
  const {isValidating: housingExemptionsLoading, data: housingExemptions} = useSWR<
    HousingExemption
  >(() =>
    Boolean(housingId) ? getURL(api.housingExemptions.ENDPOINTS.byId(housingId!)) : null,
  );

  const exemptions = React.useMemo(() => {
    if (housingExemptionsLoading) {
      return {
        taxExemption: true,
        bookingPaymentExemption: true,
        depositExemption: true,
      };
    }

    return getSourceNameExemptions(sourceName, housingExemptions);
  }, [housingExemptions, housingExemptionsLoading, sourceName]);

  return {
    exemptions,
    housingExemptionsLoading,
  };
}

export {useHousingExemptions};
