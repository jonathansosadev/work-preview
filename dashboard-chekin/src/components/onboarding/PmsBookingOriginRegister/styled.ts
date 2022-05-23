import styled from 'styled-components';
import StepByStepGuideWizard from '../StepByStepGuideWizard';
import {DEVICE} from '../../../styled/device';

export const Logo = styled.img`
  width: 197px;
  height: 65px;
  margin-bottom: 56px;
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

export const StepText = styled.div`
  max-width: 383px;
  min-height: 89px;
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  text-align: center;
  color: #161643;
  cursor: default;

  & b {
    font-family: ProximaNova-Bold, sans-serif;
  }
`;

export const BookingStepByStepWizard = styled(StepByStepGuideWizard)`
  margin-bottom: 36px;
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
  text-align: center;
  margin: 0 auto;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 10px;
  min-height: 68px;
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
