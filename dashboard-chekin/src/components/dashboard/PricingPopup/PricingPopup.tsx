import React from 'react';
import {useTranslation} from 'react-i18next';
// import {useQuery} from 'react-query';
// import {Plan, PlanTotalPrice} from '../../../utils/types';
// import {ACCOMMODATION_TYPES, PERIODICITY} from '../../../utils/constants';
// import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import xIcon from '../../../assets/x_blue.svg';
import Modal from '../Modal';
// import Loader from '../../common/Loader';
import {
  contentStyle,
  overlayStyle,
  CloseButton,
  // PlanContainer,
  // Dot,
  // ThreeDotsGroup,
  Title,
  // PlanPrice,
  // PlanPriceLabel,
  // PlanPeriodicity,
  // PricingTile,
  // SubscriptionType,
  SubTitle,
  // LoaderWrapper,
  Notes,
} from './styled';

/*
const QUERY_CONFIG = {
  cacheTime: 24 * 60 * 1000,
  staleTime: 24 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};
*/

/*function getPlanDetailsQuery(interval = '', type = '') {
  return `interval=${interval}&type=${type}`;
}*/

/*
function fetchPlan(plan = '', type = '') {
  const planDetailsQuery = getPlanDetailsQuery(plan, type);
  return queryFetcher(api.payments.ENDPOINTS.plans(planDetailsQuery), {
    headers: getAnonymousHeaders(),
  });
}

function fetchPrice(key: string, planId: string, quantity = 1) {
  return queryFetcher(
    api.payments.ENDPOINTS.planTotalPrice(planId, `quantity=${quantity}`),
    {
      headers: getAnonymousHeaders(),
    },
  );
}
*/

type PricingPopupProps = {
  open: boolean;
  onClose: () => void;
};

