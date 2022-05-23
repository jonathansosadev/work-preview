import React from 'react';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import api from '../../../api';
import {Housing} from '../../../utils/types';
import {Offer} from '../../../utils/upselling/types';
import {COUNTRY_CODES, UPSELLING_PAYMENTS_STATUS} from '../../../utils/constants';
import {checkTemplateIsWaivo} from '../../../utils/upselling';
import {useErrorModal, useIsMounted} from '../../../utils/hooks';
import Section from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import OffersItems from '../OffersItems';
import Loader from '../../common/Loader';
import {LoaderWrapper} from '../MyOffersSection/styled';
import {OffersContainer, ConnectedSection} from './styled';

export type UpsellingSectionRefType = {
  active: boolean;
};

type Params = {
  id: string;
};

function filterOffersByCountry(offers: Offer[], country: string) {
  switch (country) {
    case COUNTRY_CODES.us: {
      return offers;
    }
    default:
      return offers.filter((singleOffer) => !checkTemplateIsWaivo(singleOffer.template));
  }
}

type HousingUpsellingSectionProps = {
  disabled: boolean;
  setIsSectionTouched: (isTouched: boolean) => void;
  country: string;
  housing?: Housing;
  handlePaymentSectionToggle?: (isSectionActive: boolean) => boolean;
};

const HousingUpsellingSection = React.forwardRef<
  UpsellingSectionRefType,
  HousingUpsellingSectionProps
>(
  (
    {disabled, housing, setIsSectionTouched, handlePaymentSectionToggle, country},
    ref,
  ) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const isMounted = useIsMounted();
    const {displayError} = useErrorModal();
    const params = useParams<Params>();
    const openedHousingId = params?.id;

    const sectionInitActiveState =
      housing?.upselling_payments_status === UPSELLING_PAYMENTS_STATUS.active;
    const {
      isSectionActive,
      toggleIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(sectionInitActiveState, {
      canToggle: handlePaymentSectionToggle,
    });

    React.useEffect(() => {
      setIsSectionTouched(isSectionActiveTouched);
    }, [isSectionActiveTouched, setIsSectionTouched]);

    React.useImperativeHandle(ref, () => {
      return {
        active: isSectionActive,
      };
    });

    const offersQueryKey = api.upselling.ENDPOINTS.offers();
    const {data: offers, isLoading: isLoadingOffers} = useQuery<Offer[], Error>(
    offersQueryKey,
      {enabled: Boolean(housing?.id),
      onError: (error: Error) => {
        if (error && isMounted.current) {
          displayError(error);
        }
      },
    },);
    const filteredOffers = React.useMemo(() => {
      if (!offers) return offers;
      return filterOffersByCountry(offers, country);
    }, [country, offers]);

    const offerUpdateMutation = useMutation<
      Offer,
      unknown,
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
        if (!isMounted.current) return;

        if (context?.prevOffers) {
          queryClient.setQueryData(offersQueryKey, context?.prevOffers);
        }
        displayError(error);
      },
      onSuccess: (offer) => {
        queryClient.setQueryData<Offer>(
          api.upselling.ENDPOINTS.oneOffer(offer.id),
          offer,
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(offersQueryKey);
      },
    });

    const unlinkOfferFromHousing = ({
      offer,
      nextIsActive,
    }: {
      offer: Offer;
      nextIsActive: boolean;
    }) => {
      const nextHousingIds = nextIsActive
        ? [...offer?.housings_ids, openedHousingId]
        : offer?.housings_ids.filter((id) => {
            return id !== openedHousingId;
          });

      offerUpdateMutation.mutate({
        id: offer.id,
        housings_ids: nextHousingIds,
      });
    };

    const getIsOfferActive = (offer: Offer) => {
      return offer.is_active && offer.housings_ids.includes(openedHousingId);
    };

    const isEditingHousing = Boolean(housing);
    const isOffersSectionVisible = isEditingHousing && isSectionActive;

    return (
      <>
        <Section
          title={<div>{t('upselling')}</div>}
          subtitle={t('property_details_deals_subtitle')}
        >
          <div>
            <Switch
              checked={isSectionActive}
              onChange={toggleIsSectionActive}
              label={t('activate_upselling_property_details')}
              disabled={disabled}
            />
          </div>
          {isOffersSectionVisible && (
            <ConnectedSection
              title={t('deals_and_experiences')}
              subtitle={t('deals_and_experiences_subtitle')}
            >
              {isLoadingOffers && (
                <LoaderWrapper>
                  <Loader label={t('loading')} />
                </LoaderWrapper>
              )}
              {!isLoadingOffers && (
                <OffersContainer>
                  {filteredOffers && (
                    <OffersItems
                      deletionModal={{
                        title: t('remove_property_from_deal_question'),
                        text: t('remove_property_from_deal_description'),
                        deleteButtonLabel: t('remove'),
                      }}
                      offers={filteredOffers}
                      getIsOfferActive={getIsOfferActive}
                      offerUpdateMutation={unlinkOfferFromHousing}
                    />
                  )}
                </OffersContainer>
              )}
            </ConnectedSection>
          )}
        </Section>
      </>
    );
  },
);

export {HousingUpsellingSection};
