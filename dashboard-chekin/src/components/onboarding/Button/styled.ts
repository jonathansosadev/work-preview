import styled, {css} from 'styled-components';
import {ButtonProps} from './Button';

export const StyledButton = styled.button<ButtonProps>`
  outline: none;
  min-width: 255px;
  height: 47px;
  color: #ffffff;
  font-size: 14px;
  border: none;
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  text-transform: uppercase;
  padding: 0 5px;
  box-sizing: border-box;
  box-shadow: 0 3px 4px #00020333;
  border-radius: 6px;
  background: transparent linear-gradient(164deg, #385cf8 0%, #395bf8 100%) 0% 0%
    no-repeat padding-box;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;

      &:hover,
      &:active {
        opacity: 0.5;
      }
    `};

  ${(props) =>
    props.secondary &&
    css`
      background: transparent;
      color: #161643;
      box-shadow: none;
    `};

  ${(props) =>
    props.outlined &&
    css`
      background: white;
      color: #161643;
      border: solid 1px #161643;
    `};

  ${(props) =>
    props.danger &&
    css`
      background: #ff5d8f;
      color: white;

      ${props.outlined &&
      css`
        background-color: white;
        border-color: #ff5d8f;
        color: #ff5d8f;
      `};
    `};

  ${(props) =>
    props.light &&
    css`
      font-family: ProximaNova-Medium, sans-serif;
      font-size: 15px;
      background: #2194f7;
      color: #ffffff;
    `};

  ${(props) => getButtonSizeStyles(props.size!)};
`;

function getButtonSizeStyles(size = '') {
  switch (size) {
    case 'small':
      return css`
        min-width: 93px;
        height: 29px;
        border-radius: 3px;
      `;
    case 'big':
      return css`
        min-width: 241px;
        height: 60px;
        border-radius: 4px;
        padding: 0 25px;
        font-size: 15px;
      `;
    case 'tiny':
      return css`
        min-width: 48px;
        height: 21px;
        font-size: 9px;
      `;
    case 'medium':
      return css`
        min-width: 118px;
        height: 29px;
        padding: 0 10px;
        border-radius: 3px;
      `;
    default:
      return null;
  }
}
