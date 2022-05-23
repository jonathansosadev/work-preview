import {useHistory} from 'react-router-dom';
import api from '../../api';
import {PATHS} from '../../Routes';
import {getFinishCheckinHistoryArgs} from '../../utils/checkin';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import {useIsMounted, useStatus} from '../../utils/hooks';
import {useReservation} from '../../context/reservation';
import {Deal} from '../../utils/upselling/types';

export type CartDeal = Pick<
  Deal,
  | 'core_guest_id'
  | 'core_housing_id'
  | 'core_housing_name'
  | 'core_guest_name'
  | 'core_reservation_id'
  | 'offer_id'
  | 'status'
  | 'quantity'
  | 'requested_items'
> &
  Partial<Pick<Deal, 'guest_email' | 'number_of_people' | 'requested_for'>> & {
    offerName?: string;
  };
const cartStorageName = 'upsellingCart';
const createdOnBackendCartStorageName = 'upsellingCreatedCart';

function getStoredCartDeals(): {[key: string]: CartDeal} {
  const items = sessionStorage.getItem(cartStorageName);

  if (!items) {
    return {};
  }
  return JSON.parse(items);
}
function getAlreadyCreatedOnBackendCartDeals(): {[key: string]: CartDeal} {
  const items = sessionStorage.getItem(createdOnBackendCartStorageName);

  if (!items) {
    return {};
  }
  return JSON.parse(items);
}

function setCartDealToStorage(item: CartDeal) {
  const prevDeals = getStoredCartDeals();
  const nextDeals = {
    ...prevDeals,
    [item.offer_id]: item,
  };

  sessionStorage.setItem(cartStorageName, JSON.stringify(nextDeals));
}

function getStoredAndCreatedCartDeals() {
  return {...getStoredCartDeals(), ...getAlreadyCreatedOnBackendCartDeals()};
}

function moveCartDealsToCreated() {
  sessionStorage.setItem(
    createdOnBackendCartStorageName,
    JSON.stringify(getStoredAndCreatedCartDeals()),
  );
}

function deleteCartDealFromStorage(dealId: string) {
  const created = getAlreadyCreatedOnBackendCartDeals();
  const stored = getStoredCartDeals();

  const nextCreated = {...created};
  const nextStored = {...stored};

  delete nextCreated[dealId];
  delete nextStored[dealId];
  sessionStorage.setItem(cartStorageName, JSON.stringify(nextStored));
  sessionStorage.setItem(createdOnBackendCartStorageName, JSON.stringify(nextCreated));
}

function clearCartDeals() {
  sessionStorage.removeItem(cartStorageName);
}

function useCartDeals({onError}: {onError: (error: any) => void}) {
  const history = useHistory();
  const isMounted = useIsMounted();
  const reservationDetails = useComputedReservationDetails();
  const {isLoading, setStatus} = useStatus();
  const {refreshReservation} = useReservation();

  const storedCartDeals = getStoredAndCreatedCartDeals();

  const goNextAfterUpselling = (dealsCreated = false) => {
    if (reservationDetails.hasTaxes) {
      history.push(PATHS.taxesSetup);
      return;
    }

    if (dealsCreated) {
      history.push(PATHS.payments);
      return;
    }

    const args = getFinishCheckinHistoryArgs({
      reservationDetails,
      skip: {
        hasUpselling: true,
      },
    });

    history.push(args.url, args.state);
  };

  const getCartDealsPayload = () => {
    const cartDeals = getStoredCartDeals();
    const deals = Object.values(cartDeals).map(deal => {
      return {
        ...deal,
        offerName: undefined,
      };
    });

    return {deals};
  };

  const getCartDealsCreationErrorMessages = (
    errors: ({offer_id: string; message: string} | '')[],
  ) => {
    if (!errors) return [];
    const cartDeals = getStoredCartDeals();

    return errors
      .map(singleError => {
        if (!singleError) {
          return singleError;
        }

        const offerName = cartDeals[singleError?.offer_id]?.offerName;
        return `${offerName}: ${singleError.message}`;
      })
      .filter(singleError => Boolean(singleError));
  };

  const createCartDeals = async () => {
    const payload = getCartDealsPayload();
    if (!payload?.deals?.length) return;
    setStatus('loading');
    const {error} = await api.upselling.bulkCreateDeals(payload);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      const errorMessages = error.message
        ? [error.message]
        : getCartDealsCreationErrorMessages([error]);
      onError(errorMessages);

      setStatus('idle');
      return error;
    }

    await refreshReservation();
    moveCartDealsToCreated();
    clearCartDeals();
    setStatus('idle');
  };

  return {
    storedCartDeals,
    setCartDealToStorage,
    deleteCartDealFromStorage,
    clearCartDeals,
    createCartDeals,
    goNextAfterUpselling,
    isCreatingCartDeals: isLoading,
  };
}

export {useCartDeals};
