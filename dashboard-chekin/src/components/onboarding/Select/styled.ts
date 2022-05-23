import styled, {css} from 'styled-components';
import {DEVICE} from '../../../styled/device';

type WrapperProps = {
  disabled?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  max-width: 255px;

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
    `};

  & {
    .form-select {
      width: 255px !important;
      height: 50px !important;
      box-sizing: border-box !important;
      cursor: pointer !important;
    }

    .form-select__control {
      border: none !important;
      cursor: pointer !important;
      background-color: white !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      min-height: 50px !important;
      border-bottom: 1px solid rgb(242, 244, 248) !important;
      transition: background-color 0.5s ease-in-out, border-color 0.05s ease-in-out !important;
    }

    .form-select.empty .form-select__control {
      border-color: #e3f3ff !important;
      background-color: #e3f3ff !important;
    }

    .form-select.disabled .form-select__control {
      opacity: 0.35 !important;
    }

    .form-select.invalid .form-select__control {
      border-color: #ff5d8f !important;
    }

    .form-select__single-value {
      font-family: ProximaNova-Medium, sans-serif !important;
      font-size: 16px !important;
      font-weight: 300 !important;
      padding-top: 21px !important;
      margin-left: 0 !important;
      color: #161643 !important;
    }

    .form-select__input,
    .form-select__input input {
      font-family: ProximaNova-Medium, sans-serif !important;
      font-size: 16px !important;
      font-weight: 300 !important;
      color: #161643 !important;
    }

    .form-select__input {
      padding-top: 2px !important;
    }

    .form-select__indicator-separator {
      display: none;
    }

    .form-select__dropdown-indicator {
      display: none !important;
    }

    .form-select__value-container {
      height: 40px !important;
      padding-top: 15px !important;
      padding-left: 2px !important;
    }

    .form-select__value-container > div {
      padding-bottom: 0 !important;
    }

    .form-select__value-container :last-child,
    .form-select__input {
      margin-left: 0 !important;
    }

    .form-select__option--is-focused {
      background-color: #e2efff !important;
    }

    .form-select__option--is-selected {
      background-color: #e2efff !important;
    }

    .form-select__placeholder {
      font-family: ProximaNova-Light, sans-serif !important;
      color: #8ca2b2;
      opacity: 0.7 !important;
      font-size: 16px !important;
      margin-left: 0 !important;
      font-weight: 300 !important;
      padding-top: 22px !important;
    }

    .form-select__menu-notice {
      color: #161643 !important;
      text-align: left !important;
      padding: 13px 10px 13px 0 !important;
      font-size: 17px !important;
    }

    .form-select__menu-list {
      box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1) !important;
      width: 262px !important;
      padding: 0 10px 0 25px !important;
    }

    .form-select__option.form-select__option--is-selected {
      background-color: white !important;
      font-family: ProximaNova-Semibold, sans-serif !important;
      font-weight: 900 !important;
    }

    .form-select__option.form-select__option--is-focused.form-select__option--is-selected {
      cursor: default !important;
      color: #161643 !important;
    }

    .form-select__option.form-select__option--is-focused {
      cursor: pointer !important;
      color: #2960f5 !important;
      font-weight: 600 !important;
    }

    .form-select__menu {
      margin-top: 0 !important;
      font-family: ProximaNova-Semibold, sans-serif !important;
      font-size: 19px !important;
      width: 225px !important;
      height: auto !important;
      max-height: 285px !important;
      background-color: #ffffff;
      box-shadow: none !important;
      z-index: 2 !important;
    }

    .form-select__menu-notice {
      color: #161643 !important;
      text-align: left !important;
      padding: 13px 10px 13px 0 !important;
      font-size: 17px !important;
    }

    .form-select__menu-list {
      box-shadow: 0 30px 30px #2148ff1a !important;
      width: 225px !important;
      height: auto !important;
      max-height: 285px !important;
      border-radius: 4px !important;
      padding: 0 25px 0 15px !important;
    }

    .form-select__option {
      font-family: ProximaNova-Light, sans-serif !important;
      font-size: 17px !important;
      text-align: left !important;
      color: #161643 !important;
      padding: 20px 18px 20px 8px !important;
      box-sizing: border-box !important;
      background-color: white !important;
      border-bottom: 1px solid rgba(38, 153, 251, 0.1) !important;
    }

    .form-select__option:last-child {
      border-bottom-color: transparent !important;
    }

    @media (max-width: 425px) {
      .form-select {
        width: auto !important;
        min-width: 225px !important;
        max-width: 300px !important;
      }

      .form-select__single-value {
        font-size: 18px !important;
      }

      .form-select__option {
        font-size: 16px !important;
      }
    }
  }

  @media (max-width: ${DEVICE.mobileL}) {
    max-width: 300px;
    margin: auto;
    font-size: 15px;
  }
`;

export const Label = styled.div`
  position: absolute;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  top: 1px;
  left: 2px;
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 14px;
  text-align: left;
  z-index: 1;
  user-select: none;
  pointer-events: none;
  color: #2960f5;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 16px;
  }
`;

export const DisplayIcon = styled.img`
  width: 9px;
  height: 6px;
  margin-left: 5px;

  @media (max-width: ${DEVICE.mobileL}) {
    width: 11px;
    height: 8px;
  }
`;

export const LoaderWrapper = styled.div`
  width: 16px;
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 3;
`;
