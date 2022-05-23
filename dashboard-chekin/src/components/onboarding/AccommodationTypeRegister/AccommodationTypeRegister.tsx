import React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useHistory} from 'react-router-dom';
import {useScrollToTop} from '../../../utils/hooks';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import {ACCOMMODATION_TYPES} from '../../../utils/constants';
import houseIllustration from '../../../assets/house_illustration.svg';
import housesIcon from '../../../assets/houses.svg';
import housesActiveIcon from '../../../assets/houses_active.svg';
import hotelIcon from '../../../assets/hotel.svg';
import hotelActiveIcon from '../../../assets/hotel_active.svg';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import Button from '../Button';
import {Wrapper, DimensionsWrapper, Title, Content} from '../../../styled/onboarding';
import {
  ButtonsWrapper,
  TitleWrapper,
  AccommodationTypesWrapper,
  AccommodationTypeTile,
  AccommodationTypeTileTitle,
  HotelRentalLogo,
  VacationRentalLogo,
  Illustration,
} from './styled';

const IS_UNDER_MAINTENANCE = process.env.REACT_APP_MAINTENANCE_MODE;

function AccommodationTypeRegister() {
  useScrollToTop();
  const history = useHistory();
  const location = useLocation();
  const {t} = useTranslation();
  const [activeType, setActiveType] = React.useState('');

  const isVacationTypeActive = activeType === ACCOMMODATION_TYPES.house;
  const isHotelTypeActive = activeType === ACCOMMODATION_TYPES.hotel;

  React.useEffect(() => {
    if (IS_UNDER_MAINTENANCE) {
      history.push('/login');
    }

    mixpanelTrackWithUTM('Onboarding - Accommodation type');
  }, [history]);

  const goBack = () => {
    history.push('/login');
  };

  const resetActiveType = () => {
    setActiveType('');
  };

  const handleTypeClick = (type = '') => {
    if (activeType === type) {
      resetActiveType();
      return;
    }
    setActiveType(type);
  };

  const getPersistedState = () => {
    return {
      ...location.state,
      accommodationType: activeType,
    };
  };

  const goNext = () => {
    history.push({
      ...location,
      pathname: 'number',
      state: getPersistedState(),
    });
  };

  return (
    <Wrapper>
      <DimensionsWrapper>
        <LeftAlignedChekinLogoHeader />
        <TitleWrapper>
          <Title>{t('select_your_accommodation_type')}</Title>
        </TitleWrapper>
        <Content>
          <AccommodationTypesWrapper>
            <AccommodationType
              onClick={() => handleTypeClick(ACCOMMODATION_TYPES.house)}
              active={isVacationTypeActive}
              title={t('vacation_rental')}
            >
              <VacationRentalLogo
                src={isVacationTypeActive ? housesActiveIcon : housesIcon}
                active={isVacationTypeActive}
                alt="Houses"
              />
            </AccommodationType>
            <AccommodationType
              onClick={() => handleTypeClick(ACCOMMODATION_TYPES.hotel)}
              active={isHotelTypeActive}
              title={t('hotel_hostel_camp')}
            >
              <HotelRentalLogo
                src={isHotelTypeActive ? hotelActiveIcon : hotelIcon}
                active={isHotelTypeActive}
                alt="Hotel"
              />
            </AccommodationType>
          </AccommodationTypesWrapper>
          <ButtonsWrapper>
            <Button
              light
              size="big"
              onClick={goNext}
              disabled={!activeType}
              label={t('next')}
            />
            <Button light secondary size="big" onClick={goBack} label={t('back')} />
          </ButtonsWrapper>
        </Content>
        <Illustration src={houseIllustration} alt="House" />
      </DimensionsWrapper>
    </Wrapper>
  );
}

type AccommodationTypeProps = {
  children: JSX.Element;
  title: string;
  active: boolean;
  onClick: () => void;
};

function AccommodationType({children, title, active, onClick}: AccommodationTypeProps) {
  return (
    <AccommodationTypeTile onClick={onClick} active={active}>
      {children}
      <AccommodationTypeTileTitle active={active}>{title}</AccommodationTypeTileTitle>
    </AccommodationTypeTile>
  );
}

export {AccommodationTypeRegister};
