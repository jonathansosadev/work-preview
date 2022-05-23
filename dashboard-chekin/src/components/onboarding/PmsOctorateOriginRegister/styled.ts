import styled from 'styled-components';
import {DEVICE} from '../../../styled/device';

export const Logo = styled.img`
  width: 197px;
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

export const StepGuideTrigger = styled.div`
  text-align: center;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 13px;
  line-height: 1.46;
  letter-spacing: normal;
  color: #2194f7;
  text-transform: uppercase;
  margin-top: 27px;
  margin-bottom: 51px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
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
  display: flex;
  flex-direction: column;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 10px;
  min-height: 68px;
`;
