import styled, {css} from 'styled-components';
import {ErrorMessage} from '../../styled/common';
import displayArrowIcon from '../../assets/display-blue-icn.svg';
import Select, {Styles} from 'react-select';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
import {device} from '../../styled/device';

export const selectWidth = '293px';
export const applySelectStyles = (select: any) => styled(select)`
  @media (max-width: 330px) {
    width: ${selectWidth};
  }

  .select__control {
    transition: 0.1s;
    border: 1px solid #a2a2b4;
  }

  & .select__value-container {
    padding: 0;
  }

  & .select__dropdown-indicator {
    padding: 0;
  }

  & .select__single-value,
  & .select__placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    margin-left: 0;
    padding-left: 0;

    @media (max-width: ${device.tablet}) {
      font-size: 20px !important;
    }
  }

  & .select__single-value {
    color: #161643;
  }

  & .select__placeholder {
    color: #8181a3;
  }

  & .select__input input {
    margin: 0;
    padding: 0;
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    color: #161643;

    @media (max-width: ${device.tablet}) {
      font-size: 20px !important;
    }
  }

  & .select__option.select__option--is-selected {
    background-color: white;
    font-family: ProximaNova-Bold, sans-serif;
  }

  & .select__option.select__option--is-focused.select__option--is-selected {
    cursor: default;
    font-family: ProximaNova-Bold, sans-serif;
    color: #161643;
  }

  & .select__option.select__option--is-focused {
    cursor: pointer;
    color: #385cf8;
  }

  & .select__menu {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 16px;
    width: ${selectWidth};
    height: auto;
    min-height: 75px;
    max-height: 322px;
    box-shadow: 0 30px 30px #2148ff1a;
    border-radius: 0 0 8px 8px;
    z-index: 4;
    margin-top: 0;

    @media (max-width: ${device.tablet}) {
      font-size: 20px !important;
    }
  }

  & .select__menu-notice {
    color: #161643;
    text-align: left;
    margin-top: 10px;
    font-size: 16px;
  }

  & .select__menu-list {
    padding: 17px 27px 19px 16px;
    box-shadow: 0 30px 30px #2148ff1a;
    width: ${selectWidth};
    height: auto;
    min-height: 75px;
    max-height: 322px;
    border-radius: 0 0 8px 8px;
  }

  & .select__option {
    text-align: left;
    color: #161643;
    padding: 18px 0 19px 16px;
    box-sizing: border-box;
    background-color: white;
    border-bottom: 1px solid #f2f4f8;

    &:active {
      background-color: white;
    }
  }

  & .select__option:last-child {
    border-color: transparent;
  }

  @media (max-width: ${device.tablet}) {
    min-width: 327px;
  }

  @media (max-width: ${device.mobileS}) {
    min-width: 293px;
  }
`;

export const styles: Styles = {
  input: base => ({
    ...base,
    width: 1,
    margin: 0,
    padding: 0,
    fontFamily: 'ProximaNova-Medium, sans-serif',
    fontSize: 16,
    color: '#161643',
  }),
};

export const ReactSelect = applySelectStyles(Select);
export const AsyncReactSelect = applySelectStyles(AsyncSelect);
export const CreatableReactSelect = applySelectStyles(CreatableSelect);

type WrapperProps = {
  disabled?: boolean;
  invalid?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: auto 50px auto;
  cursor: pointer;
  width: 100%;

  & .select__control {
    grid-row: 2 / 3;
    min-height: 20px;
    cursor: pointer;
    background-color: white;
    box-sizing: border-box;
    box-shadow: none;
    border-radius: 7px;
    transition: background-color 0.5s ease-in-out, border-color 0.05s ease-in-out;
    border: 1px solid ${props => (props.invalid ? '#FF2467' : '#a2a2b4')};

    &,
    &:hover {
      border: 1px solid ${props => (props.invalid ? '#FF2467' : '#a2a2b4')};
    }
  }

  & .select__value-container {
    padding: 0 16px;
  }

  ${props =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.3;
    `};
`;

export const Label = styled.label`
  grid-row: 1 / 2;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 16px;
  margin-bottom: 9px;
  text-align: left;
  user-select: none;
  color: #161643;
  pointer-events: none;

  @media (max-width: ${device.tablet}) {
    font-size: 18px;
  }
`;

type DisplayIconProps = {
  shouldRotate: boolean;
};

export const DisplayIcon = styled.img.attrs({
  src: displayArrowIcon,
  alt: 'Toggle menu',
})<DisplayIconProps>`
  width: 21px;
  height: 21px;
  cursor: pointer;
  pointer-events: none;
  position: relative;
  border-radius: 4px;
  right: 12px;
  box-shadow: 0 3px 4px #0002032b;
  user-select: none;

  ${props =>
    props.shouldRotate &&
    css`
      transform: rotateX(180deg);
      box-shadow: 0 -3px 4px #0002032b;
    `};
`;

export const LoaderWrapper = styled.div`
  position: absolute;
  width: 16px;
  top: -27px;
  right: 7px;
`;

export const TooltipWrapper = styled.span`
  margin-left: 6px;
  display: inline-block;
  position: relative;
  pointer-events: auto;
`;

export const Error = styled(ErrorMessage)`
  grid-row: 3 / 4;
`;
