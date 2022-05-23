import styled from 'styled-components';
import {STATUS_COLORS} from './ReservationStatusSection';

export const TilesWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  flex-wrap: wrap;
`;

export const StatusTileContent = styled.div`
  width: 177px;
  min-height: 159px;
  box-shadow: 0 5px 5px #2148ff1a;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 24px;
  box-sizing: border-box;
  padding: 0 12px 14px;
`;

export const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;

  & ${StatusTileContent}:not(:last-child) {
    margin-right: 20px;
  }
`;

export const StatusTileName = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #161643;
  margin-top: -8px;
  font-size: 14px;
  align-self: flex-start;
`;

export const LuggageImage = styled.img`
  height: 28px;
  margin-top: 25px;
`;

export const PoliceManImage = styled.img`
  width: 26px;
  height: 34px;
  margin-top: 19px;
`;

export const BusinessPresentationImage = styled.img`
  width: 50px;
  height: 35px;
  margin-top: 17px;
`;

export const KeyImage = styled.img`
  width: 21px;
  height: 34px;
  margin-top: 17px;
`;

type StatusTileTitleProps = {
  color?: keyof typeof STATUS_COLORS;
};

function getStatusColor({color}: StatusTileTitleProps) {
  if (color === STATUS_COLORS.green) {
    return '#35E5BC';
  }

  if (color === STATUS_COLORS.red) {
    return '#FF2467';
  }

  if (color === STATUS_COLORS.orange) {
    return '#FFC400';
  }

  return '';
}

export const StatusTileTitle = styled.div<StatusTileTitleProps>`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  margin-top: 10px;
  color: #161643;
  text-align: center;

  & > b {
    font-weight: normal;
    font-family: ProximaNova-Bold, sans-serif;

    & > div {
      display: inline-block;
    }
  }

  &::before {
    content: '';
    position: relative;
    top: -1px;
    display: inline-block;
    vertical-align: middle;
    height: 7px;
    width: 7px;
    border-radius: 50%;
    background-color: ${getStatusColor};
    margin-right: ${(props) => getStatusColor(props) && '7px'};
  }
`;

export const GuestsStatusTileTitle = styled(StatusTileTitle)`
  font-size: 24px;
  margin-top: 6px;
`;

export const StatusTileSubtitle = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 12px;
  color: #161643;
  text-align: center;
`;

export const ResolveButton = styled.button`
  outline: none;
  border: none;
  background-color: transparent;
  color: #385cf8;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 14px;
  cursor: pointer;
  text-transform: lowercase;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;

export const StatusTileResolveButton = styled(ResolveButton)`
  margin: auto 0 7px;
  text-transform: none;
  text-decoration-line: underline;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  min-height: 183px;
`;

export const CardsIcon = styled.img`
  width: 34px;
  height: 34px;
  margin-top: 19px;
`;
export const SuperHogCardIcon = styled.img`
  width: 63px;
  height: auto;
  margin-top: 19px;
`;

export const DepositIcon = styled.img`
  width: 13px;
  height: 17px;
  margin-right: 3px;
  position: relative;
  top: 1px;
`;
