import React from 'react';
import {useTranslation} from 'react-i18next';
import {RESERVATION_FEATURES_STATUSES} from '../../../../utils/newStatuses';
import {Body, Row, RowItem, RowTitle, Title, TooltipWrapper} from './styled';
import {
  CheckInStatusIcon,
  DepositStatusIcon,
  IdStatusIcon,
  KeyStatusIcon,
  PaymentsStatusIcon,
  PoliceStatusIcon,
  StatsStatusIcon,
  TaxStatusIcon,
} from '../ReservationFeaturesStatuses/styled';

function ReservationStatusTooltip() {
  const {t} = useTranslation();

  return (
    <TooltipWrapper
      content={
        <div>
          <Title>{t('icons_meaning')}</Title>
          <Body>
            <Row>
              <RowTitle>{t('online_check_in')}</RowTitle>
              <RowItem>
                <CheckInStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('not_sent')}</span>
              </RowItem>
              <RowItem>
                <CheckInStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('sent')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('identity_verification')}</RowTitle>
              <RowItem>
                <IdStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('not_verified')}</span>
              </RowItem>
              <RowItem>
                <IdStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('verified')}</span>
              </RowItem>
              <RowItem>
                <IdStatusIcon status={RESERVATION_FEATURES_STATUSES.error} />
                <span>{t('failed')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('deposit')}</RowTitle>
              <RowItem>
                <DepositStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('not_collected')}</span>
              </RowItem>
              <RowItem>
                <DepositStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('collected')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('tourist_taxes')}</RowTitle>
              <RowItem>
                <TaxStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('unpaid')}</span>
              </RowItem>
              <RowItem>
                <TaxStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('paid')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('payments')}</RowTitle>
              <RowItem>
                <PaymentsStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('unpaid')}</span>
              </RowItem>
              <RowItem>
                <PaymentsStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('paid')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('remote_access')}</RowTitle>
              <RowItem>
                <KeyStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('not_sent')}</span>
              </RowItem>
              <RowItem>
                <KeyStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('sent')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('police')}</RowTitle>
              <RowItem>
                <PoliceStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('on_hold')}</span>
              </RowItem>
              <RowItem>
                <PoliceStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('sent')}</span>
              </RowItem>
              <RowItem>
                <PoliceStatusIcon status={RESERVATION_FEATURES_STATUSES.error} />
                <span>{t('error')}</span>
              </RowItem>
            </Row>
            <Row>
              <RowTitle>{t('stats')}</RowTitle>
              <RowItem>
                <StatsStatusIcon status={RESERVATION_FEATURES_STATUSES.incomplete} />
                <span>{t('on_hold')}</span>
              </RowItem>
              <RowItem>
                <StatsStatusIcon status={RESERVATION_FEATURES_STATUSES.complete} />
                <span>{t('sent')}</span>
              </RowItem>
              <RowItem>
                <StatsStatusIcon status={RESERVATION_FEATURES_STATUSES.error} />
                <span>{t('error')}</span>
              </RowItem>
            </Row>
          </Body>
        </div>
      }
      position="left"
    />
  );
}

export {ReservationStatusTooltip};
