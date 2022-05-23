import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';

export const Logo = styled.img`
  width: 197px;
  height: 65px;
  margin-bottom: 44px;
`;

export const Illustration = styled.img`
  position: absolute;
  width: 460px;
  height: 415px;
  right: 51px;
  top: 286px;
  z-index: 1;
  user-select: none;

  @media (max-width: ${DEVICE.laptopL}) {
    display: none;
  }
`;

export const StepGuideWrapper = styled.div`
  margin-bottom: 50px;
`;

export const LoginText = styled.div`
  user-select: none;
  text-align: center;
  font-size: 14px;
  margin-top: 34px;
  font-family: ProximaNova-Light, sans-serif;
`;

export const Form = styled.form`
  text-align: center;
`;

export const ButtonAndLoaderWrapper = styled.div`
  height: 60px;
  text-align: center;
  margin: 0 auto;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 10px;
  min-height: 68px;
`;
