import useSWR from 'swr';
import api, {getURL} from '../../api';
import {useIsMounted} from '../../utils/hooks';
import {Offer, Supplier} from '../../utils/upselling/types';
import {CATEGORIES_WITH_ADDRESS} from '../OfferDetailsScreen';

function fetchSupplierIfCanFetch(offer: Offer | undefined) {
  const supplierId = offer?.supplier;
  const category = offer?.category;
  const canHaveAddress =
    category && supplierId && CATEGORIES_WITH_ADDRESS.includes(category);

  if (canHaveAddress) {
    return getURL(api.upselling.ENDPOINTS.oneSupplier(supplierId!));
  }

  return null;
}

function useOfferAndSupplier(
  offerId: string,
  {
    onError,
  }: {
    onError: (error: any) => void;
  },
) {
  const isMounted = useIsMounted();
  const {data: offer, isValidating: isLoadingOffer} = useSWR<Offer>(
    offerId ? getURL(api.upselling.ENDPOINTS.oneOffer(offerId)) : null,
    {
      onError: error => {
        if (isMounted.current) {
          onError(error);
        }
      },
    },
  );

  const {data: supplier, isValidating: isLoadingSupplier} = useSWR<Supplier>(
    fetchSupplierIfCanFetch(offer),
  );

  const isLoadingOfferOrSupplier =
    (!offer && isLoadingOffer) || (!supplier && isLoadingSupplier);

  return {
    offer,
    supplier,
    isLoadingOfferOrSupplier,
  };
}

export {useOfferAndSupplier};
