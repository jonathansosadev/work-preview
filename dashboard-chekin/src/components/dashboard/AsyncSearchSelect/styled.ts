import styled, {css} from 'styled-components';

type WrapperProps = {
  disabled?: boolean;
  invalid?: boolean;
  selectable?: boolean;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  box-sizing: border-box;
  cursor: pointer;
  width: 250px;
  min-height: 47px;

  & .select {
    height: 47px !important;
  }

  & .select__control {
    border: none !important;
    cursor: pointer !important;
    background-color: white !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    height: 100% !important;
    transition: background-color 0.5s ease-in-out, border-color 0.05s ease-in-out !important;
    border-bottom: 1px solid ${(props) => (props.invalid ? '#FF2467' : '#e2e7ef')} !important;
  }

  & .select__single-value,
  & .select__placeholder {
    font-family: ProximaNova-Medium, sans-serif !important;
    font-size: 15px !important;
    padding-top: 20px !important;
    margin-left: 0 !important;
    color: #161643 !important;
    padding-left: 0 !important;
  }

  & .select__placeholder {
    color: #9696b9 !important;
  }

  & .select__input,
  & .select__input input {
    font-family: ProximaNova-Medium, sans-serif !important;
    font-size: 16px !important;
    color: #161643 !important;
    margin: 0 !important;
  }

  & .select__input input {
    width: 250px !important;
    position: relative !important;
    top: -3px !important;
  }

  & .select__input {
    position: relative !important;
    top: 0 !important;
  }

  & .select__indicator-separator {
    display: none;
  }

  & .select__dropdown-indicator {
    display: none !important;
  }

  & .select__value-container {
    padding-top: 28px !important;
    padding-left: 0 !important;
  }

  & .select__value-container > div {
    padding-bottom: 0 !important;
    margin: 0 !important;
  }

  & .select__value-container :last-child,
  & .select__input {
    margin-left: 0 !important;
    padding: 0;
  }

  & .select__option.select__option:hover {
    cursor: pointer !important;
    color: #385cf8 !important;
  }

  & .select__option.select__option--is-selected {
    background-color: white !important;
    font-family: ProximaNova-Bold, sans-serif !important;
  }

  & .select__option.select__option--is-focused.select__option--is-selected {
    cursor: default !important;
    font-family: ProximaNova-Bold, sans-serif !important;
    color: #161643 !important;
  }

  & .select__menu {
    font-family: ProximaNova-Medium, sans-serif !important;
    font-size: 16px !important;
    width: 306px !important;
    height: ${(props) => (props.selectable ? '220px' : 'auto')} !important;
    z-index: 2 !important;
    margin-top: 0;
    left: -28px !important;
    padding: 0 42px 0 32px !important;
    box-shadow: 0 30px 30px #2148ff1a !important;
    border-radius: 0 0 8px 8px !important;
  }

  & .select__menu-notice {
    color: #161643 !important;
    text-align: left !important;
    margin-top: 10px !important;
    font-size: 16px !important;
  }

  & .select__menu-list {
    padding: 17px 0 19px 0 !important;
    width: 100% !important;
    height: ${(props) => (props.selectable ? '220px' : 'auto')} !important;
    border-radius: 0 0 8px 8px !important;
  }

  & .select__option {
    font-family: ProximaNova-Medium, sans-serif !important;
    font-size: 16px !important;
    text-align: left !important;
    color: #161643 !important;
    padding: 18px 0 19px 16px !important;
    box-sizing: border-box !important;
    background-color: white !important;
    border-bottom: 1px solid #f2f4f8 !important;
  }

  & .select__option:last-child {
    border-bottom-color: transparent !important;
  }

  & .select__indicators {
    display: none !important;
  }

  ${(props) =>
    props.disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.3;
    `};
`;

type KeyboardHintProps = {
  visible?: boolean;
};

export const KeyboardHint = styled.div<KeyboardHintProps>`
  font-family: ProximaNova-Semibold, sans-serif;
  color: #9696b9;
  font-size: 13px;
  position: absolute;
  bottom: 5px;
  right: 0;
  transition: opacity 0.2s ease-in-out;
  opacity: ${(props) => (props.visible ? 1 : 0)};
`;
