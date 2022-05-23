import styled, {css} from 'styled-components';
import {ModalButtonProps} from './ModalButton';

export const StyledButton = styled.button<Partial<ModalButtonProps>>`
  appearance: none;
  -moz-appearance: none;
  -webkit-appearance: none;
  border-radius: 6px;
  min-width: 148px;
  min-height: 40px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  background-color: white;
  box-sizing: border-box;
  border: 1px solid #385cf8;
  transition: all 0.02s ease-in-out;
  padding: 10px 30px;
  outline: none;
  user-select: none;
  box-shadow: 0 3px 4px #0002030d;
  opacity: ${(props) => props.disabled && 0.1};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  ${(props) =>
    props.primary &&
    css`
      background-color: #385cf8;
      border-color: #385cf8;
      color: #ffffff;

      &:hover {
        opacity: 0.9;
        box-shadow: none;
      }

      &:active {
        opacity: 0.95;
      }
    `};

  ${(props) =>
    !props.disabled &&
    css`
      &:hover {
        background-color: #385cf8;
        border-color: #385cf8;
        color: #ffffff;
        box-shadow: none;
      }

      &:active {
        opacity: 0.95;
      }
    `};

  ${(props) =>
    props.link &&
    css`
      border: none;
      color: #002cfa;
      font-family: ProximaNova-Semibold, sans-serif;
      background: transparent;
      box-shadow: none;

      &:hover {
        opacity: 0.7;
        background: transparent;
        color: #002cfa;
      }

      &:active {
        opacity: 1;
      }
    `};

  ${(props) =>
    props.secondary &&
    css`
      border-color: transparent;
      background-color: transparent;
      color: #9696b9;
      box-shadow: none;

      ${!props.disabled &&
      css`
        &:hover {
          border-color: transparent;
          background-color: transparent;
          color: #385cf8;
        }

        &:active {
          opacity: 0.9;
        }
      `};
    `};

  ${(props) =>
    props.link &&
    css`
      color: #002cfa;
      border-color: transparent;
      background-color: transparent;
      box-shadow: none;

      ${!props.disabled &&
      css`
        &:hover {
          opacity: 0.7;
          border-color: transparent;
          background-color: transparent;
          color: #002cfa;
        }

        &:active {
          opacity: 0.9;
        }
      `};
    `};

  ${(props) =>
    props.primary &&
    css`
      background-color: #385cf8;
      border-color: #385cf8;
      color: #ffffff;

      ${!props.disabled &&
      css`
        &:hover {
          opacity: 0.9;
          box-shadow: none;
        }

        &:active {
          opacity: 0.9;
        }
      `};
    `};

  ${(props) =>
    props.danger &&
    css`
      border: 1px solid #ff2467;

      ${!props.disabled &&
      css`
        &:hover {
          background-color: #ff2467;
          border-color: #ff2467;
          color: #ffffff;
        }

        &:active {
          opacity: 0.95;
        }
      `}
    `}
`;
