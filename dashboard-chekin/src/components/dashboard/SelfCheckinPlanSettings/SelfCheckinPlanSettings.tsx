import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useQueryClient, useQuery} from 'react-query';
import api, {queryFetcher} from '../../../api';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import {Plan, PlanTotalPrice, SelectOption, ShortHousing} from '../../../utils/types';
import {getSubscriptionInterval, getSubscriptionPlan} from '../../../utils/subscription';
import {CURRENCIES, SUBSCRIPTION_PRODUCT_TYPES} from '../../../utils/constants';
import {useSubscription} from '../../../context/subscription';
import cancelCalendarIcon from '../../../assets/cancel-calendar.svg';
import plusIcon from '../../../assets/plus-blue.svg';
import closeIcon from '../../../assets/close-blue.svg';
import {ACCOUNT_LINKS} from '../AccountSections';
import SearchHousingsModal from '../SearchHousingsModal';
import Loader from '../../common/Loader';
import FormHeader from '../FormHeader';
import {ContentWrapper} from '../../../styled/common';
import {
  AddButton,
  CancelFeatureButton,
  CloseButton,
  ConnectedHousing,
  ConnectedPropertiesSection,
  Content,
  Header,
  LoaderWrapper,
  MainLoaderWrapper,
  PriceAmount,
  PriceAside,
  PriceDetails,
} from './styled';
import {useComputedDetails} from '../../../context/computedDetails';

type HousingOption = SelectOption & {
  data: ShortHousing;
};

function fetchSelfCheckinPlan(
  subscriptionType: string,
  subscriptionInterval: string,
  currency: CURRENCIES,
) {
  const params = `type=${subscriptionType}&interval=${subscriptionInterval}&product=${SUBSCRIPTION_PRODUCT_TYPES.selfCheckin}&currency=${currency}`;
  return queryFetcher(api.payments.ENDPOINTS.plans(params));
}

function fetchConnectedHousings() {
  return queryFetcher(
    api.housings.ENDPOINTS.all(
      'ordering=name&fields=id,name&is_self_online_check_in_enabled=true',
    ),
  );
}

function fetchSelfCheckinPrice(planId: string, quantity = 0) {
  return queryFetcher(
    api.payments.ENDPOINTS.planTotalPrice(planId, `quantity=${quantity}`),
  );
}

