import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useLocation} from 'react-router-dom';
import {useQuery} from 'react-query';
import type {Plan, PlanTotalPrice} from '../../../utils/types';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import {ACCOMMODATION_TYPES, PERIODICITY} from '../../../utils/constants';
import {useErrorToast} from '../../../utils/hooks';
import eyeIcon from '../../../assets/eye_blue.svg';
import Loader from '../../common/Loader';
import Modal from '../Modal';
import Button from '../Button';
import {
  ButtonWrapper,
  Content,
  contentStyle,
  HowWeCalcThePriceTrigger,
  LoaderWrapper,
  OpenImageWrapper,
  OpenText,
  PeriodicityPrice,
  PeriodicityPriceLabel,
  PricingPeriodicityPriceTitle,
  PricingPeriodicityTile,
  TilesWrapper,
  Title,
  Trigger,
} from './styled';

const QUERY_CONFIG = {
  cacheTime: 24 * 60 * 1000,
  staleTime: 24 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

function getPlanDetailsQuery(interval = '', type = '') {
  return `interval=${interval}&type=${type}`;
}

function fetchPlan(plan = '', type = '') {
  const planDetailsQuery = getPlanDetailsQuery(plan, type);
  return queryFetcher(api.payments.ENDPOINTS.plans(planDetailsQuery), {
    headers: getAnonymousHeaders(),
  });
}

function fetchPrice(planId: string, quantity = 1) {
  return queryFetcher(
    api.payments.ENDPOINTS.planTotalPrice(planId, `quantity=${quantity}`),
    {
      headers: getAnonymousHeaders(),
    },
  );
}

type LocationState = {
  accommodationType: string;
};

function PricingModal() {
  const {t} = useTranslation();
  const location = useLocation<LocationState>();
  const accommodationType = location.state?.accommodationType;
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);

  const {data: yearlyPlan, status: yearlyPlanStatus} = useQuery<Plan, [string, string]>(
    [PERIODICITY.yearly, accommodationType],
    () => fetchPlan(PERIODICITY.yearly, accommodationType),
    QUERY_CONFIG,
  );
  const {data: monthlyPlan, status: monthlyPlanStatus} = useQuery<Plan, [string, string]>(
    [PERIODICITY.monthly, accommodationType],
    () => fetchPlan(PERIODICITY.monthly, accommodationType),
    QUERY_CONFIG,
  );

  const {
    data: yearlyPrice,
    status: yearlyPriceStatus,
    error: yearlyPriceError,
  } = useQuery<PlanTotalPrice, [string, string, number?]>(
    ['planChangePrice', yearlyPlan?.unique_id],
    () => fetchPrice(yearlyPlan!.unique_id),
    {
      enabled: Boolean(yearlyPlan?.unique_id),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(yearlyPriceError, {
    notFoundMessage: 'Requested yearly price could not be found. Please contact support.',
  });

  const {
    data: monthlyPrice,
    status: monthlyPriceStatus,
    error: monthlyPriceError,
  } = useQuery<PlanTotalPrice, [string, string, number?]>(
    ['planChangePrice', monthlyPlan?.unique_id],
    () => fetchPrice(monthlyPlan!.unique_id),
    {
      enabled: Boolean(monthlyPlan?.unique_id),
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(monthlyPriceError, {
    notFoundMessage: 'Requested price could not be found. Please contact support.',
  });

  const isLoading =
    yearlyPlanStatus === 'loading' ||
    yearlyPriceStatus === 'loading' ||
    monthlyPlanStatus === 'loading' ||
    monthlyPriceStatus === 'loading';

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const getPrice = (price = 0) => {
    if (!price) {
      return '0.00';
    }

    return price.toFixed(2);
  };

  const getMonthlyPriceFromYearly = (price = 0) => {
    if (!price) {
      return 0;
    }

    return getPrice(price / 12);
  };

  return (
    <>
      <Trigger onClick={openPopup}>
        <OpenImageWrapper>
          <img src={eyeIcon} alt="Eye" />
        </OpenImageWrapper>
        <OpenText>{t('pricing').toUpperCase()}?</OpenText>
      </Trigger>
      <Modal contentStyle={contentStyle} open={isPopupOpen} onClose={closePopup}>
        <Content>
          <Title>{t('pricing')}</Title>
          <TilesWrapper>
            {isLoading ? (
              <LoaderWrapper>
                <Loader width={40} height={40} />
              </LoaderWrapper>
            ) : (
              <>
                <PeriodicityYearlyTile
                  accommodationType={accommodationType}
                  amount={getMonthlyPriceFromYearly(yearlyPrice?.price_with_tax)}
                />
                <PeriodicityMonthlyTile
                  accommodationType={accommodationType}
                  amount={getPrice(monthlyPrice?.price_with_tax)}
                />
              </>
            )}
          </TilesWrapper>
          <Link to="pricing" target="_blank">
            <HowWeCalcThePriceTrigger>
              <OpenImageWrapper>
                <img src={eyeIcon} alt="Eye" />
              </OpenImageWrapper>
              <OpenText>{t('how_do_we_calculate_the_price')}</OpenText>
            </HowWeCalcThePriceTrigger>
          </Link>
          <ButtonWrapper>
            <Button label={t('ok')} onClick={closePopup} />
          </ButtonWrapper>
        </Content>
      </Modal>
    </>
  );
}

type PeriodicityTileProps = {
  amount?: number | string;
  accommodationType?: string;
  active?: boolean;
};

function PeriodicityYearlyTile({amount, accommodationType}: PeriodicityTileProps) {
  const {t} = useTranslation();
  const isHotelAccommodationType = accommodationType === ACCOMMODATION_TYPES.hotel;

  return (
    <PricingPeriodicityTile>
      <PricingPeriodicityPriceTitle>
        <span>{t('paid')}</span> {t('yearly').toUpperCase()}
      </PricingPeriodicityPriceTitle>
      <PeriodicityPrice>{amount}€</PeriodicityPrice>
      <PeriodicityPriceLabel>
        {`${t('month_per')} ${
          isHotelAccommodationType ? t('room').toLowerCase() : t('property')
        }`}
      </PeriodicityPriceLabel>
    </PricingPeriodicityTile>
  );
}

function PeriodicityMonthlyTile({
  amount,
  active,
  accommodationType,
}: PeriodicityTileProps) {
  const {t} = useTranslation();
  const isHotelAccommodationType = accommodationType === ACCOMMODATION_TYPES.hotel;

  return (
    <PricingPeriodicityTile>
      <PricingPeriodicityPriceTitle active={active}>
        <span>{t('paid')}</span> {t('monthly').toUpperCase()}
      </PricingPeriodicityPriceTitle>
      <PeriodicityPrice>{amount}€</PeriodicityPrice>
      <PeriodicityPriceLabel>
        {`${t('month_per')} ${
          isHotelAccommodationType ? t('room').toLowerCase() : t('property')
        }`}
      </PeriodicityPriceLabel>
    </PricingPeriodicityTile>
  );
}

export {PricingModal};
