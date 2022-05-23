import React from 'react';
import {useTranslation} from 'react-i18next';
import {Link, useLocation} from 'react-router-dom';
import {mixpanelTrackWithUTM} from '../../../analytics/mixpanel';
import smoobuLogoIcon from '../../../assets/smoobu_logo.svg';
import leaveToSmoobuLogoIcon from '../../../assets/leave_to_smoobu.png';
import houseIllustrationIcon from '../../../assets/house_illustration.svg';
import Modal from '../Modal';
import ModalButton from '../../dashboard/ModalButton';
import LeftAlignedChekinLogoHeader from '../LeftAlignedChekinLogoHeader';
import RegisterSyncHeader from '../RegisterSyncHeader';
import Button from '../Button';
import IDontWorkWithPMSButton from '../IDontWorkWithPMSButton';
import {
  Wrapper,
  DimensionsWrapper,
  Content,
  SyncTile,
  ThreeDotsGroup,
  Dot,
  StepText,
  StepTextLink,
} from '../../../styled/onboarding';
import {
  Illustration,
  Logo,
  LoginText,
  StepWizardWrapper,
  SmoobuStepByStepWizard,
  LeavingModalContent,
  LeavingModalTitle,
  LeavingModalSubtitle,
  LeavingModalImg,
} from './styled';

const SMOOBU_WEBSITE_URL = 'https://login.smoobu.com/en/integration/edit/5';

type LocationState = {
  accommodationType: string;
};

function FirstStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      {t('click_on')}
      <b> "{t('connect_with_smoobu')}"</b>.{` `}
      {t('it_will_redirect_to_chekin_on_smoobu')}
    </StepText>
  );
}

function SecondStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      {t('click_on')}
      <b> "{t('connect')}"</b>.{` `}
      {t('we_will_send_you_email_with_password')}
    </StepText>
  );
}

function ThirdStep() {
  const {t} = useTranslation();
  return (
    <StepText>
      <StepTextLink target="_blank" href="/login">
        {t('login_in_chekin')}.
      </StepTextLink>
    </StepText>
  );
}

function PmsSmoobuOriginRegister() {
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const {t} = useTranslation();
  const location = useLocation<LocationState>();
  const accountSyncOptions = React.useMemo(
    () =>
      [
        {
          label: 'Booking',
          link: {
            pathname: 'booking-sync',
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
          label: 'BookingSync',
          link: {
            pathname: 'bookingsync-sync',
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

  React.useEffect(() => {
    mixpanelTrackWithUTM('Onboarding - Smoobu');
  }, []);

  const openLeaveModal = () => {
    setShowLeaveModal(true);
  };

  const closeLeaveModal = () => {
    setShowLeaveModal(false);
  };

  const goToSmoobu = () => {
    window.location.replace(SMOOBU_WEBSITE_URL);
  };

  return (
    <>
      {showLeaveModal && (
        <Modal onClose={closeLeaveModal} open>
          <LeavingModalContent>
            <LeavingModalImg src={leaveToSmoobuLogoIcon} alt={'leave'} />
            <LeavingModalTitle>{t('you_are_leaving_chekin')}</LeavingModalTitle>
            <LeavingModalSubtitle>{t('to_do_login_on_smoobu')}</LeavingModalSubtitle>
            <ModalButton label={'ok'} onClick={goToSmoobu} />
          </LeavingModalContent>
        </Modal>
      )}
      <Wrapper>
        <DimensionsWrapper>
          <LeftAlignedChekinLogoHeader />
          <RegisterSyncHeader syncOptions={accountSyncOptions}>Smooby</RegisterSyncHeader>
          <Content>
            <SyncTile>
              <Logo src={smoobuLogoIcon} alt="Smoobu" />
              <Button
                light
                size="big"
                onClick={openLeaveModal}
                label={t('connect_with_smoobu')}
              />
              <LoginText>
                {t('already_connected')}
                <div>
                  <Link to="/login">
                    <Button secondary label={t('login_here')} type="button" />
                  </Link>
                </div>
              </LoginText>
              <ThreeDotsGroup>
                <Dot />
                <Dot />
                <Dot />
              </ThreeDotsGroup>
              <StepWizardWrapper>
                <SmoobuStepByStepWizard
                  title={t('step_by_step_guide')}
                  components={[<FirstStep />, <SecondStep />, <ThirdStep />]}
                />
              </StepWizardWrapper>
            </SyncTile>
            <IDontWorkWithPMSButton />
          </Content>
          <Illustration alt="House" src={houseIllustrationIcon} />
        </DimensionsWrapper>
      </Wrapper>
    </>
  );
}

export {PmsSmoobuOriginRegister};