function SelfCheckinPlanSettings() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const isMounted = useIsMounted();
  const {currency, currencyLabel} = useComputedDetails();
  const {
    subscription,
    isSelfCheckinActive,
    isLoading: isLoadingSubscription,
  } = useSubscription();
  const {isHotelSubscription, refreshSubscription} = useSubscription();
  const {displayError, ErrorModal} = useErrorModal();
  const {
    isOpen: isSearchHousingsModalOpen,
    closeModal: closeSearchHousingsModal,
    openModal: openSearchHousingsModal,
  } = useModalControls(false);
  const {
    isLoading: isDeactivatingSelfCheckin,
    setStatus: setDeactivatingSelfCheckinStatus,
  } = useStatus();

  const [queuedConnectionHousings, setQueuedConnectionsHousings] = React.useState<
    HousingOption[]
  >([]);
  const [loadingHousingsIds, setLoadingHousingsIds] = React.useState<string[]>([]);
  const [isPriceLoaded, setIsPriceLoaded] = React.useState(false);

  const subscriptionType = subscription?.type;
  const subscriptionInterval = getSubscriptionInterval(subscription);
  const {
    data: selfCheckinPlan,
    error: selfCheckinPlanError,
    status: selfCheckinPlanStatus,
  } = useQuery<Plan, [string, string, string, CURRENCIES]>(
    ['selfCheckInPlan', subscriptionType, subscriptionInterval],
    () => fetchSelfCheckinPlan(subscriptionType!, subscriptionInterval!, currency),
    {
      enabled: Boolean(
        !isSelfCheckinActive && subscriptionType && subscriptionInterval && currency,
      ),
    },
  );
  useErrorToast(selfCheckinPlanError, {
    notFoundMessage: 'Self-checkin plan could not be found. Please contact support.',
  });

  const selfCheckinQuantity = subscription?.current_accommodations_qty?.SELF_CHECKIN || 0;
  const activeSelfCheckinPlanId = getSubscriptionPlan(
    subscription,
    SUBSCRIPTION_PRODUCT_TYPES.selfCheckin,
  );
  const selfCheckinPlanId = isSelfCheckinActive
    ? activeSelfCheckinPlanId
    : selfCheckinPlan?.unique_id;

  const {
    data: planTotalPrice,
    error: planTotalPriceError,
    status: planTotalPriceStatus,
    refetch: refetchPlanTotalPrice,
  } = useQuery<PlanTotalPrice, [string, string, number]>(
    ['selfCheckinPrice', selfCheckinPlanId, selfCheckinQuantity],
    () => fetchSelfCheckinPrice(selfCheckinPlanId!, selfCheckinQuantity),
    {
      enabled: Boolean(selfCheckinPlanId),
    },
  );
  useErrorToast(planTotalPriceError, {
    notFoundMessage: 'Requested plan price could not be found. Please contact support',
  });

  const {
    data: initConnectedHousings,
    error: initConnectedHousingsError,
    status: initConnectedHousingsStatus,
    refetch: refetchInitConnectedHousings,
  } = useQuery<ShortHousing[], string>(
    'selfCheckInShortHousings',
    fetchConnectedHousings,
  );
  useErrorToast(initConnectedHousingsError, {
    notFoundMessage: 'Requested properties could not be found. Please contact support.',
  });

  const isLoading =
    (!isPriceLoaded && planTotalPriceStatus === 'loading') ||
    isDeactivatingSelfCheckin ||
    (!subscription && isLoadingSubscription) ||
    ((!initConnectedHousings || !selfCheckinPlan) &&
      (initConnectedHousingsStatus === 'loading' || selfCheckinPlanStatus === 'loading'));
  const accommodationsNumber =
    subscription?.current_accommodations_qty?.SELF_CHECKIN || 0;

  React.useEffect(() => {
    if (planTotalPrice) {
      setIsPriceLoaded(true);
    }
  }, [planTotalPrice]);

  React.useEffect(() => {
    if (!isLoadingSubscription && !isSelfCheckinActive) {
      history.push(ACCOUNT_LINKS.billing);
    }
  }, [history, isLoadingSubscription, isSelfCheckinActive]);

  const startHousingLoading = (id: string) => {
    return setLoadingHousingsIds((prevState) => {
      return [...prevState, id];
    });
  };
  const stopHousingLoading = (id: string) => {
    setLoadingHousingsIds((prevState) => {
      return prevState.filter((housingId) => housingId !== id);
    });
  };

  const setHousingConnectionState = React.useCallback(
    async (id: string, state: boolean) => {
      const {error} = await api.housings.patchById(id, {
        is_self_online_check_in_enabled: state,
      });

      if (!isMounted.current) {
        return;
      }
      if (error) {
        displayError(error);
        return error;
      }
    },
    [displayError, isMounted],
  );

  const handleConnectedHousingSubmit = React.useCallback(
    async (housing: SelectOption) => {
      const housingId = housing.value;

      startHousingLoading(housingId);
      setQueuedConnectionsHousings((prevState) => {
        return [...prevState, housing as HousingOption];
      });

      const error = await setHousingConnectionState(housingId, true);
      if (!error) {
        await refreshSubscription();
        await refetchInitConnectedHousings();
        setQueuedConnectionsHousings((prevState) => {
          return prevState.filter((h) => h.value !== housing.value);
        });
        await refetchPlanTotalPrice();
      }

      stopHousingLoading(housingId);
    },
    [
      setHousingConnectionState,
      refreshSubscription,
      refetchInitConnectedHousings,
      refetchPlanTotalPrice,
    ],
  );

  const handleConnectedHousingRemove = async (housing: ShortHousing) => {
    const housingId = housing.id;

    startHousingLoading(housingId);
    const error = await setHousingConnectionState(housingId, false);
    if (!error) {
      await refreshSubscription();
      await refetchInitConnectedHousings();
      await refetchPlanTotalPrice();
    }
    stopHousingLoading(housingId);
  };

  const deactivateSelfCheckin = async () => {
    setDeactivatingSelfCheckinStatus('loading');
    const {error} = await api.housings.deactivateSelfCheckin();

    if (!isMounted.current) {
      return;
    }

    await refreshSubscription();
    await refetchInitConnectedHousings();
    await refetchPlanTotalPrice();
    await queryClient.refetchQueries('housings');
    setDeactivatingSelfCheckinStatus('idle');

    if (error) {
      displayError(error);
      return;
    }
    history.push(ACCOUNT_LINKS.billing);
  };

  const getPlanTotalPrice = () => {
    if (planTotalPriceStatus === 'loading') {
      return <Loader height={30} width={30} />;
    }

    return `${planTotalPrice?.price || '0.00'} ${currencyLabel}`;
  };

  return (
    <>
      <ContentWrapper>
        <FormHeader
          isBackDisabled={Boolean(isDeactivatingSelfCheckin || loadingHousingsIds.length)}
          linkToBack={ACCOUNT_LINKS.billing}
          title={t('self_checkin_plan')}
          action={
            <CancelFeatureButton
              secondary
              disabled={Boolean(isLoading || loadingHousingsIds.length)}
              blinking={isDeactivatingSelfCheckin}
              onClick={deactivateSelfCheckin}
              label={
                <>
                  <img src={cancelCalendarIcon} alt="Red calendar" />
                  {t('cancel_feature')}
                </>
              }
            />
          }
        />
        {isLoading ? (
          <MainLoaderWrapper>
            <Loader label={t('loading')} height={45} width={45} />
          </MainLoaderWrapper>
        ) : (
          <div>
            <Header>{t('current_plan')}</Header>
            <Content>
              <ConnectedPropertiesSection>
                <div>
                  <header>{t('connected_properties')}</header>
                </div>
                <div>
                  {initConnectedHousings?.map((housing) => {
                    return (
                      <ConnectedHousing key={housing.id}>
                        <div>{housing.name}</div>
                        {loadingHousingsIds.includes(housing.id) ? (
                          <LoaderWrapper>
                            <Loader height={17} width={17} />
                          </LoaderWrapper>
                        ) : (
                          <CloseButton
                            onClick={() => handleConnectedHousingRemove(housing)}
                          >
                            <img src={closeIcon} alt="Close" />
                          </CloseButton>
                        )}
                      </ConnectedHousing>
                    );
                  })}
                  {queuedConnectionHousings?.map((housing) => {
                    return (
                      <ConnectedHousing key={housing.value}>
                        <div>{housing.label}</div>
                        {loadingHousingsIds.includes(housing.value) ? (
                          <LoaderWrapper>
                            <Loader height={17} width={17} />
                          </LoaderWrapper>
                        ) : (
                          <CloseButton
                            onClick={() =>
                              handleConnectedHousingRemove(
                                (housing as unknown) as ShortHousing,
                              )
                            }
                          >
                            <img src={closeIcon} alt="Close" />
                          </CloseButton>
                        )}
                      </ConnectedHousing>
                    );
                  })}
                </div>
                <AddButton onClick={openSearchHousingsModal}>
                  <img src={plusIcon} alt="Plus" />
                  {t('add_property')}
                </AddButton>
              </ConnectedPropertiesSection>
              <PriceAside>
                <div>
                  <header>{t('price')}:</header>
                  <PriceAmount>{getPlanTotalPrice()}</PriceAmount>
                  <PriceDetails>
                    {t('month_per')} {!isLoading && accommodationsNumber}{' '}
                    {isHotelSubscription ? t('rooms') : t('properties').toLowerCase()}.
                  </PriceDetails>
                </div>
              </PriceAside>
            </Content>
          </div>
        )}
      </ContentWrapper>
      <SearchHousingsModal
        strictOptions
        extraParams="is_self_online_check_in_enabled=false"
        open={isSearchHousingsModalOpen}
        onClose={closeSearchHousingsModal}
        onSubmit={handleConnectedHousingSubmit}
        submitButtonText={t('connect')}
      />
      <ErrorModal />
    </>
  );
}

export {SelfCheckinPlanSettings};
