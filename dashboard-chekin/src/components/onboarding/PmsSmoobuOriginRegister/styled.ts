import styled from 'styled-components';
import StepByStepGuideWizard from '../StepByStepGuideWizard';

export const Logo = styled.img`
  width: 197px;
  height: 48px;
  margin-bottom: 44px;
  margin-top: 10px;
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

export const SideNotesWrapper = styled.div`
  margin: auto;
  width: 290px;
  position: absolute;
  cursor: default;
  top: 53px;
  left: 73px;
`;

export const InfoItemWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: start;
`;

export const Icon = styled.img`
  width: 26px;
  margin-right: 12px;
  position: relative;
`;

export const SyncIcon = styled(Icon)`
  top: -1px;
`;

export const ChatIcon = styled(Icon)`
  width: 29px;
  margin-right: 9px;
`;

export const MoneyIcon = styled(Icon)`
  width: 25px;
`;

export const TextWrapper = styled.div`
  color: #161643;
  margin-bottom: 24px;
  text-align: left;
`;

export const TextHeader = styled.div`
  font-size: 18px;
  font-family: ProximaNova-Medium, sans-serif;
  line-height: 17px;
  margin: 3px 0 5px;
`;

export const Text = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 14px;
  line-height: 17px;
`;

export const Form = styled.form`
  text-align: center;
`;

export const ButtonAndLoaderWrapper = styled.div`
  height: 60px;
  text-align: center;
  display: flex;
  flex-direction: col;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 40px;
  min-height: 68px;
`;

export const LeavingModalContent = styled.div`
  padding: 50px 22px 19px;
  text-align: center;
`;

export const LeavingModalImg = styled.img`
  margin-bottom: 39px;
`;

export const LeavingModalTitle = styled.div`
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 18px;
  font-weight: bold;
  color: #182e56;
  text-transform: uppercase;
`;

export const LeavingModalSubtitle = styled.div`
  font-family: ProximaNova-Light, sans-serif;
  font-size: 18px;
  font-weight: 300;
  color: #161643;
  margin: 13px auto 47px;
`;

export const StepWizardWrapper = styled.div`
  margin-bottom: 59px;
`;

export const SmoobuStepByStepWizard = styled(StepByStepGuideWizard)`
  margin-bottom: 36px;
`;
