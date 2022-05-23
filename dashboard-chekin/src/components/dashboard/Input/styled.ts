import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';
import {InputProps} from './Input';

type WrapperProps = {
  disabled?: boolean;
};

export const LabelWrapper = styled.div`
  display: flex;
  span {
    margin-left: 5px;
  }
`;

export const Label = styled.label<WrapperProps>`
  display: block;
  position: relative;
  width: 293px;
  min-height: 70px;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};
`;

export const inputStyles = css`
  width: 100%;
  outline: none;
  margin: 0;
  background: #ffffff 0 0 no-repeat padding-box;
  border: 1px solid #161643;
  border-radius: 7px;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  transition: background-color 0.25s ease-in-out, border-color 0.05s ease-in-out;
  color: #161643;
  padding: 11px 14px;
  box-sizing: border-box;
  text-overflow: ellipsis;

  &::placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    color: #8181a3;
    opacity: 1;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

export const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledInput = styled.input<Partial<InputProps> & {customDisable?: boolean}>`
  ${inputStyles};

  ${(props) =>
    props.empty &&
    css`
      background: #f4f6f8;
      color: #8181a3;
      border: none;
    `};

  ${(props) =>
    props.type === 'password' &&
    css`
      &:not(:placeholder-shown) {
        font-family: ProximaNova-Bold, sans-serif;
        letter-spacing: 2px;
      }
    `};

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
    `};

  ${(props) =>
    props.invalid &&
    css`
      border: 1px solid #ff2467;
    `};

  ${(props) =>
    props.readOnly && !props.customDisable
      ? css`
          cursor: default;
        `
      : ''}

  ${(props) =>
    props.customDisable &&
    css`
      cursor: not-allowed;
      opacity: 0.3;
    `};

  ${(props) =>
    props.sign &&
    css`
      &:after {
        box-sizing: border-box;
        content: ${props.sign};
        position: absolute;
        background-color: red;
        width: 200px;
        display: block;
        height: 100px;
      }
    `};
`;

export const Name = styled.div`
  max-width: 100%;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 16px;
  text-align: left;
  user-select: none;
  min-height: 20px;
  box-sizing: border-box;
  margin-bottom: 6px;
  overflow-x: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

type SpinnerButtonProps = {
  onClick: (e: MouseEvent) => void;
};

export const SpinnerButton = styled.button<SpinnerButtonProps>`
  background-color: #9696b9;
  box-shadow: 0 10px 10px #012e551a;
  border-radius: 3px;
  width: 32px;
  height: 23px;
  outline: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  font-family: ProximaNova-Bold, sans-serif;
  padding: 1px 7px;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }

  @media (max-width: ${DEVICE.tablet}) {
    width: 57px;
    height: 29px;
  }
`;

export const SpinnerButtonsWrapper = styled.div`
  position: absolute;
  top: 18px;
  right: 18px;
  text-align: right;
  display: inline-flex;
  align-items: center;

  & > ${SpinnerButton}:first-child {
    margin-right: 8px;

    @media (max-width: ${DEVICE.tablet}) {
      margin-right: 10px;
    }
  }

  @media (max-width: ${DEVICE.tablet}) {
    top: 20px;
  }
`;

export const SpinnerIcon = styled.img`
  user-select: none;
  width: 10px;
  margin-top: 1px;

  @media (max-width: ${DEVICE.tablet}) {
    width: auto;
  }
`;

export const RevealPasswordIcon = styled.img`
  position: absolute;
  top: 42px;
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

export const Sign = styled.div`
  position: absolute;
  right: 20px;
  top: 30%;
`;
