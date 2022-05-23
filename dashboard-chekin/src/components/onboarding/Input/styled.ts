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
    min-width: 225px;
    max-width: 300px;
  }
`;

type StyledInputProps = {
  invalid?: boolean;
};

export const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  height: 50px;
  outline: none;
  border: none;
  box-sizing: border-box;
  border-bottom: 1px solid rgb(241, 243, 247);
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  font-weight: 300;
  transition: background-color 0.25s ease-in-out, border-color 0.05s ease-in-out;
  color: #161643;
  background-color: white;
  border-radius: 0;
  padding: 22px ${(props) => (props.type === 'password' ? '39' : '2')}px 0 2px;

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

  ${(props) =>
    props.type === 'password' &&
    css`
      font-family: ProximaNova-Black, sans-serif;
      letter-spacing: 2.5px;
      font-size: 20px;

      &:placeholder-shown {
        letter-spacing: unset;
      }
    `};

  @media (max-width: ${DEVICE.mobileL}) {
    &,
    &::placeholder {
      font-size: 18px;
    }
  }
`;

export const FieldName = styled.div`
  position: absolute;
  max-width: 235px;
  overflow-x: auto;
  white-space: nowrap;
  top: 1px;
  left: 2px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  text-align: left;
  color: #2960f5;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 16px;
  }
`;

export const RevealPasswordIcon = styled.img`
  position: absolute;
  top: 30px;
  right: 14px;
  width: 21px;
  height: 13px;
  cursor: pointer;
  user-select: none;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 1;
  }

  @media (max-width: ${DEVICE.mobileL}) {
    height: 15px;
    width: 25px;
  }
`;
