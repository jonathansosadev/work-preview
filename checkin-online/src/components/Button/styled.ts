import styled, {css} from 'styled-components';
import {ButtonProps} from './Button';
import {device} from '../../styled/device';
import {OriginalButtonProps} from './OriginalButton';

const defaultWidth = '211px';
const shortWidth = '136px';

export const StyledButton = styled.button<
  Pick<ButtonProps, 'short' | 'onClick' | 'disabled' | 'type' | 'secondary'>
>`
  height: 48px;
  background: transparent linear-gradient(166deg, #385cf8 0%, #2148ff 100%) 0 0 no-repeat
    padding-box;
  box-shadow: 0 3px 4px #00020334;
  border-radius: 6px;
  border: none;
  outline: none;
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #ffffff;
  text-align: left;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.07s ease-in-out;
  user-select: none;
  padding: 0 19px;
  min-width: ${props => (props.short ? shortWidth : defaultWidth)};

  &:hover {
    opacity: 0.95;
  }

  &:active {
    opacity: 1;
  }

  ${props =>
    props.disabled &&
    css`
      background: #dedeeb;
      box-shadow: none;
      cursor: not-allowed;

      &:hover {
        opacity: 1;
      }

      &:active {
        opacity: 1;
      }
    `};

  ${props =>
    props.secondary &&
    css`
      color: #002aed;
      box-shadow: none;
      background: transparent;
    `};

  @media (max-width: ${device.mobileL}) {
    min-width: 286px;
    height: 65px;
    font-size: 21px;
  }
`;

export const StyledOriginalButton = styled.button<Partial<OriginalButtonProps>>`
  height: 40px;
  background: transparent linear-gradient(164deg, #385cf8 0%, #2148ff 100%) 0 0 no-repeat
    padding-box;
  box-shadow: 0 3px 4px #00020334;
  min-width: 117px;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 15px;
  color: #ffffff;
  text-align: left;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  transition: all 0.07s ease-in-out;
  user-select: none;
  border: none;
  justify-content: center;

  &:hover {
    opacity: 0.9;
    box-shadow: none;
  }
  &:active {
    opacity: 1;
  }
  & > img {
    margin-right: 12px;
  }

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.1;
      &:hover {
        opacity: 0.1;
        box-shadow: none;
      }
      &:active {
        opacity: 0.1;
      }
    `};
  ${props =>
    props.link &&
    css`
      border: none;
      color: #002cfa;
      font-family: ProximaNova-Semibold, sans-serif;
      background: white;
      box-shadow: none;
      &:hover {
        opacity: 0.7;
      }
      &:active {
        opacity: 1;
      }
    `};

  @keyframes blink {
    0% {
      border-color: #d7d8e4;
    }
    50% {
      border-color: #385cf8;
    }
    0% {
      border-color: #d7d8e4;
    }
  }
`;

export const OriginalButtonLabel = styled.div`
  height: 36px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  & > img {
    margin-right: 12px;
  }
`;

export const IconContainer = styled.span`
  width: 62px;
  text-align: center;
`;
