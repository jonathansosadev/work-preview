import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

type WrapperProps = {
  disabled?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  width: 255px;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};

  @media (max-width: ${DEVICE.mobileL}) {
    width: auto;
    font-size: 15px;
    min-width: 225px;
    max-width: 300px;
  }
`;

type StyledTextareaProps = {
  empty?: boolean;
  invalid?: boolean;
};

export const StyledTextarea = styled.textarea<StyledTextareaProps>`
  resize: none;
  width: 100%;
  outline: none;
  border: none;
  padding: 24px 10px 0 2px;
  box-sizing: border-box;
  border-bottom: 1px solid rgb(241, 243, 247);
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  font-weight: 300;
  transition: background-color 0.25s ease-in-out, border-color 0.05s ease-in-out;
  background-color: white;
  color: #161643;

  &::placeholder {
    font-family: ProximaNova-Light, sans-serif;
    font-size: 16px;
    color: #8ca2b2;
    opacity: 0.7;
  }

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
    `};

  ${(props) =>
    props.invalid &&
    css`
      border-color: #ff2467;
    `};

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 18px;
  }
`;

export const Label = styled.div`
  position: absolute;
  height: 1.5em;
  max-width: 255px;
  width: 100%;
  background-color: white;
  overflow-x: auto;
  white-space: nowrap;
  top: 0;
  left: 2px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  text-align: left;
  user-select: none;
  color: #2960f5;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 16px;
  }
`;
