import React from 'react';
import {useTranslation} from 'react-i18next';
import moment from 'moment';
import {useQuery} from 'react-query';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import {Exemptions} from '../../../hooks/useHousingExemptions';
import {
  getDepositLinkStripeId,
  getDepositStripeId,
  getStatTypeIfStatActive,
} from '../../../utils/reservations';
import {getGroupMembersNumber, hasAnyCompletedGuest} from '../../../utils/guestGroup';
import {
  BIOMATCH_AND_SCAN_DOC_STATUSES,
  getBiomatchAndScanDocStatus,
  getStatusesDescriptions,
  STATUS_TYPES,
} from '../../../utils/statuses';
import type {Housing, ReactEntity, Reservation} from '../../../utils/types';
import {LightReservation} from '../../../utils/types';
import {
  COUNTRIES_WITH_POLICE,
  COUNTRIES_WITH_POLICE_ALLOWED_SEND_AFTER_1_DAY,
  COUNTRIES_WITH_STAT,
  POLICE_LIKE_STAT_TYPES,
  SECURITY_DEPOSIT_DISPLAY_STATUSES,
  STAT_TYPES_WITHOUT_CHECK_OUT,
} from '../../../utils/constants';
import {getTimezoneDate} from '../../../utils/date';
import {getGuestStatStatusInCode} from '../../../utils/guest';
import api, {queryFetcher} from '../../../api';
import {useErrorToast, useModalControls} from '../../../utils/hooks';
import {
  getChecksVerificationType,
  getCountryCode,
  getTimezone,
  getStatType,
} from '../../../utils/housing';
import SendToRegistrationModal from '../SendToRegistrationModal';
import luggageIcon from '../../../assets/luggage-icon.svg';
import keyIcon from '../../../assets/key.svg';
import policemanIcon from '../../../assets/policeman.svg';
import walletIcon from '../../../assets/wallet.svg';
import businessPresentationIcon from '../../../assets/business-presentation.svg';
import superHogLogo from '../../../assets/superhog-logo.png';
import cardsIcon from '../../../assets/cards.svg';
import closedLock from '../../../assets/closed-padlock.svg';
import openLock from '../../../assets/open-padlock.svg';
import Section from '../Section';
import Loader from '../../common/Loader';
import DepositChargeModals from '../DepositChargeModals';
import ProcessPaymentRefundModals from '../ProcessPaymentRefundModals';
import StripeIdDeposit from './StripeIdDeposit';
import {
  BusinessPresentationImage,
  CardsIcon,
  Content,
  DepositIcon,
  GuestsStatusTileTitle,
  KeyImage,
  LoaderWrapper,
  LuggageImage,
  PoliceManImage,
  StatusTileContent,
  StatusTileName,
  StatusTileResolveButton,
  StatusTileSubtitle,
  StatusTileTitle,
  ResolveButton,
  TilesWrapper,
  SuperHogCardIcon
} from './styled';

export enum STATUS_COLORS {
  red = 'red',
  orange = 'orange',
  green = 'green',
  white = 'white',
  none = 'none',
}

enum ReservationDateType {
  in = 'in',
  out = 'out',
}

function StatusTileLoader() {
  return (
    <LoaderWrapper>
      <Loader height={22} />
    </LoaderWrapper>
  );
}

function fetchHousing(id = '') {
  return queryFetcher(api.housings.ENDPOINTS.one(id));
}

type StatusTileProps = {
  name: string;
  title: ReactEntity;
  statusColor?: keyof typeof STATUS_COLORS;
  subtitle?: string | JSX.Element | null;
  Image?: React.ReactNode | JSX.Element;
  ResolveButton?: React.ReactNode | JSX.Element;
  children?: React.ReactNode | JSX.Element;
};

function StatusTile({
  name,
  title,
  subtitle,
  Image,
  ResolveButton,
  statusColor,
  children,
}: StatusTileProps) {
  const displayTitle = Array.isArray(title)
    ? title.map((text, i) => {
        const hasComma = i + 1 < title.length;
        return (
          <React.Fragment key={i}>
            <div>{text}</div>
            {hasComma && ', '}
          </React.Fragment>
        );
      })
    : title;

  return (
    <StatusTileContent>
      <StatusTileName>{name}</StatusTileName>
      {Image}
      {displayTitle && (
        <StatusTileTitle color={statusColor}>
          <b>{displayTitle}</b>
        </StatusTileTitle>
      )}
      {subtitle && <StatusTileSubtitle>{subtitle}</StatusTileSubtitle>}
      {children}
      {ResolveButton}
    </StatusTileContent>
  );
}

