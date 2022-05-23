import {ComputedReservationDetailsContextProps} from '../context/computedReservationDetails';
import {PATHS} from '../Routes';

type FinishURLProps = {
  reservationDetails: ComputedReservationDetailsContextProps;
  locationState?: any;
  skip?: {
    hasUpselling: boolean;
  };
};

function getFinishCheckinHistoryArgs({
  reservationDetails,
  locationState,
  skip,
}: FinishURLProps) {
  if (!skip?.hasUpselling && reservationDetails.hasUpselling) {
    return {
      url: '/deals-list',
      state: locationState,
    };
  }

  if (reservationDetails.hasTaxes) {
    return {
      url: PATHS.taxesSetup,
      state: locationState,
    };
  }

  if (reservationDetails.isSomePayments) {
    return {
      url: PATHS.payments,
      state: locationState,
    };
  }

  if (reservationDetails.hasDeposits) {
    return {
      url: '/deposits/payment',
      state: locationState,
    };
  }

  return {
    url: '/finish',
    state: locationState,
  };
}

export {getFinishCheckinHistoryArgs};
