import styled from 'styled-components';
import {contentStyle as baseContentStyle} from '../Modal/styled';
import {DEVICE} from '../../../styled/device';

export const contentStyle = {
  ...baseContentStyle,
  marginTop: 70,
};

type ActiveProps = {
  active?: boolean;
};

export const PeriodicityTile = styled.div<ActiveProps>`
  width: 235px;
  min-height: 198px;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  user-select: none;
  box-sizing: border-box;
  box-shadow: 0 15px 15px 0
    ${(props) => (props.active ? 'transparent' : 'rgba(38, 153, 251, 0.1)')};
  border: solid ${(props) => (props.active ? `2px #161643` : '1px #2960F5')};
  background-color: white;
`;

export const PeriodicityPrice = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 46px;
  font-weight: bold;
  text-align: center;
  margin-top: 40px;
  text-transform: uppercase;
  word-break: break-all;
  color: #161643;
`;

export const PeriodicityPriceLabel = styled.div`
  font-size: 11px;
  margin-top: 11px;
  font-family: ProximaNova-Bold, sans-serif;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  word-break: break-all;
  color: #161643;
`;

export const PeriodicityTileTitle = styled.div<ActiveProps>`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 19px;
  font-weight: 500;
  text-align: center;
  text-transform: uppercase;
  margin-top: ${(props) => (props.active ? '13px' : '14px')};
  color: ${(props) => (props.active ? '#161643' : '#2960F5')};
`;

export const OpenImageWrapper = styled.span`
  height: 22px;
  width: 22px;
  border-radius: 50%;
  user-select: none;
  display: inline-block;
  text-align: center;
  box-shadow: 0 8px 8px 0 rgba(38, 153, 251, 0.16);
  padding-top: 2px;
  box-sizing: border-box;

  & > img {
    width: 16px;
    height: 10px;
  }
`;

export const OpenText = styled.span`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 13px;
  text-align: center;
  color: #2960f5;
  margin-left: 7px;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 14px;
  }
`;

export const Trigger = styled.div`
  position: absolute;
  left: 6px;
  top: 11px;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }
`;

export const HowWeCalcThePriceTrigger = styled.div`
  position: static;
  padding: 9px 0 10px;
  cursor: pointer;

  &:hover {
    opacity: 0.7;
  }

  &:active {
    opacity: 1;
  }

  & ${OpenImageWrapper} {
    height: 32px;
    width: 32px;
    line-height: 34px;

    & > img {
      width: 20px;
      height: 13px;
    }
  }

  & ${OpenText} {
    color: #2960f5;
    font-size: 16px;
    font-family: ProximaNova-Medium, sans-serif;
  }
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 19px;
  text-align: center;
  margin: 14px auto 24px;
  color: #161643;
  text-transform: uppercase;
`;

export const Content = styled.div`
  padding: 0 18px 22px;
  text-align: center;
`;

export const PricingPeriodicityTile = styled(PeriodicityTile)`
  cursor: default;
  min-height: 142px;
  box-shadow: none;
  margin: 0 auto 15px;

  & ${PeriodicityPrice} {
    margin-top: 5px;
  }

  & ${PeriodicityPriceLabel} {
    margin: 0 auto;
  }
`;

export const ButtonWrapper = styled.div`
  text-align: center;
  margin-top: 30px;

  & > button {
    min-width: 235px;
    height: 50px;
    border-radius: 3px;
    box-shadow: 0 5px 5px 0 rgba(38, 153, 251, 0.1);
    font-size: 14px;
  }
`;

export const LoaderWrapper = styled.div`
  margin: auto;
  width: 235px;
  line-height: 315px;
`;

export const TilesWrapper = styled.div`
  height: 315px;
`;

export const PricingPeriodicityPriceTitle = styled(PeriodicityTileTitle)`
  text-transform: none;

  & > span {
    font-size: 16px;
  }
`;
