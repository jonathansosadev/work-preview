import styled, {css} from 'styled-components';
import {StyledInput} from '../Input/styled';
import {DEVICE} from '../../../styled/device';

export const Wrapper = styled.div`
  position: relative;
  width: 255px;
  text-align: center;
  margin: 0 auto;

  & ${StyledInput} {
    padding-left: 65px;
    -moz-appearance: textfield;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  @media (max-width: ${DEVICE.mobileL}) {
    width: auto;
    min-width: 225px;
    max-width: 300px;
  }
`;

export const SelectedCountryCodeContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  box-sizing: border-box;
  padding-top: 26px;
  width: 65px;
  cursor: pointer;
  z-index: 1;
  text-align: left;
  font-family: ProximaNova-Medium, sans-serif;
  font-size: 16px;
  color: #161643;
  user-select: none;

  @media (max-width: ${DEVICE.mobileL}) {
    font-size: 18px;
    padding-top: 25px;
  }
`;

export const CountryCodesContainer = styled.div`
  overflow-y: auto;
  height: 191px;
  text-align: left;
`;

type DisplayIconProps = {
  expanded?: boolean;
};

export const DisplayIcon = styled.img<DisplayIconProps>`
  position: absolute;
  top: 33px;
  right: 4px;
  height: 6px;
  width: 10px;
  user-select: none;

  ${(props) =>
    props.expanded &&
    css`
      transform: rotateX(180deg);
    `};
`;

type MenuProps = {
  open?: boolean;
};

export const Menu = styled.div<MenuProps>`
  width: 334px;
  height: 265px;
  box-shadow: 0 15px 15px 0 rgba(38, 153, 251, 0.1);
  position: absolute;
  left: 0;
  z-index: 3;
  background-color: white;
  top: 55px;
  padding: 25px 0 0 37px;
  box-sizing: border-box;
  text-align: left;
  visibility: hidden;

  ${(props) =>
    props.open &&
    css`
      visibility: visible;
    `};

  @media (max-width: ${DEVICE.mobileL}) {
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
    font-size: 19px;
    line-height: 1.18;
    text-align: left;
    color: #2960f5;
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
  width: 140px;
  background-color: rgba(231, 235, 241, 0.51);
  height: 1px;
  margin: 0 !important;
`;

type OptionProps = {
  selected?: boolean;
};

export const Option = styled.div<OptionProps>`
  font-family: ProximaNova-Regular, sans-serif;
  font-size: 18px;
  text-align: left;
  font-weight: 500;
  line-height: 1.18;
  color: #161643;
  cursor: pointer;
  padding: 19px 9px 18px !important;

  &:hover {
    color: #2960f5;
  }

  ${(props) =>
    props.selected &&
    css`
      font-family: ProximaNova-Medium, sans-serif;
      cursor: default;

      &:hover {
        color: #161643;
      }
    `};
`;

export const LoaderWrapper = styled.div`
  width: 16px;
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 3;
`;

export const ErrorWrapper = styled.div`
  position: absolute;
  top: 23px;
  right: 0;
  z-index: 3;
  color: #ff5d8f;
`;

export const EmptyOption = styled.div`
  font-family: ProximaNova-Medium, sans-serif;
  text-align: left;
  font-weight: 500;
  line-height: 1.18;
  padding: 19px 9px 18px;
  color: #161643;
  opacity: 0.5;
  font-size: 18px;
`;
