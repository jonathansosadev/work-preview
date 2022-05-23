import styled, {css} from 'styled-components';
import {ButtonProps} from './Button';

export const StyledButton = styled.button<Partial<ButtonProps>>`
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
  justify-content: center;
  transition: all 0.07s ease-in-out;
  user-select: none;
  border: none;
  
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
  
  ${(props) =>
    props.secondary &&
    css`
      border: 1px solid #2148ff;
      color: #002cfa;
      background: white;
      box-shadow: 0 3px 4px #0002031a;
      &:hover {
        box-shadow: none;
      }
      &:active {
        opacity: 1;
      }
    `};
  
  ${(props) =>
    props.danger &&
    css`
      background: transparent linear-gradient(164deg, #ff2467 0%, #f21357 100%) 0 0
        no-repeat padding-box;
    `}
  ${(props) =>
    props.danger &&
    props.outlined &&
    css`
      background: none;
      border: 1px solid #f21357;
      color: #f21357;
    `}
  
  ${(props) =>
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
  
  ${(props) =>
    props.link &&
    css`
      border: none;
      color: #002cfa;
      font-family: ProximaNova-Medium, sans-serif;
      font-size: 16px;
      background: white;
      box-shadow: none;
      &:hover {
        opacity: 0.7;
      }
      &:active {
        opacity: 1;
      }
    `};
  
  ${(props) =>
    props.secondary &&
    props.blinking &&
    css`
      &,
      &:hover,
      &:active {
        cursor: progress;
        box-shadow: 0 4px 4px #2148ff1a;
        animation: blink 5s ease-in-out infinite;
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

export const Label = styled.div`
  height: 36px;
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  & > img {
    margin-right: 12px;
  }
`;
