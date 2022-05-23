import React from 'react';
import {useParams, useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import api from '../../../api';
import {useErrorModal, useIsMounted} from '../../../utils/hooks';
import {INTERNAL_SUPPLIER_OPTION} from '../../../utils/upselling';
import {ALL_HOUSINGS_OPTION} from '../UpsellingHeader/UpsellingHeader';
import {Offer} from '../../../utils/upselling/types';
import {SelectOption} from '../../../utils/types';
import {TabLink} from '../TabLinks/TabLinks';
import {UPSELLING_LINKS} from '../../../utils/links';
import Loader from 'components/common/Loader';
import TabLinks from '../TabLinks';
import {StyledUpsellingSection} from '../UpsellingSections';
import {
  Grid,
  CounterArea,
  FiltersArea,
  ListArea,
  LoaderWrapper,
  StyledOfferItems,
} from './styled';

enum urlFilters {
  all = 'all',
  suppliers = 'external',
  services = 'internal',
}

const filterNames = {
  [urlFilters.all]: '',
  [urlFilters.suppliers]: 'external',
  [urlFilters.services]: 'internal',
};

type Params = {
  filter?: urlFilters;
};

type MyOffersSectionProps = {
  housingFilter: SelectOption | undefined;
};

function MyOffersSection({housingFilter}: MyOffersSectionProps) {
  const {t} = useTranslation();
  const history = useHistory();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const {filter} = useParams<Params>();
  const {displayError} = useErrorModal();

  const supplierFilter = filter && filterNames[filter];
  const housingIdFilter =
    housingFilter?.value && housingFilter.value !== ALL_HOUSINGS_OPTION.value
      ? housingFilter.value
      : '';
  const hasHousingFilter = Boolean(housingIdFilter);
  const offersQueryKey = api.upselling.ENDPOINTS.offers(
    `supplier=${supplierFilter}&housing_id=${housingIdFilter}`,
  );

  const {data: offers, isLoading: isLoadingOffers} = useQuery<Offer[]>(offersQueryKey, {
    enabled: Boolean(filter),
    onError: (error: any) => {
      if (error && isMounted.current) {
        displayError(error);
      }
    },
  });

  const {data: offersIdsWithoutDeals} = useQuery<string[]>(
    api.upselling.ENDPOINTS.offersWithoutDeals(),
    {
      onError: (error: any) => {
        if (error && isMounted.current) {
          displayError(error);
        }
      },
    },
  );

  const handleMutationSettled = (prevOffer: Offer | undefined) => {
    const isInternalSupplier = prevOffer?.supplier === INTERNAL_SUPPLIER_OPTION.value;
    const supplierFilter = isInternalSupplier
      ? filterNames[urlFilters.services]
      : filterNames[urlFilters.suppliers];

    if (filter === urlFilters.all) {
      queryClient.refetchQueries(
        api.upselling.ENDPOINTS.offers(
          `supplier=${supplierFilter}&housing_id=${housingIdFilter}`,
        ),
      );
    } else {
      queryClient.refetchQueries(
        api.upselling.ENDPOINTS.offers(`supplier=&housing_id=${housingIdFilter}`),
      );
    }

    if (housingIdFilter) {
      queryClient.refetchQueries(
        api.upselling.ENDPOINTS.offers(`supplier=${supplierFilter}&housing_id=`),
      );
      queryClient.refetchQueries(api.upselling.ENDPOINTS.offers(`supplier=&housing_id=`));
    }

    queryClient.invalidateQueries(offersQueryKey);
  };

  const deleteOfferMutation = useMutation<
    undefined,
    any,
    {id: string},
    {prevOffers: Offer[]}
  >(({id}) => api.upselling.deleteOfferMutation(id), {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(offersQueryKey);
      const prevOffers = queryClient.getQueryData<Offer[]>(offersQueryKey);
      const optimisticOffers = prevOffers?.filter((supplier) => {
        return supplier.id !== payload.id;
      });

      queryClient.setQueryData(offersQueryKey, optimisticOffers);

      return {prevOffers: prevOffers || []};
    },
    onError: (error, payload, context) => {
      if (!isMounted.current) {
        return;
      }

      queryClient.setQueryData(offersQueryKey, context?.prevOffers);
      displayError(error);
    },
    onSuccess: (_, payload) => {
      queryClient.removeQueries(api.upselling.ENDPOINTS.oneOffer(payload.id));
    },
    onSettled: (_, __, payload, context) => {
      queryClient.invalidateQueries(offersQueryKey);
    },
  });

  const offerUpdateMutation = useMutation<
    Offer,
    any,
    Partial<Omit<Offer, 'id'>> & Pick<Offer, 'id'>,
    {prevOffers: Offer[]}
  >((payload) => api.upselling.updateOfferMutation(payload), {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(offersQueryKey);
      const prevOffers = queryClient.getQueryData<Offer[]>(offersQueryKey);
      const optimisticOffers = prevOffers ? [...prevOffers] : [];
      const updatedOfferIndex = optimisticOffers?.findIndex((offer) => {
        return offer.id === payload.id;
      });

      if (
        updatedOfferIndex !== undefined &&
        updatedOfferIndex !== -1 &&
        optimisticOffers?.length
      ) {
        const optimisticOffer = {...optimisticOffers[updatedOfferIndex], ...payload};
        optimisticOffers?.splice(updatedOfferIndex, 1, optimisticOffer);
      }

      queryClient.setQueryData(offersQueryKey, optimisticOffers);
      return {prevOffers: prevOffers || []};
    },
    onError: (error, payload, context) => {
      if (!isMounted.current) {
        return;
      }

      if (context?.prevOffers) {
        queryClient.setQueryData(offersQueryKey, context?.prevOffers);
      }
      displayError(error);
    },
    onSuccess: (offer) => {
      queryClient.setQueryData<Offer>(api.upselling.ENDPOINTS.oneOffer(offer.id), offer);
    },
    onSettled: (_, __, payload, context) => {
      const prevOffer = payload?.id ? context?.prevOffers[Number(payload.id)] : undefined;
      handleMutationSettled(prevOffer);
    },
  });

  const filtersLinks: TabLink[] = [
    {
      to: `${UPSELLING_LINKS.offersList}/${urlFilters.all}`,
      name: t('all'),
    },
    {
      to: `${UPSELLING_LINKS.offersList}/${urlFilters.suppliers}`,
      name: t('suppliers_deals'),
    },
    {
      to: `${UPSELLING_LINKS.offersList}/${urlFilters.services}`,
      name: t('internal_services'),
    },
  ];

  React.useLayoutEffect(
    function keepAnyFilter() {
      const isUnknownFilter = filter && !Object.values(urlFilters).includes(filter);

      if (!filter || isUnknownFilter) {
        history.replace(`${UPSELLING_LINKS.offersList}/${urlFilters.all}`);
      }
    },
    [filter, history],
  );

  const getOffersCounterText = () => {
    const offersLength = offers?.length;

    if (isLoadingOffers) {
      return '';
    }

    if (!offersLength) {
      if (hasHousingFilter) {
        return t('you_have_no_deals_for_housing', {housing: housingFilter!.label});
      }

      return t('you_have_no_deals');
    }

    if (offersLength === 1) {
      return t('you_have_one_deal');
    }

    return t('you_have_number_deals', {number: offersLength});
  };

  return (
    <StyledUpsellingSection>
      <Grid>
        <CounterArea blue={hasHousingFilter}>{getOffersCounterText()}</CounterArea>
        <FiltersArea>
          <TabLinks links={filtersLinks} />
        </FiltersArea>
        {isLoadingOffers && (
          <LoaderWrapper>
            <Loader label={t('loading')} />
          </LoaderWrapper>
        )}
        {!isLoadingOffers && (
          <ListArea>
            {offers && (
              <StyledOfferItems
                getIsOfferActive={(offer) => offer.is_active}
                getIsOfferDeletable={(offer) =>
                  offersIdsWithoutDeals?.includes(offer.id) || false
                }
                offers={offers}
                deleteOfferMutation={deleteOfferMutation.mutate}
                offerUpdateMutation={({offer, nextIsActive}) =>
                  offerUpdateMutation.mutate({id: offer.id, is_active: nextIsActive})
                }
              />
            )}
          </ListArea>
        )}
      </Grid>
    </StyledUpsellingSection>
  );
}

export {MyOffersSection};
