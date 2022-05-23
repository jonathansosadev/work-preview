import styled, {css} from 'styled-components';
import BaseButton from '../Button';
import {Status} from '../../../utils/types';

type SaveButtonProps = {
  status: Status;
};

export const FloatingButton = styled(BaseButton)<SaveButtonProps>`
  transition: all 0.1s ease-out;
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;

  ${(props) =>
    props.status &&
    css`
      justify-content: center;
    `};

  ${(props) =>
    props.disabled &&
    css`
      opacity: 1;
      cursor: default;

      &:hover {
        opacity: 1;
      }
    `};

  ${(props) =>
    props.status === 'error' &&
    css`
      background-color: #ff2467;
      border-color: #ff2467;

      &:hover {
        opacity: 1;
      }
    `};

  ${(props) =>
    props.status !== 'idle' &&
    css`
      &:hover {
        opacity: 1;
      }
    `}
`;
export const ButtonLabelWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const ButtonLabelIcon = styled.img`
  height: 12px;
  width: 12px;
  margin-right: 10px;
  margin-left: 2px;
`;

export const ButtonLabelText = styled.div`
  font-family: ProximaNova-Semibold, sans-serif;
  font-size: 12px;
  color: #ffffff;
  text-transform: uppercase;
`;