function PricingPopup({open, onClose}: PricingPopupProps) {
  const {t} = useTranslation();

  // const {data: yearlyHousePlan, status: yearlyHousePlanStatus} = useQuery<
  //   Plan,
  //   [string, string]
  // >([PERIODICITY.yearly, ACCOMMODATION_TYPES.house], fetchPlan, QUERY_CONFIG);
  // const {data: monthlyHousePlan, status: monthlyHousePlanStatus} = useQuery<
  //   Plan,
  //   [string, string]
  // >([PERIODICITY.monthly, ACCOMMODATION_TYPES.house], fetchPlan, QUERY_CONFIG);
  //
  // const {data: yearlyHotelPlan, status: yearlyHotelPlanStatus} = useQuery<
  //   Plan,
  //   [string, string]
  // >([PERIODICITY.yearly, ACCOMMODATION_TYPES.hotel], fetchPlan, QUERY_CONFIG);
  // const {data: monthlyHotelPlan, status: monthlyHotelPlanStatus} = useQuery<
  //   Plan,
  //   [string, string]
  // >([PERIODICITY.monthly, ACCOMMODATION_TYPES.hotel], fetchPlan, QUERY_CONFIG);

  // const {data: yearlyHousePrice, status: yearlyHousePriceStatus} = useQuery<
  //   PlanTotalPrice,
  //   [string, string, number?]
  // >(
  //   Boolean(yearlyHousePlan?.unique_id) && [
  //     'planChangePrice',
  //     yearlyHousePlan!.unique_id,
  //   ],
  //   fetchPrice,
  //   QUERY_CONFIG,
  // );
  // const {data: monthlyHousePrice, status: monthlyHousePriceStatus} = useQuery<
  //   PlanTotalPrice,
  //   [string, string, number?]
  // >(
  //   Boolean(monthlyHousePlan?.unique_id) && [
  //     'planChangePrice',
  //     monthlyHousePlan!.unique_id,
  //   ],
  //   fetchPrice,
  //   QUERY_CONFIG,
  // );
  //
  // const {data: yearlyHotelPrice, status: yearlyHotelPriceStatus} = useQuery<
  //   PlanTotalPrice,
  //   [string, string, number?]
  // >(
  //   Boolean(yearlyHotelPlan?.unique_id) && [
  //     'planChangePrice',
  //     yearlyHotelPlan!.unique_id,
  //   ],
  //   fetchPrice,
  //   QUERY_CONFIG,
  // );
  // const {data: monthlyHotelPrice, status: monthlyHotelPriceStatus} = useQuery<
  //   PlanTotalPrice,
  //   [string, string, number?]
  // >(
  //   Boolean(monthlyHotelPlan?.unique_id) && [
  //     'planChangePrice',
  //     monthlyHotelPlan!.unique_id,
  //   ],
  //   fetchPrice,
  //   QUERY_CONFIG,
  // );
  //
  // const isLoading =
  //   yearlyHousePlanStatus === 'loading' ||
  //   monthlyHousePlanStatus === 'loading' ||
  //   yearlyHotelPlanStatus === 'loading' ||
  //   monthlyHotelPlanStatus === 'loading' ||
  //   yearlyHousePriceStatus === 'loading' ||
  //   monthlyHousePriceStatus === 'loading' ||
  //   yearlyHotelPriceStatus === 'loading' ||
  //   monthlyHotelPriceStatus === 'loading';

  // const getPrice = (price = 0) => {
  //   if (!price) {
  //     return '0.00';
  //   }
  //
  //   return price.toFixed(2);
  // };
  //
  // const getMonthlyPriceFromYearly = (price = 0) => {
  //   if (!price) {
  //     return 0;
  //   }
  //
  //   return getPrice(price / 12);
  // };

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      open={open}
      onClose={onClose}
      contentStyle={contentStyle}
      overlayStyle={overlayStyle}
    >
      {/*{isLoading ? (*/}
      {/*  <LoaderWrapper>*/}
      {/*    <Loader width={45} height={45} label={t('loading')} />*/}
      {/*  </LoaderWrapper>*/}
      {/*) : (*/}
      <div>
        <CloseButton onClick={onClose}>
          <img src={xIcon} alt="Cross" />
        </CloseButton>
        <Title>{t('pricing')}</Title>
        <SubTitle>{t('how_do_we_calc_the_price_question')}</SubTitle>
        {/*<PricingTile>*/}
        {/*  <SubscriptionType>{t('vacation_rental')}</SubscriptionType>*/}
        {/*  <PlanContainer>*/}
        {/*    <PlanPeriodicity>{t('paid_yearly')}</PlanPeriodicity>*/}
        {/*    <span>*/}
        {/*      <PlanPrice>*/}
        {/*        {getMonthlyPriceFromYearly(yearlyHousePrice?.price_with_tax)}€*/}
        {/*      </PlanPrice>*/}
        {/*      <PlanPriceLabel>*/}
        {/*        {' '}*/}
        {/*        / {t('month_per')} {t('property')}*/}
        {/*      </PlanPriceLabel>*/}
        {/*    </span>*/}
        {/*  </PlanContainer>*/}
        {/*  <PlanContainer>*/}
        {/*    <PlanPeriodicity>{t('paid_monthly')}</PlanPeriodicity>*/}
        {/*    <span>*/}
        {/*      <PlanPrice>{getPrice(monthlyHousePrice?.price_with_tax)}€</PlanPrice>*/}
        {/*      <PlanPriceLabel>*/}
        {/*        {' '}*/}
        {/*        / {t('month_per')} {t('property')}*/}
        {/*      </PlanPriceLabel>*/}
        {/*    </span>*/}
        {/*  </PlanContainer>*/}
        {/*</PricingTile>*/}
        {/*<ThreeDotsGroup>*/}
        {/*  <Dot />*/}
        {/*  <Dot />*/}
        {/*  <Dot />*/}
        {/*</ThreeDotsGroup>*/}
        {/*<PricingTile>*/}
        {/*  <SubscriptionType>{t('hotel_hostel_camp')}</SubscriptionType>*/}
        {/*  <PlanContainer>*/}
        {/*    <PlanPeriodicity>{t('paid_yearly')}</PlanPeriodicity>*/}
        {/*    <span>*/}
        {/*      <PlanPrice>*/}
        {/*        {getMonthlyPriceFromYearly(yearlyHotelPrice?.price_with_tax)}€*/}
        {/*      </PlanPrice>*/}
        {/*      <PlanPriceLabel>*/}
        {/*        {' '}*/}
        {/*        / {t('month_per')} {t('room')}*/}
        {/*      </PlanPriceLabel>*/}
        {/*    </span>*/}
        {/*  </PlanContainer>*/}
        {/*  <PlanContainer>*/}
        {/*    <PlanPeriodicity>{t('paid_monthly')}</PlanPeriodicity>*/}
        {/*    <span>*/}
        {/*      <PlanPrice>{getPrice(monthlyHotelPrice?.price_with_tax)}€</PlanPrice>*/}
        {/*      <PlanPriceLabel>*/}
        {/*        {' '}*/}
        {/*        / {t('month_per')} {t('room')}*/}
        {/*      </PlanPriceLabel>*/}
        {/*    </span>*/}
        {/*  </PlanContainer>*/}
        {/*</PricingTile>*/}
        <Notes>
          {t('how_we_calc_price_notes')}
          <p>{t('after_that_we_will_recalc_subscription')}</p>
        </Notes>
      </div>
      {/*)}*/}
    </Modal>
  );
}

export {PricingPopup};