type ReservationStatusSectionProps = {
  goToGuest: (id?: string) => void;
  reservation?: LightReservation;
  exemptions: Exemptions;
};

function ReservationStatusSection({
  reservation,
  goToGuest,
  exemptions,
}: ReservationStatusSectionProps) {
  const {t} = useTranslation();
  const [actionType, setActionType] = React.useState<STATUS_TYPES>(
    STATUS_TYPES.policeCheckIn,
  );

  const {
    openModal: openSendToRegistrationModal,
    closeModal: closeSendToRegistrationModal,
    isOpen: isSendToRegistrationModalOpen,
  } = useModalControls();
  const {
    openModal: openDepositChargeModals,
    closeModal: closeDepositChargeModals,
    isOpen: isDepositChargeModalsOpen,
  } = useModalControls();
  const {
    openModal: openProcessRefundModals,
    closeModal: closeProcessRefundModals,
    isOpen: isProcessRefundModalsOpen,
  } = useModalControls();

  const housingId = reservation?.housing_id;
  const {data: housing, status: housingStatus, error: housingError} = useQuery<
    Housing,
    [string, string]
  >(['housing', housingId], () => fetchHousing(housingId!), {
    enabled: Boolean(housingId),
    refetchOnWindowFocus: false,
  });
  useErrorToast(housingError, {
    notFoundMessage: t('errors.requested_housing_not_found'),
  });
  const statType = getStatTypeIfStatActive(housing);

  const guestGroupId = reservation?.guest_group_id;
  const {data: guestGroup, status: guestGroupStatus} = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
  });

  const isPendingSecurityDepositsStatus =
    !reservation?.security_deposit?.display_status ||
    reservation?.security_deposit?.display_status ===
      SECURITY_DEPOSIT_DISPLAY_STATUSES.pending;
  const isOnHoldSecurityDepositsStatus =
    reservation?.security_deposit?.display_status ===
    SECURITY_DEPOSIT_DISPLAY_STATUSES.onHold;
  const isChargedSecurityDepositsStatus =
    reservation?.security_deposit?.display_status ===
    SECURITY_DEPOSIT_DISPLAY_STATUSES.charged;
  const isReleasedSecurityDepositsStatus =
    reservation?.security_deposit?.display_status ===
    SECURITY_DEPOSIT_DISPLAY_STATUSES.released;

  const isSelfCheckInEnabled = Boolean(housing?.is_self_online_check_in_enabled);

  const statusesDescriptions = React.useMemo(() => {
    return getStatusesDescriptions(
      {
        ...reservation,
        housing,
        guest_group: guestGroup,
      } as Reservation,
      exemptions,
    );
  }, [guestGroup, housing, reservation, exemptions]);

  const getGuestsStatusTitle = () => {
    if (!reservation) {
      return <StatusTileLoader />;
    }

    const groupMembersNumber = getGroupMembersNumber(guestGroup);
    const numberOfGuests = guestGroup?.number_of_guests || 0;

    return (
      <>
        {groupMembersNumber}/<b>{numberOfGuests}</b>
      </>
    );
  };

  const getIsAllGuestsRegistered = () => {
    if (!reservation) {
      return false;
    }

    const groupMembersNumber = getGroupMembersNumber(guestGroup);
    const numberOfGuests = guestGroup?.number_of_guests || 0;
    return groupMembersNumber === numberOfGuests;
  };

  const getGuestStatusColor = () => {
    if (!reservation) {
      return STATUS_COLORS.white;
    }

    if (getIsAllGuestsRegistered()) {
      return STATUS_COLORS.green;
    }
    return STATUS_COLORS.orange;
  };

  const getTaxesStatusColor = () => {
    const isPaid = Boolean(reservation?.have_taxes_been_paid);
    if (isPaid) {
      return STATUS_COLORS.green;
    }

    return STATUS_COLORS.orange;
  };

  const getSuperHogtitle = () => {
    const title = reservation?.damage_insurance_status || 'Waiting';
    return title;
  };
  const getSuperHogStatusColor = () => {
    let statusColor = STATUS_COLORS.green;
    switch (reservation?.damage_insurance_status) {
      case null:
      case 'PENDING':
        statusColor = STATUS_COLORS.orange;
        break;
      case 'DENIED':
        statusColor = STATUS_COLORS.red;
        break;
      default:
        statusColor = STATUS_COLORS.green;
        break;
    }

    return statusColor;
  };

  const getSuperHogStatus = ():string => {

    let statusText:string = t('superhog_acepted');
    switch (reservation?.damage_insurance_status) {
      case 'PENDING':
        statusText = t('superhog_pending')
        break;
      case null:
        statusText = t('superhog_waiting')
        break;
      case 'ACCEPTED':
        statusText = t('superhog_acepted')
        break;
      case 'DENIED':
        statusText = t('superhog_denied')
        break;
      default:
        statusText = t('superhog_acepted')
        break;
    }

    return statusText;
  };

  const getPaymentsStatusColor = () => {
    const isPaid = statusesDescriptions[STATUS_TYPES.bookingPayments] === t('paid');

    if (isPaid) {
      return STATUS_COLORS.green;
    }

    return STATUS_COLORS.orange;
  };

  const getSelfCheckInStatusColor = () => {
    const {isDocumentAndSelfie, isOnlyOfficialDocument} = getChecksVerificationType(
      housing,
    );
    const biomatchAndScanDocumentStatus = getBiomatchAndScanDocStatus({
      isBiomatchForAllEnabled: Boolean(housing?.is_biometric_match_for_all_enabled),
      isAllGuestsPassed: Boolean(reservation?.all_guests_passed_biomatch),
      isOnlyOfficialDocument,
      isDocumentAndSelfie,
      guestGroup,
    });

    if (!isSelfCheckInEnabled) {
      return STATUS_COLORS.white;
    }

    if (biomatchAndScanDocumentStatus === BIOMATCH_AND_SCAN_DOC_STATUSES.pending) {
      return STATUS_COLORS.orange;
    }

    if (biomatchAndScanDocumentStatus === BIOMATCH_AND_SCAN_DOC_STATUSES.completed) {
      return STATUS_COLORS.green;
    }

    return STATUS_COLORS.red;
  };

  const getSecurityDepositsStatusColor = () => {
    if (isPendingSecurityDepositsStatus) {
      return STATUS_COLORS.orange;
    }

    return STATUS_COLORS.none;
  };

  const getPaymentsTitle = () => {
    return statusesDescriptions[STATUS_TYPES.bookingPayments];
  };

  const getSecurityDepositsTitle = () => {
    const statusDescription = statusesDescriptions[STATUS_TYPES.securityDeposit];

    if (isOnHoldSecurityDepositsStatus) {
      return (
        <>
          <DepositIcon src={closedLock} alt="Closed lock" /> <b>{statusDescription}</b>
        </>
      );
    }

    if (isReleasedSecurityDepositsStatus) {
      return (
        <>
          <DepositIcon src={openLock} alt="Open lock" /> <b>{statusDescription}</b>
        </>
      );
    }

    return statusDescription;
  };

  const getSecurityDepositsSubtitle = () => {
    if (isChargedSecurityDepositsStatus) {
      const chargedAmount = reservation?.security_deposit?.charged_amount;
      return t('amount_charged', {amount: chargedAmount});
    }

    return null;
  };

  const getSelfCheckInStatusSubtitle = () => {
    const {isDocumentAndSelfie, isOnlyOfficialDocument} = getChecksVerificationType(
      housing,
    );
    const biomatchAndScanDocumentStatus = getBiomatchAndScanDocStatus({
      isBiomatchForAllEnabled: Boolean(housing?.is_biometric_match_for_all_enabled),
      isAllGuestsPassed: Boolean(reservation?.all_guests_passed_biomatch),
      isOnlyOfficialDocument,
      isDocumentAndSelfie,
      guestGroup,
    });

    if (!isSelfCheckInEnabled) {
      return '';
    }

    if (biomatchAndScanDocumentStatus === BIOMATCH_AND_SCAN_DOC_STATUSES.pending) {
      return t('online_checkin_not_completed');
    }

    if (biomatchAndScanDocumentStatus === BIOMATCH_AND_SCAN_DOC_STATUSES.completed) {
      return t('biomatch_passed');
    }

    return t('biomatch_failed');
  };

  const getStatusColor = (status: any) => {
    if (status === t('completed')) {
      return STATUS_COLORS.green;
    }

    if (
      status === t('credentials_missing') ||
      status.includes(t('guests_waiting_to_be_registered'))
    ) {
      return STATUS_COLORS.orange;
    }

    return STATUS_COLORS.red;
  };

  const hasPoliceInCountry = () => {
    return COUNTRIES_WITH_POLICE.includes(getCountryCode(housing));
  };

  const hasPoliceActivated = () => {
    return housing?.police_account && housing?.is_police_registration_enabled;
  };

  const hasStatInCountry = () => {
    return COUNTRIES_WITH_STAT.includes(getCountryCode(housing));
  };

  const hasStatActivated = () => {
    return housing?.stat_account && housing?.is_stat_registration_enabled;
  };

  const hasPoliceLikeStatType = () => {
    return POLICE_LIKE_STAT_TYPES.includes(getStatTypeIfStatActive(housing));
  };

  const hasGuestsInGroup = () => {
    return Boolean(getGroupMembersNumber(guestGroup));
  };

  const getTimezoneReservationDate = (
    timezone: string,
    dateType: ReservationDateType,
  ) => {
    const dateField =
      dateType === ReservationDateType.in ? 'check_in_date' : 'check_out_date';
    const reservationDate = reservation?.[dateField];
    if (!reservationDate) {
      return null;
    }

    return getTimezoneDate(reservationDate, timezone);
  };

  const isReservationDateToday = (dateType: ReservationDateType) => {
    const timezone = getTimezone(housing);
    const reservationDate = getTimezoneReservationDate(timezone, dateType);

    if (!reservationDate) {
      return false;
    }
    const today = moment().tz(timezone);
    return reservationDate.isSame(today, 'day');
  };

  const isReservationDateTomorrow = (dateType: ReservationDateType) => {
    const timezone = getTimezone(housing);
    const checkInDate = getTimezoneReservationDate(timezone, dateType);

    if (!checkInDate) {
      return false;
    }

    const tomorrow = moment().add(1, 'days').tz(timezone);

    return checkInDate.isSame(tomorrow, 'day');
  };

  const isCheckInDateAfterTomorrow = () => {
    const timezone = getTimezone(housing);
    const checkInDate = getTimezoneReservationDate(timezone, ReservationDateType.in);

    if (!checkInDate) {
      return false;
    }

    const today = moment().tz(timezone);
    return checkInDate.isSameOrBefore(today.subtract(2, 'day'), 'day');
  };

  const isSendingAfterOneDay = () => {
    return (
      isCheckInDateAfterTomorrow() &&
      COUNTRIES_WITH_POLICE_ALLOWED_SEND_AFTER_1_DAY.includes(getCountryCode(housing))
    );
  };

  const shouldShowPoliceButton = (
    buttonType: STATUS_TYPES.policeCheckIn | STATUS_TYPES.policeCheckOut,
  ) => {
    const dateType =
      buttonType === STATUS_TYPES.policeCheckIn
        ? ReservationDateType.in
        : ReservationDateType.out;

    if (!hasPoliceInCountry()) {
      return false;
    }

    if (!hasPoliceActivated()) {
      return false;
    }

    if (!hasGuestsInGroup()) {
      return false;
    }

    if (isReservationDateToday(dateType) || isReservationDateTomorrow(dateType)) {
      return true;
    }

    return isSendingAfterOneDay();
  };

  const shouldShowStatButton = () => {
    if (!hasStatInCountry()) {
      return false;
    }

    if (!hasStatActivated()) {
      return false;
    }

    if (!hasGuestsInGroup()) {
      return false;
    }

    if (!hasPoliceLikeStatType()) {
      return false;
    }

    if (hasAnyCompletedGuest(getGuestStatStatusInCode, guestGroup)) {
      return false;
    }

    if (STAT_TYPES_WITHOUT_CHECK_OUT.includes(getStatType(housing))) {
      return true;
    }

    return (
      isReservationDateTomorrow(ReservationDateType.in) ||
      isCheckInDateAfterTomorrow() ||
      isReservationDateToday(ReservationDateType.in)
    );
  };

  const openSendDataRegistrationModal = (actionType: STATUS_TYPES) => {
    setActionType(actionType);
    openSendToRegistrationModal();
  };

  const renderTaxesButton = () => {
    if (reservation?.have_taxes_been_paid && !reservation?.payment_refund) {
      return (
        <StatusTileResolveButton
          onClick={(event) => {
            event.stopPropagation();
            openProcessRefundModals();
          }}
          type="button"
        >
          ({t('make_a_refund')})
        </StatusTileResolveButton>
      );
    }
    return null;
  };

  const renderDepositButton = () => {
    if (isChargedSecurityDepositsStatus && !reservation?.payment_refund) {
      return (
        <StatusTileResolveButton
          onClick={(event) => {
            event.stopPropagation();
            openProcessRefundModals();
          }}
          type="button"
        >
          ({t('make_a_refund')})
        </StatusTileResolveButton>
      );
    }

    if (isOnHoldSecurityDepositsStatus) {
      return (
        <StatusTileResolveButton
          onClick={(event) => {
            event.stopPropagation();
            openDepositChargeModals();
          }}
          type="button"
        >
          ({t('charge')})
        </StatusTileResolveButton>
      );
    }

    return null;
  };

  const isPoliceCompleted = () => {
    return (
      statusesDescriptions[STATUS_TYPES.policeCheckOut] === t('completed') ||
      statusesDescriptions[STATUS_TYPES.policeCheckIn] === t('completed')
    );
  };

  const renderPoliceButton = (
    actionType: STATUS_TYPES.policeCheckIn | STATUS_TYPES.policeCheckOut,
  ) => {
    if (isPoliceCompleted()) {
      return null;
    }

    return (
      shouldShowPoliceButton(actionType) && (
        <ResolveButton
          onClick={(event) => {
            event.stopPropagation();
            openSendDataRegistrationModal(actionType);
          }}
          type="button"
        >
          ({t('send_manually')})
        </ResolveButton>
      )
    );
  };

  const renderStatButton = (
    actionType: STATUS_TYPES.statsCheckIn | STATUS_TYPES.statsCheckOut,
  ) => {
    return (
      shouldShowStatButton() && (
        <ResolveButton
          onClick={(event) => {
            event.stopPropagation();
            openSendDataRegistrationModal(actionType);
          }}
          type="button"
        >
          ({t('send_manually')})
        </ResolveButton>
      )
    );
  };

  const getPoliceEnabled = () => {
    return housing?.is_auto_police_registration_enabled;
  };

  return (
    <Section title={t('booking_status')}>
      <Content>
        {!reservation || housingStatus === 'loading' || guestGroupStatus === 'loading' ? (
          <LoaderWrapper>
            <Loader color="#EEEEEE" height={45} width={45} />
          </LoaderWrapper>
        ) : (
          <>
            <TilesWrapper>
              <StatusTileContent>
                <StatusTileName>{t('guest_registration')}</StatusTileName>
                <LuggageImage src={luggageIcon} alt="Luggage" />
                <GuestsStatusTileTitle color={getGuestStatusColor()}>
                  {getGuestsStatusTitle()}
                </GuestsStatusTileTitle>
                <>
                  <StatusTileSubtitle>{t('registered_guests')}</StatusTileSubtitle>
                  {!getIsAllGuestsRegistered() && (
                    <StatusTileResolveButton onClick={() => goToGuest()} type="button">
                      ({t('register_guest')})
                    </StatusTileResolveButton>
                  )}
                </>
              </StatusTileContent>
              {statusesDescriptions[STATUS_TYPES.bookingPayments] && (
                <StatusTile
                  name={t('booking_payments')}
                  title={getPaymentsTitle()}
                  statusColor={getPaymentsStatusColor()}
                  Image={<CardsIcon src={walletIcon} alt="" />}
                />
              )}
              {statusesDescriptions[STATUS_TYPES.securityDeposit] && (
                <StatusTile
                  name={t('security_deposit')}
                  title={getSecurityDepositsTitle()}
                  statusColor={getSecurityDepositsStatusColor()}
                  ResolveButton={renderDepositButton()}
                  Image={<CardsIcon src={cardsIcon} alt="" />}
                >
                  {!isPendingSecurityDepositsStatus && (
                    <StatusTileSubtitle>
                      {getSecurityDepositsSubtitle()}
                    </StatusTileSubtitle>
                  )}
                  <StripeIdDeposit
                    id={getDepositStripeId(reservation)}
                    link={getDepositLinkStripeId(reservation)}
                  />
                </StatusTile>
              )}
              {statusesDescriptions[STATUS_TYPES.policeCheckIn] && getPoliceEnabled() && (
                <StatusTile
                  name={t('police_in')}
                  statusColor={getStatusColor(
                    statusesDescriptions[STATUS_TYPES.policeCheckIn],
                  )}
                  title={statusesDescriptions[STATUS_TYPES.policeCheckIn]}
                  Image={<PoliceManImage src={policemanIcon} alt="" />}
                  ResolveButton={renderPoliceButton(STATUS_TYPES.policeCheckIn)}
                />
              )}
              {statusesDescriptions[STATUS_TYPES.policeCheckOut] && getPoliceEnabled() && (
                <StatusTile
                  name={t('police_out')}
                  statusColor={getStatusColor(
                    statusesDescriptions[STATUS_TYPES.policeCheckOut],
                  )}
                  title={statusesDescriptions[STATUS_TYPES.policeCheckOut]}
                  Image={<PoliceManImage src={policemanIcon} alt="" />}
                  ResolveButton={renderPoliceButton(STATUS_TYPES.policeCheckOut)}
                />
              )}
              {statusesDescriptions[STATUS_TYPES.statsCheckIn] && statType !== '' && (
                <StatusTile
                  name={t('stats_in')}
                  statusColor={getStatusColor(
                    statusesDescriptions[STATUS_TYPES.statsCheckIn],
                  )}
                  title={statusesDescriptions[STATUS_TYPES.statsCheckIn]}
                  Image={
                    <BusinessPresentationImage
                      src={businessPresentationIcon}
                      alt="Business presentation"
                    />
                  }
                  ResolveButton={renderStatButton(STATUS_TYPES.statsCheckIn)}
                />
              )}
              {statusesDescriptions[STATUS_TYPES.statsCheckOut] &&
                !STAT_TYPES_WITHOUT_CHECK_OUT.includes(statType) &&
                statType !== '' && (
                  <StatusTile
                    name={t('stats_out')}
                    statusColor={getStatusColor(
                      statusesDescriptions[STATUS_TYPES.statsCheckOut],
                    )}
                    title={statusesDescriptions[STATUS_TYPES.statsCheckOut]}
                    Image={
                      <BusinessPresentationImage src={businessPresentationIcon} alt="" />
                    }
                  />
                )}
              {statusesDescriptions[STATUS_TYPES.selfCheckIn] && (
                <StatusTile
                  name={t('self_checkin')}
                  title={statusesDescriptions[STATUS_TYPES.selfCheckIn]}
                  subtitle={getSelfCheckInStatusSubtitle()}
                  statusColor={getSelfCheckInStatusColor()}
                  Image={<KeyImage src={keyIcon} alt="" />}
                />
              )}
              {statusesDescriptions[STATUS_TYPES.taxes] && (
                <StatusTile
                  name={t('taxes')}
                  title={statusesDescriptions[STATUS_TYPES.taxes]}
                  statusColor={getTaxesStatusColor()}
                  Image={<CardsIcon src={cardsIcon} alt="" />}
                  ResolveButton={renderTaxesButton()}
                />
              )}
               {statusesDescriptions[STATUS_TYPES.superHog] && (
                <StatusTile
                  name={t('superhog_protection')}
                  title={getSuperHogtitle()}
                  statusColor={getSuperHogStatusColor()}
                  subtitle={getSuperHogStatus()}
                  Image={<SuperHogCardIcon src={superHogLogo} alt="" />}
                />
              )}
            </TilesWrapper>
            {isSendToRegistrationModalOpen && (
              <SendToRegistrationModal
                handleModalCancel={closeSendToRegistrationModal}
                shouldShowWarning={isSendingAfterOneDay()}
                actionType={actionType}
                reservationId={reservation.id}
                guestGroupId={reservation.guest_group_id}
                statType={statType}
              />
            )}
            {isDepositChargeModalsOpen && (
              <DepositChargeModals
                open
                onClose={closeDepositChargeModals}
                reservation={reservation}
              />
            )}
            {isProcessRefundModalsOpen && (
              <ProcessPaymentRefundModals
                open
                onClose={closeProcessRefundModals}
                reservation={reservation}
              />
            )}
          </>
        )}
      </Content>
    </Section>
  );
}

export {ReservationStatusSection};
