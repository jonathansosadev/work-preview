import styled, {css} from 'styled-components';
import ModalButton from '../ModalButton';
import {BaseButton} from '../../../styled/common';

export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const RemoveButtonLabelIcon = styled.img`
  width: 12px;
  height: 16px;
  margin-right: 9px;
`;

export const RemoveButtonLabelText = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
`;

export const ButtonLabelIcon = styled.img`
  width: 14px;
  height: 14px;
  margin-right: 9px;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 14px;
  color: #ffffff;
`;

export const Wrapper = styled.div``;

export const FormHeaderSubtitle = styled.div`
  & > button {
    height: auto;
    margin: 8px auto 0;

    & > div {
      height: auto;
    }
  }
`;

export const RemoveHousingButtonsWrapper = styled.div`
  margin: 44px auto 34px;
  width: fit-content;
  display: flex;
  flex-direction: column;

  & button:first-child {
    margin-bottom: 33px;
  }
`;

export const LoaderWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const DeleteModalButton = styled(ModalButton)`
  border-color: #9696b9;
`;

export const DeactivateHousingButton = styled(BaseButton)`
  color: #9696b9;
  height: 40px;
  box-sizing: border-box;
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 15px;
  margin-right: 16px;

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        color: #385cf8;
      }

      &:active {
        opacity: 0.9;
      }
    `}
`;
