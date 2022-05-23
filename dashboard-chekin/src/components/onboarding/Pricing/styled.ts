import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';

const mainContentWidth = '416px';
const planBlockWidth = '230px';
const priceBlockWidth = '185px';
const blockHeight = '134px';
const mobileBreakpoint = '660px';

export const TitleWrapper = styled.div`
  margin: 40px auto 46px;
`;

export const Content = styled.div`
  text-align: center;
  min-width: 660px;
  cursor: default;
`;

export const Image = styled.img`
  height: 73px;
  width: 73px;
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 19px;
  text-align: center;
  color: #161643;
  text-transform: uppercase;
  margin-top: 12px;
`;

export const PriceTilesContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  margin: 30px auto 0;
  cursor: default;

  @media (max-width: ${mobileBreakpoint}) {
    flex-direction: column;
  }
`;

export const PriceLoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${mainContentWidth};
`;

export const PriceTile = styled.div`
  display: flex;
  flex-direction: column;
  width: ${priceBlockWidth};

  @media (max-width: ${mobileBreakpoint}) {
    width: ${planBlockWidth};
  }
`;

export const PriceHeader = styled.div`
  height: 43px;
  border-right: solid 1px rgba(255, 255, 255, 0.2);
  background-color: #2960f5;
  text-align: center;
  line-height: 43px;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 15px;
  color: #ffffff;
  text-transform: uppercase;

  & > span {
    text-transform: none;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 14px;
  }
`;

export const PriceBlock = styled.div`
  width: 100%;
  border-right: solid 1px rgba(0, 66, 154, 0.12);
  border-bottom: solid 1px rgba(0, 66, 154, 0.12);
  background-color: #ffffff;
  text-align: center;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 0 15px 15px;
  height: ${blockHeight};

  @media (max-width: ${mobileBreakpoint}) {
    height: auto;
    padding-bottom: 30px;
    border: solid 1px rgba(0, 66, 154, 0.12);
    min-height: ${blockHeight};
  }
`;

export const Price = styled.div`
  text-align: center;
  margin-top: 29px;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 36px;
  color: #161643;

  @media (max-width: ${mobileBreakpoint}) {
    margin-top: 9px;
  }
`;

export const PriceLabel = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 13px;
  color: #161643;
  text-align: center;
  margin-top: 1px;
  text-transform: uppercase;
`;

export const PlanTileHeader = styled(PriceHeader)`
  border: none;
  background-color: white;
`;

export const PlanBlock = styled(PriceBlock)`
  border-left: solid 1px rgba(0, 66, 154, 0.12);
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #2960f5;
  width: ${planBlockWidth};
  height: ${blockHeight};
`;

export const PlanTile = styled(PriceTile)`
  width: ${planBlockWidth};

  & ${PlanBlock}:nth-child(2) {
    border-top: solid 1px rgba(0, 66, 154, 0.12);
  }

  @media (max-width: ${mobileBreakpoint}) {
    display: none;
  }
`;

export const HousesImage = styled.img`
  height: 32px;
  width: 32px;
  margin: 26px auto 15px;
`;

export const MobileHousesImage = styled(HousesImage)`
  margin-bottom: 0;
  display: none;

  @media (max-width: ${mobileBreakpoint}) {
    display: block;
  }
`;

export const HotelImage = styled.img`
  margin-top: 22px;
  width: 37px;
  height: 29px;
  margin-bottom: 11px;
`;

export const MobileHotelImage = styled(HousesImage)`
  margin-bottom: 0;
  display: none;

  @media (max-width: ${mobileBreakpoint}) {
    display: block;
  }
`;

export const Notes = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 15px;
  text-align: center;
  color: #161643;
  position: relative;
  max-width: 594px;
  margin: 43px auto 0;
  cursor: default;
`;

export const ErrorContainer = styled(PriceLoaderWrapper)`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 24px;
  text-align: center;
  flex-direction: column;
  height: ${mainContentWidth};
  color: #161643;

  & > div {
    margin-top: -30px;
  }

  & button {
    font-size: 17px;
  }
`;

export const Illustration = styled.img`
  position: absolute;
  width: 257px;
  height: 268px;
  right: 43px;
  top: 378px;
  z-index: 1;
  user-select: none;

  @media (max-width: ${DEVICE.laptop}) {
    display: none;
  }
`;
