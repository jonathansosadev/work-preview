import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {useScrollToTop} from '../../../utils/hooks';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import houseIllustration from '../../../assets/house_illustration.svg';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import Button from '../Button';
import {
  Title,
  Subtitle,
  DimensionsWrapper,
  Wrapper,
  Content,
} from '../../../styled/onboarding';
import {ACCOMMODATION_TYPES} from '../../../utils/constants';
import {
  ButtonsWrapper,
  TitleWrapper,
  RentalsNumberTile,
  RentalsNumberWrapper,
  Illustration,
  LowercaseWrapper,
} from './styled';

const HOUSING_NUMBER_INTERVALS = {
  first: '1 - 4',
  second: '5 - 20',
  third: '21 - 100',
  fourth: '100+',
};
const HOTEL_NUMBER_INTERVALS = {
  first: '1 - 20',
  second: '20 - 50',
  third: '50 - 100',
  fourth: '100+',
};

type LocationState = {
  accommodationType: string;
};

function RentalsNumberRegister() {
  useScrollToTop();
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const [activeNumberInterval, setActiveNumberInterval] = React.useState('');
  const [activeIntervals, setActiveIntervals] = React.useState<{[key: string]: string}>(
    {},
  );

  const isHotelAccommodationType =
    location.state && location.state.accommodationType === ACCOMMODATION_TYPES.hotel;
  const isHousingAccommodationType =
    location.state && location.state.accommodationType === ACCOMMODATION_TYPES.house;

  React.useEffect(() => {
    if (isHotelAccommodationType) {
      setActiveIntervals(HOTEL_NUMBER_INTERVALS);
    }
    if (isHousingAccommodationType) {
      setActiveIntervals(HOUSING_NUMBER_INTERVALS);
    }
  }, [isHotelAccommodationType, isHousingAccommodationType, location.state]);

  const goBack = React.useCallback(() => {
    history.push({...location, pathname: '/register/type'});
  }, [history, location]);

  React.useEffect(() => {
    const hasPersistedState = location.state && location.state.accommodationType;

    if (!hasPersistedState) {
      goBack();
    }
  }, [location.state, goBack]);

  React.useEffect(() => {
    mixpanelTrackWithUTM('Onboarding - Number of properties');
  }, []);

  const resetActiveNumber = () => {
    setActiveNumberInterval('');
  };

  const handleNumbersClick = (number = '') => {
    if (activeNumberInterval === number) {
      resetActiveNumber();
      return;
    }
    setActiveNumberInterval(number);
  };

  const getPersistedState = () => {
    return {
      ...location.state,
      accommodationsNumber: activeNumberInterval,
    };
  };

  const goNext = () => {
    history.push({...location, pathname: '/register/pms', state: getPersistedState()});
  };

  return (
    <Wrapper>
      <DimensionsWrapper>
        <LeftAlignedChekinLogoHeader />
        <TitleWrapper>
          <Title>
            {`${t('how_many')} `}
            <LowercaseWrapper>
              {isHotelAccommodationType ? t('rooms') : t('properties')}
              {` ${t('do_you_manage')}`}?
            </LowercaseWrapper>
          </Title>
          <Subtitle>{t('this_will_help_us_to_setup')}</Subtitle>
        </TitleWrapper>
        <Content>
          <RentalsNumberWrapper>
            <RentalsNumberTile
              active={activeNumberInterval === activeIntervals.first}
              onClick={() => handleNumbersClick(activeIntervals.first)}
            >
              {activeIntervals.first}
            </RentalsNumberTile>
            <RentalsNumberTile
              active={activeNumberInterval === activeIntervals.second}
              onClick={() => handleNumbersClick(activeIntervals.second)}
            >
              {activeIntervals.second}
            </RentalsNumberTile>
            <RentalsNumberTile
              active={activeNumberInterval === activeIntervals.third}
              onClick={() => handleNumbersClick(activeIntervals.third)}
            >
              {activeIntervals.third}
            </RentalsNumberTile>
            <RentalsNumberTile
              active={activeNumberInterval === activeIntervals.fourth}
              onClick={() => handleNumbersClick(activeIntervals.fourth)}
            >
              {activeIntervals.fourth}
            </RentalsNumberTile>
          </RentalsNumberWrapper>
          <ButtonsWrapper>
            <Button
              light
              size="big"
              onClick={goNext}
              disabled={!activeNumberInterval}
              label={t('next')}
            />
            <Button light secondary size="big" onClick={goBack} label={t('back')} />
          </ButtonsWrapper>
        </Content>
        <Illustration alt="House" src={houseIllustration} />
      </DimensionsWrapper>
    </Wrapper>
  );
}

export {RentalsNumberRegister};
