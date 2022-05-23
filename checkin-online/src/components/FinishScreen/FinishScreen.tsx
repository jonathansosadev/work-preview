import React, {useState, useEffect} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useHistory, useLocation, Link} from 'react-router-dom';
import {useReservation} from '../../context/reservation';
import {getMembers, getNumberOfGuests} from '../../utils/reservation';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import completedIcon from '../../assets/completed-icon.svg';
import successIcon from '../../assets/checkmark-outlined.svg';
import HousingPicture from '../HousingPicture';
import Header from '../Header';
import {CenteredWrapper} from '../../styled/common';
import experiencesIcon from '../../assets/experiences-icon.png';
import Modal from '../Modal';
import {
  ExpandingGuestsButton,
  Guest,
  GuestsContainer,
  GuestsCount,
  GuestsTitle,
  GuestsWrapper,
  MobileHeaderIcon,
  TitleText,
  RegisterButton,
  GuestPlaceholder,
  BottomButton,
  BottomText,
  Or,
  BottomWrapper,
  NotNowButton,
  ExploreButton,
} from './styled';

export enum GUEST_STATUSES {
  incomplete = 'INCOMPLETE',
  error = 'ERROR',
  new = 'NEW',
  complete = 'COMPLETE',
}

const maxCollapsedGuestsNumber = 3;
const registrationFinishedEvent = 'GUEST_REGISTRATION_FINISHED';

type LocationState = {
  registeredGuestName?: string;
};

function FinishScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {data: reservation} = useReservation();
  const {areGuestFieldsDisabled} = useComputedReservationDetails();
  const [areGuestsExpanded, setAreGuestsExpanded] = React.useState(false);
  const numberOfGuests = getNumberOfGuests(reservation);
  const guests = getMembers(reservation);
  const isInsideIframe = window.self !== window.top;
  const [civitatisModal, setCivitatisModal] = useState(false);
  const [firstTime, setFirstTime] = useState(true);

  const getCivitatis = () => {
    const location = reservation?.housing?.location?.city
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
    const upselling = reservation?.housing?.upselling_payments_status;
    if (
      location === 'sevilla' ||
      location === 'madrid' ||
      location === 'bilbao' ||
      location === 'barcelona' ||
      location === 'granada' ||
      location === 'valencia' ||
      location === 'malaga' ||
      location === 'alicante'
    ) {
      if (upselling === 'ACTIVE') {
        setFirstTime(false);
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    if (getCivitatis() && firstTime) {
      setTimeout(() => {
        setCivitatisModal(true);
      }, 2000);
    }
  });

  const goToHomeScreen = () => {
    history.push('/', location.state);
  };

  const toggleGuestsExpanding = () => {
    setAreGuestsExpanded(prevState => !prevState);
  };

  const renderOneGuest = (guest: any = {}) => {
    return (
      <Guest key={guest.id} status={guest.status}>
        <b>{guest.full_name?.toLowerCase()}</b> ({t(guest.status?.toLowerCase())})
      </Guest>
    );
  };

  const renderGuests = () => {
    let renderedGuests = guests.map(renderOneGuest);

    if (!areGuestsExpanded) {
      return renderedGuests.slice(0, maxCollapsedGuestsNumber);
    }
    return renderedGuests;
  };

  const postGuestRegisteredEventMessageFromIframe = () => {
    window.parent.postMessage(registrationFinishedEvent, '*');
  };

  const guestName = location.state?.registeredGuestName || t('guest');
  const numberOfGuestsRegisteredGuestsDiff = numberOfGuests - guests.length;
  const renderedGuests = renderGuests();

  return (
    <>
      <Header
        hideBackButton
        title={t('successfully_completed')}
        MobileHeaderIcon={<MobileHeaderIcon src={successIcon} alt="Check mark" />}
      />
      <HousingPicture />
      <TitleText>
        <img src={completedIcon} alt="" height={40} width={39} />
        <Trans i18nKey="guest_name_registered" values={{guestName}}>
          <b>{guestName}</b> has been successfully registered
        </Trans>
      </TitleText>
      {!areGuestFieldsDisabled && (
        <>
          <GuestsWrapper>
            <GuestsTitle>
              {t('checkin_status')}
              <GuestsCount>
                {' '}
                ({guests.length}/{numberOfGuests} {t('registered')})
              </GuestsCount>
            </GuestsTitle>
            <GuestsContainer>{renderedGuests}</GuestsContainer>
            {guests.length > maxCollapsedGuestsNumber && (
              <ExpandingGuestsButton onClick={toggleGuestsExpanding}>
                {areGuestsExpanded
                  ? t('collapse')
                  : `+ ${guests.length - maxCollapsedGuestsNumber} ${t('more_guest')}`}
              </ExpandingGuestsButton>
            )}
            {numberOfGuestsRegisteredGuestsDiff > 0 && (
              <GuestPlaceholder status={GUEST_STATUSES.incomplete}>
                <div>
                  {t(
                    numberOfGuestsRegisteredGuestsDiff > 1
                      ? 'number_pending_guests'
                      : 'number_pending_guest',
                    {
                      number: numberOfGuestsRegisteredGuestsDiff,
                    },
                  )}
                </div>
                <RegisterButton label={t('register')} onClick={goToHomeScreen} />
              </GuestPlaceholder>
            )}
          </GuestsWrapper>
          <BottomWrapper>
            <BottomText>
              {t('dont_have_your_guests_question')}
              <br />
              {t('share_this_link_to_guests')}
            </BottomText>
            <CenteredWrapper>
              <Link to="/share" target="_blank">
                <BottomButton>{t('share_checkin_online')}</BottomButton>
              </Link>
            </CenteredWrapper>
            {isInsideIframe && (
              <>
                <Or>{t('or')}</Or>
                <CenteredWrapper>
                  <BottomButton onClick={postGuestRegisteredEventMessageFromIframe}>
                    {t('ill_finish_later')}
                  </BottomButton>
                </CenteredWrapper>
              </>
            )}
          </BottomWrapper>
        </>
      )}
      <Modal
        closeOnDocumentClick
        closeOnEscape
        open={civitatisModal}
        iconSrc={experiencesIcon}
        iconAlt="Form with a red field"
        title={'Would you like to book tours, excursions or activities?'}
        text={
          'We have found lots of activities nearby your accommodation. Get the best experiences at the best prices!'
        }
        onClose={() => {
          setCivitatisModal(false);
        }}
      >
        <div>
          <ExploreButton
            label={'Explore All Experiences'}
            onClick={() => history.push('/civitatis')}
          />
        </div>
        <div>
          <NotNowButton
            label={'Not now'}
            onClick={() => {
              setCivitatisModal(false);
            }}
          />
        </div>
      </Modal>
    </>
  );
}

export {FinishScreen};
