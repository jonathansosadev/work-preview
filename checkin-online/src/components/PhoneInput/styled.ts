import styled, {css} from 'styled-components';
import {DisplayIcon as BaseDisplayIcon} from '../Select';
import {StyledInput, Label} from '../Input/styled';
import {StyledButton as ButtonLabel} from '../Button/styled';
import {Wrapper as InputWrapper} from '../Input/styled';
import {device} from '../../styled/device';

type MenuProps = {
  open?: boolean;
};

type OptionProps = {
  selected?: boolean;
};

type SelectedCountryCodeContainerProps = {
  disabled?: boolean;
  error?: string;
  isEmpty?: boolean;
};

export const SelectedCountryCodeContainer = styled.button<
  SelectedCountryCodeContainerProps
>`
  align-items: center;
  display: flex;
  justify-content: space-between;
  position: absolute;
  left: 0;
  top: 4px;
  height: 50px;
  box-sizing: border-box;
  border-radius: 6px;
  padding: 5px 7px 5px 16px;
  width: 95px;
  cursor: pointer;
  z-index: 1;
  text-align: left;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  color: #161643;
  user-select: none;
  outline: none;
  margin-top: 25px;
  background: transparent;
  border: 1px solid #a2a2b4;

  ${props =>
    props.error &&
    css`
      border-color: #ff2467;
    `}

  ${props =>
    props.isEmpty &&
    css`
      color: #8181a3;
    `};

  ${props =>
    props.disabled &&
    css`
      opacity: 0.3;
      cursor: not-allowed;
    `};

  @media (max-width: ${device.tablet}) {
    font-size: 16px;
  }
`;

type WrapperProps = {
  error?: string;
};

export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  width: 100%;
  text-align: center;
  background-color: white;

  & ${InputWrapper} {
    width: auto;
    min-height: unset;
  }

  & ${StyledInput} {
    height: 50px;
    color: #161643;
    padding: 0 10px;
    -moz-appearance: textfield;
    margin: 30px 0 0 105px;
    width: 222px;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    ${props =>
      props.error &&
      css`
        border-color: #ff2467;
      `}
  }
  @media (max-width: ${device.mobileS}) {
    & ${StyledInput} {
      width: 190px;
    }
  }

  & ${Label} {
    min-height: unset;
    position: absolute;
    max-width: 250px;
    overflow-x: hidden;
    white-space: nowrap;
    top: 0;
  }
`;

export const CountryCodesContainer = styled.div`
  overflow-y: auto;
  height: 191px;
  text-align: left;
`;

export const DisplayIcon = styled(BaseDisplayIcon)`
  right: 5px;
`;

export const Menu = styled.div<MenuProps>`
  width: 100%;
  height: 265px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  position: absolute;
  left: 0;
  z-index: 3;
  background-color: white;
  top: 80px;
  padding: 25px 0 0 37px;
  box-sizing: border-box;
  text-align: left;
  visibility: hidden;
  margin-bottom: 30px;
  border-radius: 3px;

  ${props =>
    props.open &&
    css`
      visibility: visible;
    `};

  @media (max-width: ${device.mobileL}) {
    width: 280px;
  }
`;

export const SearchIcon = styled.img`
  height: 16px;
  width: 16px;
  position: absolute;
  top: 6px;
  left: 8px;
`;

export const SearchInput = styled.input`
  outline: none;
  border: none;
  width: 140px;
  height: 30px;
  position: absolute;
  top: 0;
  left: 32px;

  &,
  &::placeholder {
    font-family: ProximaNova-Medium, sans-serif;
    font-size: 18px;
    line-height: 1.18;
    text-align: left;
    color: #2194f7;
  }
`;

export const InputRelativeWrapper = styled.div`
  width: 140px;
  height: 30px;
  position: relative;
  padding-bottom: 18px;
  margin: 0 !important;
`;

export const Divider = styled.div`
  background-color: rgba(231, 235, 241, 0.51);
  height: 1px;
  margin-right: 37px;
`;

export const Option = styled.div<OptionProps>`
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 18px;
  text-align: left;
  line-height: 1.18;
  color: #161643;
  cursor: pointer;
  padding: 19px 9px 18px !important;

  &:hover {
    color: #0081ec;
  }

  ${props =>
    props.selected &&
    css`
      font-family: ProximaNova-Medium, sans-serif;
      cursor: default;

      &:hover {
        color: #2d508e;
      }
    `};
`;

export const OptionWrapper = styled.div`
  margin-right: 37px;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(231, 235, 241, 0.51);
  }
`;

export const LoaderWrapper = styled.div`
  width: 16px;
  position: absolute;
  top: 8px;
  right: 2px;
  z-index: 3;
`;

export const RequestErrorMessage = styled.div`
  position: absolute;
  top: 23px;
  right: 0;
  font-family: ProximaNova-Bold, sans-serif;
  font-size: 13px;
  z-index: 3;
  color: #ff2467;

  & > button {
    height: 20px;
    min-width: auto;
    font-size: 10px;
    background-color: #ff2467;
    border-color: #ff2467;

    & > ${ButtonLabel} {
      height: auto;
    }
  }
`;

export const EmptyOption = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  text-align: left;
  font-weight: 500;
  line-height: 1.18;
  padding: 19px 9px 18px;
  color: #2d508e;
  opacity: 0.5;
  font-size: 18px;
`;
