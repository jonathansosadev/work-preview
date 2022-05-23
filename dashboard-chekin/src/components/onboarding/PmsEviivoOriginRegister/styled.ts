import styled, {css} from 'styled-components';
import StepByStepGuideWizard from '../StepByStepGuideWizard';

export const Logo = styled.img`
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

export const Form = styled.form``;

export const ButtonAndLoaderWrapper = styled.div`
  height: 60px;
  text-align: center;
  margin: 0 auto;
`;

export const FormItemWrapper = styled.div`
  margin-bottom: 10px;
  min-height: 68px;
  display: flex;
`;

export const StepGuideWrapper = styled.div`
  margin-bottom: 50px;
`;

export const HostawayStepByStepWizard = styled(StepByStepGuideWizard)`
  margin-bottom: 36px;
`;

export const IconButton = styled.button`
  margin-bottom: 30px;
  outline: none;
  border: none;
  background: transparent;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  opacity: ${(props) => props.disabled && 0.5};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover > img {
        box-shadow: 0 3px 3px #0f477734;
      }

      &:active > img {
        opacity: 0.95;
      }
    `}

  & > img {
    border-radius: 3px;
    height: 20px;
    width: 20px;
    margin-right: 8px;
    transition: box-shadow 0.15s ease-in-out;
  }
`;
