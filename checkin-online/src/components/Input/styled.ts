import styled, {css} from 'styled-components';
import {device} from '../../styled/device';

type WrapperProps = {
  disabled?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  width: 327px;
  min-height: 44px;

  ${props =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};

  @media (max-width: ${device.mobileS}) {
    width: 293px;
  }
`;

export const RelativeWrapper = styled.div`
  position: relative;
`;

export const inputStyles = css`
  width: 100%;
  outline: none;
  margin: 0;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  transition: background-color 0.25s ease-in-out, border-color 0.05s ease-in-out;
  color: #161643;
  background-color: #ffff;
  padding: 13px 16px;
  box-sizing: border-box;
  border-radius: 7px;
  border: 1px solid #a2a2b4;
  height: 50px;

  &::placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    color: rgb(129, 129, 163);
    opacity: 1;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

type StyledInputProps = {
  empty?: boolean;
  invalid?: boolean;
  hideNumberButtons?: boolean;
  autoComplete?: string;
};

export const StyledInput = styled.input<StyledInputProps>`
  ${inputStyles};

  ${props =>
    props.type === 'number' &&
    !props.hideNumberButtons &&
    css`
      padding-right: 130px;
    `};

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
    `};

  ${props =>
    props.invalid &&
    css`
      border-color: #ff2467;
    `};

  @media (max-width: ${device.mobileL}) {
    &,
    &::placeholder {
      font-size: 20px;
    }
  }
`;

export const Label = styled.div`
  display: flex;
  max-width: 100%;
  font-family: ProximaNova-Regular, sans-serif;
  color: #161643;
  font-size: 16px;
  text-align: left;
  user-select: none;
  min-height: 20px;
  box-sizing: border-box;
  margin-bottom: 9px;

  .tooltip {
    margin-left: 5px;
  }

  @media (max-width: ${device.tablet}) {
    font-size: 18px;
    min-height: 20px;
  }
`;

type SpinnerButtonProps = {
  onClick: (e: MouseEvent) => void;
};

export const SpinnerButton = styled.button<SpinnerButtonProps>`
  background-color: #9696b9;
  box-shadow: 0 3px 4px #0002032b;
  border-radius: 3px;
  width: 23px;
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

  @media (max-width: ${device.tablet}) {
    width: 57px;
    height: 29px;
  }
`;

export const SpinnerButtonsWrapper = styled.div`
  text-align: right;
  display: flex;
  padding: 1px 0;
  & > ${SpinnerButton}:first-child {
    margin-right: 8px;

    @media (max-width: ${device.tablet}) {
      margin-right: 10px;
    }
  }

  @media (max-width: ${device.tablet}) {
    top: 20px;
  }
`;

export const InpitSpinnerButtonsWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
`;

export const SpinnerIcon = styled.img`
  user-select: none;
  width: 12px;

  @media (max-width: ${device.tablet}) {
    width: auto;
  }
`;
