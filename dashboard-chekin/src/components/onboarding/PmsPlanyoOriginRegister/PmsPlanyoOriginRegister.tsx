import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useLocation} from 'react-router-dom';
import planyoLogoIcon from '../../../assets/planyo_logo.png';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import {
  Wrapper,
  DimensionsWrapper,
  Content,
  SyncTile,
  StepText,
  ThreeDotsGroup,
  Dot,
} from '../../../styled/onboarding';
import {
  Illustration,
  Logo,
  LoginText,
  StepGuideWrapper,
  PlanyoStepByStepWizard,
} from './styled';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import Button from '../Button';

function FirstStep() {
  const {t} = useTranslation();
  return <StepText>{t('planyo_guide_first_step')}</StepText>;
}

function SecondStep() {
  const {t} = useTranslation();
  return <StepText>{t('planyo_guide_second_step')}</StepText>;
}

function ThirdStep() {
  const {t} = useTranslation();
  return <StepText>{t('planyo_guide_third_step')}</StepText>;
}

function PmsPlanyoOriginRegister() {
  const {t} = useTranslation();
  const location = useLocation();
  const accountSyncOptions = React.useMemo(
    () =>
      [
        {
          label: 'Smoobu',
          link: {
            pathname: 'smoobu-sync',
            state: location.state,
          },
        },
        {
          label: '365Villas',
          link: {
            pathname: 'villas-365-sync',
            state: location.state,
          },
        },
        {
          label: 'Cloudbeds',
          link: {
            pathname: 'cloudbeds-sync',
            state: location.state,
          },
        },
        {
          label: '365Villas',
          link: {
            pathname: 'villas-365-sync',
            state: location.state,
          },
        },
        {
          label: 'Booking',
          link: {
            pathname: 'booking-sync',
            state: location.state,
          },
        },
        {
          label: 'BookingSync',
          link: {
            pathname: 'bookingsync-sync',
            state: location.state,
          },
        },
        {
          label: 'Guesty',
          link: {
            pathname: 'guesty-sync',
            state: location.state,
          },
        },
        {
          label: 'Lodgify',
          link: {
            pathname: 'lodgify-sync',
            state: location.state,
          },
        },
        {
          label: 'Rentals United',
          link: {
            pathname: 'rentals-united-sync',
            state: location.state,
          },
        },
        {
          label: 'Hostaway',
          link: {
            pathname: 'hostaway-sync',
            state: location.state,
          },
        },
        {
          label: 'Resharmonics',
          link: {
            pathname: 'resharmonics-sync',
            state: location.state,
          },
        },
        {
          label: 'Rentlio',
          link: {
            pathname: 'rentlio-sync',
            state: location.state,
          },
        },
        {
          label: t('other'),
          link: {
            pathname: '/register/pms',
            state: location.state,
          },
        },
      ].sort((a, b) => a.label.localeCompare(b.label)),
    [t, location.state],
  );

  const redirectToPlanyo = () => {
    const planyoUrl = `https://www.planyo.com/extensions/extension.php?id=129&origin=chekin`;
    window.location.replace(planyoUrl);
  };

  return (
    <>
      <Wrapper>
        <DimensionsWrapper>
          <LeftAlignedChekinLogoHeader />
          <RegisterSyncHeader syncOptions={accountSyncOptions}>Planyo</RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={planyoLogoIcon} alt="Planyo" />
              <Button
                light
                size="big"
                onClick={redirectToPlanyo}
                label={t('connect_with_planyo')}
              />
              <LoginText>
                {t('already_connected')}
                <div>
                  <Link to="/login">
                    <Button secondary label={t('login_here')} type="button" />
                  </Link>
                </div>
              </LoginText>
              <StepGuideWrapper>
                <>
                  <ThreeDotsGroup>
                    <Dot />
                    <Dot />
                    <Dot />
                  </ThreeDotsGroup>
                  <PlanyoStepByStepWizard
                    components={[<FirstStep />, <SecondStep />, <ThirdStep />]}
                  />
                </>
              </StepGuideWrapper>
            </SyncTile>
            <IDontWorkWithPMSButton />
          </Content>
          <Illustration alt="House" src={houseIllustrationIcon} />
        </DimensionsWrapper>
      </Wrapper>
    </>
  );
}

export {PmsPlanyoOriginRegister};
