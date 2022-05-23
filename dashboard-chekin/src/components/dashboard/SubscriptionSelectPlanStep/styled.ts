import styled from 'styled-components';
import FormHeader from '../FormHeader';
import Button from '../Button';
import Select from '../Select';

export const SubscriptionHeading = styled(FormHeader)`
  justify-content: center;
`;

export const SubHeader = styled.div`
  text-align: center;
  font-size: 18px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #161643;
  margin-top: 49px;
  margin-bottom: 30px;
`;

const planTileWidth = `443px`;

export const PlanTile = styled.div`
  position: relative;
  margin: 0 auto 22px;
  box-shadow: 0 0 7px #2699fb29;
  border-radius: 6px;
  min-height: 115px;
  width: ${planTileWidth};
`;

export const PlanTileMonth = styled.div`
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  padding-top: 18px;
  margin-left: 20px;
`;

const bestValueWidth = '146px';
export const PlanTileBestValue = styled.div`
  background: #385cf8;
  padding: 4px 14px;
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #ffffff;
  margin-bottom: -8px;
  box-sizing: border-box;
  width: ${bestValueWidth};
`;

export const PlanTilePriceInfo = styled.div`
  margin: 3px 0 3px 20px;
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  text-transform: lowercase;
`;

export const PlanTilePriceValue = styled.span`
  font-size: 24px;
  font-family: ProximaNova-Bold, sans-serif;
  color: #385cf8;
`;

export const PlanTilePriceDescriptionInfo = styled.div`
  font-size: 15px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #161643;
  padding-bottom: 28px;
  margin-left: 20px;
`;

export const PlanTilePriceDescriptionTip = styled.span`
  margin-left: 4px;
  font-size: 13px;
  font-family: ProximaNova-Medium, sans-serif;
  color: #9696b9;
  text-transform: lowercase;
`;

export const SubscribeButton = styled(Button)`
  margin: 0 auto 34px;
  border: 1px solid #385cf8;
  min-width: 162px;
  position: absolute;
  right: 13px;
  bottom: -20px;
  height: 32px;

  div {
    font-size: 16px;
    margin: 0 auto;
    height: auto;
  }
`;

export const CancelButtonWrapper = styled.div`
  margin: 19px auto 34px;
  display: flex;
  justify-content: center;
`;

export const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 7%;
`;

export const CurrencySelect = styled(Select)`
  width: ${bestValueWidth};

  & .select__menu-list,
  .select__menu {
    width: ${bestValueWidth} !important;
  }
`;

export const CurrencyContainer = styled.div`
  width: ${planTileWidth};
  margin: auto auto 10px;
`;

export const CurrencyLabel = styled.span`
  text-transform: none;
`;
