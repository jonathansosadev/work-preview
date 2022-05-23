import React from 'react';
import {useTranslation} from 'react-i18next';
import {ORIGINS} from '../../../utils/constants';
import {useUser} from '../../../context/user';
import {removeUserTokenFromLocalStorage} from '../../../api';
import {Container, Button, Title, ButtonContainer} from './styled';

const CLOUDBEDS_CLIENT_ID = process.env.REACT_APP_CLOUDBEDS_CLIENT_ID;
const BOOKINGSYNC_CLIENT_ID = process.env.REACT_APP_BOOKINGSYNC_CLIENT_ID;
const APALEO_CLIENT_ID = process.env.REACT_APP_APALEO_CLIENT_ID;
const BOOKING_CLIENT_ID = process.env.REACT_APP_BOOKING_CLIENT_ID;
const ONBOARDING_URL = `${process.env.REACT_APP_ONBOARDING_URL}/`;

function IntegrationRefetchTokenTooltip() {
  const {t} = useTranslation();
  const user = useUser();

  const openOauthLink = () => {
    removeUserTokenFromLocalStorage();
    if (user?.origin === ORIGINS.cloudbeds) {
      const cloudbedsOauthUrl = `https://hotels.cloudbeds.com/api/v1.1/oauth?client_id=${CLOUDBEDS_CLIENT_ID}&redirect_uri=${ONBOARDING_URL}&response_type=code&scope=read%3Aguest+write%3Aguest+read%3Ahotel+read%3Apayment+read%3Areservation+write%3Areservation+read%3Aroom+write%3Aroom&state=${
        user?.email
      },,1,${user?.origin.toLowerCase()}`;
      window.location.replace(cloudbedsOauthUrl);
    } else if (user?.origin === ORIGINS.bookingsync) {
      const bookingsyncOauthUrl = `https://www.bookingsync.com/oauth/authorize?client_id=${BOOKINGSYNC_CLIENT_ID}&redirect_uri=${ONBOARDING_URL}&response_type=code&scope=bookings_read%20bookings_write%20clients_read%20clients_write%20rentals_read&state=${
        user?.email
      },,1,${user?.origin.toLowerCase()}`;
      window.location.replace(bookingsyncOauthUrl);
    } else if (user?.origin === ORIGINS.apaleo) {
      const apaleoOauthUrl = `https://identity.apaleo.com/connect/authorize?response_type=code&scope=offline_access setup.read reservations.manage reservations.read accounting.read&client_id=${APALEO_CLIENT_ID}&redirect_uri=${ONBOARDING_URL}&state=${
        user?.email
      },,1,${user?.origin.toLowerCase()}`;
      window.location.replace(apaleoOauthUrl);
    } else if (user?.origin === ORIGINS.booking) {
      const bookingOauthUrl = `https://hub-api.booking.com/v1/oauth2/authorize?response_type=code&client_id=${BOOKING_CLIENT_ID}&redirect_uri=${ONBOARDING_URL}&state=${
        user?.email
      },,1,${user?.origin.toLowerCase()}`;
      window.location.replace(bookingOauthUrl);
    }
  };

  return (
    <Container>
      <Title>{t('your_token_has_expired')}</Title>
      {t('please_refresh_your_token')}
      <ButtonContainer>
        <Button onClick={openOauthLink} label={t('refresh')} />
      </ButtonContainer>
    </Container>
  );
}

export {IntegrationRefetchTokenTooltip};
