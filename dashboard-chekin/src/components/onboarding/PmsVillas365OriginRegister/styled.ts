import styled from 'styled-components';
import StepByStepGuideWizard from '../StepByStepGuideWizard';
import {contentStyle} from '../Tooltip/styled';

export const linkContentStyle = {
  ...contentStyle,
  padding: '20px 10px',
  width: 160,
};

export const QuestionMark = styled.img`
  display: inline-block;
  height: 21px;
  width: 21px;
  z-index: 3;
  cursor: pointer;
  border-radius: 50%;
  vertical-align: middle;
  box-shadow: 0 8px 8px 0 rgba(38, 153, 251, 0.16);
`;

export const Logo = styled.img`
  height: 30px;
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
  position: relative;
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
  color: #2d508e;
  cursor: default;

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
  color: #2194f7;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
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

export const VillasStepByStepWizard = styled(StepByStepGuideWizard)`
  margin-bottom: 36px;
`;

export const TooltipWrapper = styled.div`
  position: absolute;
  top: -4px;
  right: 0;
`;

export const TooltipButton = styled.button`
  outline: none;
  border: none;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 15px;
  text-transform: none;
  display: block;
  text-align: center;
  color: #2960f5;
  cursor: pointer;
  background-color: transparent;
  text-decoration: underline;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 1;
  }
`;
