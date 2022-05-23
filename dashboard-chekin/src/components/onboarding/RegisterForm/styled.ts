import styled from 'styled-components';
import {Wrapper as SelectWrapper, DisplayIcon} from '../Select/styled';
import {CheckboxWrapper as Checkbox, Box, AcceptIconImg, Label} from '../Checkbox/styled';
import {DEVICE} from 'styled/device';
import {Trigger} from '../PricingModal/styled';
import {ErrorMessage} from '../../../styled/onboarding';
import {MainLogo} from '../../../styled/onboarding';

const wrappingWidth = '606px';

export const Wrapper = styled.div`
  text-align: center;
  position: relative;
  max-width: ${DEVICE.laptopM};
  max-height: 720px;
  margin: auto;
  cursor: default;
`;

export const Logo = styled(MainLogo)`
  position: absolute;
  left: 20px;
  top: 13px;
  z-index: 2;

  @media (max-width: 1210px) {
    left: 4%;
  }

  @media (max-width: ${DEVICE.tablet}) {
    position: static;
    margin-top: 15px;
  }
`;

export const FormTile = styled.form`
  box-sizing: border-box;
  padding: 20px 20px 25px;
  margin: 12px auto;
  max-width: 643px;
  min-height: 445px;
  border-radius: 8px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  position: relative;
  z-index: 1;
  background-color: #ffffff;

  @media (max-width: ${DEVICE.mobileL}) {
    box-shadow: none;
  }
`;

export const FieldWrapper = styled.div`
  padding-bottom: 14px;
  text-align: center;
  width: 100%;

  & :first-child:not(${DisplayIcon}) {
    margin: auto;
  }

  & ${SelectWrapper} {
    width: 255px;

    @media (max-width: ${DEVICE.mobileL}) {
      width: 100%;
      margin: auto;
    }
  }

  & ${ErrorMessage} {
    margin: auto;

    @media (max-width: ${DEVICE.mobileL}) {
      width: auto;
      min-width: 225px;
      max-width: 300px;
    }
  }
`;

export const FieldsWrapper = styled.div`
  text-align: center;
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  & :last-child {
    padding-bottom: 0;
  }
`;

export const LoginText = styled.div`
  user-select: none;
  position: absolute;
  top: 28px;
  right: 45px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 12px;
  text-align: center;
  color: #161643;

  & button {
    height: 32px;
    min-width: auto;
  }

  @media (max-width: 1210px) {
    right: 5%;
  }

  @media (max-width: ${DEVICE.tablet}) {
    position: static;
  }

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 14px;

    & button {
      font-size: 16px;
    }
  }
`;

export const ButtonAndLoaderWrapper = styled.div`
  height: 47px;
  text-align: center;
  margin-bottom: 21px;
  position: relative;

  > div {
    padding-top: 10px;
  }

  & button {
    min-width: 306px;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 15px;
  }

  @media (max-width: ${wrappingWidth}) {
    padding-top: 30px;
  }

  @media (max-width: ${DEVICE.mobileM}) {
    & button {
      min-width: 280px;
    }
  }
`;

export const StyledLink = styled.a`
  font-family: ProximaNova-Semibold, sans-serif;
  font-weight: 600;
  color: #2960f5;
`;

export const CheckboxWrapper = styled.div`
  margin: 40px auto 0;
  text-align: center;
  width: 255px;

  & ${Label} {
    font-size: 15px;
    width: auto;

    @media (max-width: ${DEVICE.mobileL}) {
      font-size: 17px;
    }
  }

  & ${Checkbox} {
  }

  & ${Box} {
    width: 24px;
    height: 24px;
  }

  & ${AcceptIconImg} {
    margin: 3px;
    height: 18px;
    width: 17px;
  }

  @media (max-width: ${DEVICE.mobileL}) {
    width: auto;
    min-width: 225px;
    max-width: 300px;
  }
`;

export const Illustration = styled.img`
  position: absolute;
  right: 30px;
  bottom: 62px;
  width: 370px;
  height: 352px;
  user-select: none;

  @media (max-width: 1200px) {
    display: none;
  }
`;

export const Title = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 42px;
  font-weight: bold;
  text-align: center;
  color: #161643;
  padding-top: 49px;

  @media (max-width: ${DEVICE.tablet}) {
    padding-top: 5px;
  }
`;

export const Subtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 20px;
  text-align: center;
  color: #161643;
`;

export const StartingText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 15px;
  letter-spacing: normal;
  text-align: center;
  color: #161643;
  margin-bottom: 25px;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 17px;
  }
`;

export const BoldText = styled.span`
  font-family: ProximaNova-Bold, sans-serif;
`;

export const PricingDetailsWrapper = styled.div`
  position: relative;
  margin: auto;

  & ${Trigger} {
    width: 100px;
    right: 25px;
    left: unset;
    z-index: 2;
  }

  @media (max-width: ${wrappingWidth}) {
    & ${Trigger} {
      right: 0;
      left: 0;
      top: -15px;
      margin: auto;
    }
  }
`;

export const BackButtonWrapper = styled.div`
  text-align: center;
  padding: 25px 0;

  & button {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 15px;
  }
`;

export const CouponText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  color: #161643;
  font-size: 14px;
  text-align: center;
  margin: 14px auto 24px;
  padding: 0 10px;
  max-width: 310px;

  @media (max-width: ${wrappingWidth}) {
    font-size: 15px;
    margin-bottom: 22px;
    margin-top: 18px;
  }
`;
