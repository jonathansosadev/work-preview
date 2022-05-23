import {ComponentType} from 'react';
import styled, {css} from 'styled-components';
import {ReactComponent as CheckInSVG} from '../../../../assets/reservation-statuses/checkin-status-icon.svg';
import {ReactComponent as TaxSVG} from '../../../../assets/reservation-statuses/tax-status-icon.svg';
import {ReactComponent as PaymentsSVG} from '../../../../assets/reservation-statuses/payments-status-icon.svg';
import {ReactComponent as IdSVG} from '../../../../assets/reservation-statuses/id-status-icon.svg';
import {ReactComponent as DepositSVG} from '../../../../assets/reservation-statuses/deposit-status-icon.svg';
import {ReactComponent as KeySVG} from '../../../../assets/reservation-statuses/key-status-icon.svg';
import {ReactComponent as PoliceSVG} from '../../../../assets/reservation-statuses/police-status-icon.svg';
import {ReactComponent as StatsSVG} from '../../../../assets/reservation-statuses/stats-status-icon.svg';
import HoverTooltip from '../../HoverTooltip';

enum RESERVATION_FEATURES_STATUSES {
  complete = 'complete',
  incomplete = 'incomplete',
  error = 'error',
}
const StatusColors = {
  [RESERVATION_FEATURES_STATUSES.complete]: '#254BFA',
  [RESERVATION_FEATURES_STATUSES.incomplete]: '#c5c5d5',
  [RESERVATION_FEATURES_STATUSES.error]: '#FF2467',
};

const baseStylesStatusIcon = css<{status?: RESERVATION_FEATURES_STATUSES}>`
  fill: ${(props) => (props.status ? StatusColors[props.status] : 'black')};
  filter: ${(props) => {
    return props.status === RESERVATION_FEATURES_STATUSES.complete
      ? 'drop-shadow(0px 5px 3px rgba(0, 0, 0, 0.18))'
      : 'none';
  }};
`;

const getIconStyles = (icon: ComponentType) =>
  styled(icon)`
    ${baseStylesStatusIcon}
  `;

export const CheckInStatusIcon = getIconStyles(CheckInSVG);
export const TaxStatusIcon = getIconStyles(TaxSVG);
export const PaymentsStatusIcon = getIconStyles(PaymentsSVG);
export const IdStatusIcon = getIconStyles(IdSVG);
export const DepositStatusIcon = getIconStyles(DepositSVG);
export const KeyStatusIcon = getIconStyles(KeySVG);
export const PoliceStatusIcon = getIconStyles(PoliceSVG);
export const StatsStatusIcon = getIconStyles(StatsSVG);

export const StyledButton = styled.div`
  color: #161643;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  display: inline-flex;
  align-items: center;
  padding: 10px 0;

  > img {
    margin-right: 8px;
    border-radius: 100%;
    width: 20px;
    height: 20px;
    box-shadow: 0 3px 6px #00000029;
  }
`;

export const StatusItem = styled(HoverTooltip)`
  display: flex;
  align-items: center;
  position: relative;
  padding: 0 12px;
  height: 20px;

  & .tooltip {
    font-size: 16px;
    font-family: ProximaNova-Medium, sans-serif;
  }

  & img {
    fill: red;
  }
`;

export const StatusesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 5px 0;
  row-gap: 8px;
  align-items: center;
  position: relative;

  & ${StatusItem} {
    border-left: 1px solid #dedeeb;
  }

  & ${StatusItem}:first-child {
    border-left: none;
    padding-left: 0;
  }
`;
