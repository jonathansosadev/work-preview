import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';
import {MainLogo} from '../../../styled/onboarding';

export const FormTile = styled.form`
  box-sizing: border-box;
  cursor: default;
  padding: 20px 20px 30px;
  width: 294px;
  margin: 58px auto;
  min-height: 444px;
  border-radius: 8px;
  position: relative;
  z-index: 2;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  background-color: #ffffff;

  @media (max-width: ${DEVICE.mobileL}) {
    box-shadow: none;
    width: 85%;
    margin-top: 75px;
    padding-top: 10px;
  }
`;

export const TileTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 23px;
  font-weight: 500;
  text-align: left;
  color: #161643;
`;

export const FieldsWrapper = styled.div`
  text-align: center;
  margin-top: 20px;
`;

export const FieldWrapper = styled.div`
  margin-bottom: 14px;
`;

export const Logo = styled(MainLogo)`
  position: absolute;
  left: 130px;
  top: 13px;
  width: 112px;

  @media (max-width: ${DEVICE.tablet}) {
    left: calc(50% - 55px);
    top: -35px;
  }

  @media (max-width: ${DEVICE.mobileL}) {
    top: -45px;
  }
`;

export const ForgotPassword = styled.div`
  text-align: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-weight: 500;
  margin-top: 22px;
  user-select: none;
  text-transform: uppercase;
  margin-bottom: 53px;
  cursor: pointer;

  & button {
    font-size: 12px;

    & > img {
      position: relative;
      top: -2px;
    }

    @media (max-width: ${DEVICE.mobileL}) {
      font-size: 14px;
    }
  }
`;

export const BottomText = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 12px;
  text-align: center;
  margin-top: 68px;
  color: #161643;

  & button {
    margin-top: 2px;
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

  > div {
    padding-top: 10px;
  }

  @media (max-width: ${DEVICE.mobileL}) {
    & button {
      min-width: 240px;
      font-size: 14px;
    }
  }
`;

export const Illustration = styled.img`
  width: 380px;
  height: 343px;
  position: absolute;
  right: 99px;
  top: 305px;
  z-index: 1;
  user-select: none;

  @media (max-width: ${DEVICE.tablet}) {
    display: none;
  }
`;

export const ModalContent = styled.div`
  text-align: center;
`;

export const ModalImgWrapper = styled.div`
  text-align: center;

  & > img {
    width: 90px;
  }
`;

export const ModalTitle = styled.div`
  text-align: center;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 19px;
  color: #182e56;
  margin-top: 20px;
  text-transform: uppercase;
`;

export const ModalText = styled.div`
  text-align: left;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 15px;
  color: rgb(45, 80, 142);
  margin: 14px 25px 24px;
  overflow-y: auto;
  max-height: 121px;
`;
