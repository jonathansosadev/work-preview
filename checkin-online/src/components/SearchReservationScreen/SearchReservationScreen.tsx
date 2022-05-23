import React from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import {isMobile} from 'react-device-detect';
import useSWR from 'swr';
import {useTranslation} from 'react-i18next';
import {MOBILE_SEARCH_STEPS, SEARCH_RESERVATION_FORM_NAMES} from './constants';
import {PATHS} from '../../Routes';
import {useReservation} from '../../context/reservation';
import {useStoredURLParams} from '../../context/storedURLParams';
import {
  useIsMounted,
  useErrorModal,
  useStatus,
  useModalControls,
  useScreenResize,
} from '../../utils/hooks';
import {device} from '../../styled/device';
import api, {getURL} from '../../api';
import Header from '../Header';
import {ReservationNotFoundModal} from './ReservationNotFoundModal/ReservationNotFoundModal';
import {SearchByBookingReferenceForm} from './components/SearchByBookingReferenceForm';
import {SearchByBookingDetailsForm} from './components/SearchByBookingDetailsForm';
import {
  Container,
  Wrapper,
  Title,
  Logo,
  Subtitle,
  Content,
  Item,
  VerticalLine,
} from './styled';

type LocationType = {
  l?: string;
  user?: string;
  housingId: string;
};

export type FormTypes = {
  [SEARCH_RESERVATION_FORM_NAMES.lead_email]: string;
  [SEARCH_RESERVATION_FORM_NAMES.check_in_date]: Date | string;
  [SEARCH_RESERVATION_FORM_NAMES.booking_reference]: string;
};

function SearchReservationScreen() {
  const {t} = useTranslation();
  const {refreshReservation} = useReservation();
  const {setNewReservationId} = useStoredURLParams();
  const {ErrorModal, displayError} = useErrorModal();
  const {isLoading, setStatus} = useStatus();
  const payloadFormRef = React.useRef<Partial<FormTypes>>();
  const location = useLocation<LocationType>();
  const history = useHistory();
  const shortHousingId = location?.state?.housingId;
  const l = location?.state?.l;
  const user = location?.state?.user;
  const [mobileStep, setMobileStep] = React.useState<MOBILE_SEARCH_STEPS>(
    MOBILE_SEARCH_STEPS.bookingReference,
  );
  const {isMatch} = useScreenResize(device.laptop);
  const isMobileMode = isMatch || isMobile;

  const {
    isOpen: isOpenReservationNotFoundModal,
    openModal: openReservationNotFoundModal,
  } = useModalControls();

  const isMounted = useIsMounted();
  const {data: housing} = useSWR(
    shortHousingId ? getURL(`housings/${shortHousingId}/`) : null,
  );
  const [foundReservationId, setFoundReservationId] = React.useState('');
  const logo = housing?.picture?.src;
  const title = housing?.name;
  const country = housing?.location?.country?.code;

  const searchReservationByDetails = async (
    payload: Omit<FormTypes, SEARCH_RESERVATION_FORM_NAMES.booking_reference>,
  ) => {
    const id = shortHousingId;

    const {data, error} = await api.universalLink.searchReservation(id, payload);

    if (!isMounted.current) {
      return;
    }

    if (data) {
      const reservationId = data.reservation_id;

      if (reservationId) {
        setNewReservationId(reservationId);
        setFoundReservationId(reservationId);
      } else {
        payloadFormRef.current = payload;
        openReservationNotFoundModal();
        return setStatus('idle');
      }
    }

    if (error) {
      setStatus('error');
      displayError(error);
    }
  };

  const searchReservationByBookingReference = async (
    payload: Pick<FormTypes, SEARCH_RESERVATION_FORM_NAMES.booking_reference>,
  ) => {
    const id = shortHousingId;
    const {booking_reference} = payload;

    const {data, error} = await api.reservations.getAll(
      `housing_id=${id}&booking_reference=${encodeURIComponent(booking_reference)}`,
    );

    if (!isMounted.current) {
      return;
    }

    if (data) {
      const reservationId = data?.results?.[0]?.id;

      if (reservationId) {
        setNewReservationId(reservationId);
        setFoundReservationId(reservationId);
      } else {
        payloadFormRef.current = payload;
        openReservationNotFoundModal();
        return setStatus('idle');
      }
    }

    if (error) {
      setStatus('error');
      displayError(error);
    }
  };

  React.useLayoutEffect(
    function fetchReservation() {
      if (foundReservationId) {
        const refetchReservation = async () => {
          await refreshReservation();
          setStatus('success');

          history.push(`/?reservation-id=${foundReservationId}&l=${l}&user=${user}`, {
            fromHousingFlow: true,
          });
        };

        refetchReservation();
      }
    },
    [foundReservationId, history, user, l, refreshReservation, setStatus],
  );

  const handleChangeMobileStep = (step: MOBILE_SEARCH_STEPS) => () => setMobileStep(step);
  const handleNextFromNotFoundModal = () => {
    const payload = payloadFormRef.current;

    history.push(PATHS.newReservation, {
      startDate: payload?.[SEARCH_RESERVATION_FORM_NAMES.check_in_date],
      email: payload?.[SEARCH_RESERVATION_FORM_NAMES.lead_email],
      housingId: shortHousingId,
      logo,
      title,
      country,
      l,
      user,
    });
  };

  return (
    <div>
      <Header hideBackButton title={t('online_checkin')} />
      <Container>
        {housing && (
          <Wrapper>
            {logo && <Logo src={logo} alt="random" />}
            <Title>{t('welcome_to_housing_name', {housingName: title})}</Title>
            <Subtitle>{t('welcome_to_housing_name_subtitle')}</Subtitle>
            <Content>
              <Item
                isMobileMode={isMobileMode}
                isVisible={mobileStep === MOBILE_SEARCH_STEPS.bookingReference}
              >
                <SearchByBookingReferenceForm
                  onChangeMobileStep={handleChangeMobileStep}
                  onSearch={searchReservationByBookingReference}
                  isMobileMode={isMobileMode}
                  isLoading={isLoading}
                  setStatus={setStatus}
                />
              </Item>
              <Item>
                <span>{t('or')}</span>
                <VerticalLine />
              </Item>
              <Item
                isMobileMode={isMobileMode}
                isVisible={mobileStep === MOBILE_SEARCH_STEPS.dateAndEmail}
              >
                <SearchByBookingDetailsForm
                  onChangeMobileStep={handleChangeMobileStep}
                  onSearch={searchReservationByDetails}
                  isMobileMode={isMobileMode}
                  isLoading={isLoading}
                  setStatus={setStatus}
                />
              </Item>
            </Content>
          </Wrapper>
        )}
      </Container>
      <ReservationNotFoundModal
        open={isOpenReservationNotFoundModal}
        onNext={handleNextFromNotFoundModal}
      />
      <ErrorModal />
    </div>
  );
}

export {SearchReservationScreen};
