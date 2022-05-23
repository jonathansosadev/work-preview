import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import api, {getAnonymousHeaders, queryFetcher} from '../../../api';
import type {Plan} from '../../../utils/types';
import {ACCOMMODATION_TYPES, PERIODICITY} from '../../../utils/constants';
import {PlanTotalPrice} from '../../../utils/types';
import calculatorTaxesIllustration from '../../../assets/calculator-taxes-illustration.png';
import calculatorTaxesIllustration2x from '../../../assets/calculator-taxes-illustration@2x.png';
import calculatorTaxesIllustration3x from '../../../assets/calculator-taxes-illustration@3x.png';
import housesIcon from '../../../assets/houses.svg';
import hotelIcon from '../../../assets/hotel.svg';
import Loader from '../../common/Loader';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import {
  Content,
  DimensionsWrapper,
  Subtitle,
  Title,
  Wrapper,
} from '../../../styled/onboarding';
import {
  HotelImage,
  HousesImage,
  Illustration,
  MobileHotelImage,
  MobileHousesImage,
  Notes,
  PlanBlock,
  PlanTile,
  PlanTileHeader,
  Price,
  PriceBlock,
  PriceHeader,
  PriceLabel,
  PriceLoaderWrapper,
  PriceTile,
  PriceTilesContainer,
  TitleWrapper,
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

function fetchPlan({queryKey: [plan = '', type = '']}) {
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

function Pricing() {
  const {t} = useTranslation();

  const {data: yearlyHousePlan, status: yearlyHousePlanStatus} = useQuery<
    Plan,
    [string, string]
  >([PERIODICITY.yearly, ACCOMMODATION_TYPES.house], fetchPlan, QUERY_CONFIG);
  const {data: monthlyHousePlan, status: monthlyHousePlanStatus} = useQuery<
    Plan,
    [string, string]
  >([PERIODICITY.monthly, ACCOMMODATION_TYPES.house], fetchPlan, QUERY_CONFIG);

  const {data: yearlyHotelPlan, status: yearlyHotelPlanStatus} = useQuery<
    Plan,
    [string, string]
  >([PERIODICITY.yearly, ACCOMMODATION_TYPES.hotel], fetchPlan, QUERY_CONFIG);
  const {data: monthlyHotelPlan, status: monthlyHotelPlanStatus} = useQuery<
    Plan,
    [string, string]
  >([PERIODICITY.monthly, ACCOMMODATION_TYPES.hotel], fetchPlan, QUERY_CONFIG);

  const {data: yearlyHousePrice, status: yearlyHousePriceStatus} = useQuery<
    PlanTotalPrice,
    [string, string, number?]
  >(
    ['planChangePrice', yearlyHousePlan?.unique_id],
    () => fetchPrice(yearlyHousePlan!.unique_id),
    {
      enabled: Boolean(yearlyHousePlan?.unique_id),
      ...QUERY_CONFIG,
    },
  );
  const {data: monthlyHousePrice, status: monthlyHousePriceStatus} = useQuery<
    PlanTotalPrice,
    [string, string, number?]
  >(
    ['planChangePrice', monthlyHousePlan?.unique_id],
    () => fetchPrice(monthlyHousePlan!.unique_id),
    {
      enabled: Boolean(monthlyHousePlan?.unique_id),
      ...QUERY_CONFIG,
    },
  );

  const {data: yearlyHotelPrice, status: yearlyHotelPriceStatus} = useQuery<
    PlanTotalPrice,
    [string, string, number?]
  >(
    ['planChangePrice', yearlyHotelPlan?.unique_id],
    () => fetchPrice(yearlyHotelPlan!.unique_id),
    {
      enabled: Boolean(yearlyHotelPlan?.unique_id),
      ...QUERY_CONFIG,
    },
  );
  const {data: monthlyHotelPrice, status: monthlyHotelPriceStatus} = useQuery<
    PlanTotalPrice,
    [string, string, number?]
  >(
    ['planChangePrice', monthlyHotelPlan?.unique_id],
    () => fetchPrice(monthlyHotelPlan!.unique_id),
    {
      enabled: Boolean(monthlyHotelPlan?.unique_id),
      ...QUERY_CONFIG,
    },
  );

  const isLoading =
    yearlyHousePlanStatus === 'loading' ||
    monthlyHousePlanStatus === 'loading' ||
    yearlyHotelPlanStatus === 'loading' ||
    monthlyHotelPlanStatus === 'loading' ||
    yearlyHousePriceStatus === 'loading' ||
    monthlyHousePriceStatus === 'loading' ||
    yearlyHotelPriceStatus === 'loading' ||
    monthlyHotelPriceStatus === 'loading';

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
    <Wrapper>
      <DimensionsWrapper>
        <LeftAlignedChekinLogoHeader />
        <TitleWrapper>
          <Title>{t('_how_we_calc_the_price')}</Title>
          <Subtitle>{t('take_advantage_of_chekin_from_now')}</Subtitle>
        </TitleWrapper>
        <Content>
          {isLoading ? (
            <PriceLoaderWrapper>
              <Loader height={40} width={40} label={`${t('loading_plans')}...`} />
            </PriceLoaderWrapper>
          ) : (
            <>
              <PriceTilesContainer>
                <PlanTile>
                  <PlanTileHeader />
                  <PlanBlock>
                    <HousesImage src={housesIcon} alt="Houses" />
                    <div>{t('vacation_rental')}</div>
                  </PlanBlock>
                  <PlanBlock>
                    <HotelImage src={hotelIcon} alt="Hotel" />
                    <div>{t('hotel_hostel_camp')}</div>
                  </PlanBlock>
                </PlanTile>
                <PriceTile>
                  <PriceHeader>
                    <span>{t('paid')}</span> {t('yearly')}
                  </PriceHeader>
                  <PriceBlock>
                    <MobileHousesImage src={housesIcon} alt="Houses" />
                    <Price>
                      {getMonthlyPriceFromYearly(yearlyHousePrice?.price_with_tax)}€
                    </Price>
                    <PriceLabel>
                      {t('month_per')} {t('property')}
                    </PriceLabel>
                  </PriceBlock>
                  <PriceBlock>
                    <MobileHotelImage src={hotelIcon} alt="Hotel" />
                    <Price>
                      {getMonthlyPriceFromYearly(yearlyHotelPrice?.price_with_tax)}€
                    </Price>
                    <PriceLabel>
                      {t('month_per')} {t('room').toLowerCase()}
                    </PriceLabel>
                  </PriceBlock>
                </PriceTile>
                <PriceTile>
                  <PriceHeader>
                    <span>{t('paid')}</span> {t('monthly')}
                  </PriceHeader>
                  <PriceBlock>
                    <MobileHousesImage src={housesIcon} alt="Houses" />
                    <Price>{getPrice(monthlyHousePrice?.price_with_tax)}€</Price>
                    <PriceLabel>
                      {t('month_per')} {t('property')}
                    </PriceLabel>
                  </PriceBlock>
                  <PriceBlock>
                    <MobileHotelImage src={hotelIcon} alt="Hotel" />
                    <Price>{getPrice(monthlyHotelPrice?.price_with_tax)}€</Price>
                    <PriceLabel>
                      {t('month_per')} {t('room').toLowerCase()}
                    </PriceLabel>
                  </PriceBlock>
                </PriceTile>
              </PriceTilesContainer>
              <Notes>
                {t('how_we_calc_price_notes')}
                <p>{t('after_that_we_will_recalc_subscription')}</p>
              </Notes>
            </>
          )}
        </Content>
        <Illustration
          alt="Calculator with a man looking at it"
          src={calculatorTaxesIllustration}
          srcSet={`${calculatorTaxesIllustration} 1x, ${calculatorTaxesIllustration2x} 2x, ${calculatorTaxesIllustration3x} 3x`}
        />
      </DimensionsWrapper>
    </Wrapper>
  );
}

export {Pricing};
