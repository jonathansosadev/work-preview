import styled from 'styled-components';
import {DEVICE} from 'styled/device';

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 42px;
  text-align: center;
  cursor: default;
  padding: 0 10px;
  color: #161643;

  @media (max-width: ${DEVICE.mobileM}) {
    font-size: 41px;
  }
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  font-weight: 300;
  max-width: 568px;
  text-align: center;
  cursor: default;
  margin: 3px auto 25px;
  box-sizing: border-box;
  padding: 0 10px;
  color: #161643;
`;

export const Wrapper = styled.div`
  background-color: white;
  height: 100%;
  width: 100%;
`;

export const DimensionsWrapper = styled.div`
  max-width: ${DEVICE.laptopM};
  max-height: 720px;
  height: 100%;
  width: 100%;
  margin: auto;
  position: relative;
`;

export const Content = styled.div`
  position: relative;
  z-index: 2;
  padding: 0 10px 30px;
  box-sizing: border-box;
`;

export const SyncTile = styled.div`
  margin: auto auto 56px;
  max-width: 471px;
  min-height: 362px;
  border-radius: 3px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: ${DEVICE.mobileL}) {
    box-shadow: none;
  }
`;

export const LeavingModalContent = styled.div`
  padding: 50px 22px 19px;
`;

export const SubscriptionBoldText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  color: #00429a;
`;

export const SubscriptionNormalText = styled.div`
  font-family: SFProDisplay-Light, sans-serif;
  font-size: 18px;
  font-weight: 300;
  color: #00429a;
`;

export const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #eeeeee;
  border-radius: 50%;
`;

export const ThreeDotsGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 45px auto 41px;

  & ${Dot}:nth-child(2) {
    margin: 0 17px;
  }
`;

export const StepText = styled.div`
  max-width: 383px;
  min-height: 89px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  text-align: center;
  color: #161643;
  cursor: default;
  padding: 0 10px;

  & b {
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const StepTextLink = styled.a`
  text-decoration: none;
  min-height: 89px;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 18px;
  text-align: center;
  color: #2960f5;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

export const ErrorMessage = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 13px;
  margin: 2px 0 0;
  text-align: right;
  width: 255px;
  color: #ff2467;
`;

export const MainLogo = styled.img`
  width: 112px;
`;
