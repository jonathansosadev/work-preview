import styled from 'styled-components';

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
  flex-direction: column;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 10px;
  min-height: 68px;
`;
