import React from 'react';
import {useTranslation} from 'react-i18next';
import {RESERVATION_FEATURES} from '../../../../utils/constants';
import {FeatureStatusDescription} from '../../../../utils/newStatuses';
import completedIcon from '../../../../assets/completed-icon.svg';
import {
  CheckInStatusIcon,
  DepositStatusIcon,
  IdStatusIcon,
  KeyStatusIcon,
  PaymentsStatusIcon,
  PoliceStatusIcon,
  StatsStatusIcon,
  StatusesWrapper,
  StatusItem,
  StyledButton,
  TaxStatusIcon,
} from './styled';

export type ReservationFeaturesStatusesProps = {
  reservationStatus: 'INCOMPLETE' | 'COMPLETE';
  featuresStatuses: FeatureStatusDescription;
};

function ReservationFeaturesStatuses({
  reservationStatus,
  featuresStatuses,
}: ReservationFeaturesStatusesProps) {
  const {t} = useTranslation();
  const isComplete = reservationStatus === 'COMPLETE';

  if (isComplete) {
    return (
      <StyledButton>
        <img src={completedIcon} alt="" />
        {t('completed')}
      </StyledButton>
    );
  }

  return (
    <StatusesWrapper>
      {featuresStatuses[RESERVATION_FEATURES.onlineCheckIn] && (
        <StatusItem
          tooltipText={featuresStatuses[RESERVATION_FEATURES.onlineCheckIn]?.label}
        >
          <CheckInStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.onlineCheckIn]?.status}
          />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.identityVerification] && (
        <StatusItem
          tooltipText={featuresStatuses[RESERVATION_FEATURES.identityVerification]?.label}
        >
          <IdStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.identityVerification]?.status}
          />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.deposit] && (
        <StatusItem tooltipText={featuresStatuses[RESERVATION_FEATURES.deposit]?.label}>
          <DepositStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.deposit]?.status}
          />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.tax] && (
        <StatusItem tooltipText={featuresStatuses[RESERVATION_FEATURES.tax]?.label}>
          <TaxStatusIcon status={featuresStatuses[RESERVATION_FEATURES.tax]?.status} />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.payments] && (
        <StatusItem tooltipText={featuresStatuses[RESERVATION_FEATURES.payments]?.label}>
          <PaymentsStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.payments]?.status}
          />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.remoteAccess] && (
        <StatusItem
          tooltipText={featuresStatuses[RESERVATION_FEATURES.remoteAccess]?.label}
        >
          <KeyStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.remoteAccess]?.status}
          />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.police] && (
        <StatusItem tooltipText={featuresStatuses[RESERVATION_FEATURES.police]?.label}>
          <PoliceStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.police]?.status}
          />
        </StatusItem>
      )}
      {featuresStatuses[RESERVATION_FEATURES.stats] && (
        <StatusItem tooltipText={featuresStatuses[RESERVATION_FEATURES.stats]?.label}>
          <StatsStatusIcon
            status={featuresStatuses[RESERVATION_FEATURES.stats]?.status}
          />
        </StatusItem>
      )}
    </StatusesWrapper>
  );
}

export {ReservationFeaturesStatuses};
